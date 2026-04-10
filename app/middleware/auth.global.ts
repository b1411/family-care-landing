// Auth middleware — redirects unauthenticated users to login
export default defineNuxtRouteMiddleware((to) => {
  // Skip internal Nuxt paths — these should never be redirected
  if (to.path.startsWith('/_nuxt') || to.path.startsWith('/__nuxt') || to.path.startsWith('/api')) return

  const user = useSupabaseUser()

  // Public routes that don't need auth
  const publicPaths = ['/', '/for-clinics', '/for-families', '/auth', '/demo']
  const isPublic = publicPaths.some(p => to.path === p || to.path.startsWith(p + '/'))

  if (isPublic) return

  if (!user.value) {
    return navigateTo('/auth/login', { replace: true })
  }
})
