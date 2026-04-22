<template>
  <div class="chief-doctors">
    <!-- Hero -->
    <div class="page-hero">
      <NuxtLink to="/chief" class="back-link">
        <Icon name="lucide:chevron-left" size="16" /> К качеству клиники
      </NuxtLink>
      <div class="hero-row">
        <div>
          <h1 class="hero-title">Врачи</h1>
          <p class="hero-sub">
            {{ doctors.length }} специалистов · профиль качества за 30 дней
          </p>
        </div>
        <div class="hero-legend">
          <span class="legend-item"><span class="dot good" /> ≥80% ведения</span>
          <span class="legend-item"><span class="dot warn" /> 40–79%</span>
          <span class="legend-item"><span class="dot low" /> &lt;40%</span>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <div class="search-box">
        <Icon name="lucide:search" size="16" class="search-icon" />
        <input v-model="search" type="text" placeholder="Поиск по врачу или специальности…" class="search-input" />
      </div>
      <div class="sort-group">
        <span class="sort-label">Сортировать:</span>
        <button
          v-for="s in sortOptions"
          :key="s.key"
          class="sort-btn"
          :class="{ active: sortKey === s.key }"
          @click="sortKey = s.key"
        >
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="skel skel-row" />
    </template>

    <!-- Empty -->
    <div v-else-if="!sorted.length" class="empty-state">
      <Icon name="lucide:stethoscope" size="36" />
      <p>Врачи не найдены</p>
    </div>

    <!-- List -->
    <div v-else class="doctor-list">
      <NuxtLink
        v-for="d in sorted"
        :key="d.id"
        :to="`/chief/doctors/${d.id}`"
        class="doctor-row"
      >
        <div class="row-left">
          <div class="avatar">{{ d.initials }}</div>
          <div class="meta">
            <div class="name">{{ d.name }}</div>
            <div class="sub">
              <span class="spec">{{ specLabel(d.specialty) }}</span>
              <span v-if="d.experience_years" class="sep">·</span>
              <span v-if="d.experience_years">{{ d.experience_years }} лет</span>
            </div>
          </div>
        </div>

        <!-- Quality cells -->
        <div class="cells">
          <div class="cell">
            <div class="cell-val">{{ d.appointments30d }}</div>
            <div class="cell-lbl">приёмов</div>
          </div>
          <div class="cell">
            <div class="cell-val">{{ d.avgDuration ?? '—' }}<span v-if="d.avgDuration" class="cell-unit">мин</span></div>
            <div class="cell-lbl">ср. длит.</div>
          </div>
          <div class="cell">
            <div class="cell-val" :class="icdClass(d.icdCoverage)">
              {{ d.icdCoverage === null ? '—' : `${d.icdCoverage}%` }}
            </div>
            <div class="cell-lbl">МКБ-10</div>
          </div>
          <div class="cell">
            <div class="cell-val">{{ d.activeRx }}</div>
            <div class="cell-lbl">назнач.</div>
          </div>
          <div class="cell">
            <div class="cell-val" :class="innClass(d.innCoverage)">
              {{ d.innCoverage === null ? '—' : `${d.innCoverage}%` }}
            </div>
            <div class="cell-lbl">с МНН</div>
          </div>
          <div class="cell">
            <div class="cell-val" :class="ratingClass(d.avgRating)">
              {{ d.avgRating?.toFixed(1) ?? '—' }}
            </div>
            <div class="cell-lbl">рейтинг</div>
          </div>
        </div>

        <Icon name="lucide:chevron-right" size="18" class="chevron" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

import dayjs from 'dayjs'

