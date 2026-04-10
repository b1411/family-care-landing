const ipRequestMap = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 60 // 60 req/min per IP

export default defineEventHandler((event) => {
  // Only rate-limit API routes
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const now = Date.now()

  let entry = ipRequestMap.get(ip)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    ipRequestMap.set(ip, entry)
  }

  entry.count++

  setResponseHeader(event, 'X-RateLimit-Limit', String(MAX_REQUESTS))
  setResponseHeader(event, 'X-RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - entry.count)))
  setResponseHeader(event, 'X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)))

  if (entry.count > MAX_REQUESTS) {
    setResponseStatus(event, 429)
    return { error: 'Too many requests. Please try again later.' }
  }

  // Cleanup old entries every 1000 requests
  if (ipRequestMap.size > 10_000) {
    for (const [key, val] of ipRequestMap) {
      if (now > val.resetAt) ipRequestMap.delete(key)
    }
  }
})
