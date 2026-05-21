<template>
  <section class="body-health-map">
    <!-- Header band -->
    <div class="bhm-head">
      <div>
        <span class="t-eyebrow bhm-eyebrow">Здоровье ребёнка</span>
        <h2 class="t-h3 bhm-title">
          Тимур · <span class="t-accent-serif">5 месяцев</span>
        </h2>
        <p class="bhm-subtitle">
          <span class="bhm-pulse-led" aria-hidden="true" />
          обновлено {{ lastUpdateLabel }}
        </p>
      </div>

      <!-- Composite health index card -->
      <div class="bhm-index">
        <div class="bhm-index-row">
          <span class="bhm-index-num t-kpi">{{ healthIndex }}<sup>%</sup></span>
          <div class="bhm-index-meta">
            <span class="bhm-index-lbl">Индекс здоровья</span>
            <span class="bhm-index-trend">
              <Icon name="lucide:trending-up" size="11" />
              +3% за 30 дней
            </span>
          </div>
        </div>
        <!-- 30-day sparkline -->
        <svg viewBox="0 0 200 36" preserveAspectRatio="none" class="bhm-spark">
          <defs>
            <linearGradient id="bhmSparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#5BC0BE" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#5BC0BE" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path :d="sparkFillPath" fill="url(#bhmSparkFill)" />
          <path :d="sparkLinePath" fill="none" stroke="#5BC0BE" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>

    <!-- Main stage: body silhouette + detail panel -->
    <div class="bhm-stage">
      <!-- Left: body silhouette with hotspots -->
      <div class="bhm-body-wrap" :class="{ 'has-selection': selectedKey }">
        <!-- Ambient halo behind body -->
        <div class="bhm-halo" aria-hidden="true" />

        <svg
          viewBox="0 0 200 400"
          class="bhm-body-svg"
          role="img"
          aria-label="Силуэт ребёнка с интерактивными точками систем здоровья"
        >
          <defs>
            <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#FBF6FF" />
              <stop offset="100%" stop-color="#F0E6F5" />
            </linearGradient>
            <linearGradient id="bodyStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#8B7EC8" />
              <stop offset="100%" stop-color="#E8A0BF" />
            </linearGradient>
          </defs>

          <!-- Body silhouette — abstract baby figure -->
          <g class="bhm-body-figure">
            <!-- Head -->
            <ellipse cx="100" cy="60" rx="38" ry="42" fill="url(#bodyFill)" stroke="url(#bodyStroke)" stroke-width="1.4" stroke-opacity="0.55" />
            <!-- Neck -->
            <path d="M 86 96 Q 100 108 114 96 L 114 110 L 86 110 Z" fill="url(#bodyFill)" stroke="url(#bodyStroke)" stroke-width="1.4" stroke-opacity="0.55" />
            <!-- Torso -->
            <path
              d="M 70 116 Q 70 110 78 110 L 122 110 Q 130 110 130 116
                 L 134 220 Q 134 230 124 232 L 76 232 Q 66 230 66 220 Z"
              fill="url(#bodyFill)"
              stroke="url(#bodyStroke)"
              stroke-width="1.4"
              stroke-opacity="0.55"
            />
            <!-- Left arm -->
            <path d="M 70 118 Q 50 130 46 168 Q 44 188 52 200 L 60 196 Q 56 184 60 168 Q 64 142 78 130 Z" fill="url(#bodyFill)" stroke="url(#bodyStroke)" stroke-width="1.4" stroke-opacity="0.45" />
            <!-- Right arm -->
            <path d="M 130 118 Q 150 130 154 168 Q 156 188 148 200 L 140 196 Q 144 184 140 168 Q 136 142 122 130 Z" fill="url(#bodyFill)" stroke="url(#bodyStroke)" stroke-width="1.4" stroke-opacity="0.45" />
            <!-- Legs -->
            <path d="M 78 232 L 90 232 Q 92 290 88 340 Q 86 360 80 372 L 70 370 Q 70 350 72 320 Q 74 280 78 232 Z" fill="url(#bodyFill)" stroke="url(#bodyStroke)" stroke-width="1.4" stroke-opacity="0.45" />
            <path d="M 110 232 L 122 232 Q 126 280 128 320 Q 130 350 130 370 L 120 372 Q 114 360 112 340 Q 108 290 110 232 Z" fill="url(#bodyFill)" stroke="url(#bodyStroke)" stroke-width="1.4" stroke-opacity="0.45" />
          </g>

          <!-- Hotspots overlay (rendered on top of body) -->
          <g class="bhm-hotspots">
            <g
              v-for="spot in spots"
              :key="spot.key"
              :transform="`translate(${spot.x} ${spot.y})`"
              class="bhm-spot"
              :class="[
                `bhm-spot--${spot.tone}`,
                { 'is-selected': selectedKey === spot.key, 'is-dim': selectedKey && selectedKey !== spot.key },
              ]"
              role="button"
              :tabindex="0"
              :aria-label="`${spot.label}: ${spot.value}`"
              @click="selectSpot(spot.key)"
              @keydown.enter="selectSpot(spot.key)"
              @keydown.space.prevent="selectSpot(spot.key)"
            >
              <!-- Outer pulse ring -->
              <circle r="22" fill="currentColor" opacity="0" class="spot-ring-3" />
              <!-- Middle pulse ring -->
              <circle r="16" fill="currentColor" opacity="0" class="spot-ring-2" />
              <!-- Inner halo -->
              <circle r="10" fill="currentColor" opacity="0.18" class="spot-ring-1" />
              <!-- Core dot -->
              <circle r="5.5" fill="currentColor" class="spot-core" />
              <!-- Tiny icon inside core -->
              <foreignObject x="-7" y="-7" width="14" height="14" class="spot-icon">
                <Icon :name="spot.icon" size="11" :style="{ color: 'white' }" />
              </foreignObject>
            </g>
          </g>
        </svg>

        <!-- Floating labels — anchored above body, rendered HTML for typography -->
        <div
          v-for="spot in spots"
          :key="`lbl-${spot.key}`"
          class="bhm-spot-label"
          :class="[
            spot.labelPos,
            {
              'is-selected': selectedKey === spot.key,
              'is-dim': selectedKey && selectedKey !== spot.key,
            },
          ]"
          :style="{
            top: `${(spot.y / 400) * 100}%`,
            left: `${(spot.x / 200) * 100}%`,
          }"
        >
          <span class="spot-label-line" />
          <span class="spot-label-text">{{ spot.label }}</span>
        </div>
      </div>

      <!-- Right: detail panel -->
      <Transition name="bhm-detail">
        <div v-if="selectedSpot" :key="selectedSpot.key" class="bhm-detail">
          <div class="bhm-detail-head">
            <div class="bhm-detail-icon-wrap" :data-tone="selectedSpot.tone">
              <Icon :name="selectedSpot.icon" size="20" />
            </div>
            <div class="bhm-detail-titles">
              <span class="bhm-detail-eyebrow t-eyebrow">{{ selectedSpot.category }}</span>
              <h3 class="bhm-detail-title t-h4">{{ selectedSpot.label }}</h3>
            </div>
            <button class="bhm-detail-close" type="button" aria-label="Закрыть" @click="selectedKey = null">
              <Icon name="lucide:x" size="16" />
            </button>
          </div>

          <!-- KPI -->
          <div class="bhm-detail-kpi">
            <span class="bhm-detail-kpi-num t-kpi">{{ selectedSpot.value }}</span>
            <span class="bhm-detail-kpi-unit">{{ selectedSpot.unit }}</span>
            <span
              class="bhm-detail-kpi-trend"
              :class="`trend-${selectedSpot.trendDir}`"
            >
              <Icon :name="trendIcon(selectedSpot.trendDir)" size="11" />
              {{ selectedSpot.trend }}
            </span>
          </div>

          <!-- Norm bar — visual range indicator -->
          <div class="bhm-norm">
            <div class="bhm-norm-bar">
              <div class="bhm-norm-zone bhm-norm-zone-good" :style="{ left: `${selectedSpot.normLow}%`, width: `${selectedSpot.normHigh - selectedSpot.normLow}%` }" />
              <div class="bhm-norm-marker" :style="{ left: `${selectedSpot.normMarker}%` }">
                <span class="bhm-norm-marker-dot" />
              </div>
            </div>
            <div class="bhm-norm-labels">
              <span>{{ selectedSpot.rangeMin }}</span>
              <span class="bhm-norm-zone-label">норма</span>
              <span>{{ selectedSpot.rangeMax }}</span>
            </div>
          </div>

          <!-- Note -->
          <p class="bhm-detail-note">{{ selectedSpot.note }}</p>

          <!-- Mini-series chart -->
          <div class="bhm-detail-mini">
            <span class="bhm-detail-mini-label t-meta">{{ selectedSpot.miniLabel }}</span>
            <svg viewBox="0 0 200 50" preserveAspectRatio="none" class="bhm-detail-mini-svg">
              <path :d="miniLine(selectedSpot.mini)" fill="none" :stroke="toneColor(selectedSpot.tone)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              <circle
                v-for="(v, i) in selectedSpot.mini"
                :key="i"
                :cx="i * (200 / (selectedSpot.mini.length - 1))"
                :cy="50 - (v / 100) * 42 - 4"
                :r="i === selectedSpot.mini.length - 1 ? 3 : 1.6"
                :fill="toneColor(selectedSpot.tone)"
              />
            </svg>
          </div>

          <!-- Actions -->
          <div class="bhm-detail-actions">
            <button type="button" class="bhm-detail-btn bhm-detail-btn-primary">
              <Icon :name="selectedSpot.actionIcon" size="14" />
              {{ selectedSpot.actionLabel }}
            </button>
            <button type="button" class="bhm-detail-btn bhm-detail-btn-ghost">
              <Icon name="lucide:file-text" size="14" />
              История
            </button>
          </div>
        </div>

        <div v-else key="placeholder" class="bhm-placeholder">
          <div class="bhm-placeholder-icon">
            <Icon name="lucide:mouse-pointer-click" size="22" />
          </div>
          <span class="bhm-placeholder-text">
            Нажмите на любую точку, чтобы увидеть подробности
          </span>
          <ul class="bhm-placeholder-list">
            <li v-for="spot in spots" :key="spot.key">
              <span class="bhm-placeholder-dot" :style="{ background: toneColor(spot.tone) }" />
              {{ spot.label }}
            </li>
          </ul>
        </div>
      </Transition>
    </div>

    <!-- Bottom strip: 3 mini-trend cards -->
    <div class="bhm-trends">
      <div class="bhm-trend-card" v-for="t in trendCards" :key="t.key">
        <div class="bhm-trend-row">
          <span class="bhm-trend-lbl">{{ t.label }}</span>
          <span class="bhm-trend-delta" :class="`trend-${t.dir}`">
            <Icon :name="trendIcon(t.dir)" size="11" />
            {{ t.delta }}
          </span>
        </div>
        <div class="bhm-trend-val-row">
          <span class="bhm-trend-val t-kpi">{{ t.value }}</span>
          <span class="bhm-trend-unit">{{ t.unit }}</span>
        </div>
        <span class="bhm-trend-meta">{{ t.meta }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Tone = 'good' | 'normal' | 'attention' | 'alert'
type TrendDir = 'up' | 'down' | 'flat'

interface Spot {
  key: string
  label: string
  category: string
  icon: string
  x: number          // 0-200 svg coords
  y: number          // 0-400 svg coords
  labelPos: 'left' | 'right'
  tone: Tone
  value: string
  unit: string
  trend: string
  trendDir: TrendDir
  rangeMin: string
  rangeMax: string
  normLow: number    // 0-100% on norm bar
  normHigh: number
  normMarker: number // current value position 0-100
  note: string
  miniLabel: string
  mini: number[]     // 0-100 scale
  actionLabel: string
  actionIcon: string
}

const selectedKey = ref<string | null>(null)

// Auto-select first interesting one on mount for visual story
onMounted(() => {
  // small delay so animation is appreciable
  setTimeout(() => { selectedKey.value = 'heart' }, 400)
})

const spots: Spot[] = [
  {
    key: 'head',
    label: 'Рост',
    category: 'Антропометрия',
    icon: 'lucide:ruler',
    x: 100, y: 36,
    labelPos: 'right',
    tone: 'good',
    value: '63',
    unit: 'см',
    trend: '+2 см за месяц',
    trendDir: 'up',
    rangeMin: '60', rangeMax: '68', normLow: 20, normHigh: 80, normMarker: 60,
    note: '75-й перцентиль по шкале ВОЗ для возраста 5 мес. В норме, тренд устойчивый.',
    miniLabel: 'Динамика 6 мес',
    mini: [40, 48, 53, 58, 62, 68, 75],
    actionLabel: 'Добавить замер',
    actionIcon: 'lucide:plus',
  },
  {
    key: 'heart',
    label: 'Сердцебиение',
    category: 'Сердечно-сосудистая',
    icon: 'lucide:heart-pulse',
    x: 92, y: 145,
    labelPos: 'left',
    tone: 'good',
    value: '142',
    unit: 'уд/мин',
    trend: 'стабильно',
    trendDir: 'flat',
    rangeMin: '120', rangeMax: '160', normLow: 18, normHigh: 82, normMarker: 55,
    note: 'Норма для возраста 3–6 мес. Измерения с фитнес-браслета родителей при ношении.',
    miniLabel: 'Последние 7 дней',
    mini: [60, 58, 62, 55, 60, 56, 58],
    actionLabel: 'Подключить пульсометр',
    actionIcon: 'lucide:bluetooth',
  },
  {
    key: 'lungs',
    label: 'Дыхание',
    category: 'Респираторная',
    icon: 'lucide:wind',
    x: 116, y: 155,
    labelPos: 'right',
    tone: 'normal',
    value: '38',
    unit: 'вд/мин',
    trend: 'в норме',
    trendDir: 'flat',
    rangeMin: '30', rangeMax: '50', normLow: 22, normHigh: 78, normMarker: 50,
    note: 'Норма частоты дыхательных движений для возраста. Без отклонений, эпизодов апноэ нет.',
    miniLabel: 'Ночные значения 7 ночей',
    mini: [42, 38, 40, 39, 41, 37, 38],
    actionLabel: 'Записать наблюдение',
    actionIcon: 'lucide:edit-3',
  },
  {
    key: 'vacc',
    label: 'Прививки',
    category: 'Иммунизация',
    icon: 'lucide:shield-check',
    x: 60, y: 130,
    labelPos: 'left',
    tone: 'attention',
    value: '5/8',
    unit: 'выполнено',
    trend: 'следующая 15 мая',
    trendDir: 'up',
    rangeMin: '0', rangeMax: '8', normLow: 0, normHigh: 100, normMarker: 62,
    note: 'По нац. календарю РК выполнено 5 прививок из 8 запланированных к возрасту. АКДС-2 предстоит через 5 дней.',
    miniLabel: 'Календарь прививок',
    mini: [12, 25, 38, 50, 62, 62, 62],
    actionLabel: 'Открыть календарь',
    actionIcon: 'lucide:calendar-days',
  },
  {
    key: 'feeding',
    label: 'Питание',
    category: 'Нутрициология',
    icon: 'lucide:droplet',
    x: 100, y: 215,
    labelPos: 'right',
    tone: 'normal',
    value: '6',
    unit: 'кормлений',
    trend: '+1 к норме',
    trendDir: 'up',
    rangeMin: '5', rangeMax: '7', normLow: 25, normHigh: 75, normMarker: 70,
    note: 'Грудное вскармливание + 1 прикорм. Объёмы соответствуют возрастной норме, прибавка веса по графику.',
    miniLabel: 'Кормлений в день, 14 дн.',
    mini: [50, 58, 55, 62, 60, 65, 70],
    actionLabel: 'Дневник кормления',
    actionIcon: 'lucide:notebook-pen',
  },
  {
    key: 'sleep',
    label: 'Сон',
    category: 'Режим',
    icon: 'lucide:moon',
    x: 144, y: 70,
    labelPos: 'right',
    tone: 'attention',
    value: '10ч 40м',
    unit: 'за сутки',
    trend: '−30 мин за неделю',
    trendDir: 'down',
    rangeMin: '12ч', rangeMax: '15ч', normLow: 30, normHigh: 90, normMarker: 22,
    note: 'Меньше нормы на ~30 мин. Возможно, идёт регресс сна 4-х месяцев. Рекомендация — уплотнить дневные ритмы.',
    miniLabel: 'Сон за 7 дней (часы)',
    mini: [78, 74, 72, 70, 68, 66, 64],
    actionLabel: 'Журнал сна',
    actionIcon: 'lucide:bed',
  },
]

const selectedSpot = computed(() => spots.find(s => s.key === selectedKey.value) || null)

function selectSpot(key: string) {
  selectedKey.value = selectedKey.value === key ? null : key
}

function toneColor(tone: Tone): string {
  const map: Record<Tone, string> = {
    good: '#5BC0BE',
    normal: '#8B7EC8',
    attention: '#F2C4A0',
    alert: '#D4727C',
  }
  return map[tone]
}

function trendIcon(dir: TrendDir): string {
  if (dir === 'up') return 'lucide:trending-up'
  if (dir === 'down') return 'lucide:trending-down'
  return 'lucide:minus'
}

function miniLine(values: number[]): string {
  const w = 200, h = 50, padTop = 4
  const dx = w / (values.length - 1)
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * dx},${h - (v / 100) * (h - padTop) - padTop}`)
    .join(' ')
}

// Composite index — average tone score
const healthIndex = 92

// 30-day index sparkline (deterministic)
const indexSeries = Array.from({ length: 30 }, (_, i) => {
  return 84 + Math.sin(i / 4) * 4 + i * 0.2
})

const sparkLinePath = computed(() => {
  const w = 200, h = 36, pad = 2
  const dx = w / (indexSeries.length - 1)
  const minVal = Math.min(...indexSeries) - 2
  const maxVal = Math.max(...indexSeries) + 2
  return indexSeries
    .map((v, i) => {
      const x = i * dx
      const y = h - ((v - minVal) / (maxVal - minVal)) * (h - pad * 2) - pad
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

const sparkFillPath = computed(() => {
  return `${sparkLinePath.value} L 200,36 L 0,36 Z`
})

const lastUpdateLabel = computed(() => {
  // Pretty "Today, HH:MM"
  const d = new Date()
  return `сегодня в ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

interface TrendCard {
  key: string
  label: string
  value: string
  unit: string
  meta: string
  delta: string
  dir: TrendDir
}

const trendCards: TrendCard[] = [
  { key: 't-weight', label: 'Вес', value: '7.2', unit: 'кг', meta: '50-й перцентиль', delta: '+0.4 кг', dir: 'up' },
  { key: 't-mood', label: 'Настроение', value: '4.6', unit: '/5', meta: 'оценка мамы', delta: 'стабильно', dir: 'flat' },
  { key: 't-alerts', label: 'Активных предупреждений', value: '1', unit: '', meta: 'сон — обратить внимание', delta: '−2 за неделю', dir: 'down' },
]
</script>

<style scoped>
/* ════════════════════════════════════════════════
   Phase 4.4 — Body Health Map
   ════════════════════════════════════════════════ */

.body-health-map {
  position: relative;
  background:
    radial-gradient(ellipse at top right, rgba(91, 192, 190, 0.06), transparent 50%),
    linear-gradient(180deg, #FFFFFF 0%, #FBF6FF 100%);
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: var(--radius-xl);
  padding: 28px 32px 24px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 1px 2px rgba(75, 50, 130, 0.03),
    0 12px 32px -12px rgba(139, 126, 200, 0.10);
  overflow: hidden;
}

/* Subtle blob accent in upper right */
.body-health-map::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -100px;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(91, 192, 190, 0.18), transparent 70%);
  filter: blur(48px);
  pointer-events: none;
  z-index: 0;
}

