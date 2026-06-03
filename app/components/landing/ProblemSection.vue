<template>
  <section
    ref="sectionRef"
    class="problem-spectacle"
    aria-label="Проблемы клиник, которые решает UMAI Health"
  >
    <!-- ───── Pin container — sticky viewport 100vh ───── -->
    <div ref="pinRef" class="problem-pin">
      <!-- Ambient drift orbs (under everything) -->
      <div class="problem-ambient" aria-hidden="true">
        <div class="ambient-orb ambient-orb-1" />
        <div class="ambient-orb ambient-orb-2" />
      </div>

      <div class="problem-stage landing-container">
        <!-- ─── Left rail: header + caption ─── -->
        <div class="problem-rail">
          <span class="t-eyebrow problem-eyebrow">Проблема</span>
          <h2 class="t-display-section problem-title">
            Знакомая <span class="t-accent-serif">ситуация</span>?
          </h2>

          <!-- Caption stack — only one visible per scene -->
          <div class="problem-captions" aria-live="polite">
            <div
              v-for="(act, i) in acts"
              :key="act.id"
              :ref="(el) => (captionRefs[i] = el as HTMLElement)"
              class="problem-caption"
              :class="{ 'is-active': activeIdx === i }"
            >
              <div class="caption-num font-mono">0{{ i + 1 }}</div>
              <h3 class="caption-headline t-h3">{{ act.headline }}</h3>
              <p class="caption-body t-body">{{ act.body }}</p>
              <ul class="caption-points">
                <li v-for="p in act.points" :key="p" class="caption-point">
                  <Icon name="lucide:circle-dot" size="12" class="caption-point-icon" />
                  <span>{{ p }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- ─── Right stage: scenes ─── -->
        <div class="problem-scenes">
          <!-- Scene 1 — Mom in 3 chats -->
          <div
            ref="scene1Ref"
            class="scene scene-1"
            :class="{ 'is-active': activeIdx === 0 }"
            aria-hidden="true"
          >
            <div class="phones-row">
              <div
                v-for="(phone, p) in chatPhones"
                :key="p"
                :ref="(el) => (phoneRefs[p] = el as HTMLElement)"
                class="chat-phone"
                :class="`chat-phone-${p}`"
                :style="{ '--phone-rotate': phone.rotate, '--phone-delay': `${p * 0.12}s` }"
              >
                <div class="chat-phone-frame">
                  <div class="chat-phone-screen">
                    <!-- Header strip mimicking messenger -->
                    <div class="chat-header" :class="`chat-header--${phone.kind}`">
                      <div class="chat-avatar">
                        <Icon :name="phone.icon" size="14" />
                      </div>
                      <div class="chat-meta">
                        <span class="chat-name">{{ phone.contact }}</span>
                        <span class="chat-status">{{ phone.status }}</span>
                      </div>
                      <span class="chat-time font-mono">{{ phone.time }}</span>
                    </div>
                    <!-- Messages -->
                    <div class="chat-body">
                      <div
                        v-for="(msg, m) in phone.messages"
                        :key="m"
                        class="chat-bubble"
                        :class="[
                          msg.side === 'me' ? 'bubble-me' : 'bubble-them',
                          msg.tone ? `bubble-${msg.tone}` : '',
                        ]"
                        :style="{ '--bubble-delay': `${m * 0.18}s` }"
                      >
                        {{ msg.text }}
                        <span v-if="msg.ts" class="bubble-ts font-mono">{{ msg.ts }}</span>
                      </div>
                      <!-- typing indicator on last phone -->
                      <div v-if="phone.typing" class="chat-typing">
                        <span /><span /><span />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lost-message flag — floats above the row -->
            <div class="lost-flag">
              <div class="lost-flag-pulse" />
              <Icon name="lucide:alert-circle" size="14" />
              <span>Сообщение потерялось 4 дня назад</span>
            </div>
          </div>

          <!-- Scene 2 — Coordinator's chaos -->
          <div
            ref="scene2Ref"
            class="scene scene-2"
            :class="{ 'is-active': activeIdx === 1 }"
            aria-hidden="true"
          >
            <!-- Excel side -->
            <div class="chaos-side chaos-excel">
              <div class="chaos-label">Сегодня</div>
              <div class="excel-grid">
                <div class="excel-header">
                  <span>Семья</span>
                  <span>Этап</span>
                  <span>?</span>
                </div>
                <div
                  v-for="(row, r) in excelRows"
                  :key="r"
                  class="excel-row"
                  :class="{ 'row-lost': row.lost }"
                  :style="{ '--row-delay': `${r * 0.05}s` }"
                >
                  <span class="excel-name">{{ row.name }}</span>
                  <span class="excel-stage">{{ row.stage }}</span>
                  <span class="excel-status">{{ row.status }}</span>
                </div>
              </div>
              <div class="chaos-tag chaos-tag--bad">
                <Icon name="lucide:trending-down" size="12" />
                <span>5 семей выпали</span>
              </div>
            </div>

            <!-- Arrow morph -->
            <div class="chaos-arrow" aria-hidden="true">
              <svg viewBox="0 0 120 40" class="arrow-svg">
                <defs>
                  <linearGradient id="arrowGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#8B7EC8" />
                    <stop offset="100%" stop-color="#E8A0BF" />
                  </linearGradient>
                </defs>
                <path
                  ref="arrowPathRef"
                  d="M5 20 Q60 5 100 20 Q105 22 115 20"
                  stroke="url(#arrowGrad)"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  class="arrow-path"
                />
                <polygon
                  points="108,12 118,20 108,28"
                  fill="url(#arrowGrad)"
                  class="arrow-head"
                />
              </svg>
              <span class="chaos-arrow-label">UMAI</span>
            </div>

            <!-- Kanban side -->
            <div class="chaos-side chaos-kanban">
              <div class="chaos-label">С платформой</div>
              <div class="kanban-cols">
                <div
                  v-for="(col, c) in kanbanCols"
                  :key="c"
                  class="kanban-col"
                  :style="{ '--col-delay': `${c * 0.1}s` }"
                >
                  <div class="kanban-col-head">
                    <span class="kanban-col-name">{{ col.title }}</span>
                    <span class="kanban-col-count font-mono">{{ col.cards.length }}</span>
                  </div>
                  <div
                    v-for="(card, k) in col.cards"
                    :key="k"
                    class="kanban-card"
                    :class="`kanban-card--${col.tone}`"
                    :style="{ '--card-delay': `${0.2 + c * 0.1 + k * 0.06}s` }"
                  >
                    <span class="kanban-card-name">{{ card.name }}</span>
                    <span class="kanban-card-meta">{{ card.meta }}</span>
                  </div>
                </div>
              </div>
              <div class="chaos-tag chaos-tag--good">
                <Icon name="lucide:check-circle-2" size="12" />
                <span>0 семей выпало</span>
              </div>
            </div>
          </div>

          <!-- Scene 3 — Chief sees too late -->
          <div
            ref="scene3Ref"
            class="scene scene-3"
            :class="{ 'is-active': activeIdx === 2 }"
            aria-hidden="true"
          >
            <div class="lag-chart">
              <div class="lag-chart-header">
                <span class="lag-chart-title t-h4">Отток семей в клинике, %</span>
                <div class="lag-chart-legend">
                  <span class="legend-item legend-real">
                    <span class="legend-swatch" />
                    Реальный отток
                  </span>
                  <span class="legend-item legend-seen">
                    <span class="legend-swatch" />
                    Что видит руководитель
                  </span>
                </div>
              </div>

              <!-- Chart SVG -->
              <svg
                ref="lagChartRef"
                viewBox="0 0 600 280"
                class="lag-chart-svg"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="realFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#D4727C" stop-opacity="0.25" />
                    <stop offset="100%" stop-color="#D4727C" stop-opacity="0" />
                  </linearGradient>
                  <linearGradient id="seenFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#8B7EC8" stop-opacity="0.18" />
                    <stop offset="100%" stop-color="#8B7EC8" stop-opacity="0" />
                  </linearGradient>
                </defs>

                <!-- Grid -->
                <g class="lag-grid">
                  <line v-for="g in 5" :key="g" :x1="40" :y1="40 + (g - 1) * 50" :x2="580" :y2="40 + (g - 1) * 50" />
                </g>

                <!-- Real attrition area (red — happens NOW) -->
                <path
                  ref="realPathRef"
                  d="M40 80 L130 90 L220 105 L310 130 L400 165 L490 200 L580 235"
                  stroke="#D4727C"
                  stroke-width="2.5"
                  fill="none"
                  stroke-linecap="round"
                  class="line-real"
                />
                <path
                  d="M40 80 L130 90 L220 105 L310 130 L400 165 L490 200 L580 235 L580 240 L40 240 Z"
                  fill="url(#realFill)"
                  class="area-real"
                />

                <!-- Seen attrition area (lavender — lags 3 months) -->
                <path
                  ref="seenPathRef"
                  d="M40 75 L130 80 L220 85 L310 95 L400 110 L490 135 L580 165"
                  stroke="#8B7EC8"
                  stroke-width="2.5"
                  stroke-dasharray="6 4"
                  fill="none"
                  stroke-linecap="round"
                  class="line-seen"
                />
                <path
                  d="M40 75 L130 80 L220 85 L310 95 L400 110 L490 135 L580 165 L580 240 L40 240 Z"
                  fill="url(#seenFill)"
                  class="area-seen"
                />

                <!-- Today vertical -->
                <line ref="todayMarkerRef" x1="490" y1="40" x2="490" y2="240" stroke="#7B7394" stroke-width="1" stroke-dasharray="2 4" class="today-marker" />
                <text x="495" y="36" font-size="10" fill="#7B7394" font-family="Geist Mono, monospace">сегодня</text>

                <!-- X-axis labels -->
                <g class="lag-x-labels" font-family="Geist Mono, monospace" font-size="10" fill="#7B7394">
                  <text x="40" y="262">Янв</text>
                  <text x="130" y="262">Фев</text>
                  <text x="220" y="262">Мар</text>
                  <text x="310" y="262">Апр</text>
                  <text x="400" y="262">Май</text>
                  <text x="490" y="262">Июн</text>
                  <text x="580" y="262">Июл</text>
                </g>

                <!-- Gap callout -->
                <g ref="gapCalloutRef" class="gap-callout">
                  <rect x="490" y="160" width="80" height="40" rx="6" fill="white" stroke="#D4727C" stroke-width="1.5" />
                  <text x="530" y="178" text-anchor="middle" font-family="Geist Mono, monospace" font-size="11" font-weight="600" fill="#D4727C">+70 семей</text>
                  <text x="530" y="194" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#7B7394">скрыто от вас</text>
                </g>

                <!-- Pulse dot on real line — current month -->
                <circle ref="pulseDotRef" cx="490" cy="200" r="5" fill="#D4727C" class="pulse-dot" />
                <circle cx="490" cy="200" r="10" fill="#D4727C" opacity="0.25" class="pulse-dot-ring" />
              </svg>

              <!-- Stat row below -->
              <div class="lag-stats">
                <div class="lag-stat">
                  <span class="lag-stat-val t-kpi" style="font-size: 1.6rem; color: var(--color-danger);">3 мес.</span>
                  <span class="lag-stat-lbl t-meta">задержка отчёта</span>
                </div>
                <div class="lag-stat">
                  <span class="lag-stat-val t-kpi" style="font-size: 1.6rem; color: var(--color-danger);">−14%</span>
                  <span class="lag-stat-lbl t-meta">скрытая потеря</span>
                </div>
                <div class="lag-stat">
                  <span class="lag-stat-val t-kpi" style="font-size: 1.6rem; color: var(--color-text-muted);">0</span>
                  <span class="lag-stat-lbl t-meta">алертов в момент потери</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── Progress indicator (right rail) ─── -->
        <div class="problem-progress" aria-hidden="true">
          <div
            v-for="(_, i) in acts"
            :key="i"
            class="progress-dot"
            :class="{ 'is-active': activeIdx === i, 'is-passed': i < activeIdx }"
            @click="snapTo(i)"
          >
            <span class="progress-dot-inner" />
            <span class="progress-dot-label font-mono">0{{ i + 1 }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ height: `${progress * 100}%` }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Closing card after the pin ends -->
    <div class="problem-outro landing-container">
      <div class="outro-card">
        <span class="t-eyebrow">Решение</span>
        <h3 class="t-h3">Платформа решает все три задачи одним маршрутом</h3>
        <p class="t-body">Ниже — как UMAI Health превращает эти три ситуации в управляемый маршрут.</p>
        <a href="#what-is" class="outro-link t-link">
          Что предлагает UMAI Health
          <Icon name="lucide:arrow-down" size="14" />
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { gsap, ScrollTrigger } = useGsap()

