<template>
  <div class="wl-demo" @mouseenter="pause" @mouseleave="resume">
    <svg viewBox="0 0 200 380" fill="none" class="wl-phone-svg">
      <!-- Phone frame -->
      <rect x="10" y="5" width="180" height="370" rx="24" stroke="var(--color-border)" stroke-width="2" fill="var(--color-surface)" />
      <rect x="70" y="12" width="60" height="6" rx="3" fill="var(--color-border)" />

      <!-- Header -->
      <rect x="16" y="30" width="168" height="48" rx="4" :fill="currentTheme.primary" class="wl-header" />
      <text x="100" y="58" text-anchor="middle" font-size="13" font-weight="700" fill="white" class="wl-name">{{ currentTheme.name }}</text>

      <!-- Content placeholders -->
      <rect x="24" y="92" width="152" height="20" rx="4" fill="var(--color-surface-hover)" />
      <rect x="24" y="120" width="120" height="14" rx="3" fill="var(--color-border-light)" />
      <rect x="24" y="142" width="152" height="40" rx="6" :fill="currentTheme.primary" opacity="0.12" class="wl-card" />
      <rect x="34" y="152" width="80" height="8" rx="2" :fill="currentTheme.primary" opacity="0.4" />
      <rect x="34" y="164" width="50" height="6" rx="2" :fill="currentTheme.primary" opacity="0.25" />

      <rect x="24" y="194" width="152" height="40" rx="6" fill="var(--color-surface-hover)" />
      <rect x="24" y="244" width="152" height="40" rx="6" fill="var(--color-surface-hover)" />

      <!-- Button -->
      <rect x="24" y="300" width="152" height="40" rx="20" :fill="currentTheme.primary" class="wl-btn-rect" />
      <text x="100" y="325" text-anchor="middle" font-size="12" font-weight="600" fill="white">Записаться</text>
    </svg>

    <!-- Theme selector -->
    <div class="wl-themes">
      <button
        v-for="(theme, i) in themes"
        :key="theme.name"
        :class="['wl-theme-btn', { active: currentIndex === i }]"
        @click="switchTo(i)"
      >
        <span class="wl-dot" :style="{ background: theme.primary }" />
        {{ theme.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const themes = [
  { primary: '#2A9D8F', name: 'Клиника Рахат' },
  { primary: '#1E40AF', name: 'Керуен Medicus' },
  { primary: '#059669', name: 'IRM Group' },
]

const currentIndex = ref(0)
const currentTheme = computed(() => themes[currentIndex.value]!)

let interval: ReturnType<typeof setInterval> | null = null

function switchTo(i: number) {
  currentIndex.value = i
}

function next() {
  currentIndex.value = (currentIndex.value + 1) % themes.length
}

function startCycle() {
  interval = setInterval(next, 3000)
}

function pause() {
  if (interval) { clearInterval(interval); interval = null }
}

function resume() {
  startCycle()
}

onMounted(() => startCycle())
onUnmounted(() => pause())
</script>

<style scoped>
.wl-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.wl-phone-svg {
  width: 200px;
  height: auto;
}

.wl-header,
.wl-card,
.wl-btn-rect {
  transition: fill 0.5s ease;
}

.wl-name {
  transition: opacity 0.3s;
}

.wl-themes {
  display: flex;
  gap: 8px;
}

.wl-theme-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.wl-theme-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-text-primary);
}

.wl-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
