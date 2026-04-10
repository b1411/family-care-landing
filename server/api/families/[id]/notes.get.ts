// GET /api/families/[id]/notes — Family notes list
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const familyId = getRouterParam(event, 'id')
  if (!familyId) throw createError({ statusCode: 400, statusMessage: 'Family ID required' })

  const supabase = await serverSupabaseClient(event)

  const { data, error } = await (supabase as any)
    .from('family_notes')
    .select('*, author:users!created_by(full_name)')
    .eq('family_id', familyId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data ?? []
})
