// Role middleware — checks if user has the required role for the route
import { ROUTE_ROLE_MAP, ROLE_HOME_MAP } from '~/utils/constants'
import type { UserRole } from '~/types/database'

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  if (!user.value) return // auth middleware handles this

  const role = (user.value.user_metadata?.role as UserRole) || 'mother'

  // Check route prefix against role map
  for (const [prefix, allowedRoles] of Object.entries(ROUTE_ROLE_MAP)) {
    if (to.path.startsWith(prefix)) {
      if (!allowedRoles.includes(role)) {
        // Redirect to user's home based on their role
        return navigateTo(ROLE_HOME_MAP[role], { replace: true })
      }
      break
    }
  }
})
