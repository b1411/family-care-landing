<template>
  <div class="case-list">
    <div class="page-hero">
      <NuxtLink to="/chief" class="back-link">
        <Icon name="lucide:chevron-left" size="16" /> К качеству клиники
      </NuxtLink>
      <div class="hero-row">
        <div>
          <h1 class="hero-title">Разбор случаев</h1>
          <p class="hero-sub">
            {{ filtered.length }} из {{ all.length }} кейсов ·
            <span :class="{ urgent: stats.queued > 0 }">{{ stats.queued }} в очереди</span>
          </p>
        </div>
        <div class="hero-stat-row">
          <div class="hero-stat">
            <span class="stat-val">{{ stats.queued }}</span>
            <span class="stat-lbl">очередь</span>
          </div>
          <div class="hero-stat">
            <span class="stat-val">{{ stats.inReview }}</span>
            <span class="stat-lbl">в разборе</span>
          </div>
          <div class="hero-stat">
            <span class="stat-val">{{ stats.closed }}</span>
            <span class="stat-lbl">закрыто</span>
          </div>
        </div>
      </div>
    </div>

    <div class="filters">
      <div class="chip-group">
        <button
          v-for="s in statusFilters"
          :key="s.key"
          class="chip"
          :class="{ active: statusFilter === s.key }"
          @click="statusFilter = s.key"
        >
          {{ s.label }}
        </button>
      </div>

      <select v-model="priorityFilter" class="select">
        <option value="">Все приоритеты</option>
        <option value="critical">Критические</option>
        <option value="high">Высокие</option>
        <option value="normal">Обычные</option>
      </select>

      <select v-model="triggerFilter" class="select">
        <option value="">Все триггеры</option>
        <option value="complaint">Жалоба</option>
        <option value="protocol_deviation">Отклонение</option>
        <option value="adverse_outcome">Неблаг. исход</option>
        <option value="rx_alert">Rx-алерт</option>
        <option value="manual">Вручную</option>
        <option value="no_progress">Нет прогресса</option>
      </select>
    </div>

    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="skel skel-row" />
    </template>

    <div v-else-if="!filtered.length" class="empty-state">
      <Icon name="lucide:inbox" size="36" />
      <p>Кейсов под фильтры нет.</p>
    </div>

    <div v-else class="case-rows">
      <NuxtLink
        v-for="c in filtered"
        :key="c.id"
        :to="`/chief/case-reviews/${c.id}`"
        class="case-row"
      >
        <div class="row-left">
          <div class="prio-dot" :class="`prio-${c.priority}`" />
          <div class="row-main">
            <div class="row-head">
              <span class="trig-badge" :class="`trig-${c.trigger}`">
                {{ triggerLabel(c.trigger) }}
              </span>
              <span class="status-badge" :class="`st-${c.status}`">
                {{ statusLabel(c.status) }}
              </span>
              <span class="row-date">{{ formatDate(c.created_at) }}</span>
            </div>
            <div class="row-body">
              <span v-if="c.doctorName" class="row-doctor">{{ c.doctorName }}</span>
              <span v-if="c.patientLabel" class="row-patient">
                {{ c.doctorName ? '·' : '' }} {{ c.patientLabel }}
              </span>
              <span v-if="c.decision" class="row-decision">→ {{ decisionLabel(c.decision) }}</span>
            </div>
          </div>
        </div>
        <Icon name="lucide:chevron-right" size="18" class="chev" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

import dayjs from 'dayjs'
import 'dayjs/locale/ru'
dayjs.locale('ru')

interface CaseRow {
  id: string
  trigger: string
  status: string
  priority: string
  decision: string | null
  created_at: string
  doctor_id: string | null
  family_id: string | null
  appointment_id: string | null
  doctorName: string
  patientLabel: string
}

const sb = useSupabaseClient()
const loading = ref(true)
const all = ref<CaseRow[]>([])
const statusFilter = ref<'all' | 'queued' | 'in_review' | 'closed'>('queued')
const priorityFilter = ref<'' | 'critical' | 'high' | 'normal'>('')
const triggerFilter = ref('')

const statusFilters = [
  { key: 'queued', label: 'Очередь' },
  { key: 'in_review', label: 'В разборе' },
  { key: 'closed', label: 'Закрыто' },
  { key: 'all', label: 'Все' },
] as const

const stats = computed(() => ({
  queued: all.value.filter(c => c.status === 'queued').length,
  inReview: all.value.filter(c => c.status === 'in_review').length,
  closed: all.value.filter(c => c.status === 'closed').length,
}))

const filtered = computed(() => {
  let items = all.value
  if (statusFilter.value !== 'all') items = items.filter(c => c.status === statusFilter.value)
  if (priorityFilter.value) items = items.filter(c => c.priority === priorityFilter.value)
  if (triggerFilter.value) items = items.filter(c => c.trigger === triggerFilter.value)
  return items
})

