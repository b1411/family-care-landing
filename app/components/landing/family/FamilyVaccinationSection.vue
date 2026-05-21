<template>
  <section class="vax-section landing-section" data-clip-reveal="inset">
    <div class="landing-container">
      <header class="vax-head">
        <span class="vax-eyebrow t-eyebrow">Иммунизация</span>
        <h2 ref="vaxTitleRef" class="t-display-section vax-title">
          Щит <span class="t-accent-serif">иммунитета</span>, который растёт вместе с&nbsp;ребёнком
        </h2>
        <p class="vax-subtitle t-lead">
          Все 18 прививок по&nbsp;национальному календарю РК. Напоминания за&nbsp;3&nbsp;дня, история партий и&nbsp;серий, сертификат в&nbsp;один клик.
        </p>
      </header>

      <div class="vax-stage">
        <!-- ─── Central shield + orbits ─── -->
        <div class="vax-orbit-wrap">
          <!-- Decorative background bloom -->
          <div class="vax-bloom vax-bloom-1" aria-hidden="true" />
          <div class="vax-bloom vax-bloom-2" aria-hidden="true" />

          <!-- Orbital paths (decorative) -->
          <svg viewBox="0 0 520 520" class="vax-orbits-svg" aria-hidden="true">
            <defs>
              <linearGradient id="shieldFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#5BC0BE" />
                <stop offset="100%" stop-color="#8B7EC8" />
              </linearGradient>
              <linearGradient id="shieldStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#8B7EC8" stop-opacity="0.6" />
                <stop offset="100%" stop-color="#E8A0BF" stop-opacity="0.6" />
              </linearGradient>
            </defs>

            <!-- Dashed orbital rings -->
            <circle cx="260" cy="260" r="240" fill="none" stroke="rgba(139,126,200,0.16)" stroke-width="1" stroke-dasharray="4 6" />
            <circle cx="260" cy="260" r="180" fill="none" stroke="rgba(139,126,200,0.10)" stroke-width="1" stroke-dasharray="3 5" />

            <!-- Central shield silhouette -->
            <path
              d="M 260 120
                 C 220 130, 180 140, 170 150
                 L 170 250
                 C 170 320, 220 380, 260 400
                 C 300 380, 350 320, 350 250
                 L 350 150
                 C 340 140, 300 130, 260 120 Z"
              fill="url(#shieldFill)"
              fill-opacity="0.12"
              stroke="url(#shieldStroke)"
              stroke-width="1.5"
            />

            <!-- Inner shield with progress fill -->
            <clipPath id="shieldClip">
              <path d="M 260 120 C 220 130, 180 140, 170 150 L 170 250 C 170 320, 220 380, 260 400 C 300 380, 350 320, 350 250 L 350 150 C 340 140, 300 130, 260 120 Z" />
            </clipPath>
            <!-- Progress fill — bottom-up wave -->
            <g clip-path="url(#shieldClip)">
              <rect
                x="170"
                :y="170 + (1 - fillRatio) * 250"
                width="180"
                height="300"
                fill="url(#shieldFill)"
                fill-opacity="0.55"
                class="shield-progress-rect"
              />
              <!-- Animated wave on top of fill -->
              <path
                ref="wavePathRef"
                :d="wavePath"
                fill="url(#shieldFill)"
                fill-opacity="0.7"
                class="shield-wave"
              />
            </g>

            <!-- Inner outline accent -->
            <path
              d="M 260 138
                 C 226 146, 195 156, 188 164
                 L 188 248
                 C 188 308, 226 358, 260 376
                 C 294 358, 332 308, 332 248
                 L 332 164
                 C 325 156, 294 146, 260 138 Z"
              fill="none"
              stroke="white"
              stroke-width="1"
              stroke-opacity="0.4"
            />

            <!-- Vaccine dots — orbited around -->
            <g
              v-for="(v, i) in orbitalVaccines"
              :key="v.id"
              :transform="`translate(${260 + Math.cos((v.angle - 90) * Math.PI / 180) * v.r} ${260 + Math.sin((v.angle - 90) * Math.PI / 180) * v.r})`"
              class="vax-dot"
              :class="[
                `vax-dot--${v.status}`,
                { 'is-selected': selectedId === v.id, 'is-dim': selectedId && selectedId !== v.id },
              ]"
              role="button"
              tabindex="0"
              :aria-label="`${v.name}: ${v.status === 'done' ? 'выполнено' : 'предстоит'}`"
              @click="selectVax(v.id, i)"
              @mouseenter="hoveredId = v.id"
              @mouseleave="hoveredId = null"
              @keydown.enter="selectVax(v.id, i)"
              @keydown.space.prevent="selectVax(v.id, i)"
            >
              <!-- Outer pulse for selected/next -->
              <circle r="22" class="dot-ring dot-ring-outer" />
              <circle r="16" class="dot-ring dot-ring-inner" />
              <!-- Core -->
              <circle r="10" class="dot-core" />
              <!-- Icon inside -->
              <foreignObject x="-7" y="-7" width="14" height="14">
                <Icon
                  :name="v.status === 'done' ? 'lucide:check' : 'lucide:syringe'"
                  size="11"
                  :style="{ color: 'white', display: 'block' }"
                />
              </foreignObject>
            </g>
          </svg>

          <!-- Shield centre — % readout -->
          <div class="vax-centre">
            <span class="vax-centre-eyebrow t-eyebrow">Защита</span>
            <span class="vax-centre-num t-kpi">{{ pctDone }}<sup>%</sup></span>
            <span class="vax-centre-sub">
              <span class="font-mono">{{ doneCount }}</span> из <span class="font-mono">{{ vaccines.length }}</span>
            </span>
          </div>

          <!-- Floating tooltip for hovered vaccine -->
          <div
            v-if="hoveredVaccine"
            class="vax-tooltip"
            :style="tooltipStyle"
          >
            <span class="vax-tooltip-name">{{ hoveredVaccine.name }}</span>
            <span class="vax-tooltip-meta">{{ hoveredVaccine.age }} · {{ hoveredVaccine.status === 'done' ? 'выполнено' : 'предстоит' }}</span>
          </div>

          <!-- Floating label below shield -->
          <div class="vax-labels">
            <div class="vax-label">
              <span class="vax-label-dot vax-label-dot--done" />
              <span class="vax-label-text">Выполнено <strong>{{ doneCount }}</strong></span>
            </div>
            <div class="vax-label">
              <span class="vax-label-dot vax-label-dot--next" />
              <span class="vax-label-text">Следующая <strong>{{ daysToNext }}</strong></span>
            </div>
            <div class="vax-label">
              <span class="vax-label-dot vax-label-dot--upcoming" />
              <span class="vax-label-text">Предстоит <strong>{{ upcomingCount }}</strong></span>
            </div>
          </div>
        </div>

        <!-- ─── Right side: detail card ─── -->
        <Transition name="vax-detail-fade">
          <aside v-if="selectedVax" :key="selectedVax.id" class="vax-detail">
            <header class="vax-detail-head">
              <div class="vax-detail-icon" :data-status="selectedVax.status">
                <Icon
                  :name="selectedVax.status === 'done' ? 'lucide:shield-check' : 'lucide:syringe'"
                  size="22"
                />
              </div>
              <div>
                <span class="vax-detail-eyebrow t-eyebrow">{{ selectedVax.status === 'done' ? 'Выполнено' : 'Предстоит' }}</span>
                <h3 class="vax-detail-title t-h4">{{ selectedVax.name }}</h3>
              </div>
              <button class="vax-detail-close" type="button" aria-label="Закрыть" @click="selectedId = null">
                <Icon name="lucide:x" size="14" />
              </button>
            </header>

            <p class="vax-detail-text">{{ selectedVax.protects }}</p>

            <div class="vax-detail-grid">
              <div class="vax-detail-cell">
                <span class="vax-detail-cell-lbl t-meta">Возраст</span>
                <span class="vax-detail-cell-val">{{ selectedVax.age }}</span>
              </div>
              <div class="vax-detail-cell">
                <span class="vax-detail-cell-lbl t-meta">Тип</span>
                <span class="vax-detail-cell-val">{{ selectedVax.type }}</span>
              </div>
              <div class="vax-detail-cell">
                <span class="vax-detail-cell-lbl t-meta">{{ selectedVax.status === 'done' ? 'Дата' : 'Напомним' }}</span>
                <span class="vax-detail-cell-val font-mono">{{ selectedVax.dateLabel }}</span>
              </div>
            </div>

            <footer class="vax-detail-foot">
              <button type="button" class="vax-detail-btn vax-detail-btn--primary">
                <Icon :name="selectedVax.status === 'done' ? 'lucide:file-text' : 'lucide:bell'" size="13" />
                {{ selectedVax.status === 'done' ? 'Сертификат' : 'Подключить напоминание' }}
              </button>
              <button type="button" class="vax-detail-btn vax-detail-btn--ghost">
                <Icon name="lucide:info" size="13" />
                Подробнее
              </button>
            </footer>
          </aside>

          <aside v-else class="vax-placeholder" key="placeholder">
            <div class="vax-placeholder-icon">
              <Icon name="lucide:mouse-pointer-click" size="22" />
            </div>
            <span class="vax-placeholder-text">
              Нажмите на любую точку, чтобы увидеть детали прививки
            </span>
            <div class="vax-placeholder-features">
              <div class="vax-feat">
                <Icon name="lucide:bell" size="13" />
                <span>Напоминание за 3 дня</span>
              </div>
              <div class="vax-feat">
                <Icon name="lucide:scroll-text" size="13" />
                <span>История партий и серий</span>
              </div>
              <div class="vax-feat">
                <Icon name="lucide:file-check-2" size="13" />
                <span>Сертификат за 1 клик</span>
              </div>
              <div class="vax-feat">
                <Icon name="lucide:calendar-check" size="13" />
                <span>Нацкалендарь РК</span>
              </div>
            </div>
          </aside>
        </Transition>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type VaxStatus = 'done' | 'next' | 'upcoming'

