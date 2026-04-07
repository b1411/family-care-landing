<template>
  <div class="users-page">
    <header class="page-header">
      <NuxtLink to="/admin" class="back-link">
        <Icon name="lucide:chevron-left" size="16" /> Назад
      </NuxtLink>
      <h1 class="page-title">Пользователи</h1>
      <button class="btn-add-user" @click="openCreate">
        <Icon name="lucide:user-plus" size="14" /> Добавить
      </button>
    </header>

    <div class="search-box">
      <Icon name="lucide:search" size="16" />
      <input v-model="search" type="text" placeholder="Поиск по имени, email..." class="search-input" />
    </div>

    <!-- Role filter -->
    <div class="filter-row">
      <button
        v-for="r in roleFilters"
        :key="r.value"
        class="filter-btn"
        :class="{ active: roleFilter === r.value }"
        @click="roleFilter = r.value"
      >
        {{ r.label }}
      </button>
    </div>

    <!-- Users table -->
    <div v-if="filteredUsers.length" class="user-list">
      <div v-for="u in filteredUsers" :key="u.id" class="user-row">
        <div class="user-avatar">{{ initials(u) }}</div>
        <div class="user-info">
          <h3>{{ u.first_name }} {{ u.last_name }}</h3>
          <p>{{ u.email }}</p>
        </div>
        <span class="role-badge" :class="roleBadgeClass(u.role as string)">{{ roleLabel(u.role as string) }}</span>
        <span class="user-status" :class="{ active: u.is_active }">
          {{ u.is_active ? 'Активен' : 'Неактивен' }}
        </span>
        <div class="user-actions">
          <button class="btn-icon" title="Редактировать" @click="openEdit(u)">
            <Icon name="lucide:pencil" size="14" />
          </button>
          <button
            class="btn-icon"
            :class="{ danger: u.is_active }"
            :title="u.is_active ? 'Деактивировать' : 'Активировать'"
            @click="toggleActive(u)"
          >
            <Icon :name="u.is_active ? 'lucide:user-x' : 'lucide:user-check'" size="14" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state"><p>Нет пользователей</p></div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-card">
          <h2 class="modal-title">{{ editingUser ? 'Редактировать пользователя' : 'Новый пользователь' }}</h2>
          <form class="modal-form" @submit.prevent="handleSave">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Имя</label>
                <input v-model="userForm.firstName" type="text" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Фамилия</label>
                <input v-model="userForm.lastName" type="text" class="form-input" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input v-model="userForm.email" type="email" class="form-input" required :disabled="!!editingUser" />
            </div>
            <div class="form-group">
              <label class="form-label">Телефон</label>
              <input v-model="userForm.phone" type="tel" class="form-input" placeholder="+7XXXXXXXXXX" />
            </div>
            <div class="form-group">
              <label class="form-label">Роль</label>
              <select v-model="userForm.role" class="form-input" required>
                <option value="coordinator">Координатор</option>
                <option value="gynecologist">Гинеколог</option>
                <option value="pediatrician">Педиатр</option>
                <option value="clinic_admin">Администратор клиники</option>
                <option value="clinic_manager">Руководитель клиники</option>
              </select>
            </div>
            <div v-if="!editingUser" class="form-group">
              <label class="form-label">Пароль</label>
              <input v-model="userForm.password" type="password" class="form-input" minlength="8" required />
            </div>

            <p v-if="formError" class="form-error-global">{{ formError }}</p>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="showModal = false">Отмена</button>
              <button type="submit" class="btn-submit" :disabled="saving">
                {{ saving ? 'Сохранение...' : editingUser ? 'Сохранить' : 'Создать' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/types/database'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()
const search = ref('')
const roleFilter = ref('all')
const users = ref<Array<Record<string, unknown>>>([])

// Modal state
const showModal = ref(false)
const editingUser = ref<Record<string, unknown> | null>(null)
const saving = ref(false)
const formError = ref('')
const userForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'coordinator' as UserRole,
  password: '',
})

const roleFilters = [
  { label: 'Все', value: 'all' },
  { label: 'Мамы', value: 'mother' },
  { label: 'Координаторы', value: 'coordinator' },
  { label: 'Гинекологи', value: 'gynecologist' },
  { label: 'Педиатры', value: 'pediatrician' },
  { label: 'Админы', value: 'clinic_admin' },
]

const filteredUsers = computed(() => {
  let result = users.value
  if (roleFilter.value !== 'all') {
    result = result.filter(u => u.role === roleFilter.value)
  }
  const q = search.value.toLowerCase()
  if (q) {
    result = result.filter(u =>
      (u.first_name as string || '').toLowerCase().includes(q)
      || (u.last_name as string || '').toLowerCase().includes(q)
      || (u.email as string || '').toLowerCase().includes(q),
    )
  }
  return result
})

function initials(u: Record<string, unknown>) {
  return `${(u.first_name as string || '')[0] || ''}${(u.last_name as string || '')[0] || ''}`.toUpperCase()
}

function roleLabel(role: string) {
  const map: Record<string, string> = {
    mother: 'Мама', father: 'Папа',
    coordinator: 'Координатор', gynecologist: 'Гинеколог', pediatrician: 'Педиатр',
    clinic_admin: 'Админ', clinic_manager: 'Руководитель', platform_admin: 'Platform Admin',
  }
  return map[role] || role
}

function roleBadgeClass(role: string) {
  if (['mother', 'father'].includes(role)) return 'family'
  if (role === 'coordinator') return 'coordinator'
  if (['gynecologist', 'pediatrician'].includes(role)) return 'doctor'
  return 'admin'
}

