// GET /api/admin/calls — Call logs with filters
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const query = getQuery(event)
  const direction = query.direction as string | undefined
  const outcome = query.outcome as string | undefined
  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 50, 100)

  const supabase = await serverSupabaseClient(event)

  let q = (supabase as any)
    .from('call_logs')
    .select('*, caller:users!caller_id(first_name, last_name), family:families!family_id(id, primary_parent:users!primary_parent_id(first_name, last_name, phone))')
    .order('started_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (direction) q = q.eq('direction', direction)
  if (outcome) q = q.eq('outcome', outcome)

  const { data, error } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data ?? []
})
