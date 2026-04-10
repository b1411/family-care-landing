// POST /api/admin/leads/[id]/convert — Convert lead to family
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  lmp_date: z.string().optional(),
  edd_date: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Lead ID required' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  // 1. Get lead
  const { data: lead, error: leadErr } = await (supabase as any)
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (leadErr || !lead) throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  if (lead.stage === 'won') throw createError({ statusCode: 400, statusMessage: 'Lead already converted' })

  // 2. Get user clinic
  const { data: profile } = await supabase
    .from('users')
    .select('clinic_id')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) throw createError({ statusCode: 400, statusMessage: 'No clinic' })

  // 3. Create auth user for the lead (if email provided), else create family directly
  // For now, create family without auth user — coordinator will invite later
  const { data: family, error: famErr } = await (supabase as any)
    .from('families')
    .insert({
      clinic_id: profile.clinic_id,
      status: 'active',
    })
    .select()
    .single()

  if (famErr || !family) throw createError({ statusCode: 500, statusMessage: famErr?.message || 'Failed to create family' })

  // 4. Create mother_profile if LMP/EDD data exists
  const lmpDate = body.lmp_date || lead.lmp_date
  const eddDate = body.edd_date || lead.edd_date || (lmpDate ? computeEDD(lmpDate) : null)

  if (lmpDate) {
    await (supabase as any).from('mother_profiles').insert({
      family_id: family.id,
      lmp_date: lmpDate,
      edd_date: eddDate,
    })
  }

  // 5. Update lead — mark as won
  await (supabase as any)
    .from('leads')
    .update({
      stage: 'won',
      family_id: family.id,
      converted_at: new Date().toISOString(),
    })
    .eq('id', id)

  // 6. Log conversion activity
  await (supabase as any).from('lead_activities').insert({
    lead_id: id,
    type: 'status_change',
    summary: `Лид конвертирован в семью ${family.id}`,
    performed_by: user.id,
  })

  return { lead_id: id, family_id: family.id, message: 'Lead converted successfully' }
})

function computeEDD(lmpDate: string): string {
  const lmp = new Date(lmpDate)
  lmp.setDate(lmp.getDate() + 280)
  return lmp.toISOString().split('T')[0]!
}
