<template>
  <div class="page">
    <div class="page-hero">
      <NuxtLink to="/admin" class="back-link"><Icon name="lucide:chevron-left" size="16" /> Админ</NuxtLink>
      <h1 class="page-title"><Icon name="lucide:bar-chart-3" size="22" /> Эффективность координаторов</h1>
      <p class="page-desc">SLA-мониторинг, нагрузка и KPI координаторов</p>
    </div>

    <!-- KPI Summary -->
    <div class="kpi-row" v-if="rows.length">
      <div class="kpi-card">
        <span class="kpi-label">Координаторов</span>
        <span class="kpi-value">{{ rows.length }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Ср. SLA</span>
        <span class="kpi-value" :class="{ good: avgSla >= 90, mid: avgSla >= 70 && avgSla < 90, low: avgSla < 70 }">{{ avgSla }}%</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Ср. отклик</span>
        <span class="kpi-value">{{ avgResponse }} мин</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Нарушений SLA</span>
        <span class="kpi-value" :class="{ low: totalBreaches > 0 }">{{ totalBreaches }}</span>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="loading" class="empty-mini">Загрузка...</div>
      <div v-else-if="!rows.length" class="empty-mini">Координаторов нет</div>
      <table v-else class="perf-table">
        <thead>
          <tr>
            <th>Координатор</th>
            <th class="th-num">Семей</th>
            <th class="th-num">Ожидающих</th>
            <th class="th-num">Выполнено</th>
            <th class="th-num">SLA %</th>
            <th class="th-num">Нарушения</th>
            <th class="th-num">Отклик (мин)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.coordinator_id">
            <td class="td-name">{{ r.last_name }} {{ r.first_name }}</td>
            <td class="td-num">{{ r.active_families }}</td>
            <td class="td-num">
              <span :class="{ 'warn-text': r.pending_tasks > 10 }">{{ r.pending_tasks }}</span>
            </td>
            <td class="td-num">{{ r.completed_this_month }}</td>
            <td class="td-num">
              <span class="sla-badge" :class="slaBadgeClass(r.sla_compliance_pct)">
                {{ r.sla_compliance_pct ?? '—' }}{{ r.sla_compliance_pct !== null ? '%' : '' }}
              </span>
            </td>
            <td class="td-num">
              <span :class="{ 'warn-text': r.sla_breaches_this_month > 0 }">{{ r.sla_breaches_this_month }}</span>
            </td>
            <td class="td-num">
              <span class="response-val" :class="responseClass(r.avg_response_minutes)">
                {{ r.avg_response_minutes ?? '—' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Legend -->
    <div class="legend">
      <span><span class="dot good" /> SLA ≥ 90%</span>
      <span><span class="dot mid" /> SLA 70–89%</span>
      <span><span class="dot low" /> SLA &lt; 70%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const loading = ref(true)
const rows = ref<any[]>([])

const avgSla = computed(() => {
  const valid = rows.value.filter(r => r.sla_compliance_pct !== null)
  if (!valid.length) return 0
  return Math.round(valid.reduce((s, r) => s + (r.sla_compliance_pct || 0), 0) / valid.length)
})

const avgResponse = computed(() => {
  const valid = rows.value.filter(r => r.avg_response_minutes !== null)
  if (!valid.length) return '—'
  return Math.round(valid.reduce((s, r) => s + (r.avg_response_minutes || 0), 0) / valid.length)
})

const totalBreaches = computed(() => rows.value.reduce((s, r) => s + (r.sla_breaches_this_month || 0), 0))

function slaBadgeClass(pct: number | null) {
  if (pct === null) return ''
  if (pct >= 90) return 'good'
  if (pct >= 70) return 'mid'
  return 'low'
}

function responseClass(min: number | null) {
  if (min === null) return ''
  if (min <= 15) return 'good'
  if (min <= 60) return 'mid'
  return 'low'
}

onMounted(async () => {
  try {
    rows.value = await $fetch<any[]>('/api/admin/coordinators/performance')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }

.page-hero {
  background: linear-gradient(135deg, rgba(139,126,200,0.08), rgba(232,160,191,0.06));
  border: 1px solid rgba(139,126,200,0.12); border-radius: 16px; padding: 24px 28px;
}
.back-link { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--color-text-muted); text-decoration: none; margin-bottom: 10px; }
.page-title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.page-desc { font-size: 0.82rem; color: var(--color-text-muted); margin-top: 4px; }

.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
@media (max-width: 640px) { .kpi-row { grid-template-columns: 1fr 1fr; } }
.kpi-card { background: white; border: 1px solid var(--color-border-light); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.kpi-label { font-size: 0.68rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.kpi-value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-mono); }
.kpi-value.good { color: var(--color-success); }
.kpi-value.mid { color: var(--color-warning, #F59E0B); }
.kpi-value.low { color: var(--color-danger); }

.card { background: white; border: 1px solid var(--color-border-light); border-radius: 14px; padding: 18px; overflow-x: auto; }
.empty-mini { text-align: center; padding: 24px; font-size: 0.82rem; color: var(--color-text-muted); }

.perf-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.perf-table th { text-align: left; font-size: 0.68rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.03em; padding: 8px 10px; border-bottom: 2px solid var(--color-border-light); }
.perf-table td { padding: 10px; border-bottom: 1px solid var(--color-border-light); }
.th-num, .td-num { text-align: center; }
.td-name { font-weight: 600; }
.warn-text { color: var(--color-danger); font-weight: 600; }

.sla-badge { padding: 2px 10px; border-radius: 8px; font-weight: 700; font-size: 0.78rem; }
.sla-badge.good { background: rgba(46,160,67,0.1); color: var(--color-success); }
.sla-badge.mid { background: rgba(245,158,11,0.1); color: #D97706; }
.sla-badge.low { background: rgba(212,114,124,0.1); color: var(--color-danger); }

.response-val { font-family: var(--font-mono); font-weight: 600; }
.response-val.good { color: var(--color-success); }
.response-val.mid { color: #D97706; }
.response-val.low { color: var(--color-danger); }

.legend { display: flex; gap: 18px; font-size: 0.72rem; color: var(--color-text-muted); justify-content: center; }
.legend span { display: flex; align-items: center; gap: 5px; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot.good { background: var(--color-success); }
.dot.mid { background: #F59E0B; }
.dot.low { background: var(--color-danger); }
</style>
