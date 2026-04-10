import type { Clinic } from '~/types/database'

/**
 * Composable for clinic/tenant context — determines which clinic the current user belongs to.
 */
export function useClinic() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const clinic = ref<Clinic | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** Clinic ID from user metadata or subdomain */
  const clinicId = computed<string | null>(() => {
    return (user.value?.user_metadata?.clinic_id as string) ?? null
  })

  /** Fetch full clinic details */
  async function fetchClinic() {
    if (!clinicId.value) return null

    loading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId.value)
        .single()

      if (dbError) {
        error.value = dbError.message
        return null
      }

      clinic.value = data as Clinic
      return clinic.value
    }
    catch (e: unknown) {
      error.value = (e as Error).message
      return null
    }
    finally {
      loading.value = false
    }
  }

  /** Update clinic settings (admin only) */
  async function updateClinicSettings(updates: Partial<Clinic>) {
    if (!clinicId.value) return null

    loading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('clinics')
        .update(updates as any)
        .eq('id', clinicId.value)
        .select()
        .single()

      if (dbError) {
        error.value = dbError.message
        return null
      }

      clinic.value = data as Clinic
      return clinic.value
    }
    catch (e: unknown) {
      error.value = (e as Error).message
      return null
    }
    finally {
      loading.value = false
    }
  }

  /** Get clinic theme (custom brand colors, logo) */
  const theme = computed(() => {
    if (!clinic.value?.theme_json) return null
    try {
      return typeof clinic.value.theme_json === 'string'
        ? JSON.parse(clinic.value.theme_json)
        : clinic.value.theme_json
    }
    catch {
      return null
    }
  })

  return {
    clinic,
    clinicId,
    theme,
    loading,
    error,
    fetchClinic,
    updateClinicSettings,
  }
}
