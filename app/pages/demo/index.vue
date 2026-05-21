<template>
  <div class="demo-page">
    <!-- Ambient orbs (premium decoration) -->
    <div class="demo-ambient" aria-hidden="true">
      <div class="orb orb-1" />
      <div class="orb orb-2" />
      <div class="orb orb-3" />
    </div>

    <!-- ECG pulse line (matches Hero) -->
    <svg
      class="demo-pulse-line"
      viewBox="0 0 1600 80"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="demo-pulse-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(139, 126, 200, 0)" />
          <stop offset="30%" stop-color="rgba(139, 126, 200, 0.45)" />
          <stop offset="50%" stop-color="rgba(232, 160, 191, 0.55)" />
          <stop offset="70%" stop-color="rgba(139, 126, 200, 0.45)" />
          <stop offset="100%" stop-color="rgba(139, 126, 200, 0)" />
        </linearGradient>
      </defs>
      <path
        class="demo-pulse-path"
        d="M0 40 L380 40 L400 35 L412 48 L422 24 L434 56 L444 40 L780 40 L1080 40 L1092 36 L1104 46 L1116 22 L1128 58 L1140 40 L1180 40 L1600 40"
        fill="none"
        stroke="url(#demo-pulse-grad)"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>

    <!-- Full-page auto-entry loader (hides selector until redirect or error) -->
    <div v-if="deeplinkBooting" class="demo-boot" role="status" aria-live="polite">
      <div class="demo-boot-orb">
        <span class="demo-boot-spinner" />
        <span class="demo-boot-ring" aria-hidden="true" />
      </div>
      <p class="demo-boot-label t-h4">
        Входим как <span class="demo-boot-role">{{ activeRoleLabel || 'пользователь' }}</span>…
      </p>
    </div>

    <div v-else class="demo-container landing-container">
      <div class="demo-header">
        <NuxtLink to="/" class="demo-back" aria-label="Вернуться на главную">
          <Icon name="lucide:arrow-left" size="14" />
          <span>На главную</span>
        </NuxtLink>

        <div class="demo-eyebrow t-eyebrow">
          <span class="demo-eyebrow-dot" aria-hidden="true" />
          Демо-режим · 5&nbsp;ролей · без регистрации
        </div>

        <h1 class="demo-title t-display-section">
          Попробуйте <span class="t-accent-serif-gradient">платформу</span>
        </h1>
        <p class="demo-subtitle t-lead">
          Выберите роль — и&nbsp;изучите интерфейс с&nbsp;тестовыми данными.
          Все действия безопасны, ничего не&nbsp;ломается.
        </p>

        <div class="demo-header-meta">
          <span class="meta-chip">
            <Icon name="lucide:shield-check" size="13" />
            <span>Тестовые данные</span>
          </span>
          <span class="meta-chip">
            <Icon name="lucide:zap" size="13" />
            <span>Мгновенный вход</span>
          </span>
          <span class="meta-chip">
            <Icon name="lucide:command" size="13" />
            <span>⌘K — командная палитра</span>
          </span>
        </div>
      </div>

      <p v-if="deeplinkRole && !error" class="demo-breadcrumbs">
        <NuxtLink to="/demo" class="crumb">Все роли</NuxtLink>
        <Icon name="lucide:chevron-right" size="14" class="crumb-sep" />
        <span class="crumb crumb-current">{{ activeRoleLabel }}</span>
      </p>

      <div class="demo-roles">
        <button
          v-for="(role, idx) in roles"
          :key="role.key"
          class="demo-role-card"
          :class="[
            { 'is-loading': loadingRole === role.key },
            `role-${role.key}`,
          ]"
          :style="{ '--role-grad': role.gradient, '--card-delay': `${idx * 0.05}s` }"
          :disabled="!!loadingRole"
          @click="enterDemo(role.key)"
        >
          <!-- Gradient border layer -->
          <span class="role-border" aria-hidden="true" />

          <!-- Card content -->
          <div class="role-head">
            <div class="role-icon" :style="{ background: role.gradient }">
              <Icon :name="role.icon" size="26" />
              <span class="role-icon-ring" aria-hidden="true" />
            </div>
            <span class="role-num font-mono">0{{ idx + 1 }}</span>
          </div>

          <div class="role-body">
            <h3 class="role-title t-h4">{{ role.title }}</h3>
            <p class="role-desc">{{ role.description }}</p>

            <ul class="role-features">
              <li v-for="f in role.features" :key="f">
                <span class="feature-check-wrap" aria-hidden="true">
                  <Icon name="lucide:check" size="11" class="feature-check" />
                </span>
                <span>{{ f }}</span>
              </li>
            </ul>

            <span
              v-if="role.extraBadge"
              class="role-extra-badge"
              :title="role.extraTooltip"
            >
              <Icon name="lucide:user-plus" size="11" />
              {{ role.extraBadge }}
            </span>
          </div>

          <div class="role-action">
            <span v-if="loadingRole === role.key" class="role-spinner" />
            <template v-else>
              <span class="role-action-label">Войти как {{ role.actionLabel }}</span>
              <Icon name="lucide:arrow-right" size="14" class="role-action-arrow" />
            </template>
          </div>
        </button>
      </div>

      <p v-if="error" class="demo-error" role="alert">
        <Icon name="lucide:alert-circle" size="14" />
        {{ error }}
      </p>

      <div class="demo-hint">
        <Icon name="lucide:info" size="14" class="hint-icon" />
        <p>
          Второй родитель и&nbsp;бабушка получают доступ с&nbsp;уровнем «просмотр» или «полный».
          Решение для&nbsp;расширенной семьи — реальность Казахстана.
        </p>
      </div>

      <div class="demo-footer-cta">
        <div class="footer-cta-body">
          <span class="footer-cta-eyebrow t-eyebrow">Для клиник</span>
          <p class="footer-cta-q">Хотите подключить вашу клинику?</p>
          <p class="footer-cta-sub">Пилот за&nbsp;2&nbsp;недели · White-label · 0&nbsp;нагрузки на&nbsp;ваш IT</p>
        </div>
        <NuxtLink to="/for-clinics#clinic-cta" class="demo-cta-link">
          <span>Оставить заявку</span>
          <Icon name="lucide:arrow-right" size="16" class="cta-link-arrow" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Попробовать демо — UMAI Health',
  description: 'Попробуйте платформу UMAI Health — 4 роли, тестовые данные, без регистрации.',
  ogTitle: 'Попробовать демо — UMAI Health',
  ogDescription: '4 роли, тестовые данные, без регистрации.',
  ogImage: 'https://umai-health.kz/og-image.png',
  ogUrl: 'https://umai-health.kz/demo',
  robots: 'noindex, follow', // Demo data pages shouldn't be indexed
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://umai-health.kz/demo' },
  ],
})

