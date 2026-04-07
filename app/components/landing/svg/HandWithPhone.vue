<template>
  <div ref="root" class="hand-with-phone">
    <svg viewBox="0 85 220 225" fill="none" xmlns="http://www.w3.org/2000/svg" class="hand-svg">
      <!-- Hand outline -->
      <g class="hand-group" opacity="0">
        <path
          d="M70 310 C62 302 54 288 52 272 L52 230 C52 222 56 218 62 218 L64 218
             C64 208 68 200 76 200 L78 200
             C78 190 84 182 92 182 L94 182
             C94 174 100 168 108 168 L112 168
             C120 168 126 174 126 182 L126 210
             L156 210 C164 210 170 216 170 222 L170 272
             C170 288 162 302 154 310 Z"
          stroke="var(--color-text-muted, #9CA3AF)"
          stroke-width="2"
          fill="var(--color-surface, #F8F5F0)"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>

      <!-- Phone in hand -->
      <g class="phone-group" opacity="0">
        <rect x="58" y="100" width="106" height="190" rx="12" fill="white" stroke="var(--color-border, #E5E0DA)" stroke-width="2" />
        <!-- Screen area -->
        <rect x="64" y="112" width="94" height="166" rx="4" fill="var(--color-surface, #F8F5F0)" class="phone-screen" opacity="0" />
      </g>

      <!-- Screen content -->
      <g class="screen-content" opacity="0">
        <!-- Header -->
        <text x="72" y="132" font-size="8" font-weight="700" fill="var(--color-text-primary, #1A1A2E)">Ваш малыш: 4 мес. 12 дней</text>

        <!-- Event cards -->
        <g class="event-card event-1" opacity="0">
          <rect x="68" y="140" width="86" height="28" rx="4" fill="white" stroke="var(--color-border, #E5E0DA)" stroke-width="0.8" />
          <circle cx="78" cy="154" r="4" fill="var(--color-success, #4CAF50)" />
          <text x="86" y="152" font-size="6.5" fill="var(--color-text-primary, #1A1A2E)">Витамин D — 08:00</text>
          <text x="86" y="160" font-size="5.5" fill="var(--color-text-muted, #9CA3AF)">Принято ✓</text>
        </g>

        <g class="event-card event-2" opacity="0">
          <rect x="68" y="172" width="86" height="28" rx="4" fill="white" stroke="var(--color-primary, #8B7EC8)" stroke-width="0.8" />
          <circle cx="78" cy="186" r="4" fill="var(--color-primary, #8B7EC8)" />
          <text x="86" y="184" font-size="6.5" fill="var(--color-text-primary, #1A1A2E)">Педиатр — 14:00</text>
          <text x="86" y="192" font-size="5.5" fill="var(--color-primary, #8B7EC8)">Сегодня</text>
        </g>

        <g class="event-card event-3" opacity="0">
          <rect x="68" y="204" width="86" height="28" rx="4" fill="white" stroke="var(--color-border, #E5E0DA)" stroke-width="0.8" />
          <circle cx="78" cy="218" r="4" fill="var(--color-border, #E5E0DA)" />
          <text x="86" y="216" font-size="6.5" fill="var(--color-text-secondary, #6B7280)">Анализ крови</text>
          <text x="86" y="224" font-size="5.5" fill="var(--color-text-muted, #9CA3AF)">Через 3 дня</text>
        </g>

        <!-- Notification banner -->
        <g class="notification" opacity="0">
          <rect x="68" y="238" width="86" height="24" rx="4" fill="var(--color-success, #4CAF50)" />
          <text x="80" y="253" font-size="6" font-weight="600" fill="white">Витамин D3 — 08:00 ✓</text>
        </g>
      </g>

      <!-- Confetti particles -->
      <g class="confetti" opacity="0">
        <circle cx="120" cy="244" r="2" fill="var(--color-primary, #8B7EC8)" class="conf-1" />
        <circle cx="130" cy="240" r="1.5" fill="var(--color-secondary, #E8A0BF)" class="conf-2" />
        <circle cx="140" cy="248" r="2" fill="var(--color-accent-warm, #F2C4A0)" class="conf-3" />
        <circle cx="112" cy="236" r="1.5" fill="var(--color-success, #4CAF50)" class="conf-4" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const root = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(async () => {
  if (!root.value) return
  const { gsap } = await import('gsap')

  const tl = gsap.timeline({ paused: true })

  // 1. Hand slides up
  tl.to('.hand-group', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0)
    .from('.hand-group', { y: 60, duration: 0.6, ease: 'power2.out' }, 0)

  // 2. Phone appears
    .to('.phone-group', { opacity: 1, duration: 0.3 }, 0.3)

  // 3. Screen lights up
    .to('.phone-screen', { opacity: 1, duration: 0.3 }, 0.6)

  // 4. Screen content
    .to('.screen-content', { opacity: 1, duration: 0.3 }, 0.9)

  // 5. Event cards stagger
    .to('.event-1', { opacity: 1, x: 0, duration: 0.25 }, 1.0)
    .from('.event-1', { x: 15, duration: 0.25 }, 1.0)
    .to('.event-2', { opacity: 1, x: 0, duration: 0.25 }, 1.15)
    .from('.event-2', { x: 15, duration: 0.25 }, 1.15)
    .to('.event-3', { opacity: 1, x: 0, duration: 0.25 }, 1.3)
    .from('.event-3', { x: 15, duration: 0.25 }, 1.3)

  // 6. Notification slides in
    .to('.notification', { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.5)' }, 1.6)
    .from('.notification', { y: -10, duration: 0.3 }, 1.6)

  // 7. Confetti
    .to('.confetti', { opacity: 1, duration: 0.15 }, 2.0)
    .to('.conf-1', { x: -15, y: -20, opacity: 0, duration: 0.5 }, 2.1)
    .to('.conf-2', { x: 10, y: -25, opacity: 0, duration: 0.5 }, 2.15)
    .to('.conf-3', { x: 20, y: -10, opacity: 0, duration: 0.5 }, 2.2)
    .to('.conf-4', { x: -20, y: -15, opacity: 0, duration: 0.5 }, 2.25)

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        tl.play()
        observer?.disconnect()
      }
    },
    { threshold: 0.3 },
  )
  observer.observe(root.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.hand-with-phone {
  display: flex;
  justify-content: center;
}

.hand-svg {
  width: 100%;
  max-width: 220px;
  height: auto;
}
</style>
