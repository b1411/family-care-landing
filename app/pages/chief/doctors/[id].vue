<template>
  <div class="chief-doctor">
    <!-- Loading -->
    <template v-if="loading">
      <div class="skel skel-hero" />
      <div class="kpi-grid">
        <div v-for="i in 4" :key="i" class="skel skel-kpi" />
      </div>
      <div class="skel skel-card" />
    </template>

    <!-- Not found -->
    <div v-else-if="!doctor" class="empty-state">
      <Icon name="lucide:user-x" size="36" />
      <p>Врач не найден или находится вне вашей клиники.</p>
      <NuxtLink to="/chief/doctors" class="back-btn">К списку врачей</NuxtLink>
    </div>

    <template v-else>
      <!-- Hero -->
      <div class="page-hero">
        <NuxtLink to="/chief/doctors" class="back-link">
          <Icon name="lucide:chevron-left" size="16" /> К врачам
        </NuxtLink>
        <div class="hero-row">
          <div class="hero-left">
            <div class="avatar-lg">{{ doctor.initials }}</div>
            <div>
              <h1 class="hero-title">{{ doctor.name }}</h1>
              <p class="hero-sub">
                <span class="spec">{{ specLabel(doctor.specialty) }}</span>
                <span v-if="doctor.experience_years" class="sep">·</span>
                <span v-if="doctor.experience_years">{{ doctor.experience_years }} лет опыта</span>
              </p>
            </div>
          </div>
          <div v-if="doctor.avgRating !== null" class="hero-rating" :class="ratingClass(doctor.avgRating)">
            <Icon name="lucide:star" size="16" />
            {{ doctor.avgRating.toFixed(1) }}
          </div>
        </div>
      </div>

      <!-- KPIs 30d -->
      <section>
        <h2 class="section-title">Показатели качества (30 дней)</h2>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Приёмы</div>
            <div class="kpi-value">{{ doctor.appointments30d }}</div>
            <div class="kpi-hint">{{ completedCount }} завершено · {{ noShowCount }} no-show</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Средняя длительность</div>
            <div class="kpi-value">
              {{ doctor.avgDuration ?? '—' }}<span v-if="doctor.avgDuration" class="unit">мин</span>
            </div>
            <div class="kpi-hint">по завершённым приёмам</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Покрытие МКБ-10</div>
            <div class="kpi-value" :class="icdClass(doctor.icdCoverage)">
              {{ doctor.icdCoverage === null ? '—' : `${doctor.icdCoverage}%` }}
            </div>
            <div class="kpi-hint">{{ uniqueDiagnoses.size }} различных диагнозов</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Назначения</div>
            <div class="kpi-value">{{ doctor.activeRx }}</div>
            <div class="kpi-hint">
              <span :class="innClass(doctor.innCoverage)">
                {{ doctor.innCoverage === null ? '—' : `${doctor.innCoverage}%` }}
              </span>
              со структурированным МНН
            </div>
          </div>
        </div>
      </section>

      <!-- Appointments -->
      <section>
        <div class="section-head">
          <h2 class="section-title">Приёмы</h2>
          <div class="mini-filters">
            <button
              v-for="f in apptFilters"
              :key="f.key"
              class="mini-filter"
              :class="{ active: apptFilter === f.key }"
              @click="apptFilter = f.key"
            >{{ f.label }}</button>
          </div>
        </div>

        <div v-if="filteredAppointments.length" class="appt-list">
          <div v-for="a in filteredAppointments" :key="a.id" class="appt-row">
            <div class="appt-date">
              <div class="appt-date-day">{{ formatDay(a.appointment_date) }}</div>
              <div class="appt-date-time">{{ a.start_time?.slice(0, 5) }}</div>
            </div>
            <div class="appt-main">
              <div class="appt-title-row">
                <span class="appt-status" :class="`st-${a.status}`">{{ statusLabel(a.status) }}</span>
                <span v-if="a.icd10_primary" class="appt-icd">
                  {{ a.icd10_primary }}<span v-if="icdName(a.icd10_primary)"> — {{ icdName(a.icd10_primary) }}</span>
                </span>
                <span v-else class="appt-icd missing">МКБ-10 не указан</span>
              </div>
              <div v-if="a.reason" class="appt-reason">{{ a.reason }}</div>
            </div>
            <div class="appt-right">
              <span v-if="a.durationMin" class="appt-dur">{{ a.durationMin }} мин</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-inline">Приёмов за период нет.</div>
      </section>

      <!-- Prescriptions -->
      <section>
        <div class="section-head">
          <h2 class="section-title">Назначения</h2>
          <div class="mini-filters">
            <button
              class="mini-filter"
              :class="{ active: rxFilter === 'active' }"
              @click="rxFilter = 'active'"
            >Активные</button>
            <button
              class="mini-filter"
              :class="{ active: rxFilter === 'all' }"
              @click="rxFilter = 'all'"
            >Все</button>
          </div>
        </div>

        <div v-if="filteredRx.length" class="rx-list">
          <div v-for="r in filteredRx" :key="r.id" class="rx-row">
            <div class="rx-left">
              <div class="rx-name">
                {{ r.medication }}
                <span v-if="r.inn_name" class="rx-inn">({{ r.inn_name }})</span>
              </div>
              <div class="rx-meta">
                <span v-if="r.dose_value">{{ r.dose_value }} {{ r.dose_unit || '' }}</span>
                <span v-if="r.route" class="rx-route">{{ routeLabel(r.route) }}</span>
                <span class="rx-freq">{{ r.frequency }}</span>
                <span v-if="r.icd10_indication" class="rx-icd">{{ r.icd10_indication }}</span>
              </div>
            </div>
            <div class="rx-right">
              <span v-if="!r.inn_name" class="tag-warn">без МНН</span>
              <span v-if="r.is_active" class="tag-ok">активное</span>
              <span v-else class="tag-muted">завершено</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-inline">Назначений нет.</div>
      </section>

      <!-- Phase-2 placeholders -->
      <section class="phase-b-hint">
        <Icon name="lucide:lock" size="14" />
        Отклонения от протоколов и жалобы появятся после подключения библиотеки протоколов и сбора обращений.
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

