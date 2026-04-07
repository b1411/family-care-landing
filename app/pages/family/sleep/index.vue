<template>
  <div class="sleep-page">
    <header class="page-header">
      <h1 class="page-title">Сон</h1>
    </header>

    <!-- Child selector -->
    <div v-if="authStore.children.length > 1" class="child-tabs">
      <button
        v-for="child in authStore.children"
        :key="child.id"
        class="child-tab"
        :class="{ active: selectedChildId === child.id }"
        @click="selectChild(child.id)"
      >{{ child.name }}</button>
    </div>

    <!-- Today's summary -->
    <section class="sleep-summary">
      <div class="summary-card">
        <Icon name="lucide:moon" size="24" class="summary-icon" />
        <div class="summary-value">{{ totalHours }}ч {{ totalMinutes }}мин</div>
        <div class="summary-label">Всего сна за сегодня</div>
      </div>
    </section>

    <!-- Quick log -->
    <section class="section">
      <h2 class="section-title">Записать сон</h2>
      <div class="log-form">
        <div class="type-selector">
          <button
            v-for="t in sleepTypes"
            :key="t.value"
            class="type-btn"
            :class="{ active: logForm.type === t.value }"
            @click="logForm.type = t.value"
          >{{ t.emoji }} {{ t.label }}</button>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Начало</label>
            <input v-model="logForm.start" type="time" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Конец</label>
            <input v-model="logForm.end" type="time" class="form-input" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Качество</label>
          <div class="quality-selector">
            <button
              v-for="q in [1,2,3,4,5]"
              :key="q"
              class="quality-btn"
              :class="{ active: logForm.quality === q }"
              @click="logForm.quality = q"
            >{{ q === 1 ? '😴' : q === 2 ? '😐' : q === 3 ? '🙂' : q === 4 ? '😊' : '⭐' }}</button>
          </div>
        </div>

        <button class="btn-save" :disabled="saving" @click="saveLog">
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </section>

    <!-- Today's logs -->
    <section v-if="todayLogs.length" class="section">
      <h2 class="section-title">Сегодня</h2>
      <div class="log-list">
        <div v-for="log in todayLogs" :key="log.id" class="log-card">
          <span class="log-emoji">{{ log.type === 'night' ? '🌙' : '☀️' }}</span>
          <div class="log-content">
            <h3>{{ log.type === 'night' ? 'Ночной' : 'Дневной' }}</h3>
            <p>{{ log.sleep_start?.slice(0, 5) }} — {{ log.sleep_end?.slice(0, 5) }}</p>
          </div>
          <span class="log-duration">{{ logDuration(log) }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import type { SleepLog } from '~/types/database'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

const selectedChildId = ref('')
const todayLogs = ref<SleepLog[]>([])
const saving = ref(false)

const logForm = reactive({
  type: 'night' as string,
  start: '21:00',
  end: '07:00',
  quality: 3,
})

const sleepTypes = [
  { value: 'night', emoji: '🌙', label: 'Ночной' },
  { value: 'nap', emoji: '☀️', label: 'Дневной' },
]

const totalMinutesAll = computed(() => {
  return todayLogs.value.reduce((sum, log) => {
    const mins = calcMinutes(log.sleep_start, log.sleep_end)
    return sum + mins
  }, 0)
})

const totalHours = computed(() => Math.floor(totalMinutesAll.value / 60))
const totalMinutes = computed(() => totalMinutesAll.value % 60)

function calcMinutes(start?: string, end?: string) {
  if (!start || !end) return 0
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins < 0) mins += 24 * 60 // overnight
  return mins
}

function logDuration(log: SleepLog) {
  const mins = calcMinutes(log.sleep_start, log.sleep_end)
  return `${Math.floor(mins / 60)}ч ${mins % 60}мин`
}

async function selectChild(childId: string) {
  selectedChildId.value = childId
  await fetchData(childId)
}

async function fetchData(childId: string) {
  const today = dayjs().format('YYYY-MM-DD')
  const { data } = await supabase
    .from('sleep_logs')
    .select('*')
    .eq('child_id', childId)
    .gte('created_at', `${today}T00:00:00`)
    .order('created_at', { ascending: false })

  todayLogs.value = (data as SleepLog[]) || []
}

async function saveLog() {
  if (!selectedChildId.value) return
  saving.value = true
  try {
    const { data } = await supabase.from('sleep_logs').insert({
      child_id: selectedChildId.value,
      type: logForm.type,
      sleep_start: logForm.start,
      sleep_end: logForm.end,
      quality: logForm.quality,
    }).select().single()

    if (data) todayLogs.value.unshift(data as SleepLog)
  }
  finally { saving.value = false }
}

onMounted(() => {
  if (authStore.children.length > 0) {
    selectedChildId.value = authStore.children[0].id
    fetchData(authStore.children[0].id)
  }
})
</script>

<style scoped>
.sleep-page { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 20px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }

.child-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
.child-tab { padding: 8px 16px; border: 1px solid var(--color-border); border-radius: 20px; background: var(--color-surface); font-size: 0.85rem; cursor: pointer; font-family: var(--font-body); }
.child-tab.active { border-color: var(--color-primary); background: var(--color-primary-ultralight); color: var(--color-primary); font-weight: 600; }

.sleep-summary { margin-bottom: 24px; }
.summary-card { text-align: center; padding: 24px; background: linear-gradient(135deg, rgba(139, 126, 200, 0.1), rgba(232, 160, 191, 0.1)); border-radius: var(--radius-md); }
.summary-icon { color: var(--color-primary); margin-bottom: 8px; }
.summary-value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-mono); }
.summary-label { font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 4px; }

.section { margin-bottom: 24px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 12px; }

.log-form { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.type-selector { display: flex; gap: 8px; }
.type-btn { padding: 8px 14px; border: 1px solid var(--color-border); border-radius: 20px; background: var(--color-surface); font-size: 0.85rem; cursor: pointer; font-family: var(--font-body); }
.type-btn.active { border-color: var(--color-primary); background: var(--color-primary-ultralight); color: var(--color-primary); font-weight: 600; }

.form-row { display: flex; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.form-label { font-size: 0.85rem; font-weight: 600; }
.form-input { padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; }
.form-input:focus { border-color: var(--color-primary); }

.quality-selector { display: flex; gap: 8px; }
.quality-btn { width: 40px; height: 40px; border: 1px solid var(--color-border); border-radius: 50%; font-size: 1.2rem; cursor: pointer; background: var(--color-surface); }
.quality-btn.active { border-color: var(--color-primary); background: var(--color-primary-ultralight); }

.btn-save { padding: 10px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.btn-save:disabled { opacity: 0.6; }

.log-list { display: flex; flex-direction: column; gap: 6px; }
.log-card { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-sm); }
.log-emoji { font-size: 1.2rem; }
.log-content { flex: 1; }
.log-content h3 { font-size: 0.85rem; font-weight: 600; }
.log-content p { font-size: 0.8rem; color: var(--color-text-secondary); }
.log-duration { font-size: 0.85rem; font-weight: 600; color: var(--color-primary); font-family: var(--font-mono); }
</style>
