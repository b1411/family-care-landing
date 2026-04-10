/**
 * Smart data composable that provides the SAME interface as useMockData()
 * but pulls real data from Pinia stores (Supabase) when available.
 *
 * DROP-IN replacement: pages change `useMockData()` → `useAppData()`
 * Zero template changes needed.
 */
import type {
  JourneyEvent,
  Prescription,
  DoseLog,
  Appointment,
  Vaccination,
  GrowthMetric,
  Milestone,
  MoodLog,
  EPDSScreening,
  SleepLog,
  FeedingLog,
  Achievement,
} from '~/types/database'

// ──── Helpers ────
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateSparkline(length: number, base: number, variance: number): number[] {
  return Array.from({ length }, (_, i) => Math.max(0, Math.round(base + variance * Math.sin(i * 1.4 + base * 0.1))))
}

function pastDays(n: number): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

function formatDateRu(iso: string): string {
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const d = new Date(iso)
  return `${d.getDate()} ${months[d.getMonth()]}`
}

function daysBetween(from: string, to: string): number {
  return Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000)
}

// ──── Composable ────

export function useAppData() {
  const authStore = useAuthStore()
  const journeyStore = useJourneyStore()
  const prescriptionsStore = usePrescriptionStore()
  const appointmentsStore = useAppointmentStore()
  const notifStore = useNotificationStore()
  const coordinatorStore = useCoordinatorStore()

  // Track overall loading
  const loading = computed(() =>
    journeyStore.loading || prescriptionsStore.loading || appointmentsStore.loading,
  )
  const initialized = ref(false)

  // ── Doctor/Admin real data refs ──
  const _doctorSchedule = ref<any[]>([])
  const _doctorPatients = ref<any[]>([])
  const _doctorStats = ref<{ todayAppointments: number; totalPatients: number; freeSlots: number; avgRating: number } | null>(null)
  const _adminStats = ref<{ totalUsers: number; totalFamilies: number; totalDoctors: number; monthlyAppointments: number } | null>(null)
  const _adminUsers = ref<any[]>([])
  const _adminUsersTotal = ref(0)
  const _vaccinationsRaw = ref<any[]>([])

  // ── Family-module real data refs ──
  const _growthRaw = ref<any[]>([])
  const _milestonesRaw = ref<any[]>([])
  const _moodLogsRaw = ref<any[]>([])
  const _epdsRaw = ref<any[]>([])
  const _sleepLogsRaw = ref<any[]>([])
  const _sleepLogsTodayRaw = ref<any[]>([])
  const _feedingLogsRaw = ref<any[]>([])
  const _foodIntrosRaw = ref<any[]>([])
  const _achievementsRaw = ref<any[]>([])
  const _userAchievementsRaw = ref<any[]>([])
  const _referralRaw = ref<any | null>(null)
  const _educationRaw = ref<any[]>([])

  const sb = useSupabaseClient()

  // ── Fetch all data for current role ──
  async function fetchAll() {
    const familyId = authStore.familyId
    const clinicId = authStore.clinicId
    const role = authStore.role

    const promises: Promise<unknown>[] = []

    // Family role — fetch family data
    if (familyId && ['mother', 'father'].includes(role)) {
      promises.push(
        journeyStore.fetchJourneys(familyId),
        prescriptionsStore.fetchPrescriptions(familyId),
        appointmentsStore.fetchAppointments(familyId),
        notifStore.fetchNotifications(),
      )
      // Fetch vaccinations for first child
      if (authStore.children?.length > 0) {
        promises.push(fetchVaccinations(authStore.children[0]!.id))
        promises.push(fetchGrowthData(authStore.children[0]!.id))
        promises.push(fetchMilestones(authStore.children[0]!.id))
        promises.push(fetchSleepLogs(authStore.children[0]!.id))
        promises.push(fetchSleepLogsToday(authStore.children[0]!.id))
        promises.push(fetchFeedingLogs(authStore.children[0]!.id))
        promises.push(fetchFoodIntros(authStore.children[0]!.id))
      }
      // User-scoped data
      const userId = authStore.profile?.id
      if (userId) {
        promises.push(fetchMoodLogs(userId))
        promises.push(fetchEpdsScreenings(userId))
        promises.push(fetchAchievements(userId))
        promises.push(fetchReferral(userId))
      }
      promises.push(fetchEducation(clinicId || undefined))
    }

    // Coordinator — fetch tasks and families
    if (clinicId && role === 'coordinator') {
      promises.push(
        coordinatorStore.fetchTasks(clinicId),
        coordinatorStore.fetchFamilies(clinicId),
        coordinatorStore.fetchStats(clinicId),
      )
    }

    // Doctor — fetch real schedule and patients
    if (clinicId && ['doctor', 'gynecologist', 'pediatrician', 'nurse'].includes(role)) {
      promises.push(
        notifStore.fetchNotifications(),
        fetchDoctorSchedule(),
        fetchDoctorPatients(),
      )
    }

    // Admin — fetch real stats and users
    if (['admin', 'clinic_admin', 'platform_admin', 'superadmin', 'clinic_manager'].includes(role)) {
      promises.push(
        fetchAdminStats(),
        fetchAdminUsers(),
        notifStore.fetchNotifications(),
      )
    }

    if (promises.length > 0) {
      await Promise.allSettled(promises)
    }
    initialized.value = true
  }

  // ── Helper fetchers ──
  async function fetchVaccinations(childId: string) {
    try {
      const data = await $fetch<any[]>(`/api/vaccinations`, { query: { child_id: childId } })
      _vaccinationsRaw.value = data || []
    }
    catch (e) { console.warn('[useAppData] vaccinations fetch failed', e) }
  }

  async function fetchDoctorSchedule(date?: string) {
    try {
      const data = await $fetch<any[]>(`/api/doctor/schedule`, { query: date ? { date } : {} })
      _doctorSchedule.value = data || []
    }
    catch (e) { console.warn('[useAppData] doctor schedule fetch failed', e) }
  }

  async function fetchDoctorPatients() {
    try {
      const data = await $fetch<any[]>(`/api/doctor/patients`)
      _doctorPatients.value = data || []
    }
    catch (e) { console.warn('[useAppData] doctor patients fetch failed', e) }
  }

  async function fetchAdminStats() {
    try {
      const data = await $fetch<any>(`/api/admin/stats`)
      _adminStats.value = data
    }
    catch (e) { console.warn('[useAppData] admin stats fetch failed', e) }
  }

  async function fetchAdminUsers(opts?: { page?: number; role?: string; search?: string }) {
    try {
      const data = await $fetch<any>(`/api/admin/users`, { query: opts || {} })
      _adminUsers.value = data.data || []
      _adminUsersTotal.value = data.total || 0
    }
    catch (e) { console.warn('[useAppData] admin users fetch failed', e) }
  }

  // ── Family-module fetchers ──
  async function fetchGrowthData(childId: string) {
    try {
      const { data } = await sb.from('growth_metrics').select('*').eq('child_id', childId).order('date')
      _growthRaw.value = data || []
    }
    catch (e) { console.warn('[useAppData] growth fetch failed', e) }
  }

  async function fetchMilestones(childId: string) {
    try {
      const { data } = await sb.from('milestones').select('*').eq('child_id', childId).order('achieved_at', { ascending: false })
      _milestonesRaw.value = data || []
    }
    catch (e) { console.warn('[useAppData] milestones fetch failed', e) }
  }

  async function fetchMoodLogs(userId: string) {
    try {
      const { data } = await sb.from('mood_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(30)
      _moodLogsRaw.value = data || []
    }
    catch (e) { console.warn('[useAppData] mood_logs fetch failed', e) }
  }

  async function fetchEpdsScreenings(userId: string) {
    try {
      const { data } = await sb.from('epds_screenings').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(5)
      _epdsRaw.value = data || []
    }
    catch (e) { console.warn('[useAppData] epds fetch failed', e) }
  }

  async function fetchSleepLogs(childId: string) {
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const { data } = await sb.from('sleep_logs').select('*').eq('child_id', childId).gte('date', sevenDaysAgo.toISOString().slice(0, 10)).order('date')
      _sleepLogsRaw.value = data || []
    }
    catch (e) { console.warn('[useAppData] sleep_logs fetch failed', e) }
  }

  async function fetchSleepLogsToday(childId: string) {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const { data } = await sb.from('sleep_logs').select('*').eq('child_id', childId).eq('date', today).order('sleep_start')
      _sleepLogsTodayRaw.value = data || []
    }
    catch (e) { console.warn('[useAppData] sleep_logs today fetch failed', e) }
  }

  async function fetchFoodIntros(childId: string) {
    try {
      const { data } = await sb.from('food_introductions').select('*').eq('child_id', childId).order('introduced_at', { ascending: false })
      _foodIntrosRaw.value = data || []
    }
    catch (e) { console.warn('[useAppData] food_introductions fetch failed', e) }
  }

  async function fetchFeedingLogs(childId: string) {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const { data } = await sb.from('feeding_logs').select('*').eq('child_id', childId).gte('timestamp', today).order('timestamp')
      _feedingLogsRaw.value = data || []
    }
    catch (e) { console.warn('[useAppData] feeding_logs fetch failed', e) }
  }

  async function fetchAchievements(userId: string) {
    try {
      const [{ data: all }, { data: user }] = await Promise.all([
        sb.from('achievements').select('*'),
        sb.from('user_achievements').select('*').eq('user_id', userId),
      ])
      _achievementsRaw.value = all || []
      _userAchievementsRaw.value = user || []
    }
    catch (e) { console.warn('[useAppData] achievements fetch failed', e) }
  }

  async function fetchReferral(_userId: string) {
    try {
      const fId = authStore.familyId
      if (!fId) return
      const { data } = await sb.from('referrals').select('*').eq('referrer_family_id', fId).limit(1).maybeSingle()
      _referralRaw.value = data
    }
    catch (e) { console.warn('[useAppData] referral fetch failed', e) }
  }

  async function fetchEducation(clinicId?: string) {
    try {
      let q = sb.from('education_content').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(20)
      if (clinicId) q = q.eq('clinic_id', clinicId)
      const { data } = await q
      _educationRaw.value = data || []
    }
    catch (e) { console.warn('[useAppData] education fetch failed', e) }
  }

  // ═══════════════════════════════════
  //  FAMILY DATA (computed from stores)
  // ═══════════════════════════════════

  const hasRealJourneyData = computed(() => journeyStore.events.length > 0)
  const hasRealPrescriptionData = computed(() => prescriptionsStore.prescriptions.length > 0)
  const hasRealAppointmentData = computed(() => appointmentsStore.appointments.length > 0)

  // ── Family KPI ──
  const familyKpi = computed(() => {
    const progress = hasRealJourneyData.value ? journeyStore.progressPercent : 68
    const adherence = hasRealPrescriptionData.value ? prescriptionsStore.adherencePercent : 94
    const completed = hasRealJourneyData.value ? journeyStore.completedCount : 34
    const total = hasRealJourneyData.value ? journeyStore.events.length : 50
    const unread = notifStore.unreadCount

    // Next event days
    let nextEventDays = 3
    if (hasRealJourneyData.value && journeyStore.upcomingEvents.length > 0) {
      const nextDate = journeyStore.upcomingEvents[0]?.due_date
      if (nextDate) {
        nextEventDays = Math.max(0, daysBetween(new Date().toISOString().slice(0, 10), nextDate))
      }
    }

    return {
      journeyProgress: { value: progress, trend: 5, sparkline: generateSparkline(7, Math.max(50, progress - 5), 5) },
      adherence: { value: adherence, trend: 2, sparkline: generateSparkline(7, Math.max(70, adherence - 8), 6) },
      nextEventDays,
      unreadNotifications: unread,
      completedEvents: completed,
      totalEvents: total,
    }
  })

  // ── Journey Events ──
  const journeyEvents = computed(() => {
    if (hasRealJourneyData.value) {
      return journeyStore.events.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description || '',
        type: e.type,
        status: e.status as 'completed' | 'overdue' | 'due' | 'upcoming',
        due_date: e.due_date || '',
        is_mandatory: e.is_mandatory,
      }))
    }
    // Fallback mock
    return [
      { id: '1', title: 'УЗИ 2 триместра', description: 'Ультразвуковое исследование 18–21 неделя', type: 'ultrasound', status: 'completed' as const, due_date: pastDays(14)[0]!, is_mandatory: true },
      { id: '2', title: 'Общий анализ крови', description: 'ОАК + биохимия', type: 'analysis', status: 'completed' as const, due_date: pastDays(10)[0]!, is_mandatory: true },
      { id: '3', title: 'Консультация генетика', description: 'Скрининг 2 триместра', type: 'screening', status: 'overdue' as const, due_date: pastDays(3)[0]!, is_mandatory: true },
      { id: '4', title: 'Приём гинеколога', description: 'Плановый осмотр, 22 неделя', type: 'checkup', status: 'due' as const, due_date: new Date().toISOString().slice(0, 10), is_mandatory: true },
      { id: '5', title: 'Тест на глюкозу (ОГТТ)', description: 'Глюкозотолерантный тест 24–28 неделя', type: 'analysis', status: 'upcoming' as const, due_date: pastDays(-7)[0] || '2026-04-16', is_mandatory: true },
    ]
  })

  // ── Prescriptions ──
  const prescriptions = computed(() => {
    if (hasRealPrescriptionData.value) {
      return prescriptionsStore.activePrescriptions.map((rx: Prescription) => {
        const doses = prescriptionsStore.todayDoses.filter((d: DoseLog) => d.prescription_id === rx.id)
        const totalDoses = doses.length || 1
        const confirmed = doses.filter((d: DoseLog) => d.status === 'confirmed').length
        return {
          id: rx.id,
          medication: rx.medication,
          dosage: rx.dosage,
          frequency: rx.frequency,
          times: rx.time_of_day || [],
          adherencePercent: Math.round((confirmed / totalDoses) * 100),
          todayDoses: doses.map((d: DoseLog) => ({
            id: d.id,
            time: new Date(d.scheduled_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            status: d.status === 'pending' ? 'pending' as const : d.status as 'confirmed' | 'pending' | 'missed',
          })),
        }
      })
    }
    // Fallback mock
    return [
      { id: 'rx1', medication: 'Витамин D3', dosage: '2000 МЕ', frequency: '1 раз/день', times: ['09:00'], adherencePercent: 96, todayDoses: [{ id: 'd1', time: '09:00', status: 'confirmed' as const }] },
      { id: 'rx2', medication: 'Железо (Ферлатум)', dosage: '40 мг', frequency: '2 раза/день', times: ['08:00', '20:00'], adherencePercent: 89, todayDoses: [{ id: 'd2', time: '08:00', status: 'confirmed' as const }, { id: 'd3', time: '20:00', status: 'pending' as const }] },
      { id: 'rx3', medication: 'Магний B6', dosage: '100 мг', frequency: '2 раза/день', times: ['10:00', '22:00'], adherencePercent: 92, todayDoses: [{ id: 'd4', time: '10:00', status: 'confirmed' as const }, { id: 'd5', time: '22:00', status: 'pending' as const }] },
      { id: 'rx4', medication: 'Фолиевая кислота', dosage: '400 мкг', frequency: '1 раз/день', times: ['09:00'], adherencePercent: 100, todayDoses: [{ id: 'd6', time: '09:00', status: 'confirmed' as const }] },
    ]
  })

  // ── Appointments ──
  const appointments = computed(() => {
    if (hasRealAppointmentData.value) {
      return appointmentsStore.appointments.slice(0, 10).map((a: Appointment) => ({
        id: a.id,
        reason: a.notes || 'Плановый приём',
        doctor_name: '', // enriched via join or separate fetch
        specialty: '',
        appointment_date: a.scheduled_at?.split('T')[0] || '',
        start_time: a.scheduled_at ? new Date(a.scheduled_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '',
        status: a.status as 'confirmed' | 'requested' | 'completed' | 'cancelled',
      }))
    }
    return [
      { id: 'a1', reason: 'Плановый осмотр гинеколога', doctor_name: 'Алия Касымова', specialty: 'Гинеколог', appointment_date: '2026-04-11', start_time: '10:00', status: 'confirmed' as const },
      { id: 'a2', reason: 'УЗИ 3 триместра', doctor_name: 'Марат Ибрагимов', specialty: 'УЗИ-специалист', appointment_date: '2026-04-18', start_time: '14:30', status: 'requested' as const },
      { id: 'a3', reason: 'Консультация педиатра', doctor_name: 'Динара Жумабаева', specialty: 'Педиатр', appointment_date: '2026-03-28', start_time: '11:00', status: 'completed' as const },
    ]
  })

  // ── Adherence weekly ──
  const adherenceWeekly = computed(() => {
    if (hasRealPrescriptionData.value) {
      const totalPerDay = prescriptionsStore.activePrescriptions.length * 2 || 6
      const adherence = prescriptionsStore.adherencePercent
      // Use deterministic values based on real adherence %
      return pastDays(7).map((d, i) => ({
        date: formatDateRu(d),
        taken: Math.round(totalPerDay * Math.min(1, (adherence + (i - 3)) / 100)),
        total: totalPerDay,
      }))
    }
    return pastDays(7).map(d => ({ date: formatDateRu(d), taken: randomInt(3, 6), total: 6 }))
  })

  const adherenceMonthly = computed(() => {
    const base = hasRealPrescriptionData.value ? prescriptionsStore.adherencePercent : 85
    return pastDays(30).map((d, i) => ({ date: d, percent: Math.min(100, Math.max(50, base + (i % 5) - 2)) }))
  })

  // ── Vaccinations (real data from API, mock fallback) ──
  const vaccinations = computed(() => {
    if (_vaccinationsRaw.value.length > 0) {
      return _vaccinationsRaw.value.map((v: any) => ({
        id: v.id,
        name: v.vaccine_name,
        date: v.administered_date || v.scheduled_date,
        status: (v.status === 'completed' ? 'completed' : 'upcoming') as 'completed' | 'upcoming',
        dose: `${v.dose_number}`,
        batch: v.batch_number || '',
      }))
    }
    return [
      { id: 'v1', name: 'BCG', date: '2026-01-15', status: 'completed' as const, dose: '1/1', batch: 'BCG-2025-KZ-44' },
      { id: 'v2', name: 'Гепатит B (1-я)', date: '2026-01-15', status: 'completed' as const, dose: '1/3', batch: 'HBV-2025-112' },
      { id: 'v3', name: 'АКДС-ГепB-Hib (1-я)', date: '2026-03-15', status: 'completed' as const, dose: '1/3', batch: 'PENTA-2026-07' },
      { id: 'v4', name: 'ИПВ (1-я)', date: '2026-03-15', status: 'completed' as const, dose: '1/3', batch: 'IPV-2026-22' },
      { id: 'v5', name: 'PCV13 (1-я)', date: '2026-03-15', status: 'completed' as const, dose: '1/3', batch: 'PCV-2026-89' },
      { id: 'v6', name: 'АКДС-ГепB-Hib (2-я)', date: '2026-04-15', status: 'upcoming' as const, dose: '2/3', batch: '' },
      { id: 'v7', name: 'ИПВ (2-я)', date: '2026-04-15', status: 'upcoming' as const, dose: '2/3', batch: '' },
      { id: 'v8', name: 'PCV13 (2-я)', date: '2026-04-15', status: 'upcoming' as const, dose: '2/3', batch: '' },
    ]
  })

  // ── Growth & Milestones ──
  const growthData = computed(() => {
    if (_growthRaw.value.length > 0) {
      const sorted = [..._growthRaw.value].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const firstDate = new Date(sorted[0].date)
      return {
        months: sorted.map(g => {
          const diff = (new Date(g.date).getTime() - firstDate.getTime()) / (30 * 86400000)
          return Math.round(diff * 10) / 10
        }),
        weight: sorted.map(g => g.weight_kg),
        height: sorted.map(g => g.height_cm),
        head: sorted.map(g => g.head_cm),
        whoWeight3rd: sorted.map((_, i) => 2.5 + i * 0.65),
        whoWeight50th: sorted.map((_, i) => 3.3 + i * 0.77),
        whoWeight97th: sorted.map((_, i) => 4.4 + i * 0.88),
        whoHeight3rd: sorted.map((_, i) => 46.1 + i * 2.87),
        whoHeight50th: sorted.map((_, i) => 49.9 + i * 2.95),
        whoHeight97th: sorted.map((_, i) => 53.7 + i * 3.03),
      }
    }
    return {
      months: [0, 1, 2, 3, 4, 5, 6],
      weight: [3.4, 4.2, 5.1, 6.0, 6.8, 7.3, 7.9],
      height: [50, 54, 57, 60, 63, 65, 67],
      head: [35, 37, 38.5, 40, 41, 42, 43],
      whoWeight3rd: [2.5, 3.4, 4.3, 5.0, 5.6, 6.1, 6.5],
      whoWeight50th: [3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9],
      whoWeight97th: [4.4, 5.8, 7.1, 8.0, 8.7, 9.2, 9.7],
      whoHeight3rd: [46.1, 50.8, 54.4, 57.3, 59.7, 61.7, 63.3],
      whoHeight50th: [49.9, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6],
      whoHeight97th: [53.7, 58.6, 62.4, 65.5, 68.0, 70.1, 71.9],
    }
  })

  const milestones = computed(() => {
    if (_milestonesRaw.value.length > 0) {
      return _milestonesRaw.value.map(m => ({
        id: m.id,
        name: m.title,
        icon: 'lucide:check-circle',
        achieved: !!m.achieved_at,
        date: m.achieved_at ? formatDateRu(m.achieved_at) : '',
        expected: m.notes || '',
      }))
    }
    return [
      { id: 'm1', name: 'Первая улыбка', icon: 'lucide:smile', achieved: true, date: '2026-02-20', expected: '1–2 мес' },
      { id: 'm2', name: 'Держит голову', icon: 'lucide:arrow-up-right', achieved: true, date: '2026-03-10', expected: '2–3 мес' },
      { id: 'm3', name: 'Переворот на живот', icon: 'lucide:move-right', achieved: true, date: '2026-04-05', expected: '3–5 мес' },
      { id: 'm4', name: 'Сидит с поддержкой', icon: 'lucide:user', achieved: false, date: '', expected: '5–7 мес' },
      { id: 'm5', name: 'Ползает', icon: 'lucide:move-right', achieved: false, date: '', expected: '7–10 мес' },
      { id: 'm6', name: 'Стоит у опоры', icon: 'lucide:arrow-up-right', achieved: false, date: '', expected: '9–12 мес' },
      { id: 'm7', name: 'Первые шаги', icon: 'lucide:footprints', achieved: false, date: '', expected: '11–15 мес' },
      { id: 'm8', name: 'Первые слова', icon: 'lucide:message-circle', achieved: false, date: '', expected: '12–18 мес' },
    ]
  })

  // ── Mood & Mental Health ──
  const moodHistory = computed(() => {
    if (_moodLogsRaw.value.length > 0) {
      return _moodLogsRaw.value.slice(0, 14).reverse().map(m => ({ date: m.date, score: m.score }))
    }
    return pastDays(14).map(d => ({ date: d, score: randomInt(2, 5) }))
  })
  const lastEpds = computed(() => {
    if (_epdsRaw.value.length > 0) {
      const e = _epdsRaw.value[0]
      return { score: e.total_score, risk: e.risk_level || 'low', date: e.date }
    }
    return { score: 8, risk: 'low' as const, date: '2026-03-25' }
  })

  // ── Sleep & Nutrition ──
  const sleepWeek = computed(() => {
    if (_sleepLogsRaw.value.length > 0) {
      // Group by date
      const byDate = new Map<string, { night: number; nap: number }>()
      for (const s of _sleepLogsRaw.value) {
        const key = s.date
        if (!byDate.has(key)) byDate.set(key, { night: 0, nap: 0 })
        const entry = byDate.get(key)!
        const start = new Date(`${s.date}T${s.sleep_start}`)
        const end = new Date(`${s.date}T${s.sleep_end}`)
        let hours = (end.getTime() - start.getTime()) / 3600000
        if (hours < 0) hours += 24
        if (s.type === 'night') entry.night += hours
        else entry.nap += hours
      }
      return Array.from(byDate.entries()).map(([date, v]) => ({
        date: formatDateRu(date),
        night: parseFloat(v.night.toFixed(1)),
        nap: parseFloat(v.nap.toFixed(1)),
      }))
    }
    return pastDays(7).map(d => ({
      date: formatDateRu(d),
      night: parseFloat((Math.random() * 4 + 6).toFixed(1)),
      nap: parseFloat((Math.random() * 2.5 + 1.5).toFixed(1)),
    }))
  })

  const feedingToday = computed(() => {
    if (_feedingLogsRaw.value.length > 0) {
      return _feedingLogsRaw.value.map(f => ({
        id: f.id,
        type: f.type,
        time: f.timestamp ? new Date(f.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '',
        duration: f.duration_minutes || 0,
        side: f.details?.side || '',
        food: f.details?.food || f.notes || '',
        amount: f.details?.amount || '',
      }))
    }
    return [
      { id: 'f1', type: 'breast', time: '06:30', duration: 15, side: 'L', food: '', amount: '' },
      { id: 'f2', type: 'breast', time: '09:00', duration: 12, side: 'R', food: '', amount: '' },
      { id: 'f3', type: 'solid', time: '12:00', duration: 0, side: '', food: 'Кабачок + брокколи', amount: '80 мл' },
      { id: 'f4', type: 'breast', time: '15:00', duration: 10, side: 'L', food: '', amount: '' },
      { id: 'f5', type: 'solid', time: '18:00', duration: 0, side: '', food: 'Тыква', amount: '60 мл' },
    ]
  })

  const sleepLogsToday = computed(() => {
    if (_sleepLogsTodayRaw.value.length > 0) {
      return _sleepLogsTodayRaw.value.map(s => {
        const start = s.sleep_start?.slice(0, 5) || ''
        const end = s.sleep_end?.slice(0, 5) || ''
        let durationH = 0
        if (start && end) {
          const startMin = parseInt(start.split(':')[0]!) * 60 + parseInt(start.split(':')[1]!)
          const endMin = parseInt(end.split(':')[0]!) * 60 + parseInt(end.split(':')[1]!)
          durationH = ((endMin - startMin + 1440) % 1440) / 60
        }
        return {
          id: s.id,
          type: s.type as 'night' | 'nap',
          sleep_start: start,
          sleep_end: end,
          duration_h: parseFloat(durationH.toFixed(1)),
          quality: s.quality || null,
          wake_ups: s.wake_ups || 0,
          notes: s.notes || '',
        }
      })
    }
    return [] // empty — show "Log sleep" CTA
  })

  const foodIntros = computed(() => {
    if (_foodIntrosRaw.value.length > 0) {
      return _foodIntrosRaw.value.map(f => ({
        id: f.id,
        food: f.food,
        introducedAt: f.introduced_at,
        status: f.status as 'accepted' | 'reaction' | 'rejected' | 'pending',
        reaction: f.reaction || '',
        notes: f.notes || '',
      }))
    }
    // Fallback mock
    return [
      { id: 'fi1', food: 'Кабачок', introducedAt: '2026-03-01', status: 'accepted' as const, reaction: '', notes: '' },
      { id: 'fi2', food: 'Брокколи', introducedAt: '2026-03-08', status: 'accepted' as const, reaction: '', notes: '' },
      { id: 'fi3', food: 'Тыква', introducedAt: '2026-03-15', status: 'accepted' as const, reaction: '', notes: '' },
      { id: 'fi4', food: 'Яблоко', introducedAt: '2026-03-22', status: 'accepted' as const, reaction: '', notes: '' },
      { id: 'fi5', food: 'Рис', introducedAt: '2026-03-29', status: 'accepted' as const, reaction: '', notes: '' },
      { id: 'fi6', food: 'Яйцо', introducedAt: '2026-04-05', status: 'reaction' as const, reaction: 'Лёгкая сыпь', notes: '' },
    ]
  })

  // ── Achievements & Referral ──
  const streaks = computed(() => {
    // Deriving real streak data requires extensive dose_log/mood_log querying
    // For now keep static values — they show correctly on achievements page
    return {
      doses: { current: 12, longest: 18 },
      mood: { current: 7, longest: 14 },
      sleep: { current: 3, longest: 9 },
      feeding: { current: 5, longest: 11 },
    }
  })

  const achievements = computed(() => {
    if (_achievementsRaw.value.length > 0) {
      const unlockedIds = new Set(_userAchievementsRaw.value.map((ua: any) => ua.achievement_id))
      return _achievementsRaw.value.map(a => {
        const ua = _userAchievementsRaw.value.find((u: any) => u.achievement_id === a.id)
        return {
          id: a.id,
          name: a.title || a.name,
          icon: a.icon || 'lucide:award',
          unlocked: unlockedIds.has(a.id),
          date: ua?.unlocked_at ? formatDateRu(ua.unlocked_at) : '',
        }
      })
    }
    return [
      { id: 'ach1', name: 'Первый визит', icon: 'lucide:stethoscope', unlocked: true, date: '2026-01-16' },
      { id: 'ach2', name: '7 дней подряд', icon: 'lucide:flame', unlocked: true, date: '2026-02-05' },
      { id: 'ach3', name: 'Все прививки до 3 мес', icon: 'lucide:shield-check', unlocked: true, date: '2026-03-16' },
      { id: 'ach4', name: '30 дней подряд', icon: 'lucide:crown', unlocked: false, date: '' },
      { id: 'ach5', name: 'Паспорт на 50%', icon: 'lucide:file-text', unlocked: false, date: '' },
      { id: 'ach6', name: '100 дней подряд', icon: 'lucide:trophy', unlocked: false, date: '' },
    ]
  })

  const referral = computed(() => {
    if (_referralRaw.value) {
      const r = _referralRaw.value
      return {
        code: r.referral_code || 'FAMILY-XXXX',
        invited: r.invited_count || 0,
        registered: r.registered_count || 0,
        bonus: r.bonus_amount ? `${r.bonus_amount.toLocaleString('ru-RU')} ₸` : '0 ₸',
        tier: r.tier || 'Бронза',
        points: r.points || 0,
      }
    }
    return {
      code: 'FAMILY-2A8X',
      invited: 5,
      registered: 3,
      bonus: '15 000 ₸',
      tier: 'Серебро',
      points: 2400,
    }
  })

  // ── Education ──
  const educationArticles = computed(() => {
    if (_educationRaw.value.length > 0) {
      return _educationRaw.value.map(e => ({
        id: e.id,
        title: e.title,
        category: e.target_journey_type || e.type || 'general',
        readTime: e.body ? Math.ceil(e.body.split(' ').length / 200) : 5,
        image: e.thumbnail_url || null,
        week: e.target_week ? `${e.target_week} нед` : (e.target_age_days ? `${Math.round(e.target_age_days / 30)} мес` : ''),
      }))
    }
    return [
      { id: 'e1', title: 'Питание во 2 триместре', category: 'pregnancy', readTime: 5, image: null, week: '20–28 нед' },
      { id: 'e2', title: 'Как справиться с тошнотой', category: 'pregnancy', readTime: 3, image: null, week: '6–14 нед' },
      { id: 'e3', title: 'Грудное вскармливание: первые дни', category: 'breastfeeding', readTime: 7, image: null, week: '0–1 мес' },
      { id: 'e4', title: 'Сон новорождённого: нормы и советы', category: 'childcare', readTime: 6, image: null, week: '0–3 мес' },
      { id: 'e5', title: 'Введение прикорма: когда и как', category: 'nutrition', readTime: 8, image: null, week: '4–6 мес' },
      { id: 'e6', title: 'Постпартальная депрессия: что важно знать', category: 'psychology', readTime: 5, image: null, week: '0–12 мес' },
    ]
  })

  const children = computed(() => {
    if (authStore.children?.length > 0) {
      return authStore.children.map(c => ({
        id: c.id,
        first_name: c.name,
        birth_date: c.dob || '',
        gender: c.gender || 'female',
        blood_type: c.blood_type || '',
        weight_kg: c.birth_weight || 0,
        height_cm: c.birth_height || 0,
      }))
    }
    return [{ id: 'c1', first_name: 'Амира', birth_date: '2026-01-15', gender: 'female', blood_type: 'A+', weight_kg: 7.9, height_cm: 67 }]
  })

  // ═══════════════════════════════════
  //  COORDINATOR DATA
  // ═══════════════════════════════════

  const coordinatorKpi = computed(() => {
    if (coordinatorStore.stats.total_families > 0) {
      return {
        activeFamilies: { value: coordinatorStore.stats.total_families, trend: 8, sparkline: generateSparkline(7, coordinatorStore.stats.total_families - 3, 4) },
        criticalTasks: { value: coordinatorStore.criticalTasks.length, trend: -12, sparkline: generateSparkline(7, 7, 3) },
        pendingTasks: { value: coordinatorStore.pendingTasks.length, trend: 3, sparkline: generateSparkline(7, coordinatorStore.pendingTasks.length - 2, 4) },
        todayAppointments: { value: coordinatorStore.stats.today_appointments, trend: 0, sparkline: generateSparkline(7, 11, 3) },
      }
    }
    return {
      activeFamilies: { value: 47, trend: 8, sparkline: generateSparkline(7, 44, 4) },
      criticalTasks: { value: 5, trend: -12, sparkline: generateSparkline(7, 7, 3) },
      pendingTasks: { value: 18, trend: 3, sparkline: generateSparkline(7, 16, 4) },
      todayAppointments: { value: 12, trend: 0, sparkline: generateSparkline(7, 11, 3) },
    }
  })

  const families = computed(() => {
    if (coordinatorStore.families.length > 0) {
      return coordinatorStore.families.map((f: any) => ({
        id: f.id,
        mother_name: f.mother_name || 'Без имени',
        phone: f.mother_phone || '',
        journey_type: f.journey_type || 'pregnancy',
        week_or_age: '',
        adherence: f.adherence ?? 0,
        overdue_count: f.overdue_count ?? 0,
        children: [],
        last_activity: f.last_activity || '',
      }))
    }
    return [
      { id: 'fam1', mother_name: 'Айгерим Касымова', phone: '+7 707 123 4567', journey_type: 'pregnancy', week_or_age: '22 неделя', adherence: 94, overdue_count: 0, children: [] as any[], last_activity: '2ч назад' },
      { id: 'fam2', mother_name: 'Дана Нурланова', phone: '+7 701 987 6543', journey_type: 'infant', week_or_age: '3 мес 12 дней', adherence: 78, overdue_count: 2, children: [{ id: 'c2', first_name: 'Тимур', birth_date: '2025-12-28', gender: 'male', blood_type: 'B+', weight_kg: 6.2, height_cm: 61 }], last_activity: '1д назад' },
      { id: 'fam3', mother_name: 'Мадина Ержанова', phone: '+7 777 555 1234', journey_type: 'toddler', week_or_age: '14 мес', adherence: 56, overdue_count: 4, children: [{ id: 'c3', first_name: 'Аян', birth_date: '2025-02-10', gender: 'male', blood_type: 'O+', weight_kg: 10.5, height_cm: 78 }], last_activity: '5д назад' },
      { id: 'fam4', mother_name: 'Сара Абдикаримова', phone: '+7 702 345 6789', journey_type: 'postpartum', week_or_age: '6 недель', adherence: 88, overdue_count: 1, children: [{ id: 'c4', first_name: 'Алия', birth_date: '2026-02-28', gender: 'female', blood_type: 'A-', weight_kg: 4.8, height_cm: 56 }], last_activity: '3ч назад' },
      { id: 'fam5', mother_name: 'Камила Бекмуратова', phone: '+7 705 678 9012', journey_type: 'pregnancy', week_or_age: '34 неделя', adherence: 97, overdue_count: 0, children: [] as any[], last_activity: '30 мин назад' },
    ]
  })

  const coordinatorTasks = computed(() => {
    if (coordinatorStore.pendingTasks.length > 0) {
      return coordinatorStore.pendingTasks.map((t: any) => ({
        id: t.id,
        type: t.type,
        priority: t.priority,
        title: t.title,
        family_name: t.description || '',
        created_at: t.created_at,
        status: t.status,
      }))
    }
    return [
      { id: 't1', type: 'missed_appointment' as const, priority: 'critical' as const, title: 'Неявка на приём гинеколога', family_name: 'Мадина Ержанова', created_at: '2026-04-09T08:00:00', status: 'pending' as const },
      { id: 't2', type: 'overdue_followup' as const, priority: 'high' as const, title: 'Просрочен скрининг 1 триместра', family_name: 'Дана Нурланова', created_at: '2026-04-08T06:00:00', status: 'pending' as const },
      { id: 't3', type: 'low_adherence' as const, priority: 'medium' as const, title: 'Adherence <60% за 7 дней', family_name: 'Мадина Ержанова', created_at: '2026-04-08T06:00:00', status: 'pending' as const },
      { id: 't4', type: 'vaccination_reminder' as const, priority: 'high' as const, title: 'Прививка АКДС через 3 дня', family_name: 'Сара Абдикаримова', created_at: '2026-04-09T06:00:00', status: 'pending' as const },
      { id: 't5', type: 'welcome_call' as const, priority: 'low' as const, title: 'Звонок приветствия новой семье', family_name: 'Камила Бекмуратова', created_at: '2026-04-07T10:00:00', status: 'pending' as const },
    ]
  })

  const tasksByType = computed(() => {
    if (coordinatorStore.tasks.length > 0) {
      const counts = new Map<string, number>()
      const labels: Record<string, string> = {
        missed_appointment: 'Неявки',
        overdue_followup: 'Просрочено',
        low_adherence: 'Adherence',
        vaccination_reminder: 'Прививки',
        welcome_call: 'Звонки',
        reactivation: 'Реактивация',
      }
      for (const t of coordinatorStore.tasks) {
        counts.set(t.type, (counts.get(t.type) || 0) + 1)
      }
      return Array.from(counts.entries()).map(([type, value]) => ({
        name: labels[type] || type,
        value,
      }))
    }
    return [
      { name: 'Неявки', value: 5 },
      { name: 'Просрочено', value: 8 },
      { name: 'Adherence', value: 4 },
      { name: 'Прививки', value: 6 },
      { name: 'Звонки', value: 3 },
      { name: 'Реактивация', value: 2 },
    ]
  })

  // ═══════════════════════════════════
  //  DOCTOR DATA (real from API, mock fallback)
  // ═══════════════════════════════════

  const doctorKpi = computed(() => {
    if (_doctorSchedule.value.length > 0 || _doctorPatients.value.length > 0) {
      const booked = _doctorSchedule.value.filter((a: any) => a.status !== 'cancelled').length
      const free = Math.max(0, 12 - booked) // assume 12 total slots per day
      return {
        todayAppointments: booked,
        totalPatients: _doctorPatients.value.length,
        freeSlots: free,
        avgRating: 4.8,
      }
    }
    return { todayAppointments: 8, totalPatients: 124, freeSlots: 3, avgRating: 4.8 }
  })

  const todaySchedule = computed(() => {
    if (_doctorSchedule.value.length > 0) {
      return _doctorSchedule.value.map((a: any) => {
        const parentData = a.families as Record<string, unknown> | null
        const childData = a.child_profiles as Record<string, unknown> | null
        return {
          id: a.id,
          start_time: a.start_time?.slice(0, 5) || '',
          end_time: a.end_time?.slice(0, 5) || '',
          patient_name: childData ? (childData.name as string) : 'Пациент',
          reason: a.notes || a.visit_type || 'Плановый приём',
          is_booked: a.status !== 'cancelled',
        }
      })
    }
    return [
      { id: 's1', start_time: '09:00', end_time: '09:30', patient_name: 'Айгерим К.', reason: 'Плановый осмотр', is_booked: true },
      { id: 's2', start_time: '09:30', end_time: '10:00', patient_name: 'Дана Н.', reason: 'Повторный приём', is_booked: true },
      { id: 's3', start_time: '10:00', end_time: '10:30', is_booked: false },
      { id: 's4', start_time: '10:30', end_time: '11:00', patient_name: 'Камила Б.', reason: 'Первичный приём', is_booked: true },
      { id: 's5', start_time: '11:00', end_time: '11:30', patient_name: 'Сара А.', reason: 'Контроль после родов', is_booked: true },
      { id: 's6', start_time: '11:30', end_time: '12:00', is_booked: false },
      { id: 's7', start_time: '14:00', end_time: '14:30', patient_name: 'Мадина Е.', reason: 'Педиатрический осмотр', is_booked: true },
      { id: 's8', start_time: '14:30', end_time: '15:00', patient_name: 'Гульнар О.', reason: 'Вакцинация', is_booked: true },
      { id: 's9', start_time: '15:00', end_time: '15:30', is_booked: false },
      { id: 's10', start_time: '15:30', end_time: '16:00', patient_name: 'Жанара Т.', reason: 'Плановый осмотр', is_booked: true },
    ]
  })

  const doctorPatients = computed(() => {
    if (_doctorPatients.value.length > 0) {
      return _doctorPatients.value.map((f: any) => {
        const journeyLabels: Record<string, string> = {
          pregnancy: 'Беременность',
          postpartum: 'Послеродовой',
          infant: 'Младенец',
          toddler: 'Тоддлер',
        }
        const activeJourney = f.journeys?.find((j: any) => j.status === 'active')
        const children = (f.child_profiles || []).map((c: any) => {
          const ageDays = c.dob ? Math.floor((Date.now() - new Date(c.dob).getTime()) / 86400000) : 0
          const ageLabel = ageDays < 30 ? `${ageDays} дн` : ageDays < 365 ? `${Math.floor(ageDays / 30)} мес` : `${Math.floor(ageDays / 365)} г`
          return { name: c.name, age: ageLabel }
        })
        return {
          id: f.id,
          mother_name: '', // enriched by parent join
          journey_type: activeJourney ? (journeyLabels[activeJourney.type] || activeJourney.type) : '',
          last_visit: '',
          next_visit: '',
          children,
        }
      })
    }
    return [
      { id: 'p1', mother_name: 'Айгерим Касымова', journey_type: 'Беременность, 22 нед', last_visit: '2026-04-02', next_visit: '2026-04-16', children: [] as any[] },
      { id: 'p2', mother_name: 'Дана Нурланова', journey_type: 'Младенец, 3 мес', last_visit: '2026-03-25', next_visit: '2026-04-25', children: [{ name: 'Тимур', age: '3 мес' }] },
      { id: 'p3', mother_name: 'Мадина Ержанова', journey_type: 'Тоддлер, 14 мес', last_visit: '2026-03-10', next_visit: '2026-04-10', children: [{ name: 'Аян', age: '14 мес' }] },
      { id: 'p4', mother_name: 'Сара Абдикаримова', journey_type: 'Послеродовой, 6 нед', last_visit: '2026-03-28', next_visit: '2026-04-11', children: [{ name: 'Алия', age: '6 нед' }] },
    ]
  })

  const weeklyLoad = computed(() =>
    ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((d, i) => ({
      day: d,
      booked: Math.round(7 + 2 * Math.sin(i * 1.3)),
      total: 12,
    })),
  )

  // ═══════════════════════════════════
  //  ADMIN DATA (real from API, mock fallback)
  // ═══════════════════════════════════

  const adminKpi = computed(() => {
    if (_adminStats.value) {
      const s = _adminStats.value
      return {
        totalUsers: { value: s.totalUsers, trend: 12, sparkline: generateSparkline(7, Math.max(1, s.totalUsers - 5), 5) },
        activeFamilies: { value: s.totalFamilies, trend: 8, sparkline: generateSparkline(7, Math.max(1, s.totalFamilies - 3), 3) },
        totalDoctors: { value: s.totalDoctors, trend: 0, sparkline: generateSparkline(7, Math.max(1, s.totalDoctors), 1) },
        monthlyAppointments: { value: s.monthlyAppointments, trend: 15, sparkline: generateSparkline(7, Math.max(1, s.monthlyAppointments - 20), 15) },
      }
    }
    return {
      totalUsers: { value: 189, trend: 12, sparkline: generateSparkline(7, 180, 10) },
      activeFamilies: { value: 47, trend: 8, sparkline: generateSparkline(7, 44, 5) },
      totalDoctors: { value: 14, trend: 0, sparkline: generateSparkline(7, 14, 1) },
      monthlyAppointments: { value: 342, trend: 15, sparkline: generateSparkline(7, 320, 30) },
    }
  })

  // Admin users list (real data)
  const adminUsers = computed(() => _adminUsers.value)
  const adminUsersTotal = computed(() => _adminUsersTotal.value)

  const revenueMonthly = computed(() =>
    pastDays(180).filter((_, i) => i % 30 === 0).map((d, i) => ({
      month: formatDateRu(d),
      mrr: 1200000 + i * 180000 + randomInt(-50000, 50000),
      consultations: 400000 + i * 60000 + randomInt(-20000, 20000),
      packages: 600000 + i * 90000 + randomInt(-30000, 30000),
      lab: 200000 + i * 30000 + randomInt(-10000, 10000),
    })),
  )

  const retentionCohort = [
    { cohort: 'Янв 2026', m0: 100, m1: 92, m2: 87, m3: 84 },
    { cohort: 'Фев 2026', m0: 100, m1: 89, m2: 85 },
    { cohort: 'Мар 2026', m0: 100, m1: 91 },
    { cohort: 'Апр 2026', m0: 100 },
  ]

  const adherenceTrend = computed(() =>
    pastDays(30).map(d => ({ date: d, value: randomInt(85, 98) })),
  )

  const doctorPerformance = [
    { name: 'Д-р Касымова', specialty: 'Гинеколог', visits: 48, noShowRate: 5, avgDuration: 22, rating: 4.9, load: 85 },
    { name: 'Д-р Ибрагимов', specialty: 'УЗИ', visits: 36, noShowRate: 3, avgDuration: 18, rating: 4.7, load: 72 },
    { name: 'Д-р Жумабаева', specialty: 'Педиатр', visits: 52, noShowRate: 8, avgDuration: 20, rating: 4.8, load: 92 },
    { name: 'Д-р Омаров', specialty: 'Невролог', visits: 28, noShowRate: 12, avgDuration: 25, rating: 4.5, load: 60 },
  ]

  const capacityHeatmap = Array.from({ length: 7 * 9 }, (_, i) => ({
    value: randomInt(0, 12),
    label: `${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i % 7]} ${9 + Math.floor(i / 7)}:00`,
  }))

  const complianceOverall = 82
  const complianceProtocols = [
    { name: 'Скрининг 1 триместр', completion: 95 },
    { name: 'Скрининг 2 триместр', completion: 88 },
    { name: 'ОАК ежеквартально', completion: 76 },
    { name: 'Вакцинация 0–6 мес', completion: 91 },
    { name: 'Осмотр педиатра ежемесячно', completion: 84 },
    { name: 'Допплерометрия 28 нед', completion: 67 },
  ]

  const npsScore = 72
  const npsSplit = { promoters: 58, passives: 28, detractors: 14 }

  return reactive({
    // Meta
    loading,
    initialized,
    fetchAll,
    // Family
    familyKpi, journeyEvents, prescriptions, appointments,
    adherenceWeekly, adherenceMonthly, vaccinations,
    growthData, milestones, moodHistory, lastEpds,
    sleepWeek, sleepLogsToday, feedingToday, foodIntros, streaks, achievements,
    referral, educationArticles, children,
    // Coordinator
    coordinatorKpi, families, coordinatorTasks, tasksByType,
    // Doctor
    doctorKpi, todaySchedule, doctorPatients, weeklyLoad,
    // Admin
    adminKpi, adminUsers, adminUsersTotal, fetchAdminUsers,
    revenueMonthly, retentionCohort, adherenceTrend,
    doctorPerformance, capacityHeatmap, complianceOverall,
    complianceProtocols, npsScore, npsSplit,
    // Expose fetchers for interactive use
    fetchDoctorSchedule, fetchVaccinations, fetchSleepLogsToday, fetchFoodIntros,
  })
}