import dayjs from 'dayjs'
import 'dayjs/locale/ru'
dayjs.locale('ru')

interface DoctorProfile {
  id: string
  name: string
  initials: string
  specialty: string
  experience_years: number | null
  appointments30d: number
  avgDuration: number | null
  icdCoverage: number | null
  activeRx: number
  innCoverage: number | null
  avgRating: number | null
}

interface AppointmentRow {
  id: string
  appointment_date: string
  start_time: string | null
  end_time: string | null
  status: string
  icd10_primary: string | null
  reason: string | null
  durationMin: number | null
}

interface PrescriptionRow {
  id: string
  medication: string
  inn_name: string | null
  dose_value: number | null
  dose_unit: string | null
  route: string | null
  frequency: string
  icd10_indication: string | null
  is_active: boolean | null
  start_date: string
  end_date: string | null
}

const route = useRoute()
const sb = useSupabaseClient()

const loading = ref(true)
const doctor = ref<DoctorProfile | null>(null)
const appointments = ref<AppointmentRow[]>([])
const prescriptions = ref<PrescriptionRow[]>([])
const icdMap = ref<Record<string, string>>({})

const apptFilter = ref<'all' | 'completed' | 'cancelled'>('all')
const rxFilter = ref<'active' | 'all'>('active')

const apptFilters = [
  { key: 'all', label: 'Все' },
  { key: 'completed', label: 'Завершённые' },
  { key: 'cancelled', label: 'Отменённые' },
] as const

const filteredAppointments = computed(() => {
  if (apptFilter.value === 'all') return appointments.value
  if (apptFilter.value === 'completed')
    return appointments.value.filter(a => a.status === 'completed')
  return appointments.value.filter(a => ['cancelled', 'no_show'].includes(a.status))
})

const filteredRx = computed(() =>
  rxFilter.value === 'active'
    ? prescriptions.value.filter(r => r.is_active)
    : prescriptions.value,
)

const completedCount = computed(() =>
  appointments.value.filter(a => a.status === 'completed').length,
)
const noShowCount = computed(() =>
  appointments.value.filter(a => a.status === 'no_show').length,
)
const uniqueDiagnoses = computed(
  () => new Set(appointments.value.map(a => a.icd10_primary).filter(Boolean)),
)

