<template>
  <section id="how-it-works" ref="sectionRef" class="how-it-works-section landing-section">
    <div class="landing-container">
      <div class="section-header">
        <span class="section-badge font-heading">Маршрут</span>
        <h2 ref="titleRef" class="section-title font-display">Полный маршрут: от зачатия до 2 лет</h2>
        <p class="section-subtitle">5 этапов, 50+ событий — платформа ведёт каждую семью автоматически</p>
      </div>

      <!-- Connecting timeline line -->
      <div class="timeline-connector" ref="connectorRef">
        <div class="timeline-connector-fill" ref="connectorFillRef" />
      </div>

      <!-- 5 stage cards - all visible -->
      <div ref="cardsRef" class="stage-cards">
        <div
          v-for="(stage, i) in stages"
          :key="stage.label"
          class="stage-card"
          :class="{ 'is-expanded': expandedStage === i }"
          @click="expandedStage = expandedStage === i ? -1 : i"
          @mouseenter="expandedStage = i"
        >
          <!-- Number watermark -->
          <span class="stage-num font-display">{{ String(i + 1).padStart(2, '0') }}</span>

          <!-- Icon -->
          <div class="stage-icon-wrap" :style="{ background: stage.iconBg }">
            <Icon :name="stage.icon" size="20" :style="{ color: stage.iconColor }" />
          </div>

          <!-- Title & period -->
          <h3 class="stage-label font-heading">{{ stage.label }}</h3>
          <span v-if="stage.period" class="stage-period font-mono">{{ stage.period }}</span>

          <!-- Summary stat -->
          <div class="stage-stat font-mono">{{ stage.stat }}</div>

          <!-- Expanded events -->
          <Transition name="stage-expand">
            <div v-if="expandedStage === i" class="stage-events-wrap">
              <ul class="stage-events">
                <li v-for="event in stage.events" :key="event">{{ event }}</li>
              </ul>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Mobile: vertical stack (same cards but stacked) -->
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
      '10+ прививок по нацкалендарю',
      'Невролог, ортопед, окулист',
      'УЗИ головного мозга, тазобедренных',
      'Витамин D3 ежедневно',
      'Прикорм, milestones развития',
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

/* Timeline connector line */
.timeline-connector {
  position: relative;
  height: 3px;
  background: var(--color-border-light);
  border-radius: 2px;
  margin: 0 auto 32px;
  max-width: 90%;
}

.timeline-connector-fill {
  position: absolute;
  inset: 0;
  background: var(--gradient-cta);
  border-radius: 2px;
  transform: scaleX(0);
  transform-origin: left;
  will-change: transform;
}

/* Stage cards — 5 in a row */
.stage-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.stage-card {
  position: relative;
  padding: 24px 18px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stage-card:hover {
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-md);
}

.stage-card.is-expanded {
  background: var(--color-primary-ultralight);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-hover);
  grid-column: span 1;
}

/* Number watermark */
.stage-num {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 48px;
  font-weight: 900;
  color: var(--color-text-primary);
  opacity: 0.04;
  line-height: 1;
  pointer-events: none;
  transition: opacity 0.3s;
}

.stage-card.is-expanded .stage-num {
  opacity: 0.08;
}

/* Icon */
.stage-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Labels */
.stage-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.2;
}

.stage-period {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  letter-spacing: var(--tracking-wide);
}

.stage-stat {
  font-size: 10px;
  color: var(--color-primary);
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* Expanded events */
.stage-events-wrap {
  padding-top: 4px;
}

.stage-events {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stage-events li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}

.stage-events li::before {
  content: '─';
  color: var(--color-primary);
  flex-shrink: 0;
  font-size: 10px;
  margin-top: 2px;
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
