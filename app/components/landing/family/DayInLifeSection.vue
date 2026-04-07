<template>
  <section id="day-in-life" class="day-section landing-section">
    <div class="landing-container">
      <div class="day-header" data-reveal="fade-up">
        <span class="landing-badge">Один день</span>
        <h2 ref="dayTitleRef" class="font-display">День с приложением</h2>
        <p class="day-subtitle">Посмотрите, как обычный день мамы становится спокойнее</p>
      </div>

      <div ref="timelineRef" class="timeline">
        <!-- Vertical draw line -->
        <div class="timeline-line-wrap">
          <div class="timeline-line-bg" />
          <div ref="lineRef" class="timeline-line-fill" />
        </div>

        <div
          v-for="(ev, i) in events"
          :key="ev.time"
          :class="['tl-row', { 'is-active': activeIndex >= i }]"
        >
          <div class="tl-dot-wrap">
            <div class="tl-dot" />
            <div v-if="activeIndex >= i" class="tl-dot-ring" />
          </div>
          <div class="tl-card landing-card">
            <div class="tl-time-badge">{{ ev.time }}</div>
            <div class="tl-icon-text">
              <div class="tl-icon-circle" :style="{ '--icon-color': ev.color }">
                <svg class="tl-mini-svg" width="22" height="22" viewBox="0 0 28 28" v-html="ev.svg" />
              </div>
              <div>
                <h4>{{ ev.title }}</h4>
                <p>{{ ev.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Adherence final block -->
        <div :class="['tl-final', { glow: activeIndex >= events.length - 1 }]">
          <div class="final-check">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="none" stroke="var(--color-success, #22C55E)" stroke-width="2" :stroke-dasharray="88" :stroke-dashoffset="activeIndex >= events.length - 1 ? 0 : 88" style="transition: stroke-dashoffset 1s ease" />
              <path d="M10 16 L14 20 L22 12" fill="none" stroke="var(--color-success, #22C55E)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :opacity="activeIndex >= events.length - 1 ? 1 : 0" style="transition: opacity 0.5s 0.8s" />
            </svg>
          </div>
          <span class="final-text font-heading">Соблюдение сегодня: 100%</span>
          <span class="final-sub">Всё выполнено. Завтра — новый день.</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSplitText } from '~/composables/useSplitText'

const { gsap, ScrollTrigger } = useGsap()

const timelineRef = ref<HTMLElement | null>(null)
const lineRef = ref<HTMLElement | null>(null)
const dayTitleRef = ref<HTMLElement | null>(null)
const activeIndex = ref(-1)

const events = [
  {
    time: '08:00',
    title: 'Витамин D3 — принят ✓',
    desc: 'Уведомление пришло → одно нажатие → готово.',
    color: 'var(--color-success, #22C55E)',
    svg: '<path d="M10 20 L10 8 Q10 4 14 4 Q18 4 18 8 L18 20 Q18 24 14 24 Q10 24 10 20Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 18 L12 22 L20 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    time: '10:00',
    title: 'Напоминание: педиатр завтра',
    desc: '«Заполните анкету перед визитом» — жалобы записали.',
    color: 'var(--color-primary)',
    svg: '<path d="M14 4 L14 7 M14 7 Q18 9 18 12 Q18 15 14 17 Q10 15 10 12 Q10 9 14 7Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="11" y1="9" x2="8" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="17" y1="9" x2="20" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  },
  {
    time: '14:00',
    title: 'Результат анализа сохранён',
    desc: 'Сфотографировала бумажку — привязана к маршруту навсегда.',
    color: 'var(--color-accent-blue, #3B82F6)',
    svg: '<rect x="6" y="4" width="16" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="14" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M14 16 L14 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  },
  {
    time: '20:00',
    title: 'Магний B6 — принят ✓',
    desc: 'Последнее напоминание дня. Спокойной ночи.',
    color: 'var(--color-secondary)',
    svg: '<path d="M18 6 Q22 10 18 16 Q14 22 8 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 20 L8 8 Q8 4 12 4 Q16 4 16 8 L16 20 Q16 24 12 24 Q8 24 8 20Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  },
]

onMounted(() => {
  if (typeof window === 'undefined' || !timelineRef.value) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    activeIndex.value = events.length - 1
    return
  }

  if (dayTitleRef.value) useSplitText(dayTitleRef)

  // GSAP scroll-driven timeline
  const rows = timelineRef.value!.querySelectorAll('.tl-row')
  gsap.set(rows, { opacity: 0, x: -30 })

  ScrollTrigger.create({
    trigger: timelineRef.value,
    start: 'top 70%',
    end: 'bottom 40%',
    onUpdate(self) {
      const p = self.progress
      // Fill the vertical line
      if (lineRef.value) {
        lineRef.value.style.height = `${p * 100}%`
      }
      // Activate rows sequentially
      const idx = Math.floor(p * events.length)
      if (idx > activeIndex.value) {
        activeIndex.value = idx

        // Animate newly active rows
        for (let i = 0; i <= idx && i < rows.length; i++) {
          gsap.to(rows[i], {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: 'power2.out',
            delay: i === idx ? 0 : 0,
          })
        }
      }
    },
  })

  // Initial entrance for first row
  ScrollTrigger.create({
    trigger: timelineRef.value,
    start: 'top 80%',
    once: true,
    onEnter() {
      gsap.to(rows[0], { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' })
    },
  })
})
</script>

<style scoped>
.day-header {
  text-align: center;
  margin-bottom: 56px;
}

.day-header h2 {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 12px 0 8px;
}

.day-subtitle {
  font-size: 17px;
  color: var(--color-text-secondary);
  margin: 0;
}

.timeline {
  position: relative;
  max-width: var(--content-narrow);
  margin: 0 auto;
  padding-left: 48px;
}

/* Vertical line */
.timeline-line-wrap {
  position: absolute;
  left: 15px;
  top: 0;
  width: 2px;
  height: 100%;
}

.timeline-line-bg {
  position: absolute;
  inset: 0;
  background: var(--color-border);
  border-radius: 1px;
}

.timeline-line-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0%;
  background: linear-gradient(to bottom, var(--color-primary), var(--color-secondary));
  border-radius: 1px;
  transition: height 0.1s linear;
}

/* Row */
.tl-row {
  position: relative;
  margin-bottom: 28px;
  will-change: transform, opacity;
}

/* Dot */
.tl-dot-wrap {
  position: absolute;
  left: -48px;
  top: 24px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tl-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-border);
  border: 3px solid var(--color-bg, #fff);
  transition: background 0.4s, transform 0.4s;
  z-index: 2;
  position: relative;
}

.tl-row.is-active .tl-dot {
  background: var(--color-primary);
  transform: scale(1.2);
}

.tl-dot-ring {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  opacity: 0;
  animation: dot-ping 1.5s ease-out forwards;
}

@keyframes dot-ping {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(1.3); opacity: 0; }
}

/* Card */
.tl-card {
  padding: 20px 24px;
  transition: box-shadow 0.4s, border-color 0.4s;
}

.tl-row.is-active .tl-card {
  border-color: var(--color-primary-light);
  box-shadow: 0 4px 20px rgba(139, 126, 200, 0.1);
}

.tl-time-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
  background: var(--color-primary-light, rgba(139, 126, 200, 0.1));
  padding: 2px 10px;
  border-radius: var(--radius-full);
  margin-bottom: 10px;
}

.tl-icon-text {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.tl-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--icon-color) 12%, transparent);
  color: var(--icon-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tl-mini-svg {
  flex-shrink: 0;
}

.tl-icon-text h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

.tl-icon-text p {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Final block */
.tl-final {
  text-align: center;
  padding: 28px 20px;
  margin-top: 12px;
  border-radius: var(--radius-lg);
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border-light);
  transition: box-shadow 0.6s, border-color 0.6s;
}

.tl-final.glow {
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow: 0 0 32px rgba(34, 197, 94, 0.15);
}

.final-check {
  margin-bottom: 12px;
}

.final-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-success, #22C55E);
  display: block;
}

.final-sub {
  display: block;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 6px;
}

@media (max-width: 768px) {
  .timeline { padding-left: 36px; }
  .tl-dot-wrap { left: -36px; }
  .timeline-line-wrap { left: 7px; }
}
</style>
