// POST /api/chief/case-reviews/[id]/decision
// Chief records a comment + decision and closes the case review.
import { z } from 'zod'
import { requireChief } from '~~/server/utils/chief-guard'

const schema = z.object({
  chief_comment: z.string().min(5).max(4000),
  decision: z.enum(['no_violation', 'training_required', 'formal_warning', 'escalate']),
  close: z.boolean().default(true),
})

export default defineEventHandler(async (event) => {
  const { supabase, clinicId, userId } = await requireChief(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'case-review id required' })

  const body = await readValidatedBody(event, schema.parse)

  const { data, error } = await supabase
    .from('case_reviews')
    .update({
      chief_comment: body.chief_comment,
      decision: body.decision,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      status: body.close ? 'closed' : 'in_review',
    })
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  return data
})
