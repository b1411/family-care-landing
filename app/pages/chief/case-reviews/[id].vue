<template>
  <div class="case-detail">
    <template v-if="loading">
      <div class="skel skel-hero" />
      <div class="skel skel-block" />
      <div class="skel skel-block" />
    </template>

    <div v-else-if="!data" class="empty-state">
      <Icon name="lucide:file-x" size="36" />
      <p>Кейс не найден.</p>
      <NuxtLink to="/chief/case-reviews" class="back-btn">К очереди</NuxtLink>
    </div>

    <template v-else>
      <!-- Hero -->
      <div class="page-hero">
        <NuxtLink to="/chief/case-reviews" class="back-link">
          <Icon name="lucide:chevron-left" size="16" /> К очереди
        </NuxtLink>
        <div class="hero-row">
          <div class="hero-main">
            <div class="hero-badges">
              <span class="trig-badge" :class="`trig-${data.case.trigger}`">
                {{ triggerLabel(data.case.trigger) }}
              </span>
              <span class="status-badge" :class="`st-${data.case.status}`">
                {{ statusLabel(data.case.status) }}
              </span>
              <span class="prio-badge" :class="`prio-${data.case.priority}`">
                {{ priorityLabel(data.case.priority) }}
              </span>
            </div>
            <h1 class="hero-title">{{ appointmentTitle }}</h1>
            <p class="hero-sub">
              Открыт {{ formatDate(data.case.created_at) }}
              <span v-if="data.case.reviewed_at"> · Закрыт {{ formatDate(data.case.reviewed_at) }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Parties -->
      <section class="parties">
        <div class="party-card">
          <span class="party-lbl">Врач</span>
          <span class="party-val">{{ doctorName || '—' }}</span>
        </div>
        <div class="party-card">
          <span class="party-lbl">Пациент</span>
          <span class="party-val">{{ patientLabel || '—' }}</span>
        </div>
        <div class="party-card">
          <span class="party-lbl">Дата приёма</span>
          <span class="party-val">{{ appointmentDate }}</span>
        </div>
      </section>

      <!-- Appointment -->
      <section v-if="appt" class="block">
        <h2 class="block-title">Приём</h2>
        <div class="block-content">
          <div class="detail-row">
            <span class="detail-label">Диагноз:</span>
            <span class="detail-value">
              <span v-if="appt.icd10_primary" class="icd-pill">{{ appt.icd10_primary }}</span>
              <span v-else class="detail-warn">не указан</span>
            </span>
          </div>
          <div v-if="appt.icd10_secondary?.length" class="detail-row">
            <span class="detail-label">Сопутствующие:</span>
            <span class="detail-value">
              <span v-for="c in appt.icd10_secondary" :key="c" class="icd-pill">{{ c }}</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Чек-лист:</span>
            <span class="detail-value">
              <span
                v-for="(filled, key) in appt.completion_checklist ?? {}"
                :key="key"
                class="check-pill"
                :class="{ filled: filled }"
              >
                <Icon :name="filled ? 'lucide:check' : 'lucide:minus'" size="11" />
                {{ checklistLabel(key) }}
              </span>
            </span>
          </div>
          <div v-if="appt.reason" class="detail-row">
            <span class="detail-label">Повод:</span>
            <span class="detail-value">{{ appt.reason }}</span>
          </div>
          <div v-if="appt.post_visit_notes" class="detail-row">
            <span class="detail-label">Заключение:</span>
            <span class="detail-value notes">{{ appt.post_visit_notes }}</span>
          </div>
        </div>
      </section>

      <!-- Prescriptions -->
      <section v-if="snapshot.prescriptions?.length" class="block">
        <h2 class="block-title">Назначения ({{ snapshot.prescriptions.length }})</h2>
        <div class="rx-list">
          <div v-for="r in snapshot.prescriptions" :key="r.id" class="rx-row">
            <div class="rx-main">
              <div class="rx-title">
                {{ r.medication }}
                <span v-if="r.inn_name" class="rx-inn">{{ r.inn_name }}</span>
                <span v-if="r.dose_value" class="rx-dose">{{ r.dose_value }} {{ r.dose_unit || '' }}</span>
              </div>
              <div class="rx-meta">
                {{ r.dosage }} · {{ r.frequency }}
                <span v-if="r.icd10_indication"> · {{ r.icd10_indication }}</span>
              </div>
            </div>
            <div class="rx-tags">
              <span v-if="!r.inn_name" class="tag-warn">без МНН</span>
              <span v-if="r.is_active" class="tag-ok">активно</span>
              <span v-else class="tag-muted">завершено</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Deviations -->
      <section v-if="snapshot.deviations?.length" class="block">
        <h2 class="block-title">Отклонения от протоколов</h2>
        <div class="dev-list">
          <div v-for="d in snapshot.deviations" :key="d.id" class="dev-row">
            <span class="sev-dot" :class="`sev-${d.severity}`" />
            <div class="dev-main">
              <div class="dev-kind">{{ deviationLabel(d.kind) }}</div>
              <div v-if="d.details" class="dev-details">{{ formatDetails(d.details) }}</div>
              <div v-if="d.justification_note" class="dev-justify">
                <b>Обоснование врача:</b> {{ d.justification_note }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Complaints -->
      <section v-if="snapshot.complaints?.length" class="block">
        <h2 class="block-title">Жалобы по этой семье</h2>
        <div class="comp-list">
          <div v-for="c in snapshot.complaints" :key="c.id" class="comp-row">
            <span class="sev-dot" :class="`sev-${c.severity}`" />
            <div>
              <div class="comp-head">
                <span>{{ complaintKindLabel(c.kind) }}</span>
                <span class="comp-date">{{ formatDate(c.created_at) }}</span>
              </div>
              <div class="comp-body">{{ c.body }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Rx alerts -->
      <section v-if="snapshot.rx_alerts?.length" class="block">
        <h2 class="block-title">Rx-алерты этого врача</h2>
        <div class="alert-list">
          <div v-for="a in snapshot.rx_alerts" :key="a.id" class="alert-row">
            <span class="sev-dot" :class="`sev-${a.severity}`" />
            <div>
              <div class="alert-msg">{{ a.message }}</div>
              <div class="alert-meta">{{ formatDate(a.created_at) }} · {{ a.status }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Decision -->
      <section class="block decision-block" :class="{ closed: data.case.status === 'closed' }">
        <h2 class="block-title">Решение главного врача</h2>
        <div v-if="data.case.status === 'closed'" class="closed-decision">
          <div class="decision-line">
            <b>Решение:</b>
            <span class="decision-badge" :class="`dec-${data.case.decision}`">{{ decisionLabel(data.case.decision) }}</span>
          </div>
          <div v-if="data.case.chief_comment" class="closed-comment">
            <b>Комментарий:</b>
            <p>{{ data.case.chief_comment }}</p>
          </div>
        </div>
        <form v-else class="decision-form" @submit.prevent="submit">
          <div class="fg">
            <label class="fl">Комментарий</label>
            <textarea
              v-model="form.chief_comment"
              rows="5"
              class="fi"
              placeholder="Что вы увидели в этом кейсе, какие выводы, кому адресован разбор…"
            />
          </div>
          <div class="fg">
            <label class="fl">Решение</label>
            <div class="radio-row">
              <label v-for="d in decisionOptions" :key="d.key" class="radio-option" :class="{ active: form.decision === d.key }">
                <input v-model="form.decision" type="radio" :value="d.key" />
                <span class="radio-label">
                  <b>{{ d.label }}</b>
                  <span class="radio-desc">{{ d.desc }}</span>
                </span>
              </label>
            </div>
          </div>
          <div v-if="submitError" class="err-box">{{ submitError }}</div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="submitting || !canSubmit">
              <Icon v-if="submitting" name="lucide:loader-2" size="14" class="spin" />
              Закрыть кейс с решением
            </button>
          </div>
        </form>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

import dayjs from 'dayjs'
import 'dayjs/locale/ru'
dayjs.locale('ru')

interface SnapshotData {
  appointment?: any
  prescriptions?: any[]
  deviations?: any[]
  complaints?: any[]
  rx_alerts?: any[]
}
interface CaseReview {
  id: string
  trigger: string
  status: string
  priority: string
  decision: string | null
  chief_comment: string | null
  created_at: string
  reviewed_at: string | null
  snapshot_json: SnapshotData | null
}

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const data = ref<{ case: CaseReview } | null>(null)
const submitting = ref(false)
const submitError = ref('')

const form = reactive<{ chief_comment: string; decision: 'no_violation' | 'training_required' | 'formal_warning' | 'escalate' | '' }>({
  chief_comment: '',
  decision: '',
})

const canSubmit = computed(() => form.chief_comment.trim().length >= 5 && form.decision !== '')

const snapshot = computed<SnapshotData>(() => data.value?.case.snapshot_json ?? {})
const appt = computed(() => snapshot.value.appointment)

const appointmentTitle = computed(() => {
  if (!appt.value) return 'Разбор кейса'
  return appt.value.icd10_primary
    ? `Приём: ${appt.value.icd10_primary}`
    : 'Разбор кейса'
})
const doctorName = computed(() => {
  const doc = appt.value?.doctor
  const u = Array.isArray(doc?.user) ? doc.user[0] : doc?.user
  return u ? `${u.last_name ?? ''} ${u.first_name ?? ''}`.trim() : ''
})
const patientLabel = computed(() => {
  const child = Array.isArray(appt.value?.child) ? appt.value.child[0] : appt.value?.child
  if (child?.name) return child.name
  const fam = Array.isArray(appt.value?.family) ? appt.value.family[0] : appt.value?.family
  const p = fam?.primary_parent
    ? (Array.isArray(fam.primary_parent) ? fam.primary_parent[0] : fam.primary_parent)
    : null
  return p ? `${p.last_name ?? ''} ${p.first_name ?? ''}`.trim() : ''
})
const appointmentDate = computed(() => {
  if (!appt.value?.appointment_date) return '—'
  return dayjs(appt.value.appointment_date).format('D MMM YYYY')
})

const decisionOptions = [
  { key: 'no_violation', label: 'Нарушений нет', desc: 'Ведение в рамках стандартов' },
  { key: 'training_required', label: 'Назначить обучение', desc: 'Отправить врача на профильный курс' },
  { key: 'formal_warning', label: 'Предупреждение', desc: 'Формальное замечание в личное дело' },
  { key: 'escalate', label: 'Эскалировать', desc: 'Передать в комиссию клиники / MAB' },
] as const

function formatDate(d?: string | null) {
  return d ? dayjs(d).format('D MMM YYYY, HH:mm') : ''
}
function triggerLabel(t: string) {
  return ({
    complaint: 'Жалоба', protocol_deviation: 'Отклонение',
    adverse_outcome: 'Неблаг. исход', rx_alert: 'Rx-алерт',
    manual: 'Вручную', no_progress: 'Нет прогресса',
  } as Record<string, string>)[t] || t
}
function statusLabel(s: string) {
  return ({ queued: 'в очереди', in_review: 'в разборе', closed: 'закрыто' } as Record<string, string>)[s] || s
}
function priorityLabel(p: string) {
  return ({ critical: 'Критический', high: 'Высокий', normal: 'Обычный' } as Record<string, string>)[p] || p
}
function decisionLabel(d: string | null) {
  if (!d) return ''
  return ({
    no_violation: 'Нарушений нет', training_required: 'Обучение',
    formal_warning: 'Предупреждение', escalate: 'Эскалация',
  } as Record<string, string>)[d] || d
}
function checklistLabel(k: string) {
  return ({
    complaints: 'жалобы', exam: 'осмотр', diagnosis: 'диагноз',
    plan: 'план', recommendations: 'рекомендации',
  } as Record<string, string>)[k as string] || String(k)
}
function deviationLabel(k: string) {
  return ({
    missing_checklist: 'Не заполнен чек-лист',
    forbidden_drug: 'Запрещённый препарат',
    polypharmacy: 'Полипрагмазия',
    no_follow_up: 'Нет follow-up',
    duration_too_short: 'Слишком короткий приём',
    no_diagnosis: 'Нет диагноза',
  } as Record<string, string>)[k] || k
}
function complaintKindLabel(k: string) {
  return ({ medical: 'Медицинская', service: 'Сервисная', billing: 'Финансовая', other: 'Прочее' } as Record<string, string>)[k] || k
}
function formatDetails(d: any): string {
  if (!d || typeof d !== 'object') return ''
  if (Array.isArray(d.missing_items)) return `Пропущено: ${d.missing_items.join(', ')}`
  if (d.expected_min && d.actual_min) return `Ожидалось ≥ ${d.expected_min} мин, фактически ${d.actual_min}`
  if (d.active_count) return `Активных назначений: ${d.active_count}`
  if (d.reason) return String(d.reason)
  return JSON.stringify(d)
}

async function load() {
  const id = route.params.id as string
  try {
    const res = await $fetch<{ case_review: CaseReview }>(`/api/chief/case-reviews/${id}/snapshot`)
    data.value = { case: res.case_review }
  }
  catch {
    data.value = null
  }
  finally {
    loading.value = false
  }
}

async function submit() {
  if (!data.value || !canSubmit.value) return
  submitError.value = ''
  submitting.value = true
  try {
    await $fetch(`/api/chief/case-reviews/${data.value.case.id}/decision`, {
      method: 'POST',
      body: {
        chief_comment: form.chief_comment.trim(),
        decision: form.decision,
        close: true,
      },
    })
    router.push('/chief/case-reviews')
  }
  catch (err: any) {
    submitError.value = err?.data?.statusMessage || err?.message || 'Не удалось сохранить решение'
  }
  finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.case-detail {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 960px;
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
.hero-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.hero-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
}
.hero-sub {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.trig-badge, .status-badge, .prio-badge {
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.trig-complaint { background: rgba(200, 90, 106, 0.12); color: #c85a6a; }
.trig-protocol_deviation { background: rgba(210, 140, 50, 0.14); color: #b27100; }
.trig-adverse_outcome { background: rgba(200, 90, 106, 0.18); color: #a0404f; }
.trig-rx_alert { background: rgba(139, 126, 200, 0.14); color: var(--color-primary); }
.trig-manual { background: rgba(123, 115, 148, 0.1); color: var(--color-text-muted); }
.trig-no_progress { background: rgba(210, 140, 50, 0.14); color: #b27100; }
.st-queued { background: rgba(139, 126, 200, 0.12); color: var(--color-primary); }
.st-in_review { background: rgba(45, 133, 96, 0.12); color: #2d8560; }
.st-closed { background: rgba(123, 115, 148, 0.1); color: var(--color-text-muted); }
.prio-normal { background: rgba(123, 115, 148, 0.1); color: var(--color-text-muted); }
.prio-high { background: rgba(210, 140, 50, 0.16); color: #b27100; }
.prio-critical { background: rgba(200, 90, 106, 0.16); color: #c85a6a; }

/* Parties */
.parties { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
.party-card {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.1);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.party-lbl { font-size: 0.7rem; color: var(--color-text-muted); }
.party-val { font-weight: 600; color: var(--color-text-primary); font-size: 0.92rem; }

/* Blocks */
.block {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.1);
  border-radius: 16px;
  padding: 18px 22px;
}
.block-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 12px;
}
.block-content { display: flex; flex-direction: column; gap: 10px; }

.detail-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.85rem;
}
.detail-label {
  font-weight: 500;
  color: var(--color-text-muted);
  min-width: 130px;
}
.detail-value { flex: 1; color: var(--color-text-primary); display: flex; gap: 6px; flex-wrap: wrap; }
.detail-value.notes { white-space: pre-wrap; line-height: 1.5; }
.detail-warn { color: #c85a6a; font-style: italic; }

.icd-pill {
  padding: 1px 8px;
  background: rgba(139, 126, 200, 0.1);
  color: var(--color-primary-dark);
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.78rem;
}
.check-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  background: rgba(123, 115, 148, 0.06);
  color: var(--color-text-muted);
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 500;
}
.check-pill.filled {
  background: rgba(45, 133, 96, 0.1);
  color: #2d8560;
}

/* Prescriptions */
.rx-list, .dev-list, .comp-list, .alert-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rx-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(139, 126, 200, 0.03);
  border-radius: 10px;
}
.rx-title {
  font-weight: 600;
  font-size: 0.88rem;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: baseline;
}
.rx-inn { font-weight: 500; font-size: 0.76rem; color: var(--color-primary); }
.rx-dose { font-weight: 500; font-size: 0.76rem; color: var(--color-text-secondary); }
.rx-meta { font-size: 0.74rem; color: var(--color-text-muted); margin-top: 2px; }
.rx-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.tag-ok, .tag-warn, .tag-muted {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.tag-ok { background: rgba(45, 133, 96, 0.12); color: #2d8560; }
.tag-warn { background: rgba(210, 140, 50, 0.14); color: #b27100; }
.tag-muted { background: rgba(123, 115, 148, 0.08); color: var(--color-text-muted); }

.dev-row, .comp-row, .alert-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(139, 126, 200, 0.03);
  border-radius: 10px;
}
.sev-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.sev-low { background: var(--color-text-muted); }
.sev-info { background: var(--color-text-muted); }
.sev-medium { background: #d69432; }
.sev-warning { background: #d69432; }
.sev-high { background: #d85a6a; }
.sev-critical { background: #c85a6a; }

.dev-kind, .comp-head, .alert-msg {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.dev-details, .comp-body, .alert-meta {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  margin-top: 3px;
}
.dev-justify {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
  padding: 6px 10px;
  background: rgba(45, 133, 96, 0.06);
  border-radius: 8px;
}

.comp-date { font-size: 0.72rem; color: var(--color-text-muted); font-weight: 500; }

/* Decision */
.decision-block {
  border: 2px solid rgba(139, 126, 200, 0.22);
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.04), rgba(232, 160, 191, 0.03));
}
.decision-block.closed {
  border-color: rgba(139, 126, 200, 0.1);
  background: white;
}

.decision-form { display: flex; flex-direction: column; gap: 16px; }
.fg { display: flex; flex-direction: column; gap: 6px; }
.fl { font-size: 0.78rem; font-weight: 600; color: var(--color-text-secondary); }
.fi {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  font-size: 0.88rem;
  font-family: var(--font-body);
  outline: none;
  background: white;
  resize: vertical;
  min-height: 80px;
}
.fi:focus { border-color: var(--color-primary); }

.radio-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
}
.radio-option {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
}
.radio-option:hover { border-color: rgba(139, 126, 200, 0.3); }
.radio-option.active {
  border-color: var(--color-primary);
  background: rgba(139, 126, 200, 0.04);
}
.radio-option input { margin-top: 3px; accent-color: var(--color-primary); }
.radio-label { display: flex; flex-direction: column; gap: 2px; }
.radio-label b { font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); }
.radio-desc { font-size: 0.72rem; color: var(--color-text-muted); }

.form-actions { display: flex; justify-content: flex-end; }
.btn-primary {
  padding: 10px 22px;
  background: var(--gradient-cta);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { box-shadow: 0 6px 16px rgba(139, 126, 200, 0.3); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

.closed-decision { display: flex; flex-direction: column; gap: 10px; }
.decision-line { font-size: 0.88rem; display: flex; gap: 8px; align-items: center; }
.decision-badge {
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}
.dec-no_violation { background: rgba(45, 133, 96, 0.12); color: #2d8560; }
.dec-training_required { background: rgba(139, 126, 200, 0.12); color: var(--color-primary); }
.dec-formal_warning { background: rgba(210, 140, 50, 0.14); color: #b27100; }
.dec-escalate { background: rgba(200, 90, 106, 0.14); color: #c85a6a; }
.closed-comment p { margin: 4px 0 0; white-space: pre-wrap; font-size: 0.85rem; color: var(--color-text-primary); line-height: 1.5; }

.err-box {
  padding: 10px 12px;
  background: rgba(200, 90, 106, 0.08);
  color: var(--color-danger);
  border-radius: 8px;
  font-size: 0.82rem;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px;
  background: white;
  border: 1px dashed rgba(139, 126, 200, 0.18);
  border-radius: 16px;
  color: var(--color-text-muted);
}
.back-btn {
  margin-top: 8px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
}

.skel {
  background: linear-gradient(90deg, rgba(139, 126, 200, 0.06), rgba(139, 126, 200, 0.12), rgba(139, 126, 200, 0.06));
  background-size: 200% 100%;
  animation: skel 1.4s ease-in-out infinite;
  border-radius: 14px;
}
.skel-hero { height: 110px; }
.skel-block { height: 160px; }
@keyframes skel {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