.body-health-map > * {
  position: relative;
  z-index: 1;
}

/* ─── Head ─── */
.bhm-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 18px;
  flex-wrap: wrap;
}

.bhm-eyebrow {
  display: inline-block;
  margin-bottom: 6px;
}

.bhm-title {
  margin: 0 0 4px;
  color: var(--color-text-primary);
}

.bhm-subtitle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin: 0;
}

.bhm-pulse-led {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5BC0BE;
  box-shadow: 0 0 0 0 rgba(91, 192, 190, 0.4);
  animation: led-pulse 2.4s ease-in-out infinite;
}

@keyframes led-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(91, 192, 190, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(91, 192, 190, 0); }
}

/* Composite index card */
.bhm-index {
  background: white;
  border: 1px solid rgba(91, 192, 190, 0.16);
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 240px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 4px 12px -4px rgba(91, 192, 190, 0.18);
}

.bhm-index-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bhm-index-num {
  font-size: 2rem;
  font-weight: 500;
  background: linear-gradient(135deg, #5BC0BE, #8B7EC8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.03em;
  line-height: 1;
}

.bhm-index-num sup {
  font-size: 0.9rem;
  font-weight: 500;
}

.bhm-index-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bhm-index-lbl {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.bhm-index-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: var(--color-mint-dark, #3FA5A3);
  font-weight: 500;
}

.bhm-spark {
  display: block;
  width: 100%;
  height: 36px;
}

/* ─── Stage layout ─── */
.bhm-stage {
  display: grid;
  grid-template-columns: minmax(260px, 360px) 1fr;
  gap: 24px;
  align-items: stretch;
  margin-bottom: 24px;
}

/* ─── Body silhouette wrap ─── */
.bhm-body-wrap {
  position: relative;
  background: linear-gradient(180deg, rgba(251, 246, 255, 0.6), rgba(255, 255, 255, 0.4));
  border-radius: var(--radius-lg);
  padding: 24px;
  border: 1px solid rgba(139, 126, 200, 0.06);
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bhm-halo {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 280px;
  height: 380px;
  transform: translate(-50%, -50%);
  background:
    radial-gradient(ellipse at center, rgba(139, 126, 200, 0.10), transparent 70%);
  pointer-events: none;
  filter: blur(20px);
}

.bhm-body-svg {
  width: 220px;
  height: 440px;
  position: relative;
  z-index: 1;
  /* Breathing animation */
  animation: body-breathe 5s ease-in-out infinite;
  transform-origin: 100px 200px;
}

@keyframes body-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.018); }
}

