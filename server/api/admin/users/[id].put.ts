// PUT /api/admin/users/[id] — update user role/status (admin only)
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  role: z.enum(['mother', 'father', 'coordinator', 'doctor', 'gynecologist', 'pediatrician', 'nurse', 'admin', 'clinic_admin', 'clinic_manager']).optional(),
  is_active: z.boolean().optional(),
  clinic_id: z.string().uuid().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'At least one field is required' })

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const targetId = getRouterParam(event, 'id')
  if (!targetId) throw createError({ statusCode: 400, statusMessage: 'User ID required' })

  const supabase = await serverSupabaseClient(event)

  // Verify admin role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || !['admin', 'clinic_admin', 'platform_admin', 'superadmin'].includes(profile.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  // Prevent self-demotion
  if (targetId === user.id && profile.role !== 'superadmin') {
    throw createError({ statusCode: 400, statusMessage: 'Cannot modify own role' })
  }

  const body = await readValidatedBody(event, schema.parse)

  const { data, error } = await supabase
    .from('user_profiles')
    .update(body)
    .eq('user_id', targetId)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  return data
})
