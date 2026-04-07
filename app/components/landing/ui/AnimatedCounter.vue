<template>
  <span ref="el" class="counter font-display">{{ displayed }}</span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  target: number
  prefix?: string
  suffix?: string
  duration?: number
}>(), {
  prefix: '',
  suffix: '',
  duration: 1800,
})

const el = ref<HTMLElement | null>(null)
const current = ref(0)
const hasAnimated = ref(false)

const displayed = computed(() => {
  return `${props.prefix}${Math.round(current.value).toLocaleString('ru-RU')}${props.suffix}`
})

function animate() {
  if (hasAnimated.value) return
  hasAnimated.value = true

  const start = performance.now()
  const from = 0
  const to = props.target

  function tick(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / props.duration, 1)
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    current.value = from + (to - from) * eased

    if (progress < 1) {
      requestAnimationFrame(tick)
    }
  }

  requestAnimationFrame(tick)
}

onMounted(() => {
  if (!el.value) return

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    current.value = props.target
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        animate()
        observer.disconnect()
      }
    },
    { threshold: 0.3 }
  )
  observer.observe(el.value)

  onUnmounted(() => observer.disconnect())
})
</script>

<style scoped>
.counter {
  font-variant-numeric: tabular-nums;
}
</style>
