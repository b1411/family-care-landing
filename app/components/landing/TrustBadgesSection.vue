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
            <template v-if="item.customDisplay">{{ item.customDisplay }}</template>
            <template v-else>{{ item.prefix }}{{ displayValues[i] }}{{ item.suffix }}</template>
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
    value: 104,
    suffix: '',
    prefix: '',
    label: 'Недель сопровождения — от зачатия до 2 лет',
    icon: 'lucide:route',
    iconBg: 'var(--color-primary-light)',
    iconColor: 'var(--color-primary)',
  },
  {
    value: 50,
    suffix: '+',
    prefix: '',
    label: 'Событий маршрута на каждую семью',
    icon: 'lucide:check-circle',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
  },
  {
    value: 18,
    suffix: '+',
    prefix: '',
    label: 'Прививок под контролем — нацкалендарь РК',
    icon: 'lucide:shield-check',
    iconBg: 'var(--color-secondary-light)',
    iconColor: 'var(--color-secondary-dark)',
  },
  {
    value: null,
    suffix: '',
    prefix: '',
    customDisplay: 'ежедневно',
    label: 'Напоминаний семье — витамины, приёмы, анализы',
    icon: 'lucide:bell',
    iconBg: 'var(--color-accent-blue-light)',
    iconColor: 'var(--color-accent-blue)',
  },
]

// SSR-safe: start at final values, animate from 80% on viewport entry
const displayValues = reactive(numbers.map((n) => (n.value ?? 0)))

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

      // Count-up from 80% to 100% — never from 0
      numbers.forEach((item, i) => {
        if (item.value == null) return
        const obj = { val: Math.round(item.value * 0.8) }
        gsap.to(obj, {
          val: item.value,
          duration: 1.2,
          delay: i * 0.1,
          ease: 'power2.out',
          onUpdate: () => {
            displayValues[i] = Math.round(obj.val)
          },
        })
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
  position: relative;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;
}

.number-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: var(--gradient-cta);
  border-radius: 3px 3px 0 0;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.number-item:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(139, 126, 200, 0.15);
}

.number-item:hover::after {
  width: 40%;
  left: 30%;
}

.number-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  transition: transform 0.3s ease;
}

.number-item:hover .number-icon-wrap {
  transform: scale(1.1) rotate(-3deg);
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
