<template>
  <div class="complaints">
    <div class="page-hero">
      <NuxtLink to="/chief" class="back-link">
        <Icon name="lucide:chevron-left" size="16" /> К качеству клиники
      </NuxtLink>
      <div class="hero-row">
        <div>
          <h1 class="hero-title">Жалобы</h1>
          <p class="hero-sub">
            {{ filtered.length }} из {{ all.length }} обращений ·
            <span :class="{ urgent: stats.overdue > 0 }">{{ stats.overdue }} просрочены по SLA</span>
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
        <option value="medical">Медицинские</option>
        <option value="service">Сервисные</option>
        <option value="billing">Финансовые</option>
        <option value="other">Прочие</option>
      </select>
      <select v-model="severityFilter" class="select">
        <option value="">Все уровни</option>
        <option value="critical">Критические</option>
        <option value="high">Высокие</option>
        <option value="medium">Средние</option>
        <option value="low">Низкие</option>
      </select>
    </div>

    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="skel skel-row" />
    </template>

    <div v-else-if="!filtered.length" class="empty-state">
      <Icon name="lucide:smile" size="36" />
      <p>Жалоб под фильтры нет.</p>
    </div>

    <div v-else class="comp-list">
      <div v-for="c in filtered" :key="c.id" class="comp-card" :class="{ overdue: c.slaOverdue, expanded: expandedId === c.id }">
        <div class="card-head" @click="expandedId = expandedId === c.id ? null : c.id">
          <div class="head-left">
            <span class="sev-dot" :class="`sev-${c.severity}`" />
            <div class="head-text">
              <div class="head-title">
                <span class="kind-badge" :class="`kind-${c.kind}`">{{ kindLabel(c.kind) }}</span>
                <span class="status-badge" :class="`st-${c.status}`">{{ statusLabel(c.status) }}</span>
                <span v-if="c.slaOverdue && c.status !== 'resolved' && c.status !== 'dismissed'" class="sla-badge">
                  <Icon name="lucide:alert-triangle" size="11" /> SLA
                </span>
              </div>
              <div class="head-meta">
                <span>{{ formatDate(c.created_at) }}</span>
                <span v-if="c.doctorName"> · {{ c.doctorName }}</span>
                <span v-if="c.patientLabel"> · {{ c.patientLabel }}</span>
              </div>
            </div>
          </div>
          <Icon :name="expandedId === c.id ? 'lucide:chevron-up' : 'lucide:chevron-down'" size="18" class="chev" />
        </div>

        <p class="comp-body" :class="{ truncated: expandedId !== c.id }">{{ c.body }}</p>

        <div v-if="expandedId === c.id" class="card-actions">
          <div v-if="c.status !== 'resolved' && c.status !== 'dismissed'" class="action-group">
            <div class="fg">
              <label class="fl">Комментарий по разбору</label>
              <textarea
                :value="draftNotes[c.id] ?? ''"
                rows="2"
                class="fi"
                placeholder="Что было сделано, какой вывод…"
                @input="draftNotes[c.id] = ($event.target as HTMLTextAreaElement).value"
              />
            </div>
            <div class="btn-row">
              <button v-if="c.status === 'new'" class="btn btn-ghost" :disabled="busy === c.id" @click="setStatus(c, 'in_review')">
                Взять в разбор
              </button>
              <button class="btn btn-primary" :disabled="busy === c.id" @click="resolve(c)">
                <Icon v-if="busy === c.id" name="lucide:loader-2" size="12" class="spin" />
                Решить
              </button>
              <button class="btn btn-outline" :disabled="busy === c.id" @click="dismiss(c)">
                Отклонить
              </button>
              <button class="btn btn-outline" :disabled="busy === c.id" @click="escalate(c)">
                Открыть разбор кейса
              </button>
            </div>
          </div>
          <div v-else class="resolved-note">
            <div v-if="c.resolution_note" class="note-block">
              <b>Решение:</b>
              <p>{{ c.resolution_note }}</p>
            </div>
            <div v-if="c.resolved_at" class="note-meta">Закрыто {{ formatDate(c.resolved_at) }}</div>
          </div>
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

interface ComplaintRow {
  id: string
  kind: string
  severity: string
  status: string
  body: string
  created_at: string
  sla_due_at: string | null
  resolved_at: string | null
  resolution_note: string | null
  doctor_id: string | null
  family_id: string | null
  appointment_id: string | null
  doctorName: string
  patientLabel: string
  slaOverdue: boolean
}

