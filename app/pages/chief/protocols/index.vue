<template>
  <div class="protocols">
    <div class="page-hero">
      <NuxtLink to="/chief" class="back-link">
        <Icon name="lucide:chevron-left" size="16" /> К качеству клиники
      </NuxtLink>
      <div class="hero-row">
        <div>
          <h1 class="hero-title">Клинические протоколы</h1>
          <p class="hero-sub">
            {{ protocols.length }} протоколов · {{ stats.ackPct }}% квитанций от врачей
          </p>
        </div>
        <button class="btn-primary" @click="openCreate">
          <Icon name="lucide:plus" size="16" /> Добавить протокол
        </button>
      </div>
    </div>

    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="skel skel-row" />
    </template>

    <div v-else-if="!protocols.length" class="empty-state">
      <Icon name="lucide:book-marked" size="36" />
      <p>Пока нет протоколов. Добавьте первый — он сразу включит ленту отклонений.</p>
      <button class="btn-primary" @click="openCreate">
        <Icon name="lucide:plus" size="14" /> Добавить протокол
      </button>
    </div>

    <div v-else class="proto-list">
      <NuxtLink v-for="p in protocols" :key="p.id" :to="`/chief/protocols/${p.id}`" class="proto-card">
        <div class="card-top">
          <div class="top-left">
            <span class="icd-pill">{{ p.icd10_code }}</span>
            <div class="top-text">
              <h3 class="proto-title">{{ p.title }}</h3>
              <div class="proto-meta">
                версия {{ p.version }} ·
                <span v-if="p.clinic_id">клиника</span>
                <span v-else>MAB / платформа</span>
                <span v-if="p.expected_duration_min"> · ≥ {{ p.expected_duration_min }} мин</span>
                <span v-if="p.follow_up_days"> · follow-up через {{ p.follow_up_days }} д</span>
              </div>
            </div>
          </div>
          <div class="ack-stat">
            <span class="ack-val" :class="ackClass(p.ackPct)">{{ p.ackPct === null ? '—' : `${p.ackPct}%` }}</span>
            <span class="ack-lbl">ознакомились</span>
          </div>
        </div>

        <div v-if="p.required_checklist_items?.length" class="proto-list-items">
          <span class="items-lbl">Обязательно:</span>
          <span v-for="it in p.required_checklist_items" :key="it" class="item-pill">{{ checklistLabel(it) }}</span>
        </div>

        <div v-if="p.recommended_inn?.length || p.forbidden_inn?.length" class="proto-inns">
          <div v-if="p.recommended_inn?.length" class="inn-row">
            <span class="inn-lbl rec">Рекомендовано:</span>
            <span v-for="inn in p.recommended_inn" :key="`r${inn}`" class="inn-chip rec">{{ inn }}</span>
          </div>
          <div v-if="p.forbidden_inn?.length" class="inn-row">
            <span class="inn-lbl forb">Запрещено:</span>
            <span v-for="inn in p.forbidden_inn" :key="`f${inn}`" class="inn-chip forb">{{ inn }}</span>
          </div>
        </div>

        <div v-if="p.source" class="proto-source">
          <Icon name="lucide:external-link" size="12" />
          <a :href="p.source" target="_blank" rel="noopener" @click.stop>{{ sourceDomain(p.source) }}</a>
        </div>
      </NuxtLink>
    </div>

    <!-- Create modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreate" class="overlay" @click.self="closeCreate">
          <div class="sheet">
            <header class="sheet-head">
              <h2 class="sheet-title">Новый протокол</h2>
              <button class="close-btn" @click="closeCreate"><Icon name="lucide:x" size="18" /></button>
            </header>
            <form class="sheet-body" @submit.prevent="submitCreate">
              <div class="fg">
                <label class="fl">Диагноз (МКБ-10) <span class="req">*</span></label>
                <AppSharedIcdAutocomplete v-model="form.icd10_code" />
              </div>
              <div class="fg">
                <label class="fl">Название <span class="req">*</span></label>
                <input v-model="form.title" class="fi" placeholder="Ведение преэклампсии лёгкой степени" />
              </div>
              <div class="fg">
                <label class="fl">Краткое описание</label>
                <textarea v-model="form.summary" rows="2" class="fi" placeholder="Ключевые моменты ведения…" />
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
                  <input v-model.number="form.expected_duration_min" type="number" min="1" max="240" class="fi" placeholder="20" />
                </div>
                <div class="fg">
                  <label class="fl">Follow-up через, дней</label>
                  <input v-model.number="form.follow_up_days" type="number" min="1" max="365" class="fi" placeholder="14" />
                </div>
                <div class="fg">
                  <label class="fl">Полипрагмазия ≥</label>
                  <input v-model.number="form.max_prescriptions" type="number" min="2" max="15" class="fi" placeholder="5" />
                </div>
              </div>

              <div class="fg">
                <label class="fl">Рекомендованные МНН (через запятую)</label>
                <input v-model="recommendedInput" class="fi" placeholder="Метилдопа, Лабеталол" />
              </div>
              <div class="fg">
                <label class="fl">Запрещённые МНН</label>
                <input v-model="forbiddenInput" class="fi" placeholder="Ибупрофен" />
              </div>

              <div class="fg">
                <label class="fl">Источник (URL клинрекомендаций)</label>
                <input v-model="form.source" type="url" class="fi" placeholder="https://…" />
              </div>

              <div v-if="submitError" class="err-box">{{ submitError }}</div>

              <footer class="sheet-foot">
                <button type="button" class="btn btn-ghost" @click="closeCreate">Отмена</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting || !canSubmit">
                  <Icon v-if="submitting" name="lucide:loader-2" size="14" class="spin" />
                  Опубликовать протокол
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
  follow_up_days: number | null
  source: string | null
  ackPct: number | null
}