const sectionRef = ref<HTMLElement | null>(null)
const pinRef = ref<HTMLElement | null>(null)
const captionRefs = ref<(HTMLElement | null)[]>([])
const phoneRefs = ref<(HTMLElement | null)[]>([])
const scene1Ref = ref<HTMLElement | null>(null)
const scene2Ref = ref<HTMLElement | null>(null)
const scene3Ref = ref<HTMLElement | null>(null)
const arrowPathRef = ref<SVGPathElement | null>(null)
const realPathRef = ref<SVGPathElement | null>(null)
const seenPathRef = ref<SVGPathElement | null>(null)
const todayMarkerRef = ref<SVGLineElement | null>(null)
const gapCalloutRef = ref<SVGGElement | null>(null)
const pulseDotRef = ref<SVGCircleElement | null>(null)
const lagChartRef = ref<SVGElement | null>(null)

const activeIdx = ref(0)
const progress = ref(0)

interface ChatMessage {
  side: 'me' | 'them'
  text: string
  ts?: string
  tone?: 'lost' | 'urgent'
}

interface ChatPhone {
  kind: 'wa' | 'sms' | 'paper'
  rotate: string
  contact: string
  status: string
  time: string
  icon: string
  messages: ChatMessage[]
  typing?: boolean
}

const chatPhones: ChatPhone[] = [
  {
    kind: 'wa',
    rotate: '-6deg',
    contact: 'Клиника · WhatsApp',
    status: 'был(а) сегодня в 09:14',
    time: '09:41',
    icon: 'lucide:message-circle',
    messages: [
      { side: 'them', text: 'Где результаты УЗИ?', ts: '08:12' },
      { side: 'me', text: 'Ищу. Опять перепутала чаты…', ts: '08:14' },
      { side: 'them', text: 'У нас прием через час', tone: 'urgent', ts: '08:15' },
    ],
    typing: true,
  },
  {
    kind: 'sms',
    rotate: '2deg',
    contact: 'Координатор · SMS',
    status: 'СМС-чат',
    time: '09:42',
    icon: 'lucide:smartphone',
    messages: [
      { side: 'them', text: 'Не забудьте: фолиевая, утром', ts: '07:00' },
      { side: 'them', text: 'Не забудьте: фолиевая, утром', tone: 'lost', ts: '08:00' },
      { side: 'them', text: 'Не забудьте: фолиевая, утром', tone: 'lost', ts: '09:00' },
    ],
  },
  {
    kind: 'paper',
    rotate: '7deg',
    contact: 'Бумажный листок',
    status: 'без обновлений',
    time: '—',
    icon: 'lucide:file-text',
    messages: [
      { side: 'them', text: 'Витамин D3 — 1000 ед.' },
      { side: 'them', text: 'Прием 14 мая (?)' },
      { side: 'them', text: 'Анализы: ⊘⊘⊘' },
    ],
  },
]