const sb = useSupabaseClient()
const loading = ref(true)
const all = ref<ComplaintRow[]>([])
const statusFilter = ref<'all' | 'new' | 'in_review' | 'resolved' | 'dismissed'>('new')
const kindFilter = ref('')
const severityFilter = ref('')
const expandedId = ref<string | null>(null)
const draftNotes = reactive<Record<string, string>>({})
const busy = ref<string | null>(null)

const statusFilters = [
  { key: 'new', label: 'Новые' },
  { key: 'in_review', label: 'В разборе' },
  { key: 'resolved', label: 'Решены' },
  { key: 'dismissed', label: 'Отклонены' },
  { key: 'all', label: 'Все' },
] as const

const stats = computed(() => ({
  overdue: all.value.filter(c => c.slaOverdue && !['resolved', 'dismissed'].includes(c.status)).length,
}))

const filtered = computed(() => {
  let items = all.value
  if (statusFilter.value !== 'all') items = items.filter(c => c.status === statusFilter.value)
  if (kindFilter.value) items = items.filter(c => c.kind === kindFilter.value)
  if (severityFilter.value) items = items.filter(c => c.severity === severityFilter.value)
  return items
})

function kindLabel(k: string) {
  return ({ medical: 'Медицинская', service: 'Сервисная', billing: 'Финансовая', other: 'Прочее' } as Record<string, string>)[k] || k
}
function statusLabel(s: string) {
  return ({ new: 'новая', in_review: 'в разборе', resolved: 'решена', dismissed: 'отклонена' } as Record<string, string>)[s] || s
}
function formatDate(d?: string | null) {
  return d ? dayjs(d).format('D MMM, HH:mm') : ''
}

