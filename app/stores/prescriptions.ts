import { defineStore } from 'pinia'
import type { Prescription, DoseLog } from '~/types/database'

interface PrescriptionState {
  prescriptions: Prescription[]
  todayDoses: DoseLog[]
  loading: boolean
}

export const usePrescriptionStore = defineStore('prescriptions', {
  state: (): PrescriptionState => ({
    prescriptions: [],
    todayDoses: [],
    loading: false,
  }),

  getters: {
    activePrescriptions: (state) => state.prescriptions.filter(p => p.is_active),
    pendingDoses: (state) => state.todayDoses.filter(d => d.status === 'scheduled'),
    confirmedDoses: (state) => state.todayDoses.filter(d => d.status === 'confirmed'),
    missedDoses: (state) => state.todayDoses.filter(d => d.status === 'missed'),
    adherencePercent: (state) => {
      const total = state.todayDoses.length
      if (total === 0) return 100
      const confirmed = state.todayDoses.filter(d => d.status === 'confirmed').length
      return Math.round((confirmed / total) * 100)
    },
  },

  actions: {
    async fetchPrescriptions(familyId: string) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()

        const { data } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('family_id', familyId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (data) this.prescriptions = data as Prescription[]

        // Fetch today's doses
        const today = new Date().toISOString().split('T')[0]
        const { data: doses } = await supabase
          .from('dose_logs')
          .select('*')
          .gte('scheduled_at', `${today}T00:00:00`)
          .lte('scheduled_at', `${today}T23:59:59`)
          .order('scheduled_at', { ascending: true })

        if (doses) this.todayDoses = doses as DoseLog[]
      }
      finally {
        this.loading = false
      }
    },

    async confirmDose(doseId: string) {
      const supabase = useSupabaseClient()

      const { data, error } = await supabase
        .from('dose_logs')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', doseId)
        .select()
        .single()

      if (!error && data) {
        const idx = this.todayDoses.findIndex(d => d.id === doseId)
        if (idx >= 0) this.todayDoses[idx] = data as DoseLog
      }
      return { data, error }
    },

    async skipDose(doseId: string) {
      const supabase = useSupabaseClient()

      const { data, error } = await supabase
        .from('dose_logs')
        .update({ status: 'skipped' })
        .eq('id', doseId)
        .select()
        .single()

      if (!error && data) {
        const idx = this.todayDoses.findIndex(d => d.id === doseId)
        if (idx >= 0) this.todayDoses[idx] = data as DoseLog
      }
      return { data, error }
    },
  },
})
