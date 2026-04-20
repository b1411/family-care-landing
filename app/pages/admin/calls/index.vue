<template>
  <div class="page">
    <div class="page-hero">
      <NuxtLink to="/admin" class="back-link"><Icon name="lucide:chevron-left" size="16" /> Админ</NuxtLink>
      <div class="hero-top">
        <div>
          <h1 class="page-title"><Icon name="lucide:phone" size="22" /> Журнал звонков</h1>
          <p class="page-desc">Все входящие и исходящие звонки с результатами</p>
        </div>
        <button class="btn-action" @click="showLog = true"><Icon name="lucide:plus" size="14" /> Записать звонок</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-row">
      <select v-model="dirFilter" class="fi fi-sm">
        <option value="">Все направления</option>
        <option value="inbound">Входящие</option>
        <option value="outbound">Исходящие</option>
      </select>
      <select v-model="outcomeFilter" class="fi fi-sm">
        <option value="">Все результаты</option>
        <option value="answered">Ответили</option>
        <option value="no_answer">Нет ответа</option>
        <option value="busy">Занято</option>
        <option value="voicemail">Голосовое</option>
        <option value="callback">Перезвонить</option>
      </select>
    </div>

    <!-- Today stats -->
    <div class="kpi-row" v-if="calls.length">
      <div class="kpi-card">
        <span class="kpi-label">Всего</span>
        <span class="kpi-value">{{ calls.length }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Отвечено</span>
        <span class="kpi-value good">{{ calls.filter(c => c.outcome === 'answered').length }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Без ответа</span>
        <span class="kpi-value low">{{ calls.filter(c => c.outcome === 'no_answer').length }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Ср. длительность</span>
        <span class="kpi-value">{{ avgDuration }}</span>
      </div>
    </div>

    <div v-if="loading" class="card"><div class="empty-mini">Загрузка...</div></div>
    <div v-else-if="!filtered.length" class="card"><div class="empty-mini">Звонков нет</div></div>

    <div class="card" v-else>
      <div v-for="c in filtered" :key="c.id" class="call-row">
        <div class="call-dir" :class="c.direction">
          <Icon :name="c.direction === 'inbound' ? 'lucide:phone-incoming' : 'lucide:phone-outgoing'" size="14" />
        </div>
        <div class="call-info">
          <span class="call-contact">{{ contactName(c) }}</span>
          <span class="call-phone">{{ contactPhone(c) }}</span>
        </div>
        <span class="outcome-badge" :class="c.outcome">{{ outcomeLabel(c.outcome) }}</span>
        <span class="call-dur">{{ formatDuration(c.duration_sec) }}</span>
        <span class="call-date">{{ fmtDateTime(c.started_at) }}</span>
      </div>
    </div>

    <!-- Log call modal -->
    <Teleport to="body">
      <div v-if="showLog" class="modal-overlay" @click.self="showLog = false">
        <div class="modal-card">
          <h2 class="modal-title">Записать звонок</h2>
          <div class="fg-row">
            <div class="fg">
              <label class="fl">Направление</label>
              <select v-model="form.direction" class="fi">
                <option value="outbound">Исходящий</option>
                <option value="inbound">Входящий</option>
              </select>
            </div>
            <div class="fg">
              <label class="fl">Результат</label>
              <select v-model="form.outcome" class="fi">
                <option value="answered">Ответили</option>
                <option value="no_answer">Нет ответа</option>
                <option value="busy">Занято</option>
                <option value="voicemail">Голосовое</option>
                <option value="callback">Перезвонить</option>
              </select>
            </div>
          </div>
          <div class="fg">
            <label class="fl">Длительность (сек)</label>
            <input v-model.number="form.duration_sec" type="number" min="0" class="fi" placeholder="120" />
          </div>
          <div class="fg">
            <label class="fl">Заметки</label>
            <textarea v-model="form.notes" class="fi" rows="2" placeholder="Результат разговора..." />
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showLog = false">Отмена</button>
            <button class="btn-submit" :disabled="saving" @click="save">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
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
const showLog = ref(false)
const calls = ref<any[]>([])
const dirFilter = ref('')
const outcomeFilter = ref('')

const form = reactive({ direction: 'outbound', outcome: 'answered', duration_sec: 0, notes: '' })

const filtered = computed(() => {
  let list = calls.value
  if (dirFilter.value) list = list.filter(c => c.direction === dirFilter.value)
  if (outcomeFilter.value) list = list.filter(c => c.outcome === outcomeFilter.value)
  return list
})

const avgDuration = computed(() => {
  const answered = calls.value.filter(c => c.outcome === 'answered' && c.duration_sec > 0)
  if (!answered.length) return '—'
  const avg = Math.round(answered.reduce((s, c) => s + c.duration_sec, 0) / answered.length)
  return formatDuration(avg)
})

function fmtDateTime(d: string) {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
function formatDuration(sec: number) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}с`
}
function outcomeLabel(o: string) {
  const m: Record<string, string> = { answered: 'Ответили', no_answer: 'Нет ответа', busy: 'Занято', voicemail: 'Голосовое', callback: 'Перезвонить' }
  return m[o] || o
}
function contactName(c: any) {
  const fam = Array.isArray(c.family) ? c.family[0] : c.family
  const parent = fam?.primary_parent
  const p = Array.isArray(parent) ? parent[0] : parent
  return p ? `${p.last_name || ''} ${p.first_name || ''}`.trim() : 'Неизвестный'
}
function contactPhone(c: any) {
  const fam = Array.isArray(c.family) ? c.family[0] : c.family
  const parent = fam?.primary_parent
  const p = Array.isArray(parent) ? parent[0] : parent
  return p?.phone || ''
}

async function save() {
  saving.value = true
  try {
    const data = await $fetch('/api/admin/calls', {
      method: 'POST',
      body: {
        direction: form.direction,
        outcome: form.outcome,
        duration_sec: form.duration_sec,
        notes: form.notes || undefined,
      },
    })
    calls.value.unshift(data)
    showLog.value = false
    form.notes = ''
    form.duration_sec = 0
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    calls.value = await $fetch<any[]>('/api/admin/calls')
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

.filter-row { display: flex; gap: 8px; flex-wrap: wrap; }
.fi { padding: 9px 12px; border: 1px solid var(--color-border-light); border-radius: 10px; font-size: 0.88rem; font-family: var(--font-body); outline: none; background: white; }
.fi:focus { border-color: var(--color-primary); }
.fi-sm { padding: 7px 10px; font-size: 0.82rem; }

.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
@media (max-width: 640px) { .kpi-row { grid-template-columns: 1fr 1fr; } }
.kpi-card { background: white; border: 1px solid var(--color-border-light); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.kpi-label { font-size: 0.68rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; }
.kpi-value { font-size: 1.3rem; font-weight: 700; font-family: var(--font-mono); }
.kpi-value.good { color: var(--color-success); }
.kpi-value.low { color: var(--color-danger); }

.card { background: white; border: 1px solid var(--color-border-light); border-radius: 14px; padding: 18px; }
.empty-mini { text-align: center; padding: 24px; font-size: 0.82rem; color: var(--color-text-muted); }

.call-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--color-border-light); }
.call-row:last-child { border: none; }
.call-dir { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.call-dir.inbound { background: rgba(46,160,67,0.1); color: var(--color-success); }
.call-dir.outbound { background: rgba(107,154,196,0.1); color: #6B9AC4; }
.call-info { flex: 1; display: flex; flex-direction: column; }
.call-contact { font-weight: 600; font-size: 0.85rem; }
.call-phone { font-size: 0.72rem; color: var(--color-text-muted); }
.outcome-badge { font-size: 0.65rem; font-weight: 600; padding: 2px 8px; border-radius: 6px; }
.outcome-badge.answered { background: rgba(46,160,67,0.1); color: var(--color-success); }
.outcome-badge.no_answer { background: rgba(212,114,124,0.1); color: var(--color-danger); }
.outcome-badge.busy { background: rgba(245,158,11,0.1); color: #D97706; }
.outcome-badge.voicemail { background: rgba(139,126,200,0.1); color: var(--color-primary); }
.outcome-badge.callback { background: rgba(168,200,232,0.12); color: #6B9AC4; }
.call-dur { font-size: 0.78rem; font-family: var(--font-mono); color: var(--color-text-muted); min-width: 40px; text-align: right; }
.call-date { font-size: 0.68rem; color: var(--color-text-muted); min-width: 80px; text-align: right; }

.btn-action { display: flex; align-items: center; gap: 6px; padding: 9px 18px; background: var(--gradient-cta); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 0.82rem; cursor: pointer; font-family: var(--font-body); white-space: nowrap; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: white; border-radius: 16px; padding: 24px; width: 100%; max-width: 460px; display: flex; flex-direction: column; gap: 14px; }
.modal-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fl { font-size: 0.78rem; font-weight: 600; color: var(--color-text-muted); }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border-light); border-radius: 10px; cursor: pointer; font-family: var(--font-body); }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 480px) {
  .call-row { flex-wrap: wrap; gap: 6px 10px; padding: 12px 0; }
  .call-dur, .call-date { text-align: left; min-width: 0; }
  .fg-row { grid-template-columns: 1fr; }
}
</style>