const excelRows = [
  { name: 'Каримова А.', stage: 'Б · 24 нед', status: '?', lost: false },
  { name: 'Иванова Д.', stage: '0–12м · 4м', status: '?', lost: false },
  { name: 'Султанова М.', stage: 'Б · 18 нед', status: '⚠', lost: true },
  { name: 'Ким А.', stage: 'Прегр.', status: '?', lost: false },
  { name: 'Жанибек А.', stage: '1–2г · 14м', status: '?', lost: false },
  { name: 'Тёмная Н.', stage: 'Б · 32 нед', status: '⚠', lost: true },
  { name: 'Мухтарова К.', stage: '0–12м · 8м', status: '?', lost: false },
  { name: 'Бекова Г.', stage: 'Б · 12 нед', status: '⚠', lost: true },
  { name: 'Алиева С.', stage: 'Прегр.', status: '?', lost: false },
  { name: 'Назарова О.', stage: 'Б · 28 нед', status: '?', lost: false },
]

const kanbanCols = [
  {
    title: 'СЕГОДНЯ',
    tone: 'urgent',
    cards: [
      { name: 'Каримова А.', meta: 'УЗИ 14:00' },
      { name: 'Султанова М.', meta: 'Звонок · просрочка' },
    ],
  },
  {
    title: 'НА НЕДЕЛЕ',
    tone: 'normal',
    cards: [
      { name: 'Иванова Д.', meta: 'Осмотр педиатра' },
      { name: 'Ким А.', meta: 'Витамины' },
      { name: 'Бекова Г.', meta: 'Скрининг' },
    ],
  },
  {
    title: 'ВЫПАЛИ',
    tone: 'good',
    cards: [
      { name: '— пусто —', meta: 'нет выпавших' },
    ],
  },
]

