<template>
  <div class="proto-detail">
    <template v-if="loading">
      <div class="skel skel-hero" />
      <div class="skel skel-block" />
      <div class="skel skel-block" />
    </template>

    <div v-else-if="!protocol" class="empty-state">
      <Icon name="lucide:file-x" size="36" />
      <p>Протокол не найден.</p>
      <NuxtLink to="/chief/protocols" class="back-btn">К списку</NuxtLink>
    </div>

    <template v-else>
      <!-- Hero -->
      <div class="page-hero">
        <NuxtLink to="/chief/protocols" class="back-link">
          <Icon name="lucide:chevron-left" size="16" /> К протоколам
        </NuxtLink>
        <div class="hero-row">
          <div class="hero-main">
            <div class="hero-badges">
              <span class="icd-pill">{{ protocol.icd10_code }}</span>
              <span class="ver-badge">версия {{ protocol.version }}</span>
              <span v-if="!protocol.clinic_id" class="global-badge">MAB / платформа</span>
            </div>
            <h1 class="hero-title">{{ protocol.title }}</h1>
            <p v-if="protocol.summary" class="hero-sub">{{ protocol.summary }}</p>
          </div>
          <div class="hero-actions">
            <button class="btn btn-primary" @click="openEdit">
              <Icon name="lucide:pencil" size="14" /> Редактировать
            </button>
          </div>
        </div>
      </div>

      <!-- KPI ack stats -->
      <section class="stats-row">
        <div class="stat-card">
          <div class="stat-val" :class="ackClass(ackPct)">{{ ackPct }}%</div>
          <div class="stat-lbl">ознакомились с v{{ protocol.version }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">{{ ackCurrent }}</div>
          <div class="stat-lbl">врачей на актуальной версии</div>
        </div>
        <div class="stat-card">
          <div class="stat-val warn">{{ ackStale }}</div>
          <div class="stat-lbl">читали старую версию</div>
        </div>
        <div class="stat-card">
          <div class="stat-val low">{{ ackNone }}</div>
          <div class="stat-lbl">не ознакомились</div>
        </div>
      </section>

      <!-- Full protocol content -->
      <section class="block">
        <h2 class="block-title">Содержание протокола</h2>
        <div class="content-grid">
          <div class="content-row">
            <span class="content-lbl">Обязательные пункты</span>
            <div class="content-val">
              <span v-for="it in protocol.required_checklist_items" :key="it" class="pill">{{ checklistLabel(it) }}</span>
              <span v-if="!protocol.required_checklist_items?.length" class="muted">не указаны</span>
            </div>
          </div>
          <div class="content-row">
            <span class="content-lbl">Мин. длительность</span>
            <span class="content-val">
              <span v-if="protocol.expected_duration_min">{{ protocol.expected_duration_min }} мин</span>
              <span v-else class="muted">не указана</span>
            </span>
          </div>
          <div class="content-row">
            <span class="content-lbl">Follow-up</span>
            <span class="content-val">
              <span v-if="protocol.follow_up_days">через {{ protocol.follow_up_days }} дней</span>
              <span v-else class="muted">не указан</span>
            </span>
          </div>
          <div class="content-row">
            <span class="content-lbl">Полипрагмазия ≥</span>
            <span class="content-val">{{ protocol.max_prescriptions ?? 5 }} назначений</span>
          </div>
          <div v-if="protocol.recommended_inn?.length" class="content-row">
            <span class="content-lbl">Рекомендованные МНН</span>
            <div class="content-val">
              <span v-for="inn in protocol.recommended_inn" :key="`r${inn}`" class="pill rec">{{ inn }}</span>
            </div>
          </div>
          <div v-if="protocol.forbidden_inn?.length" class="content-row">
            <span class="content-lbl">Запрещённые МНН</span>
            <div class="content-val">
              <span v-for="inn in protocol.forbidden_inn" :key="`f${inn}`" class="pill forb">{{ inn }}</span>
            </div>
          </div>
          <div v-if="protocol.source" class="content-row">
            <span class="content-lbl">Источник</span>
            <a class="content-val source-link" :href="protocol.source" target="_blank" rel="noopener">
              {{ sourceDomain(protocol.source) }}
              <Icon name="lucide:external-link" size="12" />
            </a>
          </div>
        </div>
      </section>

      <!-- Ack tracker -->
      <section class="block">
        <div class="block-head">
          <h2 class="block-title">Квитанции врачей</h2>
          <div class="tab-row">
            <button
              v-for="t in ackTabs"
              :key="t.key"
              class="tab"
              :class="{ active: ackTab === t.key }"
              @click="ackTab = t.key"
            >
              {{ t.label }} <span class="tab-count">{{ t.count }}</span>
            </button>
          </div>
        </div>

        <div v-if="filteredDoctors.length" class="doc-ack-list">
          <div v-for="d in filteredDoctors" :key="d.id" class="doc-ack-row">
            <div class="doc-left">
              <div class="avatar">{{ initials(d.name) }}</div>
              <div>
                <div class="doc-name">{{ d.name }}</div>
                <div class="doc-spec">{{ specLabel(d.specialty) }}</div>
              </div>
            </div>
            <div class="doc-right">
              <span v-if="d.ackStatus === 'current'" class="tag ok">
                <Icon name="lucide:check" size="11" /> v{{ d.ackedVersion }} · {{ formatDate(d.ackedAt) }}
              </span>
              <span v-else-if="d.ackStatus === 'stale'" class="tag warn">
                <Icon name="lucide:history" size="11" /> v{{ d.ackedVersion }} (устарело)
              </span>
              <span v-else class="tag muted">
                <Icon name="lucide:minus" size="11" /> не ознакомлен
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-inline">В этом фильтре никого нет.</div>
      </section>
    </template>

    <!-- Edit modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEdit" class="overlay" @click.self="closeEdit">
          <div class="sheet">
            <header class="sheet-head">
              <h2 class="sheet-title">Редактировать протокол</h2>
              <button class="close-btn" @click="closeEdit"><Icon name="lucide:x" size="18" /></button>
            </header>
            <form class="sheet-body" @submit.prevent="submitEdit">
              <div class="fg">
                <label class="fl">Название</label>
                <input v-model="form.title" class="fi" />
              </div>
              <div class="fg">
                <label class="fl">Краткое описание</label>
                <textarea v-model="form.summary" rows="2" class="fi" />
              </div>

              <div class="fg">
                <label class="fl">Обязательные пункты чек-листа</label>
                <div class="check-grid">
                  <label v-for="it in checklistOptions" :key="it.key" class="check-row">
                    <input v-model="form.required_checklist_items" type="checkbox" :value="it.key" />
                    <span>{{ it.label }}</span>
                  </label>
                </div>
              </div>

              <div class="fg-row">
                <div class="fg">
                  <label class="fl">Мин. длительность, мин</label>
                  <input v-model.number="form.expected_duration_min" type="number" min="1" class="fi" />
                </div>
                <div class="fg">
                  <label class="fl">Follow-up, дней</label>
                  <input v-model.number="form.follow_up_days" type="number" min="1" class="fi" />
                </div>
                <div class="fg">
                  <label class="fl">Полипрагмазия ≥</label>
                  <input v-model.number="form.max_prescriptions" type="number" min="2" class="fi" />
                </div>
              </div>

              <div class="fg">
                <label class="fl">Рекомендованные МНН (через запятую)</label>
                <input v-model="form.recommendedInput" class="fi" />
              </div>
              <div class="fg">
                <label class="fl">Запрещённые МНН</label>
                <input v-model="form.forbiddenInput" class="fi" />
              </div>

              <div class="fg">
                <label class="fl">Источник</label>
                <input v-model="form.source" type="url" class="fi" />
              </div>

              <label class="version-toggle">
                <input v-model="form.bumpVersion" type="checkbox" />
                <div>
                  <b>Опубликовать как новую версию (v{{ (protocol?.version ?? 1) + 1 }})</b>
                  <span class="version-hint">Квитанции врачей станут устаревшими — им нужно будет заново ознакомиться.</span>
                </div>
              </label>

              <div v-if="saveError" class="err-box">{{ saveError }}</div>

              <footer class="sheet-foot">
                <button type="button" class="btn btn-ghost" @click="closeEdit">Отмена</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <Icon v-if="saving" name="lucide:loader-2" size="14" class="spin" />
                  Сохранить
                </button>
              </footer>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

import dayjs from 'dayjs'
import 'dayjs/locale/ru'
dayjs.locale('ru')

interface Protocol {
  id: string
  clinic_id: string | null
  icd10_code: string
  title: string
  version: number
  summary: string | null
  required_checklist_items: string[]
  expected_duration_min: number | null
  recommended_inn: string[]
  forbidden_inn: string[]
  max_prescriptions: number | null
  follow_up_days: number | null
  source: string | null
}

interface DoctorAck {
  id: string
  name: string
  specialty: string
  ackStatus: 'current' | 'stale' | 'none'
  ackedVersion: number | null
  ackedAt: string | null
}

const route = useRoute()
const sb = useSupabaseClient()

const loading = ref(true)
const protocol = ref<Protocol | null>(null)
const doctors = ref<DoctorAck[]>([])

const showEdit = ref(false)
const saving = ref(false)
const saveError = ref('')

const ackTab = ref<'all' | 'current' | 'stale' | 'none'>('all')

const form = reactive<{
  title: string
  summary: string
  required_checklist_items: string[]
  expected_duration_min: number | null
  follow_up_days: number | null
  max_prescriptions: number | null
  source: string
  recommendedInput: string
  forbiddenInput: string
  bumpVersion: boolean
}>({
  title: '',
  summary: '',
  required_checklist_items: [],
  expected_duration_min: null,
  follow_up_days: null,
  max_prescriptions: 5,
  source: '',
  recommendedInput: '',
  forbiddenInput: '',
  bumpVersion: false,
})

const checklistOptions = [
  { key: 'complaints', label: 'Жалобы' },
  { key: 'exam', label: 'Осмотр' },
  { key: 'diagnosis', label: 'Диагноз' },
  { key: 'plan', label: 'План' },
  { key: 'recommendations', label: 'Рекомендации' },
]

const ackCurrent = computed(() => doctors.value.filter(d => d.ackStatus === 'current').length)
const ackStale = computed(() => doctors.value.filter(d => d.ackStatus === 'stale').length)
const ackNone = computed(() => doctors.value.filter(d => d.ackStatus === 'none').length)
const ackPct = computed(() => {
  if (!doctors.value.length) return 0
  return Math.round((ackCurrent.value / doctors.value.length) * 100)
})

const ackTabs = computed(() => [
  { key: 'all', label: 'Все', count: doctors.value.length },
  { key: 'none', label: 'Не ознакомлены', count: ackNone.value },
  { key: 'stale', label: 'Устарело', count: ackStale.value },
  { key: 'current', label: 'Актуально', count: ackCurrent.value },
])

const filteredDoctors = computed(() => {
  if (ackTab.value === 'all') return doctors.value
  return doctors.value.filter(d => d.ackStatus === ackTab.value)
})

function checklistLabel(k: string) {
  return ({
    complaints: 'Жалобы', exam: 'Осмотр', diagnosis: 'Диагноз',
    plan: 'План', recommendations: 'Рекомендации',
  } as Record<string, string>)[k] || k
}
function specLabel(s: string) {
  return ({
    gynecologist: 'Гинеколог', pediatrician: 'Педиатр', neonatologist: 'Неонатолог',
    ultrasound: 'УЗИ', lab: 'Лаборатория', doctor: 'Врач', nurse: 'Медсестра',
  } as Record<string, string>)[s] || s
}
function initials(name: string) {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
function ackClass(pct: number) {
  if (pct >= 80) return 'good'
  if (pct >= 40) return 'warn'
  return 'low'
}
function formatDate(d?: string | null) {
  return d ? dayjs(d).format('D MMM') : ''
}
function sourceDomain(url: string) {
  try { return new URL(url).hostname } catch { return url }
}

async function load() {
  const id = route.params.id as string

  const [protoRes, doctorsRes, ackRes] = await Promise.all([
    sb.from('clinical_protocols')
      .select('id, clinic_id, icd10_code, title, version, summary, required_checklist_items, expected_duration_min, recommended_inn, forbidden_inn, max_prescriptions, follow_up_days, source')
      .eq('id', id)
      .maybeSingle(),
    sb.from('doctors')
      .select('id, specialty, user:users!doctors_user_id_fkey(first_name, last_name)')
      .eq('is_active', true),
    sb.from('protocol_acknowledgements')
      .select('doctor_id, version_acknowledged, acknowledged_at')
      .eq('protocol_id', id),
  ])

  if (!protoRes.data) {
    loading.value = false
    return
  }
  const p: any = protoRes.data
  protocol.value = {
    id: p.id,
    clinic_id: p.clinic_id,
    icd10_code: p.icd10_code,
    title: p.title,
    version: p.version,
    summary: p.summary,
    required_checklist_items: p.required_checklist_items ?? [],
    expected_duration_min: p.expected_duration_min,
    recommended_inn: p.recommended_inn ?? [],
    forbidden_inn: p.forbidden_inn ?? [],
    max_prescriptions: p.max_prescriptions,
    follow_up_days: p.follow_up_days,
    source: p.source,
  }

  const ackMap = new Map<string, { version: number; at: string }>()
  ;(ackRes.data ?? []).forEach((a: any) => {
    ackMap.set(a.doctor_id, { version: a.version_acknowledged, at: a.acknowledged_at })
  })

  doctors.value = (doctorsRes.data ?? []).map((d: any) => {
    const u = Array.isArray(d.user) ? d.user[0] : d.user
    const name = u ? `${u.last_name ?? ''} ${u.first_name ?? ''}`.trim() : 'Без имени'
    const ack = ackMap.get(d.id)
    let status: 'current' | 'stale' | 'none' = 'none'
    if (ack) status = ack.version >= protocol.value!.version ? 'current' : 'stale'
    return {
      id: d.id,
      name,
      specialty: d.specialty,
      ackStatus: status,
      ackedVersion: ack?.version ?? null,
      ackedAt: ack?.at ?? null,
    }
  }).sort((a, b) => {
    // unacknowledged doctors first, then stale, then current
    const order = { none: 0, stale: 1, current: 2 }
    if (order[a.ackStatus] !== order[b.ackStatus]) return order[a.ackStatus] - order[b.ackStatus]
    return a.name.localeCompare(b.name, 'ru')
  })

  loading.value = false
}

function openEdit() {
  if (!protocol.value) return
  form.title = protocol.value.title
  form.summary = protocol.value.summary ?? ''
  form.required_checklist_items = [...protocol.value.required_checklist_items]
  form.expected_duration_min = protocol.value.expected_duration_min
  form.follow_up_days = protocol.value.follow_up_days
  form.max_prescriptions = protocol.value.max_prescriptions ?? 5
  form.source = protocol.value.source ?? ''
  form.recommendedInput = protocol.value.recommended_inn.join(', ')
  form.forbiddenInput = protocol.value.forbidden_inn.join(', ')
  form.bumpVersion = false
  saveError.value = ''
  showEdit.value = true
}

function closeEdit() {
  if (saving.value) return
  showEdit.value = false
}

async function submitEdit() {
  if (!protocol.value) return
  saving.value = true
  saveError.value = ''
  try {
    const newVersion = form.bumpVersion ? protocol.value.version + 1 : protocol.value.version
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      required_checklist_items: form.required_checklist_items,
      expected_duration_min: form.expected_duration_min,
      follow_up_days: form.follow_up_days,
      max_prescriptions: form.max_prescriptions ?? 5,
      recommended_inn: form.recommendedInput.split(',').map(s => s.trim()).filter(Boolean),
      forbidden_inn: form.forbiddenInput.split(',').map(s => s.trim()).filter(Boolean),
      source: form.source.trim() || null,
      version: newVersion,
    }
    if (form.bumpVersion) {
      payload.published_at = new Date().toISOString()
      const { data: me } = await sb.auth.getUser()
      if (me.user?.id) payload.published_by = me.user.id
    }
    const { error } = await sb
      .from('clinical_protocols')
      .update(payload)
      .eq('id', protocol.value.id)
    if (error) throw error
    showEdit.value = false
    await load()
  }
  catch (err: any) {
    saveError.value = err?.message || 'Не удалось сохранить'
  }
  finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.proto-detail {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 1000px;
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
  margin-bottom: 10px;
}
.back-link:hover { color: var(--color-primary); }
.hero-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.hero-main { flex: 1; min-width: 280px; }
.hero-badges { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-bottom: 10px; }
.icd-pill {
  padding: 3px 10px;
  background: rgba(139, 126, 200, 0.14);
  color: var(--color-primary-dark);
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
}
.ver-badge {
  padding: 2px 10px;
  background: rgba(45, 133, 96, 0.12);
  color: #2d8560;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.global-badge {
  padding: 2px 10px;
  background: rgba(168, 200, 232, 0.25);
  color: #3a6a95;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.hero-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 6px;
}
.hero-sub { font-size: 0.92rem; color: var(--color-text-secondary); margin: 0; line-height: 1.5; }

.hero-actions { display: flex; gap: 8px; flex-shrink: 0; }

/* Stats row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}
.stat-card {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.1);
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.stat-val {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
}
.stat-val.good { color: #2d8560; }
.stat-val.warn { color: #b27100; }
.stat-val.low { color: #c85a6a; }
.stat-lbl { font-size: 0.72rem; color: var(--color-text-muted); }

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
.block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.block-head .block-title { margin: 0; }

.content-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.content-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 12px;
  align-items: start;
  font-size: 0.88rem;
}
.content-lbl { color: var(--color-text-muted); font-weight: 500; }
.content-val { color: var(--color-text-primary); display: flex; gap: 6px; flex-wrap: wrap; }
.muted { color: var(--color-text-muted); font-style: italic; }

.pill {
  padding: 2px 10px;
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary-dark);
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
}
.pill.rec { background: rgba(45, 133, 96, 0.1); color: #2d8560; }
.pill.forb { background: rgba(200, 90, 106, 0.1); color: #c85a6a; }

.source-link {
  color: var(--color-primary);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.source-link:hover { text-decoration: underline; }

/* Ack tracker */
.tab-row { display: flex; gap: 4px; flex-wrap: wrap; }
.tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  background: white;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}
.tab.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.tab-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 1px 7px;
  border-radius: var(--radius-full);
  font-size: 0.68rem;
  font-weight: 700;
}
.tab.active .tab-count { background: rgba(255, 255, 255, 0.25); }

