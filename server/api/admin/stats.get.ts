// GET /api/admin/stats — admin dashboard KPIs
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

  // Parallel fetch counts
  const [usersResult, familiesResult, doctorsResult, appointmentsResult] = await Promise.all([
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('families').select('id', { count: 'exact', head: true }),
    supabase.from('doctor_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('appointments')
      .select('id', { count: 'exact', head: true })
      .gte('scheduled_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ])

  return {
    totalUsers: usersResult.count || 0,
    totalFamilies: familiesResult.count || 0,
    totalDoctors: doctorsResult.count || 0,
    monthlyAppointments: appointmentsResult.count || 0,
  }
})
