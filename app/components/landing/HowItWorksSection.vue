<template>
  <section id="how-it-works" ref="sectionRef" class="how-it-works-section landing-section">
    <div class="landing-container">
      <div class="section-header">
        <span class="section-badge t-eyebrow">Маршрут</span>
        <h2 ref="titleRef" class="section-title t-display-section">
          Полный маршрут: от первой недели беременности до <span class="t-accent-serif">двух лет</span>
        </h2>
        <p class="section-subtitle t-lead">5 этапов, 50+ событий — платформа ведёт каждую семью автоматически</p>
      </div>

      <!-- Mini progress indicator -->
      <div class="timeline-progress" aria-hidden="true">
        <span
          v-for="(stage, i) in stages"
          :key="`p-${i}`"
          class="progress-pip"
          :class="{ 'is-active': expandedStage === i }"
        />
        <span class="progress-label font-mono">
          Этап {{ String(expandedStage + 1).padStart(2, '0') }} / {{ stages.length }}
        </span>
      </div>

      <!-- Connecting timeline line -->
      <div class="timeline-connector" ref="connectorRef" aria-hidden="true">
        <div class="timeline-connector-fill" ref="connectorFillRef" />
      </div>

      <!-- 5 stage cards - all visible -->
      <div
        ref="cardsRef"
        class="stage-cards"
        @mouseenter="pauseAutoAdvance"
        @mouseleave="resumeAutoAdvance"
      >
        <div
          v-for="(stage, i) in stages"
          :key="stage.label"
          class="stage-card"
          :class="{ 'is-expanded': expandedStage === i }"
          :style="{ '--stage-color': stage.iconColor }"
          @click="setStage(i)"
          @mouseenter="setStage(i)"
        >
          <!-- Gradient border on active -->
          <span class="stage-border" aria-hidden="true" />

          <!-- Big numeric watermark -->
          <span class="stage-num">{{ String(i + 1).padStart(2, '0') }}</span>

          <!-- Icon -->
          <div class="stage-icon-wrap" :style="{ background: stage.iconBg }">
            <Icon :name="stage.icon" size="20" :style="{ color: stage.iconColor }" />
          </div>

          <!-- Title & period -->
          <h3 class="stage-label">{{ stage.label }}</h3>
          <span v-if="stage.period" class="stage-period font-mono">{{ stage.period }}</span>

          <!-- Summary stat -->
          <div class="stage-stat font-mono">{{ stage.stat }}</div>

          <!-- Expanded events -->
          <Transition name="stage-expand">
            <div v-if="expandedStage === i" class="stage-events-wrap">
              <ul class="stage-events">
                <li v-for="event in stage.events" :key="event">
                  <span class="event-bullet" aria-hidden="true" />
                  <span>{{ event }}</span>
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { gsap, ScrollTrigger } = useGsap()

const sectionRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const cardsRef = ref<HTMLElement | null>(null)
const connectorRef = ref<HTMLElement | null>(null)
const connectorFillRef = ref<HTMLElement | null>(null)
const expandedStage = ref(0)

let autoAdvanceTimer: ReturnType<typeof setInterval> | null = null
let visibilityHandler: (() => void) | null = null
let hovering = false

function setStage(i: number) {
  expandedStage.value = expandedStage.value === i ? -1 : i
  // Reset auto-advance on manual interaction
  if (!hovering) resumeAutoAdvance()
}

function startAutoAdvance() {
  if (autoAdvanceTimer || hovering) return
  autoAdvanceTimer = setInterval(() => {
    expandedStage.value = (expandedStage.value + 1) % 5
  }, 6000)
}

function stopAutoAdvance() {
  if (autoAdvanceTimer) {
    clearInterval(autoAdvanceTimer)
    autoAdvanceTimer = null
  }
}

function pauseAutoAdvance() {
  hovering = true
  stopAutoAdvance()
}

function resumeAutoAdvance() {
  hovering = false
  stopAutoAdvance()
  startAutoAdvance()
}