.doc-ack-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.doc-ack-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(139, 126, 200, 0.03);
  gap: 10px;
}
.doc-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--gradient-cta);
  color: white;
  font-weight: 700;
  font-size: 0.72rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.doc-name { font-size: 0.88rem; font-weight: 600; color: var(--color-text-primary); }
.doc-spec { font-size: 0.72rem; color: var(--color-text-muted); }

.doc-right { flex-shrink: 0; }
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 600;
}
.tag.ok { background: rgba(45, 133, 96, 0.12); color: #2d8560; }
.tag.warn { background: rgba(210, 140, 50, 0.14); color: #b27100; }
.tag.muted { background: rgba(123, 115, 148, 0.1); color: var(--color-text-muted); }

.empty-inline {
  padding: 20px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  background: rgba(139, 126, 200, 0.03);
  border: 1px dashed rgba(139, 126, 200, 0.15);
  border-radius: 10px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
  background: white;
  border: 1px dashed rgba(139, 126, 200, 0.18);
  border-radius: 16px;
  color: var(--color-text-muted);
}
.back-btn {
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Buttons */
.btn {
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: var(--font-body);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.btn-primary { background: var(--color-primary); color: white; }
.btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); box-shadow: 0 4px 12px rgba(139, 126, 200, 0.3); }
.btn-primary:disabled { opacity: 0.6; cursor: wait; }
.btn-ghost {
  background: white;
  color: var(--color-text-secondary);
  border-color: var(--color-border-light);
}
.btn-ghost:hover:not(:disabled) { background: rgba(139, 126, 200, 0.04); }

/* Modal */
.overlay {
  position: fixed; inset: 0;
  background: rgba(74, 68, 88, 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 80;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.sheet {
  width: 100%;
  max-width: 560px;
  background: white;
  border-radius: 20px;
  max-height: 88vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.sheet-head {
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sheet-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  padding: 6px;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
}
.close-btn:hover { color: var(--color-danger); }

.sheet-body {
  padding: 18px 22px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.fg { display: flex; flex-direction: column; gap: 6px; }
.fg-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.fl { font-size: 0.78rem; font-weight: 600; color: var(--color-text-secondary); }
.fi {
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

.check-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 6px;
}
.check-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 0.82rem;
  cursor: pointer;
  border-radius: 8px;
}
.check-row:hover { background: rgba(139, 126, 200, 0.04); }
.check-row input { accent-color: var(--color-primary); cursor: pointer; }

.version-toggle {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border: 1px dashed rgba(210, 140, 50, 0.35);
  background: rgba(210, 140, 50, 0.05);
  border-radius: 12px;
  cursor: pointer;
  align-items: flex-start;
}
.version-toggle input { margin-top: 3px; accent-color: #b27100; }
.version-toggle b { font-size: 0.88rem; color: var(--color-text-primary); display: block; margin-bottom: 4px; }
.version-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.45;
}

.err-box {
  padding: 10px 12px;
  background: rgba(200, 90, 106, 0.08);
  color: var(--color-danger);
  border-radius: 8px;
  font-size: 0.82rem;
}

.sheet-foot {
  padding: 14px 22px 20px;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.modal-enter-active, .modal-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .sheet, .modal-leave-to .sheet { transform: translateY(24px); }

/* Skeleton */
.skel {
  background: linear-gradient(90deg, rgba(139, 126, 200, 0.06), rgba(139, 126, 200, 0.12), rgba(139, 126, 200, 0.06));
  background-size: 200% 100%;
  animation: skel 1.4s ease-in-out infinite;
  border-radius: 14px;
}
.skel-hero { height: 120px; }
.skel-block { height: 180px; }
@keyframes skel { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

@media (max-width: 700px) {
  .content-row { grid-template-columns: 1fr; gap: 4px; }
}
</style>
