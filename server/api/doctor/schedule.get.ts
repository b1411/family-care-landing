// GET /api/doctor/schedule — doctor's schedule with patient details
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const query = getQuery(event)
  const date = query.date as string || new Date().toISOString().slice(0, 10)

  const supabase = await serverSupabaseClient(event)

  // Get doctor profile
  const { data: doctorProfile } = await supabase
    .from('doctors')
    .select('id, user_id')
    .eq('user_id', user.id)
    .single()

  if (!doctorProfile) {
    throw createError({ statusCode: 403, statusMessage: 'Doctor profile not found' })
  }

  // Fetch appointments for this doctor on this date
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id, appointment_date, start_time, end_time, status, notes, visit_type,
      families!inner(id, primary_parent_id),
      child_profiles(id, name, dob)
    `)
    .eq('doctor_id', doctorProfile.id)
    .eq('appointment_date', date)
    .order('start_time', { ascending: true })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return appointments || []
})