const stages = [
  {
    label: 'Планирование',
    period: '',
    icon: 'lucide:calendar-heart',
    iconBg: 'var(--color-primary-ultralight)',
    iconColor: 'var(--color-primary)',
    stat: '4 события',
    events: [
      'Регистрация в платформе',
      'Определение LMP, расчёт ПДР',
      'Назначение врача-куратора',
      'Первые назначения: фолиевая кислота',
    ],
  },
  {
    label: 'Беременность',
    period: '40 недель',
    icon: 'lucide:heart-pulse',
    iconBg: 'var(--color-secondary-light)',
    iconColor: 'var(--color-secondary-dark)',
    stat: '3 УЗИ · 15+ анализов · 10+ визитов',
    events: [
      '1-й скрининг (12 нед.) — УЗИ + биохимия',
      '2-й скрининг (20 нед.) — анатомия плода',
      'ГТТ (26 нед.) — гестационный диабет',
      '3-й скрининг (33 нед.) — допплерометрия',
      'Еженедельные приёмы (37–40 нед.)',
    ],
  },
  {
    label: 'Роды и первые дни',
    period: '',
    icon: 'lucide:baby',
    iconBg: '#FDE8F0',
    iconColor: 'var(--color-secondary)',
    stat: '5 событий',
    events: [
      'Фиксация данных о родах',
      'Профиль ребёнка (вес, рост, Apgar)',
      'БЦЖ + Гепатит B (первые 24 часа)',
      'Осмотр неонатолога',
      'Патронаж на дому (1-я и 2-я неделя)',
    ],
  },
  {
    label: 'Первый год',
    period: '0–12 мес.',
    icon: 'lucide:milestone',
    iconBg: 'var(--color-accent-blue-light)',
    iconColor: '#5a8fb4',
    stat: '10+ прививок · 365 напоминаний',
    events: [
      'Ежемесячные осмотры педиатра',
      '10+ прививок по национальному календарю РК',
      'Невролог, ортопед, окулист',
      'УЗИ головного мозга, тазобедренных',
      'Витамин D3 ежедневно',
      'Прикорм, этапы развития',
    ],
  },
  {
    label: 'Второй год',
    period: '12–24 мес.',
    icon: 'lucide:footprints',
    iconBg: 'rgba(233, 196, 106, 0.15)',
    iconColor: '#b8941c',
    stat: '4 осмотра · 2 ревакцинации',
    events: [
      'Осмотры каждые 3 месяца',
      'Ревакцинация АКДС + ОПВ (18 мес.)',
      'Стоматолог, логопед (18–24 мес.)',
      'Оценка развития речи (24 мес.)',
      'Итоговый осмотр в 2 года',
    ],
  },
]

useSplitText(titleRef, {
  type: 'words',
  from: { y: '100%', opacity: 0 },
  stagger: 0.05,
  duration: 0.7,
  ease: 'back.out(1.4)',
  scrollStart: 'top 80%',
})

onMounted(() => {
  if (!gsap || !ScrollTrigger || !sectionRef.value) return

  // Cards entrance with stagger
  const cards = cardsRef.value?.querySelectorAll('.stage-card')
  if (cards?.length) {
    gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 })
    ScrollTrigger.create({
      trigger: cardsRef.value,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'back.out(1.3)',
        })
      },
    })
  }

  // Timeline connector fill on scroll
  if (connectorFillRef.value) {
    ScrollTrigger.create({
      trigger: sectionRef.value,
      start: 'top 60%',
      end: 'bottom 40%',
      scrub: 0.6,
      onUpdate(self: any) {
        if (connectorFillRef.value) {
          connectorFillRef.value.style.transform = `scaleX(${self.progress})`
        }
      },
    })
  }

  // Auto-advance every 6s; pause when tab hidden (Page Visibility API)
  if (typeof window !== 'undefined') {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reducedMotion) {
      if (!document.hidden) startAutoAdvance()
      visibilityHandler = () => {
        if (document.hidden) stopAutoAdvance()
        else if (!hovering) startAutoAdvance()
      }
      document.addEventListener('visibilitychange', visibilityHandler)
    }
  }
})

onBeforeUnmount(() => {
  stopAutoAdvance()
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler)
    visibilityHandler = null
  }
})
</script>

<style scoped>
.how-it-works-section {
  overflow: hidden;
}

.section-header {
  text-align: center;
  margin-bottom: 24px;
}

.section-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  margin-bottom: 16px;
}

.section-title {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.section-subtitle {
  font-size: var(--text-body);
  color: var(--color-text-muted);
  margin: 0;
}

/* Progress indicator (pip strip + label) */
.timeline-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto 18px;
  max-width: 90%;
}

.progress-pip {
  width: 18px;
  height: 3px;
  border-radius: 2px;
  background: rgba(139, 126, 200, 0.15);
  transition: width 0.45s cubic-bezier(0.22, 0.61, 0.36, 1), background 0.3s ease;
}

.progress-pip.is-active {
  width: 44px;
  background: var(--gradient-cta);
}

