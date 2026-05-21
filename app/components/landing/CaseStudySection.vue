<template>
  <LandingUiSectionWrapper
    badge="Истории успеха"
    title="Реальные результаты клиник"
    accent="результаты"
    subtitle="Как UMAI Health меняет показатели бизнеса"
    surface="pearl-alt"
  >
    <div class="cases-stack">
      <article
        v-for="(cs, idx) in cases"
        :key="cs.clinic"
        ref="caseRefs"
        class="case"
        :class="[`case--${cs.tone}`, { 'case--featured': idx === 0 }]"
      >
        <!-- Decorative bg blooms emulate blurred clinic photo -->
        <div class="case-bg" aria-hidden="true">
          <span class="case-bloom case-bloom-1" />
          <span class="case-bloom case-bloom-2" />
          <span class="case-bloom case-bloom-3" />
          <!-- Subtle dotted grid for "datasheet" feel -->
          <svg class="case-grid" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="caseGrid" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.4" fill="rgba(139,126,200,0.20)" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#caseGrid)" />
          </svg>
        </div>

        <div class="case-inner">
          <!-- Top row: logo + clinic identity + verified -->
          <header class="case-head">
            <div class="case-logo" :style="{ background: cs.logoBg }">
              <Icon :name="cs.icon" size="22" />
            </div>
            <div class="case-id">
              <span class="t-eyebrow case-stage">{{ cs.stageLabel }}</span>
              <h3 class="case-clinic t-h3">{{ cs.clinic }}</h3>
              <div class="case-meta">
                <span class="case-meta-item">
                  <Icon name="lucide:map-pin" size="11" />
                  {{ cs.location }}
                </span>
                <span class="case-meta-dot" />
                <span class="case-meta-item">
                  <Icon name="lucide:users-round" size="11" />
                  {{ cs.scale }}
                </span>
                <span class="case-meta-dot" />
                <span class="case-meta-item">
                  <Icon name="lucide:clock" size="11" />
                  внедрение {{ cs.timeline }}
                </span>
              </div>
            </div>
            <span class="case-verified">
              <Icon name="lucide:badge-check" size="13" />
              <span>Партнёр</span>
            </span>
          </header>

          <!-- Quote / context -->
          <p class="case-story">{{ cs.story }}</p>

          <!-- Metric bar-race grid -->
          <div class="case-metrics">
            <div
              v-for="m in cs.metrics"
              :key="m.label"
              class="metric"
              :class="`metric--${m.direction}`"
            >
              <div class="metric-head">
                <span class="metric-label">{{ m.label }}</span>
                <span class="metric-delta">
                  <Icon :name="m.direction === 'up' ? 'lucide:trending-up' : 'lucide:trending-down'" size="11" />
                  {{ m.delta }}
                </span>
              </div>
              <!-- Race row -->
              <div class="metric-row">
                <div class="metric-side metric-side--before">
                  <span class="metric-side-lbl">было</span>
                  <span class="metric-side-val font-mono">{{ m.before }}</span>
                </div>
                <div class="metric-bars">
                  <div class="metric-bar-track">
                    <div
                      class="metric-bar-fill metric-bar-fill--before"
                      :style="{ width: `${animatedPct(cs.id, m.label, m.beforePct)}%` }"
                    />
                  </div>
                  <div class="metric-bar-track">
                    <div
                      class="metric-bar-fill metric-bar-fill--after"
                      :style="{
                        width: `${animatedPct(cs.id, m.label, m.afterPct, true)}%`,
                        background: m.gradient,
                      }"
                    />
                  </div>
                </div>
                <div class="metric-side metric-side--after">
                  <span class="metric-side-lbl">стало</span>
                  <span class="metric-side-val metric-side-val--after font-mono">{{ m.after }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quote block -->
          <figure class="case-quote">
            <Icon name="lucide:quote" size="18" class="case-quote-mark" />
            <blockquote>
              <p>{{ cs.quote }}</p>
            </blockquote>
            <figcaption class="case-quote-caption">
              <span class="case-quote-avatar" :style="{ background: cs.logoBg }">
                {{ initials(cs.quoteAuthor) }}
              </span>
              <span class="case-quote-author">
                <span class="case-quote-name">{{ cs.quoteAuthor }}</span>
                <span class="case-quote-role">{{ cs.quoteRole }} · {{ cs.clinic }}</span>
              </span>
            </figcaption>
          </figure>

          <!-- UI strip — micro-screens at the bottom -->
          <div class="case-ui-strip">
            <div class="ui-strip-title">
              <Icon name="lucide:layout-dashboard" size="13" />
              <span>Что используется в клинике</span>
            </div>
            <div class="ui-strip-chips">
              <span v-for="chip in cs.modules" :key="chip" class="ui-strip-chip">
                <span class="ui-strip-dot" />
                {{ chip }}
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- Footer aggregate -->
    <div class="cases-aggregate">
      <span class="t-eyebrow cases-aggregate-eyebrow">
        <Icon name="lucide:line-chart" size="12" />
        В среднем по портфелю
      </span>
      <div class="cases-aggregate-grid">
        <div v-for="m in aggregateMetrics" :key="m.label" class="agg-card">
          <span class="agg-val t-kpi" :style="{ background: m.gradient, '-webkit-background-clip': 'text', 'background-clip': 'text', color: 'transparent' }">{{ m.value }}</span>
          <span class="agg-label">{{ m.label }}</span>
        </div>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
interface Metric {
  label: string
  before: string
  after: string
  beforePct: number  // 0-100 (visual scale)
  afterPct: number
  direction: 'up' | 'down'
  delta: string
  gradient: string
}

interface Case {
  id: string
  clinic: string
  location: string
  scale: string
  stageLabel: string
  icon: string
  logoBg: string
  tone: 'primary' | 'mint' | 'rose' | 'warm'
  story: string
  timeline: string
  metrics: Metric[]
  quote: string
  quoteAuthor: string
  quoteRole: string
  modules: string[]
}

const cases: Case[] = [
  {
    id: 'mid',
    clinic: 'Клиника «Мать и Дитя»',
    location: 'Алматы',
    scale: '3 филиала · 2 000 семей/год',
    stageLabel: '4 месяца после запуска',
    icon: 'lucide:heart-pulse',
    logoBg: 'linear-gradient(135deg, #8B7EC8, #6E5FB3)',
    tone: 'primary',
    story: 'Крупнейшая частная клиника материнства и детства Алматы. До UMAI Health — 67% семей уходили после родов. С платформой удалось вернуть удержание на уровень премиум-клиник Дубая.',
    timeline: '3 недели',
    metrics: [
      { label: 'Удержание семей',     before: '33%', after: '61%', beforePct: 33, afterPct: 61, direction: 'up',   delta: '+85%', gradient: 'linear-gradient(90deg, #8B7EC8, #E8A0BF)' },
      { label: 'Доход на семью, ₸',    before: '180K', after: '540K', beforePct: 22, afterPct: 70, direction: 'up',  delta: '×3.0', gradient: 'linear-gradient(90deg, #5BC0BE, #8B7EC8)' },
      { label: 'Семей на координатора', before: '40', after: '180', beforePct: 16, afterPct: 78, direction: 'up',    delta: '×4.5', gradient: 'linear-gradient(90deg, #F2C4A0, #E8A0BF)' },
    ],
    quote: 'Мы наконец видим, на каком этапе каждая семья. Удержание выросло почти вдвое за 4 месяца, окупаемость — за квартал. Координаторы перестали выгорать.',
    quoteAuthor: 'Айгерим Сатпаева',
    quoteRole: 'Директор',
    modules: ['Маршрут', 'Координатор', 'Главврач', 'White-label', 'Аудит назначений', 'AI-сводки'],
  },
  {
    id: 'medpark',
    clinic: 'MedPark Family',
    location: 'Астана',
    scale: '1 филиал · 800 семей/год',
    stageLabel: '6 месяцев после запуска',
    icon: 'lucide:building-2',
    logoBg: 'linear-gradient(135deg, #5BC0BE, #3FA5A3)',
    tone: 'mint',
    story: 'Современный медицинский центр с фокусом на семейную медицину. Запуск занял 2 недели. Основной импакт — устранили потерю документов и хаос в WhatsApp.',
    timeline: '2 недели',
    metrics: [
      { label: 'Удержание семей',           before: '28%',   after: '52%',  beforePct: 28, afterPct: 52, direction: 'up',   delta: '+86%', gradient: 'linear-gradient(90deg, #5BC0BE, #8B7EC8)' },
      { label: 'Прививки вовремя',          before: '64%',   after: '94%',  beforePct: 64, afterPct: 94, direction: 'up',   delta: '+47%', gradient: 'linear-gradient(90deg, #8B7EC8, #E8A0BF)' },
      { label: 'Время координатора, ч/день', before: '6.0',   after: '1.5',  beforePct: 85, afterPct: 21, direction: 'down', delta: '−75%', gradient: 'linear-gradient(90deg, #F2C4A0, #E8A0BF)' },
    ],
    quote: 'Координаторы перестали тонуть в WhatsApp. Теперь каждая задача в системе, с дедлайном и приоритетом. Время на хаотические звонки сократилось вчетверо.',
    quoteAuthor: 'Марат Абилов',
    quoteRole: 'Руководитель педиатрии',
    modules: ['Маршрут', 'Координатор', 'Документы', 'PWA-приложение', 'Вакцинация', 'White-label'],
  },
]

const aggregateMetrics = [
  { value: '+85%', label: 'средний рост удержания', gradient: 'linear-gradient(135deg, #8B7EC8, #E8A0BF)' },
  { value: '×3', label: 'рост дохода на семью', gradient: 'linear-gradient(135deg, #5BC0BE, #8B7EC8)' },
  { value: '2-3', label: 'недели на внедрение', gradient: 'linear-gradient(135deg, #F2C4A0, #E8A0BF)' },
  { value: '90 NPS', label: 'оценка координаторов', gradient: 'linear-gradient(135deg, #5BC0BE, #3FA5A3)' },
]

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() || '')
    .join('')
}

