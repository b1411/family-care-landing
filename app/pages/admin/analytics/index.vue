<template>
  <div class="analytics-page">
    <header class="page-header">
      <NuxtLink to="/admin" class="back-link">
        <Icon name="lucide:chevron-left" size="16" /> Назад
      </NuxtLink>
      <h1 class="page-title">Аналитика</h1>
    </header>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Конверсия маршрутов</span>
          <Icon name="lucide:trending-up" size="16" class="kpi-trend up" />
        </div>
        <div class="kpi-value">{{ dashboard.journey_completion_rate || 0 }}%</div>
        <p class="kpi-desc">Завершённых маршрутов от общего числа</p>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Адгеренс назначений</span>
        </div>
        <div class="kpi-value">{{ dashboard.avg_adherence || 0 }}%</div>
        <p class="kpi-desc">Среднее соблюдение приёма витаминов</p>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">NPS</span>
        </div>
        <div class="kpi-value">{{ dashboard.nps_score || '—' }}</div>
        <p class="kpi-desc">Net Promoter Score</p>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Активных семей</span>
        </div>
        <div class="kpi-value">{{ dashboard.active_families || 0 }}</div>
        <p class="kpi-desc">За последние 30 дней</p>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Средний чек</span>
        </div>
        <div class="kpi-value">{{ formatCurrency(dashboard.avg_revenue_per_family || 0) }}</div>
        <p class="kpi-desc">Доход на семью (₸)</p>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Повторные визиты</span>
        </div>
        <div class="kpi-value">{{ dashboard.retention_rate || 0 }}%</div>
        <p class="kpi-desc">Процент возврата семей</p>
      </div>
    </div>

    <!-- Coordinator Performance -->
    <section class="section">
      <h2 class="section-title">Результативность координаторов</h2>
      <div v-if="coordinatorStats.length" class="perf-list">
        <div v-for="c in coordinatorStats" :key="c.name" class="perf-row">
          <span class="perf-name">{{ c.name }}</span>
          <div class="perf-bar-wrap">
            <div class="perf-bar" :style="{ width: `${c.completion}%` }" />
          </div>
          <span class="perf-value">{{ c.completion }}%</span>
        </div>
      </div>
    </section>

    <!-- Doctor Performance -->
    <section class="section">
      <h2 class="section-title">Результативность врачей</h2>
      <div v-if="doctorStats.length" class="perf-list">
        <div v-for="d in doctorStats" :key="d.name" class="perf-row">
          <span class="perf-name">{{ d.name }}</span>
          <span class="perf-metric">{{ d.patients }} пациентов</span>
          <span class="perf-rating">★ {{ d.rating?.toFixed(1) || '—' }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '~/utils/formatters'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

const dashboard = reactive({
  journey_completion_rate: 0,
  avg_adherence: 0,
  nps_score: 0,
  active_families: 0,
  avg_revenue_per_family: 0,
  retention_rate: 0,
})

const coordinatorStats = ref<Array<{ name: string; completion: number }>>([])
const doctorStats = ref<Array<{ name: string; patients: number; rating: number }>>([])

onMounted(async () => {
  const clinicId = authStore.clinicId
  if (!clinicId) return

  // Try to fetch dashboard view
  const { data: dashData } = await supabase
    .from('v_clinic_dashboard')
    .select('*')
    .eq('clinic_id', clinicId)
    .single()

  if (dashData) Object.assign(dashboard, dashData)

  // Doctor performance view
  const { data: docPerf } = await supabase
    .from('v_doctor_performance')
    .select('*')
    .eq('clinic_id', clinicId)

  if (docPerf) {
    doctorStats.value = docPerf.map((d: Record<string, unknown>) => ({
      name: `${d.first_name || ''} ${d.last_name || ''}`.trim(),
      patients: (d.total_appointments as number) || 0,
      rating: (d.avg_rating as number) || 0,
    }))
  }
})
</script>

<style scoped>
.analytics-page { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.back-link { display: flex; align-items: center; gap: 4px; color: var(--color-text-secondary); text-decoration: none; font-size: 0.85rem; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; flex: 1; }

.kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 32px; }
.kpi-card {
  padding: 18px; background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
}
.kpi-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.kpi-label { font-size: 0.8rem; color: var(--color-text-secondary); font-weight: 500; }
.kpi-trend.up { color: var(--color-success); }
.kpi-value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-mono); }
.kpi-desc { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px; }

.section { margin-bottom: 28px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 12px; }

.perf-list { display: flex; flex-direction: column; gap: 10px; }
.perf-row { display: flex; align-items: center; gap: 12px; }
.perf-name { font-size: 0.85rem; font-weight: 500; min-width: 140px; }
.perf-bar-wrap { flex: 1; height: 8px; background: var(--color-primary-ultralight); border-radius: 4px; overflow: hidden; }
.perf-bar { height: 100%; background: var(--gradient-cta); border-radius: 4px; }
.perf-value { font-size: 0.85rem; font-weight: 600; color: var(--color-primary); min-width: 44px; text-align: right; }
.perf-metric { font-size: 0.8rem; color: var(--color-text-secondary); }
.perf-rating { font-size: 0.8rem; color: var(--color-warning); font-weight: 600; }
</style>
