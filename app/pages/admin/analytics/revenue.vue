<template>
  <div class="revenue-page">
    <header class="page-header">
      <h1 class="page-title">Revenue Intelligence</h1>
      <div class="period-selector">
        <button v-for="p in periods" :key="p.value" class="period-btn" :class="{ active: activePeriod === p.value }" @click="activePeriod = p.value; fetchData()">{{ p.label }}</button>
      </div>
    </header>

    <!-- KPI row -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-label">MRR</span>
        <span class="kpi-value">{{ formatCurrency(kpi.mrr) }}</span>
        <span class="kpi-delta positive">+{{ kpi.mrrGrowth }}%</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">ARPU</span>
        <span class="kpi-value">{{ formatCurrency(kpi.arpu) }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Avg LTV</span>
        <span class="kpi-value">{{ formatCurrency(kpi.ltv) }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Churn Rate</span>
        <span class="kpi-value">{{ kpi.churnRate }}%</span>
        <span class="kpi-delta negative" v-if="kpi.churnRate > 5">Высокий</span>
      </div>
    </div>

    <!-- Revenue by source -->
    <section class="section">
      <h2 class="section-title">Доход по источникам</h2>
      <div class="revenue-bars">
        <div v-for="src in revenueSources" :key="src.name" class="bar-row">
          <span class="bar-label">{{ src.name }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: `${src.pct}%` }" />
          </div>
          <span class="bar-value">{{ formatCurrency(src.amount) }}</span>
        </div>
      </div>
    </section>

    <!-- Doctor revenue -->
    <section class="section">
      <h2 class="section-title">Доход по врачам</h2>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Врач</th>
              <th>Приёмы</th>
              <th>Доход</th>
              <th>Средний чек</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in doctorRevenue" :key="doc.id">
              <td class="doc-name">{{ doc.name }}</td>
              <td>{{ doc.visits }}</td>
              <td>{{ formatCurrency(doc.revenue) }}</td>
              <td>{{ formatCurrency(doc.avgCheck) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Forecast -->
    <section class="section">
      <h2 class="section-title">Прогноз на 3 месяца</h2>
      <div class="forecast-grid">
        <div v-for="f in forecast" :key="f.month" class="forecast-card">
          <span class="forecast-month">{{ f.month }}</span>
          <span class="forecast-value">{{ formatCurrency(f.predicted) }}</span>
          <span class="forecast-label">прогноз</span>
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
const activePeriod = ref('month')

const periods = [
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
  { label: 'Квартал', value: 'quarter' },
]

const kpi = reactive({ mrr: 0, mrrGrowth: 0, arpu: 0, ltv: 0, churnRate: 0 })
const revenueSources = ref<Array<{ name: string; amount: number; pct: number }>>([])
const doctorRevenue = ref<Array<{ id: string; name: string; visits: number; revenue: number; avgCheck: number }>>([])
const forecast = ref<Array<{ month: string; predicted: number }>>([])

async function fetchData() {
  if (!authStore.clinicId) return

  // Revenue KPIs from analytics view
  const { data: stats } = await supabase
    .from('v_clinic_revenue')
    .select('*')
    .eq('clinic_id', authStore.clinicId)
    .single()

  if (stats) {
    kpi.mrr = (stats as Record<string, number>).mrr || 0
    kpi.mrrGrowth = (stats as Record<string, number>).mrr_growth || 0
    kpi.arpu = (stats as Record<string, number>).arpu || 0
    kpi.ltv = (stats as Record<string, number>).avg_ltv || 0
    kpi.churnRate = (stats as Record<string, number>).churn_rate || 0
  }

  // Revenue forecasts
  const { data: fc } = await supabase
    .from('revenue_forecasts')
    .select('*')
    .eq('clinic_id', authStore.clinicId)
    .order('month')
    .limit(3)

  forecast.value = (fc || []).map((f: Record<string, unknown>) => ({
    month: String(f.month),
    predicted: Number(f.predicted_revenue) || 0,
  }))
}

onMounted(fetchData)
</script>

<style scoped>
.revenue-page { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }

.period-selector { display: flex; gap: 6px; }
.period-btn { padding: 6px 14px; border: 1px solid var(--color-border); border-radius: 20px; background: var(--color-surface); font-size: 0.8rem; cursor: pointer; font-family: var(--font-body); }
.period-btn.active { border-color: var(--color-primary); background: var(--color-primary-ultralight); color: var(--color-primary); font-weight: 600; }

.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 28px; }
.kpi-card { padding: 18px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 4px; }
.kpi-label { font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
.kpi-value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-mono); }
.kpi-delta { font-size: 0.75rem; font-weight: 600; }
.kpi-delta.positive { color: var(--color-success); }
.kpi-delta.negative { color: var(--color-danger); }

.section { margin-bottom: 28px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 14px; }

.revenue-bars { display: flex; flex-direction: column; gap: 10px; }
.bar-row { display: flex; align-items: center; gap: 12px; }
.bar-label { width: 120px; font-size: 0.85rem; flex-shrink: 0; }
.bar-track { flex: 1; height: 20px; background: var(--color-border-light); border-radius: 10px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--gradient-cta); border-radius: 10px; transition: width 0.5s; }
.bar-value { width: 100px; text-align: right; font-size: 0.85rem; font-family: var(--font-mono); font-weight: 600; }

.table-container { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; padding: 8px 12px; border-bottom: 1px solid var(--color-border); }
.data-table td { padding: 10px 12px; border-bottom: 1px solid var(--color-border-light); font-size: 0.85rem; }
.doc-name { font-weight: 600; }

.forecast-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.forecast-card { padding: 20px; text-align: center; background: linear-gradient(135deg, rgba(139, 126, 200, 0.08), rgba(232, 160, 191, 0.08)); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); }
.forecast-month { font-size: 0.8rem; color: var(--color-text-secondary); display: block; }
.forecast-value { font-size: 1.3rem; font-weight: 700; font-family: var(--font-mono); display: block; margin: 4px 0; }
.forecast-label { font-size: 0.7rem; color: var(--color-text-muted); }
</style>
