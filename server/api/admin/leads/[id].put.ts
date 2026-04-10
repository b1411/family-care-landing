// PUT /api/admin/leads/[id] — Update lead (stage, assignee, details)
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  stage: z.enum(['new', 'contacted', 'interested', 'negotiation', 'won', 'lost']).optional(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  assigned_to: z.string().uuid().optional(),
  lost_reason: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  lmp_date: z.string().optional(),
  edd_date: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Lead ID required' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  // Build update object — only include provided fields
  const update: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(body)) {
    if (val !== undefined) update[key] = val
  }

  if (Object.keys(update).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  const { data, error } = await (supabase as any)
    .from('leads')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Log stage change as lead activity
  if (body.stage) {
    await (supabase as any).from('lead_activities').insert({
      lead_id: id,
      type: 'status_change',
      summary: `Статус изменён на "${body.stage}"`,
      performed_by: user.id,
    })
  }

  return data
})
