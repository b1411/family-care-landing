<template>
  <div ref="containerRef" class="timeline-phone-wrapper">
    <!-- Gradient blob behind phone -->
    <div class="phone-blob" />

    <!-- Floating icons -->
    <div
      v-for="(icon, i) in floatingIcons"
      :key="i"
      class="floating-icon"
      :style="{ left: `${icon.x}px`, top: `${icon.y}px`, animationDelay: `${icon.delay}s` }"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path v-if="icon.icon === 'heart'" d="M12,21 C12,21 4,14 4,8.5 C4,5 7,3 9.5,3 C11,3 12,4 12,4 C12,4 13,3 14.5,3 C17,3 20,5 20,8.5 C20,14 12,21 12,21 Z" />
        <path v-else-if="icon.icon === 'flask'" d="M9,3 L15,3 M10,3 L10,10 L5,19 C4,21 6,22 8,22 L16,22 C18,22 20,21 19,19 L14,10 L14,3" />
        <path v-else-if="icon.icon === 'calendar'" d="M4,6 L20,6 L20,20 L4,20 Z M4,6 L4,4 C4,3 5,3 5,3 L19,3 C19,3 20,3 20,4 L20,6 M8,3 L8,1 M16,3 L16,1 M4,10 L20,10" />
        <path v-else-if="icon.icon === 'bell'" d="M12,3 C8,3 6,6 6,9 L6,14 L4,17 L20,17 L18,14 L18,9 C18,6 16,3 12,3 Z M10,17 C10,19 11,20 12,20 C13,20 14,19 14,17" />
      </svg>
    </div>

    <!-- Phone frame -->
    <svg
      ref="phoneSvg"
      class="phone-svg"
      :viewBox="`0 0 ${frame.width} ${frame.height}`"
      fill="none"
    >
      <!-- Phone body -->
      <rect
        x="1" y="1"
        :width="frame.width - 2"
        :height="frame.height - 2"
        :rx="frame.rx"
        :stroke="frame.stroke"
        stroke-width="2"
        fill="#fff"
      />

      <!-- Notch -->
      <rect x="55" y="1" width="70" height="22" rx="0 0 10 10" fill="#f5f3fa" />

      <!-- Screen clip -->
      <defs>
        <clipPath :id="clipId">
          <rect x="8" y="30" :width="frame.width - 16" :height="frame.height - 60" rx="4" />
        </clipPath>
      </defs>

      <!-- Screen content -->
      <g :clip-path="`url(#${clipId})`">
        <!-- Timeline vertical line -->
        <path
          ref="timelinePath"
          data-draw
          :d="`M${frame.width / 2 - 30},45 L${frame.width / 2 - 30},300`"
          stroke="var(--color-primary-light)"
          stroke-width="2"
          stroke-linecap="round"
        />

        <!-- Event dots and labels -->
        <g
          v-for="(evt, i) in events"
          :key="i"
          class="event-group"
          :style="{ opacity: 0 }"
          :data-event-index="i"
        >
          <!-- Dot -->
          <circle
            :cx="frame.width / 2 - 30"
            :cy="evt.y"
            r="5"
            :fill="evt.color"
          />
          <!-- Icon -->
          <svg
            :x="frame.width / 2 - 30 - 8"
            :y="evt.y - 8"
            width="16" height="16"
            viewBox="0 0 16 16"
          >
            <path :d="evt.icon" :stroke="evt.color" stroke-width="1.2" fill="none" stroke-linecap="round" />
          </svg>
          <!-- Label -->
          <text
            :x="frame.width / 2 - 15"
            :y="evt.y + 4"
            font-size="10"
            font-family="Inter, sans-serif"
            fill="var(--color-text-primary)"
          >
            {{ evt.label }}
          </text>
        </g>

        <!-- Notification card -->
        <g class="notification-card" :style="{ opacity: 0 }">
          <rect x="14" y="36" :width="frame.width - 28" height="36" rx="8" fill="#f5f3fa" stroke="var(--color-primary-light)" stroke-width="1" />
          <text x="22" y="52" font-size="9" font-weight="600" font-family="Inter, sans-serif" fill="var(--color-text-primary)">{{ notification.text }}</text>
          <text x="22" y="64" font-size="8" font-family="Inter, sans-serif" fill="var(--color-text-secondary)">{{ notification.subtext }}</text>
        </g>

        <!-- Prescription pill with checkmark -->
        <g class="prescription-group" :style="{ opacity: 0 }">
          <rect x="14" :y="frame.height - 75" :width="frame.width - 28" height="32" rx="16" fill="var(--color-primary-ultralight, #F5F3FA)" stroke="var(--color-primary-light)" stroke-width="1" />
          <text x="30" :y="frame.height - 55" font-size="9" font-family="Inter, sans-serif" fill="var(--color-text-primary)">{{ prescription.text }}</text>
          <path
            ref="checkPath"
            :d="`M${frame.width - 40},${frame.height - 62} L${frame.width - 36},${frame.height - 56} L${frame.width - 28},${frame.height - 66}`"
            stroke="var(--color-success)"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
      </g>

      <!-- Home bar -->
      <rect :x="frame.width / 2 - 30" :y="frame.height - 12" width="60" height="4" rx="2" fill="var(--color-border)" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGsap } from '~/composables/useGsap'
