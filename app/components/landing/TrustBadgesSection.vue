<template>
  <section ref="sectionRef" class="platform-numbers-section">
    <div class="landing-container">
      <div class="numbers-row">
        <div
          v-for="(item, i) in numbers"
          :key="i"
          ref="cardRefs"
          class="number-item"
          data-tilt
          :style="{ '--num-accent': item.iconColor }"
        >
          <span class="number-border" aria-hidden="true" />

          <div class="number-icon-wrap" :style="{ background: item.iconBg }">
            <Icon :name="item.icon" size="20" :style="{ color: item.iconColor }" />
            <span class="number-icon-glow" aria-hidden="true" />
          </div>

          <span class="number-value t-display-stat">
            <template v-if="item.customDisplay">{{ item.customDisplay }}</template>
            <template v-else>{{ item.prefix }}{{ displayValues[i] }}{{ item.suffix }}</template>
          </span>

          <p class="number-label">{{ item.label }}</p>

          <span class="number-idx font-mono" aria-hidden="true">0{{ i + 1 }}</span>
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
    label: 'Недель сопровождения — от первых недель беременности до 2 лет',
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
    suffix: '',
    prefix: '',
    label: 'Прививок под контролем — национальный календарь РК',
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

let entranceTrigger: { kill: () => void } | null = null

onMounted(() => {
  if (!gsap || !ScrollTrigger || !sectionRef.value) return

  // Card entrance — spring stagger from below
  gsap.set(cardRefs.value, { opacity: 0, y: 60, scale: 0.85 })

  entranceTrigger = ScrollTrigger.create({
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

onBeforeUnmount(() => {
  if (entranceTrigger) {
    entranceTrigger.kill()
    entranceTrigger = null
  }
})
</script>

<style scoped>
.platform-numbers-section {
  padding: 40px 0 56px;
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
  position: relative;
  text-align: left;
  padding: 26px 22px 24px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  isolation: isolate;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(139, 126, 200, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 2px 6px rgba(139, 126, 200, 0.04),
    0 14px 32px -18px rgba(139, 126, 200, 0.22);
  transition:
    transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1),
    box-shadow 0.42s ease,
    border-color 0.32s ease;
}

/* Animated gradient border on hover */
.number-border {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, var(--num-accent, var(--color-primary)) 0%, transparent 60%);
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

.number-item:hover {
  transform: translateY(-6px);
  border-color: transparent;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 6px 16px rgba(139, 126, 200, 0.1),
    0 22px 48px -20px rgba(139, 126, 200, 0.32);
}

.number-item:hover .number-border {
  opacity: 1;
}

.number-icon-wrap {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  isolation: isolate;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 6px 14px -4px rgba(139, 126, 200, 0.2);
  transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.number-icon-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: inherit;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.number-item:hover .number-icon-wrap {
  transform: scale(1.06) rotate(-3deg);
}

.number-item:hover .number-icon-glow {
  opacity: 1;
  animation: icon-glow-pulse 1.8s ease-out infinite;
}

@keyframes icon-glow-pulse {
  0% { opacity: 0.5; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.7); }
}

.number-value {
  font-family: var(--font-display);
  font-size: clamp(32px, 4.2vw, 42px);
  font-weight: 800;
  line-height: 0.95;
  color: var(--color-text-primary);
  letter-spacing: -0.025em;
  font-variation-settings: "opsz" 96;
}

.number-label {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 200px;
}

/* Card index in top-right */
.number-idx {
  position: absolute;
  top: 14px;
  right: 16px;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.12em;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.06);
  border: 1px solid rgba(139, 126, 200, 0.1);
  pointer-events: none;
}

@media (max-width: 1024px) {
  .numbers-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .platform-numbers-section {
    margin-top: -24px;
    padding: 30px 0 40px;
  }
  .numbers-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .number-item {
    padding: 20px 16px 18px;
  }
}

@media (max-width: 480px) {
  .number-value {
    font-size: 28px;
  }
  .number-label {
    font-size: 11.5px;
    max-width: 100%;
  }
  .number-item {
    padding: 18px 14px 16px;
  }
  .number-idx {
    top: 10px;
    right: 12px;
    font-size: 9px;
  }
}

@media (max-width: 360px) {
  .numbers-row {
    grid-template-columns: 1fr;
  }
}
</style>
