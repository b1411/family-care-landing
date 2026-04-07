<template>
  <LandingUiSectionWrapper
    id="clinic-modules"
    badge="Модули"
    title="8 модулей в деталях"
    subtitle="Каждый модуль решает конкретную задачу клиники"
    alternate
  >
    <div ref="gridRef" class="modules-grid" data-stagger="fade-up">
      <div
        v-for="(mod, i) in modules"
        :key="mod.title"
        class="module-card stagger-item landing-card"
        :class="{ expanded: expandedIndex === i }"
        data-tilt
        @click="toggle(i)"
      >
        <!-- Collapsed state -->
        <div class="card-header">
          <div class="card-icon-wrap">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none"
              stroke="var(--color-primary)" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path :d="mod.iconPath" />
            </svg>
          </div>
          <div class="card-header-text">
            <h4 class="card-title font-heading">{{ mod.title }}</h4>
            <p class="card-subtitle">{{ mod.subtitle }}</p>
          </div>
          <svg class="chevron" width="20" height="20" viewBox="0 0 20 20" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M6 8 L10 12 L14 8" />
          </svg>
        </div>

        <!-- Expanded content -->
        <Transition name="expand">
          <div v-if="expandedIndex === i" class="card-body">
            <div class="body-layout">
              <!-- Animated SVG mockup -->
              <div ref="mockupRefs" class="body-visual">
                <svg :viewBox="mod.mockup.viewBox" fill="none" class="mockup-svg">
                  <rect :width="mod.mockup.w" :height="mod.mockup.h" rx="8"
                    fill="var(--color-bg-alt, #F5F3FA)" />
                  <g v-html="mod.mockup.svg" />
                </svg>
              </div>
              <!-- Bullets -->
              <ul class="body-bullets">
                <li v-for="b in mod.bullets" :key="b" class="bullet-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="var(--color-primary)" stroke-width="1.5" />
                    <path d="M5 8 L7 10 L11 6" stroke="var(--color-primary)" stroke-width="1.5"
                      stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span>{{ b }}</span>
                </li>
              </ul>
              <div v-if="mod.result" class="body-result">
                <Icon name="lucide:zap" size="16" class="result-icon" />
                <span class="result-text font-mono">{{ mod.result }}</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useGsap } from '~/composables/useGsap'

const { gsap } = useGsap()

const gridRef = ref<HTMLElement | null>(null)
const expandedIndex = ref<number | null>(null)

function toggle(index: number) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

// Animate content when a card expands
watch(expandedIndex, (idx) => {
  if (idx === null || !gridRef.value) return
  nextTick(() => {
    const card = gridRef.value?.querySelectorAll('.module-card')[idx]
    if (!card) return

    // Staggered bullet entrance
    const bullets = card.querySelectorAll('.bullet-item')
    gsap.fromTo(bullets,
      { opacity: 0, x: -14 },
      { opacity: 1, x: 0, stagger: 0.08, duration: 0.35, ease: 'power2.out', delay: 0.1 }
    )

    // SVG mockup elements fade-in from below
    const svgEls = card.querySelectorAll('.mockup-svg rect, .mockup-svg text, .mockup-svg circle, .mockup-svg line, .mockup-svg polyline')
    gsap.fromTo(svgEls,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, stagger: 0.02, duration: 0.3, ease: 'power2.out', delay: 0.05, overwrite: true }
    )

    // Result badge pop
    const result = card.querySelector('.body-result')
    if (result) {
      gsap.fromTo(result,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)', delay: 0.3 }
      )
    }
  })
})

