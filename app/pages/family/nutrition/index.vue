<template>
  <div class="nutrition-page">
    <header class="page-header">
      <h1 class="page-title">Питание</h1>
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

    <!-- Quick log -->
    <section class="section">
      <h2 class="section-title">Записать кормление</h2>
      <div class="log-form">
        <div class="type-selector">
          <button
            v-for="t in feedingTypes"
            :key="t.value"
            class="type-btn"
            :class="{ active: logForm.type === t.value }"
            @click="logForm.type = t.value"
          >
            {{ t.emoji }} {{ t.label }}
          </button>
        </div>

        <div class="form-row" v-if="logForm.type === 'breast'">
          <div class="form-group">
            <label class="form-label">Длительность (мин)</label>
            <input v-model.number="logForm.duration_minutes" type="number" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Сторона</label>
            <select v-model="logForm.breast_side" class="form-input">
              <option value="left">Левая</option>
              <option value="right">Правая</option>
              <option value="both">Обе</option>
            </select>
          </div>
        </div>

        <div class="form-row" v-if="logForm.type === 'bottle' || logForm.type === 'formula'">
          <div class="form-group">
            <label class="form-label">Объём (мл)</label>
            <input v-model.number="logForm.amount_ml" type="number" class="form-input" />
          </div>
        </div>

        <div class="form-row" v-if="logForm.type === 'solid'">
          <div class="form-group">
            <label class="form-label">Что ел</label>
            <input v-model="logForm.food_name" type="text" class="form-input" placeholder="Каша, пюре..." />
          </div>
        </div>

        <button class="btn-save" :disabled="savingLog" @click="saveLog">
          {{ savingLog ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </section>

    <!-- Today's feeding log -->
    <section v-if="todayLogs.length" class="section">
      <h2 class="section-title">Сегодня</h2>
      <div class="log-list">
        <div v-for="log in todayLogs" :key="log.id" class="log-card">
          <span class="log-emoji">{{ typeEmoji(log.type) }}</span>
          <div class="log-content">
            <h3>{{ typeLabel(log.type) }}</h3>
            <p>
              <span v-if="log.duration_minutes">{{ log.duration_minutes }} мин</span>
              <span v-if="log.amount_ml">{{ log.amount_ml }} мл</span>
              <span v-if="log.food_name">{{ log.food_name }}</span>
            </p>
          </div>
          <span class="log-time">{{ formatTime(log.created_at) }}</span>
        </div>
      </div>
    </section>

    <!-- Food introduction tracker -->
    <section class="section">
      <h2 class="section-title">Введённые продукты</h2>
      <div v-if="foods.length" class="food-tags">
        <span v-for="food in foods" :key="food.id" class="food-tag" :class="food.reaction">
          {{ food.food_name }}
          <Icon v-if="food.reaction === 'allergic'" name="lucide:alert-triangle" size="12" />
        </span>
      </div>
      <p v-else class="hint-text">Отслеживайте введение новых продуктов прикорма</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import type { FeedingLog } from '~/types/database'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

const selectedChildId = ref('')
const todayLogs = ref<FeedingLog[]>([])
const foods = ref<Array<Record<string, unknown>>>([])
const savingLog = ref(false)

const logForm = reactive({
  type: 'breast' as string,
  duration_minutes: 15,
  amount_ml: 0,
  breast_side: 'left' as string,
  food_name: '',
})

const feedingTypes = [
  { value: 'breast', emoji: '🤱', label: 'Грудь' },
  { value: 'bottle', emoji: '🍼', label: 'Бутылка' },
  { value: 'formula', emoji: '🥛', label: 'Смесь' },
  { value: 'solid', emoji: '🥣', label: 'Прикорм' },
]

function typeEmoji(type: string) { return feedingTypes.find(t => t.value === type)?.emoji || '🍽️' }
function typeLabel(type: string) { return feedingTypes.find(t => t.value === type)?.label || type }
function formatTime(dt: string) { return dayjs(dt).format('HH:mm') }

async function selectChild(childId: string) {
  selectedChildId.value = childId
  await fetchData(childId)
}

async function fetchData(childId: string) {
  const today = dayjs().format('YYYY-MM-DD')

  const [logsRes, foodsRes] = await Promise.all([
    supabase.from('feeding_logs').select('*').eq('child_id', childId).gte('created_at', `${today}T00:00:00`).order('created_at', { ascending: false }),
    supabase.from('food_introductions').select('*').eq('child_id', childId).order('introduced_at'),
  ])

  todayLogs.value = (logsRes.data as FeedingLog[]) || []
  foods.value = foodsRes.data || []
}

async function saveLog() {
  if (!selectedChildId.value) return
  savingLog.value = true
  try {
    const payload: Record<string, unknown> = {
      child_id: selectedChildId.value,
      type: logForm.type,
    }
    if (logForm.type === 'breast') {
      payload.duration_minutes = logForm.duration_minutes
      payload.breast_side = logForm.breast_side
    }
    else if (logForm.type === 'bottle' || logForm.type === 'formula') {
      payload.amount_ml = logForm.amount_ml
    }
    else if (logForm.type === 'solid') {
      payload.food_name = logForm.food_name
    }

    const { data } = await supabase.from('feeding_logs').insert(payload).select().single()
    if (data) todayLogs.value.unshift(data as FeedingLog)
  }
  finally { savingLog.value = false }
}

onMounted(() => {
  if (authStore.children.length > 0) {
    selectedChildId.value = authStore.children[0].id
    fetchData(authStore.children[0].id)
  }
})
</script>

<style scoped>
.nutrition-page { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 20px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }

.child-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
.child-tab { padding: 8px 16px; border: 1px solid var(--color-border); border-radius: 20px; background: var(--color-surface); font-size: 0.85rem; cursor: pointer; font-family: var(--font-body); }
.child-tab.active { border-color: var(--color-primary); background: var(--color-primary-ultralight); color: var(--color-primary); font-weight: 600; }

.section { margin-bottom: 24px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 12px; }

.log-form {
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px;
}

.type-selector { display: flex; gap: 8px; flex-wrap: wrap; }
.type-btn {
  padding: 8px 14px; border: 1px solid var(--color-border); border-radius: 20px;
  background: var(--color-surface); font-size: 0.85rem; cursor: pointer; font-family: var(--font-body);
}
.type-btn.active { border-color: var(--color-primary); background: var(--color-primary-ultralight); color: var(--color-primary); font-weight: 600; }

.form-row { display: flex; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.form-label { font-size: 0.85rem; font-weight: 600; }
.form-input { padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; }
.form-input:focus { border-color: var(--color-primary); }

.btn-save { padding: 10px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.btn-save:disabled { opacity: 0.6; }

.log-list { display: flex; flex-direction: column; gap: 6px; }
.log-card { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-sm); }
.log-emoji { font-size: 1.2rem; }
.log-content { flex: 1; }
.log-content h3 { font-size: 0.85rem; font-weight: 600; }
.log-content p { font-size: 0.8rem; color: var(--color-text-secondary); }
.log-time { font-size: 0.8rem; color: var(--color-text-muted); font-family: var(--font-mono); }

.food-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.food-tag { padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 500; background: rgba(124, 184, 212, 0.1); color: var(--color-success); display: flex; align-items: center; gap: 4px; }
.food-tag.allergic { background: rgba(231, 111, 81, 0.1); color: var(--color-danger); }

.hint-text { font-size: 0.85rem; color: var(--color-text-muted); }
</style>