.progress-label {
  margin-left: 12px;
  font-size: 11px;
  color: var(--color-text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
}

/* Timeline connector line */
.timeline-connector {
  position: relative;
  height: 2px;
  background: rgba(139, 126, 200, 0.1);
  border-radius: 2px;
  margin: 0 auto 28px;
  max-width: 90%;
  overflow: hidden;
}

.timeline-connector-fill {
  position: absolute;
  inset: 0;
  background: var(--gradient-cta);
  border-radius: 2px;
  transform: scaleX(0);
  transform-origin: left;
  will-change: transform;
  box-shadow: 0 0 8px rgba(139, 126, 200, 0.4);
}

/* Stage cards — 5 in a row */
.stage-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.stage-card {
  position: relative;
  padding: 22px 18px 18px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(139, 126, 200, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 2px 6px rgba(139, 126, 200, 0.04),
    0 14px 32px -20px rgba(139, 126, 200, 0.22);
  cursor: pointer;
  transition:
    transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1),
    box-shadow 0.45s ease,
    border-color 0.32s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 6px;
  isolation: isolate;
}

/* Animated gradient border (active state) */
.stage-border {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, var(--stage-color, var(--color-primary)) 0%, transparent 70%);
  -webkit-mask:
    linear-gradient(#000, #000) content-box,
    linear-gradient(#000, #000);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000, #000) content-box,
    linear-gradient(#000, #000);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.32s ease;
  pointer-events: none;
  z-index: -1;
}

.stage-card:hover {
  transform: translateY(-4px);
  border-color: transparent;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 6px 18px rgba(139, 126, 200, 0.1),
    0 22px 48px -22px rgba(139, 126, 200, 0.32);
}

.stage-card:hover .stage-border {
  opacity: 1;
}

.stage-card.is-expanded {
  background: rgba(255, 255, 255, 0.95);
  border-color: transparent;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.98),
    0 8px 22px rgba(139, 126, 200, 0.14),
    0 28px 60px -22px rgba(139, 126, 200, 0.38);
}

.stage-card.is-expanded .stage-border {
  opacity: 1;
}

/* Number watermark — bigger, Instrument Serif italic */
.stage-num {
  position: absolute;
  top: 10px;
  right: 14px;
  font-family: var(--font-serif, 'Instrument Serif'), serif;
  font-style: italic;
  font-size: 44px;
  font-weight: 400;
  color: var(--stage-color, var(--color-primary));
  opacity: 0.1;
  line-height: 1;
  pointer-events: none;
  letter-spacing: -0.02em;
  transition: opacity 0.32s ease, transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.stage-card.is-expanded .stage-num {
  opacity: 0.28;
  transform: translateX(-4px) scale(1.08);
}

/* Icon */
.stage-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 4px 12px -3px rgba(139, 126, 200, 0.18);
  transition: transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1);
  margin-bottom: 4px;
}

.stage-card.is-expanded .stage-icon-wrap,
.stage-card:hover .stage-icon-wrap {
  transform: scale(1.06) rotate(-3deg);
}

/* Labels */
.stage-label {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.005em;
}

.stage-period {
  font-size: 10px;
  color: var(--color-text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 600;
}

.stage-stat {
  font-size: 11px;
  color: var(--stage-color, var(--color-primary));
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.06);
  align-self: flex-start;
  margin-top: 4px;
}

/* Expanded events */
.stage-events-wrap {
  padding-top: 8px;
  margin-top: 4px;
  border-top: 1px solid rgba(139, 126, 200, 0.08);
}

.stage-events {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.stage-events li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}

.event-bullet {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--stage-color, var(--color-primary));
  flex-shrink: 0;
  margin-top: 6px;
  box-shadow: 0 0 6px var(--stage-color, var(--color-primary));
}

/* Expand/collapse transition */
.stage-expand-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.stage-expand-leave-active {
  transition: all 0.2s ease-in;
}

.stage-expand-enter-from,
.stage-expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}

.stage-expand-enter-to {
  opacity: 1;
  max-height: 300px;
}

/* Responsive */
@media (max-width: 1100px) {
  .stage-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .stage-cards {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .timeline-connector {
    display: none;
  }
  .stage-card {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 16px;
  }
  .stage-card.is-expanded {
    flex-direction: column;
    align-items: flex-start;
  }
  .stage-num {
    font-size: 36px;
  }
  .stage-events-wrap {
    width: 100%;
  }
}
</style>
