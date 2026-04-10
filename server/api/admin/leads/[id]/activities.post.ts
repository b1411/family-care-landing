// POST /api/admin/leads/[id]/activities — Log interaction with lead
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  type: z.enum(['call', 'whatsapp', 'sms', 'email', 'note', 'meeting', 'demo']),
  direction: z.enum(['inbound', 'outbound']).optional(),
  summary: z.string().max(2000).optional(),
  duration_seconds: z.number().int().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Lead ID required' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  const { data, error } = await (supabase as any)
    .from('lead_activities')
    .insert({
      lead_id: id,
      type: body.type,
      direction: body.direction || null,
      summary: body.summary || null,
      duration_seconds: body.duration_seconds || null,
      performed_by: user.id,
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
