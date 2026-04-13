<template>
  <section id="product" ref="sectionRef" class="product-showcase-section landing-section">
    <div class="landing-container">
      <div class="section-header">
        <span class="section-badge font-heading" data-reveal="scale-in">Продукт</span>
        <h2 ref="titleRef" class="section-title font-display">Три интерфейса — одна платформа</h2>
        <p class="section-subtitle" data-reveal="fade-up" data-reveal-delay="200">Каждый участник процесса видит то, что нужно именно ему</p>
      </div>

      <div class="showcase-tabs" data-reveal="fade-up" data-reveal-delay="300">
        <div class="tabs-track">
          <div class="tab-indicator" :style="tabIndicatorStyle" />
          <button
            v-for="(tab, i) in tabs"
            :key="i"
            :ref="(el) => { tabRefs[i] = el as HTMLElement }"
            class="showcase-tab font-heading"
            :class="{ 'is-active': activeTab === i }"
            @click="switchTab(i)"
          >
            <Icon :name="tab.icon" size="18" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div ref="contentRef" class="showcase-content">
        <div :key="activeTab" class="showcase-panel">
          <!-- Device frame — larger -->
          <div class="showcase-device-col">
            <div ref="deviceRef" class="device-frame" :class="activePanel.device">
              <div class="device-notch" />
              <div class="device-screen">
                <div class="screen-content">
                  <div class="screen-header" :style="{ background: activePanel.headerBg }">
                    <span class="screen-header-title">{{ activePanel.screenTitle }}</span>
                    <div class="screen-header-dots">
                      <span class="screen-dot" />
                      <span class="screen-dot" />
                      <span class="screen-dot" />
                    </div>
                  </div>
                  <div class="screen-body">
                    <div
                      v-for="(item, j) in activePanel.items"
                      :key="`${activeTab}-${j}`"
                      :ref="(el) => { rowRefs[j] = el as HTMLElement }"
                      class="screen-row"
                      :class="{ 'is-highlighted': highlightedRow === j }"
                      @click="highlightRow(j)"
                    >
                      <div class="screen-row-icon" :style="{ background: item.color + '20', color: item.color }">
                        <Icon :name="item.icon" size="16" />
                      </div>
                      <div class="screen-row-text">
                        <span class="screen-row-label">{{ item.label }}</span>
                        <span class="screen-row-meta">{{ item.meta }}</span>
                      </div>
                      <span v-if="item.badge" class="screen-row-badge" :style="{ background: item.color + '15', color: item.color }">
                        {{ item.badge }}
                      </span>
                      <!-- Tooltip callout -->
                      <div v-if="highlightedRow === j && item.callout" class="row-callout">
                        <span class="callout-arrow" />
                        <span class="callout-text">{{ item.callout }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div ref="infoRef" class="showcase-info">
            <h3 class="showcase-info-title font-heading">{{ activePanel.title }}</h3>
            <p class="showcase-info-desc">{{ activePanel.description }}</p>
            <ul class="showcase-features">
              <li
                v-for="(feature, k) in activePanel.features"
                :key="`${activeTab}-f-${k}`"
                :ref="(el) => { featureRefs[k] = el as HTMLElement }"
                :class="{ 'is-active-feature': highlightedRow === k }"
              >
                <Icon name="lucide:check" size="16" class="feature-check" />
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { gsap, ScrollTrigger } = useGsap()

const sectionRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const deviceRef = ref<HTMLElement | null>(null)
const infoRef = ref<HTMLElement | null>(null)
const tabRefs = ref<(HTMLElement | null)[]>([])
const rowRefs = ref<(HTMLElement | null)[]>([])
const featureRefs = ref<(HTMLElement | null)[]>([])

const activeTab = ref(0)
const isAnimating = ref(false)
const highlightedRow = ref(-1)
let tourInterval: ReturnType<typeof setInterval> | null = null

useSplitText(titleRef, {
  type: 'words',
  from: { y: '80%', opacity: 0 },
  stagger: 0.04,
  duration: 0.7,
  ease: 'power3.out',
})

const tabs = [
  { label: 'Приложение мамы', icon: 'lucide:smartphone' },
  { label: 'Панель координатора', icon: 'lucide:layout-dashboard' },
  { label: 'Дашборд руководителя', icon: 'lucide:bar-chart-3' },
]

const panels = [
  {
    device: 'device-phone',
    screenTitle: 'Мой маршрут',
    headerBg: 'var(--color-secondary-light)',
    title: 'Мобильное приложение для семьи',
    description: 'Мама видит весь маршрут — от текущей недели беременности до следующей прививки. Всё в одном экране, без звонков.',
    features: [
      'Push-напоминания о витаминах и приёмах',
      'Все анализы и документы — нашёл за 5 секунд',
      'Запись к врачу в одно касание',
      'Календарь прививок с напоминаниями за 3 дня',
    ],
    items: [
      { icon: 'lucide:pill', label: 'Витамин D3', meta: 'Ежедневно, 08:00', badge: 'Принять', color: '#8B7EC8', callout: 'Push-напоминание каждое утро' },
      { icon: 'lucide:calendar-check', label: 'Педиатр — осмотр', meta: 'Завтра, 10:30', badge: null, color: '#D47EA5', callout: 'Запись к врачу в одно касание' },
      { icon: 'lucide:file-text', label: 'Анализ крови', meta: 'Результат готов', badge: 'Новый', color: '#7CB8D4', callout: 'Результаты анализов мгновенно' },
      { icon: 'lucide:shield-check', label: 'АКДС — 1-я доза', meta: 'Через 5 дней', badge: null, color: '#E9C46A', callout: 'Напоминание за 3 дня до прививки' },
      { icon: 'lucide:baby', label: 'Развитие: 4 месяца', meta: 'Переворачивается', badge: null, color: '#8B7EC8', callout: null },
    ],
  },
  {
    device: 'device-desktop',
    screenTitle: 'Панель координатора',
    headerBg: 'var(--color-primary-light)',
    title: 'Рабочий стол координатора',
    description: 'Координатор видит все семьи на одном экране — кто выпал из маршрута, у кого низкое соблюдение, кому пора на визит.',
    features: [
      'Приоритеты: красные флаги наверху',
      'Соблюдение назначений по каждой семье',
      'Статус прививок и просрочки',
      'Быстрые действия: напомнить, записать, позвонить',
    ],
    items: [
      { icon: 'lucide:alert-triangle', label: 'Семья А. — пропущено 2 визита', meta: 'Беременность, 28 нед.', badge: 'Срочно', color: '#D4727C', callout: 'Красный флаг — приоритет №1' },
      { icon: 'lucide:clock', label: 'Семья Б. — прививка просрочена', meta: 'Ребёнок, 4 мес.', badge: 'Просрочено', color: '#E9C46A', callout: 'Автоматическое отслеживание просроченных' },
      { icon: 'lucide:check-circle', label: 'Семья В. — маршрут в норме', meta: 'Ребёнок, 8 мес.', badge: 'В норме', color: '#7CB8D4', callout: 'Соблюдение назначений в реальном времени' },
      { icon: 'lucide:check-circle', label: 'Семья Г. — все визиты', meta: 'Беременность, 36 нед.', badge: '✓', color: '#7CB8D4', callout: 'Полный контроль выполнения маршрута' },
    ],
  },
  {
    device: 'device-desktop',
    screenTitle: 'Аналитика',
    headerBg: 'var(--color-accent-blue-light)',
    title: 'Дашборд для руководителя',
    description: 'Руководитель видит цифры: удержание семей, конверсия из беременности в педиатрию, загрузка команды. Когортный анализ в реальном времени.',
    features: [
      'Удержание по когортам: месяц → квартал → год',
      'Конверсия: беременность → роды → педиатрия',
      'Загрузка координаторов и время ответа',
      'NPS и engagement по модулям',
    ],
    items: [
      { icon: 'lucide:users', label: 'Активных семей', meta: 'За текущий месяц', badge: 'Демо', color: '#8B7EC8', callout: 'Когортный трекинг в реальном времени' },
      { icon: 'lucide:trending-up', label: 'Удержание', meta: 'По когортам', badge: 'Тренд', color: '#7CB8D4', callout: 'Удержание по когортам: месяц → год' },
      { icon: 'lucide:arrow-right-left', label: 'Конверсия в педиатрию', meta: 'После родов', badge: 'Воронка', color: '#D47EA5', callout: 'Конверсия из беременности в педиатрию' },
      { icon: 'lucide:bar-chart-3', label: 'Загрузка команды', meta: 'Координаторы', badge: 'Обзор', color: '#E9C46A', callout: 'Загрузка координаторов в реальном времени' },
    ],
  },
]

const activePanel = computed(() => panels[activeTab.value]!)

const tabIndicatorStyle = computed(() => {
  const el = tabRefs.value[activeTab.value]
  if (!el) return { width: '0px', transform: 'translateX(0px)' }
  return {
    width: `${el.offsetWidth}px`,
    transform: `translateX(${el.offsetLeft}px)`,
  }
})

function stopTour() {
  if (tourInterval) { clearInterval(tourInterval); tourInterval = null }
}

function startTour() {
  stopTour()
  const items = activePanel.value.items
  let step = 0
  highlightedRow.value = 0

  tourInterval = setInterval(() => {
    step = (step + 1) % items.length
    highlightedRow.value = step
  }, 3500)
}

function highlightRow(j: number) {
  stopTour()
  highlightedRow.value = j
}

function switchTab(i: number) {
  if (i === activeTab.value || isAnimating.value || !gsap) return
  isAnimating.value = true
  stopTour()
  highlightedRow.value = -1

  const tl = gsap.timeline({
    onComplete: () => {
      activeTab.value = i
      nextTick(() => animateIn())
    },
  })

  if (deviceRef.value) {
    tl.to(deviceRef.value, { opacity: 0, y: 30, scale: 0.95, duration: 0.3, ease: 'power2.in' }, 0)
  }
  if (infoRef.value) {
    tl.to(infoRef.value, { opacity: 0, x: 30, duration: 0.25, ease: 'power2.in' }, 0.05)
  }
}

function animateIn() {
  if (!gsap) { isAnimating.value = false; return }

  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false
      startTour()
    },
  })

  if (deviceRef.value) {
    gsap.set(deviceRef.value, { opacity: 0, y: 40, scale: 0.93 })
    tl.to(deviceRef.value, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.4)' }, 0)
  }

  if (infoRef.value) {
    gsap.set(infoRef.value, { opacity: 0, x: 40 })
    tl.to(infoRef.value, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0.15)
  }

  const rows = rowRefs.value.filter(Boolean) as HTMLElement[]
  if (rows.length) {
    gsap.set(rows, { opacity: 0, x: -20 })
    tl.to(rows, { opacity: 1, x: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' }, 0.2)
  }

  const features = featureRefs.value.filter(Boolean) as HTMLElement[]
  if (features.length) {
    gsap.set(features, { opacity: 0, y: 12 })
    tl.to(features, { opacity: 1, y: 0, duration: 0.3, stagger: 0.07, ease: 'power2.out' }, 0.35)
  }
}

onMounted(() => {
  if (!gsap || !ScrollTrigger || !contentRef.value) return

  gsap.set(contentRef.value, { opacity: 0, y: 60 })

  ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.to(contentRef.value, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        onComplete: () => animateIn(),
      })
    },
  })
})

