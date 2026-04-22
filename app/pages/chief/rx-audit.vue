<template>
  <div class="rx-audit">
    <!-- Hero -->
    <div class="page-hero">
      <NuxtLink to="/chief" class="back-link">
        <Icon name="lucide:chevron-left" size="16" /> К качеству клиники
      </NuxtLink>
      <div class="hero-row">
        <div>
          <h1 class="hero-title">Аудит назначений</h1>
          <p class="hero-sub">
            Все назначения клиники · {{ filtered.length }} из {{ all.length }}
          </p>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="stat-val" :class="innClass">{{ innCoverage }}%</span>
            <span class="stat-lbl">со структурированным МНН</span>
          </div>
          <div class="hero-stat">
            <span class="stat-val" :class="icdClass">{{ icdCoverage }}%</span>
            <span class="stat-lbl">с показанием МКБ-10</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="search-box">
        <Icon name="lucide:search" size="16" class="search-icon" />
        <input
          v-model="search"
          class="search-input"
          placeholder="Препарат, МНН или врач…"
          type="text"
        />
      </div>

      <select v-model="doctorFilter" class="select">
        <option value="">Все врачи</option>
        <option v-for="d in doctorOptions" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>

      <select v-model="periodFilter" class="select">
        <option value="30">30 дней</option>
        <option value="90">90 дней</option>
        <option value="365">Год</option>
        <option value="all">Всё время</option>
      </select>

      <div class="chip-filters">
        <button
          v-for="f in flagFilters"
          :key="f.key"
          class="chip"
          :class="{ active: activeFlags.includes(f.key) }"
          @click="toggleFlag(f.key)"
        >
          <Icon :name="f.icon" size="12" />
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div v-for="i in 5" :key="i" class="skel skel-row" />
    </template>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="empty-state">
      <Icon name="lucide:pill-off" size="36" />
      <p>Назначений под фильтры нет.</p>
    </div>

    <!-- List -->
    <div v-else class="rx-list">
      <div v-for="r in filtered" :key="r.id" class="rx-row">
        <div class="rx-left">
          <div class="rx-date">
            <div class="rx-date-day">{{ r.dayLabel }}</div>
            <div class="rx-date-year">{{ r.yearLabel }}</div>
          </div>
          <div class="rx-main">
            <div class="rx-title">
              {{ r.medication }}
              <span v-if="r.inn_name" class="rx-inn">{{ r.inn_name }}</span>
              <span v-if="r.doseLabel" class="rx-dose">{{ r.doseLabel }}</span>
              <span v-if="r.route" class="rx-route">{{ routeLabel(r.route) }}</span>
            </div>
            <div class="rx-meta">
              <span class="rx-doctor">{{ r.doctorName }}</span>
              <span v-if="r.patientLabel" class="rx-patient">· {{ r.patientLabel }}</span>
              <span v-if="r.icd10_indication" class="rx-icd">
                {{ r.icd10_indication }}
                <span v-if="icdMap[r.icd10_indication]"> — {{ icdMap[r.icd10_indication] }}</span>
              </span>
              <span v-if="r.frequency" class="rx-freq">· {{ r.frequency }}</span>
            </div>
          </div>
        </div>

        <div class="rx-right">
          <span v-if="!r.inn_name" class="flag flag-warn">без МНН</span>
          <span v-if="!r.icd10_indication" class="flag flag-warn">без показания</span>
          <span v-if="r.is_active" class="flag flag-ok">активное</span>
          <span v-else class="flag flag-muted">завершено</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

import dayjs from 'dayjs'
import 'dayjs/locale/ru'
dayjs.locale('ru')

interface PrescriptionRow {
  id: string
  medication: string
  inn_name: string | null
  dose_value: number | null
  dose_unit: string | null
  route: string | null
  frequency: string
  icd10_indication: string | null
  doctor_id: string | null
  is_active: boolean | null
  start_date: string
  doctorName: string
  patientLabel: string
  dayLabel: string
  yearLabel: string
  doseLabel: string
}

const sb = useSupabaseClient()
const loading = ref(true)
const all = ref<PrescriptionRow[]>([])
const icdMap = ref<Record<string, string>>({})
const doctorOptions = ref<Array<{ id: string; name: string }>>([])

