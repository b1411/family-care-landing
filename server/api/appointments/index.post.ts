// POST /api/appointments — book an appointment
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  doctor_id: z.string().uuid(),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  notes: z.string().max(500).optional(),
  visit_type: z.enum(['checkup', 'screening', 'vaccination', 'consultation', 'emergency']).default('checkup'),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  // Get user's family_id from families table
  const { data: family } = await supabase
    .from('families')
    .select('id')
    .or(`primary_parent_id.eq.${user.id},secondary_parent_id.eq.${user.id}`)
    .limit(1)
    .single()

  if (!family) {
    throw createError({ statusCode: 400, statusMessage: 'No family associated with user' })
  }

  // Check for scheduling conflicts (same doctor, same date, overlapping time)
  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', body.doctor_id)
    .eq('appointment_date', body.appointment_date)
    .in('status', ['confirmed', 'requested'])
    .eq('start_time', body.start_time)
    .limit(1)

  if (conflicts && conflicts.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Time slot is already booked' })
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      family_id: family.id,
      doctor_id: body.doctor_id,
      appointment_date: body.appointment_date,
      start_time: body.start_time,
      end_time: body.end_time || null,
      notes: body.notes || null,
      visit_type: body.visit_type,
      status: 'requested',
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