onUnmounted(() => {
  stopTour()
})
</script>

<style scoped>
.product-showcase-section {
  padding: var(--section-py) 0;
  overflow: hidden;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: var(--radius-full);
  background: var(--color-accent-blue-light);
  color: var(--color-accent-blue);
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
  max-width: 520px;
  margin-inline: auto;
}

/* Tabs */
.showcase-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 48px;
}

.tabs-track {
  display: inline-flex;
  position: relative;
  gap: 6px;
  padding: 4px;
  background: var(--color-bg-alt);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-light);
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 0;
  height: calc(100% - 8px);
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.showcase-tab {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s ease;
}

.showcase-tab:hover {
  color: var(--color-text-primary);
}

.showcase-tab.is-active {
  color: white;
}

/* Panel — 55/45 split for larger device */
.showcase-panel {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 48px;
  align-items: center;
}

/* Device column */
.showcase-device-col {
  display: flex;
  justify-content: center;
}

/* Device frames — larger */
.device-frame {
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  box-shadow:
    0 8px 30px rgba(139, 126, 200, 0.12),
    0 0 0 1px rgba(139, 126, 200, 0.06);
  overflow: hidden;
  will-change: transform, opacity;
  width: 100%;
}

.device-phone {
  max-width: 380px;
  border-radius: 28px;
}