const modules = [
  {
    title: 'Маршрут наблюдения',
    subtitle: 'Автоматическая генерация маршрутов по протоколам',
    result: '50+ событий маршрута создаются за 2 сек',
    iconPath: 'M20,14 A6,6 0 1,1 20,26 A6,6 0 1,1 20,14 M20,8 L20,11 M20,29 L20,32 M8,20 L11,20 M29,20 L32,20 M11.5,11.5 L13.6,13.6 M26.4,26.4 L28.5,28.5 M28.5,11.5 L26.4,13.6 M13.6,26.4 L11.5,28.5',
    mockup: {
      viewBox: '0 0 320 200',
      w: 320, h: 200,
      svg: `
        <text x="16" y="28" font-size="11" font-weight="700" fill="var(--color-text-primary)">Маршрут: Беременность</text>
        <rect x="16" y="40" width="288" height="24" rx="4" fill="var(--color-primary-ultralight, #F5F3FA)" />
        <rect x="16" y="40" width="200" height="24" rx="4" fill="var(--color-primary)" opacity="0.3" />
        <text x="24" y="56" font-size="10" fill="var(--color-text-primary)">Прогресс: 65% — 26 неделя</text>
        <rect x="16" y="74" width="140" height="32" rx="6" fill="white" stroke="var(--color-border, #E5E0DA)" stroke-width="1" />
        <text x="24" y="94" font-size="10" fill="var(--color-text-secondary)">I триместр ✓</text>
        <rect x="164" y="74" width="140" height="32" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="172" y="94" font-size="10" fill="var(--color-text-secondary)">II триместр ✓</text>
        <rect x="16" y="116" width="140" height="32" rx="6" fill="white" stroke="var(--color-primary)" stroke-width="1.5" />
        <text x="24" y="136" font-size="10" fill="var(--color-primary)" font-weight="600">III триместр ●</text>
        <rect x="164" y="116" width="140" height="32" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="172" y="136" font-size="10" fill="var(--color-text-muted)">Послеродовой</text>
        <rect x="16" y="160" width="288" height="28" rx="6" fill="var(--color-primary)" opacity="0.1" />
        <text x="24" y="178" font-size="10" fill="var(--color-primary)" font-weight="600">Следующее: УЗИ 28 нед. — через 5 дней</text>
      `,
    },
    bullets: [
      'Маршруты генерируются по протоколам МЗ РК',
      'Автоматический переход между триместрами',
      'Адаптация при отклонениях (группа риска)',
      'Хронология обновляется в реальном времени',
    ],
  },
  {
    title: 'Панель координатора',
    subtitle: 'Очередь задач координаторов с приоритетами',
    result: '–70% времени на ручную координацию',
    iconPath: 'M12,12 L14,14 L18,10 M22,12 L30,12 M12,20 L14,22 L18,18 M22,20 L30,20 M12,28 L14,30 L18,26 M22,28 L30,28',
    mockup: {
      viewBox: '0 0 320 200',
      w: 320, h: 200,
      svg: `
        <text x="16" y="28" font-size="11" font-weight="700" fill="var(--color-text-primary)">Задачи координатора</text>
        <circle cx="28" cy="52" r="5" fill="#D4727C" />
        <rect x="42" y="40" width="262" height="28" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="50" y="58" font-size="10" fill="var(--color-text-primary)">Каримова А. — пропущен визит (3 дня)</text>
        <circle cx="28" cy="88" r="5" fill="#E9C46A" />
        <rect x="42" y="76" width="262" height="28" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="50" y="94" font-size="10" fill="var(--color-text-primary)">Сериков М. — напомнить о прививке</text>
        <circle cx="28" cy="124" r="5" fill="#7CB8D4" />
        <rect x="42" y="112" width="262" height="28" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="50" y="130" font-size="10" fill="var(--color-text-primary)">Нурлан Б. — анализ готов, отправить</text>
        <circle cx="28" cy="160" r="5" fill="#7CB8D4" />
        <rect x="42" y="148" width="262" height="28" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="50" y="166" font-size="10" fill="var(--color-text-primary)">Айгуль К. — запись на УЗИ</text>
        <text x="16" y="196" font-size="10" fill="var(--color-text-muted)">Просрочено: 1 · Сегодня: 3 · Завтра: 5</text>
      `,
    },
    bullets: [
      'Задачи автоматически появляются из маршрута',
      'Приоритизация: красный → жёлтый → зелёный',
      'Автоэскалация при нарушении регламента',
      'Массовые уведомления (SMS) в 1 клик',
    ],
  },
  {
    title: 'Аналитика',
    subtitle: 'Удержание, LTV, NPS — когортная аналитика для руководителя',
    result: 'Удержание видно в реальном времени',
    iconPath: 'M10,30 L10,22 L16,22 L16,30 M18,30 L18,16 L24,16 L24,30 M26,30 L26,10 L32,10 L32,30 M8,30 L34,30',
    mockup: {
      viewBox: '0 0 320 200',
      w: 320, h: 200,
      svg: `
        <text x="16" y="28" font-size="11" font-weight="700" fill="var(--color-text-primary)">Сводка по удержанию</text>
        <rect x="16" y="40" width="90" height="50" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="24" y="58" font-size="9" fill="var(--color-text-muted)">Удержание</text>
        <text x="24" y="78" font-size="16" font-weight="700" fill="var(--color-primary)">72%</text>
        <rect x="116" y="40" width="90" height="50" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="124" y="58" font-size="9" fill="var(--color-text-muted)">Доход / семья</text>
        <text x="124" y="78" font-size="16" font-weight="700" fill="var(--color-primary)">1.2M</text>
        <rect x="216" y="40" width="90" height="50" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="224" y="58" font-size="9" fill="var(--color-text-muted)">NPS</text>
        <text x="224" y="78" font-size="16" font-weight="700" fill="var(--color-primary)">67</text>
        <line x1="16" y1="140" x2="304" y2="140" stroke="var(--color-border)" stroke-width="1" />
        <polyline points="30,132 70,125 110,118 150,112 190,105 230,98 270,92" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" />
        <text x="16" y="160" font-size="9" fill="var(--color-text-muted)">Янв</text>
        <text x="136" y="160" font-size="9" fill="var(--color-text-muted)">Апр</text>
        <text x="260" y="160" font-size="9" fill="var(--color-text-muted)">Июл</text>
        <text x="16" y="185" font-size="10" fill="var(--color-text-secondary)">Когорта Q1 2026: 85 семей → 61 удержано (72%)</text>
      `,
    },
    bullets: [
      'Удержание по когортам (месяц, квартал)',
      'Выручка на семью и тренды с графиками',
      'Загрузка координаторов и выполнение регламента',
      'Конверсия по этапам маршрута в реальном времени',
      'Экспорт отчётов в PDF и Excel',
    ],
  },
  {
    title: 'Умная запись',
    subtitle: 'Онлайн-запись, напоминания, интеграция с расписанием врачей',
    result: '–⁃40% неявок',
    iconPath: 'M10,12 L30,12 L30,32 L10,32 Z M10,12 L10,10 C10,8 12,8 12,8 L28,8 C28,8 30,8 30,10 L30,12 M15,8 L15,6 M25,8 L25,6 M10,18 L30,18 M16,23 L16,23.1 M20,23 L20,23.1 M24,23 L24,23.1 M16,27 L16,27.1 M20,27 L20,27.1',
    mockup: {
      viewBox: '0 0 320 200',
      w: 320, h: 200,
      svg: `
        <text x="16" y="28" font-size="11" font-weight="700" fill="var(--color-text-primary)">Расписание — 15 апреля</text>
        <rect x="16" y="40" width="288" height="36" rx="6" fill="var(--color-primary)" opacity="0.1" />
        <text x="24" y="56" font-size="10" fill="var(--color-primary)" font-weight="600">09:00</text>
        <text x="60" y="56" font-size="10" fill="var(--color-text-primary)">Каримова А. — УЗИ 28 нед.</text>
        <text x="24" y="70" font-size="9" fill="var(--color-text-muted)">Подтверждено ✓</text>
        <rect x="16" y="84" width="288" height="36" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="24" y="100" font-size="10" fill="var(--color-text-secondary)">10:30</text>
        <text x="60" y="100" font-size="10" fill="var(--color-text-primary)">Ботабекова Д. — осмотр 3 мес.</text>
        <text x="24" y="114" font-size="9" fill="var(--color-warning)">Ожидает подтверждения</text>
        <rect x="16" y="128" width="288" height="36" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="24" y="144" font-size="10" fill="var(--color-text-secondary)">14:00</text>
        <text x="60" y="144" font-size="10" fill="var(--color-text-primary)">Нурлан М. — вакцинация АКДС</text>
        <text x="24" y="158" font-size="9" fill="var(--color-text-muted)">Автоматическое SMS за 24ч</text>
      `,
    },
    bullets: [
      'Автоматическое SMS-напоминание за 24 и 2 часа',
      'Семья подтверждает запись в 1 нажатие',
      'Мониторинг неявок и автоперенос',
      'Синхронизация с расписанием врача',
    ],
  },
  {
    title: 'Медицинский архив',
    subtitle: 'Облачное хранилище анализов и документов семьи',
    result: '0 потерянных документов, доступ за 5 сек',
    iconPath: 'M8,14 L18,14 L20,11 L32,11 L32,31 L8,31 Z M8,14 L8,11 M8,18 L32,18',
    mockup: {
      viewBox: '0 0 320 200',
      w: 320, h: 200,
      svg: `
        <text x="16" y="28" font-size="11" font-weight="700" fill="var(--color-text-primary)">Архив — Каримова А.</text>
        <rect x="16" y="40" width="140" height="60" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="24" y="58" font-size="9" fill="var(--color-text-muted)">Анализы</text>
        <text x="24" y="74" font-size="14" font-weight="700" fill="var(--color-text-primary)">12</text>
        <text x="24" y="90" font-size="9" fill="var(--color-primary)">Последний: 2 дня назад</text>
        <rect x="164" y="40" width="140" height="60" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="172" y="58" font-size="9" fill="var(--color-text-muted)">УЗИ</text>
        <text x="172" y="74" font-size="14" font-weight="700" fill="var(--color-text-primary)">4</text>
        <text x="172" y="90" font-size="9" fill="var(--color-primary)">12 нед, 20 нед, 28 нед, 32 нед</text>
        <rect x="16" y="110" width="140" height="60" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="24" y="128" font-size="9" fill="var(--color-text-muted)">Выписки</text>
        <text x="24" y="144" font-size="14" font-weight="700" fill="var(--color-text-primary)">2</text>
        <rect x="164" y="110" width="140" height="60" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="172" y="128" font-size="9" fill="var(--color-text-muted)">Вакцинация</text>
        <text x="172" y="144" font-size="14" font-weight="700" fill="var(--color-text-primary)">7</text>
      `,
    },
    bullets: [
      'Фото анализов распознаются автоматически (OCR)',
      'Структурированное хранение по категориям',
      'Мгновенный поиск по дате или типу',
      'Безопасная отправка врачу по ссылке',
    ],
  },
  {
    title: 'Умные назначения',
    subtitle: 'Контроль приёма витаминов и лекарств с напоминаниями',
    result: 'Соблюдение назначений 94% vs 45% без системы',
    iconPath: 'M16,12 C16,9 18,7 20,7 C22,7 24,9 24,12 L24,28 C24,31 22,33 20,33 C18,33 16,31 16,28 Z M16,20 L24,20',
    mockup: {
      viewBox: '0 0 320 200',
      w: 320, h: 200,
      svg: `
        <text x="16" y="28" font-size="11" font-weight="700" fill="var(--color-text-primary)">Назначения — Каримова А.</text>
        <rect x="16" y="40" width="288" height="36" rx="6" fill="var(--color-primary)" opacity="0.08" />
        <circle cx="36" cy="58" r="10" fill="var(--color-success)" opacity="0.2" />
        <text x="30" y="62" font-size="12" fill="var(--color-success)">✓</text>
        <text x="54" y="54" font-size="10" fill="var(--color-text-primary)" font-weight="600">Фолиевая кислота</text>
        <text x="54" y="68" font-size="9" fill="var(--color-text-muted)">08:00 — принято</text>
        <rect x="16" y="84" width="288" height="36" rx="6" fill="var(--color-warning)" opacity="0.08" />
        <circle cx="36" cy="102" r="10" fill="var(--color-warning)" opacity="0.2" />
        <text x="30" y="106" font-size="12" fill="var(--color-warning)">⏳</text>
        <text x="54" y="98" font-size="10" fill="var(--color-text-primary)" font-weight="600">Витамин D3</text>
        <text x="54" y="112" font-size="9" fill="var(--color-text-muted)">14:00 — ожидает</text>
        <rect x="16" y="128" width="288" height="36" rx="6" fill="white" stroke="var(--color-border)" stroke-width="1" />
        <text x="54" y="142" font-size="10" fill="var(--color-text-primary)" font-weight="600">Магний B6</text>
        <text x="54" y="156" font-size="9" fill="var(--color-text-muted)">20:00 — вечерний приём</text>
        <text x="16" y="186" font-size="10" fill="var(--color-primary)" font-weight="600">Соблюдение за неделю: 94%</text>
      `,
    },
    bullets: [
      'Врач назначает — семья получает чёткий график',
      'Напоминания в нужное время',
      'Мониторинг соблюдения назначений для координатора',
      'Автоэскалация при пропуске 3+ приёмов',
    ],
  },
  {
    title: 'Календарь вакцинации',
    subtitle: '18+ прививок по нацкалендарю с автонапоминаниями',
    result: '0 пропущенных прививок',
    iconPath: 'M20,8 L20,26 M16,12 L24,12 M16,16 L24,16 M16,20 L24,20 M17,26 L23,26 L23,30 C23,32 17,32 17,30 Z M20,8 L18,6 M20,8 L22,6',
    mockup: {
      viewBox: '0 0 320 200',
      w: 320, h: 200,
      svg: `
        <text x="16" y="28" font-size="11" font-weight="700" fill="var(--color-text-primary)">Вакцинация — Нурлан, 4 мес.</text>
        <rect x="16" y="40" width="288" height="28" rx="6" fill="var(--color-success)" opacity="0.1" />
        <text x="24" y="58" font-size="10" fill="var(--color-success)">✓ БЦЖ — 0 мес.</text>
        <rect x="16" y="74" width="288" height="28" rx="6" fill="var(--color-success)" opacity="0.1" />
        <text x="24" y="92" font-size="10" fill="var(--color-success)">✓ Гепатит B (1) — 0 мес.</text>
        <rect x="16" y="108" width="288" height="28" rx="6" fill="var(--color-success)" opacity="0.1" />
        <text x="24" y="126" font-size="10" fill="var(--color-success)">✓ АКДС (1) — 2 мес.</text>
        <rect x="16" y="142" width="288" height="28" rx="6" fill="var(--color-primary)" opacity="0.1" stroke="var(--color-primary)" stroke-width="1" />
        <text x="24" y="160" font-size="10" fill="var(--color-primary)" font-weight="600">→ АКДС (2) — через 3 дня</text>
        <text x="16" y="190" font-size="10" fill="var(--color-text-muted)">Следующая: Полио (2) — 6 мес.</text>
      `,
    },
    bullets: [
      'Автоматический календарь по нацстандартам',
      'Напоминания за 3 дня и в день прививки',
      'Электронный сертификат вакцинации',
      'Эскалация при пропуске срока',
    ],
  },
  {
    title: 'Хронология',
    subtitle: 'Полная хронология событий маршрута семьи',
    result: 'NPS +35 пунктов',
    iconPath: 'M8,30 L14,22 L20,25 L26,15 L32,10 M8,30 L8,8 M8,30 L32,30',
    mockup: {
      viewBox: '0 0 320 200',
      w: 320, h: 200,
      svg: `
        <text x="16" y="28" font-size="11" font-weight="700" fill="var(--color-text-primary)">Хронология — Каримова А.</text>
        <line x1="40" y1="40" x2="40" y2="190" stroke="var(--color-border)" stroke-width="2" />
        <circle cx="40" cy="56" r="6" fill="var(--color-success)" />
        <text x="56" y="52" font-size="9" fill="var(--color-text-muted)">10 апр</text>
        <text x="56" y="64" font-size="10" fill="var(--color-text-primary)">Анализ крови — в норме ✓</text>
        <circle cx="40" cy="96" r="6" fill="var(--color-success)" />
        <text x="56" y="92" font-size="9" fill="var(--color-text-muted)">8 апр</text>
        <text x="56" y="104" font-size="10" fill="var(--color-text-primary)">Визит к гинекологу ✓</text>
        <circle cx="40" cy="136" r="6" fill="var(--color-primary)" />
        <text x="56" y="132" font-size="9" fill="var(--color-primary)" font-weight="600">Сегодня</text>
        <text x="56" y="144" font-size="10" fill="var(--color-text-primary)">Витамин D3 — утренний приём</text>
        <circle cx="40" cy="176" r="6" fill="var(--color-border)" />
        <text x="56" y="172" font-size="9" fill="var(--color-text-muted)">15 апр</text>
        <text x="56" y="184" font-size="10" fill="var(--color-text-muted)">УЗИ 28 нед.</text>
      `,
    },
    bullets: [
      'Хронологическая лента всех событий маршрута',
      'Статусы: выполнено, просрочено, предстоит',
      'Фильтрация по типу: визиты, анализы, назначения',
      'Экспорт в PDF для семьи и для врача',
    ],
  },
]
</script>

