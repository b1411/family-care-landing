<template>
  <div class="appointment-card">
    <div class="apt-date-block">
      <span class="apt-day">{{ day }}</span>
      <span class="apt-month">{{ month }}</span>
    </div>
    <div class="apt-content">
      <h4 class="apt-reason">{{ appointment.reason || 'Приём' }}</h4>
      <p class="apt-details">
        <Icon name="lucide:clock" size="12" />
        {{ appointment.start_time?.slice(0, 5) }}
        <span v-if="doctorName"> · {{ doctorName }}</span>
      </p>
      <span class="apt-status-badge" :class="appointment.status">
        {{ statusLabel }}
      </span>
    </div>
    <NuxtLink :to="`/family/appointments/${appointment.id}`" class="apt-link">
      <Icon name="lucide:chevron-right" size="16" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

interface AppointmentData {
  id: string
  reason?: string
  notes?: string | null
  doctor_name?: string
  specialty?: string
  appointment_date?: string
  scheduled_at?: string
  start_time?: string
  status: string
  doctor?: { user?: { first_name: string; last_name: string }; specialty: string }
}

const props = defineProps<{
  appointment: AppointmentData
}>()

const dateStr = computed(() => props.appointment.appointment_date || props.appointment.scheduled_at?.split('T')[0] || '')
const day = computed(() => dateStr.value ? dayjs(dateStr.value).format('D') : '')
const month = computed(() => dateStr.value ? dayjs(dateStr.value).format('MMM') : '')

const doctorName = computed(() => {
  if (props.appointment.doctor_name) return `${props.appointment.specialty || ''} — ${props.appointment.doctor_name}`
  const doc = props.appointment.doctor
  if (!doc?.user) return ''
  return `${doc.specialty} — ${doc.user.first_name} ${doc.user.last_name}`
})

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    requested: 'Ожидает',
    confirmed: 'Подтверждена',
    completed: 'Завершена',
    cancelled: 'Отменена',
    no_show: 'Неявка',
    rescheduled: 'Перенесена',
  }
  return map[props.appointment.status] || props.appointment.status
})
</script>

<style scoped>
.appointment-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.appointment-card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-sm);
}

.apt-date-block {
  width: 44px;
  height: 48px;
  background: var(--color-primary-ultralight);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.apt-day {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.apt-month {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--color-primary);
  text-transform: uppercase;
}

.apt-content {
  flex: 1;
  min-width: 0;
}

.apt-reason {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.apt-details {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.apt-status-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 4px;
}

.apt-status-badge.confirmed { background: rgba(124, 184, 212, 0.15); color: var(--color-success); }
.apt-status-badge.requested { background: rgba(233, 196, 106, 0.15); color: var(--color-warning); }
.apt-status-badge.completed { background: var(--color-primary-ultralight); color: var(--color-primary); }
.apt-status-badge.cancelled { background: rgba(212, 114, 124, 0.08); color: var(--color-danger); }
.apt-status-badge.no_show { background: rgba(212, 114, 124, 0.08); color: var(--color-danger); }

.apt-link {
  color: var(--color-text-muted);
  text-decoration: none;
}
</style>
