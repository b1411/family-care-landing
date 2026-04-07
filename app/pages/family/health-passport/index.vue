<template>
  <div class="health-passport">
    <header class="page-header">
      <h1 class="page-title">Паспорт здоровья</h1>
      <button v-if="selectedChildId" class="btn-export" @click="exportPassport">
        <Icon name="lucide:download" size="14" /> Экспорт
      </button>
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

    <!-- Summary cards -->
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Группа крови</h3>
        <span class="summary-value">{{ passport.blood_type || '—' }}</span>
      </div>
      <div class="summary-card">
        <h3>Аллергии</h3>
        <span class="summary-value">{{ passport.allergies?.length || 0 }}</span>
      </div>
      <div class="summary-card">
        <h3>Хронические</h3>
        <span class="summary-value">{{ passport.chronic?.length || 0 }}</span>
      </div>
    </div>

    <!-- Timeline entries -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Записи</h2>
        <button class="btn-add" @click="showAdd = true">
          <Icon name="lucide:plus" size="14" /> Добавить
        </button>
      </div>

      <div v-if="entries.length" class="entries-list">
        <div v-for="entry in entries" :key="entry.id" class="entry-card">
          <div class="entry-type-icon" :class="entry.entry_type">
            <Icon :name="entryIcon(entry.entry_type)" size="16" />
          </div>
          <div class="entry-content">
            <h3>{{ entry.title }}</h3>
            <p v-if="entry.description">{{ entry.description }}</p>
            <span class="entry-date">{{ formatDate(entry.date) }}</span>
          </div>
        </div>
      </div>
      <p v-else class="empty-hint">Паспорт здоровья пуст</p>
    </section>

    <!-- Add Entry Modal -->
    <Teleport to="body">
      <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
        <div class="modal-card">
          <h2 class="modal-title">Новая запись</h2>
          <div class="form-group">
            <label class="form-label">Тип</label>
            <select v-model="newEntry.entry_type" class="form-input">
              <option value="diagnosis">Диагноз</option>
              <option value="allergy">Аллергия</option>
              <option value="surgery">Операция</option>
              <option value="hospitalization">Госпитализация</option>
              <option value="note">Заметка</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Название</label>
            <input v-model="newEntry.title" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Описание</label>
            <textarea v-model="newEntry.description" rows="2" class="form-textarea" />
          </div>
          <div class="form-group">
            <label class="form-label">Дата</label>
            <input v-model="newEntry.date" type="date" class="form-input" />
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showAdd = false">Отмена</button>
            <button class="btn-submit" @click="addEntry">Сохранить</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { formatDate } from '~/utils/formatters'
import type { HealthPassportEntry } from '~/types/database'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

const selectedChildId = ref('')
const entries = ref<HealthPassportEntry[]>([])
const showAdd = ref(false)
const passport = reactive({ blood_type: '', allergies: [] as string[], chronic: [] as string[] })

const newEntry = reactive({
  entry_type: 'diagnosis' as string,
  title: '',
  description: '',
  date: dayjs().format('YYYY-MM-DD'),
})

function entryIcon(type: string) {
  const map: Record<string, string> = {
    diagnosis: 'lucide:stethoscope',
    allergy: 'lucide:alert-triangle',
    surgery: 'lucide:scissors',
    hospitalization: 'lucide:building',
    note: 'lucide:file-text',
  }
  return map[type] || 'lucide:file-text'
}

async function selectChild(childId: string) {
  selectedChildId.value = childId
  await fetchData(childId)
}

async function fetchData(childId: string) {
  const { data } = await supabase
    .from('health_passport_entries')
    .select('*')
    .eq('child_id', childId)
    .order('date', { ascending: false })

  entries.value = (data as HealthPassportEntry[]) || []

  // Load blood_type from child_profiles
  const { data: childData } = await supabase
    .from('child_profiles')
    .select('blood_type')
    .eq('id', childId)
    .single()

  passport.blood_type = childData?.blood_type || ''

  // Derive summary
  passport.allergies = entries.value
    .filter(e => e.entry_type === 'allergy')
    .map(e => e.title)
  passport.chronic = entries.value
    .filter(e => e.entry_type === 'diagnosis')
    .map(e => e.title)
}

async function addEntry() {
  if (!selectedChildId.value || !newEntry.title) return

  const { data } = await supabase.from('health_passport_entries').insert({
    child_id: selectedChildId.value,
    entry_type: newEntry.entry_type,
    title: newEntry.title,
    description: newEntry.description || null,
    date: newEntry.date,
  }).select().single()

  if (data) {
    entries.value.unshift(data as HealthPassportEntry)
    showAdd.value = false
    newEntry.title = ''
    newEntry.description = ''
  }
}

function exportPassport() {
  if (!selectedChildId.value) return
  window.open(`/api/pdf/health-passport?child_id=${selectedChildId.value}`, '_blank')
}

onMounted(() => {
  if (authStore.children.length > 0) {
    selectedChildId.value = authStore.children[0].id
    fetchData(authStore.children[0].id)
  }
})
</script>

<style scoped>
.health-passport { max-width: 700px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }
.btn-export { display: flex; align-items: center; gap: 4px; padding: 8px 16px; background: var(--color-surface); border: 1px solid var(--color-primary); border-radius: var(--radius-sm); color: var(--color-primary); font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.btn-export:hover { background: var(--color-primary-ultralight); }

.child-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
.child-tab { padding: 8px 16px; border: 1px solid var(--color-border); border-radius: 20px; background: var(--color-surface); font-size: 0.85rem; cursor: pointer; font-family: var(--font-body); }
.child-tab.active { border-color: var(--color-primary); background: var(--color-primary-ultralight); color: var(--color-primary); font-weight: 600; }

.summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
.summary-card { padding: 16px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); text-align: center; }
.summary-card h3 { font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 4px; }
.summary-value { font-size: 1.2rem; font-weight: 700; }

.section { margin-bottom: 24px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.section-title { font-size: 1rem; font-weight: 600; }
.btn-add { display: flex; align-items: center; gap: 4px; padding: 6px 14px; background: var(--color-primary-ultralight); color: var(--color-primary); border: 1px solid var(--color-primary); border-radius: var(--radius-sm); font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: var(--font-body); }

.entries-list { display: flex; flex-direction: column; gap: 8px; }
.entry-card { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-sm); }
.entry-type-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--color-primary-ultralight); color: var(--color-primary); }
.entry-type-icon.allergy { background: rgba(233, 196, 106, 0.15); color: var(--color-warning); }
.entry-type-icon.surgery { background: rgba(231, 111, 81, 0.15); color: var(--color-danger); }
.entry-content { flex: 1; }
.entry-content h3 { font-size: 0.9rem; font-weight: 600; }
.entry-content p { font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px; }
.entry-date { font-size: 0.75rem; color: var(--color-text-muted); }

.empty-hint { font-size: 0.85rem; color: var(--color-text-muted); text-align: center; padding: 24px; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: var(--color-surface); border-radius: var(--radius-md); padding: 24px; width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 14px; }
.modal-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 600; }
.form-input { padding: 10px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; }
.form-input:focus { border-color: var(--color-primary); }
.form-textarea { padding: 10px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; resize: vertical; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-body); }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }
</style>
