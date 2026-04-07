import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { useGsap } from './useGsap'

interface CountUpOptions {
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
  separator?: string
  decimals?: number
  enablePulse?: boolean
}

export function useCountUp(
  elRef: Ref<HTMLElement | null>,
  target: number,
  options?: CountUpOptions
) {
  const duration = options?.duration ?? 2
  const delayTime = options?.delay ?? 0
  const prefix = options?.prefix ?? ''
  const suffix = options?.suffix ?? ''
  const separator = options?.separator ?? ' '
  const decimals = options?.decimals ?? 0
  const enablePulse = options?.enablePulse ?? true

  const displayValue = ref(`${prefix}0${suffix}`)
  const hasAnimated = ref(false)
  let observer: IntersectionObserver | null = null

  function formatNumber(val: number): string {
    const fixed = val.toFixed(decimals)
    const [intPart, decPart] = fixed.split('.')
    const formatted = (intPart ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return `${prefix}${decPart ? `${formatted}.${decPart}` : formatted}${suffix}`
  }

  onMounted(() => {
    if (!elRef.value) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      displayValue.value = formatNumber(target)
      hasAnimated.value = true
      return
    }

    const { gsap } = useGsap()
    const obj = { val: 0 }

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated.value) {
          hasAnimated.value = true
          observer?.disconnect()

          gsap.to(obj, {
            val: target,
            duration,
            delay: delayTime,
            ease: 'power2.out',
            onUpdate: () => {
              displayValue.value = formatNumber(obj.val)
              if (elRef.value) elRef.value.textContent = displayValue.value
            },
            onComplete: () => {
              displayValue.value = formatNumber(target)
              if (elRef.value) {
                elRef.value.textContent = displayValue.value
                if (enablePulse) {
                  elRef.value.classList.add('number-pulse')
                  setTimeout(() => elRef.value?.classList.remove('number-pulse'), 600)
                }
              }
            },
          })
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(elRef.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { displayValue, hasAnimated }
}
