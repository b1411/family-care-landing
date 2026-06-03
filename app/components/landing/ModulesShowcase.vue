<template>
  <section id="modules" ref="sectionRef" class="modules-section">
    <div class="landing-container">
      <div class="section-header">
        <span class="section-badge t-eyebrow">Платформа</span>
        <h2 ref="titleRef" class="section-title t-display-section">
          Ключевые <span class="t-accent-serif">модули</span>
        </h2>
        <p class="section-subtitle t-lead">Четыре модуля, которые формируют ядро платформы. Всего в системе 8 модулей — полный список на странице для клиник.</p>
      </div>

      <div ref="gridRef" class="modules-grid">
        <div
          v-for="(mod, i) in modules"
          :key="i"
          class="module-card"
          :style="{ '--mod-accent': mod.iconColor }"
        >
          <span class="module-border" aria-hidden="true" />
          <span class="module-num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>

          <div class="module-icon-wrap" :style="{ background: mod.iconBg, color: mod.iconColor }">
            <Icon :name="mod.icon" size="22" />
          </div>
          <h3 class="module-headline">{{ mod.title }}</h3>
          <p class="module-label font-mono">{{ mod.label }}</p>
          <p class="module-body">{{ mod.body }}</p>

          <!-- Illustration -->
          <div class="module-illustration">
            <!-- Care Plan: event chain -->
            <div v-if="i === 0" class="illust-events">
              <div v-for="n in 5" :key="n" :ref="(el) => { if (el) eventLineRefs.push(el as HTMLElement) }" class="illust-event-node">
                <span class="illust-dot" />
                <span v-if="n < 5" class="illust-connector" />
              </div>
            </div>
            <!-- Prescriptions: progress ring -->
            <div v-if="i === 1" class="illust-ring-wrap">
              <svg class="illust-ring" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-border-light)" stroke-width="6" />
                <circle ref="ringRef" cx="40" cy="40" r="34" fill="none" stroke="var(--color-primary)" stroke-width="6" stroke-linecap="round"
                  stroke-dasharray="213.6" stroke-dashoffset="213.6" transform="rotate(-90 40 40)" />
              </svg>
              <span ref="ringTextRef" class="illust-ring-text font-mono">0%</span>
            </div>
            <!-- Coordinator: task rows -->
            <div v-if="i === 2" class="illust-tasks">
              <div v-for="(task, t) in coordTasks" :key="t" :ref="(el) => { if (el) taskRowRefs.push(el as HTMLElement) }" class="illust-task-row">
                <span class="illust-priority-dot" :style="{ background: task.color }" />
                <span class="illust-task-name">{{ task.name }}</span>
                <span class="illust-task-status" :style="{ color: task.color }">{{ task.status }}</span>
              </div>
            </div>
            <!-- Analytics: bar chart + trend line -->
            <div v-if="i === 3" class="illust-chart">
              <svg ref="trendLineRef" class="illust-trend-line" viewBox="0 0 160 60" fill="none" preserveAspectRatio="none">
                <polyline
                  points="10,48 50,30 100,36 150,8"
                  stroke="var(--color-primary)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-dasharray="200"
                  stroke-dashoffset="200"
                />
              </svg>
              <div v-for="(bar, b) in chartBars" :key="b" :ref="(el) => { if (el) barRefs.push(el as HTMLElement) }" class="illust-bar-col">
                <div class="illust-bar" :style="{ '--bar-h': bar.h + '%', background: bar.color }" />
                <span class="illust-bar-label font-mono">{{ bar.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modules-more" data-reveal="fade-up">
        <p class="modules-more-list">
          <span>Маршрут здоровья</span><span class="dot-sep">·</span>
          <span>Умные назначения</span><span class="dot-sep">·</span>
          <span>Панель координатора</span><span class="dot-sep">·</span>
          <span>Аналитика</span><span class="dot-sep">·</span>
          <span>Календарь прививок</span><span class="dot-sep">·</span>
          <span>Документы семьи</span><span class="dot-sep">·</span>
          <span>Брендирование</span><span class="dot-sep">·</span>
          <span>Интеграции и API</span>
        </p>
      </div>

      <div class="modules-cta" data-reveal="fade-up">
        <NuxtLink to="/for-clinics" class="modules-cta-link font-heading">
          Подробнее о всех 8 модулях
          <Icon name="lucide:arrow-right" size="18" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { gsap, ScrollTrigger } = useGsap()

const sectionRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const eventLineRefs = ref<HTMLElement[]>([])
const ringRef = ref<SVGCircleElement | null>(null)
const ringTextRef = ref<HTMLElement | null>(null)
const taskRowRefs = ref<HTMLElement[]>([])
const barRefs = ref<HTMLElement[]>([])
const trendLineRef = ref<SVGElement | null>(null)

const modules = [
  {
    icon: 'lucide:settings',
    iconBg: 'rgba(139, 126, 200, 0.12)',
    iconColor: '#8B7EC8',
    title: 'Маршрут строится сам',
    label: 'Маршрут здоровья',
    body: 'Платформа генерирует персональный план для каждой семьи: анализы, осмотры, прививки, назначения. 50+ событий за 2 секунды.',
  },
  {
    icon: 'lucide:pill',
    iconBg: 'rgba(124, 184, 212, 0.12)',
    iconColor: '#7CB8D4',
    title: 'Ни одного пропуска',
    label: 'Умные назначения',
    body: 'Каждое назначение врача → напоминание → подтверждение приёма. Контроль соблюдения назначений в реальном времени.',
  },
  {
    icon: 'lucide:list-checks',
    iconBg: 'rgba(212, 126, 165, 0.12)',
    iconColor: '#D47EA5',
    title: 'Один экран — все семьи',
    label: 'Панель координатора',
    body: 'Платформа приоритизирует задачи: кто выпал из маршрута, кому пора на прививку, у кого низкое соблюдение. Без обзвонов вслепую.',
  },
  {
    icon: 'lucide:bar-chart-3',
    iconBg: 'rgba(233, 196, 106, 0.12)',
    iconColor: '#E9C46A',
    title: 'Данные → решения',
    label: 'Аналитика',
    body: 'Удержание по когортам, конверсия из беременности в педиатрию, загрузка команды и NPS — в реальном времени.',
  },
]

const coordTasks = [
  { name: 'Айгерим К.', status: 'Срочно', color: '#D4727C' },
  { name: 'Данияр Б.', status: 'Просрочено', color: '#E9C46A' },
  { name: 'Амина Ж.', status: 'В норме', color: '#7CB8D4' },
]

const chartBars = [
  { h: 87, label: 'Q1', color: '#8B7EC8' },
  { h: 64, label: 'Q2', color: '#7CB8D4' },
  { h: 73, label: 'Q3', color: '#D47EA5' },
  { h: 91, label: 'Q4', color: '#E9C46A' },
]

useSplitText(titleRef, {
  type: 'words',
  from: { y: '100%', opacity: 0 },
  stagger: 0.06,
  duration: 0.7,
  ease: 'back.out(1.4)',
  scrollStart: 'top 80%',
})

const cleanups: Array<() => void> = []

onMounted(() => {
  if (!gsap || !ScrollTrigger || !sectionRef.value || !gridRef.value) return

  const cells = gridRef.value.querySelectorAll('.module-card')

  gsap.set(cells, { opacity: 0, y: 50, scale: 0.92 })

  const entranceTrigger = ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      gsap.to(cells, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'back.out(1.5)',
      })

      // Event chain animation (module 0) — cascade from top
      if (eventLineRefs.value.length) {
        gsap.set(eventLineRefs.value, { opacity: 0, y: -20, scale: 0.5 })
        gsap.to(eventLineRefs.value, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          stagger: 0.1,
          ease: 'back.out(2.5)',
          delay: 0.5,
        })
        // Connectors grow after dots land
        const connectors = eventLineRefs.value.map(el => el.querySelector('.illust-connector')).filter(Boolean)
        gsap.set(connectors, { scaleY: 0, transformOrigin: 'top' })
        gsap.to(connectors, {
          scaleY: 1,
          duration: 0.25,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.7,
        })
      }

      // Progress ring (module 1) — animate to a target
      if (ringRef.value) {
        const circumference = 213.6
        const target = circumference * (1 - 0.80)
        gsap.set(ringRef.value, { strokeDashoffset: circumference })
        gsap.to(ringRef.value, {
          strokeDashoffset: target,
          duration: 1.8,
          ease: 'power2.out',
          delay: 0.6,
        })
      }
      if (ringTextRef.value) {
        ringTextRef.value.textContent = '0%'
        gsap.to({ val: 0 }, {
          val: 80,
          duration: 1.8,
          ease: 'power2.out',
          delay: 0.6,
          onUpdate() {
            if (ringTextRef.value) {
              ringTextRef.value.textContent = Math.round(this.targets()[0].val) + '%'
            }
          },
          onComplete() {
            if (ringTextRef.value) {
              ringTextRef.value.classList.add('number-pulse')
              setTimeout(() => ringTextRef.value?.classList.remove('number-pulse'), 600)
            }
          },
        })
      }

      // Task rows (module 2)
      if (taskRowRefs.value.length) {
        gsap.set(taskRowRefs.value, { opacity: 0, x: -16 })
        gsap.to(taskRowRefs.value, {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.7,
        })
      }

      // Bar chart (module 3)
      if (barRefs.value.length) {
        const bars = barRefs.value.map(el => el.querySelector('.illust-bar')).filter(Boolean) as HTMLElement[]
        gsap.set(bars, { scaleY: 0 })
        gsap.to(bars, {
          scaleY: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.5)',
          delay: 0.8,
        })
      }
      // Trend line draw
      if (trendLineRef.value) {
        const line = trendLineRef.value.querySelector('polyline')
        if (line) {
          gsap.to(line, {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.out',
            delay: 1.2,
          })
        }
      }
    },
  })

  cleanups.push(() => entranceTrigger.kill())

  // Hover lift
  cells.forEach((cell) => {
    const onEnter = () => {
      gsap.to(cell, {
        y: -6,
        duration: 0.3,
        ease: 'power2.out',
        boxShadow: '0 12px 40px rgba(139, 126, 200, 0.18), 0 0 0 1px rgba(139, 126, 200, 0.12)',
      })
    }
    const onLeave = () => {
      gsap.to(cell, {
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        boxShadow: '0 0 0 0 transparent, 0 0 0 0 transparent',
      })
    }
    cell.addEventListener('mouseenter', onEnter)
    cell.addEventListener('mouseleave', onLeave)
    cleanups.push(() => {
      cell.removeEventListener('mouseenter', onEnter)
      cell.removeEventListener('mouseleave', onLeave)
    })
  })
})

