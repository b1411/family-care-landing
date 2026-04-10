<template>
  <div ref="moneyRef" class="burning-wrap">
    <svg viewBox="0 0 200 260" fill="none" class="burning-svg">
      <!-- Stack of banknotes -->
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
        <text
          :x="100"
          :y="185 - i * 16"
          text-anchor="middle"
          font-size="16"
          font-weight="700"
          :fill="i < burned ? '#D1D5DB' : 'var(--color-text-secondary)'"
        >₸</text>
      </g>
    </svg>
    <div class="counter-label">Упущенная выручка:</div>
    <div class="counter-value font-display">{{ formattedAmount }}</div>
  </div>
</template>

<script setup lang="ts">
const { gsap, ScrollTrigger } = useGsap()

const moneyRef = ref<HTMLElement | null>(null)
const burned = ref(0)
const amount = ref(0)

const targetAmount = 43_000_000
const formattedAmount = computed(() => {
  const val = Math.round(amount.value)
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)} млн ₸/год`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)} тыс ₸/год`
  return `${val} ₸/год`
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

  ScrollTrigger.create({
    trigger: moneyRef.value,
    start: 'top 70%',
    end: 'bottom 30%',
    scrub: 1,
    onUpdate(self: any) {
      const progress = self.progress
      // Burn banknotes one by one
      const burnIndex = Math.floor(progress * 5)
      burned.value = burnIndex

      // Animate banknote flying away
      banknotes.forEach((note, i) => {
        if (i < burnIndex) {
          gsap.set(note, { y: -80 - i * 20, opacity: 0, rotation: (Math.random() - 0.5) * 30 })
        } else {
          gsap.set(note, { y: 0, opacity: 1, rotation: 0 })
        }
      })

      // Counter
      amount.value = progress * targetAmount
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
</style>
