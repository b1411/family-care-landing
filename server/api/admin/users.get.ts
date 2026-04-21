// GET /api/admin/users — list users (admin only, scoped to clinic unless platform admin)
import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin } from '~~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  const ctx = await requireAdmin(event)
  const supabase = await serverSupabaseClient(event)

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const perPage = Math.min(100, Math.max(1, Number(query.per_page) || 20))
  const role = query.role as string
  const search = query.search as string

  let q = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1)

  if (!ctx.isPlatform) {
    q = q.eq('clinic_id', ctx.clinicId as string)
  }

  if (role) q = q.eq('role', role)
  if (search) q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`)

  const { data, count, error } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { data: data || [], total: count || 0, page, perPage }
})
