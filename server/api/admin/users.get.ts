// GET /api/admin/users — list users (admin only)
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const supabase = await serverSupabaseClient(event)

  // Verify admin role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!profile || !['admin', 'clinic_admin', 'platform_admin', 'superadmin'].includes(profile.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const perPage = Math.min(100, Math.max(1, Number(query.per_page) || 20))
  const role = query.role as string
  const search = query.search as string

  let q = supabase
    .from('user_profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1)

  // Scope to clinic for clinic_admin
  if (profile.role === 'clinic_admin' && profile.clinic_id) {
    q = q.eq('clinic_id', profile.clinic_id)
  }

  if (role) q = q.eq('role', role)
  if (search) q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`)

  const { data, count, error } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { data: data || [], total: count || 0, page, perPage }
})
