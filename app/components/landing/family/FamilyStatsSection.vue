<template>
  <section ref="sectionRef" class="family-stats landing-section">
    <div class="landing-container">
      <div class="stats-strip" data-stagger="scale-in">
        <div v-for="(s, i) in stats" :key="s.label" class="stat-item">
          <div class="stat-ring" :style="{ '--ring-color': ringColors[i] }">
            <svg class="ring-svg" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="none" :stroke="ringColors[i]" stroke-width="2" stroke-dasharray="220" stroke-dashoffset="220" opacity="0.25" />
              <circle class="ring-progress" cx="40" cy="40" r="35" fill="none" :stroke="ringColors[i]" stroke-width="2.5" stroke-dasharray="220" :stroke-dashoffset="220 - 220 * s.ring" stroke-linecap="round" />
            </svg>
            <span class="stat-val font-display">
              <LandingUiAnimatedCounter :target="s.value" :prefix="s.prefix" :suffix="s.suffix" />
            </span>
          </div>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const sectionRef = ref<HTMLElement | null>(null)

const ringColors = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-accent-blue)',
  'var(--color-accent-warm)',
  'var(--color-primary)',
]

const stats = [
  { value: 40, prefix: '', suffix: '+', label: 'Недель беременности', ring: 0.85 },
  { value: 24, prefix: '', suffix: '', label: 'Месяца жизни малыша', ring: 1 },
  { value: 18, prefix: '', suffix: '+', label: 'Прививок по нац. календарю', ring: 0.75 },
  { value: 50, prefix: '', suffix: '+', label: 'Событий в маршруте', ring: 0.9 },
  { value: 24, prefix: '', suffix: '/7', label: 'Доступ к данным', ring: 1 },
]
</script>

<style scoped>
.family-stats {
  padding: 56px 0;
  background: var(--color-bg-alt);
}

.stats-strip {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-ring {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-progress {
  transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s;
}

.stat-val {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  display: block;
  line-height: 1;
  position: relative;
  z-index: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  display: block;
  max-width: 120px;
  line-height: 1.3;
}

@media (max-width: 768px) {
  .stats-strip {
    gap: 20px;
  }
  .stat-ring {
    width: 64px;
    height: 64px;
  }
  .stat-val {
    font-size: 22px;
  }
}
</style>
