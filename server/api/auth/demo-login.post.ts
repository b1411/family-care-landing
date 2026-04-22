import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const DEMO_ACCOUNTS: Record<string, { email: string; dbRole: string; firstName: string; lastName: string }> = {
  mom: { email: 'p1@demo.kz', dbRole: 'mother', firstName: 'Айгерим', lastName: 'Демо' },
  coordinator: { email: 'dinara@demo.kz', dbRole: 'coordinator', firstName: 'Динара', lastName: 'Демо' },
  admin: { email: 'admin@demo.kz', dbRole: 'admin', firstName: 'Аскар', lastName: 'Демо' },
  doctor: { email: 'doctor@demo.kz', dbRole: 'doctor', firstName: 'Сауле', lastName: 'Демо' },
  chief: { email: 'chief@demo.kz', dbRole: 'chief_doctor', firstName: 'Марат', lastName: 'Демо' },
}

const DEMO_CLINIC_ID = '10000000-0000-0000-0000-000000000001'

const schema = z.object({
  role: z.enum(['mom', 'coordinator', 'admin', 'doctor', 'chief']),
})

// Simple per-IP rate limit for demo login: 10 requests per minute
const demoRateMap = new Map<string, { count: number; resetAt: number }>()
const DEMO_WINDOW_MS = 60_000
const DEMO_MAX_REQUESTS = 10

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const now = Date.now()

  // Rate limiting
  let entry = demoRateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + DEMO_WINDOW_MS }
    demoRateMap.set(ip, entry)
  }
  entry.count++

  if (entry.count > DEMO_MAX_REQUESTS) {
    throw createError({
      statusCode: 429,
      message: 'Слишком много запросов. Попробуйте через минуту.',
    })
  }

  // Validate body
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Укажите корректную роль: mom, coordinator, admin, doctor или chief' })
  }

  const { role } = parsed.data
  const account = DEMO_ACCOUNTS[role]

  if (!account) {
    throw createError({ statusCode: 400, message: 'Неизвестная роль' })
  }

  const password = process.env.DEMO_PASSWORD
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!password || !supabaseUrl || !supabaseKey) {
    const missing = [
      !password && 'DEMO_PASSWORD',
      !supabaseUrl && 'SUPABASE_URL',
      !supabaseKey && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean).join(', ')
    console.error(`[demo-login] Missing env vars: ${missing}`)
    throw createError({ statusCode: 500, message: 'Сервер не настроен' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Try sign in first
  let { data, error } = await supabase.auth.signInWithPassword({
    email: account.email,
    password,
  })

  // Auto-provision: if account doesn't exist or has no identity, create it via Admin API
  if (error) {
    console.warn(`Demo login attempt failed for ${account.email}: ${error.message}. Auto-provisioning...`)

    const userMeta = {
      role: account.dbRole,
      clinic_id: DEMO_CLINIC_ID,
    }

    // Create user via Admin API (handles auth.users + auth.identities automatically)
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: userMeta,
    })

    if (createErr) {
      // User might already exist but have broken identity — try to update
      if (createErr.message?.includes('already been registered')) {
        // List users to find their ID and update
        const { data: listData } = await supabase.auth.admin.listUsers()
        const existingUser = listData?.users?.find(u => u.email === account.email)
        if (existingUser) {
          await supabase.auth.admin.updateUserById(existingUser.id, {
            password,
            email_confirm: true,
            user_metadata: userMeta,
          })
        }
      } else {
        console.error('Demo auto-provision failed:', createErr.message)
        throw createError({
          statusCode: 500,
          message: 'Демо-аккаунт недоступен. Попробуйте позже.',
        })
      }
    }

    // Ensure public.users record exists
    const userId = created?.user?.id
    if (userId) {
      const { error: upsertErr } = await supabase.from('users').upsert({
        id: userId,
        email: account.email,
        role: account.dbRole,
        clinic_id: DEMO_CLINIC_ID,
        first_name: account.firstName,
        last_name: account.lastName,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      if (upsertErr) {
        console.error(`[demo-login] public.users upsert failed for role=${role} (${account.dbRole}):`, upsertErr.message, upsertErr.details)
        // Most common cause: CHECK constraint — the role is not yet allowed
        // because migrations adding it haven't been applied.
        if (upsertErr.message?.includes('users_role_check')) {
          throw createError({
            statusCode: 503,
            message: `Роль ${account.dbRole} ещё не добавлена в БД. Примените миграции 019–025.`,
          })
        }
        throw createError({
          statusCode: 500,
          message: `Не удалось создать профиль: ${upsertErr.message}`,
        })
      }
    }

    // Retry sign in after provisioning
    const retry = await supabase.auth.signInWithPassword({
      email: account.email,
      password,
    })
    data = retry.data
    error = retry.error
  }

  if (error || !data.session) {
    console.error(`[demo-login] sign-in failed for role=${role} email=${account.email}:`, error?.message)
    throw createError({
      statusCode: 500,
      message: `Не удалось войти: ${error?.message ?? 'неизвестная ошибка'}`,
    })
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  }
})
