// POST /api/doses/[id]/confirm — confirm a dose was taken
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Dose ID is required' })

  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase
    .from('dose_logs')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      confirmed_by: user.id,
    })
    .eq('id', id)
    .eq('status', 'scheduled')
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Dose not found or already processed' })

  return data
})
