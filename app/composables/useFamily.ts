import type { ChildProfile, MotherProfile } from '~/types/database'

/**
 * Composable for family data operations — children, mother profile, invite partner.
 */
export function useFamily() {
  const supabase = useSupabaseClient()
  const familyStore = useFamilyStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** Add a child to the family */
  async function addChild(familyId: string, child: Omit<ChildProfile, 'id' | 'family_id' | 'created_at' | 'updated_at'>) {
    loading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('child_profiles')
        .insert({ ...child, family_id: familyId })
        .select()
        .single()

      if (dbError) {
        error.value = dbError.message
        return null
      }

      // Refresh store
      await familyStore.fetchFamily(familyId)
      return data as ChildProfile
    }
    catch (e: unknown) {
      error.value = (e as Error).message
      return null
    }
    finally {
      loading.value = false
    }
  }

  /** Update child profile */
  async function updateChild(childId: string, updates: Partial<ChildProfile>) {
    loading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('child_profiles')
        .update(updates)
        .eq('id', childId)
        .select()
        .single()

      if (dbError) {
        error.value = dbError.message
        return null
      }

      return data as ChildProfile
    }
    catch (e: unknown) {
      error.value = (e as Error).message
      return null
    }
    finally {
      loading.value = false
    }
  }

  /** Update mother profile */
  async function updateMotherProfile(profileId: string, updates: Partial<MotherProfile>) {
    loading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('mother_profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single()

      if (dbError) {
        error.value = dbError.message
        return null
      }

      return data as MotherProfile
    }
    catch (e: unknown) {
      error.value = (e as Error).message
      return null
    }
    finally {
      loading.value = false
    }
  }

  /** Generate invite code for partner */
  async function generateInviteCode(familyId: string): Promise<string | null> {
    loading.value = true
    error.value = null

    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      const { error: dbError } = await supabase
        .from('families')
        .update({ invite_code: code })
        .eq('id', familyId)

      if (dbError) {
        error.value = dbError.message
        return null
      }

      return code
    }
    catch (e: unknown) {
      error.value = (e as Error).message
      return null
    }
    finally {
      loading.value = false
    }
  }

  /** Get invite link for sharing */
  function getInviteLink(code: string): string {
    return `${window.location.origin}/auth/invite/${code}`
  }

  return {
    loading,
    error,
    addChild,
    updateChild,
    updateMotherProfile,
    generateInviteCode,
    getInviteLink,
  }
}
