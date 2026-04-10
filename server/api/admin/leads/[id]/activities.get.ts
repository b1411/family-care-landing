// GET /api/admin/leads/[id]/activities — Get lead activity timeline
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Lead ID required' })

  const client = await serverSupabaseClient(event)

  const { data, error } = await (client as any)
    .from('lead_activities')
    .select(`
      id, type, direction, summary, duration_seconds, created_at,
      performer:users!performed_by ( first_name, last_name )
    `)
    .eq('lead_id', id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return (data || []).map((a: any) => {
    const performer = Array.isArray(a.performer) ? a.performer[0] : a.performer
    return {
      ...a,
      performer_name: performer ? `${performer.first_name} ${performer.last_name}` : null,
    }
  })
})