<style scoped>
.modules-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.module-card {
  cursor: pointer;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  overflow: hidden;
}

.module-card:hover {
  border-color: var(--color-primary-light, #E8E4F5);
  box-shadow: 0 4px 16px rgba(139, 126, 200, 0.08);
}

.module-card.expanded {
  border-color: var(--color-primary);
  box-shadow: 0 8px 32px rgba(139, 126, 200, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
}

.card-icon-wrap {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--color-primary-ultralight, #F5F3FA);
}

.card-header-text {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.card-subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
  line-height: 1.4;
}

.chevron {
  flex-shrink: 0;
  color: var(--color-text-muted);
  transition: transform 0.3s ease;
}

.expanded .chevron {
  transform: rotate(180deg);
}

/* Expanded card glow */
.expanded {
  border-color: var(--color-primary) !important;
  box-shadow: var(--shadow-card), 0 0 30px rgba(139, 126, 200, 0.08);
}

/* Icon rotation on hover */
.card-icon-wrap svg {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.module-card:hover .card-icon-wrap svg {
  transform: rotate(8deg) scale(1.08);
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.35s ease;
  max-height: 800px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.card-body {
  padding: 0 24px 24px;
}

.body-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.body-visual {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-border-light, #F0EDF7);
  min-height: 200px;
  background: linear-gradient(135deg, var(--color-bg-alt) 0%, var(--color-surface) 100%);
  transition: box-shadow 0.4s ease;
}
.expanded .body-visual {
  box-shadow: 0 4px 20px rgba(139, 126, 200, 0.06);
}

.mockup-svg {
  width: 100%;
  height: auto;
  display: block;
}

.body-bullets {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bullet-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.bullet-item svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.body-result {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary);
  transform-origin: left center;
}

.result-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.result-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  letter-spacing: var(--tracking-wide);
}

@media (max-width: 768px) {
  .card-header {
    padding: 16px;
  }

  .body-layout {
    grid-template-columns: 1fr;
  }

  .card-body {
    padding: 0 16px 16px;
  }
}
</style>
