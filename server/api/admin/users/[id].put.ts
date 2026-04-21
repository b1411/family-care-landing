// PUT /api/admin/users/[id] — update user role/status (admin only, scoped to clinic)
import { z } from 'zod'
import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin } from '~~/server/utils/admin-auth'

const schema = z.object({
  role: z.enum(['mother', 'father', 'coordinator', 'doctor', 'gynecologist', 'pediatrician', 'nurse', 'admin', 'clinic_admin', 'clinic_manager']).optional(),
  is_active: z.boolean().optional(),
  clinic_id: z.string().uuid().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'At least one field is required' })

export default defineEventHandler(async (event) => {
  const ctx = await requireAdmin(event)

  const targetId = getRouterParam(event, 'id')
  if (!targetId) throw createError({ statusCode: 400, statusMessage: 'User ID required' })

  const supabase = await serverSupabaseClient(event)

  // Prevent self-demotion (only superadmin can change own role)
  if (targetId === ctx.userId && ctx.role !== 'superadmin') {
    throw createError({ statusCode: 400, statusMessage: 'Cannot modify own role' })
  }

  const body = await readValidatedBody(event, schema.parse)

  // Non-platform admins can only modify users within their own clinic,
  // and cannot reassign a user to a different clinic.
  if (!ctx.isPlatform) {
    const { data: target } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', targetId)
      .single()

    if (!target || target.clinic_id !== ctx.clinicId) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    if (body.clinic_id && body.clinic_id !== ctx.clinicId) {
      throw createError({ statusCode: 403, statusMessage: 'Cannot move user to another clinic' })
    }
  }

  const { data, error } = await supabase
    .from('users')
    .update(body)
    .eq('id', targetId)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  return data
})