.device-phone .device-notch {
  width: 100px;
  height: 5px;
  background: var(--color-border);
  border-radius: 3px;
  margin: 10px auto 0;
}

.device-desktop .device-notch {
  display: none;
}

.device-desktop {
  max-width: 100%;
  border-radius: 12px;
}

.device-screen {
  overflow: hidden;
}

.screen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
}

.screen-header-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.screen-header-dots {
  display: flex;
  gap: 5px;
}

.screen-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-border);
}

.screen-body {
  padding: 12px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.screen-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  border: 1px solid var(--color-border-light);
  will-change: transform, opacity;
  transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
  cursor: pointer;
}

.screen-row:hover {
  box-shadow: 0 2px 8px rgba(139, 126, 200, 0.1);
}

.screen-row.is-highlighted {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(139, 126, 200, 0.2), 0 4px 16px rgba(139, 126, 200, 0.15);
  transform: translateX(4px);
}

.screen-row-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.screen-row-text {
  flex: 1;
  min-width: 0;
}

.screen-row-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.screen-row-meta {
  display: block;
  font-size: 11px;
  color: var(--color-text-muted);
}

.screen-row-badge {
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Callout tooltips */
.row-callout {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translate(100%, -50%);
  background: var(--color-primary);
  color: white;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
  animation: calloutIn 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(139, 126, 200, 0.3);
}

.callout-arrow {
  position: absolute;
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 5px solid var(--color-primary);
}

@keyframes calloutIn {
  from { opacity: 0; transform: translate(calc(100% + 8px), -50%); }
  to { opacity: 1; transform: translate(100%, -50%); }
}

/* Info */
.showcase-info {
  will-change: transform, opacity;
}

.showcase-info-title {
  font-size: var(--text-h3);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 12px;
}

.showcase-info-desc {
  font-size: var(--text-body);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 24px;
}

.showcase-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.showcase-features li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  will-change: transform, opacity;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  transition: background 0.3s ease, color 0.3s ease;
}

.showcase-features li.is-active-feature {
  background: var(--color-primary-light);
  color: var(--color-text-primary);
}

.feature-check {
  color: var(--color-success);
  flex-shrink: 0;
  margin-top: 2px;
}

@media (max-width: 900px) {
  .showcase-panel {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .tabs-track {
    flex-wrap: wrap;
    border-radius: var(--radius-lg);
  }

  .tab-indicator {
    display: none;
  }

  .showcase-tab.is-active {
    background: var(--color-primary);
    color: white;
  }

  .device-phone {
    max-width: 320px;
  }

  /* Hide callouts on mobile — overlap issues */
  .row-callout {
    display: none;
  }
}

@media (max-width: 640px) {
  .showcase-tab {
    font-size: var(--text-xs);
    padding: 8px 14px;
  }
}
</style>
