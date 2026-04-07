import { onMounted, onUnmounted, type Ref } from 'vue'

interface TiltOptions {
  /** Max rotation in degrees */
  max?: number
  /** Perspective distance */
  perspective?: number
  /** Transition speed */
  speed?: number
  /** Scale on hover */
  scale?: number
  /** Glare effect */
  glare?: boolean
  glareOpacity?: number
}

/**
 * Apply 3D cursor-following tilt effect to elements.
 * Can be used on a single ref or applied to all [data-tilt] elements.
 */
export function useTilt(
  elRef?: Ref<HTMLElement | null>,
  options: TiltOptions = {},
) {
  const {
    max = 8,
    perspective = 1000,
    speed = 400,
    scale = 1.02,
    glare = true,
    glareOpacity = 0.12,
  } = options

  const cleanups: (() => void)[] = []

  function applyTilt(el: HTMLElement) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    el.style.transformStyle = 'preserve-3d'
    el.style.transition = `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`

    let glareEl: HTMLElement | null = null
    if (glare) {
      glareEl = document.createElement('div')
      glareEl.style.cssText = `
        position: absolute; inset: 0; pointer-events: none;
        border-radius: inherit; overflow: hidden; z-index: 1;
        opacity: 0; transition: opacity 300ms ease;
      `
      const glareInner = document.createElement('div')
      glareInner.style.cssText = `
        position: absolute; width: 200%; height: 200%;
        top: -50%; left: -50%;
        background: linear-gradient(
          0deg,
          rgba(255,255,255,0) 0%,
          rgba(255,255,255,${glareOpacity}) 100%
        );
        transform: rotate(180deg);
        transition: transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99);
      `
      glareEl.appendChild(glareInner)
      el.style.position = 'relative'
      el.style.overflow = 'hidden'
      el.appendChild(glareEl)
    }

    function onMouseMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const rotateX = (max * (0.5 - y)).toFixed(2)
      const rotateY = (max * (x - 0.5)).toFixed(2)

      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`

      if (glareEl) {
        glareEl.style.opacity = '1'
        const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI)
        const inner = glareEl.firstElementChild as HTMLElement
        if (inner) inner.style.transform = `rotate(${angle + 180}deg)`
      }
    }

    function onMouseLeave() {
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
      if (glareEl) glareEl.style.opacity = '0'
    }

    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseleave', onMouseLeave)

    cleanups.push(() => {
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
      if (glareEl && el.contains(glareEl)) el.removeChild(glareEl)
    })
  }

  onMounted(() => {
    if (!import.meta.client) return

    if (elRef?.value) {
      applyTilt(elRef.value)
    }

    // Auto-apply to all [data-tilt] elements
    document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
      const elMax = parseFloat(el.dataset.tilt || String(max))
      applyTilt(el)
    })
  })

  onUnmounted(() => {
    cleanups.forEach((fn) => fn())
    cleanups.length = 0
  })
}
