import { defineStore } from 'pinia'
import type { Family, ChildProfile, MotherProfile, Journey } from '~/types/database'

interface FamilyState {
  family: Family | null
  motherProfile: MotherProfile | null
  children: ChildProfile[]
  journeys: Journey[]
  loading: boolean
}

export const useFamilyStore = defineStore('family', {
  state: (): FamilyState => ({
    family: null,
    motherProfile: null,
    children: [],
    journeys: [],
    loading: false,
  }),

  getters: {
    hasChildren: (state) => state.children.length > 0,
    activeJourneys: (state) => state.journeys.filter(j => j.status === 'active'),
    isPregnant: (state) => state.journeys.some(j => j.type === 'pregnancy' && j.status === 'active'),
  },

  actions: {
    async fetchFamily(familyId: string) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()

        const [familyRes, motherRes, childrenRes, journeysRes] = await Promise.all([
          supabase.from('families').select('*').eq('id', familyId).single(),
          supabase.from('mother_profiles').select('*').eq('family_id', familyId).single(),
          supabase.from('child_profiles').select('*').eq('family_id', familyId).order('created_at'),
          supabase.from('journeys').select('*').eq('family_id', familyId).order('created_at', { ascending: false }),
        ])

        if (familyRes.data) this.family = familyRes.data as Family
        if (motherRes.data) this.motherProfile = motherRes.data as MotherProfile
        if (childrenRes.data) this.children = childrenRes.data as ChildProfile[]
        if (journeysRes.data) this.journeys = journeysRes.data as Journey[]
      }
      finally {
        this.loading = false
      }
    },

    async addChild(familyId: string, child: Partial<ChildProfile>) {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('child_profiles')
        .insert({ family_id: familyId, ...child } as any)
        .select()
        .single()

      if (!error && data) {
        this.children.push(data as ChildProfile)
      }
      return { data, error }
    },

    async updateChild(childId: string, updates: Partial<ChildProfile>) {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('child_profiles')
        .update(updates)
        .eq('id', childId)
        .select()
        .single()

      if (!error && data) {
        const idx = this.children.findIndex(c => c.id === childId)
        if (idx >= 0) this.children[idx] = data as ChildProfile
      }
      return { data, error }
    },

    async updateMotherProfile(profileId: string, updates: Partial<MotherProfile>) {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('mother_profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single()

      if (!error && data) {
        this.motherProfile = data as MotherProfile
      }
      return { data, error }
    },
  },
})
