<template>
  <div class="chief-page">
    <!-- Hero -->
    <div class="chief-hero">
      <div class="hero-top">
        <div>
          <h1 class="chief-hero-title">Качество клиники</h1>
          <p class="chief-hero-sub">{{ todayStr }} · сводка за последние 30 дней</p>
        </div>
        <div class="hero-chip" :class="statusClass">
          <span class="chip-dot" />
          {{ statusLabel }}
        </div>
      </div>
    </div>

    <!-- Skeleton while loading -->
    <template v-if="loading">
      <div class="kpi-grid">
        <div v-for="i in 4" :key="i" class="skel skel-kpi" />
      </div>
      <div class="skel skel-card" />
    </template>

    <template v-else>
      <!-- Light (подключено) -->
      <section class="section">
        <h2 class="section-title">Подключено</h2>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Приёмы (30д)</div>
            <div class="kpi-value">{{ metrics.appointments30d }}</div>
            <div class="kpi-hint">{{ metrics.completedPct }}% завершено</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Активных назначений</div>
            <div class="kpi-value">{{ metrics.activeRx }}</div>
            <div class="kpi-hint">{{ metrics.rxWithInn }} со структурированным МНН</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Врачей в клинике</div>
            <div class="kpi-value">{{ metrics.activeDoctors }}</div>
            <div class="kpi-hint">{{ metrics.distinctSpecialties }} специализаций</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Приёмов с МКБ-10</div>
            <div class="kpi-value">{{ metrics.icdCoveragePct }}%</div>
            <div class="kpi-hint">чем выше, тем точнее аудит</div>
          </div>
        </div>
      </section>

      <!-- Quality signals (Phase-B) -->
      <section class="section">
        <h2 class="section-title">Сигналы качества</h2>
        <div class="kpi-grid">
          <NuxtLink to="/chief/deviations" class="kpi-card kpi-link">
            <div class="kpi-label">Отклонения от протоколов (30д)</div>
            <div class="kpi-value" :class="devClass">{{ signals.deviations30d }}</div>
            <div class="kpi-hint" :class="{ urgent: signals.openDeviations > 0 }">
              {{ signals.openDeviations }} открытых
            </div>
          </NuxtLink>
          <NuxtLink to="/chief/rx-audit" class="kpi-card kpi-link">
            <div class="kpi-label">Критические Rx-алерты</div>
            <div class="kpi-value" :class="alertClass">{{ signals.openCriticalAlerts }}</div>
            <div class="kpi-hint">открытых, требуют проверки</div>
          </NuxtLink>
          <NuxtLink to="/chief/complaints" class="kpi-card kpi-link">
            <div class="kpi-label">Жалобы в разборе</div>
            <div class="kpi-value" :class="complaintClass">{{ signals.openComplaints }}</div>
            <div class="kpi-hint">{{ signals.medicalComplaints30d }} медицинских за 30д</div>
          </NuxtLink>
          <NuxtLink to="/chief/case-reviews" class="kpi-card kpi-link">
            <div class="kpi-label">Кейсы на ревью</div>
            <div class="kpi-value" :class="caseClass">{{ signals.queuedCaseReviews }}</div>
            <div class="kpi-hint">в очереди на разбор</div>
          </NuxtLink>
        </div>
      </section>

      <!-- Onboarding hints -->
      <section class="section">
        <div class="info-card">
          <div class="info-title">
            <Icon name="lucide:compass" size="16" />
            Чтобы этот дашборд ожил
          </div>
          <ol class="info-list">
            <li>
              Попросите врачей указывать <b>МКБ-10</b> на каждом завершённом приёме
              — сейчас покрытие <b>{{ metrics.icdCoveragePct }}%</b>.
            </li>
            <li>
              Назначения без <b>МНН</b> не попадают в аудит. Структурированных назначений:
              <b>{{ metrics.rxWithInn }}</b> из <b>{{ metrics.activeRx }}</b>.
            </li>
            <li>
              Загрузите клинические протоколы клиники (МКБ-10 → чек-лист) —
              это включит ленту отклонений и разборы случаев.
            </li>
          </ol>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const loading = ref(true)

const metrics = reactive({
  appointments30d: 0,
  completedPct: 0,
  activeRx: 0,
  rxWithInn: 0,
  activeDoctors: 0,
  distinctSpecialties: 0,
  icdCoveragePct: 0,
})

const signals = reactive({
  deviations30d: 0,
  openDeviations: 0,
  openCriticalAlerts: 0,
  openComplaints: 0,
  medicalComplaints30d: 0,
  queuedCaseReviews: 0,
})

function urgencyClass(n: number, thresholds: { warn: number; high: number }) {
  if (n >= thresholds.high) return 'low'
  if (n >= thresholds.warn) return 'warn'
  return 'good'
}
const devClass = computed(() => signals.openDeviations > 0
  ? urgencyClass(signals.openDeviations, { warn: 5, high: 15 }) : 'muted')
const alertClass = computed(() => signals.openCriticalAlerts > 0 ? 'low' : 'muted')
const complaintClass = computed(() => urgencyClass(signals.openComplaints, { warn: 3, high: 10 }))
const caseClass = computed(() => urgencyClass(signals.queuedCaseReviews, { warn: 3, high: 10 }))

const todayStr = computed(() => dayjs().format('D MMMM YYYY'))