interface DoctorRow {
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

const sb = useSupabaseClient()
const loading = ref(true)
const doctors = ref<DoctorRow[]>([])
const search = ref('')
const sortKey = ref<'name' | 'appointments' | 'icd' | 'rating'>('appointments')

const sortOptions = [
  { key: 'appointments', label: 'По нагрузке' },
  { key: 'icd', label: 'По покрытию МКБ-10' },
  { key: 'rating', label: 'По рейтингу' },
  { key: 'name', label: 'По имени' },
] as const

function initials(name: string) {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function specLabel(s: string) {
  const map: Record<string, string> = {
    gynecologist: 'Гинеколог',
    pediatrician: 'Педиатр',
    neonatologist: 'Неонатолог',
    ultrasound: 'УЗИ',
    lab: 'Лаборатория',
    doctor: 'Врач',
    nurse: 'Медсестра',
  }
  return map[s] || s
}

function icdClass(v: number | null) {
  if (v === null) return 'muted'
  if (v >= 80) return 'good'
  if (v >= 40) return 'warn'
  return 'low'
}
function innClass(v: number | null) { return icdClass(v) }
function ratingClass(v: number | null) {
  if (v === null) return 'muted'
  if (v >= 4.5) return 'good'
  if (v >= 3.5) return 'warn'
  return 'low'
}

const sorted = computed(() => {
  const q = search.value.trim().toLowerCase()
  let items = doctors.value
  if (q) {
    items = items.filter(d =>
      d.name.toLowerCase().includes(q) ||
      specLabel(d.specialty).toLowerCase().includes(q),
    )
  }
  const arr = [...items]
  switch (sortKey.value) {
    case 'name':
      arr.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
      break
    case 'appointments':
      arr.sort((a, b) => b.appointments30d - a.appointments30d)
      break
    case 'icd':
      arr.sort((a, b) => (b.icdCoverage ?? -1) - (a.icdCoverage ?? -1))
      break
    case 'rating':
      arr.sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1))
      break
  }
  return arr
})

async function load() {
  const since = dayjs().subtract(30, 'day').format('YYYY-MM-DD')

  const { data: docs } = await sb
    .from('doctors')
    .select('id, specialty, experience_years, user_id, users!doctors_user_id_fkey(first_name, last_name)')
    .eq('is_active', true)

  if (!docs?.length) {
    loading.value = false
    return
  }

  const ids = docs.map((d: any) => d.id)

  // Appointments in last 30d
  const { data: appts } = await sb
    .from('appointments')
    .select('id, doctor_id, status, appointment_date, start_time, end_time, icd10_primary')
    .in('doctor_id', ids)
    .gte('appointment_date', since)

  // Active prescriptions
  const { data: rx } = await sb
    .from('prescriptions')
    .select('id, doctor_id, inn_name')
    .eq('is_active', true)
    .in('doctor_id', ids)

  // Ratings (via appointment_id)
  const apptIds = (appts ?? []).map(a => a.id)
  const { data: ratings } = apptIds.length
    ? await sb.from('visit_ratings').select('appointment_id, rating').in('appointment_id', apptIds)
    : { data: [] as { appointment_id: string; rating: number }[] }
  const apptToDoctor: Record<string, string> = {}
  ;(appts ?? []).forEach(a => { apptToDoctor[a.id] = a.doctor_id })
  const ratingBuckets: Record<string, number[]> = {}
  ;(ratings ?? []).forEach(r => {
    const docId = apptToDoctor[r.appointment_id]
    if (docId) (ratingBuckets[docId] ??= []).push(r.rating)
  })

  const byDoctor = {
    appt: new Map<string, typeof appts extends (infer U)[] | null ? U[] : never[]>(),
    rx: new Map<string, typeof rx extends (infer U)[] | null ? U[] : never[]>(),
  }
  ;(appts ?? []).forEach(a => {
    const arr = byDoctor.appt.get(a.doctor_id) ?? []
    arr.push(a)
    byDoctor.appt.set(a.doctor_id, arr as any)
  })
  ;(rx ?? []).forEach(r => {
    if (!r.doctor_id) return
    const arr = byDoctor.rx.get(r.doctor_id) ?? []
    arr.push(r)
    byDoctor.rx.set(r.doctor_id, arr as any)
  })

  doctors.value = docs.map((d: any) => {
    const u = d.users as { first_name?: string; last_name?: string } | null
    const name = `${u?.last_name || ''} ${u?.first_name || ''}`.trim() || 'Без имени'
    const apptList = byDoctor.appt.get(d.id) ?? []
    const rxList = byDoctor.rx.get(d.id) ?? []

    const completed = apptList.filter((a: any) => a.status === 'completed')
    const durations = completed
      .map((a: any) => diffMin(a.start_time, a.end_time))
      .filter((m: number | null): m is number => m !== null && m > 0)
    const avgDuration = durations.length
      ? Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length)
      : null
    const icdCoverage = apptList.length
      ? Math.round((apptList.filter((a: any) => a.icd10_primary).length / apptList.length) * 100)
      : null
    const innCoverage = rxList.length
      ? Math.round((rxList.filter((r: any) => r.inn_name).length / rxList.length) * 100)
      : null
    const ratingArr = ratingBuckets[d.id] ?? []
    const avgRating = ratingArr.length
      ? ratingArr.reduce((a, b) => a + b, 0) / ratingArr.length
      : null

    return {
      id: d.id,
      name,
      initials: initials(name),
      specialty: d.specialty,
      experience_years: d.experience_years,
      appointments30d: apptList.length,
      avgDuration,
      icdCoverage,
      activeRx: rxList.length,
      innCoverage,
      avgRating,
    }
  })

  loading.value = false
}