/* ─── Hotspots ─── */
.bhm-spot {
  cursor: pointer;
  outline: none;
  transition: opacity 0.35s ease;
}

.bhm-spot:focus-visible .spot-core {
  filter: drop-shadow(0 0 0 2px white) drop-shadow(0 0 0 4px currentColor);
}

.bhm-spot--good { color: #5BC0BE; }
.bhm-spot--normal { color: #8B7EC8; }
.bhm-spot--attention { color: #E0A370; }
.bhm-spot--alert { color: #D4727C; }

.bhm-spot.is-dim {
  opacity: 0.30;
}

/* Pulse rings — 3 layers with staggered animation */
.spot-ring-3 {
  animation: spot-ring 2.4s ease-out infinite;
  transform-origin: center;
}
.spot-ring-2 {
  animation: spot-ring 2.4s ease-out infinite;
  animation-delay: 0.6s;
  transform-origin: center;
}
.spot-ring-1 {
  animation: spot-halo-breathe 3.6s ease-in-out infinite;
  transform-origin: center;
}

@keyframes spot-ring {
  0% { transform: scale(0.4); opacity: 0.42; }
  100% { transform: scale(1.3); opacity: 0; }
}

@keyframes spot-halo-breathe {
  0%, 100% { opacity: 0.18; transform: scale(1); }
  50% { opacity: 0.28; transform: scale(1.08); }
}

.spot-core {
  filter: drop-shadow(0 0 6px currentColor);
  transition: transform 0.25s ease;
}

.bhm-spot:hover .spot-core,
.bhm-spot.is-selected .spot-core {
  transform: scale(1.18);
}

.bhm-spot.is-selected .spot-ring-1 {
  opacity: 0.42;
}

/* Foreign-object icon — small icon inside core dot */
.spot-icon {
  pointer-events: none;
}

/* ─── Floating HTML labels around body ─── */
.bhm-spot-label {
  position: absolute;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  color: var(--color-text-secondary);
  white-space: nowrap;
  transition: opacity 0.35s ease, transform 0.35s ease, color 0.35s ease;
}

.bhm-spot-label.right {
  /* Anchored to body silhouette, push label to the right */
  left: calc((100px + 26px) / 200 * 100%) !important;
}

.bhm-spot-label.left {
  /* Label to the left of dot — flex-reverse */
  flex-direction: row-reverse;
  transform: translate(-100%, -50%) translateX(-12px);
}

.bhm-spot-label.is-selected {
  color: var(--color-text-primary);
}

.bhm-spot-label.is-dim {
  opacity: 0.35;
}

.spot-label-line {
  width: 18px;
  height: 1px;
  background: rgba(139, 126, 200, 0.30);
}

.spot-label-text {
  /* tiny pill background for readability over body */
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
}

/* ════════════════════════════════════════════════
   Detail panel
   ════════════════════════════════════════════════ */

.bhm-detail,
.bhm-placeholder {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-lg);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 4px 16px -4px rgba(139, 126, 200, 0.12);
  min-height: 520px;
}

.bhm-detail-head {
  display: grid;
  grid-template-columns: 44px 1fr 30px;
  gap: 14px;
  align-items: center;
}

.bhm-detail-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px -4px currentColor;
}

.bhm-detail-icon-wrap[data-tone="good"] { background: linear-gradient(135deg, #5BC0BE, #3FA5A3); }
.bhm-detail-icon-wrap[data-tone="normal"] { background: var(--gradient-cta); }
.bhm-detail-icon-wrap[data-tone="attention"] { background: linear-gradient(135deg, #F2C4A0, #E0A370); }
.bhm-detail-icon-wrap[data-tone="alert"] { background: linear-gradient(135deg, #E89AA1, #D4727C); }

.bhm-detail-titles {
  min-width: 0;
}

.bhm-detail-eyebrow {
  display: block;
  margin-bottom: 2px;
  color: var(--color-text-muted);
}

.bhm-detail-title {
  margin: 0;
  color: var(--color-text-primary);
}

.bhm-detail-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-text-secondary);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease;
}

.bhm-detail-close:hover {
  background: rgba(139, 126, 200, 0.18);
  transform: rotate(90deg);
}

/* KPI row */
.bhm-detail-kpi {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border-light);
}

.bhm-detail-kpi-num {
  font-size: 2.4rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--color-text-primary);
}

.bhm-detail-kpi-unit {
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.bhm-detail-kpi-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
}

.bhm-detail-kpi-trend.trend-up { color: var(--color-mint-dark, #3FA5A3); }
.bhm-detail-kpi-trend.trend-down { color: var(--color-danger); }
.bhm-detail-kpi-trend.trend-flat { color: var(--color-text-muted); }

/* Norm bar */
.bhm-norm {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bhm-norm-bar {
  position: relative;
  height: 8px;
  background: rgba(139, 126, 200, 0.10);
  border-radius: 4px;
  overflow: visible;
}

.bhm-norm-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  background: rgba(91, 192, 190, 0.32);
  border-radius: 4px;
}

.bhm-norm-marker {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 4px;
  transform: translateX(-50%);
}

.bhm-norm-marker-dot {
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-text-primary);
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(75, 50, 130, 0.20);
}

.bhm-norm-labels {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
}

.bhm-norm-zone-label {
  color: var(--color-mint-dark, #3FA5A3);
  font-weight: 500;
}

/* Note */
.bhm-detail-note {
  font-size: 0.85rem;
  line-height: 1.55;
  color: var(--color-text-secondary);
  margin: 0;
  padding: 12px 14px;
  background: rgba(139, 126, 200, 0.04);
  border-left: 3px solid var(--color-primary);
  border-radius: 8px;
}

/* Mini chart */
.bhm-detail-mini {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bhm-detail-mini-label {
  color: var(--color-text-muted);
}

.bhm-detail-mini-svg {
  width: 100%;
  height: 50px;
}

/* Actions */
.bhm-detail-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.bhm-detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 10px;
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.bhm-detail-btn-primary {
  background: var(--gradient-cta);
  color: white;
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.4);
}

.bhm-detail-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px -4px rgba(139, 126, 200, 0.55);
}

.bhm-detail-btn-ghost {
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary);
}

.bhm-detail-btn-ghost:hover {
  background: rgba(139, 126, 200, 0.16);
}

/* Placeholder when nothing selected */
.bhm-placeholder {
  align-items: center;
  text-align: center;
  justify-content: center;
}

.bhm-placeholder-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.12), rgba(232, 160, 191, 0.12));
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bhm-placeholder-text {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
  max-width: 26ch;
}

.bhm-placeholder-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 6px 16px;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

.bhm-placeholder-list li {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bhm-placeholder-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 6px currentColor;
}

/* Transitions */
.bhm-detail-enter-active,
.bhm-detail-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.bhm-detail-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.bhm-detail-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ════════════════════════════════════════════════
   Bottom trend strip
   ════════════════════════════════════════════════ */
.bhm-trends {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid var(--color-border-light);
}

.bhm-trend-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(139, 126, 200, 0.08);
  backdrop-filter: blur(8px);
}

.bhm-trend-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bhm-trend-lbl {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-text-muted);
}

.bhm-trend-delta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 500;
}

.bhm-trend-delta.trend-up { color: var(--color-mint-dark, #3FA5A3); }
.bhm-trend-delta.trend-down { color: var(--color-danger); }
.bhm-trend-delta.trend-flat { color: var(--color-text-muted); }

.bhm-trend-val-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.bhm-trend-val {
  font-size: 1.6rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  line-height: 1;
}

.bhm-trend-unit {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.bhm-trend-meta {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* ─── Mobile ─── */
@media (max-width: 900px) {
  .bhm-stage {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .bhm-body-wrap {
    min-height: 420px;
  }
  .bhm-body-svg {
    width: 180px;
    height: 360px;
  }
  .bhm-detail,
  .bhm-placeholder {
    min-height: 0;
  }
}

@media (max-width: 640px) {
  .body-health-map {
    padding: 20px 16px;
  }
  .bhm-trends {
    grid-template-columns: 1fr;
  }
  .bhm-spot-label {
    display: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .bhm-body-svg,
  .spot-ring-3, .spot-ring-2, .spot-ring-1,
  .bhm-pulse-led {
    animation: none;
  }
}
</style>