const supabase = useSupabaseClient()
const authStore = useAuthStore()
const route = useRoute()
const loadingRole = ref<string | null>(null)
const error = ref('')
// True while we're auto-entering via ?role=... deeplink — hides the selector
// to avoid a flash of the role grid before the redirect lands.
const deeplinkBooting = ref(false)

const DEMO_HOME: Record<string, string> = {
  mom: '/family',
  coordinator: '/coordinator',
  doctor: '/doctor',
  chief: '/chief',
  admin: '/admin',
  // TZ alias: ?role=director → admin dashboard
  director: '/admin',
}

const ROLE_ALIAS: Record<string, string> = {
  director: 'admin',
}

const rawRoleParam = computed(() => {
  const v = route.query.role
  return typeof v === 'string' ? v.toLowerCase() : ''
})

const deeplinkRole = computed(() => {
  const raw = rawRoleParam.value
  if (!raw) return ''
  const normalized = ROLE_ALIAS[raw] || raw
  return DEMO_HOME[normalized] ? normalized : ''
})

const activeRoleLabel = computed(() => {
  const r = roles.find((x) => x.key === deeplinkRole.value)
  return r ? r.title : ''
})

const roles = [
  {
    key: 'mom',
    icon: 'lucide:heart',
    title: 'Мама / Родитель',
    description: 'Маршрут ребёнка, напоминания, документы, прививки.',
    gradient: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent-warm))',
    features: ['Маршрут от беременности до 2 лет', 'Напоминания о витаминах', 'Календарь прививок', 'Хранение документов'],
    actionLabel: 'мама',
    extraBadge: '+ доступ для папы и бабушки',
    extraTooltip: 'Второй родитель и бабушка получают доступ с уровнем «просмотр» или «полный»',
  },
  {
    key: 'coordinator',
    icon: 'lucide:clipboard-list',
    title: 'Координатор клиники',
    description: 'Очередь задач, список семей, статусы соблюдения.',
    gradient: 'var(--gradient-cta)',
    features: ['Очередь задач с приоритетами', 'Список семей и статусы', 'Расписание дня', 'KPI метрики'],
    actionLabel: 'координатор',
  },
  {
    key: 'doctor',
    icon: 'lucide:stethoscope',
    title: 'Врач',
    description: 'Расписание приёма, карточки пациентов, KPI.',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    features: ['Расписание на сегодня', 'Карточки пациентов', 'KPI приёма', 'Свободные слоты'],
    actionLabel: 'врач',
  },
  {
    key: 'chief',
    icon: 'lucide:activity',
    title: 'Главный врач',
    description: 'Аудит качества медицинской практики, отклонения от протоколов, разбор случаев.',
    gradient: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-secondary-dark))',
    features: ['Реестр врачей и качество ведения', 'Аудит всех назначений', 'Отклонения от протоколов', 'Разбор кейсов и юр-риски'],
    actionLabel: 'главный врач',
  },
  {
    key: 'admin',
    icon: 'lucide:bar-chart-3',
    title: 'Руководитель клиники',
    description: 'Аналитика, удержание, дашборд, отчёты.',
    gradient: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-primary))',
    features: ['Real-time дашборд', 'Аналитика удержания', 'Когортный анализ', 'Управление командой'],
    actionLabel: 'руководитель',
  },
]

