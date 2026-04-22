<template>
  <div class="settings-page">
    <h1 class="page-title">Настройки семьи</h1>

    <!-- Family Profile -->
    <section class="settings-section">
      <h2 class="section-title">Профиль</h2>
      <div class="settings-card">
        <div class="form-group">
          <label class="form-label">Имя</label>
          <input v-model="profileForm.first_name" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Фамилия</label>
          <input v-model="profileForm.last_name" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Телефон</label>
          <input v-model="profileForm.phone" type="tel" class="form-input" />
        </div>
        <button class="btn-save" :disabled="saving" @click="saveProfile">
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </section>

    <!-- Children -->
    <section class="settings-section">
      <div class="section-header">
        <h2 class="section-title">Дети</h2>
        <button class="btn-add" @click="showAddChild = true">
          <Icon name="lucide:plus" size="14" /> Добавить
        </button>
      </div>
      <div v-if="authStore.children.length" class="children-list">
        <div v-for="child in authStore.children" :key="child.id" class="child-card">
          <div class="child-avatar">
            <Icon :name="child.gender === 'male' ? 'lucide:baby' : 'lucide:baby'" size="20" />
          </div>
          <div class="child-info">
            <h3>{{ child.name }}</h3>
            <p v-if="child.dob">{{ formatAge(child.dob) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Invite Partner -->
    <section class="settings-section">
      <h2 class="section-title">Пригласить партнёра</h2>
      <div class="settings-card">
        <p class="settings-desc">Пригласите второго родителя для совместного доступа к маршруту</p>
        <div v-if="inviteCode" class="invite-block">
          <span class="invite-code">{{ inviteLink }}</span>
          <button class="btn-copy" @click="copyLink">
            <Icon name="lucide:copy" size="14" /> Копировать
          </button>
        </div>
        <button v-else class="btn-invite" @click="generateInvite">
          <Icon name="lucide:user-plus" size="16" /> Создать ссылку-приглашение
        </button>
      </div>
    </section>

    <!-- Consents -->
    <section class="settings-section">
      <h2 class="section-title">Уведомления и согласия</h2>
      <div class="settings-card">
        <div v-for="consent in consentTypes" :key="consent.type" class="consent-row">
          <div>
            <h4>{{ consent.label }}</h4>
            <p class="consent-desc">{{ consent.description }}</p>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              :checked="authStore.hasConsent(consent.type)"
              @change="toggleConsent(consent.type, ($event.target as HTMLInputElement).checked)"
            />
            <span class="toggle-slider" />
          </label>
        </div>
      </div>
    </section>

    <!-- Contact chief doctor -->
    <section v-if="authStore.familyId" class="settings-section">
      <h2 class="section-title">Обратная связь с клиникой</h2>
      <div class="settings-card">
        <p class="settings-desc">
          Есть вопросы по лечению, замечания к врачу или предложение?
          Мы передадим обращение главврачу — он разберёт ситуацию лично.
        </p>
        <button class="btn-contact" @click="complaintOpen = true">
          <Icon name="lucide:message-square" size="16" /> Написать главврачу
        </button>
      </div>
    </section>

    <AppFamilyComplaintModal
      v-if="authStore.familyId"
      :open="complaintOpen"
      :family-id="authStore.familyId"
      @close="complaintOpen = false"
    />

    <!-- Add Child Modal -->
    <Teleport to="body">
      <div v-if="showAddChild" class="modal-overlay" @click.self="showAddChild = false">
        <div class="modal-card">
          <h2 class="modal-title">Добавить ребёнка</h2>
          <div class="form-group">
            <label class="form-label">Имя ребёнка</label>
            <input v-model="childForm.name" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Дата рождения</label>
            <input v-model="childForm.dob" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Пол</label>
            <select v-model="childForm.gender" class="form-input">
              <option value="male">Мальчик</option>
              <option value="female">Девочка</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showAddChild = false">Отмена</button>
            <button class="btn-submit" @click="addChild">Добавить</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { formatAge } from '~/utils/formatters'
import type { ConsentType } from '~/types/database'

definePageMeta({ layout: 'app' })

const authStore = useAuthStore()
const familyComposable = useFamily()

const saving = ref(false)
const showAddChild = ref(false)
const inviteCode = ref('')
const complaintOpen = ref(false)

const profileForm = reactive({
  first_name: authStore.profile?.first_name || '',
  last_name: authStore.profile?.last_name || '',
  phone: authStore.profile?.phone || '',
})

const childForm = reactive({
  name: '',
  dob: '',
  gender: 'male' as 'male' | 'female',
})

const consentTypes = [
  { type: 'push' as ConsentType, label: 'Push-уведомления', description: 'Напоминания о витаминах, записях, событиях' },
  { type: 'whatsapp' as ConsentType, label: 'WhatsApp', description: 'Сообщения через WhatsApp' },
  { type: 'sms' as ConsentType, label: 'SMS', description: 'SMS-уведомления' },
  { type: 'email' as ConsentType, label: 'Email', description: 'Рассылка на почту' },
  { type: 'ai' as ConsentType, label: 'AI-помощник', description: 'Доступ к AI-ассистенту' },
  { type: 'telemedicine' as ConsentType, label: 'Телемедицина', description: 'Видеоконсультации с врачом' },
]

const inviteLink = computed(() => familyComposable.getInviteLink(inviteCode.value))

async function saveProfile() {
  saving.value = true
  try {
    await authStore.updateProfile({
      first_name: profileForm.first_name,
      last_name: profileForm.last_name,
      phone: profileForm.phone,
    })
  }
  finally {
    saving.value = false
  }
}

async function addChild() {
  if (!childForm.name || !authStore.familyId) return
  await familyComposable.addChild(authStore.familyId, {
    name: childForm.name,
    dob: childForm.dob || undefined,
    gender: childForm.gender,
  } as never)
  showAddChild.value = false
  childForm.name = ''
  childForm.dob = ''
}

async function generateInvite() {
  if (!authStore.familyId) return
  const code = await familyComposable.generateInviteCode(authStore.familyId)
  if (code) inviteCode.value = code
}

function copyLink() {
  navigator.clipboard.writeText(inviteLink.value)
}

async function toggleConsent(type: ConsentType, granted: boolean) {
  await authStore.updateConsent(type, granted)
}
</script>

<style scoped>
.settings-page { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; margin-bottom: 28px; }

.settings-section { margin-bottom: 28px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 12px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }

.settings-card {
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; gap: 14px;
}

.settings-desc { font-size: 0.85rem; color: var(--color-text-secondary); }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); }
.form-input {
  padding: 10px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  font-size: 0.9rem; font-family: var(--font-body); outline: none;
}
.form-input:focus { border-color: var(--color-primary); }