interface Vaccine {
  id: string
  name: string
  protects: string
  age: string
  type: string
  status: VaxStatus
  dateLabel: string
}

const vaccines: Vaccine[] = [
  { id: 'bcg',     name: 'БЦЖ',                protects: 'Туберкулёз — введение в первые сутки жизни',     age: 'при рождении', type: 'однократно',  status: 'done', dateLabel: '15 янв' },
  { id: 'hbv1',    name: 'Гепатит B #1',       protects: 'Защита от гепатита B, первая доза',              age: 'при рождении', type: 'инактив.',    status: 'done', dateLabel: '15 янв' },
  { id: 'hbv2',    name: 'Гепатит B #2',       protects: 'Гепатит B, вторая доза',                          age: '1 месяц',      type: 'инактив.',    status: 'done', dateLabel: '14 фев' },
  { id: 'pen1',    name: 'Пентавакцина #1',    protects: 'Дифтерия, коклюш, столбняк, полио, Hib',           age: '2 месяца',     type: 'комбинир.',   status: 'done', dateLabel: '15 мар' },
  { id: 'pcv1',    name: 'PCV13 #1',           protects: 'Пневмококковая инфекция',                          age: '2 месяца',     type: 'конъюгир.',   status: 'done', dateLabel: '15 мар' },
  { id: 'ipv1',    name: 'ИПВ #1',             protects: 'Полиомиелит, инактивированная',                    age: '2 месяца',     type: 'инактив.',    status: 'done', dateLabel: '15 мар' },
  { id: 'rota1',   name: 'Ротавирус #1',       protects: 'Ротавирусная инфекция',                            age: '2 месяца',     type: 'живая',       status: 'done', dateLabel: '15 мар' },
  { id: 'pen2',    name: 'Пентавакцина #2',    protects: 'Бустер 5-в-1',                                     age: '3 месяца',     type: 'комбинир.',   status: 'done', dateLabel: '15 апр' },

  { id: 'pcv2',    name: 'PCV13 #2',           protects: 'Пневмококк, вторая доза',                          age: '4 месяца',     type: 'конъюгир.',   status: 'next', dateLabel: 'через 5 дней' },

  { id: 'ipv2',    name: 'ИПВ #2',             protects: 'Полиомиелит, вторая доза',                         age: '4 месяца',     type: 'инактив.',    status: 'upcoming', dateLabel: 'через 5 дней' },
  { id: 'rota2',   name: 'Ротавирус #2',       protects: 'Ротавирусная, вторая доза',                        age: '4 месяца',     type: 'живая',       status: 'upcoming', dateLabel: 'через 5 дней' },
  { id: 'pen3',    name: 'Пентавакцина #3',    protects: 'Бустер 5-в-1, третья',                             age: '6 месяцев',    type: 'комбинир.',   status: 'upcoming', dateLabel: '15 июл' },
  { id: 'hbv3',    name: 'Гепатит B #3',       protects: 'Бустер, третья доза',                              age: '6 месяцев',    type: 'инактив.',    status: 'upcoming', dateLabel: '15 июл' },
  { id: 'pcv3',    name: 'PCV13 #3',           protects: 'Пневмококк, бустер',                               age: '12 месяцев',   type: 'конъюгир.',   status: 'upcoming', dateLabel: 'янв 2027' },
  { id: 'mmr',     name: 'КПК',                protects: 'Корь, паротит, краснуха',                          age: '12 месяцев',   type: 'живая',       status: 'upcoming', dateLabel: 'янв 2027' },
  { id: 'hib',     name: 'Hib',                 protects: 'Гемофильная инфекция b',                           age: '12 месяцев',   type: 'конъюгир.',   status: 'upcoming', dateLabel: 'янв 2027' },
  { id: 'dtap',    name: 'АКДС бустер',         protects: 'Бустер дифтерия-коклюш-столбняк',                   age: '18 месяцев',   type: 'комбинир.',   status: 'upcoming', dateLabel: 'июл 2027' },
  { id: 'hav',     name: 'Гепатит A',           protects: 'Профилактика гепатита А',                          age: '18 месяцев',   type: 'инактив.',    status: 'upcoming', dateLabel: 'июл 2027' },
]