function initials(name: string) {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
function specLabel(s: string) {
  const map: Record<string, string> = {
    gynecologist: 'Гинеколог', pediatrician: 'Педиатр', neonatologist: 'Неонатолог',
    ultrasound: 'УЗИ', lab: 'Лаборатория', doctor: 'Врач', nurse: 'Медсестра',
  }
  return map[s] || s
}
function statusLabel(s: string) {
  const map: Record<string, string> = {
    requested: 'запрошено', confirmed: 'подтв.', completed: 'завершено',
    cancelled: 'отменено', no_show: 'не пришёл', rescheduled: 'перенесено',
  }
  return map[s] || s
}
function routeLabel(r: string) {
  const map: Record<string, string> = {
    per_os: 'внутрь', im: 'в/м', iv: 'в/в', sc: 'п/к',
    topical: 'наружно', inhaled: 'ингал.', pr: 'ректально',
    ophthalmic: 'в глаз', otic: 'в ухо',
  }
  return map[r] || r
}
function icdName(code: string | null) {
  if (!code) return ''
  return icdMap.value[code] || ''
}
function icdClass(v: number | null) {
  if (v === null) return 'muted'
  if (v >= 80) return 'good'
  if (v >= 40) return 'warn'
  return 'low'
}
const innClass = icdClass
function ratingClass(v: number) {
  if (v >= 4.5) return 'rating-good'
  if (v >= 3.5) return 'rating-warn'
  return 'rating-low'
}
function formatDay(d: string) {
  return dayjs(d).format('D MMM')
}
function diffMin(start?: string | null, end?: string | null): number | null {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if ([sh, sm, eh, em].some(n => Number.isNaN(n))) return null
  return (eh * 60 + em) - (sh * 60 + sm)
}

async function load() {
  const id = route.params.id as string
  const since = dayjs().subtract(30, 'day').format('YYYY-MM-DD')

  const [doctorRes, apptRes, rxRes] = await Promise.all([
    sb.from('doctors')
      .select('id, specialty, experience_years, user_id, users!doctors_user_id_fkey(first_name, last_name)')
      .eq('id', id)
      .maybeSingle(),
    sb.from('appointments')
      .select('id, appointment_date, start_time, end_time, status, icd10_primary, reason')
      .eq('doctor_id', id)
      .gte('appointment_date', since)
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: false }),
    sb.from('prescriptions')
      .select('id, medication, inn_name, dose_value, dose_unit, route, frequency, icd10_indication, is_active, start_date, end_date')
      .eq('doctor_id', id)
      .order('start_date', { ascending: false }),
  ])

  const d: any = doctorRes.data
  if (!d) {
    loading.value = false
    return
  }

  const apptList = (apptRes.data ?? []).map((a: any) => ({
    ...a,
    durationMin: diffMin(a.start_time, a.end_time),
  })) as AppointmentRow[]
  const rxList = (rxRes.data ?? []) as PrescriptionRow[]

  // Load ICD name map for codes we actually reference
  const codes = new Set<string>()
  apptList.forEach(a => a.icd10_primary && codes.add(a.icd10_primary))
  rxList.forEach(r => r.icd10_indication && codes.add(r.icd10_indication))
  if (codes.size) {
    const { data: icd } = await sb
      .from('icd10_codes')
      .select('code, name_ru')
      .in('code', Array.from(codes))
    ;(icd ?? []).forEach((c: any) => { icdMap.value[c.code] = c.name_ru })
  }

  // Ratings
  const apptIds = apptList.map(a => a.id)
  let avgRating: number | null = null
  if (apptIds.length) {
    const { data: ratings } = await sb
      .from('visit_ratings')
      .select('rating')
      .in('appointment_id', apptIds)
    if (ratings?.length) {
      avgRating = ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length
    }
  }

  const u = d.users as { first_name?: string; last_name?: string } | null
  const name = `${u?.last_name || ''} ${u?.first_name || ''}`.trim() || 'Без имени'
  const completed = apptList.filter(a => a.status === 'completed')
  const durations = completed.map(a => a.durationMin).filter((m): m is number => !!m && m > 0)
  const avgDuration = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : null
  const icdCoverage = apptList.length
    ? Math.round((apptList.filter(a => a.icd10_primary).length / apptList.length) * 100)
    : null
  const activeRxList = rxList.filter(r => r.is_active)
  const innCoverage = activeRxList.length
    ? Math.round((activeRxList.filter(r => r.inn_name).length / activeRxList.length) * 100)
    : null

  doctor.value = {
    id: d.id,
    name,
    initials: initials(name),
    specialty: d.specialty,
    experience_years: d.experience_years,
    appointments30d: apptList.length,
    avgDuration,
    icdCoverage,
    activeRx: activeRxList.length,
    innCoverage,
    avgRating,
  }
  appointments.value = apptList
  prescriptions.value = rxList

  loading.value = false
}

onMounted(load)
</script>

<style scoped>
.chief-doctor {
  display: flex;
  flex-direction: column;
  gap: 22px;
  max-width: 1100px;
}

/* Hero */
.page-hero {
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.08), rgba(232, 160, 191, 0.06));
  border: 1px solid rgba(139, 126, 200, 0.12);
  border-radius: 20px;
  padding: 22px 28px;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  text-decoration: none;
  margin-bottom: 10px;
}
.back-link:hover { color: var(--color-primary); }
.hero-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.hero-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.avatar-lg {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--gradient-cta);
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-primary);
}
.hero-sub {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 4px 0 0;
}
.spec { color: var(--color-primary); font-weight: 500; }
.sep { margin: 0 4px; opacity: 0.5; }

