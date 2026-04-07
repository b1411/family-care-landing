import { onMounted, onUnmounted } from 'vue'
import { useGsap } from './useGsap'

/**
 * Applies scroll-linked parallax to all elements with [data-speed].
 * data-speed="0.5" → moves at half scroll speed (background feel)
 * data-speed="-0.3" → moves opposite direction
 * data-speed="1.5" → moves faster than scroll
 */
export function useParallax() {
  const triggers: ScrollTrigger[] = []

  onMounted(() => {
    if (!import.meta.client) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Skip on mobile — parallax hurts performance on touch
    if (window.innerWidth < 768) return

    const { gsap, ScrollTrigger } = useGsap()

    document.querySelectorAll<HTMLElement>('[data-speed]').forEach((el) => {
      const speed = parseFloat(el.dataset.speed || '0')
      if (speed === 0) return

      const st = gsap.to(el, {
        y: () => speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })

      if (st.scrollTrigger) {
        triggers.push(st.scrollTrigger)
      }
    })
  })

  onUnmounted(() => {
    triggers.forEach((st) => st.kill())
    triggers.length = 0
  })
}