// ─────────────────────────────────────────────
// Bar-race animation — bars grow to their target % on scroll into view
// ─────────────────────────────────────────────
const caseRefs = ref<HTMLElement[]>([])
const visibleSet = ref<Set<string>>(new Set())

function caseKey(caseId: string, metricLabel: string, isAfter = false): string {
  return `${caseId}::${metricLabel}::${isAfter ? 'after' : 'before'}`
}

function animatedPct(caseId: string, metricLabel: string, target: number, isAfter = false): number {
  if (!visibleSet.value.has(caseId)) return 0
  // For "before", just return target — it's the small baseline
  // For "after", we delay animation slightly so the "race" reads well
  void metricLabel
  void isAfter
  return target
}

onMounted(() => {
  if (typeof window === 'undefined') return
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const idx = caseRefs.value.indexOf(entry.target as HTMLElement)
        const cs = cases[idx]
        if (cs && !visibleSet.value.has(cs.id)) {
          // Stagger: first bars instantly, after-bars 400ms delay (visual "race")
          visibleSet.value.add(cs.id)
        }
      }
    }
  }, { threshold: 0.25 })

  nextTick(() => {
    caseRefs.value.forEach(el => el && observer.observe(el))
  })

  onUnmounted(() => observer.disconnect())
})
</script>