async function enterDemo(roleKey: string) {
  const normalizedKey = ROLE_ALIAS[roleKey] || roleKey
  if (!DEMO_HOME[normalizedKey]) {
    error.value = 'Неизвестная роль'
    return
  }

  loadingRole.value = normalizedKey
  error.value = ''

  try {
    // Call server endpoint to get demo session
    const result = await $fetch<{ access_token: string; refresh_token: string }>('/api/auth/demo-login', {
      method: 'POST',
      body: { role: normalizedKey },
    })

    if (!result.access_token || !result.refresh_token) {
      throw new Error('Не удалось войти в демо-аккаунт')
    }

    // Set session via Supabase client
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    })

    if (sessionError) {
      throw sessionError
    }

    // Wait for user state to update
    const user = useSupabaseUser()
    if (!user.value) {
      await new Promise<void>((resolve) => {
        const stop = watch(user, (v) => {
          if (v) { stop(); resolve() }
        }, { immediate: true })
        setTimeout(() => { stop(); resolve() }, 3000)
      })
    }

    // Reset and reinitialize auth store for the new demo session
    authStore.reset()
    await authStore.initialize()

    // Navigate to demo dashboard
    navigateTo(DEMO_HOME[normalizedKey] || '/family', { replace: true })
  }
  catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка входа. Попробуйте ещё раз.'
  }
  finally {
    loadingRole.value = null
  }
}