import {
  phoneFrame,
  timelineEvents,
  notificationCard,
  prescriptionPill,
  floatingIcons,
} from '~/data/svg-paths/timeline-phone-elements'

const containerRef = ref<HTMLElement | null>(null)
const phoneSvg = ref<SVGElement | null>(null)
const timelinePath = ref<SVGPathElement | null>(null)
const checkPath = ref<SVGPathElement | null>(null)
const clipId = useId()

const frame = phoneFrame
const events = timelineEvents
const notification = notificationCard
const prescription = prescriptionPill

onMounted(() => {
  if (!phoneSvg.value || !timelinePath.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Show everything immediately
    phoneSvg.value.querySelectorAll('.event-group, .notification-card, .prescription-group').forEach(el => {
      ;(el as HTMLElement).style.opacity = '1'
    })
    return
  }

  const { gsap } = useGsap()
  const tl = gsap.timeline({ delay: 0.3 })

  // Draw timeline line
  const path = timelinePath.value
  const length = path.getTotalLength()
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
  tl.to(path, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' })

  // Reveal events one by one
  const eventGroups = phoneSvg.value.querySelectorAll('.event-group')
  eventGroups.forEach((group, i) => {
    tl.to(group, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out',
    }, 0.3 + i * 0.2)
  })

  // Notification slides down
  const notifCard = phoneSvg.value.querySelector('.notification-card')
  if (notifCard) {
    gsap.set(notifCard, { y: -20, opacity: 0 })
    tl.to(notifCard, { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }, '-=0.2')
  }

  // Prescription pill appears
  const prescGroup = phoneSvg.value.querySelector('.prescription-group')
  if (prescGroup) {
    tl.to(prescGroup, { opacity: 1, duration: 0.3 }, '-=0.1')
  }

  // Checkmark stroke draw
  if (checkPath.value) {
    const checkLen = checkPath.value.getTotalLength()
    gsap.set(checkPath.value, { strokeDasharray: checkLen, strokeDashoffset: checkLen })
    tl.to(checkPath.value, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' })
  }
})
</script>

<style scoped>
.timeline-phone-wrapper {
  position: relative;
  width: 260px;
  height: 420px;
  overflow: hidden;
}

.phone-blob {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: var(--gradient-accent);
  filter: blur(60px);
  opacity: 0.5;
  animation: blob-breathe 6s ease-in-out infinite;
  z-index: 0;
}

@keyframes blob-breathe {
  0%, 100% { transform: translate(-50%, -50%) scale(0.95); }
  50% { transform: translate(-50%, -50%) scale(1.05); }
}

.phone-svg {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 8px 32px rgba(139, 126, 200, 0.15));
}

.floating-icon {
  position: absolute;
  z-index: 2;
  animation: float-icon 3.5s ease-in-out infinite alternate;
  opacity: 0.6;
}

@keyframes float-icon {
  0% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}

@media (max-width: 768px) {
  .timeline-phone-wrapper {
    width: 200px;
    height: 340px;
  }
  .floating-icon {
    display: none;
  }
}
</style>
