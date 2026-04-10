// POST /api/families/[id]/notes — Create a family note
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const schema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  pinned: z.boolean().optional().default(false),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const familyId = getRouterParam(event, 'id')
  if (!familyId) throw createError({ statusCode: 400, statusMessage: 'Family ID required' })

  const body = await readValidatedBody(event, schema.parse)
  const supabase = await serverSupabaseClient(event)

  // Get clinic_id from user
  const { data: profile } = await supabase
    .from('users')
    .select('clinic_id')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) throw createError({ statusCode: 400, statusMessage: 'No clinic' })

  const { data, error } = await (supabase as any)
    .from('family_notes')
    .insert({
      family_id: familyId,
      clinic_id: profile.clinic_id,
      title: body.title,
      body: body.body,
      pinned: body.pinned,
      created_by: user.id,
    })
    .select('*, author:users!created_by(full_name)')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
