// Intercepts Supabase responses to catch DEMO_READONLY (P0001) errors
// from the block_demo_writes trigger and show a friendly toast instead.
// Returns a fake 200 so app state flows as if the write succeeded;
// real data stays unchanged — next refetch shows original demo data.

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const supabaseUrl = (config.public as any)?.supabase?.url as string | undefined
  if (!supabaseUrl) return

  const toast = useAppToast()
  let lastToastAt = 0

  function notifyOnce() {
    const now = Date.now()
    if (now - lastToastAt < 3000) return
    lastToastAt = now
    toast.info('Это демо — изменения не сохраняются. Оставьте заявку, чтобы получить полный доступ.')
  }

  const origFetch = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await origFetch(input as any, init)
    if (res.ok) return res

    const reqUrl =
      typeof input === 'string'
        ? input
        : input instanceof Request
          ? input.url
          : (input as URL).href
    if (!reqUrl.startsWith(supabaseUrl)) return res

    // Only parse bodies for PostgREST write endpoints to keep overhead low
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
    if (method === 'GET' || method === 'HEAD') return res

    try {
      const cloned = res.clone()
      const body = await cloned.json()
      const code = body?.code
      const message: string = body?.message ?? ''
      if (code === 'P0001' && message.startsWith('DEMO_READONLY')) {
        notifyOnce()
        return new Response('[]', {
          status: 200,
          statusText: 'OK (demo readonly)',
          headers: { 'content-type': 'application/json' },
        })
      }
    } catch {
      // Body not JSON — return original error as-is
    }
    return res
  }
})
