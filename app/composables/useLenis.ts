import Lenis from 'lenis'
import { useGsap } from './useGsap'

let lenisInstance: Lenis | null = null

export function useLenis() {
  if (!import.meta.client) return { lenis: null }

  if (!lenisInstance) {
    const { gsap, ScrollTrigger } = useGsap()

    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
      infinite: false,
    })

    // Connect Lenis → GSAP ScrollTrigger
    lenisInstance.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time: number) => {
      lenisInstance?.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)
  }

  return { lenis: lenisInstance }
}
