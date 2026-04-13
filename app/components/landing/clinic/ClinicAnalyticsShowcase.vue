<template>
  <LandingUiSectionWrapper
    badge="Аналитика"
    title="Аналитика, которая меняет решения"
    subtitle="Прозрачные метрики для координаторов, менеджеров и директоров"
    alternate
  >
    <!-- KPI cards -->
    <div class="kpi-grid" data-stagger="scale-in">
      <div v-for="kpi in kpis" :key="kpi.label" class="kpi-card landing-card" data-tilt>
        <div class="kpi-header">
          <Icon :name="kpi.icon" class="kpi-icon" :style="{ color: kpi.color }" />
          <span class="kpi-trend" :style="{ color: kpi.trendUp ? 'var(--color-success)' : 'var(--color-danger)' }">
            <Icon :name="kpi.trendUp ? 'lucide:trending-up' : 'lucide:trending-down'" class="trend-icon" />
            {{ kpi.trend }}
          </span>
        </div>
        <div class="kpi-value font-display">
          <LandingUiAnimatedCounter :target="kpi.value" :suffix="kpi.suffix" />
        </div>
        <p class="kpi-label">{{ kpi.label }}</p>
      </div>
    </div>

    <!-- Dashboard mock -->
    <div ref="dashRef" class="dashboard-mock landing-card" data-reveal="blur-in" data-clip-reveal="inset">
      <div class="dmock-header">
        <div class="dmock-tabs">
          <button
            v-for="(tab, i) in dashTabs"
            :key="tab"
            :class="['dtab', { active: activeTab === i }]"
            @click="activeTab = i"
          >
            {{ tab }}
          </button>
        </div>
        <div class="dmock-period">
          <Icon name="lucide:calendar" class="period-icon" />
          Апрель 2025
        </div>
      </div>

      <Transition name="dash-fade" mode="out-in">
        <div :key="activeTab" class="dmock-body">
          <!-- Retention view -->
          <div v-if="activeTab === 0" class="retention-view">
            <div class="cohort-chart">
              <div v-for="cohort in cohorts" :key="cohort.month" class="cohort-row">
                <span class="cohort-month">{{ cohort.month }}</span>
                <div class="cohort-bar" :style="{ width: `${cohort.retention}%` }">
                  <span class="cohort-val">{{ cohort.retention }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tasks view -->
          <div v-else-if="activeTab === 1" class="tasks-view">
            <div v-for="task in tasks" :key="task.family" class="task-row">
              <div class="task-priority" :style="{ background: task.priorityColor }" />
              <div class="task-info">
                <span class="task-family">{{ task.family }}</span>
                <span class="task-desc">{{ task.desc }}</span>
              </div>
              <span class="task-due">{{ task.due }}</span>
            </div>
          </div>

          <!-- Metrics view -->
          <div v-else class="revenue-view">
            <div class="revenue-metrics">
              <div class="rev-metric">
                <span class="rev-label">Семей в маршруте</span>
                <span class="rev-val font-display">Демо</span>
              </div>
              <div class="rev-metric">
                <span class="rev-label">Конверсия в педиатрию</span>
                <span class="rev-val font-display">Воронка</span>
              </div>
              <div class="rev-metric">
                <span class="rev-label">Загрузка команды</span>
                <span class="rev-val font-display">Обзор</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Features list -->
    <div class="analytics-features" data-stagger="fade-up">
      <div v-for="f in features" :key="f.title" class="af-card landing-card hover-lift" data-tilt>
        <Icon :name="f.icon" class="af-icon" />
        <h4>{{ f.title }}</h4>
        <p>{{ f.desc }}</p>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useGsap } from '~/composables/useGsap'

const { gsap, ScrollTrigger } = useGsap()

const activeTab = ref(0)
const dashRef = ref<HTMLElement | null>(null)

// Animate cohort bars when tab switches to retention
watch(activeTab, (t) => {
  if (t === 0) animateCohorts()
  if (t === 1) animateTasks()
})

function animateCohorts() {
  nextTick(() => {
    if (!dashRef.value) return
    const bars = dashRef.value.querySelectorAll('.cohort-bar')
    bars.forEach((bar) => {
      const target = (bar as HTMLElement).style.width
      ;(bar as HTMLElement).style.width = '0%'
      gsap.to(bar, { width: target, duration: 0.8, ease: 'power2.out', stagger: 0.1 })
    })
  })
}

function animateTasks() {
  nextTick(() => {
    if (!dashRef.value) return
    const rows = dashRef.value.querySelectorAll('.task-row')
    gsap.fromTo(rows,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, stagger: 0.08, duration: 0.35, ease: 'power2.out' }
    )
  })
}

