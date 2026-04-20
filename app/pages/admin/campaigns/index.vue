<template>
  <div class="page">
    <div class="page-hero">
      <NuxtLink to="/admin" class="back-link"><Icon name="lucide:chevron-left" size="16" /> Админ</NuxtLink>
      <div class="hero-top">
        <div>
          <h1 class="page-title"><Icon name="lucide:send" size="22" /> Кампании</h1>
          <p class="page-desc">Drip-цепочки, рассылки и триггерные сценарии</p>
        </div>
        <button class="btn-action" @click="showCreate = true"><Icon name="lucide:plus" size="14" /> Создать</button>
      </div>
    </div>

    <!-- Type filter -->
    <div class="filter-row">
      <button v-for="f in typeFilters" :key="f.key" class="filter-chip" :class="{ active: typeFilter === f.key }" @click="typeFilter = f.key">
        {{ f.label }}
      </button>
    </div>

    <div v-if="loading" class="card"><div class="empty-mini">Загрузка...</div></div>
    <div v-else-if="!filtered.length" class="card"><div class="empty-mini">Кампаний пока нет</div></div>

    <div v-for="c in filtered" :key="c.id" class="card camp-card">
      <div class="camp-header">
        <div class="camp-title-row">
          <span class="type-badge" :class="c.type">{{ typeLabel(c.type) }}</span>
          <span class="status-badge" :class="c.status">{{ statusLabel(c.status) }}</span>
        </div>
        <h3 class="camp-name">{{ c.name }}</h3>
      </div>
      <div class="camp-meta">
        <span v-if="c.segment"><Icon name="lucide:users" size="12" /> {{ segmentName(c) }}</span>
        <span><Icon name="lucide:layers" size="12" /> {{ (c.steps_json || []).length }} шагов</span>
        <span><Icon name="lucide:calendar" size="12" /> {{ fmtDate(c.created_at) }}</span>
      </div>
      <!-- Steps preview -->
      <div class="steps-preview">
        <div v-for="(step, i) in (c.steps_json as any[] || []).slice(0, 4)" :key="i" class="step-dot">
          <div class="step-num">{{ i + 1 }}</div>
          <span class="step-ch" :class="step.channel">{{ step.channel }}</span>
          <span v-if="step.delay_hours" class="step-delay">+{{ step.delay_hours }}ч</span>
        </div>
        <span v-if="(c.steps_json || []).length > 4" class="step-more">+{{ (c.steps_json || []).length - 4 }}</span>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="modal-card modal-lg">
          <h2 class="modal-title">Новая кампания</h2>
          <div class="fg"><label class="fl">Название</label><input v-model="form.name" class="fi" placeholder="Онбординг новых мам" /></div>
          <div class="fg-row">
            <div class="fg">
              <label class="fl">Тип</label>
              <select v-model="form.type" class="fi">
                <option value="drip">Drip-цепочка</option>
                <option value="broadcast">Рассылка</option>
                <option value="trigger">Триггерная</option>
              </select>
            </div>
            <div class="fg">
              <label class="fl">Сегмент</label>
              <select v-model="form.segment_id" class="fi">
                <option value="">Без сегмента</option>
                <option v-for="s in segments" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
          </div>

          <!-- Steps builder -->
          <div class="steps-section">
            <h3 class="steps-title">Шаги</h3>
            <div v-for="(step, i) in form.steps" :key="i" class="step-builder-row">
              <span class="step-builder-num">{{ i + 1 }}</span>
              <select v-model="step.channel" class="fi fi-sm">
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="push">Push</option>
              </select>
              <select v-model="step.template_id" class="fi fi-sm">
                <option value="">Шаблон...</option>
                <option v-for="t in templatesByChannel(step.channel)" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
              <div class="delay-input">
                <input v-model.number="step.delay_hours" type="number" min="0" class="fi fi-sm fi-tiny" placeholder="0" />
                <span class="delay-label">ч</span>
              </div>
              <button class="btn-icon-danger" @click="form.steps.splice(i, 1)"><Icon name="lucide:x" size="14" /></button>
            </div>
            <button class="btn-sm" @click="addStep"><Icon name="lucide:plus" size="12" /> Добавить шаг</button>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="showCreate = false">Отмена</button>
            <button class="btn-submit" :disabled="!form.name || !form.steps.length || saving" @click="save">
              {{ saving ? 'Сохранение...' : 'Создать' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const loading = ref(true)
const saving = ref(false)
const showCreate = ref(false)
const campaigns = ref<any[]>([])
const segments = ref<any[]>([])
const msgTemplates = ref<any[]>([])
const typeFilter = ref('all')

const typeFilters = [
  { key: 'all', label: 'Все' },
  { key: 'drip', label: 'Drip' },
  { key: 'broadcast', label: 'Рассылки' },
  { key: 'trigger', label: 'Триггерные' },
]

interface Step { channel: string; template_id: string; delay_hours: number }

const form = reactive({
  name: '',
  type: 'drip',
  segment_id: '',
  steps: [{ channel: 'whatsapp', template_id: '', delay_hours: 0 }] as Step[],
})

const filtered = computed(() => {
  if (typeFilter.value === 'all') return campaigns.value
  return campaigns.value.filter(c => c.type === typeFilter.value)
})

function addStep() {
  form.steps.push({ channel: 'whatsapp', template_id: '', delay_hours: 24 })
}

function templatesByChannel(ch: string) {
  return msgTemplates.value.filter(t => t.channel === ch)
}

function fmtDate(d: string) { return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) }
function typeLabel(t: string) {
  const m: Record<string, string> = { drip: 'Drip', broadcast: 'Рассылка', trigger: 'Триггер' }
  return m[t] || t
}
function statusLabel(s: string) {
  const m: Record<string, string> = { draft: 'Черновик', active: 'Активна', paused: 'Пауза', completed: 'Завершена' }
  return m[s] || s
}
function segmentName(c: any) {
  const seg = Array.isArray(c.segment) ? c.segment[0] : c.segment
  return seg?.name || 'Без сегмента'
}

async function save() {
  saving.value = true
  try {
    const steps = form.steps.filter(s => s.template_id).map((s, i) => ({
      order_num: i + 1,
      delay_hours: s.delay_hours,
      template_id: s.template_id,
      channel: s.channel,
    }))
    const data = await $fetch('/api/admin/campaigns', {
      method: 'POST',
      body: {
        name: form.name,
        type: form.type,
        segment_id: form.segment_id || undefined,
        steps_json: steps,
      },
    })
    campaigns.value.unshift(data)
    showCreate.value = false
    form.name = ''
    form.steps = [{ channel: 'whatsapp', template_id: '', delay_hours: 0 }]
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const [camps, segs, tpls] = await Promise.all([
      $fetch('/api/admin/campaigns'),
      $fetch('/api/admin/segments'),
      $fetch('/api/admin/templates'),
    ])
    campaigns.value = camps as any[]
    segments.value = segs as any[]
    msgTemplates.value = tpls as any[]
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }

.page-hero {
  background: linear-gradient(135deg, rgba(139,126,200,0.08), rgba(232,160,191,0.06));
  border: 1px solid rgba(139,126,200,0.12); border-radius: 16px; padding: 24px 28px;
}
.back-link { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--color-text-muted); text-decoration: none; margin-bottom: 10px; }
.hero-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.page-title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.page-desc { font-size: 0.82rem; color: var(--color-text-muted); margin-top: 4px; }

.filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-chip { padding: 6px 14px; border: 1px solid var(--color-border-light); border-radius: 10px; background: white; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.filter-chip.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }

.card { background: white; border: 1px solid var(--color-border-light); border-radius: 14px; padding: 18px; }
.empty-mini { text-align: center; padding: 24px; font-size: 0.82rem; color: var(--color-text-muted); }

.camp-card { transition: box-shadow 0.15s; }
.camp-card:hover { box-shadow: 0 2px 12px rgba(139,126,200,0.08); }
.camp-header { margin-bottom: 8px; }
.camp-title-row { display: flex; gap: 6px; margin-bottom: 6px; }
.camp-name { font-weight: 700; font-size: 0.95rem; }
.type-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
.type-badge.drip { background: rgba(139,126,200,0.1); color: var(--color-primary); }
.type-badge.broadcast { background: rgba(107,154,196,0.1); color: #6B9AC4; }
.type-badge.trigger { background: rgba(232,160,191,0.1); color: #C27BA0; }
.status-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
.status-badge.draft { background: rgba(139,126,200,0.06); color: var(--color-text-muted); }
.status-badge.active { background: rgba(46,160,67,0.1); color: var(--color-success); }
.status-badge.paused { background: rgba(245,158,11,0.1); color: #D97706; }
.status-badge.completed { background: rgba(139,126,200,0.08); color: var(--color-text-muted); }

.camp-meta { display: flex; gap: 14px; font-size: 0.72rem; color: var(--color-text-muted); margin-bottom: 10px; }
.camp-meta span { display: flex; align-items: center; gap: 3px; }

/* Steps preview */
.steps-preview { display: flex; gap: 8px; align-items: center; }
.step-dot { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: rgba(139,126,200,0.04); border: 1px solid rgba(139,126,200,0.1); border-radius: 8px; }
.step-num { font-size: 0.65rem; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; }
.step-ch { font-size: 0.65rem; font-weight: 600; }
.step-ch.whatsapp { color: #25D366; }
.step-ch.sms { color: #D97706; }
.step-ch.email { color: #6B9AC4; }
.step-ch.push { color: var(--color-primary); }
.step-delay { font-size: 0.6rem; color: var(--color-text-muted); }
.step-more { font-size: 0.72rem; font-weight: 600; color: var(--color-text-muted); }

.btn-action { display: flex; align-items: center; gap: 6px; padding: 9px 18px; background: var(--gradient-cta); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 0.82rem; cursor: pointer; font-family: var(--font-body); white-space: nowrap; }
.btn-sm { display: flex; align-items: center; gap: 4px; padding: 5px 12px; border: 1px solid var(--color-border-light); border-radius: 8px; background: white; font-size: 0.72rem; font-weight: 600; cursor: pointer; font-family: var(--font-body); color: var(--color-primary); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: white; border-radius: 16px; padding: 24px; width: 100%; max-width: 460px; display: flex; flex-direction: column; gap: 14px; max-height: 90vh; overflow-y: auto; }
.modal-lg { max-width: 580px; }
.modal-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fl { font-size: 0.78rem; font-weight: 600; color: var(--color-text-muted); }
.fi { padding: 9px 12px; border: 1px solid var(--color-border-light); border-radius: 10px; font-size: 0.88rem; font-family: var(--font-body); outline: none; background: white; }
.fi:focus { border-color: var(--color-primary); }
.fi-sm { padding: 7px 10px; font-size: 0.82rem; }
.fi-tiny { width: 50px; text-align: center; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border-light); border-radius: 10px; cursor: pointer; font-family: var(--font-body); }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* Steps builder */
.steps-section { display: flex; flex-direction: column; gap: 10px; padding: 12px; background: rgba(139,126,200,0.03); border: 1px solid rgba(139,126,200,0.08); border-radius: 10px; }
.steps-title { font-size: 0.82rem; font-weight: 700; }
.step-builder-row { display: flex; gap: 6px; align-items: center; }
.step-builder-num { font-size: 0.72rem; font-weight: 700; width: 22px; height: 22px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.step-builder-row .fi-sm { flex: 1; }
.delay-input { display: flex; align-items: center; gap: 2px; }
.delay-label { font-size: 0.72rem; color: var(--color-text-muted); }
.btn-icon-danger { width: 28px; height: 28px; border-radius: 6px; border: none; background: rgba(212,114,124,0.08); color: var(--color-danger); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

@media (max-width: 640px) {
  .step-builder-row { flex-wrap: wrap; gap: 8px; }
  .step-builder-row .fi-sm { flex: 1 1 100%; }
  .delay-input { flex: 1 1 100%; }
  .fi { font-size: 16px; }
  .fi-sm { font-size: 16px; padding: 10px 12px; }
}
</style>