function triggerLabel(t: string) {
  return ({
    complaint: 'Жалоба',
    protocol_deviation: 'Отклонение',
    adverse_outcome: 'Неблаг. исход',
    rx_alert: 'Rx-алерт',
    manual: 'Вручную',
    no_progress: 'Нет прогресса',
  } as Record<string, string>)[t] || t
}
function statusLabel(s: string) {
  return ({ queued: 'в очереди', in_review: 'в разборе', closed: 'закрыто' } as Record<string, string>)[s] || s
}
function decisionLabel(d: string) {
  return ({
    no_violation: 'Нарушений нет',
    training_required: 'Обучение',
    formal_warning: 'Предупреждение',
    escalate: 'Эскалация',
  } as Record<string, string>)[d] || d
}
function formatDate(d: string) { return dayjs(d).format('D MMM, HH:mm') }

async function load() {
  const { data } = await sb
    .from('case_reviews')
    .select(`
      id, trigger, status, priority, decision, created_at,
      doctor_id, family_id, appointment_id,
      doctor:doctors!doctor_id (
        user:users!user_id ( first_name, last_name )
      ),
      family:families!family_id (
        primary_parent:users!families_primary_parent_id_fkey ( first_name, last_name )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  all.value = (data ?? []).map((r: any) => {
    const doc = Array.isArray(r.doctor) ? r.doctor[0] : r.doctor
    const docUser = doc?.user ? (Array.isArray(doc.user) ? doc.user[0] : doc.user) : null
    const fam = Array.isArray(r.family) ? r.family[0] : r.family
    const parent = fam?.primary_parent
      ? (Array.isArray(fam.primary_parent) ? fam.primary_parent[0] : fam.primary_parent)
      : null
    return {
      id: r.id,
      trigger: r.trigger,
      status: r.status,
      priority: r.priority,
      decision: r.decision,
      created_at: r.created_at,
      doctor_id: r.doctor_id,
      family_id: r.family_id,
      appointment_id: r.appointment_id,
      doctorName: docUser
        ? `${docUser.last_name ?? ''} ${docUser.first_name ?? ''}`.trim()
        : '',
      patientLabel: parent
        ? `${parent.last_name ?? ''} ${parent.first_name ?? ''}`.trim()
        : '',
    }
  })
  loading.value = false
}

onMounted(load)
</script>

<style scoped>
.case-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1100px;
}

.page-hero {
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.08), rgba(232, 160, 191, 0.06));
  border: 1px solid rgba(139, 126, 200, 0.12);
  border-radius: 20px;
  padding: 22px 28px;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  text-decoration: none;
  margin-bottom: 8px;
}
.back-link:hover { color: var(--color-primary); }
.hero-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.hero-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}
.hero-sub {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 4px;
}
.hero-sub .urgent { color: #c85a6a; font-weight: 600; }
.hero-stat-row { display: flex; gap: 20px; }
.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.stat-val {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
}
.stat-lbl { font-size: 0.7rem; color: var(--color-text-muted); margin-top: 2px; }

.filters { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.chip-group { display: flex; gap: 4px; flex-wrap: wrap; }
.chip {
  padding: 7px 14px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  background: white;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}
.chip.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.select {
  padding: 7px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  background: white;
  font-size: 0.8rem;
  font-family: var(--font-body);
  cursor: pointer;
}

.case-rows { display: flex; flex-direction: column; gap: 6px; }
.case-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}
.case-row:hover {
  border-color: rgba(139, 126, 200, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(139, 126, 200, 0.08);
}
.row-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }
.prio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.prio-normal { background: rgba(123, 115, 148, 0.3); }
.prio-high { background: #d69432; }
.prio-critical { background: #c85a6a; }

.row-main { min-width: 0; }
.row-head {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  font-size: 0.75rem;
}
.trig-badge, .status-badge {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.trig-complaint { background: rgba(200, 90, 106, 0.12); color: #c85a6a; }
.trig-protocol_deviation { background: rgba(210, 140, 50, 0.14); color: #b27100; }
.trig-adverse_outcome { background: rgba(200, 90, 106, 0.18); color: #a0404f; }
.trig-rx_alert { background: rgba(139, 126, 200, 0.12); color: var(--color-primary); }
.trig-manual { background: rgba(123, 115, 148, 0.1); color: var(--color-text-muted); }
.trig-no_progress { background: rgba(210, 140, 50, 0.14); color: #b27100; }
.st-queued { background: rgba(139, 126, 200, 0.12); color: var(--color-primary); }
.st-in_review { background: rgba(45, 133, 96, 0.12); color: #2d8560; }
.st-closed { background: rgba(123, 115, 148, 0.1); color: var(--color-text-muted); }

.row-date { color: var(--color-text-muted); font-size: 0.72rem; }
.row-body {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.row-doctor { font-weight: 500; color: var(--color-text-primary); }
.row-patient { color: var(--color-text-muted); }
.row-decision { color: var(--color-primary); font-weight: 500; }

.chev { color: var(--color-text-muted); flex-shrink: 0; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px;
  background: white;
  border: 1px dashed rgba(139, 126, 200, 0.18);
  border-radius: 16px;
  color: var(--color-text-muted);
}

.skel {
  background: linear-gradient(90deg, rgba(139, 126, 200, 0.06), rgba(139, 126, 200, 0.12), rgba(139, 126, 200, 0.06));
  background-size: 200% 100%;
  animation: skel 1.4s ease-in-out infinite;
  border-radius: 14px;
}
.skel-row { height: 68px; }
@keyframes skel {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