onMounted(() => {
  // Initial cohort bar animation on scroll
  if (!dashRef.value) return
  ScrollTrigger.create({
    trigger: dashRef.value,
    start: 'top 80%',
    once: true,
    onEnter: () => animateCohorts()
  })
})

const dashTabs = ['Удержание', 'Задачи', 'Доход']

const kpis = [
  { icon: 'lucide:users', value: 50, suffix: '+', label: 'Семей в маршруте', color: 'var(--color-primary)', trend: 'Демо', trendUp: true },
  { icon: 'lucide:calendar-check', value: 8, suffix: '', label: 'Модулей платформы', color: 'var(--color-secondary)', trend: '', trendUp: true },
  { icon: 'lucide:syringe', value: 18, suffix: '+', label: 'Прививок в календаре', color: 'var(--color-accent-blue)', trend: '', trendUp: true },
  { icon: 'lucide:route', value: 40, suffix: '+', label: 'Недель маршрута', color: 'var(--color-accent-warm)', trend: '', trendUp: true },
]

const cohorts = [
  { month: 'Янв 2025', retention: 92 },
  { month: 'Фев 2025', retention: 88 },
  { month: 'Мар 2025', retention: 85 },
  { month: 'Апр 2025', retention: 87 },
]

const tasks = [
  { family: 'Семья А.', desc: 'Пропущен скрининг 2 триместра', due: 'Просрочено', priorityColor: 'var(--color-danger)' },
  { family: 'Семья Б.', desc: 'Напомнить о вакцинации', due: 'Сегодня', priorityColor: 'var(--color-warning)' },
  { family: 'Семья В.', desc: 'Приём у педиатра назначен', due: 'Завтра', priorityColor: 'var(--color-success)' },
  { family: 'Семья Г.', desc: 'Загрузить результаты анализов', due: 'Через 3 дня', priorityColor: 'var(--color-accent-blue)' },
]

const features = [
  { icon: 'lucide:bar-chart-3', title: 'Когортный анализ', desc: 'Удержание по месяцам поступления. Видно, какие когорты держатся лучше.' },
  { icon: 'lucide:pie-chart', title: 'Конверсия воронки', desc: 'Беременность → Младенец → Малыш: где семьи «отваливаются» и почему.' },
  { icon: 'lucide:download', title: 'Экспорт отчётов', desc: 'PDF и CSV отчёты для руководства, инвесторов, аккредитации.' },
  { icon: 'lucide:zap', title: 'Обновления в реальном времени', desc: 'Данные обновляются через Supabase Realtime. Нет задержек.' },
]
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 40px;
}

.kpi-card {
  padding: 20px;
}

.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.kpi-icon {
  width: 24px;
  height: 24px;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
}

.trend-icon {
  width: 14px;
  height: 14px;
}

.kpi-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.kpi-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 6px 0 0;
}

.dashboard-mock {
  padding: 0;
  overflow: hidden;
  margin-bottom: 40px;
  transition: box-shadow 0.5s ease;
}
.dashboard-mock:hover {
  box-shadow: var(--shadow-hover), 0 0 50px rgba(139, 126, 200, 0.06);
}

.dmock-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border-light);
}

.dmock-tabs {
  display: flex;
  gap: 4px;
}

.dtab {
  padding: 6px 14px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.dtab:hover {
  background: var(--color-surface-alt);
}

.dtab.active {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.dmock-period {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.period-icon {
  width: 16px;
  height: 16px;
}

.dmock-body {
  padding: 24px;
  min-height: 220px;
}

.cohort-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.cohort-month {
  font-size: 13px;
  color: var(--color-text-secondary);
  width: 100px;
  flex-shrink: 0;
}

.cohort-bar {
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--gradient-accent);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  will-change: width;
}

.cohort-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.task-row:last-child {
  border-bottom: 0;
}

.task-priority {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: priorityPulse 2s ease-in-out infinite;
}
@keyframes priorityPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.7; }
}

.task-info {
  flex: 1;
}

.task-family {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: block;
}

.task-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.task-due {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.revenue-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.rev-metric {
  text-align: center;
}

.rev-label {
  font-size: 13px;
  color: var(--color-text-muted);
  display: block;
  margin-bottom: 8px;
}

.rev-val {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.analytics-features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.af-card {
  padding: 20px;
}

.af-icon {
  width: 24px;
  height: 24px;
  color: var(--color-primary);
  margin-bottom: 12px;
}

.af-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}

.af-card p {
  font-size: 13px;
  line-height: 160%;
  color: var(--color-text-secondary);
  margin: 0;
}

.dash-fade-enter-active,
.dash-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dash-fade-enter-from,
.dash-fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .analytics-features {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .analytics-features {
    grid-template-columns: 1fr 1fr;
  }
  .revenue-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
