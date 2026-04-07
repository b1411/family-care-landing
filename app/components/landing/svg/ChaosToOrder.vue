<template>
  <div ref="containerRef" class="chaos-order-wrapper">
    <!-- Chaos side (family problems) -->
    <div ref="chaosRef" class="chaos-side">
      <svg viewBox="0 0 200 200" class="chaos-svg" fill="none">
        <!-- Scattered paper -->
        <rect class="chaos-el" x="30" y="40" width="40" height="50" rx="3" stroke="var(--color-danger)" stroke-width="1.5" transform="rotate(15, 50, 65)" />
        <line class="chaos-el" x1="38" y1="52" x2="62" y2="52" stroke="var(--color-danger)" stroke-width="1" opacity="0.5" transform="rotate(15, 50, 65)" />
        <line class="chaos-el" x1="38" y1="60" x2="58" y2="60" stroke="var(--color-danger)" stroke-width="1" opacity="0.5" transform="rotate(15, 50, 65)" />

        <!-- Phone with multiple chats -->
        <rect class="chaos-el" x="120" y="30" width="35" height="60" rx="6" stroke="var(--color-warning)" stroke-width="1.5" transform="rotate(-10, 137, 60)" />
        <rect x="126" y="42" width="23" height="4" rx="1" fill="var(--color-warning)" opacity="0.3" transform="rotate(-10, 137, 60)" />
        <rect x="126" y="49" width="23" height="4" rx="1" fill="var(--color-warning)" opacity="0.3" transform="rotate(-10, 137, 60)" />
        <rect x="126" y="56" width="23" height="4" rx="1" fill="var(--color-warning)" opacity="0.3" transform="rotate(-10, 137, 60)" />
        <rect x="126" y="63" width="23" height="4" rx="1" fill="var(--color-warning)" opacity="0.3" transform="rotate(-10, 137, 60)" />
        <rect x="126" y="70" width="23" height="4" rx="1" fill="var(--color-warning)" opacity="0.3" transform="rotate(-10, 137, 60)" />

        <!-- Pills scattered -->
        <ellipse class="chaos-el" cx="80" cy="140" rx="12" ry="6" stroke="var(--color-danger)" stroke-width="1.5" transform="rotate(25, 80, 140)" />
        <ellipse class="chaos-el" cx="50" cy="160" rx="12" ry="6" stroke="var(--color-danger)" stroke-width="1.5" transform="rotate(-15, 50, 160)" />
        <ellipse class="chaos-el" cx="140" cy="150" rx="12" ry="6" stroke="var(--color-danger)" stroke-width="1.5" transform="rotate(40, 140, 150)" />

        <!-- Calendar with X -->
        <rect class="chaos-el" x="100" y="110" width="45" height="40" rx="3" stroke="var(--color-danger)" stroke-width="1.5" />
        <line class="chaos-el" x1="108" y1="118" x2="137" y2="142" stroke="var(--color-danger)" stroke-width="2" />
        <line class="chaos-el" x1="137" y1="118" x2="108" y2="142" stroke="var(--color-danger)" stroke-width="2" />
      </svg>
    </div>

    <!-- Arrow transition -->
    <div ref="arrowRef" class="arrow-transition">
      <svg viewBox="0 0 60 40" fill="none" class="arrow-svg">
        <path
          data-draw
          d="M5,20 L45,20 M38,12 L48,20 L38,28"
          stroke="var(--color-primary)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- Order side (with platform) -->
    <div ref="orderRef" class="order-side">
      <svg viewBox="0 0 200 200" class="order-svg" fill="none">
        <!-- Papers in folder -->
        <rect class="order-el" x="60" y="30" width="80" height="50" rx="3" stroke="var(--color-primary)" stroke-width="1.5" />
        <rect class="order-el" x="65" y="25" width="70" height="10" rx="3" stroke="var(--color-primary)" stroke-width="1.5" fill="var(--color-primary-ultralight, #F5F3FA)" />
        <line class="order-el" x1="72" y1="45" x2="128" y2="45" stroke="var(--color-primary)" stroke-width="1" opacity="0.5" />
        <line class="order-el" x1="72" y1="55" x2="120" y2="55" stroke="var(--color-primary)" stroke-width="1" opacity="0.5" />
        <line class="order-el" x1="72" y1="65" x2="115" y2="65" stroke="var(--color-primary)" stroke-width="1" opacity="0.5" />

        <!-- Phone with single clean screen -->
        <rect class="order-el" x="75" y="95" width="50" height="80" rx="8" stroke="var(--color-primary)" stroke-width="1.5" />
        <rect class="order-el" x="82" y="110" width="36" height="5" rx="2" fill="var(--color-primary)" opacity="0.2" />
        <rect class="order-el" x="82" y="120" width="36" height="5" rx="2" fill="var(--color-primary)" opacity="0.15" />
        <rect class="order-el" x="82" y="130" width="36" height="5" rx="2" fill="var(--color-primary)" opacity="0.1" />
        <!-- Checkmark badge -->
        <circle class="order-el" cx="130" cy="100" r="10" fill="var(--color-success)" opacity="0.15" />
        <path class="order-el" d="M125,100 L128,103 L135,96" stroke="var(--color-success)" stroke-width="2" fill="none" stroke-linecap="round" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGsap } from '~/composables/useGsap'

const containerRef = ref<HTMLElement | null>(null)
const chaosRef = ref<HTMLElement | null>(null)
const orderRef = ref<HTMLElement | null>(null)
const arrowRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!containerRef.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const { gsap, ScrollTrigger } = useGsap()

  const chaosEls = chaosRef.value?.querySelectorAll('.chaos-el')
  const orderEls = orderRef.value?.querySelectorAll('.order-el')

  // Set initial: chaos elements at center, order elements at random positions
  if (chaosEls) {
    gsap.set(chaosEls, { opacity: 0, scale: 0.5 })
  }
  if (orderEls) {
    gsap.set(orderEls, { opacity: 0, x: () => (Math.random() - 0.5) * 80, y: () => (Math.random() - 0.5) * 80 })
  }
  if (arrowRef.value) {
    gsap.set(arrowRef.value, { opacity: 0, scale: 0.8 })
  }

  ScrollTrigger.create({
    trigger: containerRef.value,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline()

      // Chaos: explode outward
      if (chaosEls) {
        tl.to(chaosEls, {
          opacity: 1,
          scale: 1,
          x: () => (Math.random() - 0.5) * 30,
          y: () => (Math.random() - 0.5) * 20,
          rotation: () => (Math.random() - 0.5) * 15,
          duration: 0.6,
          stagger: 0.05,
          ease: 'back.out(1.2)',
        })
      }

      // Arrow appears
      if (arrowRef.value) {
        tl.to(arrowRef.value, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }, '-=0.2')
      }

      // Order: converge to aligned positions
      if (orderEls) {
        tl.to(orderEls, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.5,
          stagger: 0.04,
          ease: 'power2.out',
        }, '-=0.3')
      }
    },
  })
})
</script>

<style scoped>
.chaos-order-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px 0;
}

.chaos-side,
.order-side {
  flex: 1;
  max-width: 240px;
}

.chaos-svg,
.order-svg {
  width: 100%;
  height: auto;
}

.arrow-transition {
  flex-shrink: 0;
  width: 60px;
}

.arrow-svg {
  width: 100%;
  height: auto;
}

@media (max-width: 768px) {
  .chaos-order-wrapper {
    flex-direction: column;
    gap: 8px;
  }
  .arrow-transition {
    transform: rotate(90deg);
    width: 40px;
  }
  .chaos-side,
  .order-side {
    max-width: 180px;
  }
}
</style>
