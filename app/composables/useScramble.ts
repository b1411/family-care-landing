/**
 * Number scramble effect — "departure board" style.
 * Cycles through random digits before settling on the target value.
 */
import { useGsap } from './useGsap'

interface ScrambleOptions {
  /** Duration of the full animation in seconds */
  duration?: number
  /** Characters used during scramble phase */
  chars?: string
  /** How many scramble ticks per character before resolving */
  revealSpeed?: number
}

export function useScramble(
  elRef: Ref<HTMLElement | null>,
  text: string,
  options?: ScrambleOptions,
) {
  const duration = options?.duration ?? 1.5
  const chars = options?.chars ?? '0123456789₸%+×−/'
  const revealSpeed = options?.revealSpeed ?? 3

  let observer: IntersectionObserver | null = null
  let hasAnimated = false

  function scramble(el: HTMLElement) {
    const target = text
    const len = target.length
    let frame = 0
    const totalFrames = len * revealSpeed

    const { gsap } = useGsap()

    const obj = { progress: 0 }
    gsap.to(obj, {
      progress: 1,
      duration,
      ease: 'power2.inOut',
      onUpdate() {
        frame = Math.floor(obj.progress * totalFrames)
        const revealed = Math.floor(frame / revealSpeed)
        let output = ''

        for (let i = 0; i < len; i++) {
          if (i < revealed) {
            output += target[i]
          } else if (target[i] === ' ' || target[i] === '.' || target[i] === ',') {
            output += target[i]
          } else {
            output += chars[Math.floor(Math.random() * chars.length)]
          }
        }
        el.textContent = output
      },
      onComplete() {
        el.textContent = target
      },
    })
  }

  onMounted(() => {
    if (!elRef.value) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elRef.value.textContent = text
      return
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasAnimated) {
          hasAnimated = true
          observer?.disconnect()
          scramble(elRef.value!)
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(elRef.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })
}
