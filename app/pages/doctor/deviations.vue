<template>
  <div class="doc-dev">
    <div class="page-hero">
      <NuxtLink to="/doctor" class="back-link">
        <Icon name="lucide:chevron-left" size="16" /> Панель
      </NuxtLink>
      <div class="hero-row">
        <div>
          <h1 class="hero-title">Мои отклонения от протоколов</h1>
          <p class="hero-sub">
            {{ pending.length }} требуют обоснования ·
            {{ justifiedCount }} обосновано · {{ resolvedCount }} закрыто
          </p>
        </div>
      </div>
    </div>

    <div class="filters">
      <button
        v-for="f in tabs"
        :key="f.key"
        class="tab"
        :class="{ active: tab === f.key }"
        @click="tab = f.key"
      >
        {{ f.label }}
        <span v-if="f.count !== undefined" class="tab-count">{{ f.count }}</span>
      </button>
    </div>

    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="skel skel-row" />
    </template>

    <div v-else-if="!visible.length" class="empty-state">
      <Icon name="lucide:check-circle-2" size="36" />
      <p v-if="tab === 'pending'">Нет отклонений, требующих обоснования. Отличная работа.</p>
      <p v-else>Пусто.</p>
    </div>

    <div v-else class="dev-list">
      <div v-for="d in visible" :key="d.id" class="dev-card" :class="{ justified: d.justified, resolved: d.resolved }">
        <div class="card-top">
          <span class="sev-dot" :class="`sev-${d.severity}`" />
          <div class="card-main">
            <div class="card-title-row">
              <span class="kind-badge">{{ kindLabel(d.kind) }}</span>
              <span v-if="d.resolved" class="tag ok">закрыто главным врачом</span>
              <span v-else-if="d.justified" class="tag info">обоснование отправлено</span>
              <span v-else class="tag warn">требует обоснования</span>
              <span class="date">{{ formatDate(d.detected_at) }}</span>
            </div>
            <div class="card-meta">
              <span v-if="d.apptLabel" class="meta-link">Приём: {{ d.apptLabel }}</span>
              <span v-if="d.icd10"> · {{ d.icd10 }}</span>
            </div>
            <div v-if="d.details" class="card-details">{{ formatDetails(d.details) }}</div>
            <div v-if="d.justification_note" class="existing-justify">
              <b>Ваше обоснование:</b> {{ d.justification_note }}
            </div>
          </div>
        </div>

        <!-- Justify form -->
        <div v-if="!d.justified && !d.resolved" class="justify-form">
          <label class="fl">Причина отклонения</label>
          <textarea
            :value="drafts[d.id] ?? ''"
            rows="2"
            class="fi"
            placeholder="Например: пациент отказался от полного осмотра, зафиксировано в карте"
            @input="drafts[d.id] = ($event.target as HTMLTextAreaElement).value"
          />
          <div class="form-actions">
            <button
              class="btn-primary"
              :disabled="busy === d.id || !(drafts[d.id] ?? '').trim()"
              @click="justify(d)"
            >
              <Icon v-if="busy === d.id" name="lucide:loader-2" size="12" class="spin" />
              Отправить обоснование
            </button>
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

interface DevRow {
  id: string
  kind: string
  severity: string
  details: any
  justified: boolean
  resolved: boolean
  justification_note: string | null
  detected_at: string
  appointment_id: string
  apptLabel: string
  icd10: string | null
}

const sb = useSupabaseClient()
const loading = ref(true)
const all = ref<DevRow[]>([])
const drafts = reactive<Record<string, string>>({})
const busy = ref<string | null>(null)
const tab = ref<'pending' | 'justified' | 'resolved'>('pending')

const pending = computed(() => all.value.filter(d => !d.justified && !d.resolved))
const justifiedCount = computed(() => all.value.filter(d => d.justified && !d.resolved).length)
const resolvedCount = computed(() => all.value.filter(d => d.resolved).length)

const tabs = computed(() => [
  { key: 'pending', label: 'Требуют обоснования', count: pending.value.length },
  { key: 'justified', label: 'Отправлено', count: justifiedCount.value },
  { key: 'resolved', label: 'Закрыто', count: resolvedCount.value },
])

const visible = computed(() => {
  if (tab.value === 'pending') return pending.value
  if (tab.value === 'justified') return all.value.filter(d => d.justified && !d.resolved)
  return all.value.filter(d => d.resolved)
})

function kindLabel(k: string) {
  return ({
    missing_checklist: 'Пропущен чек-лист',
    forbidden_drug: 'Запрещённый препарат',
    polypharmacy: 'Полипрагмазия',
    no_follow_up: 'Нет follow-up',
    duration_too_short: 'Слишком короткий приём',
    no_diagnosis: 'Нет диагноза',
  } as Record<string, string>)[k] || k
}

function formatDetails(d: any) {
  if (!d || typeof d !== 'object') return ''
  if (Array.isArray(d.missing_items)) return `Пропущено: ${d.missing_items.join(', ')}`
  if (d.expected_min && d.actual_min) return `Ожидалось ≥ ${d.expected_min} мин, фактически ${d.actual_min}`
  if (d.active_count) return `Активных назначений: ${d.active_count}`
  return ''
}
function formatDate(d: string) { return dayjs(d).format('D MMM, HH:mm') }

