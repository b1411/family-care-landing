<template>
  <div class="growth-page">
    <header class="page-header">
      <h1 class="page-title">Рост и развитие</h1>
    </header>

    <!-- Child selector -->
    <div v-if="authStore.children.length > 1" class="child-tabs">
      <button
        v-for="child in authStore.children"
        :key="child.id"
        class="child-tab"
        :class="{ active: selectedChildId === child.id }"
        @click="selectChild(child.id)"
      >
        {{ child.name }}
      </button>
    </div>

    <!-- Latest metrics -->
    <section v-if="latestMetric" class="metrics-overview">
      <div class="metric-card">
        <Icon name="lucide:ruler" size="20" class="metric-icon" />
        <div class="metric-value">{{ latestMetric.height_cm }} <small>см</small></div>
        <div class="metric-label">Рост</div>
      </div>
      <div class="metric-card">
        <Icon name="lucide:scale" size="20" class="metric-icon" />
        <div class="metric-value">{{ latestMetric.weight_kg }} <small>кг</small></div>
        <div class="metric-label">Вес</div>
      </div>
      <div class="metric-card">
        <Icon name="lucide:circle" size="20" class="metric-icon" />
        <div class="metric-value">{{ latestMetric.head_cm || '—' }} <small>см</small></div>
        <div class="metric-label">Окр. головы</div>
      </div>
    </section>

    <!-- Add measurement -->
    <section class="section">
      <button v-if="!showAddForm" class="btn-add" @click="showAddForm = true">
        <Icon name="lucide:plus" size="16" /> Добавить измерение
      </button>
      <div v-else class="add-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Рост (см)</label>
            <input v-model.number="newMetric.height_cm" type="number" step="0.1" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Вес (кг)</label>
            <input v-model.number="newMetric.weight_kg" type="number" step="0.01" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Голова (см)</label>
            <input v-model.number="newMetric.head_cm" type="number" step="0.1" class="form-input" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Дата измерения</label>
          <input v-model="newMetric.measured_at" type="date" class="form-input" />
        </div>
        <div class="form-actions">
          <button class="btn-cancel" @click="showAddForm = false">Отмена</button>
          <button class="btn-save" @click="addMetric">Сохранить</button>
        </div>
      </div>
    </section>

    <!-- Milestones -->
    <section class="section">
      <h2 class="section-title">Вехи развития</h2>
      <div v-if="milestones.length" class="milestone-list">
        <div v-for="ms in milestones" :key="ms.id" class="milestone-card" :class="{ achieved: ms.achieved_at }">
          <div class="milestone-check">
            <Icon :name="ms.achieved_at ? 'lucide:check-circle' : 'lucide:circle'" size="20" />
          </div>
          <div class="milestone-content">
            <h3>{{ ms.title }}</h3>
            <p>{{ ms.category }} · {{ ms.expected_age_months }} мес</p>
          </div>
          <button v-if="!ms.achieved_at" class="btn-achieve" @click="achieveMilestone(ms.id)">Достигнуто ✓</button>
          <span v-else class="achieved-date">{{ formatDate(ms.achieved_at) }}</span>
        </div>
      </div>
    </section>

    <!-- History -->
    <section v-if="metrics.length > 1" class="section">
      <h2 class="section-title">История измерений</h2>
      <div class="history-list">
        <div v-for="m in metrics" :key="m.id" class="history-row">
          <span class="history-date">{{ formatDate(m.measured_at) }}</span>
          <span>{{ m.height_cm }} см</span>
          <span>{{ m.weight_kg }} кг</span>
          <span>{{ m.head_cm || '—' }} см</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { formatDate } from '~/utils/formatters'
import type { GrowthMetric, Milestone } from '~/types/database'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

const selectedChildId = ref('')
const metrics = ref<GrowthMetric[]>([])
const milestones = ref<Milestone[]>([])
const showAddForm = ref(false)

const newMetric = reactive({
  height_cm: 0,
  weight_kg: 0,
  head_cm: 0,
  measured_at: dayjs().format('YYYY-MM-DD'),
})

