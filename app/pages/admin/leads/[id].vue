<template>
  <div class="lead-page">
    <!-- Hero -->
    <div class="lead-hero">
      <NuxtLink to="/admin/leads" class="back-link"><Icon name="lucide:chevron-left" size="16" /> Все лиды</NuxtLink>
      <div v-if="lead" class="hero-content">
        <div class="hero-left">
          <h1 class="hero-title">{{ lead.first_name }} {{ lead.last_name || '' }}</h1>
          <div class="hero-meta">
            <span v-if="lead.phone" class="meta-item"><Icon name="lucide:phone" size="12" /> {{ lead.phone }}</span>
            <span v-if="lead.email" class="meta-item"><Icon name="lucide:mail" size="12" /> {{ lead.email }}</span>
            <span class="meta-item"><Icon name="lucide:calendar" size="12" /> {{ formatDate(lead.created_at) }}</span>
          </div>
        </div>
        <div class="hero-right">
          <select v-model="lead.stage" class="stage-select" :style="{ borderColor: stageColors[lead.stage] }" @change="updateStage">
            <option v-for="s in stages" :key="s" :value="s">{{ stageLabels[s] }}</option>
          </select>
          <button v-if="lead.stage !== 'won' && lead.stage !== 'lost'" class="btn-convert" @click="showConvert = true">
            <Icon name="lucide:arrow-right-circle" size="14" /> Конвертировать
          </button>
        </div>
      </div>
    </div>

    <div v-if="lead" class="lead-body">
      <!-- Left column: Details -->
      <div class="left-col">
        <!-- Info card -->
        <div class="info-card">
          <h3 class="card-title">Детали</h3>
          <div class="detail-grid">
            <div class="dg-item">
              <span class="dg-label">Источник</span>
              <span class="dg-value"><Icon :name="sourceIcon(lead.source)" size="12" /> {{ sourceLabels[lead.source] || lead.source }}</span>
            </div>
            <div class="dg-item">
              <span class="dg-label">Координатор</span>
              <span class="dg-value">{{ lead.assigned_name || 'Не назначен' }}</span>
            </div>
            <div v-if="lead.lmp_date" class="dg-item">
              <span class="dg-label">Дата ПМ</span>
              <span class="dg-value">{{ formatDate(lead.lmp_date) }}</span>
            </div>
            <div v-if="lead.edd_date" class="dg-item">
              <span class="dg-label">ПДР</span>
              <span class="dg-value">{{ formatDate(lead.edd_date) }}</span>
            </div>
            <div v-if="lead.utm_source" class="dg-item">
              <span class="dg-label">UTM Source</span>
              <span class="dg-value">{{ lead.utm_source }}</span>
            </div>
            <div v-if="lead.lost_reason" class="dg-item full">
              <span class="dg-label">Причина потери</span>
              <span class="dg-value">{{ lead.lost_reason }}</span>
            </div>
          </div>
          <div v-if="lead.notes" class="notes-block">
            <span class="dg-label">Заметки</span>
            <p class="notes-text">{{ lead.notes }}</p>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="actions-card">
          <h3 class="card-title">Быстрые действия</h3>
          <div class="action-btns">
            <button class="act-btn" @click="openActivityModal('call')"><Icon name="lucide:phone" size="14" /> Звонок</button>
            <button class="act-btn" @click="openActivityModal('whatsapp')"><Icon name="lucide:message-circle" size="14" /> WhatsApp</button>
            <button class="act-btn" @click="openActivityModal('email')"><Icon name="lucide:mail" size="14" /> Email</button>
            <button class="act-btn" @click="openActivityModal('note')"><Icon name="lucide:sticky-note" size="14" /> Заметка</button>
            <button class="act-btn" @click="openActivityModal('meeting')"><Icon name="lucide:users" size="14" /> Встреча</button>
          </div>
        </div>
      </div>

      <!-- Right column: Activity Timeline -->
      <div class="right-col">
        <div class="timeline-card">
          <h3 class="card-title">История взаимодействий</h3>
          <div v-if="activities.length" class="timeline">
            <div v-for="a in activities" :key="a.id" class="tl-item">
              <div class="tl-icon" :class="a.type">
                <Icon :name="activityIcon(a.type)" size="12" />
              </div>
              <div class="tl-body">
                <div class="tl-top">
                  <span class="tl-type">{{ activityLabel(a.type) }}</span>
                  <span v-if="a.direction" class="tl-dir">{{ a.direction === 'inbound' ? '← вх.' : '→ исх.' }}</span>
                </div>
                <p v-if="a.summary" class="tl-summary">{{ a.summary }}</p>
                <div class="tl-meta">
                  <span v-if="a.performer_name">{{ a.performer_name }}</span>
                  <span>{{ formatDateTime(a.created_at) }}</span>
                  <span v-if="a.duration_seconds">{{ Math.round(a.duration_seconds / 60) }} мин</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="tl-empty">
            <Icon name="lucide:clock" size="28" style="opacity:0.2" />
            <p>Нет записей</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="empty-card"><p class="empty-text">Загрузка...</p></div>

    <!-- Activity Modal -->
    <Teleport to="body">
      <div v-if="showActivityModal" class="modal-overlay" @click.self="showActivityModal = false">
        <div class="modal-card">
          <h2 class="modal-title">{{ activityLabel(actForm.type) }}</h2>
          <div v-if="actForm.type === 'call'" class="fg">
            <label class="fl">Направление</label>
            <select v-model="actForm.direction" class="fi">
              <option value="outbound">Исходящий</option>
              <option value="inbound">Входящий</option>
            </select>
          </div>
          <div class="fg"><label class="fl">Описание</label>
            <textarea v-model="actForm.summary" rows="3" class="fi" placeholder="О чём говорили, итог..." />
          </div>
          <div v-if="actForm.type === 'call'" class="fg">
            <label class="fl">Длительность (сек)</label>
            <input v-model.number="actForm.duration" type="number" class="fi" />
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showActivityModal = false">Отмена</button>
            <button class="btn-submit" :disabled="savingAct" @click="saveActivity">
              {{ savingAct ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Convert Modal -->
    <Teleport to="body">
      <div v-if="showConvert" class="modal-overlay" @click.self="showConvert = false">
        <div class="modal-card">
          <h2 class="modal-title">Конвертировать в семью</h2>
          <p class="convert-note">Будет создана семья и карта наблюдения. Координатор сможет пригласить маму в приложение позже.</p>
          <div class="fg"><label class="fl">Дата последней менструации</label><input v-model="convertForm.lmp_date" type="date" class="fi" /></div>
          <div class="fg"><label class="fl">ПДР (рассчитается автоматически)</label><input v-model="convertForm.edd_date" type="date" class="fi" /></div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showConvert = false">Отмена</button>
            <button class="btn-submit" :disabled="converting" @click="convertLead">
              {{ converting ? 'Конвертация...' : 'Конвертировать' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  LEAD_STAGES, LEAD_STAGE_LABELS, LEAD_STAGE_COLORS, LEAD_SOURCE_LABELS,
  type Lead, type LeadActivity,
} from '~/types/crm.types'

definePageMeta({ layout: 'app' })

const route = useRoute()
const leadId = route.params.id as string

const lead = ref<(Lead & { assigned_name?: string }) | null>(null)
const activities = ref<(LeadActivity & { performer_name?: string })[]>([])
const loading = ref(true)
const savingAct = ref(false)
const converting = ref(false)
const showActivityModal = ref(false)
const showConvert = ref(false)

const stages = LEAD_STAGES
const stageLabels = LEAD_STAGE_LABELS
const stageColors = LEAD_STAGE_COLORS
const sourceLabels = LEAD_SOURCE_LABELS

const actForm = reactive({ type: 'call', direction: 'outbound', summary: '', duration: 0 })
const convertForm = reactive({ lmp_date: '', edd_date: '' })

function sourceIcon(source: string) {
  const map: Record<string, string> = {
    website: 'lucide:globe', instagram: 'lucide:instagram', '2gis': 'lucide:map-pin',
    referral: 'lucide:users', walk_in: 'lucide:footprints', phone: 'lucide:phone',
    whatsapp: 'lucide:message-circle', other: 'lucide:help-circle',
  }
  return map[source] || 'lucide:help-circle'
}

function activityIcon(type: string) {
  const map: Record<string, string> = {
    call: 'lucide:phone', whatsapp: 'lucide:message-circle', sms: 'lucide:smartphone',
    email: 'lucide:mail', note: 'lucide:sticky-note', meeting: 'lucide:users',
    demo: 'lucide:monitor', status_change: 'lucide:arrow-right',
  }
  return map[type] || 'lucide:circle'
}

function activityLabel(type: string) {
  const map: Record<string, string> = {
    call: 'Звонок', whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email',
    note: 'Заметка', meeting: 'Встреча', demo: 'Демо', status_change: 'Смена статуса',
  }
  return map[type] || type
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function openActivityModal(type: string) {
  actForm.type = type
  actForm.direction = 'outbound'
  actForm.summary = ''
  actForm.duration = 0
  showActivityModal.value = true
}

async function updateStage() {
  if (!lead.value) return
  await $fetch(`/api/admin/leads/${leadId}`, { method: 'PUT', body: { stage: lead.value.stage } })
  await fetchActivities()
}

async function saveActivity() {
  savingAct.value = true
  try {
    await $fetch(`/api/admin/leads/${leadId}/activities`, {
      method: 'POST',
      body: {
        type: actForm.type,
        direction: actForm.type === 'call' ? actForm.direction : 'outbound',
        summary: actForm.summary || null,
        duration_seconds: actForm.type === 'call' ? actForm.duration : undefined,
      },
    })
    showActivityModal.value = false
    await fetchActivities()
  } finally {
    savingAct.value = false
  }
}

async function convertLead() {
  converting.value = true
  try {
    const result = await $fetch<any>(`/api/admin/leads/${leadId}/convert`, {
      method: 'POST',
      body: { lmp_date: convertForm.lmp_date || undefined, edd_date: convertForm.edd_date || undefined },
    })
    showConvert.value = false
    if (lead.value) {
      lead.value.stage = 'won'
      lead.value.family_id = result.family_id
    }
    await fetchActivities()
  } finally {
    converting.value = false
  }
}

async function fetchLead() {
  const supabase = useSupabaseClient() as any
  const { data } = await supabase
    .from('leads')
    .select(`*, assigned:users!assigned_to ( id, first_name, last_name )`)
    .eq('id', leadId)
    .single()

  if (data) {
    const assigned = Array.isArray(data.assigned) ? data.assigned[0] : data.assigned
    lead.value = {
      ...data,
      assigned_name: assigned ? `${assigned.first_name} ${assigned.last_name}` : undefined,
    } as Lead & { assigned_name?: string }
  }
}

async function fetchActivities() {
  try {
    activities.value = await $fetch<any[]>(`/api/admin/leads/${leadId}/activities`)
  } catch { /* empty */ }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchLead(), fetchActivities()])
  loading.value = false
})
</script>

<style scoped>
.lead-page { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }

.lead-hero {
  background: linear-gradient(135deg, rgba(139,126,200,0.08), rgba(232,160,191,0.06));
  border: 1px solid rgba(139,126,200,0.12); border-radius: 16px; padding: 24px 28px;
}
.back-link { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--color-text-muted); text-decoration: none; margin-bottom: 8px; }
.hero-content { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.hero-title { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; }
.hero-meta { display: flex; gap: 14px; margin-top: 6px; flex-wrap: wrap; }
.meta-item { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--color-text-muted); }
.hero-right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.stage-select {
  padding: 6px 12px; border: 2px solid; border-radius: 8px; font-size: 0.78rem; font-weight: 600;
  background: white; cursor: pointer; outline: none;
}
.btn-convert {
  display: flex; align-items: center; gap: 5px; padding: 7px 14px;
  background: var(--color-success, #4CAF50); color: white; border: none; border-radius: 8px;
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
}
.btn-convert:hover { opacity: 0.9; }

/* Body layout */
.lead-body { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 768px) { .lead-body { grid-template-columns: 1fr; } }

.info-card, .actions-card, .timeline-card {
  background: white; border: 1px solid var(--color-border-light); border-radius: 14px; padding: 20px;
}
.card-title { font-family: var(--font-display); font-size: 0.9rem; font-weight: 700; margin-bottom: 14px; }

.left-col { display: flex; flex-direction: column; gap: 12px; }

/* Detail grid */
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.dg-item.full { grid-column: 1 / -1; }
.dg-label { display: block; font-size: 0.65rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 2px; }
.dg-value { font-size: 0.8rem; display: flex; align-items: center; gap: 4px; }
.notes-block { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--color-border-light); }
.notes-text { font-size: 0.8rem; color: var(--color-text-muted); margin-top: 4px; }

