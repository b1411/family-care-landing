<template>
  <div class="demo-layout">
    <!-- Demo banner -->
    <div class="demo-banner">
      <div class="demo-banner-inner">
        <Icon name="lucide:eye" size="16" />
        <span>Демо-режим — тестовые данные</span>
        <NuxtLink to="/for-clinics#clinic-cta" class="demo-banner-cta">
          Оставить заявку
          <Icon name="lucide:arrow-right" size="14" />
        </NuxtLink>
      </div>
    </div>

    <!-- Simplified topbar -->
    <header class="demo-topbar">
      <NuxtLink to="/" class="demo-logo">
        <div class="demo-logo-icon">
          <Icon name="lucide:heart-pulse" size="20" />
        </div>
        <span class="demo-logo-text">UMAI Health</span>
      </NuxtLink>

      <nav class="demo-nav">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="demo-tab"
          :class="{ active: route.path === tab.to }"
        >
          <Icon :name="tab.icon" size="18" />
          <span>{{ tab.label }}</span>
        </NuxtLink>
      </nav>

      <div class="demo-topbar-right">
        <!-- Phase 4.7: ⌘K palette trigger -->
        <button
          type="button"
          class="demo-cmdk-trigger"
          aria-label="Открыть командную палитру"
          @click="cmdkRef?.open()"
        >
          <Icon name="lucide:command" size="14" />
          <span class="cmdk-trigger-label">Команды</span>
          <kbd class="cmdk-trigger-kbd font-mono">{{ cmdkHint }}</kbd>
        </button>

        <NuxtLink to="/" class="demo-back">
          <Icon name="lucide:arrow-left" size="16" />
          <span>На главную</span>
        </NuxtLink>
      </div>
    </header>

    <!-- Content -->
    <main class="demo-main">
      <slot />
    </main>

    <!-- Phase 4.7: Global Command Palette — listens to ⌘K / Ctrl+K -->
    <AppCommandPalette ref="cmdkRef" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const tabs = [
  { to: '/demo/family', label: 'Приложение мамы', icon: 'lucide:heart' },
  { to: '/demo/coordinator', label: 'Координатор', icon: 'lucide:clipboard-list' },
  { to: '/demo/doctor', label: 'Врач', icon: 'lucide:stethoscope' },
]

// Phase 4.7: Cmd+K palette trigger
const cmdkRef = ref<{ open: () => void; close: () => void; toggle: () => void } | null>(null)
const cmdkHint = ref('⌘K')

onMounted(() => {
  if (typeof navigator !== 'undefined') {
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
    cmdkHint.value = isMac ? '⌘K' : 'Ctrl K'
  }
})
</script>

<style scoped>
.demo-layout {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* Demo banner */
.demo-banner {
  background: var(--gradient-cta);
  color: white;
  font-size: var(--text-sm);
  padding: 8px 16px;
  text-align: center;
}

.demo-banner-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: var(--container-max);
  margin: 0 auto;
}

.demo-banner-cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-weight: 600;
  text-decoration: none;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.2);
  transition: background var(--transition-fast);
}

.demo-banner-cta:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Topbar */
.demo-topbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: 0;
  z-index: 50;
}

.demo-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.demo-logo-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--gradient-cta);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-logo-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
}

.demo-nav {
  display: flex;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.demo-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.demo-tab:hover {
  background: var(--color-primary-ultralight);
  color: var(--color-text-primary);
}

.demo-tab.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

.demo-topbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

/* Phase 4.7 — ⌘K trigger pill */
.demo-cmdk-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 12px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.06);
  border: 1px solid rgba(139, 126, 200, 0.16);
  color: var(--color-text-secondary);
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-cmdk-trigger:hover {
  background: rgba(139, 126, 200, 0.12);
  border-color: rgba(139, 126, 200, 0.28);
  color: var(--color-text-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.30);
}

.cmdk-trigger-label {
  letter-spacing: var(--tracking-snug);
}

.cmdk-trigger-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 7px;
  border-radius: 6px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.16);
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  letter-spacing: 0.04em;
  box-shadow: 0 1px 0 rgba(75, 50, 130, 0.04);
}

.demo-back {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.demo-back:hover {
  color: var(--color-primary);
}

/* Main content */
.demo-main {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  min-width: 0;
}

.demo-main > * { min-width: 0; }

/* Responsive */
@media (max-width: 768px) {
  .demo-topbar {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 16px;
  }

  .demo-nav {
    order: 3;
    width: 100%;
    overflow-x: auto;
    justify-content: flex-start;
    -webkit-overflow-scrolling: touch;
  }

  .demo-tab span {
    white-space: nowrap;
  }

  .demo-back span {
    display: none;
  }

  .cmdk-trigger-label,
  .cmdk-trigger-kbd {
    display: none;
  }

  .demo-cmdk-trigger {
    padding: 6px 10px;
  }

  .demo-main {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .demo-logo-text {
    display: none;
  }
  /* Phase 5.3: tighter top-bar */
  .demo-topbar {
    padding: 10px 12px;
    gap: 8px;
  }
  .demo-tab {
    padding: 8px 12px;
    font-size: 12.5px;
  }
  .demo-banner {
    font-size: 12px;
    padding: 6px 12px;
  }
  .demo-cmdk-trigger {
    min-width: 36px;
    min-height: 36px;
    justify-content: center;
  }
  .demo-main {
    padding: 12px;
  }
}
</style>
