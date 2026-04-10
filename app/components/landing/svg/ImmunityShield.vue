<template>
  <div ref="root" class="immunity-shield">
    <svg viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg" class="shield-svg">
      <defs>
        <clipPath id="shield-fill-clip">
          <rect x="0" :y="150 - fillHeight" width="120" :height="fillHeight">
            <animate v-if="false" />
          </rect>
        </clipPath>
        <linearGradient id="shield-grad" x1="60" y1="140" x2="60" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="var(--color-primary, #8B7EC8)" />
          <stop offset="100%" stop-color="var(--color-accent-blue, #A8C8E8)" />
        </linearGradient>
      </defs>

      <!-- Shield fill (clipped) -->
      <path
        :d="shieldPath"
        fill="url(#shield-grad)"
        opacity="0.25"
        clip-path="url(#shield-fill-clip)"
      />

      <!-- Shield outline -->
      <path
        :d="shieldPath"
        stroke="var(--color-primary, #8B7EC8)"
        stroke-width="2.5"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        :class="{ complete: isComplete }"
        class="shield-outline"
      />

      <!-- Checkmark (shown when complete) -->
      <path
        v-if="isComplete"
        d="M40 75 L55 90 L82 58"
        stroke="var(--color-success, #4CAF50)"
        stroke-width="4"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="check-mark"
      />

      <!-- Glow ring when complete -->
      <circle
        v-if="isComplete"
        cx="60"
        cy="75"
        r="55"
        stroke="var(--color-success, #4CAF50)"
        stroke-width="1.5"
        fill="none"
        class="glow-ring"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const shieldPath = 'M60 8 L108 30 C108 30 110 80 100 105 C90 125 60 142 60 142 C60 142 30 125 20 105 C10 80 12 30 12 30 Z'

const fillHeight = ref(0)
const isComplete = computed(() => fillHeight.value >= 145)

const root = ref<HTMLElement | null>(null)
let cleanup: (() => void) | null = null

onMounted(() => {
  if (!root.value) return
  const { gsap, ScrollTrigger } = useGsap()
  if (!gsap || !ScrollTrigger) return

  const isMobile = window.matchMedia('(max-width: 768px)').matches

  if (isMobile) {
    // Simple appear on mobile — animate fill once
    const trigger = ScrollTrigger.create({
      trigger: root.value,
      start: 'top 75%',
      once: true,
      onEnter() {
        gsap.to(fillHeight, { value: 150, duration: 1.5, ease: 'power2.out' })
      },
    })
    cleanup = () => trigger.kill()
    return
  }

  const trigger = ScrollTrigger.create({
    trigger: root.value,
    start: 'top 80%',
    end: 'bottom 20%',
    scrub: 0.5,
    onUpdate: (self: any) => {
      fillHeight.value = self.progress * 150
    },
  })

  cleanup = () => trigger.kill()
})

onUnmounted(() => cleanup?.())
</script>

<style scoped>
.immunity-shield {
  display: flex;
  justify-content: center;
}

.shield-svg {
  width: 140px;
  height: auto;
}

.shield-outline {
  transition: stroke 0.4s ease;
}

.shield-outline.complete {
  stroke: var(--color-success, #4CAF50);
  filter: drop-shadow(0 0 8px rgba(76, 175, 80, 0.4));
}

.check-mark {
  animation: draw-check 0.5s ease forwards;
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
}

@keyframes draw-check {
  to { stroke-dashoffset: 0; }
}

.glow-ring {
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0; transform: scale(1.15); }
}
</style>