const acts = [
  {
    id: 'chats',
    headline: 'Мама ищет результаты в трёх чатах',
    body: 'Анализы в WhatsApp, направления в SMS, назначения — на бумажке от регистратора. Каждый раз — заново.',
    points: [
      'Семья теряет до 40 % напоминаний клиники',
      'Координатор тратит до 6 минут на ответ «где УЗИ?»',
      'Жалобы в первые 6 недель удваивают отток',
    ],
  },
  {
    id: 'coord',
    headline: 'Координатор обзванивает вслепую',
    body: 'Десятки семей в Excel — без приоритетов, без статусов соблюдения. Кто выпал — узнают, когда мама уже ушла к другому врачу.',
    points: [
      'Координатор обрабатывает в среднем 30 семей вручную',
      'Нет приоритизации — сначала звонят тем, кто и так пришёл бы',
      'Обзвон без статусов = 1 из 5 семей теряется',
    ],
  },
  {
    id: 'lag',
    headline: 'Руководитель видит отчёт, когда уже поздно',
    body: 'Семья ушла в другую клинику три месяца назад. В квартальном отчёте это станет видно — если вообще станет.',
    points: [
      'Лаг отчётности 90 дней между потерей и сигналом',
      'Скрытые −14 % выручки до момента эскалации',
      'Решения принимаются на основе устаревших данных',
    ],
  },
]

function snapTo(idx: number) {
  if (!sectionRef.value || !ScrollTrigger) return
  const trigger = ScrollTrigger.getById('problem-spectacle')
  if (!trigger) return
  // Position = start + (end - start) * (idx + 0.5) / acts.length
  const target = trigger.start + (trigger.end - trigger.start) * ((idx + 0.5) / acts.length)
  window.scrollTo({ top: target, behavior: 'smooth' })
}

