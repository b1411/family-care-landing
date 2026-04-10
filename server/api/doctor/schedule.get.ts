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
    .from('doctor_profiles')
    .select('id, user_id')
    .eq('user_id', user.id)
    .single()

  if (!doctorProfile) {
    throw createError({ statusCode: 403, statusMessage: 'Doctor profile not found' })
  }

  // Fetch appointments for this doctor on this date
  const dayStart = `${date}T00:00:00`
  const dayEnd = `${date}T23:59:59`

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id, scheduled_at, status, notes, appointment_type,
      families!inner(id, parent_user_id),
      child_profiles(id, first_name, last_name, birth_date)
    `)
    .eq('doctor_id', doctorProfile.id)
    .gte('scheduled_at', dayStart)
    .lte('scheduled_at', dayEnd)
    .order('scheduled_at', { ascending: true })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return appointments || []
})
