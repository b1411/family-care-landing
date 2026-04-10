<template>
  <div class="error-page">
    <div class="error-card">
      <div class="error-code">{{ error?.statusCode || 500 }}</div>
      <h1 class="error-title">{{ title }}</h1>
      <p class="error-desc">{{ description }}</p>
      <div class="error-actions">
        <button class="error-btn primary" @click="handleError">
          <Icon name="lucide:home" size="16" />
          На главную
        </button>
        <button class="error-btn secondary" @click="clearError({ redirect: '/' })">
          <Icon name="lucide:refresh-cw" size="16" />
          Попробовать снова
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const title = computed(() => {
  const code = props.error?.statusCode
  if (code === 404) return 'Страница не найдена'
  if (code === 403) return 'Доступ запрещён'
  if (code === 401) return 'Требуется авторизация'
  return 'Что-то пошло не так'
})

const description = computed(() => {
  const code = props.error?.statusCode
  if (code === 404) return 'К сожалению, запрашиваемая страница не существует или была перемещена.'
  if (code === 403) return 'У вас нет доступа к этой странице. Обратитесь к администратору.'
  if (code === 401) return 'Пожалуйста, войдите в систему для доступа к этой странице.'
  return 'Произошла непредвиденная ошибка. Попробуйте обновить страницу.'
})

function handleError() {
  clearError({ redirect: '/' })
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--color-bg, #0f0f11);
}

.error-card {
  text-align: center;
  max-width: 440px;
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, var(--color-primary, #8B7EC8) 0%, var(--color-secondary, #E8A0BF) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
}

.error-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text, #f0f0f0);
  margin: 0 0 12px;
}

.error-desc {
  font-size: 15px;
  color: var(--color-text-muted, #888);
  line-height: 1.6;
  margin: 0 0 32px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.error-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.error-btn.primary {
  background: var(--color-primary, #8B7EC8);
  color: white;
}

.error-btn.primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.error-btn.secondary {
  background: var(--color-bg-alt, #1a1a1e);
  color: var(--color-text-muted, #888);
  border: 1px solid var(--color-border, #2a2a2e);
}

.error-btn.secondary:hover {
  border-color: var(--color-text-muted);
}
</style>
