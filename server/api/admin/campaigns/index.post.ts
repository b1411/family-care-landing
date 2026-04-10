// POST /api/admin/campaigns — Create campaign
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const stepSchema = z.object({
  order_num: z.number(),
  delay_hours: z.number().min(0),
  template_id: z.string().uuid(),
  channel: z.enum(['whatsapp', 'sms', 'email', 'push']),
})

const schema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['drip', 'broadcast', 'trigger']),
  segment_id: z.string().uuid().optional(),
  steps_json: z.array(stepSchema).min(1),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  const { data: profile } = await supabase.from('users').select('clinic_id').eq('id', user.id).single()
  if (!profile?.clinic_id) throw createError({ statusCode: 400, statusMessage: 'No clinic' })

  const { data, error } = await (supabase as any)
    .from('campaigns')
    .insert({
      clinic_id: profile.clinic_id,
      name: body.name,
      type: body.type,
      segment_id: body.segment_id || null,
      steps_json: body.steps_json,
      status: 'draft',
      created_by: user.id,
    })
    .select('*, segment:segments!segment_id(name)')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