onMounted(() => {
  if (!gsap || !ScrollTrigger || !pinRef.value || !sectionRef.value) return
  const isMobile = window.matchMedia('(max-width: 900px)').matches
  if (isMobile) {
    // Mobile fallback — just stagger reveal the captions; no pinning
    gsap.from('.problem-caption', {
      opacity: 0,
      y: 24,
      stagger: 0.2,
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top 80%',
        once: true,
      },
    })
    return
  }

  // ───── 1. Pin the stage for 3 viewport-heights of scroll ─────
  const st = ScrollTrigger.create({
    id: 'problem-spectacle',
    trigger: pinRef.value,
    start: 'top top',
    end: '+=300%',
    pin: true,
    pinSpacing: true,
    scrub: true,
    onUpdate: (self) => {
      progress.value = self.progress
      const idx = Math.min(acts.length - 1, Math.floor(self.progress * acts.length))
      if (idx !== activeIdx.value) activeIdx.value = idx
    },
  })

  // ───── 2. Initial entry — phones drop in ─────
  gsap.set('.chat-phone', { y: 60, opacity: 0, scale: 0.95 })
  gsap.set('.chat-bubble', { y: 14, opacity: 0 })

  ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      gsap.to('.chat-phone', {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: 'back.out(1.3)',
        stagger: 0.12,
      })
      gsap.to('.chat-bubble', {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        stagger: { each: 0.06, from: 'random' },
        delay: 0.6,
      })
    },
  })

  // ───── 3. Scene 2 arrow draw on entry ─────
  if (arrowPathRef.value) {
    const len = arrowPathRef.value.getTotalLength()
    gsap.set(arrowPathRef.value, { strokeDasharray: len, strokeDashoffset: len })
    gsap.set('.arrow-head', { opacity: 0, scale: 0 })
  }

  // Excel rows initial state
  gsap.set('.excel-row', { x: -30, opacity: 0 })
  gsap.set('.kanban-card', { y: 14, opacity: 0, scale: 0.95 })
  gsap.set('.kanban-col', { y: 24, opacity: 0 })

  // ───── 4. Scene 3 chart draw on entry ─────
  ;[realPathRef.value, seenPathRef.value].forEach((path) => {
    if (!path) return
    const len = path.getTotalLength()
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
  })
  gsap.set('.area-real, .area-seen', { opacity: 0 })
  gsap.set(['.pulse-dot', '.pulse-dot-ring'], { opacity: 0, scale: 0 })
  gsap.set('.gap-callout', { opacity: 0, x: 20 })
  gsap.set('.lag-stat', { y: 16, opacity: 0 })

  // ───── 5. Watch activeIdx and animate scene transitions ─────
  let prevIdx = -1
  watch(activeIdx, (idx) => {
    if (idx === prevIdx) return
    prevIdx = idx

    // Crossfade scenes
    const scenes = [scene1Ref.value, scene2Ref.value, scene3Ref.value]
    scenes.forEach((sc, i) => {
      if (!sc) return
      gsap.to(sc, {
        opacity: i === idx ? 1 : 0,
        pointerEvents: i === idx ? 'auto' : 'none',
        duration: 0.5,
        ease: 'power2.out',
      })
    })

    // Animate captions
    captionRefs.value.forEach((cap, i) => {
      if (!cap) return
      gsap.to(cap, {
        opacity: i === idx ? 1 : 0,
        y: i === idx ? 0 : 12,
        duration: 0.5,
        ease: 'power2.out',
      })
    })

    // Scene-specific entrance
    if (idx === 1) {
      // Excel rows cascade in
      gsap.to('.excel-row', {
        x: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.04,
      })
      // Then kanban
      gsap.to('.kanban-col', {
        y: 0,
        opacity: 1,
        duration: 0.55,
        ease: 'back.out(1.2)',
        stagger: 0.12,
        delay: 0.3,
      })
      gsap.to('.kanban-card', {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: 'back.out(1.4)',
        stagger: { each: 0.05, from: 'start' },
        delay: 0.55,
      })
      // Arrow
      if (arrowPathRef.value) {
        gsap.to(arrowPathRef.value, {
          strokeDashoffset: 0,
          duration: 1.0,
          ease: 'power2.inOut',
          delay: 0.4,
        })
      }
      gsap.to('.arrow-head', {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'back.out(2)',
        delay: 1.3,
      })
    }

    if (idx === 2) {
      // Draw lines
      gsap.to([realPathRef.value, seenPathRef.value], {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power1.inOut',
        stagger: 0.25,
      })
      gsap.to(['.area-real', '.area-seen'], {
        opacity: 1,
        duration: 0.9,
        delay: 1.0,
      })
      gsap.to(['.pulse-dot', '.pulse-dot-ring'], {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(2)',
        delay: 1.5,
      })
      gsap.to('.gap-callout', {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: 'power2.out',
        delay: 1.7,
      })
      gsap.to('.lag-stat', {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.1,
        delay: 1.9,
      })
    }
  }, { immediate: true })

  // ───── 6. Continuous ambient: pulse dot on chart ─────
  gsap.to('.pulse-dot-ring', {
    scale: 2.4,
    opacity: 0,
    duration: 1.6,
    repeat: -1,
    ease: 'power2.out',
    transformOrigin: 'center',
  })

  // ───── 7. Cleanup on unmount ─────
  onUnmounted(() => {
    st.kill()
  })
})
</script>