function diffMin(start?: string | null, end?: string | null): number | null {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if ([sh, sm, eh, em].some(n => Number.isNaN(n))) return null
  return (eh * 60 + em) - (sh * 60 + sm)
}

onMounted(load)
</script>

<style scoped>
.chief-doctors {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 1280px;
}

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
  margin-bottom: 8px;
}
.back-link:hover { color: var(--color-primary); }
.hero-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.hero-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.hero-sub {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 4px;
}
.hero-legend {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.72rem;
  color: var(--color-text-muted);
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.dot.good { background: #2d8560; }
.dot.warn { background: #d69432; }
.dot.low { background: #c85a6a; }

/* Controls */
.controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}
.search-box {
  position: relative;
  flex: 1;
  min-width: 240px;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}
.search-input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  font-size: 0.88rem;
  font-family: var(--font-body);
  outline: none;
  background: white;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: var(--color-primary); }

.sort-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}
.sort-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-right: 4px;
}
.sort-btn {
  padding: 6px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  background: white;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}
.sort-btn:hover { border-color: rgba(139, 126, 200, 0.4); }
.sort-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* List */
.doctor-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.doctor-row {
  display: grid;
  grid-template-columns: minmax(200px, 1.2fr) auto 20px;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-base);
}
.doctor-row:hover {
  border-color: rgba(139, 126, 200, 0.3);
  box-shadow: 0 6px 20px rgba(139, 126, 200, 0.08);
  transform: translateY(-1px);
}
.row-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.avatar {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--gradient-cta);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.meta { min-width: 0; }
.name {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sub {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  display: flex;
  gap: 4px;
}
.spec { color: var(--color-primary); font-weight: 500; }
.sep { opacity: 0.5; }

.cells {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 58px;
}
.cell-val {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text-primary);
  line-height: 1;
}
.cell-unit {
  font-family: var(--font-body);
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-left: 2px;
}
.cell-val.good { color: #2d8560; }
.cell-val.warn { color: #b27100; }
.cell-val.low { color: #c85a6a; }
.cell-val.muted { color: var(--color-text-muted); font-weight: 500; }
.cell-lbl {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
}

.chevron {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px;
  color: var(--color-text-muted);
  background: white;
  border: 1px dashed rgba(139, 126, 200, 0.18);
  border-radius: 16px;
}

/* Skeleton */
.skel {
  background: linear-gradient(90deg, rgba(139, 126, 200, 0.06), rgba(139, 126, 200, 0.12), rgba(139, 126, 200, 0.06));
  background-size: 200% 100%;
  animation: skel 1.4s ease-in-out infinite;
  border-radius: 14px;
}
.skel-row { height: 74px; }
@keyframes skel {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 900px) {
  .doctor-row {
    grid-template-columns: 1fr;
  }
  .cells {
    justify-content: flex-start;
    gap: 14px;
  }
  .chevron { display: none; }
}
</style>
