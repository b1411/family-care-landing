<template>
  <div class="vaccinations-page">
    <header class="page-header">
      <h1 class="page-title">Прививки</h1>
    </header>

    <!-- Child selector (if multiple children) -->
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

    <!-- Upcoming vaccinations -->
    <section v-if="upcoming.length" class="section">
      <h2 class="section-title">Предстоящие</h2>
      <div class="list">
        <div v-for="v in upcoming" :key="v.id" class="vax-card">
          <div class="vax-icon">
            <Icon name="lucide:syringe" size="18" />
          </div>
          <div class="vax-content">
            <h3>{{ v.vaccine_name }}</h3>
            <p>Доза {{ v.dose_number }} · {{ formatDate(v.scheduled_date) }}</p>
          </div>
          <span class="vax-status scheduled">Запланирована</span>
        </div>
      </div>
    </section>

    <!-- Completed -->
    <section v-if="completed.length" class="section">
      <h2 class="section-title muted">Выполненные</h2>
      <div class="list">
        <div v-for="v in completed" :key="v.id" class="vax-card done">
          <div class="vax-icon done">
            <Icon name="lucide:check" size="18" />
          </div>
          <div class="vax-content">
            <h3>{{ v.vaccine_name }}</h3>
            <p>Доза {{ v.dose_number }} · {{ formatDate(v.administered_date || v.scheduled_date) }}</p>
            <p v-if="v.batch_number" class="vax-batch">Партия: {{ v.batch_number }}</p>
          </div>
          <span class="vax-status completed">Выполнена</span>
        </div>
      </div>
    </section>

    <div v-if="!upcoming.length && !completed.length" class="empty-state">
      <Icon name="lucide:syringe" size="40" class="empty-icon" />
      <h3>Нет прививок</h3>
      <p>Календарь прививок будет сформирован по дате рождения ребёнка</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/formatters'
import type { Vaccination } from '~/types/database'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

const vaccinations = ref<Vaccination[]>([])
const selectedChildId = ref('')

const upcoming = computed(() => vaccinations.value
  .filter(v => v.status === 'scheduled')
  .sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || '')),
)

const completed = computed(() => vaccinations.value
  .filter(v => v.status === 'completed')
  .sort((a, b) => (b.administered_date || b.scheduled_date || '').localeCompare(a.administered_date || a.scheduled_date || '')),
)

async function selectChild(childId: string) {
  selectedChildId.value = childId
  await fetchVaccinations(childId)
}

async function fetchVaccinations(childId: string) {
  const { data } = await supabase
    .from('vaccinations')
    .select('*')
    .eq('child_id', childId)
    .order('scheduled_date')

  vaccinations.value = (data as Vaccination[]) || []
}

onMounted(async () => {
  if (authStore.children.length > 0) {
    const firstChild = authStore.children[0]
    selectedChildId.value = firstChild.id
    await fetchVaccinations(firstChild.id)
  }
})
</script>

<style scoped>
.vaccinations-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px;
}

.page-header { margin-bottom: 24px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }

.child-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
.child-tab {
  padding: 8px 16px; border: 1px solid var(--color-border); border-radius: 20px;
  background: var(--color-surface); font-size: 0.85rem; cursor: pointer; font-family: var(--font-body);
}
.child-tab.active { border-color: var(--color-primary); background: var(--color-primary-ultralight); color: var(--color-primary); font-weight: 600; }

.section { margin-bottom: 28px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 12px; }
.section-title.muted { color: var(--color-text-secondary); }
.list { display: flex; flex-direction: column; gap: 8px; }

.vax-card {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
}
.vax-card.done { opacity: 0.7; }

.vax-icon {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(233, 196, 106, 0.15); color: var(--color-warning);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.vax-icon.done { background: rgba(124, 184, 212, 0.15); color: var(--color-success); }

.vax-content { flex: 1; }
.vax-content h3 { font-size: 0.9rem; font-weight: 600; }
.vax-content p { font-size: 0.8rem; color: var(--color-text-secondary); }
.vax-batch { font-size: 0.75rem; color: var(--color-text-muted); }

.vax-status {
  font-size: 0.7rem; font-weight: 600; padding: 3px 10px; border-radius: 4px; flex-shrink: 0;
}
.vax-status.scheduled { background: rgba(233, 196, 106, 0.15); color: var(--color-warning); }
.vax-status.completed { background: rgba(124, 184, 212, 0.15); color: var(--color-success); }

.empty-state { text-align: center; padding: 48px 16px; color: var(--color-text-muted); }
.empty-state h3 { font-size: 1rem; margin: 8px 0 4px; color: var(--color-text-primary); }
.empty-state p { font-size: 0.85rem; }
.empty-icon { color: var(--color-primary-light); }
</style>
