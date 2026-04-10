// GET /api/documents — list documents for a family/child
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const query = getQuery(event)
  const familyId = query.family_id as string
  const childId = query.child_id as string

  const supabase = await serverSupabaseClient(event)

  let q = supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (familyId) q = q.eq('family_id', familyId)
  if (childId) q = q.eq('child_id', childId)

  const { data, error } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data || []
})
