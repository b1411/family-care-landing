<template>
  <LandingUiSectionWrapper
    id="implementation"
    badge="Запуск"
    title="4 шага — и вы работаете"
  >
    <div ref="stepperRef" class="stepper" data-reveal="fade-up">
      <!-- Progress line -->
      <div class="stepper-track">
        <div class="stepper-fill" :style="{ width: fillWidth }" />
      </div>

      <div class="stepper-cards">
        <div
          v-for="(step, i) in steps"
          :key="step.title"
          class="step-item"
          :class="{ active: i <= activeStep }"
        >
          <div class="step-dot">
            <svg
              v-if="i <= activeStep"
              width="28" height="28" viewBox="0 0 28 28" fill="none"
              class="step-mini-svg"
            >
              <g v-html="step.miniSvg" />
            </svg>
          </div>
          <div class="step-body">
            <span class="step-dur font-heading">{{ step.dur }}</span>
            <h4 class="step-title font-heading">{{ step.title }}</h4>
            <p class="step-desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGsap } from '~/composables/useGsap'

const { ScrollTrigger } = useGsap()

const steps = [
  {
    title: 'Demo',
    dur: '1 день',
    desc: 'Показываем платформу на реальных данных вашей клиники',
    // Video call icon
    miniSvg: '<rect x="4" y="7" width="15" height="14" rx="2" stroke="var(--color-primary)" stroke-width="1.5" fill="none"/><path d="M19 11 L24 8 L24 20 L19 17" stroke="var(--color-primary)" stroke-width="1.5" fill="none" stroke-linejoin="round"/>',
  },
  {
    title: 'Setup',
    dur: '2-3 недели',
    desc: 'Настраиваем под ваш бренд, маршруты, роли, уведомления',
    // Gears icon
    miniSvg: '<circle cx="11" cy="14" r="4" stroke="var(--color-primary)" stroke-width="1.5" fill="none"/><circle cx="20" cy="11" r="3" stroke="var(--color-primary)" stroke-width="1.5" fill="none"/><path d="M11 10 L11 8 M11 18 L11 20 M7 14 L5 14 M15 14 L17 14 M8 11 L6.5 9.5 M14 17 L15.5 18.5" stroke="var(--color-primary)" stroke-width="1.2" stroke-linecap="round"/>',
  },
  {
    title: 'Training',
    dur: '3-5 дней',
    desc: 'Обучаем координаторов и врачей. Shadow-режим: мы работаем рядом.',
    // People at table
    miniSvg: '<circle cx="8" cy="9" r="2.5" stroke="var(--color-primary)" stroke-width="1.5" fill="none"/><circle cx="20" cy="9" r="2.5" stroke="var(--color-primary)" stroke-width="1.5" fill="none"/><path d="M4 18 C4 15 6 13 8 13 C10 13 12 15 12 18" stroke="var(--color-primary)" stroke-width="1.5" fill="none"/><path d="M16 18 C16 15 18 13 20 13 C22 13 24 15 24 18" stroke="var(--color-primary)" stroke-width="1.5" fill="none"/><line x1="4" y1="21" x2="24" y2="21" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round"/>',
  },
  {
    title: 'Pilot',
    dur: '3 мес',
    desc: 'Запускаем на 30-50 семей, измеряем KPI. Еженедельные отчёты.',
    // Rocket
    miniSvg: '<path d="M14 4 C14 4 8 10 8 18 L12 20 L16 20 L20 18 C20 10 14 4 14 4 Z" stroke="var(--color-primary)" stroke-width="1.5" fill="none" stroke-linejoin="round"/><circle cx="14" cy="13" r="2" stroke="var(--color-primary)" stroke-width="1.2" fill="none"/><path d="M8 18 L5 22 L9 20 M20 18 L23 22 L19 20" stroke="var(--color-primary)" stroke-width="1.2" fill="none" stroke-linejoin="round"/><path d="M11 22 L14 26 L17 22" stroke="var(--color-primary)" stroke-width="1.5" fill="none" stroke-linejoin="round"/>',
  },
]

const stepperRef = ref<HTMLElement | null>(null)
const activeStep = ref(-1)
const fillWidth = computed(() => {
  if (activeStep.value < 0) return '0%'
  return `${(activeStep.value / (steps.length - 1)) * 100}%`
})

let trigger: InstanceType<typeof ScrollTrigger> | null = null
const timeoutIds: ReturnType<typeof setTimeout>[] = []

onMounted(() => {
  if (!stepperRef.value || !ScrollTrigger) return

  const isDesktop = window.matchMedia('(min-width: 769px)').matches

  if (isDesktop) {
    // Scroll-driven on desktop
    trigger = ScrollTrigger.create({
      trigger: stepperRef.value,
      start: 'top 70%',
      end: 'bottom 40%',
      scrub: 0.5,
      onUpdate(self: { progress: number }) {
        const newStep = Math.floor(self.progress * (steps.length + 0.5))
        activeStep.value = Math.min(newStep, steps.length - 1)
      },
    })
  } else {
    // Simple intersection on mobile
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          steps.forEach((_, i) => {
            const id = setTimeout(() => { activeStep.value = i }, 400 * (i + 1))
            timeoutIds.push(id)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(stepperRef.value)
  }
})

onUnmounted(() => {
  trigger?.kill()
  timeoutIds.forEach(id => clearTimeout(id))
})
</script>

<style scoped>
.stepper {
  position: relative;
  max-width: var(--content-medium);
  margin: 0 auto;
}

.stepper-track {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-border);
  border-radius: 2px;
}

.stepper-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.stepper-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  position: relative;
}

@media (max-width: 1024px) {
  .stepper-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

.step-item {
  padding-top: 28px;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid var(--color-border);
  background: var(--color-bg);
  position: absolute;
  top: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
  z-index: 1;
}

.step-mini-svg {
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.step-item.active .step-mini-svg {
  opacity: 1;
  transform: scale(1);
}

.step-item:nth-child(1) .step-dot { left: 0; }
.step-item:nth-child(2) .step-dot { left: calc(33.33% - 16px); }
.step-item:nth-child(3) .step-dot { left: calc(66.66% - 16px); }
.step-item:nth-child(4) .step-dot { left: calc(100% - 32px); }

.step-item.active .step-dot {
  border-color: var(--color-primary);
  background: var(--color-primary-ultralight, #F5F3FA);
  box-shadow: 0 0 12px rgba(139, 126, 200, 0.2);
}

.step-dur {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
  display: block;
  margin-bottom: 4px;
}

.step-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}

.step-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .stepper-cards {
    grid-template-columns: 1fr 1fr;
    gap: 32px 16px;
  }
  .stepper-track { display: none; }
  .step-dot { display: none; }
  .step-item { padding-top: 0; }
}
</style>
