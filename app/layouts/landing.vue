<template>
  <div class="landing-layout">
    <a href="#main-content" class="skip-to-content">Перейти к содержимому</a>
    <div ref="scrollProgressRef" class="scroll-progress" />
    <LandingNavBar />
    <main id="main-content" tabindex="-1">
      <slot />
    </main>
    <LandingFooterSection />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const scrollProgressRef = ref<HTMLElement | null>(null)

// Lenis smooth scroll — silk-smooth scrolling
const { lenis } = useLenis()

// Global scroll reveal for all pages — re-initialises on route change
useScrollReveal(() => route.path)

// Parallax layers — elements with data-speed attribute
useParallax()

// Clip-path reveal transitions — elements with data-clip-reveal
useClipReveal()

// 3D tilt on elements with data-tilt attribute
useTilt()

// Scroll to top on page change
watch(() => route.path, () => {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true })
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
})

onMounted(() => {
  if (!scrollProgressRef.value) return

  function updateProgress() {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = docHeight > 0 ? scrollTop / docHeight : 0
    if (scrollProgressRef.value) {
      scrollProgressRef.value.style.transform = `scaleX(${progress})`
    }
  }

  window.addEventListener('scroll', updateProgress, { passive: true })
  updateProgress()
})
</script>

<style scoped>
.landing-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

main {
  flex: 1;
}

/* Skip to content — a11y TZ §5.2 */
.skip-to-content {
  position: absolute;
  top: -100px;
  left: 16px;
  z-index: 1000;
  padding: 10px 18px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 600;
  text-decoration: none;
  transition: top 0.2s ease;
}

.skip-to-content:focus {
  top: 16px;
  outline: 3px solid var(--color-primary-light);
  outline-offset: 2px;
}
</style>
