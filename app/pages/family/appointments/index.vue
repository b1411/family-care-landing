<template>
  <div class="apt-page">
    <!-- Hero -->
    <div class="apt-hero">
      <div>
        <h1 class="apt-hero-title">Записи к врачу</h1>
        <p class="apt-hero-sub">{{ upcoming.length }} предстоящих · {{ past.length }} прошедших</p>
      </div>
      <NuxtLink to="/family/appointments/book" class="apt-hero-btn">
        <Icon name="lucide:plus" size="15" /> Записаться
      </NuxtLink>
    </div>

    <!-- Upcoming -->
    <div class="card" v-if="upcoming.length">
      <div class="card-header">
        <h2 class="card-title"><Icon name="lucide:calendar" size="16" /> Предстоящие</h2>
      </div>
      <div class="apt-list">
        <div v-for="a in upcoming" :key="a.id" class="apt-row">
          <div class="apt-date-col">
            <span class="apt-day">{{ dayOf(a.appointment_date) }}</span>
            <span class="apt-month">{{ monthOf(a.appointment_date) }}</span>
          </div>
          <div class="apt-info">
            <span class="apt-name">{{ a.reason }}</span>
            <span class="apt-meta">{{ a.doctor_name }} · {{ a.specialty }} · {{ a.start_time }}</span>
          </div>
          <span class="apt-badge" :class="`apt-badge--${a.status}`">{{ statusLabel(a.status) }}</span>
        </div>
      </div>
    </div>

    <!-- Past -->
    <div class="card" v-if="past.length">
      <div class="card-header">
        <h2 class="card-title" style="color: var(--color-text-secondary)"><Icon name="lucide:history" size="16" /> Прошедшие</h2>
      </div>
      <div class="apt-list">
        <div v-for="a in past" :key="a.id" class="apt-row apt-row--past">
          <div class="apt-date-col">
            <span class="apt-day">{{ dayOf(a.appointment_date) }}</span>
            <span class="apt-month">{{ monthOf(a.appointment_date) }}</span>
          </div>
          <div class="apt-info">
            <span class="apt-name">{{ a.reason }}</span>
            <span class="apt-meta">{{ a.doctor_name }} · {{ a.specialty }}</span>
          </div>
          <div class="apt-actions-col">
            <span class="apt-badge apt-badge--completed">Завершён</span>
            <button class="apt-feedback" @click="openFeedback(a)" aria-label="Оставить отзыв">
              <Icon name="lucide:message-square" size="12" />
              Отзыв
            </button>
          </div>
        </div>
      </div>
    </div>

    <AppFamilyComplaintModal
      v-if="authStore.familyId"
      :open="feedbackOpen"
      :family-id="authStore.familyId"
      :appointment-id="selectedAppt?.id ?? null"
      :doctor-id="selectedAppt?.doctor_id ?? null"
      :appointment-label="selectedApptLabel"
      @close="feedbackOpen = false"
      @submitted="onSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const appData = useAppData()
const authStore = useAuthStore()
const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

const upcoming = computed(() => appData.appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled'))
const past = computed(() => appData.appointments.filter(a => a.status === 'completed'))

const feedbackOpen = ref(false)
const selectedAppt = ref<any | null>(null)
const selectedApptLabel = computed(() => {
  if (!selectedAppt.value) return ''
  const a = selectedAppt.value
  return `${a.doctor_name ?? ''} · ${dayOf(a.appointment_date)} ${monthOf(a.appointment_date)}`.trim()
})

function openFeedback(a: any) {
  selectedAppt.value = a
  feedbackOpen.value = true
}
function onSubmitted() {
  feedbackOpen.value = false
  selectedAppt.value = null
}

function dayOf(iso: string) { return new Date(iso).getDate() }
function monthOf(iso: string) { return months[new Date(iso).getMonth()] }
function statusLabel(s: string) {
  const map: Record<string, string> = { confirmed: 'Подтверждён', requested: 'Ожидает', completed: 'Завершён', cancelled: 'Отменён' }
  return map[s] || s
}
</script>

<style scoped>
.apt-page { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }

.apt-hero {
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg, rgba(139,126,200,0.08), rgba(232,160,191,0.06));
  border: 1px solid rgba(139,126,200,0.12); border-radius: 16px; padding: 24px 28px;
}
.apt-hero-title { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; }
.apt-hero-sub { font-size: 0.82rem; color: var(--color-text-muted); margin-top: 4px; }
.apt-hero-btn {
  display: flex; align-items: center; gap: 6px; padding: 10px 20px;
  background: var(--gradient-cta); color: white; border-radius: 10px;
  text-decoration: none; font-size: 0.82rem; font-weight: 600;
}

.card { background: white; border: 1px solid var(--color-border-light); border-radius: 14px; padding: 20px; }
.card-header { margin-bottom: 16px; }
.card-title { font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }

.apt-list { display: flex; flex-direction: column; gap: 4px; }
.apt-row {
  display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 10px;
  transition: background 0.15s;
}
.apt-row:hover { background: rgba(139,126,200,0.04); }
.apt-row--past { opacity: 0.6; }

.apt-date-col {
  width: 44px; height: 48px; border-radius: 10px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; flex-shrink: 0;
  background: rgba(139,126,200,0.08); border: 1px solid rgba(139,126,200,0.1);
}
.apt-day { font-size: 1.1rem; font-weight: 700; font-family: var(--font-mono); line-height: 1; }
.apt-month { font-size: 0.62rem; color: var(--color-text-muted); text-transform: uppercase; }

.apt-info { flex: 1; min-width: 0; }
.apt-name { display: block; font-size: 0.85rem; font-weight: 500; }
.apt-meta { display: block; font-size: 0.72rem; color: var(--color-text-muted); margin-top: 2px; }

.apt-badge { font-size: 0.65rem; font-weight: 600; padding: 3px 8px; border-radius: var(--radius-full); flex-shrink: 0; }
.apt-badge--confirmed { background: rgba(124,184,212,0.1); color: var(--color-success); }
.apt-badge--requested { background: rgba(233,196,106,0.1); color: var(--color-warning); }
.apt-badge--completed { background: rgba(139,126,200,0.08); color: var(--color-text-muted); }

.apt-actions-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}
.apt-row--past { opacity: 1; }
.apt-row--past .apt-info { opacity: 0.7; }
.apt-feedback {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 10px;
  background: none;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  font-size: 0.7rem;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}
.apt-feedback:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(139, 126, 200, 0.04);
}
.apt-badge--cancelled { background: rgba(212,114,124,0.1); color: var(--color-danger); }

@media (max-width: 380px) {
  .apt-meta { font-size: 0.68rem; }
  .apt-name { font-size: 0.8rem; }
  .apt-badge { font-size: 0.6rem; padding: 2px 6px; }
}
</style>
