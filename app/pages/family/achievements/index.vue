<template>
  <div class="achievements-page">
    <header class="page-header">
      <h1 class="page-title">Достижения</h1>
    </header>

    <!-- Streaks -->
    <section class="section">
      <h2 class="section-title">Серии</h2>
      <div class="streaks-grid">
        <div v-for="streak in streaks" :key="streak.type" class="streak-card" :class="{ active: streak.current > 0 }">
          <div class="streak-icon">{{ streak.emoji }}</div>
          <div class="streak-info">
            <span class="streak-current">{{ streak.current }} дн</span>
            <span class="streak-best">рекорд {{ streak.best }} дн</span>
          </div>
          <span class="streak-label">{{ streak.label }}</span>
        </div>
      </div>
    </section>

    <!-- Achievements -->
    <section class="section">
      <h2 class="section-title">Достижения ({{ unlockedCount }}/{{ achievements.length }})</h2>
      <div class="achievements-grid">
        <div v-for="ach in achievements" :key="ach.id" class="achievement-card" :class="{ locked: !ach.unlocked }">
          <div class="ach-icon">{{ ach.emoji }}</div>
          <h3>{{ ach.title }}</h3>
          <p>{{ ach.description }}</p>
          <span v-if="ach.unlocked" class="ach-date">{{ ach.unlocked_at }}</span>
          <div v-else class="ach-progress">
            <div class="ach-bar">
              <div class="ach-bar-fill" :style="{ width: `${ach.progress}%` }" />
            </div>
            <span class="ach-pct">{{ ach.progress }}%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Leaderboard -->
    <section class="section">
      <h2 class="section-title">Таблица лидеров</h2>
      <div class="leaderboard">
        <div v-for="(entry, idx) in leaderboard" :key="entry.userId" class="lb-row" :class="{ me: entry.isMe }">
          <span class="lb-rank">{{ idx + 1 }}</span>
          <span class="lb-name">{{ entry.name }}</span>
          <span class="lb-points">{{ entry.points }} 🏆</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

interface Achievement {
  id: string; emoji: string; title: string; description: string
  unlocked: boolean; unlocked_at: string; progress: number
}

const streaks = ref<Array<{ type: string; emoji: string; label: string; current: number; best: number }>>([
  { type: 'dose', emoji: '💊', label: 'Приём лекарств', current: 0, best: 0 },
  { type: 'mood', emoji: '😊', label: 'Отметка настроения', current: 0, best: 0 },
  { type: 'sleep', emoji: '🌙', label: 'Сон ребёнка', current: 0, best: 0 },
  { type: 'feeding', emoji: '🍼', label: 'Кормление', current: 0, best: 0 },
])

const achievements = ref<Achievement[]>([])
const unlockedCount = computed(() => achievements.value.filter(a => a.unlocked).length)

const leaderboard = ref<Array<{ userId: string; name: string; points: number; isMe: boolean }>>([])

onMounted(async () => {
  if (!user.value) return

  // Streaks
  const { data: streakData } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.value.id)

  for (const row of (streakData || []) as Array<Record<string, unknown>>) {
    const s = streaks.value.find(st => st.type === row.type)
    if (s) {
      s.current = Number(row.current_streak) || 0
      s.best = Number(row.best_streak) || 0
    }
  }

  // Achievements
  const { data: achData } = await supabase
    .from('achievements')
    .select('*, user_achievements(unlocked_at)')
    .order('sort_order')

  achievements.value = (achData || []).map((a: Record<string, unknown>) => {
    const ua = (a.user_achievements as Array<Record<string, string>>)?.[0]
    return {
      id: String(a.id),
      emoji: String(a.emoji || '🏅'),
      title: String(a.title),
      description: String(a.description || ''),
      unlocked: !!ua,
      unlocked_at: ua ? new Date(ua.unlocked_at).toLocaleDateString('ru-RU') : '',
      progress: Number(a.progress || 0),
    }
  })

  // Leaderboard
  const { data: lbData } = await supabase
    .from('v_leaderboard')
    .select('*')
    .limit(10)

  leaderboard.value = (lbData || []).map((l: Record<string, unknown>) => ({
    userId: String(l.user_id),
    name: String(l.display_name || 'Аноним'),
    points: Number(l.total_points) || 0,
    isMe: String(l.user_id) === user.value!.id,
  }))
})
</script>

<style scoped>
.achievements-page { max-width: 700px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }

.section { margin-bottom: 28px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 14px; }

/* Streaks */
.streaks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
.streak-card { padding: 14px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); text-align: center; }
.streak-card.active { border-color: rgba(139, 126, 200, 0.3); background: linear-gradient(135deg, rgba(139, 126, 200, 0.05), rgba(232, 160, 191, 0.05)); }
.streak-icon { font-size: 1.8rem; margin-bottom: 4px; }
.streak-current { display: block; font-size: 1.2rem; font-weight: 700; font-family: var(--font-mono); }
.streak-best { display: block; font-size: 0.7rem; color: var(--color-text-muted); }
.streak-label { font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 4px; display: block; }

/* Achievements */
.achievements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.achievement-card { padding: 16px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); text-align: center; }
.achievement-card.locked { opacity: 0.55; }
.ach-icon { font-size: 2rem; margin-bottom: 6px; }
.achievement-card h3 { font-size: 0.9rem; font-weight: 600; margin-bottom: 4px; }
.achievement-card p { font-size: 0.75rem; color: var(--color-text-secondary); }
.ach-date { font-size: 0.7rem; color: var(--color-success); }

.ach-progress { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
.ach-bar { flex: 1; height: 4px; background: var(--color-border-light); border-radius: 2px; overflow: hidden; }
.ach-bar-fill { height: 100%; background: var(--color-primary); border-radius: 2px; }
.ach-pct { font-size: 0.65rem; font-family: var(--font-mono); color: var(--color-text-muted); }

/* Leaderboard */
.leaderboard { display: flex; flex-direction: column; gap: 4px; }
.lb-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-sm); }
.lb-row.me { border-color: var(--color-primary); background: var(--color-primary-ultralight); }
.lb-rank { width: 24px; font-weight: 700; font-family: var(--font-mono); color: var(--color-text-secondary); }
.lb-name { flex: 1; font-size: 0.9rem; font-weight: 500; }
.lb-points { font-weight: 700; font-family: var(--font-mono); font-size: 0.9rem; }
</style>
