// POST /api/chief/case-reviews — create a manual case review
import { z } from 'zod'
import { requireChief } from '~~/server/utils/chief-guard'

const schema = z.object({
  appointment_id: z.string().uuid().optional(),
  family_id: z.string().uuid().optional(),
  doctor_id: z.string().uuid().optional(),
  trigger: z.enum(['complaint', 'protocol_deviation', 'adverse_outcome', 'rx_alert', 'manual', 'no_progress']).default('manual'),
  trigger_ref_id: z.string().uuid().optional(),
  priority: z.enum(['normal', 'high', 'critical']).default('normal'),
})

export default defineEventHandler(async (event) => {
  const { supabase, clinicId } = await requireChief(event)
  const body = await readValidatedBody(event, schema.parse)

  const { data, error } = await supabase
    .from('case_reviews')
    .insert({
      clinic_id: clinicId,
      appointment_id: body.appointment_id || null,
      family_id: body.family_id || null,
      doctor_id: body.doctor_id || null,
      trigger: body.trigger,
      trigger_ref_id: body.trigger_ref_id || null,
      priority: body.priority,
      status: 'queued',
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
