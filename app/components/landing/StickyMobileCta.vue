<template>
  <Transition name="sticky-cta">
    <div v-if="visible" class="sticky-cta" role="region" aria-label="Быстрые действия">
      <NuxtLink to="/demo" class="sc-btn sc-btn--secondary">
        <Icon name="lucide:play" size="16" />
        <span>Демо</span>
      </NuxtLink>
      <NuxtLink :to="ctaHref" class="sc-btn sc-btn--primary">
        <span>Обсудить подключение</span>
        <Icon name="lucide:arrow-right" size="16" />
      </NuxtLink>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  ctaHref?: string
}>()

const ctaHref = computed(() => props.ctaHref || '/for-clinics#clinic-cta')

const visible = ref(false)
const lastScrollY = ref(0)
const passedThreshold = ref(false)

function onScroll() {
  if (typeof window === 'undefined') return

  const scrollY = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  const progress = docHeight > 0 ? scrollY / docHeight : 0
  const goingUp = scrollY < lastScrollY.value
  lastScrollY.value = scrollY

  // Triggers after 30% scroll
  if (progress >= 0.3) passedThreshold.value = true
  if (progress < 0.1) passedThreshold.value = false

  // Hide if form or footer is visible on screen, or near bottom
  const form = document.querySelector('#clinic-cta, .family-cta, form')
  const footer = document.querySelector('footer')
  let overlapsExcluded = false

  for (const el of [form, footer]) {
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      overlapsExcluded = true
      break
    }
  }

  // Hide on upward scroll
  visible.value = passedThreshold.value && !overlapsExcluded && !goingUp
}

onMounted(() => {
  lastScrollY.value = window.scrollY
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', onScroll)
  }
})
</script>

<style scoped>
.sticky-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 48;
  display: none;
  gap: 8px;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid var(--color-border-light);
  box-shadow: 0 -4px 20px rgba(139, 126, 200, 0.08);
}

@media (max-width: 768px) {
  .sticky-cta {
    display: flex;
  }
}

.sc-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: transform var(--transition-fast);
}

.sc-btn:active {
  transform: scale(0.97);
}

.sc-btn--primary {
  background: var(--gradient-cta);
  color: white;
  flex: 1.4;
}

.sc-btn--secondary {
  background: var(--color-bg-alt);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.sticky-cta-enter-active,
.sticky-cta-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.sticky-cta-enter-from,
.sticky-cta-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
