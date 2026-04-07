<template>
  <div>
    <h2 class="auth-title">Подтверждение</h2>
    <div class="auth-verify-content">
      <Icon name="lucide:check" size="48" class="verify-icon" />
      <p>Ваш email подтверждён. Перенаправляем...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ROLE_HOME_MAP } from '~/utils/constants'
import type { UserRole } from '~/types/database'

definePageMeta({
  layout: 'auth',
})

const user = useSupabaseUser()

onMounted(() => {
  // After email verification, redirect to appropriate home
  setTimeout(() => {
    if (user.value) {
      const role = (user.value.user_metadata?.role as UserRole) || 'mother'
      navigateTo(ROLE_HOME_MAP[role])
    } else {
      navigateTo('/auth/login')
    }
  }, 1500)
})
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

.auth-verify-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
}

.verify-icon {
  color: var(--color-success);
}
</style>
