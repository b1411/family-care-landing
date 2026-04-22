<template>
  <div class="deviations">
    <div class="page-hero">
      <NuxtLink to="/chief" class="back-link">
        <Icon name="lucide:chevron-left" size="16" /> К качеству клиники
      </NuxtLink>
      <div class="hero-row">
        <div>
          <h1 class="hero-title">Отклонения от протоколов</h1>
          <p class="hero-sub">
            {{ filtered.length }} из {{ all.length }} ·
            {{ stats.unresolved }} не разобрано · {{ stats.unjustified }} без обоснования
          </p>
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
        >{{ s.label }}</button>
      </div>
      <select v-model="kindFilter" class="select">
        <option value="">Все типы</option>
        <option value="missing_checklist">Пробелы в чек-листе</option>
        <option value="no_diagnosis">Нет диагноза</option>
        <option value="duration_too_short">Короткий приём</option>
        <option value="polypharmacy">Полипрагмазия</option>
        <option value="forbidden_drug">Запрещённый препарат</option>
        <option value="no_follow_up">Нет follow-up</option>
      </select>
      <select v-model="doctorFilter" class="select">
        <option value="">Все врачи</option>
        <option v-for="d in doctorOptions" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
    </div>

    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="skel skel-row" />
    </template>

    <div v-else-if="!filtered.length" class="empty-state">
      <Icon name="lucide:check-circle-2" size="36" />
      <p>Отклонений под фильтры нет.</p>
    </div>

    <div v-else class="dev-list">
      <div v-for="d in filtered" :key="d.id" class="dev-card" :class="{ resolved: d.resolved, justified: d.justified }">
        <div class="card-top">
          <div class="top-left">
            <span class="sev-dot" :class="`sev-${d.severity}`" />
            <div class="top-text">
              <div class="top-title">
                <span class="kind-badge">{{ kindLabel(d.kind) }}</span>
                <span v-if="d.resolved" class="tag-ok">решено</span>
                <span v-else-if="d.justified" class="tag-info">обосновано</span>
                <span v-else class="tag-warn">требует внимания</span>
              </div>
              <div class="top-meta">
                {{ formatDate(d.detected_at) }}
                <span v-if="d.doctorName"> · {{ d.doctorName }}</span>
                <span v-if="d.icd10"> · {{ d.icd10 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="d.details" class="dev-details">{{ formatDetails(d.details) }}</div>

        <div v-if="d.justification_note" class="justify-block">
          <b>Обоснование врача:</b> {{ d.justification_note }}
        </div>

        <div class="card-actions">
          <button
            v-if="!d.resolved"
            class="btn btn-primary"
            :disabled="busy === d.id"
            @click="markResolved(d)"
          >
            <Icon v-if="busy === d.id" name="lucide:loader-2" size="12" class="spin" />
            Пометить разобранным
          </button>
          <button
            v-if="!d.resolved"
            class="btn btn-outline"
            :disabled="busy === d.id"
            @click="escalate(d)"
          >
            Открыть разбор кейса
          </button>
          <NuxtLink
            v-if="d.appointment_id"
            :to="d.doctor_id ? `/chief/doctors/${d.doctor_id}` : '/chief/doctors'"
            class="btn btn-ghost"
          >К врачу</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

import dayjs from 'dayjs'
import 'dayjs/locale/ru'
dayjs.locale('ru')

interface DevRow {
  id: string
  kind: string
  severity: string
  details: any
  justified: boolean
  resolved: boolean
  justification_note: string | null
  detected_at: string
  doctor_id: string | null
  appointment_id: string
  family_id: string | null
  icd10: string | null
  doctorName: string
}

const sb = useSupabaseClient()
const loading = ref(true)
const all = ref<DevRow[]>([])
const statusFilter = ref<'all' | 'open' | 'justified' | 'resolved'>('open')
const kindFilter = ref('')
const doctorFilter = ref('')
const busy = ref<string | null>(null)

const statusFilters = [
  { key: 'open', label: 'Требуют внимания' },
  { key: 'justified', label: 'Обоснованные' },
  { key: 'resolved', label: 'Решённые' },
  { key: 'all', label: 'Все' },
] as const

const stats = computed(() => ({
  unresolved: all.value.filter(d => !d.resolved).length,
  unjustified: all.value.filter(d => !d.justified && !d.resolved).length,
}))

const doctorOptions = computed(() => {
  const m = new Map<string, string>()
  all.value.forEach((d) => {
    if (d.doctor_id && d.doctorName) m.set(d.doctor_id, d.doctorName)
  })
  return Array.from(m.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
})

const filtered = computed(() => {
  let items = all.value
  if (statusFilter.value === 'open') items = items.filter(d => !d.resolved && !d.justified)
  else if (statusFilter.value === 'justified') items = items.filter(d => d.justified && !d.resolved)
  else if (statusFilter.value === 'resolved') items = items.filter(d => d.resolved)
  if (kindFilter.value) items = items.filter(d => d.kind === kindFilter.value)
  if (doctorFilter.value) items = items.filter(d => d.doctor_id === doctorFilter.value)
  return items
})

function kindLabel(k: string) {
  return ({
    missing_checklist: 'Пробелы в чек-листе',
    forbidden_drug: 'Запрещённый препарат',
    polypharmacy: 'Полипрагмазия',
    no_follow_up: 'Нет follow-up',
    duration_too_short: 'Слишком короткий приём',
    no_diagnosis: 'Нет диагноза',
  } as Record<string, string>)[k] || k
}

function formatDetails(d: any): string {
  if (!d || typeof d !== 'object') return ''
  if (Array.isArray(d.missing_items)) return `Пропущено: ${d.missing_items.join(', ')}`
  if (d.expected_min && d.actual_min) return `Ожидалось ≥ ${d.expected_min} мин, фактически ${d.actual_min}`
  if (d.active_count) return `Активных назначений: ${d.active_count}`
  if (d.reason) return String(d.reason)
  return ''
}

function formatDate(d: string) { return dayjs(d).format('D MMM, HH:mm') }

async function load() {
  const { data } = await sb
    .from('protocol_deviations')
    .select(`
      id, kind, severity, details, justified, resolved, justification_note, detected_at,
      doctor_id, appointment_id,
      doctor:doctors!doctor_id (
        user:users!user_id ( first_name, last_name )
      ),
      appointment:appointments!appointment_id ( icd10_primary, family_id )
    `)
    .order('detected_at', { ascending: false })
    .limit(300)

  all.value = (data ?? []).map((r: any) => {
    const doc = Array.isArray(r.doctor) ? r.doctor[0] : r.doctor
    const docUser = doc?.user ? (Array.isArray(doc.user) ? doc.user[0] : doc.user) : null
    const appt = Array.isArray(r.appointment) ? r.appointment[0] : r.appointment
    return {
      id: r.id,
      kind: r.kind,
      severity: r.severity,
      details: r.details,
      justified: r.justified,
      resolved: r.resolved,
      justification_note: r.justification_note,
      detected_at: r.detected_at,
      doctor_id: r.doctor_id,
      appointment_id: r.appointment_id,
      family_id: appt?.family_id ?? null,
      icd10: appt?.icd10_primary ?? null,
      doctorName: docUser ? `${docUser.last_name ?? ''} ${docUser.first_name ?? ''}`.trim() : '',
    }
  })

  loading.value = false
}

async function markResolved(d: DevRow) {
  busy.value = d.id
  try {
    await sb.from('protocol_deviations').update({ resolved: true }).eq('id', d.id)
    d.resolved = true
  }
  finally { busy.value = null }
}

async function escalate(d: DevRow) {
  busy.value = d.id
  try {
    const res: any = await $fetch('/api/chief/case-reviews', {
      method: 'POST',
      body: {
        appointment_id: d.appointment_id,
        family_id: d.family_id ?? undefined,
        doctor_id: d.doctor_id ?? undefined,
        trigger: 'protocol_deviation',
        trigger_ref_id: d.id,
        priority: d.severity === 'critical' ? 'critical' : d.severity === 'high' ? 'high' : 'normal',
      },
    })
    navigateTo(`/chief/case-reviews/${res.id}`)
  }
  catch (err: any) {
    alert(err?.data?.statusMessage || 'Не удалось создать разбор кейса')
  }
  finally { busy.value = null }
}

onMounted(load)
</script>

<style scoped>
.deviations {
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
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.78rem; color: var(--color-text-muted); text-decoration: none;
  margin-bottom: 8px;
}
.back-link:hover { color: var(--color-primary); }
.hero-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; margin: 0; }
.hero-sub { font-size: 0.85rem; color: var(--color-text-muted); margin-top: 4px; }

.filters { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.chip-group { display: flex; gap: 4px; flex-wrap: wrap; }
.chip {
  padding: 7px 14px; border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full); background: white; color: var(--color-text-muted);
  font-size: 0.78rem; font-weight: 500; font-family: var(--font-body);
  cursor: pointer; transition: all 0.2s;
}
.chip.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
.select {
  padding: 7px 12px; border: 1px solid var(--color-border-light);
  border-radius: 10px; background: white; font-size: 0.8rem;
  font-family: var(--font-body); cursor: pointer;
}

.dev-list { display: flex; flex-direction: column; gap: 8px; }
.dev-card {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dev-card.resolved { opacity: 0.65; }
.dev-card.justified:not(.resolved) { border-color: rgba(45, 133, 96, 0.2); }

.card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.top-left { display: flex; gap: 10px; min-width: 0; flex: 1; align-items: flex-start; }
.sev-dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 7px; flex-shrink: 0; }
.sev-low, .sev-info { background: var(--color-text-muted); }
.sev-medium, .sev-warning { background: #d69432; }
.sev-high { background: #d85a6a; }
.sev-critical { background: #c85a6a; }

.top-title { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.kind-badge {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.1);
  color: var(--color-primary-dark);
  font-size: 0.72rem;
  font-weight: 600;
}
.tag-ok, .tag-warn, .tag-info {
  padding: 1px 8px;
  border-radius: var(--radius-full);
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.tag-ok { background: rgba(45, 133, 96, 0.12); color: #2d8560; }
.tag-info { background: rgba(45, 133, 96, 0.1); color: #2d8560; }
.tag-warn { background: rgba(210, 140, 50, 0.14); color: #b27100; }

.top-meta { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px; }

.dev-details {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  padding: 8px 12px;
  background: rgba(139, 126, 200, 0.04);
  border-radius: 8px;
}
.justify-block {
  font-size: 0.82rem;
  color: var(--color-text-primary);
  padding: 8px 12px;
  background: rgba(45, 133, 96, 0.06);
  border-radius: 8px;
}

.card-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-primary { background: var(--color-primary); color: white; }
.btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
.btn-primary:disabled { opacity: 0.55; cursor: wait; }
.btn-outline { background: white; color: var(--color-text-secondary); border-color: var(--color-border-light); }
.btn-outline:hover { border-color: rgba(139, 126, 200, 0.35); }
.btn-ghost { background: transparent; color: var(--color-text-muted); border-color: transparent; }
.btn-ghost:hover { background: rgba(139, 126, 200, 0.06); color: var(--color-primary); }

.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 48px; background: white; border: 1px dashed rgba(139, 126, 200, 0.18);
  border-radius: 16px; color: var(--color-text-muted);
}
.skel {
  background: linear-gradient(90deg, rgba(139, 126, 200, 0.06), rgba(139, 126, 200, 0.12), rgba(139, 126, 200, 0.06));
  background-size: 200% 100%;
  animation: skel 1.4s ease-in-out infinite;
  border-radius: 14px;
}
.skel-row { height: 90px; }
@keyframes skel { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