<style scoped>
/* ============================================
   Problem Spectacle — Phase 3 Premium Scroll-Pinned Section
   ============================================
   Architecture:
   - .problem-spectacle: outer 300vh-tall scroll container
   - .problem-pin: 100vh sticky viewport
   - .problem-stage: 3-column grid (rail / scenes / progress)
   - 3 scenes absolutely positioned, crossfaded by GSAP
   ============================================ */

.problem-spectacle {
  position: relative;
  background: var(--gradient-pearl-cool);
  /* Reserved scroll height — pin will cover 100vh, then 3 acts via scrub */
  /* The actual pin height comes from ScrollTrigger end: '+=300%' */
}

.problem-pin {
  position: relative;
  height: 100vh;
  min-height: 720px;
  overflow: hidden;
}

/* ─── Ambient orbs ─── */
.problem-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(96px);
  opacity: 0.55;
  will-change: transform;
}

.ambient-orb-1 {
  width: 620px;
  height: 620px;
  top: -180px;
  left: -160px;
  background: radial-gradient(circle, rgba(232, 160, 191, 0.7), transparent 70%);
  animation: orb-drift-c 24s ease-in-out infinite;
}

.ambient-orb-2 {
  width: 520px;
  height: 520px;
  bottom: -160px;
  right: -140px;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.55), transparent 70%);
  animation: orb-drift-d 28s ease-in-out infinite;
}

@keyframes orb-drift-c {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.08); }
}

@keyframes orb-drift-d {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-50px, 30px) scale(1.06); }
}

/* ─── Stage grid ─── */
.problem-stage {
  position: relative;
  z-index: 2;
  height: 100%;
  display: grid;
  grid-template-columns: minmax(280px, 0.85fr) minmax(0, 1.6fr) 56px;
  gap: 48px;
  padding-top: 80px;
  padding-bottom: 80px;
  align-items: center;
}

/* ─── Left rail ─── */
.problem-rail {
  display: flex;
  flex-direction: column;
  position: relative;
}

.problem-eyebrow {
  display: inline-block;
  margin-bottom: 16px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: rgba(212, 114, 124, 0.10);
  border: 1px solid rgba(212, 114, 124, 0.20);
  color: var(--color-danger);
}

.problem-title {
  margin: 0 0 36px;
  color: var(--color-text-primary);
}

.problem-captions {
  position: relative;
  min-height: 240px;
}

.problem-caption {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  opacity: 0;
  transform: translateY(12px);
  pointer-events: none;
}

.problem-caption.is-active {
  pointer-events: auto;
}

.caption-num {
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  color: var(--color-danger);
  font-weight: 500;
  opacity: 0.7;
}

.caption-headline {
  margin: 0;
  color: var(--color-text-primary);
  text-wrap: balance;
}

.caption-body {
  margin: 0;
  max-width: 38ch;
  color: var(--color-text-secondary);
}

.caption-points {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.caption-point {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.45;
}

.caption-point-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 4px;
}

/* ─── Center scenes container ─── */
.problem-scenes {
  position: relative;
  height: 100%;
  min-height: 520px;
}

.scene {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  will-change: opacity;
}

.scene.is-active {
  pointer-events: auto;
}

/* ============================================
   Scene 1 — Phones with chats
   ============================================ */
.scene-1 {
  perspective: 1400px;
}

.phones-row {
  display: flex;
  gap: 14px;
  transform-style: preserve-3d;
  position: relative;
}

.chat-phone {
  width: 188px;
  flex-shrink: 0;
  transform: rotate(var(--phone-rotate, 0deg));
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-phone:hover {
  transform: rotate(var(--phone-rotate, 0deg)) translateY(-6px) scale(1.03);
  z-index: 5;
}

.chat-phone-1 {
  z-index: 3;
}

.chat-phone-0 {
  z-index: 2;
}

.chat-phone-2 {
  z-index: 1;
}

.chat-phone-frame {
  background: linear-gradient(160deg, #1B1330, #2A1E47);
  border-radius: 28px;
  padding: 6px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06) inset,
    0 20px 48px -12px rgba(75, 50, 130, 0.45),
    0 8px 16px -4px rgba(0, 0, 0, 0.20);
}

.chat-phone-screen {
  background: #FAF7FD;
  border-radius: 22px;
  height: 340px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(75, 50, 130, 0.06);
}

.chat-header--wa { background: rgba(91, 192, 190, 0.10); }
.chat-header--sms { background: rgba(168, 200, 232, 0.14); }
.chat-header--paper { background: rgba(242, 196, 160, 0.18); }

.chat-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: var(--color-primary);
  box-shadow: 0 1px 3px rgba(75, 50, 130, 0.08);
}

