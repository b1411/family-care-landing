import posthog from 'posthog-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const apiKey = config.public.posthogKey as string

  if (!apiKey) return

  posthog.init(apiKey, {
    api_host: 'https://us.i.posthog.com',
    capture_pageview: false,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
  })

  const router = useRouter()
  router.afterEach((to) => {
    posthog.capture('$pageview', { path: to.fullPath })
  })

  return {
    provide: {
      posthog,
    },
  }
})
