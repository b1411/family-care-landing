// POST /api/admin/leads — Create a new lead
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  source: z.enum(['website', 'instagram', '2gis', 'referral', 'walk_in', 'phone', 'whatsapp', 'other']).default('phone'),
  lmp_date: z.string().optional(),
  edd_date: z.string().optional(),
  notes: z.string().max(2000).optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(200).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  const { data: profile } = await supabase
    .from('users')
    .select('clinic_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) {
    throw createError({ statusCode: 400, statusMessage: 'No clinic associated' })
  }

  const { data, error } = await (supabase as any)
    .from('leads')
    .insert({
      clinic_id: profile.clinic_id,
      first_name: body.first_name,
      last_name: body.last_name || null,
      phone: body.phone || null,
      email: body.email || null,
      source: body.source,
      lmp_date: body.lmp_date || null,
      edd_date: body.edd_date || null,
      notes: body.notes || null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      assigned_to: user.id,
      stage: 'new',
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