const search = ref('')
const doctorFilter = ref('')
const periodFilter = ref<'30' | '90' | '365' | 'all'>('90')
const activeFlags = ref<string[]>([])

const flagFilters = [
  { key: 'no_inn', label: 'Без МНН', icon: 'lucide:alert-triangle' },
  { key: 'no_icd', label: 'Без показания', icon: 'lucide:alert-triangle' },
  { key: 'active', label: 'Только активные', icon: 'lucide:check-circle-2' },
] as const

function toggleFlag(k: string) {
  if (activeFlags.value.includes(k)) {
    activeFlags.value = activeFlags.value.filter(x => x !== k)
  }
  else {
    activeFlags.value = [...activeFlags.value, k]
  }
}

function routeLabel(r: string | null) {
  const map: Record<string, string> = {
    per_os: 'внутрь', im: 'в/м', iv: 'в/в', sc: 'п/к',
    topical: 'наружно', inhaled: 'ингал.', pr: 'ректально',
    ophthalmic: 'в глаз', otic: 'в ухо',
  }
  return r ? map[r] || r : ''
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return all.value.filter((r) => {
    if (doctorFilter.value && r.doctor_id !== doctorFilter.value) return false
    if (q) {
      const hay = `${r.medication} ${r.inn_name ?? ''} ${r.doctorName}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (activeFlags.value.includes('no_inn') && r.inn_name) return false
    if (activeFlags.value.includes('no_icd') && r.icd10_indication) return false
    if (activeFlags.value.includes('active') && !r.is_active) return false
    return true
  })
})

const innCoverage = computed(() => {
  const scope = filtered.value
  if (!scope.length) return 0
  return Math.round((scope.filter(r => r.inn_name).length / scope.length) * 100)
})
const icdCoverage = computed(() => {
  const scope = filtered.value
  if (!scope.length) return 0
  return Math.round((scope.filter(r => r.icd10_indication).length / scope.length) * 100)
})

function rateClass(v: number) {
  if (v >= 80) return 'good'
  if (v >= 40) return 'warn'
  return 'low'
}
const innClass = computed(() => rateClass(innCoverage.value))
const icdClass = computed(() => rateClass(icdCoverage.value))

async function load() {
  const cutoff = periodFilter.value === 'all'
    ? null
    : dayjs().subtract(Number(periodFilter.value), 'day').format('YYYY-MM-DD')

  let query = sb
    .from('prescriptions')
    .select(`
      id, medication, inn_name, dose_value, dose_unit, route, frequency,
      icd10_indication, doctor_id, is_active, start_date,
      doctor:doctors!doctor_id (
        id,
        user:users!user_id ( first_name, last_name )
      ),
      family:families!family_id (
        primary_parent:users!families_primary_parent_id_fkey ( first_name, last_name )
      ),
      child:child_profiles!child_id ( name )
    `)
    .order('start_date', { ascending: false })
    .limit(500)

  if (cutoff) query = query.gte('start_date', cutoff)

  const { data, error } = await query
  if (error) {
    loading.value = false
    return
  }

  const rows: PrescriptionRow[] = (data ?? []).map((r: any) => {
    const doc = Array.isArray(r.doctor) ? r.doctor[0] : r.doctor
    const docUser = doc?.user ? (Array.isArray(doc.user) ? doc.user[0] : doc.user) : null
    const fam = Array.isArray(r.family) ? r.family[0] : r.family
    const parent = fam?.primary_parent
      ? (Array.isArray(fam.primary_parent) ? fam.primary_parent[0] : fam.primary_parent)
      : null
    const child = Array.isArray(r.child) ? r.child[0] : r.child
    const patientLabel = child?.name
      ? `${child.name}`
      : parent
        ? `${parent.last_name ?? ''} ${parent.first_name ?? ''}`.trim()
        : ''
    const doctorName = docUser
      ? `${docUser.last_name ?? ''} ${docUser.first_name ?? ''}`.trim()
      : 'Без врача'
    const doseLabel = r.dose_value
      ? `${r.dose_value}${r.dose_unit ? ' ' + r.dose_unit : ''}`
      : ''
    const d = dayjs(r.start_date)
    return {
      id: r.id,
      medication: r.medication,
      inn_name: r.inn_name,
      dose_value: r.dose_value,
      dose_unit: r.dose_unit,
      route: r.route,
      frequency: r.frequency,
      icd10_indication: r.icd10_indication,
      doctor_id: r.doctor_id ?? doc?.id ?? null,
      is_active: r.is_active,
      start_date: r.start_date,
      doctorName,
      patientLabel,
      dayLabel: d.format('D MMM'),
      yearLabel: d.format('YYYY'),
      doseLabel,
    }
  })

  // Doctor options
  const docsMap = new Map<string, string>()
  rows.forEach((r) => {
    if (r.doctor_id && r.doctorName) docsMap.set(r.doctor_id, r.doctorName)
  })
  doctorOptions.value = Array.from(docsMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'))

  // ICD-10 names
  const codes = Array.from(new Set(rows.map(r => r.icd10_indication).filter(Boolean) as string[]))
  if (codes.length) {
    const { data: icd } = await sb
      .from('icd10_codes')
      .select('code, name_ru')
      .in('code', codes)
    ;(icd ?? []).forEach((c: any) => { icdMap.value[c.code] = c.name_ru })
  }

  all.value = rows
  loading.value = false
}

watch(periodFilter, () => {
  loading.value = true
  load()
})

onMounted(load)
</script>

<style scoped>
.rx-audit {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  margin: 0;
}
.hero-sub {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 4px;
}
.hero-stats { display: flex; gap: 20px; flex-wrap: wrap; }
.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 130px;
}
.stat-val {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
}
.stat-val.good { color: #2d8560; }
.stat-val.warn { color: #b27100; }
.stat-val.low { color: #c85a6a; }
.stat-lbl { font-size: 0.7rem; color: var(--color-text-muted); margin-top: 4px; }

/* Filters */
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.search-box {
  position: relative;
  flex: 1;
  min-width: 220px;
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
  font-size: 0.85rem;
  font-family: var(--font-body);
  outline: none;
  background: white;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: var(--color-primary); }

.select {
  padding: 10px 14px;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  font-size: 0.85rem;
  background: white;
  font-family: var(--font-body);
  cursor: pointer;
  color: var(--color-text-primary);
  min-width: 160px;
}

.chip-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  background: white;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}
.chip:hover { border-color: rgba(139, 126, 200, 0.35); }
.chip.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* List */
.rx-list { display: flex; flex-direction: column; gap: 6px; }
.rx-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: 14px;
}
.rx-left { display: flex; gap: 14px; align-items: flex-start; min-width: 0; flex: 1; }
.rx-date {
  flex-shrink: 0;
  text-align: center;
  min-width: 48px;
  padding: 6px 8px;
  background: rgba(139, 126, 200, 0.06);
  border-radius: 10px;
}
.rx-date-day {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary-dark);
  white-space: nowrap;
}
.rx-date-year {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  margin-top: 1px;
}
.rx-main { flex: 1; min-width: 0; }
.rx-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: baseline;
}
.rx-inn {
  font-weight: 500;
  font-size: 0.78rem;
  color: var(--color-primary);
}
.rx-dose { font-weight: 500; font-size: 0.78rem; color: var(--color-text-secondary); }
.rx-route {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  padding: 1px 7px;
  background: rgba(139, 126, 200, 0.06);
  border-radius: 10px;
}
.rx-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 0.76rem;
  color: var(--color-text-muted);
  margin-top: 3px;
}
.rx-doctor { font-weight: 500; color: var(--color-text-secondary); }
.rx-icd {
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary-dark);
  font-weight: 500;
}

.rx-right {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.flag {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.flag-ok { background: rgba(45, 133, 96, 0.12); color: #2d8560; }
.flag-warn { background: rgba(210, 140, 50, 0.14); color: #b27100; }
.flag-muted { background: rgba(123, 115, 148, 0.1); color: var(--color-text-muted); }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px;
  text-align: center;
  background: white;
  border: 1px dashed rgba(139, 126, 200, 0.18);
  border-radius: 16px;
  color: var(--color-text-muted);
}

.skel {
  background: linear-gradient(90deg, rgba(139, 126, 200, 0.06), rgba(139, 126, 200, 0.12), rgba(139, 126, 200, 0.06));
  background-size: 200% 100%;
  animation: skel 1.4s ease-in-out infinite;
  border-radius: 14px;
}
.skel-row { height: 72px; }
@keyframes skel {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
