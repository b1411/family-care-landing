// POST /api/appointments/[id]/complete — doctor marks appointment completed
// with structured clinical data (ICD-10, checklist, notes).
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  icd10_primary: z.string().min(2).max(10),
  icd10_secondary: z.array(z.string().min(2).max(10)).max(8).optional(),
  completion_checklist: z.object({
    complaints: z.boolean(),
    exam: z.boolean(),
    diagnosis: z.boolean(),
    plan: z.boolean(),
    recommendations: z.boolean(),
  }).partial().default({}),
  post_visit_notes: z.string().max(4000).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Appointment ID required' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()

  const allowed = ['doctor', 'gynecologist', 'pediatrician', 'nurse', 'coordinator', 'admin', 'clinic_admin', 'superadmin']
  if (!profile || !allowed.includes(profile.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only clinical staff can complete appointments' })
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({
      status: 'completed',
      icd10_primary: body.icd10_primary,
      icd10_secondary: body.icd10_secondary ?? [],
      completion_checklist: body.completion_checklist,
      post_visit_notes: body.post_visit_notes ?? null,
      end_time: body.end_time ?? undefined,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Appointment not found' })
  return data
})
