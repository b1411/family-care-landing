// GET /api/doctor/patients — doctor's patients list
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const supabase = await serverSupabaseClient(event)

  // Get doctor profile
  const { data: doctorProfile } = await supabase
    .from('doctor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!doctorProfile) {
    throw createError({ statusCode: 403, statusMessage: 'Doctor profile not found' })
  }

  // Families that have had appointments with this doctor
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      family_id,
      families!inner(
        id,
        parent_user_id,
        user_profiles!inner(first_name, last_name, phone),
        child_profiles(id, first_name, birth_date, gender),
        journeys(type, status, started_at)
      )
    `)
    .eq('doctor_id', doctorProfile.id)
    .order('scheduled_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Deduplicate by family_id
  const seen = new Set<string>()
  const families = (appointments || [])
    .filter((a: any) => {
      if (seen.has(a.family_id)) return false
      seen.add(a.family_id)
      return true
    })
    .map((a: any) => a.families)

  return families
})
