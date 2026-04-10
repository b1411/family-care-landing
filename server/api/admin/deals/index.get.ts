// GET /api/admin/deals — Deals pipeline
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const query = getQuery(event)
  const stage = query.stage as string | undefined

  const supabase = await serverSupabaseClient(event)

  let q = (supabase as any)
    .from('deals')
    .select('*, family:families!family_id(id, primary_parent:users!primary_parent_id(first_name, last_name)), owner:users!owner_id(first_name, last_name)')
    .order('created_at', { ascending: false })

  if (stage) q = q.eq('stage', stage)

  const { data, error } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data ?? []
})
