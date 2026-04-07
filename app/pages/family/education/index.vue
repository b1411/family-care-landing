<template>
  <div class="education-page">
    <header class="page-header">
      <h1 class="page-title">Библиотека знаний</h1>
    </header>

    <!-- Categories -->
    <div class="categories">
      <button
        v-for="cat in categories"
        :key="cat.value"
        class="cat-btn"
        :class="{ active: activeCat === cat.value }"
        @click="activeCat = cat.value; fetchContent()"
      >{{ cat.label }}</button>
    </div>

    <!-- Content list -->
    <div v-if="articles.length" class="article-list">
      <NuxtLink
        v-for="article in articles"
        :key="article.id"
        :to="`/family/education/${article.id}`"
        class="article-card"
      >
        <div class="article-type" :class="article.content_type">
          <Icon :name="contentIcon(article.content_type)" size="20" />
        </div>
        <div class="article-content">
          <h3>{{ article.title }}</h3>
          <p>{{ article.description }}</p>
          <div class="article-meta">
            <span v-if="article.read_time_minutes">{{ article.read_time_minutes }} мин</span>
            <span v-if="article.gestational_week">Неделя {{ article.gestational_week }}</span>
          </div>
        </div>
        <Icon name="lucide:chevron-right" size="16" class="arrow" />
      </NuxtLink>
    </div>

    <div v-else class="empty-state">
      <Icon name="lucide:book-open" size="40" class="empty-icon" />
      <h3>Контент появится скоро</h3>
      <p>Наша библиотека постоянно пополняется</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

const activeCat = ref('all')
const articles = ref<Array<Record<string, unknown>>>([])

const categories = [
  { label: 'Все', value: 'all' },
  { label: 'Беременность', value: 'pregnancy' },
  { label: 'Роды', value: 'birth' },
  { label: 'Грудное вскармливание', value: 'breastfeeding' },
  { label: 'Уход за ребёнком', value: 'childcare' },
  { label: 'Психология', value: 'psychology' },
  { label: 'Питание', value: 'nutrition' },
]

function contentIcon(type: string) {
  const map: Record<string, string> = {
    article: 'lucide:file-text',
    video: 'lucide:video',
    checklist: 'lucide:check-square',
    infographic: 'lucide:image',
  }
  return map[type] || 'lucide:file-text'
}

async function fetchContent() {
  let query = supabase
    .from('education_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (activeCat.value !== 'all') {
    query = query.eq('category', activeCat.value)
  }

  if (authStore.clinicId) {
    query = query.or(`clinic_id.eq.${authStore.clinicId},clinic_id.is.null`)
  }

  const { data } = await query.limit(30)
  articles.value = data || []
}

onMounted(fetchContent)
</script>

<style scoped>
.education-page { max-width: 800px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 20px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }

.categories { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 20px; padding-bottom: 4px; }
.cat-btn { flex-shrink: 0; padding: 8px 16px; border: 1px solid var(--color-border); border-radius: 20px; background: var(--color-surface); font-size: 0.85rem; cursor: pointer; font-family: var(--font-body); white-space: nowrap; }
.cat-btn.active { border-color: var(--color-primary); background: var(--color-primary-ultralight); color: var(--color-primary); font-weight: 600; }

.article-list { display: flex; flex-direction: column; gap: 8px; }
.article-card {
  display: flex; align-items: center; gap: 14px; padding: 16px;
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm); text-decoration: none; color: inherit;
  transition: all var(--transition-fast);
}
.article-card:hover { box-shadow: var(--shadow-sm); }

.article-type {
  width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-primary-ultralight); color: var(--color-primary);
}
.article-type.video { background: rgba(231, 111, 81, 0.1); color: var(--color-danger); }
.article-type.checklist { background: rgba(124, 184, 212, 0.1); color: var(--color-success); }

.article-content { flex: 1; }
.article-content h3 { font-size: 0.9rem; font-weight: 600; }
.article-content p { font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.article-meta { display: flex; gap: 8px; margin-top: 4px; font-size: 0.75rem; color: var(--color-text-muted); }
.arrow { color: var(--color-text-muted); }

.empty-state { text-align: center; padding: 48px 16px; color: var(--color-text-muted); }
.empty-state h3 { font-size: 1rem; margin: 8px 0 4px; color: var(--color-text-primary); }
.empty-state p { font-size: 0.85rem; }
.empty-icon { color: var(--color-primary-light); }
</style>
