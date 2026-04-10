// GET /api/vaccinations — list vaccinations for a child
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const query = getQuery(event)
  const childId = query.child_id as string

  if (!childId) throw createError({ statusCode: 400, statusMessage: 'child_id is required' })

  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase
    .from('vaccinations')
    .select('*')
    .eq('child_id', childId)
    .order('scheduled_date', { ascending: true })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data || []
})