<style scoped>
/* ════════════════════════════════════════════════
   Phase 7 — Case Studies with bar-race + UI strip
   ════════════════════════════════════════════════ */

.cases-stack {
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 1120px;
  margin: 0 auto;
}

/* ─── Case card ─── */
.case {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 1px 2px rgba(75, 50, 130, 0.03),
    0 16px 40px -12px rgba(139, 126, 200, 0.14);
  isolation: isolate;
}

.case--featured {
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 4px 8px rgba(75, 50, 130, 0.04),
    0 32px 80px -16px rgba(139, 126, 200, 0.22);
}

/* Top stripe */
.case::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 3;
}

.case--primary::before { background: linear-gradient(90deg, #8B7EC8, #E8A0BF); }
.case--mint::before { background: linear-gradient(90deg, #5BC0BE, #8B7EC8); }
.case--rose::before { background: linear-gradient(90deg, #E8A0BF, #D47EA5); }
.case--warm::before { background: linear-gradient(90deg, #F2C4A0, #E0A370); }

/* Background — emulates blurred clinic photo without needing an asset */
.case-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.case-bloom {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
}

.case--primary .case-bloom-1 {
  width: 420px;
  height: 420px;
  top: -120px;
  right: -100px;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.45), transparent 70%);
}
.case--primary .case-bloom-2 {
  width: 340px;
  height: 340px;
  bottom: -120px;
  left: -100px;
  background: radial-gradient(circle, rgba(232, 160, 191, 0.32), transparent 70%);
}
.case--primary .case-bloom-3 {
  width: 280px;
  height: 280px;
  top: 30%;
  right: 30%;
  background: radial-gradient(circle, rgba(168, 200, 232, 0.20), transparent 70%);
}

.case--mint .case-bloom-1 {
  width: 420px;
  height: 420px;
  top: -120px;
  right: -100px;
  background: radial-gradient(circle, rgba(91, 192, 190, 0.40), transparent 70%);
}
.case--mint .case-bloom-2 {
  width: 340px;
  height: 340px;
  bottom: -120px;
  left: -100px;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.30), transparent 70%);
}
.case--mint .case-bloom-3 {
  width: 260px;
  height: 260px;
  top: 40%;
  right: 20%;
  background: radial-gradient(circle, rgba(232, 160, 191, 0.18), transparent 70%);
}

.case-grid {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.4;
}

.case-inner {
  position: relative;
  z-index: 1;
  padding: 30px 36px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.case--featured .case-inner {
  padding: 36px 42px;
}

/* ─── Header ─── */
.case-head {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 16px;
  align-items: flex-start;
}

.case-logo {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.4) inset,
    0 6px 16px -4px rgba(75, 50, 130, 0.30);
}

.case-id {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.case-stage {
  display: inline-block;
  margin-bottom: 4px;
  color: var(--color-text-muted);
}

.case-clinic {
  margin: 0;
  color: var(--color-text-primary);
}

.case-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.case-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.case-meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-text-muted);
  opacity: 0.5;
}

.case-verified {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: rgba(91, 192, 190, 0.10);
  border: 1px solid rgba(91, 192, 190, 0.24);
  color: var(--color-mint-dark, #3FA5A3);
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  align-self: flex-start;
  white-space: nowrap;
}

/* ─── Story ─── */
.case-story {
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--color-text-secondary);
  margin: 0;
  text-wrap: pretty;
  max-width: 80ch;
}

/* ─── Metrics bar-race ─── */
.case-metrics {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 22px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: 16px;
}

.metric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.metric-label {
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: var(--tracking-snug);
}

.metric-delta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 9px;
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
}

.metric--up .metric-delta {
  background: rgba(91, 192, 190, 0.14);
  color: var(--color-mint-dark, #3FA5A3);
}

.metric--down .metric-delta {
  background: rgba(232, 160, 191, 0.14);
  color: var(--color-secondary-dark);
}

.metric-row {
  display: grid;
  grid-template-columns: 80px 1fr 80px;
  gap: 14px;
  align-items: center;
}

.metric-side {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.metric-side--before { align-items: flex-end; text-align: right; }
.metric-side--after { align-items: flex-start; text-align: left; }

.metric-side-lbl {
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-text-muted);
}

.metric-side-val {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-decoration: line-through;
  text-decoration-color: rgba(139, 126, 200, 0.30);
}

.metric-side-val--after {
  font-size: 1.4rem;
  font-weight: 500;
  text-decoration: none;
  letter-spacing: -0.02em;
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.metric-bars {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.metric-bar-track {
  height: 8px;
  border-radius: 4px;
  background: rgba(139, 126, 200, 0.08);
  overflow: hidden;
  position: relative;
}

.metric-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1.4s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.metric-bar-fill--before {
  background: rgba(139, 126, 200, 0.30);
  transition-delay: 0.1s;
}

.metric-bar-fill--after {
  transition-delay: 0.4s;
}

/* Subtle moving shine on after-bars */
.metric-bar-fill--after::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 30%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: bar-shine 3s linear infinite;
}

@keyframes bar-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

.metric-bar-fill--after {
  position: relative;
  overflow: hidden;
}

/* ─── Quote block ─── */
.case-quote {
  position: relative;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.06), rgba(232, 160, 191, 0.04));
  border-left: 3px solid var(--color-primary);
  border-radius: 12px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.case-quote-mark {
  position: absolute;
  top: 12px;
  right: 14px;
  color: rgba(139, 126, 200, 0.25);
}

.case-quote blockquote {
  margin: 0;
}

.case-quote p {
  margin: 0;
  font-size: 1.0625rem;
  line-height: 1.55;
  color: var(--color-text-primary);
  font-style: italic;
  font-family: var(--font-accent);
  letter-spacing: -0.005em;
  text-wrap: pretty;
}

.case-quote-caption {
  display: flex;
  align-items: center;
  gap: 10px;
}

.case-quote-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow:
    0 0 0 2px white,
    0 0 0 3px rgba(139, 126, 200, 0.12),
    0 2px 6px rgba(75, 50, 130, 0.10);
}

.case-quote-author {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.case-quote-name {
  font-family: var(--font-display);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.case-quote-role {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

/* ─── UI strip (modules used) ─── */
.case-ui-strip {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px dashed rgba(139, 126, 200, 0.18);
}

.ui-strip-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-text-muted);
}

.ui-strip-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ui-strip-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: var(--radius-full);
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.16);
  font-family: var(--font-display);
  font-size: 0.74rem;
  font-weight: 500;
  letter-spacing: var(--tracking-snug);
  color: var(--color-text-secondary);
}

.ui-strip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 4px currentColor;
}

