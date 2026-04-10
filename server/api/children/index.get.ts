// GET /api/children — list children for a family
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const query = getQuery(event)
  const familyId = query.family_id as string

  if (!familyId) throw createError({ statusCode: 400, statusMessage: 'family_id is required' })

  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('family_id', familyId)
    .order('birth_date', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data || []
})
