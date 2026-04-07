import { defineStore } from 'pinia'
import type { CoordinatorTask, Family } from '~/types/database'

interface CoordinatorState {
  tasks: CoordinatorTask[]
  families: Family[]
  stats: {
    activeFamilies: number
    overdueToday: number
    avgAdherence: number
    monthlyConversion: number
  }
  loading: boolean
}

export const useCoordinatorStore = defineStore('coordinator', {
  state: (): CoordinatorState => ({
    tasks: [],
    families: [],
    stats: {
      activeFamilies: 0,
      overdueToday: 0,
      avgAdherence: 0,
      monthlyConversion: 0,
    },
    loading: false,
  }),

  getters: {
    pendingTasks: (state) => state.tasks
      .filter(t => t.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }),
    criticalTasks: (state) => state.tasks.filter(t => t.priority === 'critical' && t.status === 'pending'),
  },

  actions: {
    async fetchTasks(clinicId: string) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const { data } = await supabase
          .from('coordinator_tasks')
          .select('*')
          .eq('clinic_id', clinicId)
          .in('status', ['pending', 'in_progress'])
          .order('created_at', { ascending: false })
          .limit(100)

        if (data) this.tasks = data as CoordinatorTask[]
      }
      finally {
        this.loading = false
      }
    },

    async fetchFamilies(clinicId: string) {
      const supabase = useSupabaseClient()

      // Fetch families with parent data
      const { data: rawFamilies } = await supabase
        .from('families')
        .select('id, status, created_at, primary_parent:users!families_primary_parent_id_fkey(first_name, last_name, phone)')
        .eq('clinic_id', clinicId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (!rawFamilies?.length) { this.families = []; return }

      const ids = rawFamilies.map(f => f.id)

      // Fetch active journeys and children count in parallel
      const [journeysRes, childrenRes, overdueRes] = await Promise.all([
        supabase.from('journeys').select('family_id, type').in('family_id', ids).eq('status', 'active'),
        supabase.from('child_profiles').select('family_id').in('family_id', ids),
        supabase.from('journey_events').select('journey_id, journeys!inner(family_id)').eq('status', 'overdue').in('journeys.family_id', ids),
      ])

      const journeyMap = new Map<string, string>()
      for (const j of journeysRes.data || []) journeyMap.set(j.family_id, j.type)

      const childCountMap = new Map<string, number>()
      for (const c of childrenRes.data || []) childCountMap.set(c.family_id, (childCountMap.get(c.family_id) || 0) + 1)

      const overdueMap = new Map<string, number>()
      for (const e of overdueRes.data || []) {
        const fid = (e.journeys as Record<string, unknown>)?.family_id as string
        if (fid) overdueMap.set(fid, (overdueMap.get(fid) || 0) + 1)
      }

      this.families = rawFamilies.map(f => {
        const parent = f.primary_parent as Record<string, unknown> | null
        return {
          ...f,
          mother_name: parent ? `${parent.first_name || ''} ${parent.last_name || ''}`.trim() : '',
          mother_phone: (parent?.phone as string) || null,
          journey_type: journeyMap.get(f.id) || null,
          children_count: childCountMap.get(f.id) || 0,
          overdue_count: overdueMap.get(f.id) || 0,
        } as unknown as Family
      })
    },

    async completeTask(taskId: string, notes?: string) {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('coordinator_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq('id', taskId)
        .select()
        .single()

      if (!error && data) {
        const idx = this.tasks.findIndex(t => t.id === taskId)
        if (idx >= 0) this.tasks[idx] = data as CoordinatorTask
      }
      return { data, error }
    },

    async dismissTask(taskId: string) {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('coordinator_tasks')
        .update({ status: 'dismissed' })
        .eq('id', taskId)
        .select()
        .single()

      if (!error && data) {
        const idx = this.tasks.findIndex(t => t.id === taskId)
        if (idx >= 0) this.tasks[idx] = data as CoordinatorTask
      }
      return { data, error }
    },

    async fetchStats(clinicId: string) {
      const supabase = useSupabaseClient()

      // Active families count
      const { count: activeFamilies } = await supabase
        .from('families')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('status', 'active')

      // Overdue events today
      const today = new Date().toISOString().split('T')[0]
      const { count: overdueToday } = await supabase
        .from('journey_events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue')
        .lte('due_date', today)

      this.stats = {
        activeFamilies: activeFamilies || 0,
        overdueToday: overdueToday || 0,
        avgAdherence: 0, // Calculated via SQL view
        monthlyConversion: 0, // Calculated via SQL view
      }
    },
  },
})
