<template>
  <div>
    <h2 class="auth-title">Приглашение в семью</h2>

    <div v-if="loading" class="auth-loading">
      <p>Загрузка...</p>
    </div>

    <div v-else-if="!validCode" class="auth-error">
      <p>Недействительный или истёкший код приглашения.</p>
      <NuxtLink to="/auth/login" class="form-link">Перейти ко входу</NuxtLink>
    </div>

    <div v-else-if="success" class="auth-success">
      <Icon name="lucide:check" size="36" class="verify-icon" />
      <p>Вы присоединились к семье! Перенаправляем...</p>
    </div>

    <form v-else class="auth-form" @submit.prevent="handleJoin">
      <p class="auth-subtitle">
        Вас пригласили присоединиться к семье. Создайте аккаунт или войдите.
      </p>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label" for="firstName">Имя</label>
          <input id="firstName" v-model="form.firstName" type="text" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="lastName">Фамилия</label>
          <input id="lastName" v-model="form.lastName" type="text" class="form-input" required />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="email">Email</label>
        <input id="email" v-model="form.email" type="email" class="form-input" required />
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Пароль</label>
        <input id="password" v-model="form.password" type="password" class="form-input" required />
      </div>

      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? 'Присоединение...' : 'Присоединиться' }}
      </button>

      <p v-if="errorMessage" class="form-error-global">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const supabase = useSupabaseClient()

const inviteCode = route.params.code as string
const form = reactive({ firstName: '', lastName: '', email: '', password: '' })
const loading = ref(true)
const validCode = ref(false)
const submitting = ref(false)
const success = ref(false)
const errorMessage = ref('')
const familyId = ref('')

onMounted(async () => {
  // Verify invite code
  const { data } = await supabase
    .from('families')
    .select('id')
    .eq('invite_code', inviteCode)
    .eq('status', 'active')
    .is('secondary_parent_id', null)
    .single()

  if (data) {
    validCode.value = true
    familyId.value = data.id
  }
  loading.value = false
})

async function handleJoin() {
  submitting.value = true
  errorMessage.value = ''

  try {
    // Register user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          role: 'father',
        },
      },
    })

    if (authError || !authData.user) {
      errorMessage.value = authError?.message || 'Ошибка регистрации'
      return
    }

    // Join family as secondary parent
    const { error: joinError } = await supabase
      .from('families')
      .update({
        secondary_parent_id: authData.user.id,
        invite_code: null, // Invalidate code after use
      })
      .eq('id', familyId.value)

    if (joinError) {
      errorMessage.value = 'Ошибка присоединения к семье'
      return
    }

    success.value = true
    setTimeout(() => navigateTo('/family'), 1500)
  }
  finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.auth-title {
  text-align: center;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 24px;
}

.auth-subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); }
.form-input {
  padding: 10px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  font-size: 0.95rem; font-family: var(--font-body); color: var(--color-text-primary);
  background: var(--color-surface); outline: none;
}
.form-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(139, 126, 200, 0.15); }
.form-error-global { text-align: center; font-size: 0.85rem; color: var(--color-danger); padding: 8px; background: rgba(212, 114, 124, 0.08); border-radius: var(--radius-sm); }
.form-link { color: var(--color-primary); font-weight: 500; text-decoration: none; }
.btn-primary { padding: 12px; background: var(--gradient-cta); color: white; border: none; border-radius: var(--radius-sm); font-size: 1rem; font-weight: 600; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.auth-loading, .auth-error { text-align: center; padding: 24px; color: var(--color-text-secondary); }
.auth-success { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; color: var(--color-success); padding: 24px; }
.verify-icon { color: var(--color-success); }
</style>
