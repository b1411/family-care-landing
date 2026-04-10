<template>
  <div class="page">
    <div class="page-hero">
      <NuxtLink to="/admin" class="back-link"><Icon name="lucide:chevron-left" size="16" /> Админ</NuxtLink>
      <h1 class="page-title"><Icon name="lucide:funnel" size="22" /> Воронка конверсии</h1>
      <p class="page-desc">Аналитика по лидам: источники, стадии, конверсия</p>
    </div>

    <div v-if="loading" class="card"><div class="empty-mini">Загрузка...</div></div>

    <template v-else>
      <!-- Funnel visual -->
      <div class="card">
        <h2 class="card-title"><Icon name="lucide:bar-chart-3" size="16" /> Воронка по стадиям</h2>
        <div class="funnel-chart">
          <div v-for="(stage, i) in funnelStages" :key="i" class="funnel-row">
            <span class="funnel-label">{{ stage.label }}</span>
            <div class="funnel-bar-wrap">
              <div class="funnel-bar" :style="{ width: stage.pct + '%' }" :class="stage.class" />
            </div>
            <span class="funnel-value">{{ stage.count }}</span>
            <span class="funnel-pct">{{ stage.pct }}%</span>
          </div>
        </div>
      </div>

      <!-- By source table -->
      <div class="card">
        <h2 class="card-title"><Icon name="lucide:pie-chart" size="16" /> По источникам</h2>
        <table class="funnel-table">
          <thead>
            <tr>
              <th>Источник</th>
              <th class="th-num">Всего</th>
              <th class="th-num">Новые</th>
              <th class="th-num">В работе</th>
              <th class="th-num">Выиграно</th>
              <th class="th-num">Потеряно</th>
              <th class="th-num">Конверсия</th>
              <th class="th-num">Ср. дней</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.source">
              <td class="td-source">{{ sourceLabel(r.source) }}</td>
              <td class="td-num">{{ r.total_leads }}</td>
              <td class="td-num">{{ r.stage_new }}</td>
              <td class="td-num">{{ (r.stage_contacted || 0) + (r.stage_interested || 0) + (r.stage_negotiation || 0) }}</td>
              <td class="td-num good-text">{{ r.stage_won }}</td>
              <td class="td-num warn-text">{{ r.stage_lost }}</td>
              <td class="td-num">
                <span class="conv-badge" :class="convClass(r.conversion_pct)">{{ r.conversion_pct ?? 0 }}%</span>
              </td>
              <td class="td-num">{{ r.avg_days_to_convert ?? '—' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td>Итого</td>
              <td class="td-num"><strong>{{ totals.total }}</strong></td>
              <td class="td-num">{{ totals.new }}</td>
              <td class="td-num">{{ totals.inProgress }}</td>
              <td class="td-num good-text"><strong>{{ totals.won }}</strong></td>
              <td class="td-num warn-text">{{ totals.lost }}</td>
              <td class="td-num"><span class="conv-badge" :class="convClass(totals.convPct)">{{ totals.convPct }}%</span></td>
              <td class="td-num">—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const loading = ref(true)
const rows = ref<any[]>([])

const totals = computed(() => {
  const t = { total: 0, new: 0, inProgress: 0, won: 0, lost: 0, convPct: 0 }
  for (const r of rows.value) {
    t.total += r.total_leads || 0
    t.new += r.stage_new || 0
    t.inProgress += (r.stage_contacted || 0) + (r.stage_interested || 0) + (r.stage_negotiation || 0)
    t.won += r.stage_won || 0
    t.lost += r.stage_lost || 0
  }
  t.convPct = t.total > 0 ? Math.round(100 * t.won / t.total) : 0
  return t
})

const funnelStages = computed(() => {
  const t = totals.value
  const max = t.total || 1
  return [
    { label: 'Новые', count: t.new, pct: Math.round(100 * t.new / max), class: 'c1' },
    { label: 'В работе', count: t.inProgress, pct: Math.round(100 * t.inProgress / max), class: 'c2' },
    { label: 'Выиграно', count: t.won, pct: Math.round(100 * t.won / max), class: 'c3' },
    { label: 'Потеряно', count: t.lost, pct: Math.round(100 * t.lost / max), class: 'c4' },
  ]
})

function sourceLabel(s: string) {
  const m: Record<string, string> = { website: 'Сайт', referral: 'Реферал', instagram: 'Instagram', whatsapp: 'WhatsApp', walk_in: 'Самотёк', advertisement: 'Реклама', other: 'Другое' }
  return m[s] || s
}
function convClass(pct: number | null) {
  if (!pct) return ''
  if (pct >= 30) return 'good'
  if (pct >= 15) return 'mid'
  return 'low'
}

onMounted(async () => {
  try {
    rows.value = await $fetch<any[]>('/api/admin/funnel')
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

.card { background: white; border: 1px solid var(--color-border-light); border-radius: 14px; padding: 18px; }
.card-title { font-size: 0.92rem; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
.empty-mini { text-align: center; padding: 24px; font-size: 0.82rem; color: var(--color-text-muted); }

/* Funnel chart */
.funnel-chart { display: flex; flex-direction: column; gap: 10px; }
.funnel-row { display: flex; align-items: center; gap: 10px; }
.funnel-label { font-size: 0.78rem; font-weight: 600; min-width: 80px; }
.funnel-bar-wrap { flex: 1; height: 28px; background: rgba(139,126,200,0.05); border-radius: 6px; overflow: hidden; }
.funnel-bar { height: 100%; border-radius: 6px; transition: width 0.5s ease; min-width: 2px; }
.funnel-bar.c1 { background: var(--color-primary); }
.funnel-bar.c2 { background: #6B9AC4; }
.funnel-bar.c3 { background: var(--color-success); }
.funnel-bar.c4 { background: var(--color-danger); opacity: 0.6; }
.funnel-value { font-family: var(--font-mono); font-weight: 700; font-size: 0.85rem; min-width: 30px; text-align: right; }
.funnel-pct { font-size: 0.72rem; color: var(--color-text-muted); min-width: 36px; text-align: right; }

/* Table */
.funnel-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.funnel-table th { text-align: left; font-size: 0.68rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; padding: 8px 10px; border-bottom: 2px solid var(--color-border-light); }
.funnel-table td { padding: 10px; border-bottom: 1px solid var(--color-border-light); }
.th-num, .td-num { text-align: center; }
.td-source { font-weight: 600; }
.good-text { color: var(--color-success); }
.warn-text { color: var(--color-danger); }

.conv-badge { padding: 2px 10px; border-radius: 8px; font-weight: 700; font-size: 0.78rem; }
.conv-badge.good { background: rgba(46,160,67,0.1); color: var(--color-success); }
.conv-badge.mid { background: rgba(245,158,11,0.1); color: #D97706; }
.conv-badge.low { background: rgba(212,114,124,0.1); color: var(--color-danger); }

.total-row { background: rgba(139,126,200,0.03); }
.total-row td { font-weight: 600; border-bottom: none; }
</style>
