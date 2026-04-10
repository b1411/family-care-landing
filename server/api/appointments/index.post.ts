// POST /api/appointments — book an appointment
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  doctor_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  notes: z.string().max(500).optional(),
  appointment_type: z.enum(['checkup', 'screening', 'vaccination', 'consultation', 'emergency']).default('checkup'),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  // Get user's family_id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('family_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.family_id) {
    throw createError({ statusCode: 400, statusMessage: 'No family associated with user' })
  }

  // Check for scheduling conflicts (same doctor, same time ± 30 min)
  const scheduledTime = new Date(body.scheduled_at)
  const windowStart = new Date(scheduledTime.getTime() - 30 * 60_000).toISOString()
  const windowEnd = new Date(scheduledTime.getTime() + 30 * 60_000).toISOString()

  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', body.doctor_id)
    .in('status', ['confirmed', 'requested'])
    .gte('scheduled_at', windowStart)
    .lte('scheduled_at', windowEnd)
    .limit(1)

  if (conflicts && conflicts.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Time slot is already booked' })
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      family_id: profile.family_id,
      doctor_id: body.doctor_id,
      scheduled_at: body.scheduled_at,
      notes: body.notes || null,
      appointment_type: body.appointment_type,
      status: 'requested',
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
