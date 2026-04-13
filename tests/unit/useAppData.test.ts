import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Pinia stores
const mockJourneyStore = {
  events: [] as any[],
  progressPercent: 0,
  completedCount: 0,
  upcomingEvents: [] as any[],
  loading: false,
  fetchJourneys: vi.fn(),
}

const mockPrescriptionsStore = {
  prescriptions: [] as any[],
  activePrescriptions: [] as any[],
  todayDoses: [] as any[],
  adherencePercent: 0,
  loading: false,
  fetchPrescriptions: vi.fn(),
}

const mockAppointmentsStore = {
  appointments: [] as any[],
  loading: false,
  fetchAppointments: vi.fn(),
}

const mockNotifStore = {
  unreadCount: 0,
  fetchNotifications: vi.fn(),
}

const mockCoordinatorStore = {
  stats: { total_families: 0, today_appointments: 0 },
  criticalTasks: [] as any[],
  pendingTasks: [] as any[],
  tasks: [] as any[],
  families: [] as any[],
  fetchTasks: vi.fn(),
  fetchFamilies: vi.fn(),
  fetchStats: vi.fn(),
}

const mockAuthStore = {
  familyId: null as string | null,
  clinicId: null as string | null,
  role: 'mother',
  children: [] as any[],
  profile: null,
}

// Mock auto-imports
vi.stubGlobal('useJourneyStore', () => mockJourneyStore)
vi.stubGlobal('usePrescriptionStore', () => mockPrescriptionsStore)
vi.stubGlobal('useAppointmentStore', () => mockAppointmentsStore)
vi.stubGlobal('useNotificationStore', () => mockNotifStore)
vi.stubGlobal('useCoordinatorStore', () => mockCoordinatorStore)
vi.stubGlobal('useAuthStore', () => mockAuthStore)
vi.stubGlobal('ref', vi.fn((v) => ({ value: v })))
vi.stubGlobal('computed', vi.fn((fn) => ({ value: fn() })))
vi.stubGlobal('reactive', vi.fn((obj) => obj))
vi.stubGlobal('useState', vi.fn((_key: string, init: () => any) => ({ value: init() })))
vi.stubGlobal('useSupabaseClient', vi.fn(() => ({ from: vi.fn(() => ({ select: vi.fn() })) })))
vi.stubGlobal('watch', vi.fn())
vi.stubGlobal('onMounted', vi.fn())

describe('useAppData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockJourneyStore.events = []
    mockPrescriptionsStore.prescriptions = []
    mockAppointmentsStore.appointments = []
    mockAuthStore.familyId = null
    mockAuthStore.clinicId = null
    mockAuthStore.role = 'mother'
  })

  describe('familyKpi', () => {
    it('returns mock values when stores are empty', async () => {
      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()

      const kpi = data.familyKpi.value
      expect(kpi.journeyProgress.value).toBe(68)
      expect(kpi.adherence.value).toBe(94)
      expect(kpi.completedEvents).toBe(34)
      expect(kpi.totalEvents).toBe(50)
    })

    it('uses real store data when events exist', async () => {
      mockJourneyStore.events = [
        { id: '1', status: 'completed', is_mandatory: true },
        { id: '2', status: 'upcoming', is_mandatory: true },
      ] as any[]
      mockJourneyStore.progressPercent = 50
      mockJourneyStore.completedCount = 1

      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()

      const kpi = data.familyKpi.value
      expect(kpi.journeyProgress.value).toBe(50)
      expect(kpi.completedEvents).toBe(1)
      expect(kpi.totalEvents).toBe(2)
    })

    it('uses real adherence from prescriptions store', async () => {
      mockPrescriptionsStore.prescriptions = [{ id: 'rx1' }] as any[]
      mockPrescriptionsStore.adherencePercent = 87

      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()

      expect(data.familyKpi.value.adherence.value).toBe(87)
    })
  })

  describe('journeyEvents', () => {
    it('returns fallback mock events when store is empty', async () => {
      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()

      expect(data.journeyEvents.value.length).toBe(5)
      expect(data.journeyEvents.value[0].title).toBe('УЗИ 2 триместра')
    })

    it('maps store events when available', async () => {
      mockJourneyStore.events = [
        { id: 'e1', title: 'Тест', description: 'Описание', type: 'checkup', status: 'due', due_date: '2026-04-10', is_mandatory: true },
      ] as any[]

      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()

      expect(data.journeyEvents.value.length).toBe(1)
      expect(data.journeyEvents.value[0].title).toBe('Тест')
    })
  })

  describe('prescriptions', () => {
    it('returns default prescriptions when empty', async () => {
      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()

      expect(data.prescriptions.value.length).toBe(4)
      expect(data.prescriptions.value[0].medication).toBe('Витамин D3')
    })
  })

  describe('appointments', () => {
    it('returns default appointments when empty', async () => {
      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()

      expect(data.appointments.value.length).toBe(3)
    })
  })

  describe('coordinator data', () => {
    it('returns mock coordinator KPI when stats empty', async () => {
      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()

      expect(data.coordinatorKpi.value.activeFamilies.value).toBe(47)
      expect(data.coordinatorKpi.value.criticalTasks.value).toBe(5)
    })

    it('uses real coordinator stats', async () => {
      mockCoordinatorStore.stats = { total_families: 55, today_appointments: 8 }
      mockCoordinatorStore.criticalTasks = [{ id: '1' }, { id: '2' }] as any[]
      mockCoordinatorStore.pendingTasks = [{ id: '1' }, { id: '2' }, { id: '3' }] as any[]

      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()

      expect(data.coordinatorKpi.value.activeFamilies.value).toBe(55)
      expect(data.coordinatorKpi.value.criticalTasks.value).toBe(2)
      expect(data.coordinatorKpi.value.pendingTasks.value).toBe(3)
    })
  })

  describe('fetchAll', () => {
    it('fetches family data for mother role', async () => {
      mockAuthStore.familyId = 'fam-123'
      mockAuthStore.role = 'mother'

      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()

      await data.fetchAll()

      expect(mockJourneyStore.fetchJourneys).toHaveBeenCalledWith('fam-123')
      expect(mockPrescriptionsStore.fetchPrescriptions).toHaveBeenCalledWith('fam-123')
      expect(mockAppointmentsStore.fetchAppointments).toHaveBeenCalledWith('fam-123')
    })

    it('fetches coordinator data for coordinator role', async () => {
      mockAuthStore.clinicId = 'clinic-1'
      mockAuthStore.role = 'coordinator'

      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()

      await data.fetchAll()

      expect(mockCoordinatorStore.fetchTasks).toHaveBeenCalledWith('clinic-1')
      expect(mockCoordinatorStore.fetchFamilies).toHaveBeenCalledWith('clinic-1')
    })
  })

  describe('static data', () => {
    it('has vaccinations', async () => {
      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()
      expect(data.vaccinations.value.length).toBeGreaterThan(0)
    })

    it('has growth data', async () => {
      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()
      expect(data.growthData.value.months.length).toBe(7)
      expect(data.growthData.value.weight.length).toBe(7)
    })

    it('has milestones', async () => {
      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()
      expect(data.milestones.value.length).toBe(8)
    })

    it('has achievements', async () => {
      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()
      expect(data.achievements.value.length).toBe(6)
    })

    it('has education articles', async () => {
      const { useAppData } = await import('../../app/composables/useAppData')
      const data = useAppData()
      expect(data.educationArticles.value.length).toBe(6)
    })
  })
})
