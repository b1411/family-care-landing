<template>
  <div class="packages-page">
    <header class="page-header">
      <h1 class="page-title">Сервисные пакеты</h1>
      <button class="btn-create" @click="showCreate = true">
        <Icon name="lucide:plus" size="16" /> Создать пакет
      </button>
    </header>

    <!-- Package list -->
    <div class="packages-grid">
      <div v-for="pkg in packages" :key="pkg.id" class="package-card">
        <div class="pkg-header">
          <h3>{{ pkg.name }}</h3>
          <span class="pkg-price">{{ formatCurrency(pkg.price) }}</span>
        </div>
        <p class="pkg-desc">{{ pkg.description }}</p>
        <div class="pkg-features">
          <div v-for="(feat, i) in pkg.features" :key="i" class="feature-item">
            <Icon name="lucide:check" size="14" class="feature-check" />
            <span>{{ feat }}</span>
          </div>
        </div>
        <div class="pkg-stats">
          <span>{{ pkg.active_families }} семей</span>
          <span>{{ pkg.duration_months }} мес</span>
        </div>
        <div class="pkg-actions">
          <button class="btn-edit" @click="editPackage(pkg)">Редактировать</button>
          <button class="btn-toggle" @click="togglePackage(pkg)">
            {{ pkg.is_active ? 'Деактивировать' : 'Активировать' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="!packages.length" class="empty">
      <Icon name="lucide:package" size="40" />
      <p>Пакеты не созданы</p>
    </div>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="modal-card">
          <h2>{{ editId ? 'Редактировать пакет' : 'Новый пакет' }}</h2>
          <div class="form-group">
            <label class="form-label">Название</label>
            <input v-model="form.name" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Описание</label>
            <textarea v-model="form.description" rows="2" class="form-textarea" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Цена (₸)</label>
              <input v-model.number="form.price" type="number" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Срок (мес)</label>
              <input v-model.number="form.duration_months" type="number" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Включено (по строке на пункт)</label>
            <textarea v-model="featuresText" rows="4" class="form-textarea" placeholder="Консультация педиатра&#10;УЗИ 2 раза&#10;Анализы крови" />
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showCreate = false; editId = ''">Отмена</button>
            <button class="btn-submit" @click="savePackage">Сохранить</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '~/utils/formatters'
import type { ServicePackage } from '~/types/database'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()

const packages = ref<ServicePackage[]>([])
const showCreate = ref(false)
const editId = ref('')
const featuresText = ref('')

const form = reactive({
  name: '',
  description: '',
  price: 0,
  duration_months: 12,
})

function editPackage(pkg: ServicePackage) {
  editId.value = pkg.id
  form.name = pkg.name
  form.description = pkg.description || ''
  form.price = pkg.price
  form.duration_months = pkg.duration_months
  featuresText.value = (pkg.features || []).join('\n')
  showCreate.value = true
}

async function savePackage() {
  if (!authStore.clinicId || !form.name) return
  const features = featuresText.value.split('\n').filter(Boolean)
  const payload = { ...form, features, clinic_id: authStore.clinicId, is_active: true }

  if (editId.value) {
    await supabase.from('service_packages').update(payload).eq('id', editId.value)
    const idx = packages.value.findIndex(p => p.id === editId.value)
    if (idx !== -1) Object.assign(packages.value[idx], payload)
  }
  else {
    const { data } = await supabase.from('service_packages').insert(payload).select().single()
    if (data) packages.value.unshift(data as ServicePackage)
  }

  showCreate.value = false
  editId.value = ''
  form.name = ''
  form.description = ''
  form.price = 0
  featuresText.value = ''
}

async function togglePackage(pkg: ServicePackage) {
  const newStatus = !pkg.is_active
  await supabase.from('service_packages').update({ is_active: newStatus }).eq('id', pkg.id)
  pkg.is_active = newStatus
}

onMounted(async () => {
  if (!authStore.clinicId) return
  const { data } = await supabase
    .from('service_packages')
    .select('*')
    .eq('clinic_id', authStore.clinicId)
    .order('created_at', { ascending: false })

  packages.value = (data as ServicePackage[]) || []
})
</script>

<style scoped>
.packages-page { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }
.btn-create { display: flex; align-items: center; gap: 6px; padding: 8px 18px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }

.packages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.package-card { padding: 20px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 12px; }
.pkg-header { display: flex; align-items: center; justify-content: space-between; }
.pkg-header h3 { font-size: 1rem; font-weight: 700; }
.pkg-price { font-size: 1.1rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-primary); }
.pkg-desc { font-size: 0.85rem; color: var(--color-text-secondary); }

.pkg-features { display: flex; flex-direction: column; gap: 4px; }
.feature-item { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; }
.feature-check { color: var(--color-success); flex-shrink: 0; }

.pkg-stats { display: flex; gap: 12px; font-size: 0.8rem; color: var(--color-text-muted); }
.pkg-actions { display: flex; gap: 8px; }
.btn-edit { padding: 6px 14px; background: var(--color-primary-ultralight); color: var(--color-primary); border: 1px solid var(--color-primary); border-radius: var(--radius-sm); font-size: 0.8rem; cursor: pointer; font-family: var(--font-body); }
.btn-toggle { padding: 6px 14px; background: var(--color-surface); color: var(--color-text-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.8rem; cursor: pointer; font-family: var(--font-body); }

.empty { text-align: center; padding: 48px; color: var(--color-text-muted); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: var(--color-surface); border-radius: var(--radius-md); padding: 24px; width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 14px; }
.modal-card h2 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }
.form-label { font-size: 0.85rem; font-weight: 600; }
.form-input { padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; }
.form-input:focus { border-color: var(--color-primary); }
.form-textarea { padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; resize: vertical; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-body); }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }
</style>
