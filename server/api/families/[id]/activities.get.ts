// GET /api/families/[id]/activities — Unified activity timeline
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Family ID required' })

  const client = await serverSupabaseClient(event)
  const query = getQuery(event)
  const limit = Math.min(100, Number(query.limit) || 50)

  const { data, error } = await (client as any)
    .from('family_activities')
    .select(`
      id, type, summary, detail_json, created_at,
      performer:users!performed_by ( first_name, last_name )
    `)
    .eq('family_id', id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return (data || []).map((a: any) => {
    const performer = Array.isArray(a.performer) ? a.performer[0] : a.performer
    return {
      ...a,
      performer_name: performer ? `${performer.first_name} ${performer.last_name}` : null,
    }
  })
})
