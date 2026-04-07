<template>
  <div ref="funnelRef" class="funnel-wrap">
    <svg :viewBox="`0 0 ${width} ${height}`" class="funnel-svg">
      <g v-for="(bar, i) in bars" :key="bar.label">
        <rect
          :x="(width - bar.w) / 2"
          :y="i * (barHeight + gap) + 10"
          :width="bar.w"
          :height="barHeight"
          :rx="8"
          :fill="bar.fill"
          class="funnel-bar"
          :data-index="i"
        />
        <text
          :x="width / 2"
          :y="i * (barHeight + gap) + 10 + barHeight / 2 + 5"
          text-anchor="middle"
          font-size="13"
          font-weight="600"
          fill="white"
        >{{ bar.label }}</text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
const { gsap, ScrollTrigger } = useGsap()

const funnelRef = ref<HTMLElement | null>(null)

const width = 300
const barHeight = 36
const gap = 8
const height = 5 * (barHeight + gap) + 20

const maxWidth = 280

interface FunnelBar {
  label: string
  w: number
  fill: string
}

// Ровная пирамида: линейное уменьшение ширины сверху вниз
const steps = 5
const minBarW = 80
function pyramidWidth(i: number) {
  return maxWidth - i * ((maxWidth - minBarW) / (steps - 1))
}

const bars = reactive<FunnelBar[]>([
  { label: '100 семей', w: pyramidWidth(0), fill: '#9CA3AF' },
  { label: '55 семей', w: pyramidWidth(1), fill: '#9CA3AF' },
  { label: '33 семьи', w: pyramidWidth(2), fill: '#9CA3AF' },
  { label: '15 семей', w: pyramidWidth(3), fill: '#D4726C' },
  { label: '5 семей', w: pyramidWidth(4), fill: '#D4726C' },
])

onMounted(() => {
  if (!funnelRef.value || !gsap || !ScrollTrigger) return

  const barEls = funnelRef.value.querySelectorAll('.funnel-bar')

  // Phase 2: recovery — fill teal from bottom up
  ScrollTrigger.create({
    trigger: funnelRef.value,
    start: 'top 60%',
    once: true,
    onEnter() {
      // Ровная пирамида для recovered-состояния
      const maxR = maxWidth * 0.9  // 252
      const minR = 100
      const recoveredWidths = Array.from({ length: steps }, (_, i) =>
        maxR - i * ((maxR - minR) / (steps - 1)),
      )
      const recoveredLabels = ['90 семей', '75 семей', '50 семей', '25 семей', '5 семей']
      const teal = 'var(--color-primary)'

      for (let i = barEls.length - 1; i >= 0; i--) {
        const barEl = barEls[i]
        const rw = recoveredWidths[i]
        const bar = bars[i]
        const label = recoveredLabels[i]
        if (!barEl || rw == null || !bar || !label) continue
        const delay = (barEls.length - 1 - i) * 0.3
        gsap.to(barEl, {
          attr: { width: rw, x: (width - rw) / 2, fill: teal },
          duration: 0.6,
          delay: delay + 0.8,
          ease: 'power2.out',
        })
        // Update labels reactively
        setTimeout(() => {
          bar.label = label
          bar.fill = 'var(--color-primary)'
        }, (delay + 0.8) * 1000)
      }
    },
  })
})
</script>

<style scoped>
.funnel-wrap {
  max-width: 320px;
  margin: 0 auto;
}
.funnel-svg {
  width: 100%;
  height: auto;
}
.funnel-bar {
  transition: fill 0.4s ease;
}
</style>
