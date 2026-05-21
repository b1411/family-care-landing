<template>
  <header class="navbar" :class="{ scrolled: isScrolled }">
    <div class="navbar-inner landing-container">
      <!-- Logo -->
      <NuxtLink to="/" class="navbar-logo" aria-label="UMAI Health — на главную">
        <span class="logo-icon">
          <Icon name="lucide:heart-pulse" size="22" />
          <span class="logo-icon-pulse" aria-hidden="true" />
        </span>
        <span class="logo-text font-display">
          <span class="logo-text-gradient">UMAI</span>&nbsp;Health
        </span>
      </NuxtLink>

      <!-- Desktop Navigation — page tabs -->
      <nav class="navbar-tabs" aria-label="Основная навигация">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="nav-tab font-heading"
          :class="{ active: isActiveTab(tab.to) }"
        >
          <span class="nav-tab-label">{{ tab.label }}</span>
          <span class="nav-tab-underline" aria-hidden="true" />
        </NuxtLink>
      </nav>

      <!-- Auth + CTA -->
      <div class="navbar-actions">
        <NuxtLink
          to="/demo"
          class="navbar-demo font-heading"
          aria-label="Попробовать демо платформы"
        >
          <span>Попробовать демо</span>
          <Icon name="lucide:arrow-right" size="14" class="navbar-demo-arrow" />
        </NuxtLink>
        <a
          href="#contact"
          class="navbar-cta font-heading btn-shimmer"
          aria-label="Перейти к форме обсуждения подключения"
        >
          Обсудить подключение
        </a>
      </div>

      <!-- Mobile burger -->
      <button class="navbar-burger" @click="menuOpen = !menuOpen" :aria-label="menuOpen ? 'Закрыть меню' : 'Открыть меню'">
        <Icon :name="menuOpen ? 'lucide:x' : 'lucide:menu'" size="24" />
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="mobile-menu">
      <div v-if="menuOpen" class="mobile-menu">
        <nav class="mobile-nav">
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.to"
            :to="tab.to"
            class="mobile-link font-heading"
            :class="{ active: isActiveTab(tab.to) }"
            @click="menuOpen = false"
          >
            {{ tab.label }}
          </NuxtLink>
          <div class="mobile-auth">
            <NuxtLink to="/demo" class="mobile-auth-btn mobile-auth-login font-heading" @click="menuOpen = false">Попробовать демо</NuxtLink>
          </div>
          <a href="#contact" class="mobile-cta font-heading" @click="menuOpen = false">Обсудить подключение</a>
        </nav>
      </div>
    </Transition>

    <!-- Demo Modal removed — all demo links go to /demo directly -->
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const menuOpen = ref(false)
const isScrolled = ref(false)

const tabs = [
  { to: '/', label: 'Платформа' },
  { to: '/for-clinics', label: 'Для клиник' },
  { to: '/for-families', label: 'Для родителей' },
]

function isActiveTab(path: string) {
  return route.path === path
}

const onScroll = () => {
  isScrolled.value = window.scrollY > 100
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px 24px 0;
  transition:
    padding var(--transition-smooth);
}

.navbar.scrolled {
  padding-top: 8px;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1000px;
  margin: 0 auto;
  height: 56px;
  padding: 0 6px;
  border-radius: var(--radius-full);
  background: rgba(254, 252, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(139, 126, 200, 0.08);
  box-shadow: var(--shadow-lg);
  transition:
    height var(--transition-smooth),
    box-shadow var(--transition-smooth),
    background var(--transition-smooth);
}

.navbar.scrolled .navbar-inner {
  height: 48px;
  background: rgba(254, 252, 255, 0.92);
  box-shadow: var(--shadow-hover);
}

/* Logo */
.navbar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.logo-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--gradient-cta);
  color: white;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 4px 14px rgba(139, 126, 200, 0.32);
  isolation: isolate;
}

.logo-icon-pulse {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--gradient-cta);
  z-index: -1;
  opacity: 0;
}

@media (prefers-reduced-motion: no-preference) {
  .logo-icon-pulse {
    animation: logo-icon-pulse 3.2s ease-out infinite;
  }
}

@keyframes logo-icon-pulse {
  0% { opacity: 0.55; transform: scale(1); }
  70% { opacity: 0; transform: scale(1.55); }
  100% { opacity: 0; transform: scale(1.55); }
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.logo-text-gradient {
  background: linear-gradient(115deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 800;
}

/* Desktop tabs */
.navbar-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.06);
}

.nav-tab {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 8px 20px;
  border-radius: var(--radius-full);
  transition: color var(--transition-fast), background var(--transition-fast);
  position: relative;
  white-space: nowrap;
  overflow: hidden;
}

