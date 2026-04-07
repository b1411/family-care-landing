import { ref, readonly, type Ref } from 'vue'
import { useGsap } from './useGsap'

export function useMorph(
  pathRef: Ref<SVGPathElement | null>,
  states: string[],
  options?: { duration?: number; ease?: string }
) {
  const currentState = ref(0)
  const { gsap } = useGsap()

  function morphTo(stateIndex: number) {
    if (stateIndex === currentState.value || !pathRef.value) return
    if (stateIndex < 0 || stateIndex >= states.length) return

    gsap.to(pathRef.value, {
      attr: { d: states[stateIndex] },
      duration: options?.duration ?? 0.8,
      ease: options?.ease ?? 'power2.inOut',
    })
    currentState.value = stateIndex
  }

  function morphByProgress(progress: number) {
    const index = Math.min(
      Math.floor(progress * states.length),
      states.length - 1
    )
    morphTo(index)
  }

  return {
    morphTo,
    morphByProgress,
    currentState: readonly(currentState),
  }
}