async function load() {
  // Resolve current doctor_id
  const { data: user } = await sb.auth.getUser()
  if (!user.user?.id) { loading.value = false; return }

  const { data: doctor } = await sb
    .from('doctors')
    .select('id')
    .eq('user_id', user.user.id)
    .maybeSingle()
  if (!doctor) { loading.value = false; return }

  const { data } = await sb
    .from('protocol_deviations')
    .select(`
      id, kind, severity, details, justified, resolved,
      justification_note, detected_at, appointment_id,
      appointment:appointments!appointment_id (
        icd10_primary, appointment_date, start_time,
        family:families!family_id (
          primary_parent:users!families_primary_parent_id_fkey ( first_name, last_name )
        )
      )
    `)
    .eq('doctor_id', doctor.id)
    .order('detected_at', { ascending: false })
    .limit(100)

  all.value = (data ?? []).map((r: any) => {
    const appt = Array.isArray(r.appointment) ? r.appointment[0] : r.appointment
    const fam = appt?.family
      ? (Array.isArray(appt.family) ? appt.family[0] : appt.family)
      : null
    const parent = fam?.primary_parent
      ? (Array.isArray(fam.primary_parent) ? fam.primary_parent[0] : fam.primary_parent)
      : null
    const patient = parent ? `${parent.last_name ?? ''} ${parent.first_name ?? ''}`.trim() : ''
    const apptLabel = appt?.appointment_date
      ? `${patient ? patient + ', ' : ''}${dayjs(appt.appointment_date).format('D MMM')} ${appt.start_time?.slice(0,5) ?? ''}`.trim()
      : ''
    return {
      id: r.id,
      kind: r.kind,
      severity: r.severity,
      details: r.details,
      justified: r.justified,
      resolved: r.resolved,
      justification_note: r.justification_note,
      detected_at: r.detected_at,
      appointment_id: r.appointment_id,
      apptLabel,
      icd10: appt?.icd10_primary ?? null,
    }
  })
  loading.value = false
}

async function justify(d: DevRow) {
  const note = (drafts[d.id] ?? '').trim()
  if (!note) return
  busy.value = d.id
  try {
    const { data: user } = await sb.auth.getUser()
    const { error } = await sb
      .from('protocol_deviations')
      .update({
        justified: true,
        justification_note: note,
        justified_by: user.user?.id ?? null,
        justified_at: new Date().toISOString(),
      })
      .eq('id', d.id)
    if (error) throw error
    d.justified = true
    d.justification_note = note
    delete drafts[d.id]
  }
  catch (err: any) {
    alert(err?.message || 'Не удалось сохранить обоснование')
  }
  finally {
    busy.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.doc-dev {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 860px;
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
.hero-title { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; margin: 0; }
.hero-sub { font-size: 0.85rem; color: var(--color-text-muted); margin-top: 4px; }

.filters { display: flex; gap: 6px; flex-wrap: wrap; }
.tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  background: white;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}
.tab.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
.tab-count {
  background: rgba(0, 0, 0, 0.12);
  padding: 1px 8px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
}
.tab.active .tab-count { background: rgba(255, 255, 255, 0.25); }

.dev-list { display: flex; flex-direction: column; gap: 10px; }
.dev-card {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.1);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dev-card.justified:not(.resolved) { border-color: rgba(45, 133, 96, 0.22); background: rgba(45, 133, 96, 0.02); }
.dev-card.resolved { opacity: 0.65; }

.card-top { display: flex; gap: 12px; align-items: flex-start; }
.sev-dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 8px; flex-shrink: 0; }
.sev-low, .sev-info { background: var(--color-text-muted); }
.sev-medium, .sev-warning { background: #d69432; }
.sev-high { background: #d85a6a; }
.sev-critical { background: #c85a6a; }

.card-main { flex: 1; min-width: 0; }
.card-title-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.kind-badge {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.1);
  color: var(--color-primary-dark);
  font-size: 0.72rem;
  font-weight: 600;
}
.tag {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.tag.ok { background: rgba(45, 133, 96, 0.12); color: #2d8560; }
.tag.info { background: rgba(45, 133, 96, 0.1); color: #2d8560; }
.tag.warn { background: rgba(210, 140, 50, 0.14); color: #b27100; }

.date { font-size: 0.72rem; color: var(--color-text-muted); margin-left: auto; }

.card-meta {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  margin-top: 6px;
}
.meta-link { font-weight: 500; color: var(--color-text-primary); }

.card-details {
  margin-top: 8px;
  font-size: 0.82rem;
  padding: 8px 12px;
  background: rgba(139, 126, 200, 0.04);
  border-radius: 8px;
  color: var(--color-text-secondary);
}

.existing-justify {
  margin-top: 8px;
  padding: 10px 14px;
  background: rgba(45, 133, 96, 0.06);
  color: var(--color-text-primary);
  border-radius: 10px;
  font-size: 0.85rem;
  line-height: 1.5;
}

.justify-form {
  padding-top: 12px;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.fl { font-size: 0.78rem; font-weight: 600; color: var(--color-text-secondary); }
.fi {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  font-size: 0.85rem;
  font-family: var(--font-body);
  outline: none;
  background: white;
  resize: vertical;
}
.fi:focus { border-color: var(--color-primary); }

.form-actions { display: flex; justify-content: flex-end; }
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 56px;
  background: white;
  border: 1px dashed rgba(139, 126, 200, 0.18);
  border-radius: 16px;
  color: var(--color-text-muted);
  text-align: center;
}

.skel {
  background: linear-gradient(90deg, rgba(139, 126, 200, 0.06), rgba(139, 126, 200, 0.12), rgba(139, 126, 200, 0.06));
  background-size: 200% 100%;
  animation: skel 1.4s ease-in-out infinite;
  border-radius: 14px;
}
.skel-row { height: 110px; }
@keyframes skel { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