const statusLabel = computed(() => {
  if (metrics.icdCoveragePct >= 80) return 'В норме'
  if (metrics.icdCoveragePct >= 40) return 'Требует внимания'
  return 'Данных мало'
})
const statusClass = computed(() => {
  if (metrics.icdCoveragePct >= 80) return 'chip-ok'
  if (metrics.icdCoveragePct >= 40) return 'chip-warn'
  return 'chip-muted'
})

async function load() {
  const since = dayjs().subtract(30, 'day').format('YYYY-MM-DD')
  const sinceIso = dayjs().subtract(30, 'day').toISOString()

  // Phase-A metrics + Phase-B signals in parallel.
  // If Phase-B tables aren't yet present (migrations 022+), queries
  // silently fall back to zeros — the UI stays honest.
  const [apptsRes, rxRes, doctorsRes, devRes, alertsRes, compRes, caseRes, medCompRes] = await Promise.all([
    supabase.from('appointments').select('id, status, icd10_primary').gte('appointment_date', since),
    supabase.from('prescriptions').select('id, inn_name').eq('is_active', true),
    supabase.from('doctors').select('id, specialty').eq('is_active', true),
    supabase.from('protocol_deviations').select('id, resolved').gte('detected_at', sinceIso),
    supabase.from('prescription_alerts').select('id').eq('status', 'open').eq('severity', 'critical'),
    supabase.from('complaints').select('id').in('status', ['new', 'in_review']),
    supabase.from('case_reviews').select('id').eq('status', 'queued'),
    supabase.from('complaints').select('id').eq('kind', 'medical').gte('created_at', sinceIso),
  ])

  const appts = apptsRes.data ?? []
  metrics.appointments30d = appts.length
  metrics.completedPct = appts.length
    ? Math.round((appts.filter(a => a.status === 'completed').length / appts.length) * 100)
    : 0
  metrics.icdCoveragePct = appts.length
    ? Math.round((appts.filter(a => a.icd10_primary).length / appts.length) * 100)
    : 0

  const rx = rxRes.data ?? []
  metrics.activeRx = rx.length
  metrics.rxWithInn = rx.filter(r => r.inn_name).length

  const doctors = doctorsRes.data ?? []
  metrics.activeDoctors = doctors.length
  metrics.distinctSpecialties = new Set(doctors.map(d => d.specialty)).size

  // Phase-B signals — silent zeros if tables absent / RLS blocks
  const devs = devRes?.data ?? []
  signals.deviations30d = devs.length
  signals.openDeviations = devs.filter((d: any) => !d.resolved).length
  signals.openCriticalAlerts = alertsRes?.data?.length ?? 0
  signals.openComplaints = compRes?.data?.length ?? 0
  signals.queuedCaseReviews = caseRes?.data?.length ?? 0
  signals.medicalComplaints30d = medCompRes?.data?.length ?? 0

  loading.value = false
}

onMounted(load)
</script>

<style scoped>
.chief-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 1280px;
}

/* Hero */
.chief-hero {
  position: relative;
  padding: 28px 32px;
  border-radius: 20px;
  background: linear-gradient(120deg, rgba(139, 126, 200, 0.1), rgba(232, 160, 191, 0.08));
  border: 1px solid rgba(139, 126, 200, 0.12);
  overflow: hidden;
}
.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.chief-hero-title {
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.chief-hero-sub {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
}
.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(139, 126, 200, 0.18);
}
.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.chip-ok {
  color: #2d8560;
}
.chip-ok .chip-dot {
  background: #2d8560;
}
.chip-warn {
  color: #b27100;
}
.chip-warn .chip-dot {
  background: #d69432;
}
.chip-muted {
  color: var(--color-text-muted);
}
.chip-muted .chip-dot {
  background: var(--color-text-muted);
}

/* Sections */
.section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.section-title {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.section-note {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

/* KPI grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
.kpi-card {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.1);
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 1px 2px rgba(74, 68, 88, 0.04);
  transition: all var(--transition-base);
}
.kpi-card:hover {
  border-color: rgba(139, 126, 200, 0.25);
  box-shadow: 0 8px 24px rgba(139, 126, 200, 0.08);
}
.kpi-label {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 500;
}
.kpi-value {
  font-family: var(--font-display);
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}
.kpi-hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
.kpi-card.kpi-muted {
  background: rgba(139, 126, 200, 0.035);
  border-style: dashed;
}
.kpi-card.kpi-muted .kpi-value {
  color: var(--color-text-muted);
}
.kpi-card.kpi-link {
  text-decoration: none;
  color: inherit;
}
.kpi-card.kpi-link:hover {
  transform: translateY(-1px);
  border-color: rgba(139, 126, 200, 0.3);
}
.kpi-value.good { color: #2d8560; }
.kpi-value.warn { color: #b27100; }
.kpi-value.low { color: #c85a6a; }
.kpi-value.muted { color: var(--color-text-muted); }
.kpi-hint.urgent { color: #c85a6a; font-weight: 600; }

/* Info card */
.info-card {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.12);
  border-radius: 16px;
  padding: 20px 24px;
}
.info-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--color-primary-dark);
  margin-bottom: 10px;
}
.info-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  line-height: 1.55;
}

/* Skeleton */
.skel {
  background: linear-gradient(90deg, rgba(139, 126, 200, 0.08), rgba(139, 126, 200, 0.14), rgba(139, 126, 200, 0.08));
  background-size: 200% 100%;
  animation: skel 1.4s ease-in-out infinite;
  border-radius: 16px;
}
.skel-kpi {
  height: 98px;
}
.skel-card {
  height: 140px;
}
@keyframes skel {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
