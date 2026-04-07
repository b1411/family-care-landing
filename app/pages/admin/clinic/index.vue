<template>
  <div class="clinic-settings">
    <header class="page-header">
      <NuxtLink to="/admin" class="back-link">
        <Icon name="lucide:chevron-left" size="16" /> Назад
      </NuxtLink>
      <h1 class="page-title">Настройки клиники</h1>
    </header>

    <form class="settings-form" @submit.prevent="save">
      <!-- Branding -->
      <section class="settings-section">
        <h2 class="section-title">Брендинг</h2>
        <div class="settings-card">
          <div class="form-group">
            <label class="form-label">Название клиники</label>
            <input v-model="form.name" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Slug (URL)</label>
            <input v-model="form.slug" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">URL логотипа</label>
            <input v-model="form.logo_url" type="url" class="form-input" placeholder="https://..." />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Основной цвет</label>
              <input v-model="form.primary_color" type="color" class="form-color" />
            </div>
            <div class="form-group">
              <label class="form-label">Вторичный цвет</label>
              <input v-model="form.secondary_color" type="color" class="form-color" />
            </div>
          </div>
        </div>
      </section>

      <!-- Contact -->
      <section class="settings-section">
        <h2 class="section-title">Контакты</h2>
        <div class="settings-card">
          <div class="form-group">
            <label class="form-label">Телефон</label>
            <input v-model="form.phone" type="tel" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="form.email" type="email" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Адрес</label>
            <input v-model="form.address" type="text" class="form-input" />
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="settings-section">
        <h2 class="section-title">Модули</h2>
        <div class="settings-card">
          <div v-for="feature in features" :key="feature.key" class="feature-row">
            <div>
              <h4>{{ feature.label }}</h4>
              <p class="feature-desc">{{ feature.desc }}</p>
            </div>
            <label class="toggle">
              <input v-model="form.features[feature.key]" type="checkbox" />
              <span class="toggle-slider" />
            </label>
          </div>
        </div>
      </section>

      <button type="submit" class="btn-save" :disabled="saving">
        {{ saving ? 'Сохранение...' : 'Сохранить настройки' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()
const saving = ref(false)

const form = reactive({
  name: '',
  slug: '',
  logo_url: '',
  primary_color: '#8B7EC8',
  secondary_color: '#E8A0BF',
  phone: '',
  email: '',
  address: '',
  features: {} as Record<string, boolean>,
})

const features = [
  { key: 'ai_assistant', label: 'AI-ассистент', desc: 'Чат-бот с медицинскими рекомендациями' },
  { key: 'telemedicine', label: 'Телемедицина', desc: 'Видеоконсультации с пациентами' },
  { key: 'mood_tracking', label: 'Трекер настроения', desc: 'EPDS-скрининг и мониторинг' },
  { key: 'sos_button', label: 'SOS-кнопка', desc: 'Экстренная связь для пациентов' },
  { key: 'gamification', label: 'Геймификация', desc: 'Ачивки и стрики для мотивации' },
  { key: 'lab_integration', label: 'Интеграция с лабораторией', desc: 'Автоматический импорт результатов' },
]

async function save() {
  saving.value = true
  try {
    await supabase
      .from('clinics')
      .update({
        name: form.name,
        slug: form.slug,
        logo_url: form.logo_url,
        theme_json: {
          primary_color: form.primary_color,
          secondary_color: form.secondary_color,
        },
        settings_json: {
          phone: form.phone,
          email: form.email,
          address: form.address,
          features: form.features,
        },
      })
      .eq('id', authStore.clinicId)
  }
  finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!authStore.clinicId) return

  const { data } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', authStore.clinicId)
    .single()

  if (data) {
    form.name = data.name || ''
    form.slug = data.slug || ''
    form.logo_url = data.logo_url || ''
    form.primary_color = data.theme_json?.primary_color || '#8B7EC8'
    form.secondary_color = data.theme_json?.secondary_color || '#E8A0BF'
    form.phone = data.settings_json?.phone || ''
    form.email = data.settings_json?.email || ''
    form.address = data.settings_json?.address || ''
    form.features = data.settings_json?.features || {}
  }
})
</script>

<style scoped>
.clinic-settings { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.back-link { display: flex; align-items: center; gap: 4px; color: var(--color-text-secondary); text-decoration: none; font-size: 0.85rem; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; flex: 1; }

.settings-section { margin-bottom: 24px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 12px; }

.settings-card {
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; gap: 14px;
}

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 600; }
.form-input { padding: 10px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; }
.form-input:focus { border-color: var(--color-primary); }
.form-row { display: flex; gap: 16px; }
.form-color { width: 60px; height: 40px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; padding: 2px; }

.feature-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 6px 0; }
.feature-row h4 { font-size: 0.9rem; font-weight: 600; }
.feature-desc { font-size: 0.75rem; color: var(--color-text-muted); }

.toggle { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; background: var(--color-border); border-radius: 24px; transition: var(--transition-fast); cursor: pointer; }
.toggle-slider::before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; background: white; border-radius: 50%; transition: var(--transition-fast); }
.toggle input:checked + .toggle-slider { background: var(--color-primary); }
.toggle input:checked + .toggle-slider::before { transform: translateX(20px); }

.btn-save {
  width: 100%; padding: 12px; background: var(--gradient-cta); color: white; border: none;
  border-radius: var(--radius-sm); font-size: 1rem; font-weight: 600; cursor: pointer; font-family: var(--font-body);
}
.btn-save:disabled { opacity: 0.6; }
</style>
