// POST /api/admin/segments — Create segment
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  criteria_json: z.object({
    operator: z.enum(['AND', 'OR']),
    conditions: z.array(z.object({
      field: z.string(),
      op: z.string(),
      value: z.unknown(),
    })),
  }),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  // Get clinic_id
  const { data: profile } = await supabase.from('users').select('clinic_id').eq('id', user.id).single()
  if (!profile?.clinic_id) throw createError({ statusCode: 400, statusMessage: 'No clinic' })

  const { data, error } = await (supabase as any)
    .from('segments')
    .insert({
      clinic_id: profile.clinic_id,
      name: body.name,
      description: body.description || null,
      criteria_json: body.criteria_json,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
