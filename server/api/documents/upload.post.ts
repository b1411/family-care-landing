// POST /api/documents/upload — upload a document to Supabase Storage
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  }

  const file = formData.find(f => f.name === 'file')
  const familyId = formData.find(f => f.name === 'family_id')?.data?.toString()
  const childId = formData.find(f => f.name === 'child_id')?.data?.toString()
  const docType = formData.find(f => f.name === 'type')?.data?.toString() || 'other'
  const title = formData.find(f => f.name === 'title')?.data?.toString() || 'Документ'

  if (!file || !file.data) {
    throw createError({ statusCode: 400, statusMessage: 'File is required' })
  }

  if (!familyId) {
    throw createError({ statusCode: 400, statusMessage: 'family_id is required' })
  }

  if (file.data.length > MAX_SIZE) {
    throw createError({ statusCode: 413, statusMessage: 'File too large. Max 10MB.' })
  }

  const mimeType = file.type || 'application/octet-stream'
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw createError({ statusCode: 400, statusMessage: `Unsupported file type: ${mimeType}` })
  }

  const supabase = await serverSupabaseClient(event)
  const ext = file.filename?.split('.').pop() || 'pdf'
  const storagePath = `families/${familyId}/${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase
    .storage
    .from('documents')
    .upload(storagePath, file.data, {
      contentType: mimeType,
      upsert: false,
    })

  if (uploadError) {
    throw createError({ statusCode: 500, statusMessage: `Upload failed: ${uploadError.message}` })
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from('documents').getPublicUrl(storagePath)

  // Save metadata to DB
  const { data: doc, error: dbError } = await supabase
    .from('documents')
    .insert({
      family_id: familyId,
      child_id: childId || null,
      uploaded_by: user.id,
      title,
      type: docType,
      file_path: storagePath,
      file_url: urlData.publicUrl,
      mime_type: mimeType,
      file_size: file.data.length,
    })
    .select()
    .single()

  if (dbError) throw createError({ statusCode: 500, statusMessage: dbError.message })

  return doc
})
