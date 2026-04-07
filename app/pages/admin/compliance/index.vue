<template>
  <div class="compliance-page">
    <header class="page-header">
      <h1 class="page-title">Соблюдение протоколов</h1>
    </header>

    <!-- Overall compliance -->
    <div class="compliance-overview">
      <div class="compliance-ring">
        <svg viewBox="0 0 120 120" class="ring-svg">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-border-light)" stroke-width="8" />
          <circle cx="60" cy="60" r="52" fill="none" :stroke="complianceColor" stroke-width="8"
            stroke-linecap="round" :stroke-dasharray="`${compliancePct * 3.27} 327`"
            transform="rotate(-90 60 60)" />
        </svg>
        <div class="ring-label">
          <span class="ring-value">{{ compliancePct }}%</span>
          <span class="ring-text">выполнение</span>
        </div>
      </div>
      <div class="compliance-summary">
        <div class="summary-item"><strong>{{ stats.completed }}</strong> выполнено</div>
        <div class="summary-item"><strong>{{ stats.overdue }}</strong> просрочено</div>
        <div class="summary-item"><strong>{{ stats.upcoming }}</strong> предстоит</div>
      </div>
    </div>

    <!-- Gaps -->
    <section class="section">
      <h2 class="section-title">Выявленные пробелы</h2>
      <div v-if="gaps.length" class="gaps-list">
        <div v-for="gap in gaps" :key="gap.id" class="gap-card" :class="gap.severity">
          <div class="gap-indicator" />
          <div class="gap-content">
            <h3>{{ gap.title }}</h3>
            <p>{{ gap.description }}</p>
            <span class="gap-count">{{ gap.affected_families }} семей</span>
          </div>
        </div>
      </div>
      <p v-else class="empty-text">Пробелов не обнаружено ✓</p>
    </section>

    <!-- Protocol checklist -->
    <section class="section">
      <h2 class="section-title">Обязательные мероприятия</h2>
      <div class="protocol-list">
        <div v-for="item in protocolItems" :key="item.event_type" class="protocol-row">
          <span class="protocol-name">{{ item.event_type }}</span>
          <div class="protocol-bar-track">
            <div class="protocol-bar-fill" :style="{ width: `${item.completion_rate}%` }" :class="complianceBarClass(item.completion_rate)" />
          </div>
          <span class="protocol-pct">{{ item.completion_rate }}%</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

const compliancePct = ref(0)
const stats = reactive({ completed: 0, overdue: 0, upcoming: 0 })
const gaps = ref<Array<{ id: string; title: string; description: string; severity: string; affected_families: number }>>([])
const protocolItems = ref<Array<{ event_type: string; completion_rate: number }>>([])

const complianceColor = computed(() => {
  if (compliancePct.value >= 80) return 'var(--color-success)'
  if (compliancePct.value >= 60) return 'var(--color-warning)'
  return 'var(--color-danger)'
})

function complianceBarClass(pct: number) {
  if (pct >= 80) return 'high'
  if (pct >= 60) return 'medium'
  return 'low'
}

onMounted(async () => {
  if (!authStore.clinicId) return

  const { data: overview } = await supabase
    .from('v_compliance_overview')
    .select('*')
    .eq('clinic_id', authStore.clinicId)
    .single()

  if (overview) {
    const d = overview as Record<string, number>
    compliancePct.value = d.compliance_pct || 0
    stats.completed = d.completed_count || 0
    stats.overdue = d.overdue_count || 0
    stats.upcoming = d.upcoming_count || 0
  }

  const { data: gapsData } = await supabase
    .from('v_compliance_gaps')
    .select('*')
    .eq('clinic_id', authStore.clinicId)
    .order('affected_families', { ascending: false })

  gaps.value = (gapsData || []).map((g: Record<string, unknown>) => ({
    id: String(g.id || g.event_type),
    title: String(g.title || g.event_type),
    description: String(g.description || ''),
    severity: Number(g.affected_families) > 10 ? 'critical' : 'warning',
    affected_families: Number(g.affected_families),
  }))

  const { data: protocols } = await supabase
    .from('v_protocol_completion')
    .select('*')
    .eq('clinic_id', authStore.clinicId)
    .order('completion_rate')

  protocolItems.value = (protocols || []).map((p: Record<string, unknown>) => ({
    event_type: String(p.event_type),
    completion_rate: Number(p.completion_rate) || 0,
  }))
})
</script>

<style scoped>
.compliance-page { max-width: 800px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }

.compliance-overview { display: flex; align-items: center; gap: 32px; margin-bottom: 28px; flex-wrap: wrap; }
.compliance-ring { position: relative; width: 120px; height: 120px; }
.ring-svg { width: 100%; height: 100%; }
.ring-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ring-value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-mono); }
.ring-text { font-size: 0.7rem; color: var(--color-text-secondary); }

.compliance-summary { display: flex; gap: 20px; }
.summary-item { font-size: 0.9rem; }
.summary-item strong { font-family: var(--font-mono); font-size: 1.1rem; display: block; }

.section { margin-bottom: 28px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 12px; }

.gaps-list { display: flex; flex-direction: column; gap: 8px; }
.gap-card { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-sm); }
.gap-indicator { width: 4px; height: 32px; border-radius: 2px; flex-shrink: 0; margin-top: 2px; }
.gap-card.critical .gap-indicator { background: var(--color-danger); }
.gap-card.warning .gap-indicator { background: var(--color-warning); }
.gap-content h3 { font-size: 0.9rem; font-weight: 600; }
.gap-content p { font-size: 0.8rem; color: var(--color-text-secondary); }
.gap-count { font-size: 0.75rem; color: var(--color-text-muted); }
.empty-text { color: var(--color-success); font-size: 0.9rem; }

.protocol-list { display: flex; flex-direction: column; gap: 8px; }
.protocol-row { display: flex; align-items: center; gap: 12px; }
.protocol-name { width: 200px; font-size: 0.85rem; flex-shrink: 0; }
.protocol-bar-track { flex: 1; height: 8px; background: var(--color-border-light); border-radius: 4px; overflow: hidden; }
.protocol-bar-fill { height: 100%; border-radius: 4px; }
.protocol-bar-fill.high { background: var(--color-success); }
.protocol-bar-fill.medium { background: var(--color-warning); }
.protocol-bar-fill.low { background: var(--color-danger); }
.protocol-pct { width: 40px; text-align: right; font-size: 0.8rem; font-family: var(--font-mono); font-weight: 600; }
</style>
