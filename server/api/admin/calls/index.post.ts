// POST /api/admin/calls — Log a call
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  family_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  direction: z.enum(['inbound', 'outbound']),
  outcome: z.enum(['answered', 'no_answer', 'busy', 'voicemail', 'callback']),
  duration_sec: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
  script_id: z.string().uuid().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  const { data: profile } = await supabase.from('users').select('clinic_id').eq('id', user.id).single()
  if (!profile?.clinic_id) throw createError({ statusCode: 400, statusMessage: 'No clinic' })

  const { data, error } = await supabase
    .from('call_logs')
    .insert({
      clinic_id: profile.clinic_id,
      caller_id: user.id,
      family_id: body.family_id || null,
      lead_id: body.lead_id || null,
      direction: body.direction,
      outcome: body.outcome,
      duration_sec: body.duration_sec || 0,
      notes: body.notes || null,
      script_id: body.script_id || null,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
