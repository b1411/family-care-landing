<template>
  <div>
    <h2 class="auth-title">Восстановление пароля</h2>
    <p class="auth-subtitle">Мы отправим ссылку для сброса на ваш email</p>

    <form v-if="!success" class="auth-form" @submit.prevent="handleReset">
      <div class="form-group">
        <label class="form-label" for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          placeholder="example@email.com"
          required
          autocomplete="email"
        />
        <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
      </div>

      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Отправка...' : 'Отправить ссылку' }}
      </button>

      <p v-if="errorMessage" class="form-error-global">{{ errorMessage }}</p>
    </form>

    <div v-else class="auth-success">
      <p>Проверьте почту — мы отправили ссылку для восстановления пароля.</p>
    </div>

    <p class="auth-switch">
      <NuxtLink to="/auth/login" class="form-link">← Вернуться ко входу</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { forgotPasswordSchema } from '~/utils/validators'

definePageMeta({
  layout: 'auth',
})

const supabase = useSupabaseClient()

const form = reactive({ email: '' })
const errors = reactive<Record<string, string>>({})
const errorMessage = ref('')
const loading = ref(false)
const success = ref(false)

async function handleReset() {
  Object.keys(errors).forEach(k => delete errors[k])
  errorMessage.value = ''

  const result = forgotPasswordSchema.safeParse(form)
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors[issue.path[0] as string] = issue.message
    }
    return
  }

  loading.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/auth/verify`,
    })

    if (error) {
      errorMessage.value = error.message
      return
    }

    success.value = true
  }
  finally {
    loading.value = false
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
  margin-bottom: 8px;
}

.auth-subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 28px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-input {
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-family: var(--font-body);
  color: var(--color-text-primary);
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 126, 200, 0.15);
}

.form-error {
  font-size: 0.8rem;
  color: var(--color-danger);
}

.form-error-global {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-danger);
  padding: 8px;
  background: rgba(212, 114, 124, 0.08);
  border-radius: var(--radius-sm);
}

.form-link {
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
}

.btn-primary {
  padding: 12px;
  background: var(--gradient-cta);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-switch {
  text-align: center;
  margin-top: 20px;
}

.auth-success {
  text-align: center;
  color: var(--color-success);
  padding: 16px;
  background: rgba(124, 184, 212, 0.1);
  border-radius: var(--radius-sm);
}
</style>
