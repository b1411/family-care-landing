<template>
  <div class="event-card" :class="[variant, { completed: event.status === 'completed' }]">
    <div class="event-status-dot" />
    <div class="event-content">
      <span class="event-type-badge">{{ eventTypeLabel }}</span>
      <h3 class="event-title">{{ event.title }}</h3>
      <p v-if="event.description" class="event-desc">{{ event.description }}</p>
      <span v-if="event.due_date" class="event-date">
        <Icon name="lucide:calendar" size="12" />
        {{ formatDate(event.due_date) }}
      </span>
    </div>
    <div v-if="variant !== 'upcoming' && event.status !== 'completed'" class="event-actions">
      <button class="btn-action btn-complete" title="Выполнено" @click="$emit('complete', event.id)">
        <Icon name="lucide:check" size="16" />
      </button>
      <button class="btn-action btn-skip" title="Пропустить" @click="$emit('skip', event.id)">
        <Icon name="lucide:x" size="16" />
      </button>
    </div>
    <div v-else-if="event.status === 'completed'" class="event-done">
      <Icon name="lucide:check" size="16" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/formatters'
import type { JourneyEvent } from '~/types/database'

const props = defineProps<{
  event: JourneyEvent
  variant?: 'overdue' | 'today' | 'upcoming'
}>()

defineEmits<{
  complete: [id: string]
  skip: [id: string]
}>()

const eventTypeLabel = computed(() => {
  const map: Record<string, string> = {
    checkup: 'Осмотр',
    screening: 'Скрининг',
    analysis: 'Анализ',
    ultrasound: 'УЗИ',
    vaccination: 'Прививка',
    education: 'Обучение',
  }
  return map[props.event.type] || props.event.type
})
</script>

<style scoped>
.event-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.event-card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-sm);
}

.event-card.overdue {
  border-left: 3px solid var(--color-danger);
  background: rgba(212, 114, 124, 0.04);
}

.event-card.today {
  border-left: 3px solid var(--color-primary);
}

.event-card.completed {
  opacity: 0.6;
}

.event-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary-light);
  margin-top: 6px;
  flex-shrink: 0;
}

.overdue .event-status-dot { background: var(--color-danger); }
.today .event-status-dot { background: var(--color-primary); }

.event-content {
  display: flex;
  flex-direction: column;
  gap: var(--card-gap-xxs);
  flex: 1;
  min-width: 0;
}

.event-type-badge {
  align-self: flex-start;
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-ultralight);
  padding: 2px 8px;
  border-radius: 4px;
}

.event-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.event-desc {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.event-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.3;
}

.event-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.btn-complete:hover {
  background: rgba(124, 184, 212, 0.15);
  border-color: var(--color-success);
  color: var(--color-success);
}

.btn-skip:hover {
  background: rgba(212, 114, 124, 0.08);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.event-done {
  color: var(--color-success);
  flex-shrink: 0;
  margin-top: 4px;
}
</style>
