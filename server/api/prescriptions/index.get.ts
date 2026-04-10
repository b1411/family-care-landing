// GET /api/prescriptions — list prescriptions for a family
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const query = getQuery(event)
  const familyId = query.family_id as string
  const activeOnly = query.active !== 'false'

  const supabase = await serverSupabaseClient(event)

  let q = supabase
    .from('prescriptions')
    .select('*, dose_logs(id, scheduled_at, status, confirmed_at)')
    .order('created_at', { ascending: false })

  if (familyId) q = q.eq('family_id', familyId)
  if (activeOnly) q = q.eq('is_active', true)

  const { data, error } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data || []
})
