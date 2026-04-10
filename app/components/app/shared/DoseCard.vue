<template>
  <div class="dose-card" :class="{ confirmed: dose.status === 'confirmed' }">
    <div class="dose-icon">
      <Icon name="lucide:pill" size="20" />
    </div>
    <div class="dose-content">
      <h4 class="dose-medication">{{ medicationName }}</h4>
      <span class="dose-time">{{ formattedTime }}</span>
    </div>
    <div v-if="dose.status === 'pending'" class="dose-actions">
      <button class="btn-confirm" @click="$emit('confirm', dose.id)">
        <Icon name="lucide:check" size="14" />
        Принято
      </button>
      <button class="btn-dose-skip" @click="$emit('skip', dose.id)">
        Пропуск
      </button>
    </div>
    <div v-else class="dose-done">
      <Icon name="lucide:check" size="16" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDateTime } from '~/utils/formatters'

interface DoseData {
  id: string
  status: string
  scheduled_at: string
  prescription?: { medication: string }
  prescription_id?: string
  confirmed_at?: string | null
}

const props = defineProps<{
  dose: DoseData
}>()

defineEmits<{
  confirm: [id: string]
  skip: [id: string]
}>()

const medicationName = computed(() => {
  return props.dose.prescription?.medication ?? 'Назначение'
})

const formattedTime = computed(() => formatDateTime(props.dose.scheduled_at))
</script>

<style scoped>
.dose-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.dose-card.confirmed {
  opacity: 0.5;
}

.dose-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary-ultralight);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dose-content {
  flex: 1;
  min-width: 0;
}

.dose-medication {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.dose-time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.dose-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-confirm {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--gradient-cta);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.btn-confirm:hover { opacity: 0.85; }

.btn-dose-skip {
  padding: 6px 12px;
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.8rem;
  font-family: var(--font-body);
  cursor: pointer;
}

.btn-dose-skip:hover { border-color: var(--color-danger); color: var(--color-danger); }

.dose-done {
  color: var(--color-success);
}
</style>
