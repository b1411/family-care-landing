import * as Sentry from '@sentry/vue'

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g
const PHONE = /\+?\d[\d\s\-()]{8,}\d/g
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi

function scrub(input: unknown): unknown {
  if (typeof input === 'string') {
    return input
      .replace(EMAIL, '[email]')
      .replace(PHONE, '[phone]')
      .replace(UUID, '[uuid]')
  }
  if (Array.isArray(input)) return input.map(scrub)
  if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      const sensitive = /name|email|phone|child|family|patient|diagnosis|notes|dob|birth|address/i.test(k)
      out[k] = sensitive ? '[redacted]' : scrub(v)
    }
    return out
  }
  return input
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const dsn = config.public.sentryDsn as string

  if (!dsn) return

  Sentry.init({
    app: nuxtApp.vueApp,
    dsn,
    integrations: [
      Sentry.browserTracingIntegration({ router: useRouter() }),
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request?.cookies) delete event.request.cookies
      if (event.request?.headers) {
        for (const h of ['authorization', 'cookie', 'x-supabase-auth']) {
          delete event.request.headers[h]
        }
      }
      if (event.message) event.message = scrub(event.message) as string
      if (event.exception?.values) {
        for (const ex of event.exception.values) {
          if (ex.value) ex.value = scrub(ex.value) as string
        }
      }
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((b) => ({
          ...b,
          message: typeof b.message === 'string' ? (scrub(b.message) as string) : b.message,
          data: b.data ? (scrub(b.data) as typeof b.data) : b.data,
        }))
      }
      return event
    },
  })
})
