// POST /api/admin/templates — Create message template
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  name: z.string().min(1).max(200),
  channel: z.enum(['whatsapp', 'sms', 'email', 'push']),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(5000),
  variables: z.array(z.string()).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  const { data: profile } = await supabase.from('users').select('clinic_id').eq('id', user.id).single()
  if (!profile?.clinic_id) throw createError({ statusCode: 400, statusMessage: 'No clinic' })

  const { data, error } = await (supabase as any)
    .from('message_templates')
    .insert({
      clinic_id: profile.clinic_id,
      name: body.name,
      channel: body.channel,
      subject: body.subject || null,
      body: body.body,
      variables: body.variables || [],
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