function openCreate() {
  editingUser.value = null
  Object.assign(userForm, { firstName: '', lastName: '', email: '', phone: '', role: 'coordinator', password: '' })
  formError.value = ''
  showModal.value = true
}

function openEdit(u: Record<string, unknown>) {
  editingUser.value = u
  Object.assign(userForm, {
    firstName: u.first_name || '',
    lastName: u.last_name || '',
    email: u.email || '',
    phone: u.phone || '',
    role: u.role || 'coordinator',
    password: '',
  })
  formError.value = ''
  showModal.value = true
}

async function handleSave() {
  formError.value = ''
  saving.value = true

  try {
    if (editingUser.value) {
      // Update existing user
      const { error } = await supabase
        .from('users')
        .update({
          first_name: userForm.firstName,
          last_name: userForm.lastName,
          phone: userForm.phone || null,
          role: userForm.role,
        })
        .eq('id', editingUser.value.id)

      if (error) { formError.value = error.message; return }

      // Update local state
      const idx = users.value.findIndex(u => u.id === editingUser.value!.id)
      if (idx >= 0) {
        users.value[idx] = { ...users.value[idx], first_name: userForm.firstName, last_name: userForm.lastName, phone: userForm.phone, role: userForm.role }
      }
    }
    else {
      // Create new user via Supabase Auth (admin invite)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userForm.email,
        password: userForm.password,
        email_confirm: true,
        user_metadata: {
          first_name: userForm.firstName,
          last_name: userForm.lastName,
          phone: userForm.phone || null,
          role: userForm.role,
          clinic_id: authStore.clinicId,
        },
      })

      if (authError) { formError.value = authError.message; return }

      // Refresh list
      if (authData.user) {
        await loadUsers()
      }
    }

    showModal.value = false
  }
  finally {
    saving.value = false
  }
}

async function toggleActive(u: Record<string, unknown>) {
  const newStatus = !u.is_active
  const { error } = await supabase
    .from('users')
    .update({ is_active: newStatus })
    .eq('id', u.id)

  if (!error) {
    const idx = users.value.findIndex(x => x.id === u.id)
    if (idx >= 0) users.value[idx] = { ...users.value[idx], is_active: newStatus }
  }
}

async function loadUsers() {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('clinic_id', authStore.clinicId)
    .order('created_at', { ascending: false })

  users.value = data || []
}

onMounted(loadUsers)
</script>

<style scoped>
.users-page { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
.page-header { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 16px; }
.back-link { display: flex; align-items: center; gap: 4px; color: var(--color-text-secondary); text-decoration: none; font-size: 0.85rem; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; flex: 1; }

.btn-add-user {
  display: flex; align-items: center; gap: 4px; padding: 8px 16px;
  background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm);
  font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: var(--font-body);
}

.search-box { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); margin-bottom: 12px; }
.search-input { border: none; outline: none; font-size: 0.85rem; font-family: var(--font-body); background: transparent; flex: 1; }

.filter-row { display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; }
.filter-btn { padding: 6px 14px; border: 1px solid var(--color-border); border-radius: 20px; background: var(--color-surface); font-size: 0.8rem; cursor: pointer; font-family: var(--font-body); white-space: nowrap; }
.filter-btn.active { border-color: var(--color-primary); background: var(--color-primary-ultralight); color: var(--color-primary); font-weight: 600; }

.user-list { display: flex; flex-direction: column; gap: 6px; }
.user-row {
  display: flex; align-items: center; gap: 12px; padding: 12px 16px;
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
}

.user-avatar {
  width: 36px; height: 36px; border-radius: 50%; background: var(--color-primary-ultralight);
  color: var(--color-primary); display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
}

.user-info { flex: 1; min-width: 0; }
.user-info h3 { font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-info p { font-size: 0.8rem; color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.role-badge {
  font-size: 0.7rem; font-weight: 600; padding: 3px 10px; border-radius: 4px; flex-shrink: 0;
}
.role-badge.family { background: rgba(232, 160, 191, 0.15); color: var(--color-secondary); }
.role-badge.coordinator { background: rgba(139, 126, 200, 0.15); color: var(--color-primary); }
.role-badge.doctor { background: rgba(124, 184, 212, 0.15); color: var(--color-success); }
.role-badge.admin { background: rgba(233, 196, 106, 0.15); color: var(--color-warning); }

.user-status { font-size: 0.75rem; color: var(--color-text-muted); flex-shrink: 0; }
.user-status.active { color: var(--color-success); }

.user-actions { display: flex; gap: 4px; flex-shrink: 0; }
.btn-icon {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--color-border); border-radius: 6px; background: none;
  cursor: pointer; color: var(--color-text-muted); transition: all var(--transition-fast);
}
.btn-icon:hover { background: var(--color-primary-ultralight); color: var(--color-primary); }
.btn-icon.danger:hover { background: rgba(231, 111, 81, 0.1); color: var(--color-danger); border-color: var(--color-danger); }

.empty-state { text-align: center; padding: 48px; color: var(--color-text-muted); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: var(--color-surface); border-radius: var(--radius-md); padding: 24px; width: 100%; max-width: 460px; }
.modal-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; }
.modal-form { display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 600; }
.form-input { padding: 10px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-body); outline: none; }
.form-input:focus { border-color: var(--color-primary); }
.form-input:disabled { opacity: 0.5; cursor: not-allowed; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-error-global { text-align: center; font-size: 0.85rem; color: var(--color-danger); padding: 8px; background: rgba(231, 111, 81, 0.08); border-radius: var(--radius-sm); }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-body); }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.btn-submit:disabled { opacity: 0.6; }
</style>