// Deeplink auto-entry: /demo?role=mom|coordinator|doctor|admin|director
onMounted(async () => {
  // Log invalid values to console (per TZ 0.3) but never break the page
  if (rawRoleParam.value && !deeplinkRole.value) {
    // eslint-disable-next-line no-console
    console.warn(`[demo] Unknown role deeplink: "${rawRoleParam.value}" — falling back to selector`)
    return
  }
  if (deeplinkRole.value) {
    deeplinkBooting.value = true
    try {
      await enterDemo(deeplinkRole.value)
    }
    finally {
      // If enterDemo succeeds, navigateTo has already moved us away; if it
      // errors, drop back to the selector so the user can retry manually.
      deeplinkBooting.value = false
    }
  }
})
</script>

<style scoped>
.demo-page {
  position: relative;
  min-height: 100vh;
  padding: 120px 0 80px;
  overflow: hidden;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 126, 200, 0.06), transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(232, 160, 191, 0.05), transparent 60%),
    var(--color-bg);
}

/* ────── Ambient orbs ────── */
.demo-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.22;
}

.orb-1 {
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.4) 0%, transparent 70%);
  top: -120px;
  right: -120px;
  animation: orb-drift-1 22s ease-in-out infinite;
}

.orb-2 {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(232, 160, 191, 0.32) 0%, transparent 70%);
  bottom: -80px;
  left: -100px;
  animation: orb-drift-2 26s ease-in-out infinite;
}

.orb-3 {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(91, 192, 190, 0.22) 0%, transparent 70%);
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  animation: orb-drift-3 28s ease-in-out infinite;
}

@keyframes orb-drift-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-50px, 40px) scale(1.08); }
}
@keyframes orb-drift-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(60px, -50px) scale(1.05); }
}
@keyframes orb-drift-3 {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) translateY(-30px) scale(1.1); }
}

/* ────── ECG pulse line ────── */
.demo-pulse-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 26%;
  width: 100%;
  height: 80px;
  z-index: 0;
  pointer-events: none;
  opacity: 0.4;
}

.demo-pulse-path {
  stroke-dasharray: 1800;
  stroke-dashoffset: 1800;
  filter: drop-shadow(0 0 6px rgba(139, 126, 200, 0.35));
}

@media (prefers-reduced-motion: no-preference) {
  .demo-pulse-path {
    animation: demo-pulse-trace 10s linear infinite;
  }
}

@keyframes demo-pulse-trace {
  0% { stroke-dashoffset: 1800; opacity: 0; }
  10% { opacity: 1; }
  85% { opacity: 1; }
  100% { stroke-dashoffset: -1800; opacity: 0; }
}

/* ────── Boot loader ────── */
.demo-boot {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  min-height: 60vh;
}

.demo-boot-orb {
  position: relative;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-boot-spinner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2.5px solid rgba(139, 126, 200, 0.18);
  border-top-color: var(--color-primary);
  border-right-color: var(--color-secondary);
  animation: demo-spin 0.9s linear infinite;
  filter: drop-shadow(0 0 12px rgba(139, 126, 200, 0.35));
}

.demo-boot-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(139, 126, 200, 0.32);
  animation: boot-ring-pulse 1.8s ease-out infinite;
}

@keyframes boot-ring-pulse {
  0% { transform: scale(0.7); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}

.demo-boot-label {
  margin: 0;
  color: var(--color-text-secondary);
}

.demo-boot-role {
  color: var(--color-primary);
  font-weight: 700;
}

@keyframes demo-spin {
  to { transform: rotate(360deg); }
}

/* ────── Container ────── */
.demo-container {
  position: relative;
  z-index: 1;
  max-width: 1080px;
}

/* ────── Header ────── */
.demo-header {
  text-align: center;
  margin-bottom: 56px;
}

.demo-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px 6px 10px;
  border-radius: var(--radius-full);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(139, 126, 200, 0.12);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  text-decoration: none;
  margin-bottom: 24px;
  transition: all var(--transition-fast);
}

.demo-back:hover {
  color: var(--color-primary);
  border-color: rgba(139, 126, 200, 0.28);
  transform: translateX(-2px);
  box-shadow: 0 4px 14px -4px rgba(139, 126, 200, 0.18);
}

.demo-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 10px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.08);
  border: 1px solid rgba(139, 126, 200, 0.16);
  color: var(--color-primary);
  margin-bottom: 18px;
}

