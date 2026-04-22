// POST /api/prescriptions — create a prescription (doctor/coordinator)
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  family_id: z.string().uuid(),
  child_id: z.string().uuid().optional(),
  medication: z.string().min(1).max(200),
  dosage: z.string().min(1).max(100),
  frequency: z.string().min(1).max(100),
  time_of_day: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1).max(6),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  instructions: z.string().max(500).optional(),
  // Structured clinical fields (added in migration 020)
  inn_name: z.string().max(120).optional(),
  dose_value: z.number().positive().max(100000).optional(),
  dose_unit: z.string().max(16).optional(),
  route: z.enum(['per_os', 'im', 'iv', 'sc', 'topical', 'inhaled', 'pr', 'ophthalmic', 'otic']).optional(),
  icd10_indication: z.string().min(2).max(10).optional(),
  appointment_id: z.string().uuid().optional(),
  doctor_id: z.string().uuid().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  // Verify user has doctor/coordinator/admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['doctor', 'gynecologist', 'pediatrician', 'coordinator', 'admin', 'clinic_admin'].includes(profile.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only medical staff can create prescriptions' })
  }

  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      family_id: body.family_id,
      child_id: body.child_id || null,
      prescribed_by: user.id,
      medication: body.medication,
      dosage: body.dosage,
      frequency: body.frequency,
      time_of_day: body.time_of_day,
      start_date: body.start_date,
      end_date: body.end_date || null,
      instructions: body.instructions || null,
      is_active: true,
      inn_name: body.inn_name || null,
      dose_value: body.dose_value ?? null,
      dose_unit: body.dose_unit || null,
      route: body.route || null,
      icd10_indication: body.icd10_indication || null,
      appointment_id: body.appointment_id || null,
      doctor_id: body.doctor_id || null,
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