.hero-rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.15);
  font-weight: 600;
  font-size: 0.95rem;
}
.hero-rating.rating-good { color: #2d8560; border-color: rgba(45, 133, 96, 0.25); }
.hero-rating.rating-warn { color: #b27100; border-color: rgba(210, 140, 50, 0.25); }
.hero-rating.rating-low { color: #c85a6a; border-color: rgba(200, 90, 106, 0.25); }

/* Sections */
.section-title {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 12px;
}
.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.section-head .section-title { margin: 0; }

.mini-filters { display: flex; gap: 4px; flex-wrap: wrap; }
.mini-filter {
  padding: 4px 10px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  background: white;
  color: var(--color-text-muted);
  font-size: 0.7rem;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}
.mini-filter.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* KPI */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}
.kpi-card {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.1);
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.kpi-label { font-size: 0.75rem; color: var(--color-text-muted); }
.kpi-value {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}
.kpi-value .unit {
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-left: 3px;
}
.kpi-value.good { color: #2d8560; }
.kpi-value.warn { color: #b27100; }
.kpi-value.low { color: #c85a6a; }
.kpi-value.muted { color: var(--color-text-muted); font-weight: 500; }
.kpi-hint { font-size: 0.75rem; color: var(--color-text-secondary); }
.kpi-hint .good { color: #2d8560; font-weight: 600; }
.kpi-hint .warn { color: #b27100; font-weight: 600; }
.kpi-hint .low { color: #c85a6a; font-weight: 600; }
.kpi-hint .muted { color: var(--color-text-muted); }

/* Appointments list */
.appt-list, .rx-list { display: flex; flex-direction: column; gap: 4px; }
.appt-row {
  display: grid;
  grid-template-columns: 84px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: 12px;
}
.appt-date {
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 6px 10px;
  background: rgba(139, 126, 200, 0.06);
  border-radius: 10px;
}
.appt-date-day {
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--color-primary-dark);
}
.appt-date-time {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}
.appt-main { min-width: 0; }
.appt-title-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.appt-status {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.st-completed { background: rgba(45, 133, 96, 0.12); color: #2d8560; }
.st-confirmed { background: rgba(139, 126, 200, 0.12); color: var(--color-primary-dark); }
.st-requested { background: rgba(232, 160, 191, 0.14); color: #a7657f; }
.st-cancelled { background: rgba(200, 90, 106, 0.12); color: #c85a6a; }
.st-no_show { background: rgba(200, 90, 106, 0.12); color: #c85a6a; }
.st-rescheduled { background: rgba(210, 140, 50, 0.14); color: #b27100; }

.appt-icd {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}
.appt-icd.missing {
  color: #c85a6a;
  font-style: italic;
}
.appt-reason {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin-top: 3px;
}
.appt-right { color: var(--color-text-muted); font-size: 0.78rem; }

/* Rx */
.rx-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: 12px;
}
.rx-name { font-weight: 600; font-size: 0.92rem; color: var(--color-text-primary); }
.rx-inn { font-weight: 500; font-size: 0.78rem; color: var(--color-primary); margin-left: 4px; }
.rx-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 3px;
}
.rx-route { color: var(--color-text-secondary); }
.rx-icd {
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary-dark);
  font-weight: 500;
}
.rx-right { display: flex; gap: 6px; flex-wrap: wrap; }
.tag-ok, .tag-warn, .tag-muted {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.tag-ok { background: rgba(45, 133, 96, 0.12); color: #2d8560; }
.tag-warn { background: rgba(210, 140, 50, 0.14); color: #b27100; }
.tag-muted { background: rgba(123, 115, 148, 0.1); color: var(--color-text-muted); }

.empty-inline {
  padding: 18px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  background: rgba(139, 126, 200, 0.03);
  border: 1px dashed rgba(139, 126, 200, 0.15);
  border-radius: 12px;
}

.phase-b-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(139, 126, 200, 0.05);
  border: 1px dashed rgba(139, 126, 200, 0.2);
  border-radius: 12px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px;
  text-align: center;
  background: white;
  border: 1px dashed rgba(139, 126, 200, 0.18);
  border-radius: 16px;
  color: var(--color-text-muted);
}
.back-btn {
  margin-top: 8px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Skeleton */
.skel {
  background: linear-gradient(90deg, rgba(139, 126, 200, 0.06), rgba(139, 126, 200, 0.12), rgba(139, 126, 200, 0.06));
  background-size: 200% 100%;
  animation: skel 1.4s ease-in-out infinite;
  border-radius: 14px;
}
.skel-hero { height: 110px; }
.skel-kpi { height: 96px; }
.skel-card { height: 160px; }
@keyframes skel {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
