import { onMounted, onUnmounted, watch, nextTick, type Ref } from 'vue'
import { useGsap } from './useGsap'

type RevealType = 'fade-up' | 'fade-left' | 'fade-right' | 'fade-down' | 'scale-in' | 'blur-in' | 'clip-up'

const REVEAL_PRESETS: Record<RevealType, gsap.TweenVars> = {
  'fade-up': { y: 40, opacity: 0 },
  'fade-down': { y: -40, opacity: 0 },
  'fade-left': { x: -60, opacity: 0 },
  'fade-right': { x: 60, opacity: 0 },
  'scale-in': { scale: 0.85, opacity: 0 },
  'blur-in': { opacity: 0, filter: 'blur(12px)' },
  'clip-up': { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
}

const REVEAL_TARGETS: Record<RevealType, gsap.TweenVars> = {
  'fade-up': { y: 0, opacity: 1 },
  'fade-down': { y: 0, opacity: 1 },
  'fade-left': { x: 0, opacity: 1 },
  'fade-right': { x: 0, opacity: 1 },
  'scale-in': { scale: 1, opacity: 1 },
  'blur-in': { opacity: 1, filter: 'blur(0px)' },
  'clip-up': { clipPath: 'inset(0% 0 0 0)', opacity: 1 },
}

/**
 * @param routePath — reactive route path; when it changes the composable
 *                     kills old ScrollTriggers and re-scans the new page DOM.
 */
export function useScrollReveal(routePath?: Ref<string> | (() => string)) {
  const triggers: ScrollTrigger[] = []
  let legacyObserver: IntersectionObserver | null = null

  function cleanup() {
    triggers.forEach((st) => st.kill())
    triggers.length = 0
    legacyObserver?.disconnect()
    legacyObserver = null
  }

  function init() {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal, .reveal-stagger, [data-reveal]').forEach((el) => {
        el.classList.add('is-visible')
        ;(el as HTMLElement).style.opacity = '1'
        ;(el as HTMLElement).style.transform = 'none'
        ;(el as HTMLElement).style.filter = 'none'
        ;(el as HTMLElement).style.clipPath = 'none'
      })
      return
    }

    const { gsap, ScrollTrigger } = useGsap()

    // GSAP-powered [data-reveal] elements
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const type = (el.getAttribute('data-reveal') || 'fade-up') as RevealType
      const delay = parseFloat(el.getAttribute('data-reveal-delay') || '0') / 1000
      const preset = REVEAL_PRESETS[type] || REVEAL_PRESETS['fade-up']
      const target = REVEAL_TARGETS[type] || REVEAL_TARGETS['fade-up']

      gsap.set(el, preset)

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(el, {
            ...target,
            duration: 0.8,
            delay,
            ease: 'power3.out',
          })
        },
      })
      triggers.push(st)
    })

    // GSAP-powered [data-stagger] containers
    document.querySelectorAll('[data-stagger]').forEach((container) => {
      const type = (container.getAttribute('data-stagger') || 'fade-up') as RevealType
      const children = Array.from(container.children) as HTMLElement[]
      const preset = REVEAL_PRESETS[type] || REVEAL_PRESETS['fade-up']
      const target = REVEAL_TARGETS[type] || REVEAL_TARGETS['fade-up']

      gsap.set(children, preset)

      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(children, {
            ...target,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
          })
        },
      })
      triggers.push(st)
    })

    // Legacy CSS .reveal + .reveal-stagger support (backward compat)
    legacyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            legacyObserver?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    document.querySelectorAll('.reveal:not([data-reveal]), .reveal-stagger:not([data-stagger])').forEach((el) => {
      legacyObserver!.observe(el)
    })

    ScrollTrigger.refresh()
  }

  onMounted(() => init())

  // Re-initialise when route changes (SPA navigation)
  if (routePath) {
    watch(routePath, async () => {
      cleanup()
      // Wait for new page DOM to be mounted after page transition
      await nextTick()
      // Extra frame to ensure page-fade transition has rendered new elements
      requestAnimationFrame(() => init())
    })
  }

  onUnmounted(() => cleanup())
}