async function load() {
  const { data } = await sb
    .from('complaints')
    .select(`
      id, kind, severity, status, body, created_at, sla_due_at, resolved_at, resolution_note,
      doctor_id, family_id, appointment_id,
      doctor:doctors!doctor_id (
        user:users!user_id ( first_name, last_name )
      ),
      family:families!family_id (
        primary_parent:users!families_primary_parent_id_fkey ( first_name, last_name )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(300)

  const now = Date.now()
  all.value = (data ?? []).map((r: any) => {
    const doc = Array.isArray(r.doctor) ? r.doctor[0] : r.doctor
    const docUser = doc?.user ? (Array.isArray(doc.user) ? doc.user[0] : doc.user) : null
    const fam = Array.isArray(r.family) ? r.family[0] : r.family
    const parent = fam?.primary_parent
      ? (Array.isArray(fam.primary_parent) ? fam.primary_parent[0] : fam.primary_parent)
      : null
    return {
      id: r.id,
      kind: r.kind,
      severity: r.severity,
      status: r.status,
      body: r.body,
      created_at: r.created_at,
      sla_due_at: r.sla_due_at,
      resolved_at: r.resolved_at,
      resolution_note: r.resolution_note,
      doctor_id: r.doctor_id,
      family_id: r.family_id,
      appointment_id: r.appointment_id,
      doctorName: docUser ? `${docUser.last_name ?? ''} ${docUser.first_name ?? ''}`.trim() : '',
      patientLabel: parent ? `${parent.last_name ?? ''} ${parent.first_name ?? ''}`.trim() : '',
      slaOverdue: !!r.sla_due_at && new Date(r.sla_due_at).getTime() < now,
    }
  })
  loading.value = false
}

async function setStatus(c: ComplaintRow, status: string) {
  busy.value = c.id
  try {
    await sb.from('complaints').update({ status }).eq('id', c.id)
    c.status = status
  }
  finally { busy.value = null }
}

async function resolve(c: ComplaintRow) {
  const note = (draftNotes[c.id] ?? '').trim()
  if (!note) { alert('Добавьте комментарий по разбору.'); return }
  busy.value = c.id
  try {
    const { data: user } = await sb.auth.getUser()
    await sb.from('complaints').update({
      status: 'resolved',
      resolution_note: note,
      resolved_at: new Date().toISOString(),
      resolved_by: user.user?.id ?? null,
    }).eq('id', c.id)
    c.status = 'resolved'
    c.resolution_note = note
    c.resolved_at = new Date().toISOString()
  }
  finally { busy.value = null }
}

async function dismiss(c: ComplaintRow) {
  const note = (draftNotes[c.id] ?? '').trim()
  if (!note) { alert('Кратко укажите основание отклонения.'); return }
  busy.value = c.id
  try {
    const { data: user } = await sb.auth.getUser()
    await sb.from('complaints').update({
      status: 'dismissed',
      resolution_note: note,
      resolved_at: new Date().toISOString(),
      resolved_by: user.user?.id ?? null,
    }).eq('id', c.id)
    c.status = 'dismissed'
    c.resolution_note = note
    c.resolved_at = new Date().toISOString()
  }
  finally { busy.value = null }
}

async function escalate(c: ComplaintRow) {
  busy.value = c.id
  try {
    const res: any = await $fetch('/api/chief/case-reviews', {
      method: 'POST',
      body: {
        appointment_id: c.appointment_id ?? undefined,
        family_id: c.family_id ?? undefined,
        doctor_id: c.doctor_id ?? undefined,
        trigger: 'complaint',
        trigger_ref_id: c.id,
        priority: c.severity === 'critical' ? 'critical' : c.severity === 'high' ? 'high' : 'normal',
      },
    })
    await sb.from('complaints').update({ status: 'in_review' }).eq('id', c.id)
    c.status = 'in_review'
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
.complaints {
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
.hero-sub .urgent { color: #c85a6a; font-weight: 600; }

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
  border-radius: 10px; background: white; font-size: 0.8rem; font-family: var(--font-body); cursor: pointer;
}

.comp-list { display: flex; flex-direction: column; gap: 6px; }
.comp-card {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: 14px;
  padding: 12px 18px;
  transition: all 0.2s;
}
.comp-card.overdue {
  border-left: 3px solid #c85a6a;
  border-color: rgba(200, 90, 106, 0.2);
}
.comp-card.expanded { border-color: rgba(139, 126, 200, 0.3); box-shadow: 0 4px 14px rgba(139, 126, 200, 0.06); }

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}
.head-left { display: flex; gap: 10px; min-width: 0; flex: 1; align-items: flex-start; }
.sev-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 8px; flex-shrink: 0; }
.sev-low, .sev-info { background: var(--color-text-muted); }
.sev-medium, .sev-warning { background: #d69432; }
.sev-high { background: #d85a6a; }
.sev-critical { background: #c85a6a; }

.head-text { min-width: 0; }
.head-title {
  display: flex; gap: 6px; flex-wrap: wrap; align-items: center;
}
.kind-badge, .status-badge {
  padding: 2px 8px; border-radius: var(--radius-full);
  font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
}
.kind-medical { background: rgba(200, 90, 106, 0.12); color: #c85a6a; }
.kind-service { background: rgba(139, 126, 200, 0.12); color: var(--color-primary); }
.kind-billing { background: rgba(210, 140, 50, 0.14); color: #b27100; }
.kind-other { background: rgba(123, 115, 148, 0.1); color: var(--color-text-muted); }
.st-new { background: rgba(139, 126, 200, 0.14); color: var(--color-primary); }
.st-in_review { background: rgba(45, 133, 96, 0.12); color: #2d8560; }
.st-resolved { background: rgba(45, 133, 96, 0.12); color: #2d8560; }
.st-dismissed { background: rgba(123, 115, 148, 0.1); color: var(--color-text-muted); }

.sla-badge {
  display: inline-flex; align-items: center; gap: 3px;
  background: rgba(200, 90, 106, 0.14); color: #c85a6a;
  padding: 2px 8px; border-radius: var(--radius-full);
  font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
}

.head-meta { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px; }
.chev { color: var(--color-text-muted); flex-shrink: 0; margin-top: 2px; }

.comp-body {
  margin: 8px 0 0;
  font-size: 0.88rem;
  color: var(--color-text-primary);
  line-height: 1.5;
  white-space: pre-wrap;
}
.comp-body.truncated {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-actions {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border-light);
}
.action-group { display: flex; flex-direction: column; gap: 10px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fl { font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); }
.fi {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  font-size: 0.85rem;
  font-family: var(--font-body);
  outline: none;
  background: white;
  resize: vertical;
}
.fi:focus { border-color: var(--color-primary); }

.btn-row { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.btn {
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}
.btn:disabled { opacity: 0.5; cursor: wait; }
.btn-primary { background: var(--color-primary); color: white; }
.btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
.btn-ghost { background: white; color: var(--color-text-secondary); border-color: var(--color-border-light); }
.btn-ghost:hover:not(:disabled) { background: rgba(139, 126, 200, 0.04); }
.btn-outline { background: white; color: var(--color-text-secondary); border-color: var(--color-border-light); }
.btn-outline:hover:not(:disabled) { border-color: rgba(139, 126, 200, 0.3); }

.resolved-note { display: flex; flex-direction: column; gap: 6px; }
.note-block { font-size: 0.85rem; }
.note-block p { margin: 4px 0 0; color: var(--color-text-primary); white-space: pre-wrap; line-height: 1.5; }
.note-meta { font-size: 0.75rem; color: var(--color-text-muted); }

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
.skel-row { height: 74px; }
@keyframes skel { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
