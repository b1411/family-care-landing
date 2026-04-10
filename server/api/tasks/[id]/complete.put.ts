// PUT /api/tasks/[id]/complete — mark task as completed
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Task ID required' })

  const body = await readBody(event)
  const notes = typeof body?.notes === 'string' ? body.notes.slice(0, 500) : null

  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase
    .from('coordinator_tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      notes,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Task not found' })

  return data
})