const sb = useSupabaseClient()
const loading = ref(true)
const protocols = ref<Protocol[]>([])
const doctorCount = ref(1)

const showCreate = ref(false)
const submitting = ref(false)
const submitError = ref('')
const recommendedInput = ref('')
const forbiddenInput = ref('')

const form = reactive<{
  icd10_code: string | null
  title: string
  summary: string
  required_checklist_items: string[]
  expected_duration_min: number | null
  follow_up_days: number | null
  max_prescriptions: number | null
  source: string
}>({
  icd10_code: null,
  title: '',
  summary: '',
  required_checklist_items: [],
  expected_duration_min: null,
  follow_up_days: null,
  max_prescriptions: 5,
  source: '',
})

const checklistOptions = [
  { key: 'complaints', label: 'Жалобы' },
  { key: 'exam', label: 'Осмотр' },
  { key: 'diagnosis', label: 'Диагноз' },
  { key: 'plan', label: 'План' },
  { key: 'recommendations', label: 'Рекомендации' },
]

const canSubmit = computed(() =>
  !!form.icd10_code && form.title.trim().length >= 3,
)

const stats = computed(() => {
  const vals = protocols.value.map(p => p.ackPct).filter((v): v is number => v !== null)
  if (!vals.length) return { ackPct: 0 }
  return { ackPct: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) }
})

function checklistLabel(k: string) {
  return ({
    complaints: 'жалобы', exam: 'осмотр', diagnosis: 'диагноз',
    plan: 'план', recommendations: 'рекомендации',
  } as Record<string, string>)[k] || k
}

function ackClass(v: number | null) {
  if (v === null) return 'muted'
  if (v >= 80) return 'good'
  if (v >= 40) return 'warn'
  return 'low'
}

function sourceDomain(url: string) {
  try { return new URL(url).hostname } catch { return url }
}

async function load() {
  const [protoRes, ackRes, doctorsRes] = await Promise.all([
    sb.from('clinical_protocols')
      .select('id, clinic_id, icd10_code, title, version, summary, required_checklist_items, expected_duration_min, recommended_inn, forbidden_inn, follow_up_days, source')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    sb.from('protocol_acknowledgements').select('protocol_id, version_acknowledged'),
    sb.from('doctors').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ])

  doctorCount.value = Math.max(1, doctorsRes.count ?? 1)
  const ackMap = new Map<string, number>()
  ;(ackRes.data ?? []).forEach((a: any) => {
    ackMap.set(a.protocol_id, (ackMap.get(a.protocol_id) ?? 0) + 1)
  })

  protocols.value = (protoRes.data ?? []).map((p: any) => ({
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
    follow_up_days: p.follow_up_days,
    source: p.source,
    ackPct: Math.round(((ackMap.get(p.id) ?? 0) / doctorCount.value) * 100),
  }))
  loading.value = false
}

function openCreate() {
  showCreate.value = true
  submitError.value = ''
}
function closeCreate() {
  if (submitting.value) return
  showCreate.value = false
  form.icd10_code = null
  form.title = ''
  form.summary = ''
  form.required_checklist_items = []
  form.expected_duration_min = null
  form.follow_up_days = null
  form.max_prescriptions = 5
  form.source = ''
  recommendedInput.value = ''
  forbiddenInput.value = ''
}

async function submitCreate() {
  if (!canSubmit.value) return
  submitting.value = true
  submitError.value = ''

  const { data: me } = await sb.auth.getUser()
  const { data: profile } = await sb.from('users').select('clinic_id').eq('id', me.user!.id).single()

  const payload = {
    clinic_id: profile?.clinic_id ?? null,
    icd10_code: form.icd10_code,
    title: form.title.trim(),
    summary: form.summary.trim() || null,
    required_checklist_items: form.required_checklist_items,
    expected_duration_min: form.expected_duration_min,
    follow_up_days: form.follow_up_days,
    max_prescriptions: form.max_prescriptions ?? 5,
    recommended_inn: recommendedInput.value.split(',').map(s => s.trim()).filter(Boolean),
    forbidden_inn: forbiddenInput.value.split(',').map(s => s.trim()).filter(Boolean),
    source: form.source.trim() || null,
    published_at: new Date().toISOString(),
    published_by: me.user!.id,
    is_active: true,
  }

  const { error } = await sb.from('clinical_protocols').insert(payload)
  if (error) {
    submitError.value = error.message
    submitting.value = false
    return
  }

  closeCreate()
  submitting.value = false
  await load()
}

