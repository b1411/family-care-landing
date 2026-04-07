<template>
  <div class="journey-detail">
    <header class="journey-header">
      <NuxtLink to="/family" class="back-link">
        <Icon name="lucide:chevron-left" size="16" /> Назад
      </NuxtLink>
      <h1 class="journey-title">{{ journey?.type ? journeyTypeLabel(journey.type) : 'Маршрут' }}</h1>
      <span v-if="journey" class="journey-status" :class="journey.status">{{ journey.status }}</span>
    </header>

    <!-- Progress -->
    <section v-if="journey" class="journey-progress">
      <div class="progress-bar-lg">
        <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
      </div>
      <div class="progress-stats">
        <span>{{ completedCount }} из {{ totalMandatory }} выполнено</span>
        <span class="progress-pct">{{ progressPercent }}%</span>
      </div>
    </section>

    <!-- Events timeline -->
    <section class="events-timeline">
      <div v-for="event in sortedEvents" :key="event.id" class="timeline-item">
        <div class="timeline-connector">
          <div class="timeline-dot" :class="event.status" />
          <div class="timeline-line" />
        </div>
        <AppSharedEventCard
          :event="event"
          :variant="event.status === 'overdue' ? 'overdue' : event.status === 'due' ? 'today' : 'upcoming'"
          @complete="handleComplete"
          @skip="handleSkip"
        />
      </div>
    </section>

    <div v-if="loading" class="loading-state">
      <Icon name="lucide:loader-2" size="24" class="spin" />
      <p>Загрузка...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Journey, JourneyEvent } from '~/types/database'

definePageMeta({
  layout: 'app',
})

const route = useRoute()
const journeyStore = useJourneyStore()
const supabase = useSupabaseClient()

const journeyId = route.params.id as string
const journey = ref<Journey | null>(null)
const events = ref<JourneyEvent[]>([])
const loading = ref(true)

const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => {
    const dateA = a.due_date || ''
    const dateB = b.due_date || ''
    return dateA.localeCompare(dateB)
  })
})

const completedCount = computed(() =>
  events.value.filter(e => e.status === 'completed').length,
)

const totalMandatory = computed(() =>
  events.value.filter(e => e.is_mandatory).length,
)

const progressPercent = computed(() => {
  if (totalMandatory.value === 0) return 0
  return Math.round(
    (events.value.filter(e => e.status === 'completed' && e.is_mandatory).length / totalMandatory.value) * 100,
  )
})

function journeyTypeLabel(type: string) {
  const map: Record<string, string> = {
    pregnancy: 'Беременность',
    postpartum: 'Послеродовой период',
    infant: 'Наблюдение 0-12 мес',
    toddler: 'Наблюдение 12-24 мес',
  }
  return map[type] || type
}

async function handleComplete(eventId: string) {
  await journeyStore.completeEvent(eventId)
  const evt = events.value.find(e => e.id === eventId)
  if (evt) {
    evt.status = 'completed'
    evt.completed_at = new Date().toISOString()
  }
}

async function handleSkip(eventId: string) {
  await journeyStore.skipEvent(eventId)
  const evt = events.value.find(e => e.id === eventId)
  if (evt) evt.status = 'skipped'
}

onMounted(async () => {
  const { data: j } = await supabase
    .from('journeys')
    .select('*')
    .eq('id', journeyId)
    .single()

  if (j) journey.value = j as Journey

  const { data: evts } = await supabase
    .from('journey_events')
    .select('*')
    .eq('journey_id', journeyId)
    .order('due_date')

  if (evts) events.value = evts as JourneyEvent[]
  loading.value = false
})
</script>

<style scoped>
.journey-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px;
}

.journey-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
}

.journey-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  flex: 1;
}

.journey-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}

.journey-status.active { background: rgba(124, 184, 212, 0.15); color: var(--color-success); }
.journey-status.completed { background: var(--color-primary-ultralight); color: var(--color-primary); }
.journey-status.paused { background: rgba(233, 196, 106, 0.15); color: var(--color-warning); }

.journey-progress {
  margin-bottom: 28px;
}

.progress-bar-lg {
  height: 10px;
  background: var(--color-primary-ultralight);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-cta);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.progress-pct {
  font-weight: 600;
  color: var(--color-primary);
}

.events-timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 16px;
}

.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--color-primary-light);
  background: var(--color-surface);
  margin-top: 16px;
  z-index: 1;
}

.timeline-dot.completed { background: var(--color-success); border-color: var(--color-success); }
.timeline-dot.overdue { background: var(--color-danger); border-color: var(--color-danger); }
.timeline-dot.due { background: var(--color-primary); border-color: var(--color-primary); }
.timeline-dot.skipped { background: var(--color-text-muted); border-color: var(--color-text-muted); }

.timeline-line {
  flex: 1;
  width: 2px;
  background: var(--color-border-light);
}

.timeline-item:last-child .timeline-line {
  display: none;
}

.timeline-item > :deep(.event-card) {
  flex: 1;
  margin-bottom: 8px;
}

.loading-state {
  text-align: center;
  padding: 48px;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
