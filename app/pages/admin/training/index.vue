<template>
  <div class="training-page">
    <header class="page-header">
      <h1 class="page-title">Обучение персонала</h1>
      <button class="btn-create" @click="showCreate = true">
        <Icon name="lucide:plus" size="16" /> Добавить модуль
      </button>
    </header>

    <!-- Progress overview -->
    <div class="progress-overview">
      <div class="progress-card">
        <span class="prog-label">Общий прогресс</span>
        <div class="prog-bar"><div class="prog-fill" :style="{ width: `${overallProgress}%` }" /></div>
        <span class="prog-pct">{{ overallProgress }}%</span>
      </div>
      <div class="stat-row">
        <div class="stat-item"><strong>{{ stats.totalModules }}</strong> модулей</div>
        <div class="stat-item"><strong>{{ stats.completedByStaff }}</strong> пройдено</div>
        <div class="stat-item"><strong>{{ stats.certifiedStaff }}</strong> сертифицировано</div>
      </div>
    </div>

    <!-- Modules list -->
    <div class="modules-list">
      <div v-for="mod in modules" :key="mod.id" class="module-card">
        <div class="mod-icon" :class="mod.type">
          <Icon :name="modIcon(mod.type)" size="20" />
        </div>
        <div class="mod-content">
          <h3>{{ mod.title }}</h3>
          <p>{{ mod.description }}</p>
          <div class="mod-meta">
            <span v-if="mod.duration_minutes">{{ mod.duration_minutes }} мин</span>
            <span>{{ mod.completed_count }}/{{ mod.total_staff }} прошли</span>
          </div>
        </div>
        <div class="mod-progress">
          <div class="mini-ring">
            <svg viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-border-light)" stroke-width="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-primary)" stroke-width="3"
                stroke-linecap="round" :stroke-dasharray="`${mod.progress * 0.94} 94`"
                transform="rotate(-90 18 18)" />
            </svg>
            <span class="mini-pct">{{ mod.progress }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="modal-card">
          <h2>Новый модуль обучения</h2>
          <div class="form-group">
            <label class="form-label">Название</label>
            <input v-model="form.title" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Описание</label>
            <textarea v-model="form.description" rows="2" class="form-textarea" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Тип</label>
              <select v-model="form.type" class="form-input">
                <option value="video">Видео</option>
                <option value="article">Статья</option>
                <option value="quiz">Тест</option>
                <option value="checklist">Чеклист</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Длительность (мин)</label>
              <input v-model.number="form.duration_minutes" type="number" class="form-input" />
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showCreate = false">Отмена</button>
            <button class="btn-submit" @click="createModule">Создать</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

const showCreate = ref(false)
const overallProgress = ref(0)
const stats = reactive({ totalModules: 0, completedByStaff: 0, certifiedStaff: 0 })
const modules = ref<Array<{
  id: string; title: string; description: string; type: string
  duration_minutes: number; completed_count: number; total_staff: number; progress: number
}>>([])

const form = reactive({ title: '', description: '', type: 'video', duration_minutes: 30 })

function modIcon(type: string) {
  const map: Record<string, string> = { video: 'lucide:video', article: 'lucide:file-text', quiz: 'lucide:help-circle', checklist: 'lucide:check-square' }
  return map[type] || 'lucide:book-open'
}

async function createModule() {
  if (!authStore.clinicId || !form.title) return
  const { data } = await supabase.from('training_modules').insert({
    clinic_id: authStore.clinicId,
    title: form.title,
    description: form.description,
    type: form.type,
    duration_minutes: form.duration_minutes,
  }).select().single()

  if (data) {
    modules.value.unshift({
      ...(data as Record<string, unknown>),
      id: String((data as Record<string, string>).id),
      title: form.title,
      description: form.description,
      type: form.type,
      duration_minutes: form.duration_minutes,
      completed_count: 0,
      total_staff: 0,
      progress: 0,
    })
    stats.totalModules++
  }
  showCreate.value = false
  form.title = ''
  form.description = ''
}

onMounted(async () => {
  if (!authStore.clinicId) return

  const { data } = await supabase
    .from('training_modules')
    .select('*')
    .eq('clinic_id', authStore.clinicId)
    .order('created_at', { ascending: false })

  modules.value = (data || []).map((m: Record<string, unknown>) => ({
    id: String(m.id),
    title: String(m.title),
    description: String(m.description || ''),
    type: String(m.type),
    duration_minutes: Number(m.duration_minutes) || 0,
    completed_count: Number(m.completed_count) || 0,
    total_staff: Number(m.total_staff) || 0,
    progress: Number(m.completion_rate) || 0,
  }))

  stats.totalModules = modules.value.length
  overallProgress.value = modules.value.length
    ? Math.round(modules.value.reduce((s, m) => s + m.progress, 0) / modules.value.length)
    : 0
})
</script>

<style scoped>
.training-page { max-width: 800px; margin: 0 auto; padding: 24px 16px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }
.btn-create { display: flex; align-items: center; gap: 6px; padding: 8px 18px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }

.progress-overview { margin-bottom: 24px; padding: 20px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); }
.progress-card { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.prog-label { font-size: 0.85rem; font-weight: 600; width: 120px; }
.prog-bar { flex: 1; height: 10px; background: var(--color-border-light); border-radius: 5px; overflow: hidden; }
.prog-fill { height: 100%; background: var(--gradient-cta); border-radius: 5px; }
.prog-pct { font-size: 0.85rem; font-weight: 700; font-family: var(--font-mono); width: 40px; text-align: right; }

.stat-row { display: flex; gap: 20px; }
.stat-item { font-size: 0.85rem; }
.stat-item strong { font-family: var(--font-mono); display: block; font-size: 1rem; }

.modules-list { display: flex; flex-direction: column; gap: 10px; }
.module-card { display: flex; align-items: center; gap: 14px; padding: 16px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); }
.mod-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--color-primary-ultralight); color: var(--color-primary); }
.mod-icon.quiz { background: rgba(233, 196, 106, 0.15); color: var(--color-warning); }

.mod-content { flex: 1; }
.mod-content h3 { font-size: 0.95rem; font-weight: 600; }
.mod-content p { font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px; }
.mod-meta { display: flex; gap: 12px; margin-top: 4px; font-size: 0.75rem; color: var(--color-text-muted); }

.mod-progress { flex-shrink: 0; }
.mini-ring { position: relative; width: 48px; height: 48px; }
.mini-ring svg { width: 100%; height: 100%; }
.mini-pct { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; font-family: var(--font-mono); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: var(--color-surface); border-radius: var(--radius-md); padding: 24px; width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 14px; }
.modal-card h2 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }
.form-label { font-size: 0.85rem; font-weight: 600; }
.form-input { padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; }
.form-textarea { padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; resize: vertical; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-body); }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }
</style>
