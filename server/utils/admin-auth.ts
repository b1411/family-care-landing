import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export type AdminRole =
  | 'admin'
  | 'clinic_admin'
  | 'clinic_manager'
  | 'platform_admin'
  | 'superadmin'

const ADMIN_ROLES: AdminRole[] = [
  'admin',
  'clinic_admin',
  'clinic_manager',
  'platform_admin',
  'superadmin',
]

// Roles that are allowed to see cross-clinic data.
const PLATFORM_ROLES: AdminRole[] = ['platform_admin', 'superadmin']

export interface AdminContext {
  userId: string
  role: AdminRole
  clinicId: string | null
  isPlatform: boolean
}

export async function requireAdmin(event: H3Event): Promise<AdminContext> {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const supabase = await serverSupabaseClient(event)
  const { data: profile } = await supabase
    .from('users')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single()

  if (!profile || !ADMIN_ROLES.includes(profile.role as AdminRole)) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const role = profile.role as AdminRole
  const isPlatform = PLATFORM_ROLES.includes(role)

  // Non-platform admins MUST have a clinic_id — otherwise they can't be scoped safely.
  if (!isPlatform && !profile.clinic_id) {
    throw createError({ statusCode: 403, statusMessage: 'Admin account has no clinic assigned' })
  }

  return {
    userId: user.id,
    role,
    clinicId: profile.clinic_id ?? null,
    isPlatform,
  }
}