.nav-tab-label {
  position: relative;
  z-index: 1;
}

.nav-tab-underline {
  position: absolute;
  left: 50%;
  bottom: 4px;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 2px;
  transform: translateX(-50%);
  transition: width 0.32s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.2s ease;
  opacity: 0;
  pointer-events: none;
}

.nav-tab:hover {
  color: var(--color-primary);
  background: rgba(139, 126, 200, 0.08);
}

.nav-tab:hover .nav-tab-underline {
  width: 60%;
  opacity: 1;
}

.nav-tab.active {
  color: var(--color-primary);
  background: white;
  font-weight: 600;
  box-shadow: 0 1px 6px rgba(139, 126, 200, 0.15);
}

.nav-tab.active .nav-tab-underline {
  width: 0;
  opacity: 0;
}

/* Auth + CTA group */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Login link */
.navbar-login {
  padding: 8px 18px;
  border-radius: var(--radius-full);
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
  white-space: nowrap;
}

.navbar-login:hover {
  background: rgba(139, 126, 200, 0.08);
}

/* Demo button */
.navbar-demo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px 10px 20px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(139, 126, 200, 0.32);
  background: transparent;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  text-decoration: none;
}

.navbar-demo-arrow {
  transition: transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.navbar-demo:hover {
  background: var(--color-primary-ultralight);
  border-color: var(--color-primary);
  box-shadow: 0 4px 14px -4px rgba(139, 126, 200, 0.35);
  transform: translateY(-1px);
}

.navbar-demo:hover .navbar-demo-arrow {
  transform: translateX(3px);
}

/* Mobile demo button */
.mobile-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mobile-demo:hover {
  background: var(--color-primary-ultralight);
}

/* CTA button */
.navbar-cta {
  position: relative;
  padding: 10px 22px;
  border-radius: var(--radius-full);
  background: var(--gradient-cta);
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
  white-space: nowrap;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 4px 16px -2px rgba(139, 126, 200, 0.42);
  overflow: hidden;
  isolation: isolate;
}

.navbar-cta:hover {
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 8px 28px -4px rgba(139, 126, 200, 0.55);
}

/* Burger */
.navbar-burger {
  display: none;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.navbar-burger:hover {
  background: var(--color-primary-light);
}

/* Mobile menu */
.mobile-menu {
  background: rgba(254, 252, 255, 0.97);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
  padding: 16px 0;
  max-height: calc(100vh - 60px);
  overflow-y: auto;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 var(--container-px);
}

.mobile-link {
  display: block;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.mobile-link:hover {
  background: var(--color-primary-ultralight);
  color: var(--color-primary);
}

.mobile-link.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

/* Mobile auth buttons */
.mobile-auth {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.mobile-auth-btn {
  flex: 1;
  display: block;
  text-align: center;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: background var(--transition-fast);
}

.mobile-auth-login {
  color: var(--color-primary);
  background: rgba(139, 126, 200, 0.08);
}

.mobile-auth-login:hover {
  background: rgba(139, 126, 200, 0.14);
}

.mobile-auth-register {
  color: white;
  background: var(--gradient-cta);
}

.mobile-auth-register:hover {
  opacity: 0.9;
}

.mobile-cta {
  display: block;
  text-align: center;
  margin-top: 8px;
  padding: 14px 24px;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-primary);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  border: 1.5px solid rgba(139, 126, 200, 0.2);
}

/* Mobile menu transition */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive */
@media (max-width: 1024px) {
  .navbar-tabs {
    gap: 2px;
    padding: 3px;
  }

  .nav-tab {
    font-size: 13px;
    padding: 6px 14px;
  }

  .navbar-login {
    padding: 6px 14px;
    font-size: 13px;
  }

  .navbar-cta {
    padding: 8px 18px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .navbar-tabs,
  .navbar-actions {
    display: none;
  }

  .navbar-burger {
    display: flex;
  }

  .navbar {
    padding: 8px 12px 0;
  }

  .navbar-inner {
    max-width: 100%;
    height: 52px;
    padding: 0 12px 0 16px;
    border-radius: var(--radius-xl);
  }

  .navbar.scrolled .navbar-inner {
    height: 46px;
  }
  /* Phase 5.3: reduce backdrop-filter blur on iOS for perf */
  .navbar-inner {
    backdrop-filter: blur(12px) saturate(160%);
    -webkit-backdrop-filter: blur(12px) saturate(160%);
  }
}

@media (max-width: 360px) {
  .navbar-burger {
    padding: 10px;
  }
  .navbar-inner {
    padding: 0 8px 0 12px;
  }
  .logo-text {
    font-size: 16px;
  }
}
</style>
