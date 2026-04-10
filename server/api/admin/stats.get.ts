// GET /api/admin/stats — admin dashboard KPIs
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const supabase = await serverSupabaseClient(event)

  // Verify admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'clinic_admin', 'platform_admin', 'superadmin'].includes(profile.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  // Parallel fetch counts
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const [usersResult, familiesResult, doctorsResult, appointmentsResult] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('families').select('id', { count: 'exact', head: true }),
    supabase.from('doctors').select('id', { count: 'exact', head: true }),
    supabase.from('appointments')
      .select('id', { count: 'exact', head: true })
      .gte('appointment_date', firstOfMonth),
  ])

  return {
    totalUsers: usersResult.count || 0,
    totalFamilies: familiesResult.count || 0,
    totalDoctors: doctorsResult.count || 0,
    monthlyAppointments: appointmentsResult.count || 0,
  }
})