const latestMetric = computed(() => metrics.value[0] || null)

async function selectChild(childId: string) {
  selectedChildId.value = childId
  await fetchData(childId)
}

async function fetchData(childId: string) {
  const [metricsRes, milestonesRes] = await Promise.all([
    supabase.from('growth_metrics').select('*').eq('child_id', childId).order('measured_at', { ascending: false }),
    supabase.from('milestones').select('*').eq('child_id', childId).order('expected_age_months'),
  ])
  metrics.value = (metricsRes.data as GrowthMetric[]) || []
  milestones.value = (milestonesRes.data as Milestone[]) || []
}

async function addMetric() {
  if (!selectedChildId.value) return
  const { data } = await supabase.from('growth_metrics').insert({
    child_id: selectedChildId.value,
    height_cm: newMetric.height_cm,
    weight_kg: newMetric.weight_kg,
    head_cm: newMetric.head_cm || null,
    measured_at: newMetric.measured_at,
  }).select().single()

  if (data) {
    metrics.value.unshift(data as GrowthMetric)
    showAddForm.value = false
  }
}

async function achieveMilestone(id: string) {
  await supabase.from('milestones').update({ achieved_at: new Date().toISOString() }).eq('id', id)
  const ms = milestones.value.find(m => m.id === id)
  if (ms) ms.achieved_at = new Date().toISOString()
}

onMounted(() => {
  if (authStore.children.length > 0) {
    selectedChildId.value = authStore.children[0].id
    fetchData(authStore.children[0].id)
  }
})
</script>

<style scoped>
.growth-page { max-width: 700px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 20px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }

.child-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
.child-tab { padding: 8px 16px; border: 1px solid var(--color-border); border-radius: 20px; background: var(--color-surface); font-size: 0.85rem; cursor: pointer; font-family: var(--font-body); }
.child-tab.active { border-color: var(--color-primary); background: var(--color-primary-ultralight); color: var(--color-primary); font-weight: 600; }

.metrics-overview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
.metric-card { padding: 16px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); text-align: center; }
.metric-icon { color: var(--color-primary); margin-bottom: 6px; }
.metric-value { font-size: 1.3rem; font-weight: 700; font-family: var(--font-mono); }
.metric-value small { font-size: 0.75rem; font-weight: 400; color: var(--color-text-secondary); }
.metric-label { font-size: 0.75rem; color: var(--color-text-secondary); }

.section { margin-bottom: 24px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 12px; }

.btn-add { display: flex; align-items: center; gap: 6px; padding: 10px 18px; background: var(--color-primary-ultralight); color: var(--color-primary); border: 1px solid var(--color-primary); border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }

.add-form { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.form-label { font-size: 0.85rem; font-weight: 600; }
.form-input { padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; }
.form-input:focus { border-color: var(--color-primary); }
.form-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-body); }
.btn-save { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }

.milestone-list { display: flex; flex-direction: column; gap: 8px; }
.milestone-card { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-sm); }
.milestone-card.achieved { opacity: 0.65; }
.milestone-check { flex-shrink: 0; color: var(--color-text-muted); }
.milestone-card.achieved .milestone-check { color: var(--color-success); }
.milestone-content { flex: 1; }
.milestone-content h3 { font-size: 0.9rem; font-weight: 600; }
.milestone-content p { font-size: 0.75rem; color: var(--color-text-secondary); }
.btn-achieve { padding: 5px 10px; background: rgba(124, 184, 212, 0.1); color: var(--color-success); border: 1px solid rgba(124, 184, 212, 0.3); border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.achieved-date { font-size: 0.75rem; color: var(--color-text-muted); }

.history-list { display: flex; flex-direction: column; }
.history-row { display: flex; gap: 16px; padding: 8px 0; border-bottom: 1px solid var(--color-border-light); font-size: 0.85rem; }
.history-row:last-child { border: none; }
.history-date { color: var(--color-text-secondary); min-width: 100px; }
</style>