// ─── Position vaccines around the shield ───
// Done vaccines go on the inner ring (r=180), upcoming go on the outer ring (r=240)
// next vaccine is highlighted but stays in its natural ring
interface OrbitalVaccine extends Vaccine {
  angle: number
  r: number
}

const orbitalVaccines = computed<OrbitalVaccine[]>(() => {
  const result: OrbitalVaccine[] = []
  const done = vaccines.filter(v => v.status === 'done')
  const next = vaccines.filter(v => v.status === 'next')
  const upcoming = vaccines.filter(v => v.status === 'upcoming')

  // Inner ring: done + next (positioned uniformly across 360°)
  const innerSet = [...done, ...next]
  innerSet.forEach((v, i) => {
    result.push({
      ...v,
      r: 180,
      angle: (i / innerSet.length) * 360 + 5, // slight offset so no dot lies on the top axis
    })
  })

  // Outer ring: upcoming
  upcoming.forEach((v, i) => {
    result.push({
      ...v,
      r: 240,
      angle: (i / upcoming.length) * 360 + 12,
    })
  })

  return result
})

const doneCount = computed(() => vaccines.filter(v => v.status === 'done').length)
const upcomingCount = computed(() => vaccines.filter(v => v.status === 'upcoming').length)
const nextVaccine = computed(() => vaccines.find(v => v.status === 'next'))
const daysToNext = computed(() => nextVaccine.value ? nextVaccine.value.dateLabel : '—')

