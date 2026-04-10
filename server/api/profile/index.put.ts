// PUT /api/profile — update user profile
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  blood_type: z.string().max(10).optional(),
  language: z.enum(['ru', 'kk', 'en']).optional(),
  avatar_url: z.string().url().max(500).optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'At least one field is required' })

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase
    .from('user_profiles')
    .update(body)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Profile not found' })

  return data
})
