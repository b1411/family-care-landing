<template>
  <div class="page">
    <div class="page-hero">
      <NuxtLink to="/admin" class="back-link"><Icon name="lucide:chevron-left" size="16" /> Админ</NuxtLink>
      <div class="hero-top">
        <div>
          <h1 class="page-title"><Icon name="lucide:file-text" size="22" /> Шаблоны сообщений</h1>
          <p class="page-desc">Шаблоны для WhatsApp, SMS, Email и Push-уведомлений</p>
        </div>
        <button class="btn-action" @click="showCreate = true"><Icon name="lucide:plus" size="14" /> Создать</button>
      </div>
    </div>

    <!-- Channel filter -->
    <div class="filter-row">
      <button v-for="ch in channels" :key="ch.key" class="filter-chip" :class="{ active: channelFilter === ch.key }" @click="channelFilter = ch.key">
        <Icon :name="ch.icon" size="13" /> {{ ch.label }}
      </button>
    </div>

    <div v-if="loading" class="card"><div class="empty-mini">Загрузка...</div></div>
    <div v-else-if="!filtered.length" class="card"><div class="empty-mini">Шаблонов нет</div></div>

    <div v-for="t in filtered" :key="t.id" class="card tpl-card">
      <div class="tpl-header">
        <span class="ch-badge" :class="t.channel">{{ channelLabel(t.channel) }}</span>
        <h3 class="tpl-name">{{ t.name }}</h3>
      </div>
      <p v-if="t.subject" class="tpl-subject">Тема: {{ t.subject }}</p>
      <pre class="tpl-body">{{ t.body }}</pre>
      <div v-if="t.variables?.length" class="tpl-vars">
        <span v-for="v in t.variables" :key="v" class="var-chip">{{ '{{' + v + '}}' }}</span>
      </div>
      <span class="tpl-date">{{ fmtDate(t.created_at) }}</span>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="modal-card modal-lg">
          <h2 class="modal-title">Новый шаблон</h2>
          <div class="fg"><label class="fl">Название</label><input v-model="form.name" class="fi" placeholder="Приветствие новой мамы" /></div>
          <div class="fg">
            <label class="fl">Канал</label>
            <select v-model="form.channel" class="fi">
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="push">Push</option>
            </select>
          </div>
          <div v-if="form.channel === 'email'" class="fg"><label class="fl">Тема</label><input v-model="form.subject" class="fi" placeholder="Тема письма" /></div>
          <div class="fg">
            <label class="fl">Текст сообщения</label>
            <textarea v-model="form.body" class="fi" rows="5" placeholder="Здравствуйте, {{mother_name}}! ..." />
          </div>
          <p class="hint">Переменные: <code v-for="v in availableVars" :key="v">{{ '{{' + v + '}}' }}</code></p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showCreate = false">Отмена</button>
            <button class="btn-submit" :disabled="!form.name || !form.body || saving" @click="save">
              {{ saving ? 'Сохранение...' : 'Создать' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const loading = ref(true)
const saving = ref(false)
const showCreate = ref(false)
const templates = ref<any[]>([])
const channelFilter = ref('all')

const channels = [
  { key: 'all', label: 'Все', icon: 'lucide:layout-grid' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'lucide:message-circle' },
  { key: 'sms', label: 'SMS', icon: 'lucide:smartphone' },
  { key: 'email', label: 'Email', icon: 'lucide:mail' },
  { key: 'push', label: 'Push', icon: 'lucide:bell' },
]

const availableVars = ['mother_name', 'child_name', 'clinic_name', 'edd_date', 'week', 'doctor_name']

const form = reactive({ name: '', channel: 'whatsapp', subject: '', body: '' })

const filtered = computed(() => {
  if (channelFilter.value === 'all') return templates.value
  return templates.value.filter(t => t.channel === channelFilter.value)
})

function fmtDate(d: string) { return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) }
function channelLabel(ch: string) {
  const m: Record<string, string> = { whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email', push: 'Push' }
  return m[ch] || ch
}

function extractVars(body: string): string[] {
  const matches = body.match(/\{\{(\w+)\}\}/g)
  return matches ? [...new Set(matches.map(m => m.replace(/[{}]/g, '')))] : []
}

async function save() {
  saving.value = true
  try {
    const vars = extractVars(form.body)
    const data = await $fetch('/api/admin/templates', {
      method: 'POST',
      body: {
        name: form.name,
        channel: form.channel,
        subject: form.channel === 'email' ? form.subject : undefined,
        body: form.body,
        variables: vars.length ? vars : undefined,
      },
    })
    templates.value.unshift(data)
    showCreate.value = false
    form.name = ''
    form.subject = ''
    form.body = ''
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    templates.value = await $fetch<any[]>('/api/admin/templates')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }

.page-hero {
  background: linear-gradient(135deg, rgba(139,126,200,0.08), rgba(232,160,191,0.06));
  border: 1px solid rgba(139,126,200,0.12); border-radius: 16px; padding: 24px 28px;
}
.back-link { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--color-text-muted); text-decoration: none; margin-bottom: 10px; }
.hero-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.page-title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.page-desc { font-size: 0.82rem; color: var(--color-text-muted); margin-top: 4px; }

.filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-chip { display: flex; align-items: center; gap: 5px; padding: 6px 14px; border: 1px solid var(--color-border-light); border-radius: 10px; background: white; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.filter-chip.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }

.card { background: white; border: 1px solid var(--color-border-light); border-radius: 14px; padding: 18px; }
.empty-mini { text-align: center; padding: 24px; font-size: 0.82rem; color: var(--color-text-muted); }

.tpl-card { transition: box-shadow 0.15s; }
.tpl-card:hover { box-shadow: 0 2px 12px rgba(139,126,200,0.08); }
.tpl-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.tpl-name { font-weight: 700; font-size: 0.92rem; }
.ch-badge { font-size: 0.65rem; font-weight: 700; padding: 3px 10px; border-radius: 8px; }
.ch-badge.whatsapp { background: rgba(37,211,102,0.1); color: #25D366; }
.ch-badge.sms { background: rgba(245,158,11,0.1); color: #D97706; }
.ch-badge.email { background: rgba(107,154,196,0.1); color: #6B9AC4; }
.ch-badge.push { background: rgba(139,126,200,0.1); color: var(--color-primary); }
.tpl-subject { font-size: 0.78rem; color: var(--color-text-muted); margin-bottom: 6px; }
.tpl-body { font-size: 0.82rem; line-height: 1.5; white-space: pre-wrap; word-break: break-word; background: rgba(139,126,200,0.03); border: 1px solid rgba(139,126,200,0.08); border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; font-family: var(--font-body); }
.tpl-vars { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 6px; }
.var-chip { font-size: 0.65rem; padding: 2px 8px; border-radius: 6px; background: rgba(168,200,232,0.12); color: #6B9AC4; font-family: var(--font-mono); }
.tpl-date { font-size: 0.68rem; color: var(--color-text-muted); }

.hint { font-size: 0.72rem; color: var(--color-text-muted); }
.hint code { font-family: var(--font-mono); font-size: 0.68rem; background: rgba(139,126,200,0.06); padding: 1px 4px; border-radius: 3px; margin-right: 4px; }

.btn-action { display: flex; align-items: center; gap: 6px; padding: 9px 18px; background: var(--gradient-cta); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 0.82rem; cursor: pointer; font-family: var(--font-body); white-space: nowrap; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: white; border-radius: 16px; padding: 24px; width: 100%; max-width: 460px; display: flex; flex-direction: column; gap: 14px; }
.modal-lg { max-width: 560px; }
.modal-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fl { font-size: 0.78rem; font-weight: 600; color: var(--color-text-muted); }
.fi { padding: 9px 12px; border: 1px solid var(--color-border-light); border-radius: 10px; font-size: 0.88rem; font-family: var(--font-body); outline: none; background: white; resize: vertical; }
.fi:focus { border-color: var(--color-primary); }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border-light); border-radius: 10px; cursor: pointer; font-family: var(--font-body); }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