.chat-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.chat-name {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-status {
  font-size: 0.6rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 0.6rem;
  color: var(--color-text-muted);
}

.chat-body {
  flex: 1;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(180deg, rgba(139, 126, 200, 0.02), transparent 60%);
}

.chat-bubble {
  position: relative;
  max-width: 75%;
  padding: 7px 10px 9px;
  border-radius: 14px;
  font-size: 0.7rem;
  line-height: 1.35;
  word-wrap: break-word;
}

.bubble-me {
  align-self: flex-end;
  background: linear-gradient(135deg, #8B7EC8, #6E5FB3);
  color: white;
  border-bottom-right-radius: 4px;
}

.bubble-them {
  align-self: flex-start;
  background: white;
  color: var(--color-text-primary);
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(75, 50, 130, 0.08);
}

.bubble-lost {
  opacity: 0.35;
  filter: grayscale(0.3);
}

.bubble-urgent {
  background: linear-gradient(135deg, rgba(212, 114, 124, 0.18), rgba(212, 114, 124, 0.10));
  color: var(--color-danger);
  font-weight: 500;
  border: 1px solid rgba(212, 114, 124, 0.2);
}

.bubble-ts {
  display: block;
  margin-top: 4px;
  font-size: 0.55rem;
  opacity: 0.6;
}

.chat-typing {
  display: flex;
  gap: 3px;
  padding: 8px 12px;
  background: white;
  border-radius: 14px;
  align-self: flex-start;
  box-shadow: 0 1px 2px rgba(75, 50, 130, 0.08);
}

.chat-typing span {
  width: 5px;
  height: 5px;
  background: var(--color-text-muted);
  border-radius: 50%;
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.chat-typing span:nth-child(2) { animation-delay: 0.15s; }
.chat-typing span:nth-child(3) { animation-delay: 0.3s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-3px); opacity: 1; }
}

.lost-flag {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: white;
  border: 1px solid rgba(212, 114, 124, 0.3);
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--color-danger);
  box-shadow: 0 6px 16px -4px rgba(212, 114, 124, 0.2);
  z-index: 6;
}

.lost-flag-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-danger);
  box-shadow: 0 0 0 0 rgba(212, 114, 124, 0.5);
  animation: lost-pulse 1.8s ease-out infinite;
}

@keyframes lost-pulse {
  0% { box-shadow: 0 0 0 0 rgba(212, 114, 124, 0.5); }
  100% { box-shadow: 0 0 0 12px rgba(212, 114, 124, 0); }
}

/* ============================================
   Scene 2 — Chaos to order
   ============================================ */
.scene-2 {
  display: grid;
  grid-template-columns: 1fr 80px 1fr;
  gap: 24px;
  align-items: center;
}

.chaos-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

.chaos-label {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

/* Excel side */
.excel-grid {
  background: white;
  border-radius: 14px;
  box-shadow:
    0 0 0 1px rgba(212, 114, 124, 0.10),
    0 8px 24px -8px rgba(212, 114, 124, 0.12);
  overflow: hidden;
  filter: grayscale(0.05);
}

.excel-header {
  display: grid;
  grid-template-columns: 1.4fr 1fr 36px;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(212, 114, 124, 0.05);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.excel-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 36px;
  gap: 8px;
  padding: 7px 12px;
  border-top: 1px solid rgba(75, 50, 130, 0.04);
  font-size: 0.7rem;
  transition: background 0.2s ease;
}

.excel-row:hover {
  background: rgba(139, 126, 200, 0.03);
}

.excel-row.row-lost {
  background: rgba(212, 114, 124, 0.04);
}

.excel-name {
  color: var(--color-text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.excel-stage {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.65rem;
}

.excel-status {
  font-family: var(--font-mono);
  font-weight: 600;
  text-align: center;
  color: var(--color-text-muted);
}

.row-lost .excel-status {
  color: var(--color-danger);
}

.chaos-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  align-self: flex-start;
}

.chaos-tag--bad {
  background: rgba(212, 114, 124, 0.10);
  border: 1px solid rgba(212, 114, 124, 0.20);
  color: var(--color-danger);
}

.chaos-tag--good {
  background: rgba(91, 192, 190, 0.12);
  border: 1px solid rgba(91, 192, 190, 0.24);
  color: var(--color-mint-dark);
}

/* Arrow */
.chaos-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.arrow-svg {
  width: 80px;
  height: 40px;
}

.chaos-arrow-label {
  font-family: var(--font-display);
  font-size: 0.65rem;
  font-weight: 600;
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 0.1em;
}

/* Kanban side */
.kanban-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px;
  background: white;
  border-radius: 14px;
  box-shadow:
    0 0 0 1px rgba(139, 126, 200, 0.12),
    0 12px 32px -8px rgba(139, 126, 200, 0.16);
}

.kanban-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 200px;
}

.kanban-col-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  margin-bottom: 4px;
}

.kanban-col-name {
  font-family: var(--font-display);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-text-muted);
}