const pctDone = computed(() => Math.round((doneCount.value / vaccines.length) * 100))
const fillRatio = computed(() => doneCount.value / vaccines.length)

// Wave path — gently sinusoidal, sits at the top of the fill rect
const waveOffset = ref(0)
let waveTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  waveTimer = setInterval(() => { waveOffset.value = (waveOffset.value + 4) % 360 }, 80)
})
onUnmounted(() => { if (waveTimer) clearInterval(waveTimer) })

const wavePath = computed(() => {
  const y0 = 170 + (1 - fillRatio.value) * 250  // top of fill rect
  const w = 180
  const x0 = 170
  // 3 sine humps across width
  const segments = 24
  let d = `M ${x0} ${y0}`
  for (let i = 1; i <= segments; i++) {
    const x = x0 + (i / segments) * w
    const phase = (i / segments) * Math.PI * 3 + (waveOffset.value * Math.PI / 180)
    const y = y0 + Math.sin(phase) * 4
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`
  }
  d += ` L ${x0 + w} ${y0 + 240} L ${x0} ${y0 + 240} Z`
  return d
})

// ─── Selection / hover state ───
const selectedId = ref<string | null>(null)
const hoveredId = ref<string | null>(null)
const tooltipStyle = ref<Record<string, string>>({ top: '0px', left: '0px' })

const selectedVax = computed(() =>
  vaccines.find(v => v.id === selectedId.value) || null
)

const hoveredVaccine = computed(() =>
  vaccines.find(v => v.id === hoveredId.value) || null
)

function selectVax(id: string, index: number) {
  selectedId.value = selectedId.value === id ? null : id
  void index // unused param tolerated
}

// Auto-select the "next" vaccine on mount for visual story
let autoSelectTimer: ReturnType<typeof setTimeout> | null = null
onMounted(() => {
  autoSelectTimer = setTimeout(() => {
    if (nextVaccine.value) selectedId.value = nextVaccine.value.id
    autoSelectTimer = null
  }, 500)
})
onBeforeUnmount(() => {
  if (autoSelectTimer) {
    clearTimeout(autoSelectTimer)
    autoSelectTimer = null
  }
})

const vaxTitleRef = ref<HTMLElement | null>(null)
useSplitText?.(vaxTitleRef, {
  type: 'words',
  from: { y: '100%', opacity: 0 },
  stagger: 0.05,
  duration: 0.7,
  ease: 'power3.out',
  scroll: true,
  scrollStart: 'top 85%',
})
</script>

<style scoped>
/* ════════════════════════════════════════════════
   Phase 11 — Orbiting Vaccine Shield
   ════════════════════════════════════════════════ */

.vax-section {
  background: linear-gradient(180deg, #FFFFFF 0%, #FBF6FF 100%);
  position: relative;
  overflow: hidden;
}

/* Header */
.vax-head {
  text-align: center;
  margin-bottom: 48px;
  max-width: 740px;
  margin-inline: auto;
}

.vax-eyebrow {
  display: inline-block;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  background: rgba(91, 192, 190, 0.10);
  border: 1px solid rgba(91, 192, 190, 0.22);
  color: var(--color-mint-dark, #3FA5A3);
  margin-bottom: 16px;
}

.vax-title {
  margin: 0 0 12px;
  color: var(--color-text-primary);
}

.vax-subtitle {
  margin: 0 auto;
  text-align: center;
  color: var(--color-text-secondary);
}

/* Stage */
.vax-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 1fr);
  gap: 32px;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
}

/* ─── Orbit wrap ─── */
.vax-orbit-wrap {
  position: relative;
  aspect-ratio: 1;
  max-width: 540px;
  margin: 0 auto;
  width: 100%;
}

.vax-bloom {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.vax-bloom-1 {
  width: 380px;
  height: 380px;
  top: -40px;
  right: -40px;
  background: radial-gradient(circle, rgba(91, 192, 190, 0.18), transparent 70%);
}

.vax-bloom-2 {
  width: 320px;
  height: 320px;
  bottom: -40px;
  left: -40px;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.22), transparent 70%);
}

.vax-orbits-svg {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 12px 32px rgba(75, 50, 130, 0.10));
}

.shield-progress-rect {
  transition: y 1.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.shield-wave {
  transition: d 0.08s linear;
}

/* ─── Vaccine dots ─── */
.vax-dot {
  cursor: pointer;
  outline: none;
  transition: opacity 0.3s ease;
}

.vax-dot:focus-visible .dot-core {
  filter: drop-shadow(0 0 0 2px white) drop-shadow(0 0 0 4px currentColor);
}

.vax-dot.is-dim {
  opacity: 0.30;
}

/* Status colors */
.vax-dot--done { color: #5BC0BE; }
.vax-dot--next { color: var(--color-secondary); }
.vax-dot--upcoming { color: var(--color-primary); }

/* Rings — outer pulse layers */
.dot-ring {
  fill: currentColor;
  opacity: 0;
  transform-origin: center;
  transform-box: fill-box;
}

.vax-dot--done .dot-ring-outer {
  opacity: 0.18;
  animation: ring-pulse-slow 3.6s ease-in-out infinite;
}

.vax-dot--next .dot-ring-outer {
  animation: ring-pulse-fast 1.8s ease-out infinite;
}

.vax-dot--next .dot-ring-inner {
  animation: ring-pulse-fast 1.8s ease-out infinite;
  animation-delay: 0.5s;
}

@keyframes ring-pulse-slow {
  0%, 100% { opacity: 0.18; transform: scale(1); }
  50% { opacity: 0.30; transform: scale(1.08); }
}

@keyframes ring-pulse-fast {
  0% { opacity: 0.45; transform: scale(0.6); }
  100% { opacity: 0; transform: scale(1.5); }
}

/* Inner halo (visible on selected) */
.dot-ring-inner {
  fill: currentColor;
}

.vax-dot.is-selected .dot-ring-inner {
  opacity: 0.40;
}

.vax-dot.is-selected .dot-ring-outer {
  opacity: 0.20;
}

/* Core dot */
.dot-core {
  fill: currentColor;
  filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.10));
  transition: transform 0.25s ease;
  transform-origin: center;
  transform-box: fill-box;
}

.vax-dot--done .dot-core {
  fill: #5BC0BE;
}

.vax-dot--upcoming .dot-core {
  fill: white;
  stroke: var(--color-primary);
  stroke-width: 2;
  stroke-dasharray: 3 2;
}

.vax-dot--upcoming foreignObject :deep(svg) {
  color: var(--color-primary) !important;
}

.vax-dot:hover .dot-core,
.vax-dot.is-selected .dot-core {
  transform: scale(1.20);
}

/* Centre readout — overlapping SVG */
.vax-centre {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 5;
  pointer-events: none;
  text-align: center;
}

.vax-centre-eyebrow {
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 0 2px rgba(75, 50, 130, 0.7);
}

.vax-centre-num {
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #FFFFFF, #FAE9F0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
  filter: drop-shadow(0 2px 8px rgba(75, 50, 130, 0.4));
}

.vax-centre-num sup { font-size: 0.45em; vertical-align: super; }

.vax-centre-sub {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  text-shadow: 0 0 2px rgba(75, 50, 130, 0.6);
}

.vax-centre-sub .font-mono {
  color: white;
  font-weight: 600;
}

/* Hover tooltip floating */
.vax-tooltip {
  position: absolute;
  z-index: 6;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.18);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.78rem;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 1px;
  box-shadow: 0 4px 12px -4px rgba(75, 50, 130, 0.20);
  transform: translate(-50%, -100%);
}

.vax-tooltip-name {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.vax-tooltip-meta {
  font-size: 0.68rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

/* Labels below shield */
.vax-labels {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 126, 200, 0.14);
  border-radius: var(--radius-full);
  box-shadow: 0 6px 16px -4px rgba(139, 126, 200, 0.18);
  z-index: 4;
  flex-wrap: nowrap;
}

.vax-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.vax-label-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 6px currentColor;
}

.vax-label-dot--done { background: #5BC0BE; color: #5BC0BE; }
.vax-label-dot--next { background: var(--color-secondary); color: var(--color-secondary); }
.vax-label-dot--upcoming { background: var(--color-primary); color: var(--color-primary); }

.vax-label-text strong {
  color: var(--color-text-primary);
  font-weight: 600;
  font-family: var(--font-mono);
  font-size: 0.74rem;
}

/* ════════════════════════════════════════════════
   Detail panel (right)
   ════════════════════════════════════════════════ */
.vax-detail,
.vax-placeholder {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-lg);
  padding: 24px 26px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 1px 2px rgba(75, 50, 130, 0.03),
    0 12px 32px -12px rgba(139, 126, 200, 0.18);
}

.vax-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vax-detail-head {
  display: grid;
  grid-template-columns: 48px 1fr 30px;
  gap: 14px;
  align-items: center;
}

.vax-detail-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.vax-detail-icon[data-status="done"] {
  background: linear-gradient(135deg, #5BC0BE, #3FA5A3);
  box-shadow: 0 6px 14px -4px rgba(91, 192, 190, 0.45);
}

.vax-detail-icon[data-status="next"] {
  background: linear-gradient(135deg, #E8A0BF, #D47EA5);
  box-shadow: 0 6px 14px -4px rgba(232, 160, 191, 0.45);
}

.vax-detail-icon[data-status="upcoming"] {
  background: var(--gradient-cta);
  box-shadow: 0 6px 14px -4px rgba(139, 126, 200, 0.45);
}

.vax-detail-eyebrow {
  display: block;
  margin-bottom: 2px;
  color: var(--color-text-muted);
}

.vax-detail-title {
  margin: 0;
  color: var(--color-text-primary);
}

.vax-detail-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-text-muted);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.vax-detail-close:hover {
  background: rgba(139, 126, 200, 0.18);
  transform: rotate(90deg);
}

.vax-detail-text {
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin: 0;
  padding: 12px 14px;
  background: rgba(139, 126, 200, 0.04);
  border-left: 3px solid var(--color-primary);
  border-radius: 8px;
}

.vax-detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.04), rgba(232, 160, 191, 0.04));
  border-radius: 10px;
}

.vax-detail-cell {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.vax-detail-cell-lbl {
  color: var(--color-text-muted);
}

.vax-detail-cell-val {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.vax-detail-foot {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.vax-detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 10px;
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vax-detail-btn--primary {
  background: var(--gradient-cta);
  color: white;
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.40);
  flex: 1;
}

.vax-detail-btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -4px rgba(139, 126, 200, 0.55);
}

.vax-detail-btn--ghost {
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary);
}

.vax-detail-btn--ghost:hover {
  background: rgba(139, 126, 200, 0.16);
}

/* Placeholder */
.vax-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.vax-placeholder-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.12), rgba(91, 192, 190, 0.12));
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.vax-placeholder-text {
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text-primary);
  max-width: 26ch;
}

.vax-placeholder-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
  margin-top: 6px;
}

.vax-feat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: rgba(248, 246, 252, 0.6);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.vax-feat :deep(svg) {
  color: var(--color-primary);
  flex-shrink: 0;
}

/* Transitions */
.vax-detail-fade-enter-active,
.vax-detail-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.vax-detail-fade-enter-from,
.vax-detail-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive */
@media (max-width: 900px) {
  .vax-stage {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .vax-orbit-wrap {
    max-width: 420px;
  }
  .vax-labels {
    bottom: -20px;
    font-size: 0.66rem;
  }
}

@media (max-width: 600px) {
  .vax-detail,
  .vax-placeholder {
    padding: 18px 20px;
  }
  .vax-detail-grid {
    grid-template-columns: 1fr;
  }
  .vax-placeholder-features {
    grid-template-columns: 1fr;
  }
  .vax-labels {
    gap: 8px;
    padding: 6px 10px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .dot-ring,
  .shield-wave {
    animation: none !important;
  }
}
</style>
