// GET /api/icd10?q=<query>&category=<cat>&limit=<n>
// Autocomplete for ICD-10 codes. Relies on RLS (any authenticated user).
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const q = getQuery(event)
  const search = String(q.q ?? '').trim()
  const category = q.category ? String(q.category) : null
  const limit = Math.min(Math.max(Number(q.limit ?? 20), 1), 50)

  const supabase = await serverSupabaseClient(event)
  let query = supabase
    .from('icd10_codes')
    .select('code, name_ru, category')
    .eq('is_active', true)
    .limit(limit)

  if (category) query = query.eq('category', category)
  if (search) {
    // code starts-with OR name contains
    query = query.or(`code.ilike.${search}%,name_ru.ilike.%${search}%`)
  }

  const { data, error } = await query.order('code', { ascending: true })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { items: data ?? [] }
})
