import type { UserRole } from '~/types/database'
import { ROLE_HOME_MAP } from '~/utils/constants'

/**
 * Composable for authentication actions — wraps Supabase auth with app-level logic.
 */
export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const authStore = useAuthStore()

  const loading = ref(false)
  const error = ref<string | null>(null)

  /** Current user role */
  const role = computed<UserRole | null>(() => {
    return (user.value?.user_metadata?.role as UserRole) ?? null
  })

  /** Home route for current user role */
  const homeRoute = computed(() => {
    return role.value ? ROLE_HOME_MAP[role.value] : '/auth/login'
  })

  /** Sign in with email + password */
  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        error.value = authError.message
        return false
      }

      await authStore.initialize()
      return true
    }
    catch (e: unknown) {
      error.value = (e as Error).message
      return false
    }
    finally {
      loading.value = false
    }
  }

  /** Sign up with email + password + metadata */
  async function signUp(data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    role?: UserRole
  }) {
    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone || null,
            role: data.role || 'mother',
          },
        },
      })

      if (authError) {
        error.value = authError.message
        return false
      }

      return true
    }
    catch (e: unknown) {
      error.value = (e as Error).message
      return false
    }
    finally {
      loading.value = false
    }
  }

  /** Sign out */
  async function signOut() {
    loading.value = true
    try {
      await supabase.auth.signOut()
      authStore.reset()
      navigateTo('/auth/login')
    }
    finally {
      loading.value = false
    }
  }

  /** Send password reset email */
  async function resetPassword(email: string) {
    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/verify`,
      })

      if (authError) {
        error.value = authError.message
        return false
      }

      return true
    }
    catch (e: unknown) {
      error.value = (e as Error).message
      return false
    }
    finally {
      loading.value = false
    }
  }

  return {
    user,
    role,
    homeRoute,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}
