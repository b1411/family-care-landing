// POST /api/vaccinations — record a vaccination
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  child_id: z.string().uuid(),
  vaccine_name: z.string().min(1).max(200),
  dose_number: z.number().int().min(1).max(10),
  total_doses: z.number().int().min(1).max(10),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  administered_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  batch_number: z.string().max(50).optional(),
  administered_by: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  const status = body.administered_date ? 'completed' : 'scheduled'

  const { data, error } = await supabase
    .from('vaccinations')
    .insert({
      child_id: body.child_id,
      vaccine_name: body.vaccine_name,
      dose_number: body.dose_number,
      total_doses: body.total_doses,
      scheduled_date: body.scheduled_date,
      administered_date: body.administered_date || null,
      batch_number: body.batch_number || null,
      administered_by: body.administered_by || user.id,
      notes: body.notes || null,
      status,
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
