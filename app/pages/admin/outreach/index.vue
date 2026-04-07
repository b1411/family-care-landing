<template>
  <div class="outreach-page">
    <header class="page-header">
      <h1 class="page-title">Outreach & CRM</h1>
      <button class="btn-create" @click="showCreate = true">
        <Icon name="lucide:plus" size="16" /> Новый сценарий
      </button>
    </header>

    <!-- Scenario list -->
    <div class="scenario-list">
      <div v-for="sc in scenarios" :key="sc.id" class="scenario-card">
        <div class="sc-header">
          <div class="sc-status" :class="sc.is_active ? 'active' : 'paused'" />
          <h3>{{ sc.name }}</h3>
          <span class="sc-badge">{{ sc.trigger_type }}</span>
        </div>
        <p class="sc-desc">{{ sc.description }}</p>
        <div class="sc-stats">
          <span><strong>{{ sc.sent_count }}</strong> отправлено</span>
          <span><strong>{{ sc.open_rate }}%</strong> открыто</span>
          <span><strong>{{ sc.conversion_rate }}%</strong> конверсия</span>
        </div>
        <div class="sc-actions">
          <button class="btn-toggle" @click="toggleScenario(sc)">
            {{ sc.is_active ? 'Пауза' : 'Запуск' }}
          </button>
          <button class="btn-view">Подробнее</button>
        </div>
      </div>
    </div>

    <div v-if="!scenarios.length" class="empty">
      <Icon name="lucide:mail" size="40" />
      <p>Создайте первый сценарий автоматической рассылки</p>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="modal-card">
          <h2>Новый сценарий</h2>
          <div class="form-group">
            <label class="form-label">Название</label>
            <input v-model="form.name" type="text" class="form-input" placeholder="Реактивация через 30 дней" />
          </div>
          <div class="form-group">
            <label class="form-label">Триггер</label>
            <select v-model="form.trigger_type" class="form-input">
              <option value="inactivity">Неактивность</option>
              <option value="event_due">Приближение события</option>
              <option value="missed_appointment">Пропуск приёма</option>
              <option value="low_adherence">Низкая приверженность</option>
              <option value="birthday">День рождения</option>
              <option value="nps_response">NPS ответ</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Канал</label>
            <select v-model="form.channel" class="form-input">
              <option value="push">Push</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Текст сообщения</label>
            <textarea v-model="form.message_template" rows="3" class="form-textarea" placeholder="Здравствуйте, {name}! Мы заметили..." />
          </div>
          <div class="form-group">
            <label class="form-label">Задержка (дней)</label>
            <input v-model.number="form.delay_days" type="number" class="form-input" />
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showCreate = false">Отмена</button>
            <button class="btn-submit" @click="createScenario">Создать</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { OutreachScenario } from '~/types/database'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

const scenarios = ref<OutreachScenario[]>([])
const showCreate = ref(false)
const form = reactive({
  name: '',
  trigger_type: 'inactivity',
  channel: 'push',
  message_template: '',
  delay_days: 3,
})

async function toggleScenario(sc: OutreachScenario) {
  const newStatus = !sc.is_active
  await supabase.from('outreach_scenarios').update({ is_active: newStatus }).eq('id', sc.id)
  sc.is_active = newStatus
}

async function createScenario() {
  if (!authStore.clinicId || !form.name) return

  const { data } = await supabase.from('outreach_scenarios').insert({
    clinic_id: authStore.clinicId,
    name: form.name,
    trigger_type: form.trigger_type,
    channel: form.channel,
    message_template: form.message_template,
    delay_days: form.delay_days,
    is_active: true,
  }).select().single()

  if (data) scenarios.value.unshift(data as OutreachScenario)
  showCreate.value = false
  form.name = ''
  form.message_template = ''
}

onMounted(async () => {
  if (!authStore.clinicId) return
  const { data } = await supabase
    .from('outreach_scenarios')
    .select('*')
    .eq('clinic_id', authStore.clinicId)
    .order('created_at', { ascending: false })

  scenarios.value = (data as OutreachScenario[]) || []
})
</script>

<style scoped>
.outreach-page { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }
.btn-create { display: flex; align-items: center; gap: 6px; padding: 8px 18px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }

.scenario-list { display: flex; flex-direction: column; gap: 12px; }
.scenario-card { padding: 20px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); }
.sc-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.sc-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sc-status.active { background: var(--color-success); }
.sc-status.paused { background: var(--color-text-muted); }
.sc-header h3 { flex: 1; font-size: 0.95rem; font-weight: 600; }
.sc-badge { padding: 2px 8px; background: var(--color-primary-ultralight); color: var(--color-primary); border-radius: 10px; font-size: 0.7rem; font-weight: 600; }
.sc-desc { font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 12px; }

.sc-stats { display: flex; gap: 16px; margin-bottom: 12px; font-size: 0.8rem; color: var(--color-text-secondary); }
.sc-stats strong { color: var(--color-text-primary); font-family: var(--font-mono); }

.sc-actions { display: flex; gap: 8px; }
.btn-toggle { padding: 6px 14px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.8rem; cursor: pointer; font-family: var(--font-body); }
.btn-view { padding: 6px 14px; background: var(--color-primary-ultralight); color: var(--color-primary); border: 1px solid var(--color-primary); border-radius: var(--radius-sm); font-size: 0.8rem; cursor: pointer; font-family: var(--font-body); }

.empty { text-align: center; padding: 48px; color: var(--color-text-muted); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: var(--color-surface); border-radius: var(--radius-md); padding: 24px; width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 14px; }
.modal-card h2 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 600; }
.form-input { padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; }
.form-textarea { padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; resize: vertical; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-body); }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }
</style>
