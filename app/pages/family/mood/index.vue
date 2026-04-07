<template>
  <div class="mood-page">
    <header class="page-header">
      <h1 class="page-title">Настроение и самочувствие</h1>
    </header>

    <!-- Quick mood log -->
    <section class="mood-log-section">
      <h2 class="section-title">Как вы себя чувствуете?</h2>
      <div class="mood-grid">
        <button
          v-for="m in moods"
          :key="m.value"
          class="mood-btn"
          :class="{ selected: selectedMood === m.value }"
          @click="selectedMood = m.value"
        >
          <span class="mood-emoji">{{ m.emoji }}</span>
          <span class="mood-label">{{ m.label }}</span>
        </button>
      </div>
      <div v-if="selectedMood" class="mood-note">
        <textarea v-model="notes" placeholder="Заметки (необязательно)..." rows="2" class="form-textarea" />
        <button class="btn-save-mood" :disabled="saving" @click="logMood">
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </section>

    <!-- EPDS Screening -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Эдинбургская шкала (EPDS)</h2>
        <NuxtLink to="/family/mood/epds" class="btn-link">Пройти тест →</NuxtLink>
      </div>
      <div v-if="lastEpds" class="epds-result">
        <div class="epds-score" :class="epdsRisk(lastEpds.total_score)">
          <span class="score-value">{{ lastEpds.total_score }}</span>
          <span class="score-label">из 30</span>
        </div>
        <div class="epds-info">
          <p>{{ epdsRiskLabel(lastEpds.total_score) }}</p>
          <span class="epds-date">{{ formatDate(lastEpds.created_at) }}</span>
        </div>
      </div>
      <p v-else class="epds-prompt">Рекомендуем пройти скрининг послеродовой депрессии</p>
    </section>

    <!-- Mood history -->
    <section v-if="moodHistory.length" class="section">
      <h2 class="section-title">История</h2>
      <div class="history-list">
        <div v-for="entry in moodHistory" :key="entry.id" class="history-item">
          <span class="history-emoji">{{ moodEmoji(entry.mood_score) }}</span>
          <div class="history-content">
            <p v-if="entry.notes" class="history-note">{{ entry.notes }}</p>
            <span class="history-date">{{ formatDateTime(entry.created_at) }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { formatDate, formatDateTime } from '~/utils/formatters'
import type { MoodLog, EPDSScreening } from '~/types/database'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const selectedMood = ref(0)
const notes = ref('')
const saving = ref(false)
const moodHistory = ref<MoodLog[]>([])
const lastEpds = ref<EPDSScreening | null>(null)

const moods = [
  { value: 1, emoji: '😢', label: 'Плохо' },
  { value: 2, emoji: '😔', label: 'Грустно' },
  { value: 3, emoji: '😐', label: 'Нормально' },
  { value: 4, emoji: '🙂', label: 'Хорошо' },
  { value: 5, emoji: '😊', label: 'Отлично' },
]

function moodEmoji(score: number) {
  return moods.find(m => m.value === score)?.emoji || '😐'
}

function epdsRisk(score: number) {
  if (score >= 13) return 'high'
  if (score >= 10) return 'medium'
  return 'low'
}

function epdsRiskLabel(score: number) {
  if (score >= 13) return 'Высокий риск — обратитесь к специалисту'
  if (score >= 10) return 'Средний риск — рекомендуется консультация'
  return 'Низкий риск — всё в норме'
}

async function logMood() {
  if (!selectedMood.value || !user.value) return
  saving.value = true
  try {
    const { data } = await supabase.from('mood_logs').insert({
      user_id: user.value.id,
      mood_score: selectedMood.value,
      notes: notes.value || null,
    }).select().single()

    if (data) moodHistory.value.unshift(data as MoodLog)
    selectedMood.value = 0
    notes.value = ''
  }
  finally { saving.value = false }
}

onMounted(async () => {
  if (!user.value) return

  const [moodsRes, epdsRes] = await Promise.all([
    supabase.from('mood_logs').select('*').eq('user_id', user.value.id).order('created_at', { ascending: false }).limit(20),
    supabase.from('epds_screenings').select('*').eq('user_id', user.value.id).order('created_at', { ascending: false }).limit(1),
  ])

  moodHistory.value = (moodsRes.data as MoodLog[]) || []
  lastEpds.value = (epdsRes.data?.[0] as EPDSScreening) || null
})
</script>

<style scoped>
.mood-page { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }

.mood-log-section { margin-bottom: 28px; }
.section { margin-bottom: 28px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 12px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.btn-link { font-size: 0.85rem; color: var(--color-primary); text-decoration: none; font-weight: 600; }

.mood-grid { display: flex; gap: 10px; justify-content: center; margin-bottom: 16px; }
.mood-btn {
  display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 16px;
  border: 2px solid var(--color-border-light); border-radius: var(--radius-md);
  background: var(--color-surface); cursor: pointer; transition: all var(--transition-fast);
  font-family: var(--font-body); min-width: 70px;
}
.mood-btn:hover { border-color: var(--color-primary-light); }
.mood-btn.selected { border-color: var(--color-primary); background: var(--color-primary-ultralight); }
.mood-emoji { font-size: 1.5rem; }
.mood-label { font-size: 0.7rem; color: var(--color-text-secondary); }

.mood-note { display: flex; flex-direction: column; gap: 8px; }
.form-textarea { padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); resize: none; outline: none; }
.form-textarea:focus { border-color: var(--color-primary); }
.btn-save-mood { align-self: flex-end; padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.btn-save-mood:disabled { opacity: 0.6; }

/* EPDS */
.epds-result { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); }
.epds-score { display: flex; flex-direction: column; align-items: center; width: 60px; height: 60px; border-radius: 50%; justify-content: center; flex-shrink: 0; }
.epds-score.low { background: rgba(124, 184, 212, 0.15); color: var(--color-success); }
.epds-score.medium { background: rgba(233, 196, 106, 0.15); color: var(--color-warning); }
.epds-score.high { background: rgba(231, 111, 81, 0.15); color: var(--color-danger); }
.score-value { font-size: 1.2rem; font-weight: 700; font-family: var(--font-mono); }
.score-label { font-size: 0.65rem; }
.epds-info p { font-size: 0.85rem; font-weight: 500; }
.epds-date { font-size: 0.75rem; color: var(--color-text-muted); }
.epds-prompt { font-size: 0.85rem; color: var(--color-text-secondary); padding: 16px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); }

/* History */
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-sm); }
.history-emoji { font-size: 1.2rem; }
.history-content { flex: 1; }
.history-note { font-size: 0.85rem; }
.history-date { font-size: 0.75rem; color: var(--color-text-muted); }
</style>
