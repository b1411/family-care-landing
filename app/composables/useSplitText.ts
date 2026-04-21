import { onMounted, type Ref } from 'vue'
import { useGsap } from './useGsap'

interface SplitTextOptions {
  /** Split by 'words' | 'chars' | 'lines' */
  type?: 'words' | 'chars' | 'lines'
  /** GSAP animation vars for each element */
  from?: gsap.TweenVars
  /** Stagger between elements in seconds */
  stagger?: number
  /** Total duration per element */
  duration?: number
  /** Ease function */
  ease?: string
  /** Delay before animation starts */
  delay?: number
  /** Use ScrollTrigger? */
  scroll?: boolean
  /** ScrollTrigger start position */
  scrollStart?: string
}

export function useSplitText(
  elRef: Ref<HTMLElement | null>,
  options: SplitTextOptions = {},
) {
  const {
    type = 'words',
    from = { y: '110%', opacity: 0, rotateX: -80 },
    stagger = 0.04,
    duration = 0.8,
    ease = 'power4.out',
    delay = 0,
    scroll = true,
    scrollStart = 'top 85%',
  } = options

  onMounted(() => {
    if (!import.meta.client) return
    const el = elRef.value
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const { gsap, ScrollTrigger } = useGsap()

    // Store original text — collapse whitespace so markup like <br> or
    // multi-line indentation inside the element doesn't leak as stray spaces
    // or glue sentences together after textContent strips tags.
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim()

    let elements: HTMLElement[] = []

    if (type === 'chars') {
      el.innerHTML = ''
      // Wrap each word, then each char inside it
      text.split(/(\s+)/).forEach((segment) => {
        if (/^\s+$/.test(segment)) {
          el.appendChild(document.createTextNode(segment))
          return
        }
        const wordWrap = document.createElement('span')
        wordWrap.style.display = 'inline-block'
        wordWrap.style.overflow = 'hidden'
        wordWrap.style.verticalAlign = 'top'
        segment.split('').forEach((char) => {
          const span = document.createElement('span')
          span.textContent = char
          span.style.display = 'inline-block'
          span.style.willChange = 'transform, opacity'
          wordWrap.appendChild(span)
          elements.push(span)
        })
        el.appendChild(wordWrap)
      })
    } else if (type === 'words') {
      el.innerHTML = ''
      text.split(/(\s+)/).forEach((segment) => {
        if (/^\s+$/.test(segment)) {
          el.appendChild(document.createTextNode(segment))
          return
        }
        const wrapper = document.createElement('span')
        wrapper.style.display = 'inline-block'
        wrapper.style.overflow = 'hidden'
        wrapper.style.verticalAlign = 'top'
        const inner = document.createElement('span')
        inner.textContent = segment
        inner.style.display = 'inline-block'
        inner.style.willChange = 'transform, opacity'
        wrapper.appendChild(inner)
        el.appendChild(wrapper)
        elements.push(inner)
      })
    } else {
      // lines — keep original, wrap in line containers
      // For simplicity, treat as words
      el.innerHTML = ''
      text.split(/(\s+)/).forEach((segment) => {
        if (/^\s+$/.test(segment)) {
          el.appendChild(document.createTextNode(segment))
          return
        }
        const wrapper = document.createElement('span')
        wrapper.style.display = 'inline-block'
        wrapper.style.overflow = 'hidden'
        wrapper.style.verticalAlign = 'top'
        const inner = document.createElement('span')
        inner.textContent = segment
        inner.style.display = 'inline-block'
        inner.style.willChange = 'transform, opacity'
        wrapper.appendChild(inner)
        el.appendChild(wrapper)
        elements.push(inner)
      })
    }

    // Set initial state
    gsap.set(elements, from)

    // Build target — inverse of from
    const to: gsap.TweenVars = {
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration,
      stagger,
      ease,
      delay,
    }

    if (scroll) {
      ScrollTrigger.create({
        trigger: el,
        start: scrollStart,
        once: true,
        onEnter: () => {
          gsap.to(elements, to)
        },
      })
    } else {
      gsap.to(elements, to)
    }
  })
}
