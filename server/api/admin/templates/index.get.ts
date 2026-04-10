// GET /api/admin/templates — List message templates
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const query = getQuery(event)
  const channel = query.channel as string | undefined

  const supabase = await serverSupabaseClient(event)

  let q = (supabase as any)
    .from('message_templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (channel) q = q.eq('channel', channel)

  const { data, error } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data ?? []
})
