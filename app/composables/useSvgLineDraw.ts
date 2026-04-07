import { onMounted, onUnmounted, type Ref } from 'vue'
import { useGsap } from './useGsap'

export function useSvgLineDraw(
  containerRef: Ref<HTMLElement | null>,
  options?: {
    selector?: string
    duration?: number
    stagger?: number
    start?: string
    end?: string
  }
) {
  const triggers: ScrollTrigger[] = []

  onMounted(() => {
    if (!containerRef.value) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Show all paths immediately
      containerRef.value.querySelectorAll(options?.selector || '.svg-draw-path').forEach((path) => {
        ;(path as SVGPathElement).style.strokeDashoffset = '0'
      })
      return
    }

    const { gsap, ScrollTrigger } = useGsap()
    const paths = containerRef.value.querySelectorAll(options?.selector || '.svg-draw-path')

    paths.forEach((path, index) => {
      const svgPath = path as SVGPathElement
      const length = svgPath.getTotalLength()

      gsap.set(svgPath, {
        strokeDasharray: length,
        strokeDashoffset: length,
      })

      const st = ScrollTrigger.create({
        trigger: svgPath,
        start: options?.start || 'top 85%',
        end: options?.end || 'bottom 20%',
        onEnter: () => {
          gsap.to(svgPath, {
            strokeDashoffset: 0,
            duration: options?.duration || 1.5,
            delay: (options?.stagger || 0.2) * index,
            ease: 'power2.inOut',
          })
        },
        once: true,
      })
      triggers.push(st)
    })
  })

  onUnmounted(() => {
    triggers.forEach((st) => st.kill())
  })
}
