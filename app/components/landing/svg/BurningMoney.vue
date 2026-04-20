<template>
  <div ref="moneyRef" class="burning-wrap">
    <svg viewBox="0 0 200 260" fill="none" class="burning-svg" aria-hidden="true">
      <!-- Stack of "control-point" cards that fall away -->
      <g v-for="(note, i) in 5" :key="i" :class="`banknote banknote-${i}`">
        <rect
          :x="30"
          :y="160 - i * 16"
          width="140"
          height="40"
          rx="6"
          :fill="i < burned ? '#F3F4F6' : 'var(--color-surface)'"
          :stroke="i < burned ? '#D1D5DB' : 'var(--color-border)'"
          stroke-width="1.5"
        />
        <!-- checkmark icon inside each card -->
        <circle
          :cx="60"
          :cy="180 - i * 16"
          r="8"
          :fill="i < burned ? '#E5E7EB' : 'var(--color-primary-light)'"
        />
        <path
          :d="`M ${56} ${180 - i * 16} l 3 3 l 6 -6`"
          :stroke="i < burned ? '#D1D5DB' : 'var(--color-primary)'"
          stroke-width="1.8"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <rect
          :x="76"
          :y="174 - i * 16"
          width="70"
          height="4"
          rx="2"
          :fill="i < burned ? '#E5E7EB' : 'var(--color-border)'"
        />
        <rect
          :x="76"
          :y="182 - i * 16"
          width="45"
          height="3"
          rx="1.5"
          :fill="i < burned ? '#F3F4F6' : 'var(--color-border)'"
        />
      </g>
    </svg>
    <div class="counter-label">Пропущенных точек контроля:</div>
    <div class="counter-value font-display">{{ formattedAmount }}</div>
    <div class="counter-hint">анализы, прививки, осмотры, которых клиника не делает</div>
  </div>
</template>

<script setup lang="ts">
const { gsap, ScrollTrigger } = useGsap()

const moneyRef = ref<HTMLElement | null>(null)
const burned = ref(0)
// SSR-safe: initialize with final value so crawlers/slow loads never see "0"
const amount = ref(1200)

// Target: ~1 200 missed events/year for a 30-family/month clinic (per TZ 0.2)
const targetAmount = 1200
const formattedAmount = computed(() => {
  const val = Math.round(amount.value)
  return `${val.toLocaleString('ru-RU')}+ в год`
})

onMounted(() => {
  if (!moneyRef.value || !gsap || !ScrollTrigger) return

  const banknotes = moneyRef.value.querySelectorAll('.banknote')
  const isMobile = window.matchMedia('(max-width: 768px)').matches

  if (isMobile) {
    // Simple appear on mobile — show final state
    ScrollTrigger.create({
      trigger: moneyRef.value,
      start: 'top 75%',
      once: true,
      onEnter() {
        burned.value = 5
        amount.value = targetAmount
        banknotes.forEach((note, i) => {
          gsap.to(note, { y: -80 - i * 20, opacity: 0, rotation: (Math.random() - 0.5) * 30, duration: 0.4, delay: i * 0.15 })
        })
      },
    })
    return
  }

  // Desktop: start from ~80% of target so the number is already readable
  amount.value = Math.round(targetAmount * 0.8)

  ScrollTrigger.create({
    trigger: moneyRef.value,
    start: 'top 70%',
    end: 'bottom 30%',
    scrub: 1,
    onUpdate(self: any) {
      const progress = self.progress
      // Burn events one by one
      const burnIndex = Math.floor(progress * 5)
      burned.value = burnIndex

      // Animate card flying away
      banknotes.forEach((note, i) => {
        if (i < burnIndex) {
          gsap.set(note, { y: -80 - i * 20, opacity: 0, rotation: (Math.random() - 0.5) * 30 })
        } else {
          gsap.set(note, { y: 0, opacity: 1, rotation: 0 })
        }
      })

      // Counter animates from 80% → 100%
      amount.value = targetAmount * (0.8 + progress * 0.2)
    },
  })
})
</script>

<style scoped>
.burning-wrap {
  text-align: center;
}

.burning-svg {
  width: 200px;
  height: auto;
  margin-bottom: 16px;
}

.banknote {
  transition: opacity 0.3s;
}

.counter-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.counter-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-danger);
  font-variant-numeric: tabular-nums;
}

.counter-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 8px;
  max-width: 240px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.4;
}
</style>
