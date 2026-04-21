// GET /api/admin/leads — List leads with filters (admin only, scoped to clinic)
import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin } from '~~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  const ctx = await requireAdmin(event)
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)

  const page = Math.max(1, Number(query.page) || 1)
  const perPage = Math.min(50, Math.max(1, Number(query.perPage) || 20))
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let q = (client as any)
    .from('leads')
    .select(`
      id, source, stage, first_name, last_name, phone, email,
      lmp_date, edd_date, notes, lost_reason,
      utm_source, utm_medium, utm_campaign,
      family_id, converted_at, created_at, updated_at,
      assigned:users!assigned_to ( id, first_name, last_name )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (!ctx.isPlatform) {
    q = q.eq('clinic_id', ctx.clinicId as string)
  }

  if (query.stage && query.stage !== 'all') {
    q = q.eq('stage', query.stage)
  }
  if (query.source && query.source !== 'all') {
    q = q.eq('source', query.source)
  }
  if (query.assigned_to) {
    q = q.eq('assigned_to', query.assigned_to)
  }
  if (query.search) {
    q = q.or(`first_name.ilike.%${query.search}%,last_name.ilike.%${query.search}%,phone.ilike.%${query.search}%`)
  }

  const { data, error, count } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const leads = (data || []).map((l: any) => {
    const assigned = Array.isArray(l.assigned) ? l.assigned[0] : l.assigned
    return {
      ...l,
      assigned_name: assigned ? `${assigned.first_name} ${assigned.last_name}` : null,
      assigned,
    }
  })

  return { leads, total: count ?? leads.length }
})