.demo-eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: eyebrow-pulse 2s ease-in-out infinite;
}

@keyframes eyebrow-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}

.demo-title {
  margin: 0 0 14px;
  color: var(--color-text-primary);
}

.demo-subtitle {
  max-width: 580px;
  margin: 0 auto;
  color: var(--color-text-secondary);
}

.demo-header-meta {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 22px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px 6px 10px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(139, 126, 200, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.01em;
}

.meta-chip .iconify {
  color: var(--color-primary);
}

/* ────── Breadcrumbs ────── */
.demo-breadcrumbs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: -32px 0 32px;
}

.crumb {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}
.crumb:hover { color: var(--color-primary); }
.crumb-current {
  color: var(--color-text-primary);
  font-weight: 600;
}
.crumb-sep { color: var(--color-text-muted); opacity: 0.6; }

/* ────── Role cards grid (3 + 2 centered) ────── */
.demo-roles {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 18px;
  margin-bottom: 28px;
}

.demo-roles > :nth-child(1),
.demo-roles > :nth-child(2),
.demo-roles > :nth-child(3) {
  grid-column: span 2;
}

.demo-roles > :nth-child(4) {
  grid-column: 2 / span 2;
}

.demo-roles > :nth-child(5) {
  grid-column: 4 / span 2;
}

/* ────── Role card ────── */
.demo-role-card {
  position: relative;
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 24px 22px 22px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(139, 126, 200, 0.1);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  cursor: pointer;
  transition:
    transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1),
    box-shadow 0.32s ease,
    border-color 0.32s ease;
  isolation: isolate;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 2px 6px rgba(139, 126, 200, 0.04),
    0 12px 28px -16px rgba(139, 126, 200, 0.18);
  font: inherit;
}

/* Animated gradient border (revealed on hover) */
.role-border {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: var(--role-grad);
  -webkit-mask:
    linear-gradient(#000, #000) content-box,
    linear-gradient(#000, #000);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000, #000) content-box,
    linear-gradient(#000, #000);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.32s ease;
  pointer-events: none;
  z-index: -1;
}

.demo-role-card:hover {
  transform: translateY(-6px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 6px 20px rgba(139, 126, 200, 0.12),
    0 20px 50px -20px rgba(139, 126, 200, 0.32);
  border-color: transparent;
}

.demo-role-card:hover .role-border {
  opacity: 1;
}

.demo-role-card:disabled {
  opacity: 0.7;
  cursor: wait;
  transform: none !important;
}

.demo-role-card.is-loading {
  border-color: var(--color-primary);
}

.demo-role-card.is-loading .role-border {
  opacity: 1;
}

/* Card head: icon + number */
.role-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.role-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  color: white;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 6px 16px -4px rgba(139, 126, 200, 0.4);
  isolation: isolate;
}

.role-icon-ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--role-grad);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.demo-role-card:hover .role-icon-ring {
  opacity: 0.6;
  animation: role-icon-pulse 1.6s ease-out infinite;
}

@keyframes role-icon-pulse {
  0% { transform: scale(1); opacity: 0.55; }
  100% { transform: scale(1.6); opacity: 0; }
}

.role-num {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.12em;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.06);
  border: 1px solid rgba(139, 126, 200, 0.1);
}

/* Card body */
.role-body {
  flex: 1;
  margin-bottom: 18px;
}

.role-title {
  margin: 0 0 6px;
  color: var(--color-text-primary);
}

.role-desc {
  font-size: 13.5px;
  color: var(--color-text-secondary);
  line-height: 1.55;
  margin: 0 0 14px;
}

.role-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.role-features li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.feature-check-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 6px;
  background: rgba(91, 192, 190, 0.16);
  flex-shrink: 0;
  margin-top: 2px;
}

