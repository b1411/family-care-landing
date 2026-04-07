<template>
  <section class="growing-child landing-section" data-clip-reveal="wipe-up">
    <div class="landing-container">
      <div class="gc-header" data-reveal="fade-up">
        <span class="landing-badge">Маршрут</span>
        <h2 ref="gcTitleRef" class="font-display">Растущий малыш</h2>
        <p class="gc-subtitle">Маршрут от рождения до 2 лет — каждый этап с событиями и визитами</p>
      </div>

      <div ref="gcRef" class="gc-visual">
        <!-- Morphing child SVG -->
        <div class="gc-svg-wrap" data-reveal="fade-up">
          <div class="gc-svg-aura" />
          <svg viewBox="0 0 200 150" width="200" height="150" class="gc-svg">
            <path
              :d="currentPath"
              fill="none"
              stroke="var(--color-primary)"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="gc-stage-label">{{ stages[currentStage]?.label }}</span>
        </div>

        <!-- Horizontal axis with stage markers -->
        <div class="gc-axis">
          <div class="gc-axis-line">
            <div class="gc-axis-fill" :style="{ width: `${(scrollProgress) * 100}%` }" />
          </div>
          <div
            v-for="(stage, i) in stages"
            :key="stage.age"
            :class="['gc-stage', { active: i <= currentStage }]"
          >
            <div class="gc-dot">
              <div v-if="i === currentStage" class="gc-dot-pulse" />
            </div>
            <span class="gc-age">{{ stage.age }}</span>
            <span class="gc-events">{{ stage.events }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { childStates, childStageLabels } from '~/data/svg-paths/growing-child-states'
import { useSplitText } from '~/composables/useSplitText'

const gcRef = ref<HTMLElement | null>(null)
const gcTitleRef = ref<HTMLElement | null>(null)
const scrollProgress = ref(0)

const stages = childStageLabels.map((s, i) => ({
  ...s,
  events: ['5 визитов, 3 прививки', '4 визита, 2 прививки', '3 визита, АКДС #3', '2 визита, КПК', '2 визита, ревакцинация'][i],
}))

const currentStage = computed(() => {
  const idx = Math.floor(scrollProgress.value * (childStates.length - 0.01))
  return Math.max(0, Math.min(childStates.length - 1, idx))
})

const currentPath = computed(() => childStates[currentStage.value])

onMounted(() => {
  if (typeof window === 'undefined' || !gcRef.value) return

  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (mql.matches) { scrollProgress.value = 1; return }
  if (window.innerWidth < 768) { scrollProgress.value = 1; return }

  if (gcTitleRef.value) useSplitText(gcTitleRef)

  const el = gcRef.value
  const onScroll = () => {
    const rect = el.getBoundingClientRect()
    const start = window.innerHeight * 0.7
    const end = -rect.height * 0.3
    const p = (start - rect.top) / (start - end)
    scrollProgress.value = Math.max(0, Math.min(1, p))
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
      onUnmounted(() => window.removeEventListener('scroll', onScroll))
      observer.disconnect()
    },
    { threshold: 0.05 },
  )
  observer.observe(el)
})
</script>

<style scoped>
.gc-header {
  text-align: center;
  margin-bottom: 56px;
}

.gc-header h2 {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 12px 0 8px;
}

.gc-subtitle {
  font-size: 17px;
  color: var(--color-text-secondary);
  margin: 0;
}

.gc-visual {
  max-width: var(--content-medium);
  margin: 0 auto;
}

.gc-svg-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48px;
}

/* Soft aura behind SVG */
.gc-svg-aura {
  position: absolute;
  width: 160px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(ellipse, var(--color-primary-light, rgba(139, 126, 200, 0.15)) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
}

.gc-svg {
  position: relative;
  z-index: 1;
}

.gc-svg path {
  transition: d 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
}

.gc-stage-label {
  margin-top: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light, rgba(139, 126, 200, 0.1));
  padding: 4px 14px;
  border-radius: var(--radius-full);
  transition: opacity 0.3s;
}

/* Horizontal axis */
.gc-axis {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.gc-axis-line {
  position: absolute;
  top: 7px;
  left: 20px;
  right: 20px;
  height: 3px;
  background: var(--color-border);
  border-radius: 1.5px;
  overflow: hidden;
}

.gc-axis-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 1.5px;
  transition: width 0.2s linear;
}

.gc-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1;
}

.gc-dot {
  position: relative;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-border);
  border: 3px solid var(--color-bg, #fff);
  transition: background 0.4s, box-shadow 0.4s, transform 0.4s;
}

.gc-stage.active .gc-dot {
  background: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-light, rgba(139,126,200,0.2));
  transform: scale(1.15);
}

.gc-dot-pulse {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  animation: gc-ping 1.5s ease-out infinite;
}

@keyframes gc-ping {
  0% { transform: scale(0.6); opacity: 0.7; }
  100% { transform: scale(1.4); opacity: 0; }
}

.gc-age {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  transition: color 0.3s;
}

.gc-stage.active .gc-age {
  color: var(--color-primary);
}

.gc-events {
  font-size: 11px;
  color: var(--color-text-muted);
  text-align: center;
  max-width: 100px;
}

@media (max-width: 768px) {
  .gc-axis { gap: 4px; padding: 0; }
  .gc-events { display: none; }
  .gc-age { font-size: 11px; }
  .gc-dot { width: 12px; height: 12px; }
}
</style>