onMounted(load)
</script>

<style scoped>
.protocols {
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
.hero-row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.hero-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; margin: 0; }
.hero-sub { font-size: 0.85rem; color: var(--color-text-muted); margin-top: 4px; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px;
  background: var(--gradient-cta);
  color: white;
  border: none;
  border-radius: 10px;
  font-family: var(--font-body);
  font-size: 0.85rem; font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { box-shadow: 0 6px 16px rgba(139, 126, 200, 0.3); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

.proto-list { display: flex; flex-direction: column; gap: 10px; }
.proto-card {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.1);
  border-radius: 16px;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}
.proto-card:hover {
  border-color: rgba(139, 126, 200, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(139, 126, 200, 0.08);
}
.card-top {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; flex-wrap: wrap;
}
.top-left { display: flex; gap: 12px; align-items: flex-start; min-width: 0; flex: 1; }
.icd-pill {
  flex-shrink: 0;
  padding: 4px 10px;
  background: rgba(139, 126, 200, 0.12);
  color: var(--color-primary-dark);
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.82rem;
}
.proto-title { margin: 0; font-size: 1rem; font-weight: 700; color: var(--color-text-primary); }
.proto-meta { font-size: 0.78rem; color: var(--color-text-muted); margin-top: 4px; }

.ack-stat { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
.ack-val {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.4rem;
  line-height: 1;
}
.ack-val.good { color: #2d8560; }
.ack-val.warn { color: #b27100; }
.ack-val.low { color: #c85a6a; }
.ack-val.muted { color: var(--color-text-muted); font-weight: 500; }
.ack-lbl { font-size: 0.7rem; color: var(--color-text-muted); margin-top: 3px; }

.proto-list-items { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; font-size: 0.78rem; }
.items-lbl { color: var(--color-text-muted); font-weight: 500; }
.item-pill {
  padding: 2px 8px;
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary-dark);
  border-radius: 6px;
  font-weight: 500;
}

.proto-inns { display: flex; flex-direction: column; gap: 6px; }
.inn-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 0.78rem; }
.inn-lbl { font-weight: 500; }
.inn-lbl.rec { color: #2d8560; }
.inn-lbl.forb { color: #c85a6a; }
.inn-chip {
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
}
.inn-chip.rec { background: rgba(45, 133, 96, 0.1); color: #2d8560; }
.inn-chip.forb { background: rgba(200, 90, 106, 0.1); color: #c85a6a; }

.proto-source {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.76rem;
  color: var(--color-text-muted);
}
.proto-source a { color: var(--color-primary); text-decoration: none; }
.proto-source a:hover { text-decoration: underline; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 48px; background: white; border: 1px dashed rgba(139, 126, 200, 0.18);
  border-radius: 16px; color: var(--color-text-muted); text-align: center;
}

/* Skeleton */
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

/* Modal */
.overlay {
  position: fixed; inset: 0;
  background: rgba(74, 68, 88, 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
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
  box-shadow: 0 20px 60px rgba(74, 68, 88, 0.25);
}
.sheet-head {
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border-light);
  display: flex; align-items: center; justify-content: space-between;
}
.sheet-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; margin: 0; }
.close-btn {
  background: none; border: none; cursor: pointer;
  padding: 6px; border-radius: var(--radius-sm);
  color: var(--color-text-muted);
}
.close-btn:hover { color: var(--color-danger); background: rgba(200, 90, 106, 0.06); }

.sheet-body { overflow-y: auto; padding: 18px 22px; display: flex; flex-direction: column; gap: 14px; }
.fg { display: flex; flex-direction: column; gap: 6px; }
.fg-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.fl { font-size: 0.78rem; font-weight: 600; color: var(--color-text-secondary); }
.req { color: var(--color-danger); }
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
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 6px;
}
.check-row {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px;
  font-size: 0.82rem;
  cursor: pointer;
  border-radius: 8px;
}
.check-row:hover { background: rgba(139, 126, 200, 0.04); }
.check-row input { cursor: pointer; accent-color: var(--color-primary); }

.sheet-foot {
  padding: 14px 22px 20px;
  border-top: 1px solid var(--color-border-light);
  display: flex; gap: 8px; justify-content: flex-end;
}
.btn {
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: var(--font-body);
  display: inline-flex; align-items: center; gap: 6px;
}
.btn-ghost {
  background: white;
  color: var(--color-text-secondary);
  border-color: var(--color-border-light);
}
.btn-ghost:hover { background: rgba(139, 126, 200, 0.04); }

.err-box {
  padding: 10px 12px;
  background: rgba(200, 90, 106, 0.08);
  color: var(--color-danger);
  border-radius: 8px;
  font-size: 0.82rem;
}

.modal-enter-active, .modal-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .sheet, .modal-leave-to .sheet { transform: translateY(24px); }
</style>