.btn-save, .btn-submit {
  padding: 10px; background: var(--gradient-cta); color: white; border: none;
  border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body);
}
.btn-save:disabled { opacity: 0.6; }

.btn-add, .btn-invite, .btn-contact {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
  background: var(--color-primary-ultralight); color: var(--color-primary);
  border: 1px solid var(--color-primary); border-radius: var(--radius-sm);
  font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: var(--font-body);
  transition: all 0.2s;
}
.btn-contact:hover { background: var(--color-primary); color: white; }

.children-list { display: flex; flex-direction: column; gap: 8px; }
.child-card {
  display: flex; align-items: center; gap: 12px; padding: 12px 16px;
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
}
.child-avatar {
  width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary-ultralight);
  color: var(--color-primary); display: flex; align-items: center; justify-content: center;
}
.child-info h3 { font-size: 0.9rem; font-weight: 600; }
.child-info p { font-size: 0.8rem; color: var(--color-text-secondary); }

.invite-block { display: flex; align-items: center; gap: 8px; }
.invite-code {
  flex: 1; padding: 8px 12px; background: var(--color-bg-alt); border-radius: var(--radius-sm);
  font-size: 0.8rem; font-family: var(--font-mono); word-break: break-all;
}
.btn-copy {
  display: flex; align-items: center; gap: 4px; padding: 8px 12px;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); font-size: 0.8rem; cursor: pointer; font-family: var(--font-body);
}

/* Consent toggles */
.consent-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.consent-row h4 { font-size: 0.9rem; font-weight: 600; }
.consent-desc { font-size: 0.75rem; color: var(--color-text-muted); }

.toggle { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute; inset: 0; background: var(--color-border); border-radius: 24px;
  transition: var(--transition-fast); cursor: pointer;
}
.toggle-slider::before {
  content: ''; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px;
  background: white; border-radius: 50%; transition: var(--transition-fast);
}
.toggle input:checked + .toggle-slider { background: var(--color-primary); }
.toggle input:checked + .toggle-slider::before { transform: translateX(20px); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
}
.modal-card {
  background: var(--color-surface); border-radius: var(--radius-md);
  padding: 24px; width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 14px;
}
.modal-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-body); }

@media (max-width: 380px) {
  .settings-page { padding: 16px 12px; }
}
</style>
