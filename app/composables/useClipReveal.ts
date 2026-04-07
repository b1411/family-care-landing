import { onMounted, onUnmounted } from 'vue'
import { useGsap } from './useGsap'

/**
 * Clip-path reveal transitions for sections marked with [data-clip-reveal].
 * 
 * data-clip-reveal="circle"   → circle expanding from center
 * data-clip-reveal="inset"    → inset shrinking to reveal
 * data-clip-reveal="wipe-up"  → wipe from bottom to top
 * data-clip-reveal="wipe-left" → wipe from right to left
 */
export function useClipReveal() {
  const triggers: ScrollTrigger[] = []

  const CLIP_PRESETS: Record<string, { from: string; to: string }> = {
    circle: {
      from: 'circle(0% at 50% 50%)',
      to: 'circle(100% at 50% 50%)',
    },
    inset: {
      from: 'inset(8% 8% 8% 8% round 24px)',
      to: 'inset(0% 0% 0% 0% round 0px)',
    },
    'wipe-up': {
      from: 'inset(100% 0% 0% 0%)',
      to: 'inset(0% 0% 0% 0%)',
    },
    'wipe-left': {
      from: 'inset(0% 0% 0% 100%)',
      to: 'inset(0% 0% 0% 0%)',
    },
  }

  onMounted(() => {
    if (!import.meta.client) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const { gsap, ScrollTrigger } = useGsap()

    document.querySelectorAll<HTMLElement>('[data-clip-reveal]').forEach((el) => {
      const type = el.dataset.clipReveal || 'inset'
      const preset = CLIP_PRESETS[type] || CLIP_PRESETS.inset!

      gsap.set(el, { clipPath: preset!.from })

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        end: 'top 20%',
        onEnter: () => {
          gsap.to(el, {
            clipPath: preset!.to,
            duration: 1.2,
            ease: 'power3.inOut',
          })
        },
        once: true,
      })

      triggers.push(st)
    })
  })

  onUnmounted(() => {
    triggers.forEach((st) => st.kill())
    triggers.length = 0
  })
}
