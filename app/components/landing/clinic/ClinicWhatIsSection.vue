<template>
  <LandingUiSectionWrapper
    id="clinic-platform"
    badge="Платформа"
    title="Как платформа это решает"
  >
    <!-- Tab switcher -->
    <div class="tab-bar" data-reveal="fade-up">
      <button
        v-for="(tab, i) in tabs"
        :key="tab.role"
        class="tab-btn"
        :class="{ active: activeTab === i }"
        @click="activeTab = i"
      >
        {{ tab.role }}
      </button>
    </div>

    <!-- Tab content -->
    <div class="tab-content">
      <Transition name="cross" mode="out-in" @after-enter="animatePanel">
        <div :key="activeTab" class="tab-panel">
          <div class="panel-layout">
            <!-- SVG mockup -->
            <div class="panel-visual landing-card" data-tilt>
              <!-- Координатор -->
              <svg v-if="activeTab === 0" viewBox="0 0 360 240" fill="none" class="mockup-svg">
                <rect width="360" height="240" rx="8" fill="var(--color-surface, #F8F5F0)" />
                <text x="16" y="28" font-size="12" font-weight="700" fill="var(--color-text-primary, #1A1A2E)">Очередь задач</text>
                <rect v-for="(t, i) in coordTasks" :key="i" :x="16" :y="40 + i * 44" width="328" height="36" rx="6" fill="white" stroke="var(--color-border, #E5E0DA)" stroke-width="1" />
                <circle v-for="(t, i) in coordTasks" :key="'d'+i" :cx="32" :cy="58 + i * 44" r="5" :fill="t.color" />
                <text v-for="(t, i) in coordTasks" :key="'t'+i" :x="44" :y="62 + i * 44" font-size="11" fill="var(--color-text-primary, #1A1A2E)">{{ t.label }}</text>
              </svg>
              <!-- Руководитель -->
              <svg v-else-if="activeTab === 1" viewBox="0 0 360 240" fill="none" class="mockup-svg">
                <rect width="360" height="240" rx="8" fill="var(--color-surface, #F8F5F0)" />
                <text x="16" y="28" font-size="12" font-weight="700" fill="var(--color-text-primary, #1A1A2E)">Удержание и доход</text>
                <rect v-for="(b, i) in bars" :key="i" :x="30 + i * 42" :y="240 - 40 - b.h" :width="28" :height="b.h" rx="4" :fill="b.fill" />
                <line x1="16" y1="200" x2="344" y2="200" stroke="var(--color-border, #E5E0DA)" stroke-width="1" />
                <polyline points="44,160 86,140 128,120 170,105 212,90 254,70 296,55 338,42" fill="none" stroke="var(--color-primary, #8B7EC8)" stroke-width="2" stroke-linecap="round" />
              </svg>
              <!-- Врач -->
              <svg v-else viewBox="0 0 360 240" fill="none" class="mockup-svg">
                <rect width="360" height="240" rx="8" fill="var(--color-surface, #F8F5F0)" />
                <text x="16" y="28" font-size="12" font-weight="700" fill="var(--color-text-primary, #1A1A2E)">Карточка пациента</text>
                <rect x="16" y="40" width="328" height="32" rx="6" fill="white" stroke="var(--color-border, #E5E0DA)" stroke-width="1" />
                <text x="28" y="60" font-size="11" fill="var(--color-text-primary, #1A1A2E)">Каримова А. — 28 нед.</text>
                <rect v-for="(s, i) in patientSections" :key="i" x="16" :y="82 + i * 40" width="328" height="32" rx="6" fill="white" stroke="var(--color-border, #E5E0DA)" stroke-width="1" />
                <text v-for="(s, i) in patientSections" :key="'s'+i" x="28" :y="102 + i * 40" font-size="11" fill="var(--color-text-secondary, #6B7280)">{{ s }}</text>
              </svg>
            </div>

            <!-- Bullets -->
            <div class="panel-info">
              <h3 class="panel-headline font-display">{{ tabs[activeTab]?.headline }}</h3>
              <p class="panel-role font-heading">{{ tabs[activeTab]?.role }}</p>
              <ul class="panel-bullets">
                <li v-for="b in tabs[activeTab]?.bullets" :key="b">{{ b }}</li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGsap } from '~/composables/useGsap'

const { gsap } = useGsap()
const activeTab = ref(0)

const tabs = [
  {
    role: 'Координатор',
    headline: 'Один экран вместо 40 звонков',
    bullets: [
      'Очередь задач: Просрочено, Вакцинации, Низкое соблюдение — с приоритетами',
      'Кнопки «Позвонить» / «Записать» — действие в один клик',
      'Автоэскалация при пропущенных визитах и no-show',
      'Activity log по каждой семье: кто, когда, что',
    ],
  },
  {
    role: 'Руководитель',
    headline: 'Цифры, которые меняют решения',
    bullets: [
      'Удержание / Конверсия / Доход — когортный анализ',
      'Выручка на семью и тренды с динамикой',
      'Загрузка координаторов, время ответа, NPS',
      'Экспорт отчётов в PDF за 1 клик',
    ],
  },
  {
    role: 'Врач',
    headline: 'Полный контекст за 30 секунд до приёма',
    bullets: [
      'Карточка пациента: анамнез, результаты, назначения',
      'Соблюдение по каждому назначению с процентами',
      'Предстоящие визиты и подготовка к приёму',
      'Прямая связь с координатором по семье',
    ],
  },
]