/* Actions */
.action-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.act-btn {
  display: flex; align-items: center; gap: 5px; padding: 7px 12px;
  background: white; border: 1px solid var(--color-border-light); border-radius: 8px;
  font-size: 0.75rem; cursor: pointer; transition: all 0.15s;
}
.act-btn:hover { border-color: rgba(139,126,200,0.25); background: rgba(139,126,200,0.04); }

/* Timeline */
.timeline { display: flex; flex-direction: column; gap: 0; }
.tl-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--color-border-light); }
.tl-item:last-child { border-bottom: none; }
.tl-icon {
  width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; background: rgba(139,126,200,0.08); color: var(--color-primary);
}
.tl-icon.call { background: rgba(76,175,80,0.08); color: #4CAF50; }
.tl-icon.whatsapp { background: rgba(37,211,102,0.08); color: #25D366; }
.tl-icon.email { background: rgba(33,150,243,0.08); color: #2196F3; }
.tl-icon.note { background: rgba(233,196,106,0.08); color: #E9C46A; }
.tl-icon.status_change { background: rgba(139,126,200,0.08); color: var(--color-primary); }
.tl-body { flex: 1; min-width: 0; }
.tl-top { display: flex; align-items: center; gap: 6px; }
.tl-type { font-size: 0.78rem; font-weight: 600; }
.tl-dir { font-size: 0.65rem; color: var(--color-text-muted); background: rgba(0,0,0,0.03); padding: 1px 6px; border-radius: 4px; }
.tl-summary { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 3px; }
.tl-meta { display: flex; gap: 10px; margin-top: 4px; font-size: 0.65rem; color: var(--color-text-muted); }
.tl-empty { text-align: center; padding: 32px; color: var(--color-text-muted); font-size: 0.8rem; }

/* Modal (shared) */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-card { background: white; border-radius: 16px; padding: 28px; width: 100%; max-width: 460px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; margin-bottom: 18px; }
.convert-note { font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 16px; }
.fg { margin-bottom: 14px; }
.fl { display: block; font-size: 0.72rem; font-weight: 600; color: var(--color-text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.03em; }
.fi { width: 100%; padding: 9px 12px; border: 1px solid var(--color-border-light); border-radius: 8px; font-size: 0.82rem; font-family: var(--font-body); outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.fi:focus { border-color: var(--color-primary); }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.btn-cancel { padding: 8px 16px; border: 1px solid var(--color-border-light); border-radius: 8px; background: white; font-size: 0.8rem; cursor: pointer; }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta, linear-gradient(135deg, #8B7EC8, #E8A0BF)); color: white; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.btn-submit:disabled { opacity: 0.5; cursor: default; }

.empty-card { text-align: center; padding: 48px; background: white; border: 1px solid var(--color-border-light); border-radius: 14px; }
.empty-text { font-size: 0.85rem; color: var(--color-text-muted); }
</style>
