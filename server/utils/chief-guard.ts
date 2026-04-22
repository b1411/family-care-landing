// Shared auth guard for /api/chief/* endpoints.
// Throws 401 / 403 if caller is not a chief_doctor (or admin) of a clinic.
// Returns { userId, clinicId, role } for downstream usage.
import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const CHIEF_ROLES = ['chief_doctor', 'admin', 'clinic_admin', 'superadmin']

export async function requireChief(event: H3Event) {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const supabase = await serverSupabaseClient(event)
  const { data: profile } = await supabase
    .from('users').select('id, role, clinic_id').eq('id', user.id).single()

  if (!profile || !CHIEF_ROLES.includes(profile.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Chief-doctor access required' })
  }
  if (!profile.clinic_id) {
    throw createError({ statusCode: 403, statusMessage: 'User has no clinic assigned' })
  }

  return { userId: profile.id, clinicId: profile.clinic_id as string, role: profile.role, supabase }
}