const coordTasks = [
  { label: 'Просрочено: УЗИ II триместр — Каримова А.', color: 'var(--color-danger, #D4727C)' },
  { label: 'Неявка: приём гинеколога — Алиева Д.', color: 'var(--color-danger, #D4727C)' },
  { label: 'Низкое соблюдение: витамины — Нурланова С.', color: '#FBBF24' },
  { label: 'Подключение: Жумабаева К. — 8 нед.', color: 'var(--color-accent-blue, #A8C8E8)' },
]

const bars = [
  { h: 60, fill: 'var(--color-primary, #8B7EC8)' },
  { h: 80, fill: 'var(--color-primary, #8B7EC8)' },
  { h: 95, fill: 'var(--color-primary, #8B7EC8)' },
  { h: 110, fill: 'var(--color-primary, #8B7EC8)' },
  { h: 125, fill: 'var(--color-primary, #8B7EC8)' },
  { h: 140, fill: 'var(--color-primary, #8B7EC8)' },
  { h: 150, fill: 'var(--color-primary, #8B7EC8)' },
  { h: 155, fill: 'var(--color-accent-blue, #A8C8E8)' },
]

const patientSections = [
  'Маршрут: беременность — II триместр',
  'Анализы: 12 из 18 пройдено',
  'Назначения: Витамин D, Фолиевая кислота',
  'Ближайший визит: 15 января — УЗИ',
]

// Animate SVG mockups after tab transition finishes
function animatePanel(el: Element) {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const svg = el.querySelector('.mockup-svg')
  if (!svg) return
  const tab = activeTab.value

  // Stagger animate bullet points
  const bullets = el.querySelectorAll('.panel-bullets li')
  gsap.fromTo(bullets,
    { opacity: 0, x: -12 },
    { opacity: 1, x: 0, stagger: 0.08, duration: 0.35, ease: 'power2.out', delay: 0.15 }
  )

  // Animate headline
  const headline = el.querySelector('.panel-headline')
  if (headline) {
    gsap.fromTo(headline, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
  }

  if (tab === 0) {
    // Coordinator: task rows slide in, first dot turns green
    const taskRows = svg.querySelectorAll<SVGRectElement>('rect[rx="6"]')
    const dots = svg.querySelectorAll<SVGCircleElement>('circle')
    taskRows.forEach((r, i) => {
      gsap.fromTo(r, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, delay: i * 0.08, ease: 'power2.out' })
    })
    if (dots.length) {
      gsap.fromTo(dots[0]!,
        { attr: { fill: 'var(--color-danger, #D4727C)' } },
        { attr: { fill: 'var(--color-success, #7CB8D4)' }, duration: 0.8, delay: 0.4 },
      )
    }
  } else if (tab === 1) {
    // Manager: bars grow from bottom, trend line draws
    const barEls = svg.querySelectorAll<SVGRectElement>('rect[rx="4"]')
    barEls.forEach((bar, i) => {
      gsap.fromTo(bar,
        { scaleY: 0, transformOrigin: 'bottom center' },
        { scaleY: 1, duration: 0.5, delay: i * 0.06, ease: 'power2.out' },
      )
    })
    const polyline = svg.querySelector<SVGPolylineElement>('polyline')
    if (polyline) {
      const len = polyline.getTotalLength?.() || 200
      gsap.fromTo(polyline,
        { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, duration: 0.8, delay: 0.3, ease: 'power2.out' },
      )
    }
  } else if (tab === 2) {
    // Doctor: patient sections expand accordion-style
    const sections = svg.querySelectorAll<SVGRectElement>('rect[x="16"]')
    // skip the first big rect (background)
    const sectionRects = Array.from(sections).slice(1)
    sectionRects.forEach((s, i) => {
      gsap.fromTo(s,
        { attr: { height: 0 }, opacity: 0 },
        { attr: { height: 32 }, opacity: 1, duration: 0.35, delay: i * 0.12, ease: 'power2.out' },
      )
    })
    const texts = svg.querySelectorAll<SVGTextElement>('text[x="28"]')
    const sectionTexts = Array.from(texts).slice(1) // skip header text
    sectionTexts.forEach((t, i) => {
      gsap.fromTo(t, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.1 + i * 0.12 })
    })
  }
}
</script>

<style scoped>
.tab-bar {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
}

.tab-btn {
  padding: 10px 24px;
  border-radius: var(--radius-full, 999px);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tab-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.panel-layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
  align-items: center;
}

.panel-visual {
  padding: 12px;
  overflow: hidden;
  transition: box-shadow 0.5s ease;
}
.panel-visual:hover {
  box-shadow: var(--shadow-hover), 0 0 40px rgba(139, 126, 200, 0.06);
}

.mockup-svg {
  width: 100%;
  height: auto;
  display: block;
}

.panel-headline {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}

.panel-role {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  margin: 0 0 16px;
}

.panel-bullets {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-bullets li {
  position: relative;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.panel-bullets li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  transition: transform 0.3s ease;
}
.panel-bullets li:hover::before {
  transform: scale(1.5);
}

/* Crossfade transition */
.cross-enter-active,
.cross-leave-active {
  transition: opacity 0.35s ease;
}
.cross-enter-from,
.cross-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .panel-layout {
    grid-template-columns: 1fr;
  }
  .tab-bar {
    flex-wrap: wrap;
  }
}
</style>
