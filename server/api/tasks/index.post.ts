// POST /api/tasks — create a coordinator task
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  family_id: z.string().uuid().optional(),
  type: z.enum(['missed_appointment', 'overdue_followup', 'low_adherence', 'vaccination_reminder', 'welcome_call', 'reactivation', 'custom']),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  // Get user's clinic
  const { data: profile } = await supabase
    .from('users')
    .select('clinic_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) {
    throw createError({ statusCode: 400, statusMessage: 'No clinic associated' })
  }

  const { data, error } = await supabase
    .from('coordinator_tasks')
    .insert({
      clinic_id: profile.clinic_id,
      family_id: body.family_id || null,
      assigned_to: user.id,
      type: body.type,
      priority: body.priority,
      title: body.title,
      notes: body.description || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
