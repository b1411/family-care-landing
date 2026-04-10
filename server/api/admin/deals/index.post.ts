// POST /api/admin/deals — Create deal
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  family_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  amount: z.number().min(0).optional(),
  currency: z.string().max(3).optional().default('KZT'),
  stage: z.enum(['qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional().default('qualification'),
  expected_close: z.string().optional(),
  notes: z.string().max(2000).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  const { data: profile } = await supabase.from('users').select('clinic_id').eq('id', user.id).single()
  if (!profile?.clinic_id) throw createError({ statusCode: 400, statusMessage: 'No clinic' })

  const { data, error } = await (supabase as any)
    .from('deals')
    .insert({
      clinic_id: profile.clinic_id,
      family_id: body.family_id,
      title: body.title,
      amount: body.amount || null,
      currency: body.currency,
      stage: body.stage,
      expected_close: body.expected_close || null,
      notes: body.notes || null,
      owner_id: user.id,
    })
    .select('*, family:families!family_id(id, primary_parent:users!primary_parent_id(first_name, last_name)), owner:users!owner_id(first_name, last_name)')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
