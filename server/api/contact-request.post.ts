import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(200),
  organization: z.string().max(200).optional(),
  email: z.string().min(1).max(200),
  phone_or_messenger: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
  type: z.enum(['clinic_inquiry', 'demand_family']),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid form data' })
  }

  const data = parsed.data

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw createError({ statusCode: 500, message: 'Server configuration error' })
  }

  try {
    await $fetch(`${supabaseUrl}/rest/v1/contact_requests`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: {
        name: data.name,
        organization: data.organization || null,
        email: data.email,
        phone_or_messenger: data.phone_or_messenger || null,
        comment: data.comment || null,
        type: data.type,
      },
    })
  }
  catch (err) {
    console.error('Failed to store contact request:', err)
    throw createError({ statusCode: 500, message: 'Failed to save request' })
  }

  return { success: true }
})
