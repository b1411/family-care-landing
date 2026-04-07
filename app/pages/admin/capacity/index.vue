<template>
  <div class="capacity-page">
    <header class="page-header">
      <h1 class="page-title">Планирование мощности</h1>
    </header>

    <!-- Capacity overview -->
    <div class="capacity-grid">
      <div class="cap-card">
        <Icon name="lucide:users" size="20" class="cap-icon" />
        <div class="cap-value">{{ capacity.activeJourneys }}</div>
        <div class="cap-label">Активных маршрутов</div>
      </div>
      <div class="cap-card">
        <Icon name="lucide:calendar" size="20" class="cap-icon" />
        <div class="cap-value">{{ capacity.weeklySlots }}</div>
        <div class="cap-label">Слотов/нед</div>
      </div>
      <div class="cap-card">
        <Icon name="lucide:trending-up" size="20" class="cap-icon" />
        <div class="cap-value">{{ capacity.utilizationPct }}%</div>
        <div class="cap-label">Загрузка</div>
      </div>
      <div class="cap-card">
        <Icon name="lucide:alert-triangle" size="20" class="cap-icon warning" />
        <div class="cap-value">{{ capacity.bottlenecks }}</div>
        <div class="cap-label">Узкие места</div>
      </div>
    </div>

    <!-- Demand heatmap (simplified as a table) -->
    <section class="section">
      <h2 class="section-title">Загрузка по дням недели</h2>
      <div class="heatmap">
        <div v-for="day in weekDays" :key="day.name" class="heatmap-row">
          <span class="heatmap-day">{{ day.name }}</span>
          <div class="heatmap-cells">
            <div
              v-for="hour in day.hours"
              :key="hour.h"
              class="heatmap-cell"
              :class="heatLevel(hour.count)"
              :title="`${hour.h}:00 — ${hour.count} записей`"
            />
          </div>
        </div>
        <div class="heatmap-hours">
          <span v-for="h in timeLabels" :key="h">{{ h }}</span>
        </div>
      </div>
      <div class="heatmap-legend">
        <span class="legend-item"><span class="cell level-0" /> 0</span>
        <span class="legend-item"><span class="cell level-1" /> 1-2</span>
        <span class="legend-item"><span class="cell level-2" /> 3-5</span>
        <span class="legend-item"><span class="cell level-3" /> 6+</span>
      </div>
    </section>

    <!-- Forecast -->
    <section class="section">
      <h2 class="section-title">Прогноз спроса (30 дней)</h2>
      <div class="forecast-list">
        <div v-for="fc in demandForecast" :key="fc.week" class="forecast-row">
          <span class="fc-week">{{ fc.week }}</span>
          <div class="fc-bar-track">
            <div class="fc-bar-fill" :style="{ width: `${fc.pct}%` }" />
          </div>
          <span class="fc-value">{{ fc.predicted }} визитов</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

const capacity = reactive({
  activeJourneys: 0,
  weeklySlots: 0,
  utilizationPct: 0,
  bottlenecks: 0,
})

const weekDays = ref<Array<{ name: string; hours: Array<{ h: number; count: number }> }>>([])
const demandForecast = ref<Array<{ week: string; predicted: number; pct: number }>>([])
const timeLabels = ['9', '10', '11', '12', '13', '14', '15', '16', '17']

function heatLevel(count: number) {
  if (count >= 6) return 'level-3'
  if (count >= 3) return 'level-2'
  if (count >= 1) return 'level-1'
  return 'level-0'
}