.kanban-col-count {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  background: rgba(139, 126, 200, 0.08);
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

.kanban-card {
  padding: 8px 10px;
  background: rgba(248, 246, 252, 0.8);
  border-radius: 8px;
  border-left: 3px solid var(--color-primary);
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: transform 0.2s ease;
}

.kanban-card:hover {
  transform: translateY(-1px);
}

.kanban-card--urgent { border-left-color: var(--color-danger); }
.kanban-card--normal { border-left-color: var(--color-primary); }
.kanban-card--good { border-left-color: var(--color-mint); opacity: 0.55; }

.kanban-card-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.kanban-card-meta {
  font-size: 0.6rem;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

/* ============================================
   Scene 3 — Lag chart
   ============================================ */
.lag-chart {
  width: 100%;
  max-width: 640px;
  background: white;
  border-radius: 20px;
  padding: 24px 28px 20px;
  box-shadow:
    0 0 0 1px rgba(139, 126, 200, 0.08),
    0 24px 60px -16px rgba(139, 126, 200, 0.16);
}

.lag-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
  flex-wrap: wrap;
  gap: 12px;
}

.lag-chart-title {
  margin: 0;
}

.lag-chart-legend {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.72rem;
  font-family: var(--font-body);
  color: var(--color-text-secondary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-swatch {
  width: 14px;
  height: 3px;
  border-radius: 2px;
}

.legend-real .legend-swatch { background: var(--color-danger); }
.legend-seen .legend-swatch {
  background: repeating-linear-gradient(
    90deg,
    var(--color-primary) 0 4px,
    transparent 4px 7px
  );
  height: 2px;
}

.lag-chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

.lag-grid line {
  stroke: rgba(139, 126, 200, 0.10);
  stroke-width: 1;
}

.line-real, .line-seen, .area-real, .area-seen, .today-marker, .gap-callout {
  will-change: opacity, transform;
}

.pulse-dot, .pulse-dot-ring {
  transform-origin: center;
  transform-box: fill-box;
}

.lag-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border-light);
}

.lag-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lag-stat-val {
  font-weight: 500;
}

.lag-stat-lbl {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

/* ============================================
   Right rail — progress indicator
   ============================================ */
.problem-progress {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 80px 0;
}

.progress-track {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 200px;
  background: rgba(139, 126, 200, 0.15);
  border-radius: 1px;
  overflow: hidden;
  z-index: 0;
}

.progress-fill {
  width: 100%;
  background: var(--gradient-cta);
  transition: height 0.1s linear;
  border-radius: 1px;
}

.progress-dot {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  margin: 28px 0;
  cursor: pointer;
  background: var(--color-bg);
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(139, 126, 200, 0.20);
  transition: box-shadow 0.3s ease;
}

.progress-dot-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(139, 126, 200, 0.30);
  transition: all 0.4s ease;
}

.progress-dot.is-active {
  box-shadow:
    0 0 0 2px rgba(139, 126, 200, 0.50),
    0 0 0 6px rgba(139, 126, 200, 0.12),
    0 0 24px rgba(139, 126, 200, 0.40);
}

.progress-dot.is-active .progress-dot-inner {
  width: 14px;
  height: 14px;
  background: var(--gradient-cta);
}

.progress-dot.is-passed {
  box-shadow: 0 0 0 2px rgba(139, 126, 200, 0.4);
}

.progress-dot.is-passed .progress-dot-inner {
  background: var(--color-primary);
}

.progress-dot-label {
  position: absolute;
  right: 100%;
  margin-right: 14px;
  font-size: 0.65rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  opacity: 0;
  transform: translateX(8px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.progress-dot.is-active .progress-dot-label,
.progress-dot:hover .progress-dot-label {
  opacity: 1;
  transform: translateX(0);
  color: var(--color-primary);
}

/* ============================================
   Outro card — after pin ends
   ============================================ */
.problem-outro {
  position: relative;
  z-index: 3;
  margin-top: -60px;
  padding-bottom: 80px;
}

.outro-card {
  background: white;
  border-radius: 24px;
  padding: 32px 40px;
  box-shadow: var(--shadow-luxury);
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.outro-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--gradient-cta);
}

.outro-card .t-eyebrow {
  color: var(--color-secondary-dark);
}

.outro-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.95rem;
  font-weight: 600;
}

/* ============================================
   Mobile fallback
   ============================================ */
@media (max-width: 900px) {
  .problem-spectacle {
    background: var(--color-bg-alt);
  }

  .problem-pin {
    height: auto;
    min-height: 0;
    overflow: visible;
  }

  .problem-stage {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 64px 0;
    height: auto;
  }

  .problem-progress {
    display: none;
  }

  .problem-scenes {
    min-height: 0;
  }

  .scene {
    position: relative;
    opacity: 1;
    pointer-events: auto;
    margin-bottom: 40px;
  }

  .problem-captions {
    min-height: 0;
  }

  .problem-caption {
    position: relative;
    opacity: 1;
    transform: none;
    margin-bottom: 32px;
  }

  .phones-row {
    flex-wrap: wrap;
    justify-content: center;
  }

  .chat-phone {
    width: 168px;
  }

  .scene-2 {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .chaos-arrow {
    transform: rotate(90deg);
  }

  .lag-chart {
    padding: 20px;
  }

  .lag-stats {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ambient-orb,
  .lost-flag-pulse,
  .chat-typing span {
    animation: none;
  }
  .scene {
    opacity: 1;
    pointer-events: auto;
    position: relative;
  }
}
</style>