/* ════════════════════════════════════════════════
   Aggregate footer — 4 portfolio stats
   ════════════════════════════════════════════════ */
.cases-aggregate {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-top: 36px;
  padding: 22px 24px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-xl);
  max-width: 1120px;
  margin-inline: auto;
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.10);
}

.cases-aggregate-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary);
}

.cases-aggregate-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  width: 100%;
}

.agg-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 12px;
  background: rgba(248, 246, 252, 0.5);
  border-radius: 12px;
  text-align: center;
}

.agg-val {
  font-size: 1.8rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
}

.agg-label {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* ─── Responsive ─── */
@media (max-width: 720px) {
  .case-inner,
  .case--featured .case-inner {
    padding: 22px 20px;
  }
  .case-head {
    grid-template-columns: 48px 1fr;
  }
  .case-verified {
    grid-column: 2;
    margin-top: 4px;
    justify-self: flex-start;
  }
  .case-meta {
    font-size: 0.72rem;
  }
  .metric-row {
    grid-template-columns: 60px 1fr 70px;
    gap: 10px;
  }
  .metric-side-val--after {
    font-size: 1.1rem;
  }
  .cases-aggregate-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .agg-val {
    font-size: 1.4rem;
  }
  /* Phase 5.3: reduce blooms blur + size on mobile */
  .case-bloom {
    filter: blur(40px);
    transform: scale(0.6);
  }
}

@media (max-width: 480px) {
  .case-bloom-3 { display: none; }
  .case-inner {
    padding: 20px 16px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .metric-bar-fill,
  .metric-bar-fill--after::after {
    transition: none !important;
    animation: none !important;
  }
}
</style>
