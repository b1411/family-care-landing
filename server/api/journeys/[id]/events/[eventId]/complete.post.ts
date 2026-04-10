// POST /api/journeys/[id]/events/[eventId]/complete — complete a journey event
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const eventId = getRouterParam(event, 'eventId')
  if (!eventId) throw createError({ statusCode: 400, statusMessage: 'Event ID is required' })

  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase
    .from('journey_events')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  return data
})