onBeforeUnmount(() => {
  cleanups.forEach((fn) => fn())
  cleanups.length = 0
})
</script>

<style scoped>
.modules-section {
  padding: var(--section-py) 0;
  background: var(--color-bg-alt);
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
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
  margin: 0 0 12px;
}

.section-subtitle {
  font-size: var(--text-body-lg);
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 560px;
  margin-inline: auto;
}

/* Uniform 2×2 grid */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.module-card {
  position: relative;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: var(--radius-lg);
  padding: 26px 26px 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  isolation: isolate;
  will-change: transform, opacity;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 2px 6px rgba(139, 126, 200, 0.04),
    0 16px 38px -22px rgba(139, 126, 200, 0.24);
  transition:
    transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1),
    box-shadow 0.42s ease,
    border-color 0.32s ease;
}

/* Gradient border on hover */
.module-border {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, var(--mod-accent, var(--color-primary)) 0%, transparent 65%);
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

/* Number watermark */
.module-num {
  position: absolute;
  top: 18px;
  right: 22px;
  font-family: var(--font-serif, 'Instrument Serif'), serif;
  font-style: italic;
  font-size: 38px;
  font-weight: 400;
  color: var(--mod-accent, var(--color-primary));
  opacity: 0.14;
  line-height: 1;
  pointer-events: none;
  letter-spacing: -0.02em;
  transition: opacity 0.3s ease, transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.module-card:hover {
  border-color: transparent;
}

.module-card:hover .module-border {
  opacity: 1;
}

.module-card:hover .module-num {
  opacity: 0.28;
  transform: translateX(-4px) scale(1.06);
}

.module-icon-wrap {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  flex-shrink: 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 6px 14px -4px rgba(139, 126, 200, 0.2);
  transition: transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.module-card:hover .module-icon-wrap {
  transform: scale(1.06) rotate(-3deg);
}

.module-headline {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.module-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 0 0 10px;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.module-body {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.55;
  margin: 0;
}

/* Illustrations */
.module-illustration {
  margin-top: 20px;
  min-height: 60px;
}

/* Event chain */
.illust-events {
  display: flex;
  align-items: center;
  gap: 0;
}

.illust-event-node {
  display: flex;
  align-items: center;
  will-change: transform, opacity;
}

.illust-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
}

.illust-connector {
  width: 28px;
  height: 2px;
  background: var(--color-primary-light);
  flex-shrink: 0;
}

/* Progress ring */
.illust-ring-wrap {
  position: relative;
  width: 80px;
  height: 80px;
}

.illust-ring {
  width: 80px;
  height: 80px;
}

.illust-ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
}

/* Task rows */
.illust-tasks {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.illust-task-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  background: var(--color-bg);
  border-radius: var(--radius-xs);
  font-size: 12px;
  will-change: transform, opacity;
}

.illust-priority-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.illust-task-name {
  flex: 1;
  color: var(--color-text-secondary);
}

.illust-task-status {
  font-weight: 600;
  font-size: 11px;
}

/* Bar chart */
.illust-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 70px;
  position: relative;
}

.illust-trend-line {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.illust-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.illust-bar {
  width: 100%;
  height: var(--bar-h);
  border-radius: 4px 4px 0 0;
  transform-origin: bottom center;
}

.illust-bar-label {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.modules-more {
  margin-top: 40px;
  text-align: center;
}

.modules-more-list {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 6px 8px;
  max-width: 720px;
  margin: 0 auto;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.modules-more-list .dot-sep {
  color: var(--color-text-muted);
  opacity: 0.6;
}

/* CTA */
.modules-cta {
  text-align: center;
  margin-top: 16px;
}

.modules-cta-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
  font-size: var(--text-body);
  font-weight: 600;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-primary-light);
  transition: background 0.25s, color 0.25s;
}

.modules-cta-link:hover {
  background: var(--color-primary);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .modules-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .module-card {
    padding: 22px 22px 20px;
  }
  .module-headline {
    font-size: 16px;
  }
  .module-body {
    font-size: 13.5px;
  }
  .module-num {
    font-size: 32px;
    top: 14px;
    right: 16px;
  }
  .illust-chart { height: 60px; }
  .illust-bar-col { gap: 2px; }
}
</style>
