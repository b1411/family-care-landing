// GET /api/admin/stats — admin dashboard KPIs (scoped to clinic unless platform admin)
import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin } from '~~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  const ctx = await requireAdmin(event)
  const supabase = await serverSupabaseClient(event)

  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)

  const scope = <T extends { eq: (c: string, v: string) => T }>(q: T): T =>
    ctx.isPlatform ? q : q.eq('clinic_id', ctx.clinicId as string)

  const [usersResult, familiesResult, doctorsResult, appointmentsResult] = await Promise.all([
    scope(supabase.from('users').select('id', { count: 'exact', head: true })),
    scope(supabase.from('families').select('id', { count: 'exact', head: true })),
    scope(supabase.from('doctors').select('id', { count: 'exact', head: true })),
    scope(
      supabase.from('appointments')
        .select('id', { count: 'exact', head: true })
        .gte('appointment_date', firstOfMonth)
    ),
  ])

  return {
    totalUsers: usersResult.count || 0,
    totalFamilies: familiesResult.count || 0,
    totalDoctors: doctorsResult.count || 0,
    monthlyAppointments: appointmentsResult.count || 0,
  }
})
