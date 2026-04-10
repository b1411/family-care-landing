// POST /api/children — add a child to a family
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  family_id: z.string().uuid(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().max(100).optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(['male', 'female']),
  blood_type: z.string().max(10).optional(),
  birth_weight: z.number().min(0.5).max(10).optional(),
  birth_height: z.number().min(20).max(70).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase
    .from('child_profiles')
    .insert({
      family_id: body.family_id,
      first_name: body.first_name,
      last_name: body.last_name || null,
      birth_date: body.birth_date,
      gender: body.gender,
      blood_type: body.blood_type || null,
      birth_weight: body.birth_weight || null,
      birth_height: body.birth_height || null,
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
