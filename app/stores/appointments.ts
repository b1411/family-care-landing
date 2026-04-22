import { defineStore } from 'pinia'
import type { Appointment } from '~/types/database'

interface AppointmentState {
  appointments: Appointment[]
  loading: boolean
}

export const useAppointmentStore = defineStore('appointments', {
  state: (): AppointmentState => ({
    appointments: [],
    loading: false,
  }),

  getters: {
    upcoming: (state) => {
      const now = new Date().toISOString()
      return state.appointments
        .filter(a => ['requested', 'confirmed'].includes(a.status) && a.scheduled_at >= now)
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    },
    past: (state) => {
      return state.appointments
        .filter(a => ['completed', 'cancelled', 'no_show'].includes(a.status))
        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
    },
  },

  actions: {
    async fetchAppointments(familyId: string) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const { data } = await supabase
          .from('appointments')
          .select(`
            *,
            doctor:doctors!doctor_id (
              id, specialty,
              user:users!doctors_user_id_fkey ( first_name, last_name )
            )
          `)
          .eq('family_id', familyId)
          .order('scheduled_at', { ascending: false })
          .limit(50)

        if (data) this.appointments = data as unknown as Appointment[]
      }
      finally {
        this.loading = false
      }
    },

    async bookAppointment(input: {
      familyId: string
      childId?: string
      doctorId: string
      slotId: string
      journeyEventId?: string
      notes?: string
    }) {
      const supabase = useSupabaseClient()

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          family_id: input.familyId,
          child_id: input.childId || null,
          doctor_id: input.doctorId,
          slot_id: input.slotId,
          journey_event_id: input.journeyEventId || null,
          status: 'requested',
          appointment_date: new Date().toISOString().slice(0, 10),
          start_time: new Date().toTimeString().slice(0, 8),
          notes: input.notes || null,
        } as any)
        .select()
        .single()

      if (!error && data) {
        this.appointments.unshift(data as unknown as Appointment)

        // Mark slot as unavailable
        await supabase
          .from('appointment_slots')
          .update({ is_available: false })
          .eq('id', input.slotId)
      }
      return { data, error }
    },

    async cancelAppointment(appointmentId: string) {
      const supabase = useSupabaseClient()

      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .select()
        .single()

      if (!error && data) {
        const idx = this.appointments.findIndex(a => a.id === appointmentId)
        if (idx >= 0) this.appointments[idx] = data as unknown as Appointment
      }
      return { data, error }
    },
  },
})
