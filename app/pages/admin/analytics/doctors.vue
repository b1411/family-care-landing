<template>
  <div class="doctors-page">
    <header class="page-header">
      <h1 class="page-title">Производительность врачей</h1>
    </header>

    <!-- Overview cards -->
    <div class="overview-grid">
      <div v-for="doc in doctors" :key="doc.id" class="doctor-card">
        <div class="doc-header">
          <div class="doc-avatar">{{ doc.name.charAt(0) }}</div>
          <div>
            <h3>{{ doc.name }}</h3>
            <span class="doc-specialty">{{ doc.specialty }}</span>
          </div>
        </div>

        <div class="doc-metrics">
          <div class="metric">
            <span class="metric-label">Приёмы/нед</span>
            <span class="metric-value">{{ doc.weeklyVisits }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">No-show</span>
            <span class="metric-value" :class="{ danger: doc.noShowRate > 15 }">{{ doc.noShowRate }}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Ср. визит</span>
            <span class="metric-value">{{ doc.avgDuration }} мин</span>
          </div>
          <div class="metric">
            <span class="metric-label">Рейтинг</span>
            <span class="metric-value">{{ doc.rating }}/5</span>
          </div>
        </div>

        <!-- Workload heatmap (simplified) -->
        <div class="workload-bar">
          <span class="workload-label">Загрузка</span>
          <div class="workload-track">
            <div class="workload-fill" :style="{ width: `${doc.utilization}%` }" :class="utilizationClass(doc.utilization)" />
          </div>
          <span class="workload-pct">{{ doc.utilization }}%</span>
        </div>
      </div>
    </div>

    <div v-if="!doctors.length" class="empty">
      <p>Данные загружаются...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

interface DoctorPerf {
  id: string; name: string; specialty: string
  weeklyVisits: number; noShowRate: number; avgDuration: number
  rating: number; utilization: number
}

const doctors = ref<DoctorPerf[]>([])

function utilizationClass(pct: number) {
  if (pct > 90) return 'overloaded'
  if (pct > 70) return 'optimal'
  return 'low'
}

onMounted(async () => {
  if (!authStore.clinicId) return

  const { data } = await supabase
    .from('v_doctor_performance')
    .select('*')
    .eq('clinic_id', authStore.clinicId)

  doctors.value = (data || []).map((d: Record<string, unknown>) => ({
    id: String(d.doctor_id),
    name: String(d.full_name || 'Врач'),
    specialty: String(d.specialty || ''),
    weeklyVisits: Number(d.weekly_visits) || 0,
    noShowRate: Number(d.no_show_rate) || 0,
    avgDuration: Number(d.avg_duration_minutes) || 0,
    rating: Number(d.avg_rating) || 0,
    utilization: Number(d.utilization_pct) || 0,
  }))
})
</script>

<style scoped>
.doctors-page { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }

.overview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }

.doctor-card { padding: 20px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); }
.doc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.doc-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary-ultralight); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; }
.doc-header h3 { font-size: 0.95rem; font-weight: 600; }
.doc-specialty { font-size: 0.8rem; color: var(--color-text-secondary); }

.doc-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
.metric { text-align: center; }
.metric-label { display: block; font-size: 0.7rem; color: var(--color-text-muted); }
.metric-value { font-size: 0.95rem; font-weight: 700; font-family: var(--font-mono); }
.metric-value.danger { color: var(--color-danger); }

.workload-bar { display: flex; align-items: center; gap: 8px; }
.workload-label { font-size: 0.75rem; color: var(--color-text-secondary); width: 60px; }
.workload-track { flex: 1; height: 8px; background: var(--color-border-light); border-radius: 4px; overflow: hidden; }
.workload-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
.workload-fill.low { background: rgba(124, 184, 212, 0.6); }
.workload-fill.optimal { background: var(--color-primary); }
.workload-fill.overloaded { background: var(--color-danger); }
.workload-pct { font-size: 0.8rem; font-weight: 600; font-family: var(--font-mono); width: 40px; text-align: right; }

.empty { text-align: center; padding: 48px; color: var(--color-text-muted); }
</style>
