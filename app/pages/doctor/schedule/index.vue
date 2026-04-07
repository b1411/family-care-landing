<template>
  <div class="schedule-page">
    <header class="page-header">
      <NuxtLink to="/doctor" class="back-link">
        <Icon name="lucide:chevron-left" size="16" /> Назад
      </NuxtLink>
      <h1 class="page-title">Управление расписанием</h1>
    </header>

    <!-- Date selector -->
    <div class="date-picker">
      <button
        v-for="d in weekDates"
        :key="d.iso"
        class="date-btn"
        :class="{ active: selectedDate === d.iso, today: d.isToday }"
        @click="selectedDate = d.iso; loadSlots()"
      >
        <span class="day-name">{{ d.dayName }}</span>
        <span class="day-num">{{ d.day }}</span>
      </button>
    </div>

    <!-- Existing slots -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Слоты на {{ selectedDate }}</h2>
        <button class="btn-add-slot" @click="showAdd = true">
          <Icon name="lucide:plus" size="14" /> Добавить слот
        </button>
      </div>

      <div v-if="daySlots.length" class="slot-list">
        <div v-for="slot in daySlots" :key="slot.id" class="slot-row" :class="{ booked: !slot.is_available }">
          <span class="slot-time">{{ slot.start_time?.slice(0, 5) }} — {{ slot.end_time?.slice(0, 5) }}</span>
          <span class="slot-status">{{ slot.is_available ? 'Свободно' : 'Занято' }}</span>
          <button v-if="slot.is_available" class="btn-delete-slot" @click="deleteSlot(slot.id)">
            <Icon name="lucide:trash-2" size="14" />
          </button>
        </div>
      </div>
      <p v-else class="empty-mini">Нет слотов на этот день</p>
    </section>

    <!-- Add slot modal -->
    <Teleport to="body">
      <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
        <div class="modal-card">
          <h2 class="modal-title">Добавить слот</h2>
          <div class="form-group">
            <label class="form-label">Начало</label>
            <input v-model="newSlot.start" type="time" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Конец</label>
            <input v-model="newSlot.end" type="time" class="form-input" />
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showAdd = false">Отмена</button>
            <button class="btn-submit" @click="addSlot">Добавить</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const daySlots = ref<Array<Record<string, unknown>>>([])
const showAdd = ref(false)
const newSlot = reactive({ start: '09:00', end: '09:30' })

const weekDates = computed(() => {
  const days: Array<{ iso: string; day: number; dayName: string; isToday: boolean }> = []
  for (let i = 0; i < 14; i++) {
    const d = dayjs().add(i, 'day')
    days.push({
      iso: d.format('YYYY-MM-DD'),
      day: d.date(),
      dayName: d.format('dd'),
      isToday: i === 0,
    })
  }
  return days
})

async function loadSlots() {
  const { data } = await supabase
    .from('appointment_slots')
    .select('*')
    .eq('doctor_id', authStore.profile?.id)
    .eq('date', selectedDate.value)
    .order('start_time')

  daySlots.value = data || []
}

async function addSlot() {
  await supabase.from('appointment_slots').insert({
    doctor_id: authStore.profile?.id,
    date: selectedDate.value,
    start_time: newSlot.start,
    end_time: newSlot.end,
    is_available: true,
  })
  showAdd.value = false
  await loadSlots()
}

async function deleteSlot(id: string) {
  await supabase.from('appointment_slots').delete().eq('id', id)
  await loadSlots()
}

onMounted(loadSlots)
</script>

<style scoped>
.schedule-page { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.back-link { display: flex; align-items: center; gap: 4px; color: var(--color-text-secondary); text-decoration: none; font-size: 0.85rem; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; flex: 1; }

.date-picker { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 20px; }
.date-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 14px;
  border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-surface);
  cursor: pointer; font-family: var(--font-body); flex-shrink: 0; min-width: 52px;
}
.date-btn.active { border-color: var(--color-primary); background: var(--color-primary-ultralight); }
.date-btn.today .day-num { color: var(--color-primary); font-weight: 700; }
.day-name { font-size: 0.7rem; color: var(--color-text-muted); text-transform: capitalize; }
.day-num { font-size: 1rem; font-weight: 600; }

.section { margin-bottom: 24px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.section-title { font-size: 1rem; font-weight: 600; }

.btn-add-slot {
  display: flex; align-items: center; gap: 4px; padding: 6px 12px;
  background: var(--color-primary-ultralight); color: var(--color-primary);
  border: 1px solid var(--color-primary); border-radius: var(--radius-sm);
  font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: var(--font-body);
}

.slot-list { display: flex; flex-direction: column; gap: 6px; }
.slot-row {
  display: flex; align-items: center; gap: 12px; padding: 12px 16px;
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
}
.slot-row.booked { opacity: 0.6; }
.slot-time { font-size: 0.9rem; font-weight: 600; font-family: var(--font-mono); flex: 1; }
.slot-status { font-size: 0.8rem; color: var(--color-text-secondary); }
.btn-delete-slot { background: none; border: none; color: var(--color-danger); cursor: pointer; padding: 4px; }

.empty-mini { text-align: center; padding: 24px; color: var(--color-text-muted); font-size: 0.85rem; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: var(--color-surface); border-radius: var(--radius-md); padding: 24px; width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 14px; }
.modal-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 600; }
.form-input { padding: 10px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; }
.form-input:focus { border-color: var(--color-primary); }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-body); }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }
</style>
