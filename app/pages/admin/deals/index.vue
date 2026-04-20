<template>
  <div class="page">
    <div class="page-hero">
      <NuxtLink to="/admin" class="back-link"><Icon name="lucide:chevron-left" size="16" /> Админ</NuxtLink>
      <div class="hero-top">
        <div>
          <h1 class="page-title"><Icon name="lucide:banknote" size="22" /> Сделки</h1>
          <p class="page-desc">Pipeline сделок — от квалификации до закрытия</p>
        </div>
        <button class="btn-action" @click="showCreate = true"><Icon name="lucide:plus" size="14" /> Новая сделка</button>
      </div>
    </div>

    <!-- KPI -->
    <div class="kpi-row" v-if="deals.length">
      <div class="kpi-card">
        <span class="kpi-label">Всего</span>
        <span class="kpi-value">{{ deals.length }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Сумма (активные)</span>
        <span class="kpi-value">{{ fmtMoney(totalActive) }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Выиграно</span>
        <span class="kpi-value good">{{ fmtMoney(totalWon) }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Конверсия</span>
        <span class="kpi-value">{{ winRate }}%</span>
      </div>
    </div>

    <!-- Pipeline view -->
    <div class="pipeline-board">
      <div v-for="stage in stages" :key="stage.key" class="pipeline-col">
        <div class="col-header">
          <span class="col-title">{{ stage.label }}</span>
          <span class="col-count">{{ dealsByStage(stage.key).length }}</span>
        </div>
        <div class="col-body">
          <div v-for="d in dealsByStage(stage.key)" :key="d.id" class="deal-card">
            <span class="deal-title">{{ d.title }}</span>
            <span class="deal-family">{{ familyName(d) }}</span>
            <div class="deal-footer">
              <span v-if="d.amount" class="deal-amount">{{ fmtMoney(d.amount) }}</span>
              <span v-if="d.expected_close" class="deal-close">{{ fmtDate(d.expected_close) }}</span>
            </div>
          </div>
          <div v-if="!dealsByStage(stage.key).length" class="empty-col">Нет сделок</div>
        </div>
      </div>
    </div>

    <!-- Create deal modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="modal-card">
          <h2 class="modal-title">Новая сделка</h2>
          <div class="fg"><label class="fl">Название</label><input v-model="form.title" class="fi" placeholder="Программа Беременность+" /></div>
          <div class="fg"><label class="fl">Family ID</label><input v-model="form.family_id" class="fi" placeholder="UUID семьи" /></div>
          <div class="fg-row">
            <div class="fg"><label class="fl">Сумма</label><input v-model.number="form.amount" type="number" class="fi" placeholder="500000" /></div>
            <div class="fg">
              <label class="fl">Стадия</label>
              <select v-model="form.stage" class="fi">
                <option v-for="s in stages" :key="s.key" :value="s.key">{{ s.label }}</option>
              </select>
            </div>
          </div>
          <div class="fg"><label class="fl">Ожидаемое закрытие</label><input v-model="form.expected_close" type="date" class="fi" /></div>
          <div class="fg"><label class="fl">Заметки</label><textarea v-model="form.notes" class="fi" rows="2" placeholder="Детали..." /></div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showCreate = false">Отмена</button>
            <button class="btn-submit" :disabled="!form.title || !form.family_id || saving" @click="save">
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
const deals = ref<any[]>([])

const stages = [
  { key: 'qualification', label: 'Квалификация' },
  { key: 'proposal', label: 'Предложение' },
  { key: 'negotiation', label: 'Переговоры' },
  { key: 'closed_won', label: 'Выиграно' },
  { key: 'closed_lost', label: 'Проиграно' },
]

const form = reactive({ title: '', family_id: '', amount: 0, stage: 'qualification', expected_close: '', notes: '' })

const totalActive = computed(() =>
  deals.value.filter(d => !d.stage.startsWith('closed_')).reduce((s, d) => s + (d.amount || 0), 0)
)
const totalWon = computed(() =>
  deals.value.filter(d => d.stage === 'closed_won').reduce((s, d) => s + (d.amount || 0), 0)
)
const winRate = computed(() => {
  const closed = deals.value.filter(d => d.stage.startsWith('closed_'))
  if (!closed.length) return 0
  return Math.round(100 * closed.filter(d => d.stage === 'closed_won').length / closed.length)
})

function dealsByStage(stage: string) {
  return deals.value.filter(d => d.stage === stage)
}

function familyName(d: any) {
  const fam = Array.isArray(d.family) ? d.family[0] : d.family
  const p = fam?.primary_parent
  const parent = Array.isArray(p) ? p[0] : p
  return parent ? `${parent.last_name || ''} ${parent.first_name || ''}`.trim() : '—'
}

function fmtDate(d: string) { return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) }
function fmtMoney(n: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(n)
}

async function save() {
  saving.value = true
  try {
    const data = await $fetch('/api/admin/deals', {
      method: 'POST',
      body: {
        title: form.title,
        family_id: form.family_id,
        amount: form.amount || undefined,
        stage: form.stage,
        expected_close: form.expected_close || undefined,
        notes: form.notes || undefined,
      },
    })
    deals.value.unshift(data)
    showCreate.value = false
    form.title = ''
    form.family_id = ''
    form.amount = 0
    form.notes = ''
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    deals.value = await $fetch<any[]>('/api/admin/deals')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }

.page-hero {
  background: linear-gradient(135deg, rgba(139,126,200,0.08), rgba(232,160,191,0.06));
  border: 1px solid rgba(139,126,200,0.12); border-radius: 16px; padding: 24px 28px;
}
.back-link { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--color-text-muted); text-decoration: none; margin-bottom: 10px; }
.hero-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.page-title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.page-desc { font-size: 0.82rem; color: var(--color-text-muted); margin-top: 4px; }

.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
@media (max-width: 640px) { .kpi-row { grid-template-columns: 1fr 1fr; } }
.kpi-card { background: white; border: 1px solid var(--color-border-light); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.kpi-label { font-size: 0.68rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; }
.kpi-value { font-size: 1.2rem; font-weight: 700; font-family: var(--font-mono); }
.kpi-value.good { color: var(--color-success); }

/* Pipeline Board */
.pipeline-board { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; overflow-x: auto; -webkit-overflow-scrolling: touch; scroll-snap-type: x proximity; padding-bottom: 4px; }
@media (max-width: 900px) { .pipeline-board { grid-template-columns: repeat(5, 240px); } .pipeline-col { scroll-snap-align: start; } }
@media (max-width: 480px) { .pipeline-board { grid-template-columns: repeat(5, 80vw); gap: 8px; } }
.pipeline-col { background: rgba(139,126,200,0.02); border: 1px solid var(--color-border-light); border-radius: 12px; min-height: 300px; display: flex; flex-direction: column; }
.col-header { padding: 12px 14px; border-bottom: 1px solid var(--color-border-light); display: flex; justify-content: space-between; align-items: center; }
.col-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
.col-count { font-size: 0.68rem; font-weight: 700; width: 22px; height: 22px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; }
.col-body { padding: 10px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.empty-col { text-align: center; padding: 20px 0; font-size: 0.72rem; color: var(--color-text-muted); }

.deal-card { background: white; border: 1px solid var(--color-border-light); border-radius: 10px; padding: 10px 12px; }
.deal-title { font-weight: 600; font-size: 0.82rem; display: block; margin-bottom: 2px; }
.deal-family { font-size: 0.72rem; color: var(--color-text-muted); display: block; margin-bottom: 6px; }
.deal-footer { display: flex; justify-content: space-between; align-items: center; }
.deal-amount { font-family: var(--font-mono); font-weight: 700; font-size: 0.78rem; color: var(--color-primary); }
.deal-close { font-size: 0.65rem; color: var(--color-text-muted); }

.btn-action { display: flex; align-items: center; gap: 6px; padding: 9px 18px; background: var(--gradient-cta); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 0.82rem; cursor: pointer; font-family: var(--font-body); white-space: nowrap; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: white; border-radius: 16px; padding: 24px; width: 100%; max-width: 460px; display: flex; flex-direction: column; gap: 14px; }
.modal-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fl { font-size: 0.78rem; font-weight: 600; color: var(--color-text-muted); }
.fi { padding: 9px 12px; border: 1px solid var(--color-border-light); border-radius: 10px; font-size: 0.88rem; font-family: var(--font-body); outline: none; background: white; resize: vertical; }
.fi:focus { border-color: var(--color-primary); }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border-light); border-radius: 10px; cursor: pointer; font-family: var(--font-body); }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 480px) {
  .fg-row { grid-template-columns: 1fr; }
  .fi { font-size: 16px; }
}
</style>
