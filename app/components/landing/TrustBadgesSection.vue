<template>
  <section ref="sectionRef" class="platform-numbers-section">
    <div class="landing-container">
      <div class="numbers-row">
        <div
          v-for="(item, i) in numbers"
          :key="i"
          ref="cardRefs"
          class="number-item glass-card"
          data-tilt
        >
          <div class="number-icon-wrap" :style="{ background: item.iconBg }">
            <Icon :name="item.icon" size="22" :style="{ color: item.iconColor }" />
          </div>
          <span class="number-value font-display">
            {{ item.prefix }}{{ item.value }}{{ item.suffix }}
          </span>
          <p class="number-label">{{ item.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { gsap, ScrollTrigger } = useGsap()

const sectionRef = ref<HTMLElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])

const numbers = [
  {
    value: 40,
    suffix: '+',
    prefix: '',
    label: 'Недель маршрута беременности',
    icon: 'lucide:route',
    iconBg: 'var(--color-primary-light)',
    iconColor: 'var(--color-primary)',
  },
  {
    value: 18,
    suffix: '+',
    prefix: '',
    label: 'Прививок в календаре',
    icon: 'lucide:shield-check',
    iconBg: 'var(--color-secondary-light)',
    iconColor: 'var(--color-secondary-dark)',
  },
  {
    value: 365,
    suffix: '',
    prefix: '',
    label: 'Дней сопровождения в первый год',
    icon: 'lucide:calendar-days',
    iconBg: 'var(--color-accent-blue-light)',
    iconColor: 'var(--color-accent-blue)',
  },
  {
    value: 50,
    suffix: '+',
    prefix: '',
    label: 'Точек контроля в маршруте',
    icon: 'lucide:check-circle',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
  },
]

onMounted(() => {
  if (!gsap || !ScrollTrigger || !sectionRef.value) return

  // Card entrance — spring stagger from below
  gsap.set(cardRefs.value, { opacity: 0, y: 60, scale: 0.85 })

  ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to(cardRefs.value, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: 'back.out(1.7)',
      })
    },
  })
})
</script>

<style scoped>
.platform-numbers-section {
  padding: 32px 0 48px;
  position: relative;
  z-index: 2;
  margin-top: -40px;
}

.numbers-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.number-item {
  text-align: center;
  padding: 28px 16px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: transform var(--transition-smooth), box-shadow var(--transition-smooth);
}

.number-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.number-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.number-value {
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.number-label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 140%;
  max-width: 180px;
}

@media (max-width: 1024px) {
  .numbers-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .platform-numbers-section {
    margin-top: -24px;
  }
  .numbers-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>
