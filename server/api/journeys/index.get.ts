// GET /api/journeys — list journeys for a family
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const query = getQuery(event)
  const familyId = query.family_id as string

  const supabase = await serverSupabaseClient(event)

  let q = supabase
    .from('journeys')
    .select('*, journey_events(id, title, type, status, due_date, is_mandatory, completed_at)')
    .order('created_at', { ascending: false })

  if (familyId) q = q.eq('family_id', familyId)

  const { data, error } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data || []
})