onMounted(async () => {
  if (!authStore.clinicId) return

  const { data: cap } = await supabase
    .from('v_clinic_capacity')
    .select('*')
    .eq('clinic_id', authStore.clinicId)
    .single()

  if (cap) {
    const d = cap as Record<string, number>
    capacity.activeJourneys = d.active_journeys || 0
    capacity.weeklySlots = d.weekly_slots || 0
    capacity.utilizationPct = d.utilization_pct || 0
    capacity.bottlenecks = d.bottleneck_count || 0
  }

  // Simplified heatmap data
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  weekDays.value = days.map(name => ({
    name,
    hours: [9, 10, 11, 12, 13, 14, 15, 16, 17].map(h => ({ h, count: 0 })),
  }))

  const { data: heatData } = await supabase
    .from('v_appointment_heatmap')
    .select('*')
    .eq('clinic_id', authStore.clinicId)

  for (const row of (heatData || []) as Array<Record<string, number>>) {
    const dayIdx = (row.day_of_week || 1) - 1
    const hourIdx = (row.hour || 9) - 9
    if (weekDays.value[dayIdx]?.hours[hourIdx]) {
      weekDays.value[dayIdx].hours[hourIdx].count = row.appointment_count || 0
    }
  }

  // Demand forecast: count upcoming events per week for 4 weeks
  const now = new Date()
  const weeks: typeof demandForecast.value = []
  for (let w = 0; w < 4; w++) {
    const start = new Date(now)
    start.setDate(start.getDate() + w * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    const startStr = start.toISOString().slice(0, 10)
    const endStr = end.toISOString().slice(0, 10)

    const { count } = await supabase
      .from('journey_events')
      .select('id', { count: 'exact', head: true })
      .in('status', ['upcoming', 'due'])
      .gte('due_date', startStr)
      .lt('due_date', endStr)

    weeks.push({
      week: `${start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} — ${end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`,
      predicted: count || 0,
      pct: 0,
    })
  }
  const maxVal = Math.max(...weeks.map(w => w.predicted), 1)
  weeks.forEach(w => w.pct = Math.round((w.predicted / maxVal) * 100))
  demandForecast.value = weeks
})
</script>

<style scoped>
.capacity-page { max-width: 800px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }

.capacity-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 28px; }
.cap-card { padding: 18px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); text-align: center; }
.cap-icon { color: var(--color-primary); margin-bottom: 6px; }
.cap-icon.warning { color: var(--color-warning); }
.cap-value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-mono); }
.cap-label { font-size: 0.75rem; color: var(--color-text-secondary); }

.section { margin-bottom: 28px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 14px; }

.heatmap { display: flex; flex-direction: column; gap: 4px; }
.heatmap-row { display: flex; align-items: center; gap: 8px; }
.heatmap-day { width: 24px; font-size: 0.75rem; color: var(--color-text-secondary); }
.heatmap-cells { display: flex; gap: 3px; }
.heatmap-cell { width: 28px; height: 20px; border-radius: 3px; }
.heatmap-cell.level-0 { background: var(--color-border-light); }
.heatmap-cell.level-1 { background: rgba(139, 126, 200, 0.25); }
.heatmap-cell.level-2 { background: rgba(139, 126, 200, 0.55); }
.heatmap-cell.level-3 { background: var(--color-primary); }

.heatmap-hours { display: flex; gap: 3px; padding-left: 32px; }
.heatmap-hours span { width: 28px; text-align: center; font-size: 0.65rem; color: var(--color-text-muted); }

.heatmap-legend { display: flex; gap: 12px; margin-top: 8px; }
.legend-item { display: flex; align-items: center; gap: 4px; font-size: 0.7rem; color: var(--color-text-muted); }
.cell { width: 12px; height: 12px; border-radius: 2px; }

.forecast-list { display: flex; flex-direction: column; gap: 8px; }
.forecast-row { display: flex; align-items: center; gap: 12px; }
.fc-week { width: 100px; font-size: 0.85rem; flex-shrink: 0; }
.fc-bar-track { flex: 1; height: 12px; background: var(--color-border-light); border-radius: 6px; overflow: hidden; }
.fc-bar-fill { height: 100%; background: var(--gradient-cta); border-radius: 6px; }
.fc-value { width: 100px; text-align: right; font-size: 0.8rem; font-family: var(--font-mono); }
</style>
