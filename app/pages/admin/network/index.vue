<template>
  <div class="network-page">
    <header class="page-header">
      <h1 class="page-title">Сеть филиалов</h1>
    </header>

    <!-- Network overview -->
    <div class="network-grid">
      <div class="net-card">
        <span class="net-value">{{ branches.length }}</span>
        <span class="net-label">Филиалов</span>
      </div>
      <div class="net-card">
        <span class="net-value">{{ totalFamilies }}</span>
        <span class="net-label">Семей всего</span>
      </div>
      <div class="net-card">
        <span class="net-value">{{ avgCompletion }}%</span>
        <span class="net-label">Ср. выполнение</span>
      </div>
    </div>

    <!-- Branch ranking -->
    <section class="section">
      <h2 class="section-title">Рейтинг филиалов</h2>
      <div class="branch-list">
        <div v-for="(branch, idx) in branches" :key="branch.id" class="branch-card">
          <span class="branch-rank">{{ idx + 1 }}</span>
          <div class="branch-info">
            <h3>{{ branch.name }}</h3>
            <p>{{ branch.city }}</p>
          </div>
          <div class="branch-metrics">
            <div class="bm">
              <span class="bm-value">{{ branch.families }}</span>
              <span class="bm-label">семей</span>
            </div>
            <div class="bm">
              <span class="bm-value">{{ branch.completion }}%</span>
              <span class="bm-label">выполн.</span>
            </div>
            <div class="bm">
              <span class="bm-value">{{ branch.nps }}</span>
              <span class="bm-label">NPS</span>
            </div>
            <div class="bm">
              <span class="bm-value">{{ branch.revenue }}</span>
              <span class="bm-label">доход</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

interface Branch {
  id: string; name: string; city: string
  families: number; completion: number; nps: number; revenue: string
}

const branches = ref<Branch[]>([])
const totalFamilies = computed(() => branches.value.reduce((s, b) => s + b.families, 0))
const avgCompletion = computed(() => {
  if (!branches.value.length) return 0
  return Math.round(branches.value.reduce((s, b) => s + b.completion, 0) / branches.value.length)
})

onMounted(async () => {
  if (!authStore.clinicId) return

  const { data } = await supabase
    .from('v_network_branches')
    .select('*')
    .eq('network_id', authStore.clinicId)
    .order('completion_rate', { ascending: false })

  branches.value = (data || []).map((b: Record<string, unknown>) => ({
    id: String(b.branch_id),
    name: String(b.name || 'Филиал'),
    city: String(b.city || ''),
    families: Number(b.active_families) || 0,
    completion: Number(b.completion_rate) || 0,
    nps: Number(b.nps_score) || 0,
    revenue: `${Math.round(Number(b.monthly_revenue || 0) / 1000)}K`,
  }))
})
</script>

<style scoped>
.network-page { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }

.network-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
.net-card { padding: 20px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); text-align: center; }
.net-value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-mono); display: block; }
.net-label { font-size: 0.75rem; color: var(--color-text-secondary); }

.section { margin-bottom: 28px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 14px; }

.branch-list { display: flex; flex-direction: column; gap: 8px; }
.branch-card { display: flex; align-items: center; gap: 14px; padding: 16px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); }
.branch-rank { width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary-ultralight); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
.branch-info { flex: 1; }
.branch-info h3 { font-size: 0.95rem; font-weight: 600; }
.branch-info p { font-size: 0.8rem; color: var(--color-text-secondary); }

.branch-metrics { display: flex; gap: 16px; }
.bm { text-align: center; }
.bm-value { display: block; font-size: 0.9rem; font-weight: 700; font-family: var(--font-mono); }
.bm-label { font-size: 0.65rem; color: var(--color-text-muted); }
</style>