.feature-check {
  color: var(--color-mint-dark, #2A8886);
}

.role-extra-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 14px;
  padding: 4px 10px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-primary);
  background: rgba(139, 126, 200, 0.1);
  border: 1px solid rgba(139, 126, 200, 0.16);
  border-radius: var(--radius-full);
  letter-spacing: 0.02em;
  cursor: help;
}

/* Card action (CTA bar at bottom) */
.role-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px 10px 16px;
  border-radius: var(--radius-full);
  background: var(--role-grad);
  color: white;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 4px 12px -2px rgba(139, 126, 200, 0.32);
  transition: box-shadow 0.3s ease;
}

.demo-role-card:hover .role-action {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 8px 22px -4px rgba(139, 126, 200, 0.5);
}

.role-action-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-action-arrow {
  flex-shrink: 0;
  transition: transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.demo-role-card:hover .role-action-arrow {
  transform: translateX(3px);
}

.role-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: demo-spin 0.6s linear infinite;
  margin: 0 auto;
}

/* ────── Error ────── */
.demo-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  color: var(--color-error);
  font-size: 13.5px;
  font-weight: 600;
  padding: 12px 18px;
  border-radius: var(--radius-md);
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  margin: 0 auto 20px;
  max-width: 480px;
}

/* ────── Hint ────── */
.demo-hint {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 640px;
  margin: 0 auto 56px;
  padding: 14px 18px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-text-secondary);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 126, 200, 0.1);
  border-radius: var(--radius-md);
}

.demo-hint p {
  margin: 0;
}

.hint-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

/* ────── Footer CTA ────── */
.demo-footer-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px;
  border-radius: var(--radius-lg);
  background:
    linear-gradient(135deg, rgba(139, 126, 200, 0.06), rgba(232, 160, 191, 0.06));
  border: 1px solid rgba(139, 126, 200, 0.14);
  position: relative;
  overflow: hidden;
}

.demo-footer-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at right, rgba(232, 160, 191, 0.12), transparent 50%);
  pointer-events: none;
}

.footer-cta-body {
  position: relative;
  z-index: 1;
}

.footer-cta-eyebrow {
  display: inline-block;
  margin-bottom: 6px;
  color: var(--color-primary);
}

.footer-cta-q {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

.footer-cta-sub {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.demo-cta-link {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: var(--radius-full);
  background: var(--gradient-cta);
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 4px 16px -2px rgba(139, 126, 200, 0.42);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.demo-cta-link:hover {
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 10px 28px -4px rgba(139, 126, 200, 0.55);
}

.cta-link-arrow {
  transition: transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.demo-cta-link:hover .cta-link-arrow {
  transform: translateX(3px);
}

/* ────── Responsive ────── */
@media (max-width: 1024px) {
  .demo-roles {
    grid-template-columns: repeat(4, 1fr);
  }
  .demo-roles > :nth-child(1),
  .demo-roles > :nth-child(2) {
    grid-column: span 2;
  }
  .demo-roles > :nth-child(3) {
    grid-column: 2 / span 2;
  }
  .demo-roles > :nth-child(4) {
    grid-column: 1 / span 2;
  }
  .demo-roles > :nth-child(5) {
    grid-column: 3 / span 2;
  }
}

@media (max-width: 720px) {
  .demo-page {
    padding: 90px 0 60px;
  }
  .demo-roles {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .demo-roles > * {
    grid-column: 1 / -1 !important;
  }
  .demo-header-meta {
    gap: 6px;
  }
  .demo-footer-cta {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    padding: 24px;
  }
  .demo-pulse-line { opacity: 0.25; }
}

@media (max-width: 480px) {
  .meta-chip {
    font-size: 11px;
    padding: 5px 10px 5px 8px;
  }
  .role-action {
    font-size: 12px;
  }
  /* Phase 5.3: hide heavy ECG line on very small screens */
  .demo-pulse-line { display: none; }
  /* Reduce orb size to avoid horizontal scroll */
  .orb-1 { width: 320px; height: 320px; }
  .orb-2 { width: 280px; height: 280px; }
  .orb-3 { display: none; }
}
</style>
