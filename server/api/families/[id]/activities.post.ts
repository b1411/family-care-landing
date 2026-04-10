// POST /api/families/[id]/activities — Log manual interaction (call, note, etc.)
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  type: z.enum(['call', 'whatsapp', 'sms', 'email', 'note']),
  summary: z.string().min(1).max(2000),
  detail_json: z.record(z.string(), z.unknown()).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const familyId = getRouterParam(event, 'id')
  if (!familyId) throw createError({ statusCode: 400, statusMessage: 'Family ID required' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  // Get clinic_id from user
  const { data: profile } = await supabase
    .from('users')
    .select('clinic_id')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) throw createError({ statusCode: 400, statusMessage: 'No clinic' })

  const { data, error } = await (supabase as any)
    .from('family_activities')
    .insert({
      family_id: familyId,
      clinic_id: profile.clinic_id,
      type: body.type,
      summary: body.summary,
      detail_json: body.detail_json || {},
      performed_by: user.id,
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
