// PUT /api/notifications/[id]/read — mark notification as read
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = getRouterParam(event, 'id')

  const supabase = await serverSupabaseClient(event)

  // Mark all as read
  if (id === 'all') {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { success: true }
  }

  // Mark single
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Notification not found' })

  return data
})
