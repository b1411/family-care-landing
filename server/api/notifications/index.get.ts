// GET /api/notifications — list user notifications
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 50, 100)
  const unreadOnly = query.unread === 'true'

  const supabase = await serverSupabaseClient(event)

  let q = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unreadOnly) q = q.eq('is_read', false)

  const { data, error } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data || []
})
