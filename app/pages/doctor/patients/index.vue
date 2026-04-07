<template>
  <div class="patients-page">
    <header class="page-header">
      <NuxtLink to="/doctor" class="back-link">
        <Icon name="lucide:chevron-left" size="16" /> Назад
      </NuxtLink>
      <h1 class="page-title">Пациенты</h1>
      <div class="search-box">
        <Icon name="lucide:search" size="16" />
        <input v-model="search" type="text" placeholder="Поиск..." class="search-input" />
      </div>
    </header>

    <div v-if="filteredPatients.length" class="patient-list">
      <NuxtLink
        v-for="p in filteredPatients"
        :key="p.family_id"
        :to="`/doctor/patients/${p.family_id}`"
        class="patient-card"
      >
        <div class="patient-avatar">
          <Icon name="lucide:user" size="20" />
        </div>
        <div class="patient-info">
          <h3>{{ p.mother_name || 'Пациент' }}</h3>
          <p>{{ p.journey_type ? journeyLabel(p.journey_type) : 'Нет маршрута' }}</p>
        </div>
        <Icon name="lucide:chevron-right" size="16" class="arrow" />
      </NuxtLink>
    </div>

    <div v-else class="empty-state">
      <p>Нет пациентов</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()
const search = ref('')
const patients = ref<Array<Record<string, unknown>>>([])

const filteredPatients = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return patients.value
  return patients.value.filter(p => (p.mother_name as string || '').toLowerCase().includes(q))
})

function journeyLabel(type: string) {
  const map: Record<string, string> = { pregnancy: 'Беременность', postpartum: 'Послеродовой', infant: 'Младенец' }
  return map[type] || type
}

onMounted(async () => {
  // Get all families this doctor has seen via appointments
  const { data } = await supabase
    .from('appointments')
    .select('family_id')
    .eq('doctor_id', authStore.profile?.id)

  const uniqueIds = [...new Set((data || []).map(r => r.family_id))]
  if (!uniqueIds.length) return

  // Fetch family details with mother name and active journey
  const { data: families } = await supabase
    .from('families')
    .select('id, primary_parent:users!families_primary_parent_id_fkey(first_name, last_name)')
    .in('id', uniqueIds)

  const { data: journeys } = await supabase
    .from('journeys')
    .select('family_id, type')
    .in('family_id', uniqueIds)
    .eq('status', 'active')

  const journeyMap = new Map<string, string>()
  for (const j of journeys || []) {
    journeyMap.set(j.family_id, j.type)
  }

  patients.value = (families || []).map(f => {
    const parent = f.primary_parent as Record<string, unknown> | null
    return {
      family_id: f.id,
      mother_name: parent ? `${parent.first_name || ''} ${parent.last_name || ''}`.trim() : 'Пациент',
      journey_type: journeyMap.get(f.id) || null,
    }
  })
})
</script>

<style scoped>
.patients-page { max-width: 800px; margin: 0 auto; padding: 24px 16px; }
.page-header { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 20px; }
.back-link { display: flex; align-items: center; gap: 4px; color: var(--color-text-secondary); text-decoration: none; font-size: 0.85rem; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; flex: 1; }

.search-box {
  display: flex; align-items: center; gap: 8px; padding: 8px 14px;
  border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  background: var(--color-surface); width: 100%; max-width: 240px;
}
.search-input { border: none; outline: none; font-size: 0.85rem; font-family: var(--font-body); background: transparent; flex: 1; }

.patient-list { display: flex; flex-direction: column; gap: 8px; }
.patient-card {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm); text-decoration: none; color: inherit;
}
.patient-card:hover { box-shadow: var(--shadow-sm); }

.patient-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary-ultralight); color: var(--color-primary); display: flex; align-items: center; justify-content: center; }
.patient-info { flex: 1; }
.patient-info h3 { font-size: 0.9rem; font-weight: 600; }
.patient-info p { font-size: 0.8rem; color: var(--color-text-secondary); }
.arrow { color: var(--color-text-muted); }

.empty-state { text-align: center; padding: 48px; color: var(--color-text-muted); }
</style>
