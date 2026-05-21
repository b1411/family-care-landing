<template>
  <section class="chief-track section-ink">
    <!-- Phase 2: ambient orbs for depth on ink background -->
    <div class="track-orbs" aria-hidden="true">
      <div class="track-orb track-orb-1" />
      <div class="track-orb track-orb-2" />
    </div>

    <div class="landing-container">
      <div class="track-grid">
        <div class="track-text">
          <span class="overtitle t-eyebrow" data-reveal="fade-up">Для главврача</span>
          <h2 class="track-title t-display-section" data-reveal="fade-up" data-reveal-delay="50">
            Собственник видит выручку.<br />
            Главный врач должен видеть <span class="t-accent-serif accent">качество</span>.
          </h2>
          <p class="track-body t-lead" data-reveal="fade-up" data-reveal-delay="100">
            Отдельный кабинет главного врача — не дашборд про деньги,
            а дашборд про медицинскую практику: аудит назначений,
            отклонения от клинических протоколов, разборы случаев,
            снижение медико-юридических рисков. Без этой поверхности
            главный врач не защитит сделку с собственником через три месяца.
          </p>

          <ul class="track-points" data-stagger="fade-up">
            <li>
              <Icon name="lucide:pill" size="14" />
              <span>Аудит каждого назначения: МНН, доза, показание, полипрагмазия</span>
            </li>
            <li>
              <Icon name="lucide:book-marked" size="14" />
              <span>Библиотека протоколов и отклонения от них в реальном времени</span>
            </li>
            <li>
              <Icon name="lucide:file-search" size="14" />
              <span>Пакет документов на разбор случая — одним кликом</span>
            </li>
            <li>
              <Icon name="lucide:shield-alert" size="14" />
              <span>Medical Advisory Board и квитанции врачей об ознакомлении</span>
            </li>
          </ul>

          <div class="track-actions">
            <NuxtLink to="/for-chief-doctors" class="cta-primary font-heading">
              Подробнее для главного врача
              <Icon name="lucide:arrow-right" size="16" />
            </NuxtLink>
            <NuxtLink to="/demo" class="cta-secondary font-heading">
              Запустить демо главного врача
            </NuxtLink>
          </div>
        </div>

        <div class="track-visual" data-reveal="fade-up" data-reveal-delay="150">
          <div class="dash-card">
            <!-- Header -->
            <div class="dash-head">
              <div class="dash-head-left">
                <span class="dash-title">Командный центр главврача</span>
                <span class="dash-sub">обновляется в реальном времени</span>
              </div>
              <div class="dash-head-right">
                <span class="dash-chip dash-chip--live">
                  <span class="dash-chip-dot" />
                  LIVE
                </span>
                <span class="dash-chip">30 дней</span>
              </div>
            </div>

            <!-- Hero panel: big quality score + trend chart -->
            <div class="dash-hero">
              <!-- Score ring -->
              <div class="dash-score">
                <svg viewBox="0 0 120 120" class="dash-score-svg">
                  <defs>
                    <linearGradient id="chiefScoreGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stop-color="#5BC0BE" />
                      <stop offset="100%" stop-color="#8B7EC8" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="9" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#chiefScoreGrad)" stroke-width="9"
                    stroke-linecap="round"
                    transform="rotate(-90 60 60)"
                    stroke-dasharray="314"
                    stroke-dashoffset="38"
                  />
                </svg>
                <div class="dash-score-center">
                  <span class="dash-score-num">88</span>
                  <span class="dash-score-unit">/100</span>
                </div>
              </div>

              <!-- Trend chart -->
              <div class="dash-trend">
                <div class="dash-trend-head">
                  <div>
                    <span class="dash-trend-lbl">Качество практики</span>
                    <span class="dash-trend-meta">
                      <Icon name="lucide:trending-up" size="11" />
                      +6 баллов за квартал
                    </span>
                  </div>
                  <div class="dash-trend-legend">
                    <span class="legend-item">
                      <span class="legend-dot legend-dot--main" />
                      Индекс
                    </span>
                    <span class="legend-item">
                      <span class="legend-dot legend-dot--baseline" />
                      Бенчмарк
                    </span>
                  </div>
                </div>
                <svg viewBox="0 0 320 90" preserveAspectRatio="none" class="dash-trend-svg">
                  <defs>
                    <linearGradient id="chiefTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#5BC0BE" stop-opacity="0.32" />
                      <stop offset="100%" stop-color="#5BC0BE" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <!-- Grid lines -->
                  <g class="trend-grid">
                    <line v-for="g in 4" :key="g" :x1="0" :x2="320" :y1="g * 18" :y2="g * 18" />
                  </g>
                  <!-- Baseline (industry avg) -->
                  <path
                    d="M 0,52 L 40,52 L 80,52 L 120,52 L 160,52 L 200,52 L 240,52 L 280,52 L 320,52"
                    fill="none"
                    stroke="rgba(255,255,255,0.20)"
                    stroke-width="1.4"
                    stroke-dasharray="3 5"
                  />
                  <!-- Main line area fill -->
                  <path
                    d="M 0,66 L 40,62 L 80,55 L 120,48 L 160,40 L 200,38 L 240,30 L 280,26 L 320,22 L 320,90 L 0,90 Z"
                    fill="url(#chiefTrendFill)"
                  />
                  <!-- Main line -->
                  <path
                    d="M 0,66 L 40,62 L 80,55 L 120,48 L 160,40 L 200,38 L 240,30 L 280,26 L 320,22"
                    fill="none"
                    stroke="#5BC0BE"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <!-- End dot -->
                  <circle cx="320" cy="22" r="3.5" fill="#5BC0BE" />
                  <circle cx="320" cy="22" r="8" fill="#5BC0BE" opacity="0.20" />
                </svg>
              </div>
            </div>

            <!-- 4 KPI breakdown -->
            <div class="dash-grid">
              <div class="dash-kpi">
                <div class="kpi-head">
                  <span class="kpi-lbl">Приёмы с МКБ-10</span>
                  <Icon name="lucide:check-circle-2" size="11" class="kpi-icon-good" />
                </div>
                <span class="kpi-val good">87<sup>%</sup></span>
                <div class="kpi-bar"><span class="kpi-bar-fill kpi-bar-fill--good" style="width: 87%;" /></div>
              </div>
              <div class="dash-kpi">
                <div class="kpi-head">
                  <span class="kpi-lbl">Отклонения от&nbsp;протокола</span>
                  <Icon name="lucide:alert-triangle" size="11" class="kpi-icon-warn" />
                </div>
                <span class="kpi-val warn">12</span>
                <div class="kpi-bar"><span class="kpi-bar-fill kpi-bar-fill--warn" style="width: 38%;" /></div>
              </div>
              <div class="dash-kpi">
                <div class="kpi-head">
                  <span class="kpi-lbl">Rx без МНН</span>
                  <Icon name="lucide:flag" size="11" class="kpi-icon-low" />
                </div>
                <span class="kpi-val low">5</span>
                <div class="kpi-bar"><span class="kpi-bar-fill kpi-bar-fill--low" style="width: 14%;" /></div>
              </div>
              <div class="dash-kpi">
                <div class="kpi-head">
                  <span class="kpi-lbl">На ревью</span>
                  <Icon name="lucide:file-search" size="11" class="kpi-icon-muted" />
                </div>
                <span class="kpi-val muted">3</span>
                <div class="kpi-bar"><span class="kpi-bar-fill kpi-bar-fill--muted" style="width: 8%;" /></div>
              </div>
            </div>

            <!-- Alerts -->
            <div class="dash-alerts">
              <div class="dash-alerts-head">
                <span class="dash-alerts-title">Требуют разбора</span>
                <span class="dash-alerts-count font-mono">3 кейса</span>
              </div>
              <div class="dash-row">
                <span class="row-avatar" style="background: linear-gradient(135deg, #E0A370, #D4727C);">ЖА</span>
                <div class="row-body">
                  <span class="row-kind">Полипрагмазия</span>
                  <span class="row-who">Жакишева А. · 6 активных назначений</span>
                </div>
                <span class="row-action">→ разбор</span>
              </div>
              <div class="dash-row">
                <span class="row-avatar" style="background: linear-gradient(135deg, #D4727C, #B82B36);">СМ</span>
                <div class="row-body">
                  <span class="row-kind">Без диагноза</span>
                  <span class="row-who">Султанов М. · 2 приёма подряд</span>
                </div>
                <span class="row-action">→ разбор</span>
              </div>
              <div class="dash-row">
                <span class="row-avatar" style="background: linear-gradient(135deg, #8B7EC8, #6E5FB3);">КН</span>
                <div class="row-body">
                  <span class="row-kind">Отклонение протокола</span>
                  <span class="row-who">Касымова Н. · скрининг I триместра</span>
                </div>
                <span class="row-action">→ разбор</span>
              </div>
            </div>

            <!-- Footer status strip -->
            <div class="dash-foot">
              <div class="dash-foot-item">
                <Icon name="lucide:shield-check" size="11" />
                <span>RLS активен</span>
              </div>
              <div class="dash-foot-item">
                <Icon name="lucide:scroll-text" size="11" />
                <span>Audit log: 3 года</span>
              </div>
              <div class="dash-foot-item dash-foot-item--mint">
                <Icon name="lucide:check-circle-2" size="11" />
                <span class="font-mono">MAB-2026-04 ознакомлены 14/14</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chief-track {
  /* Phase 2: ink section — heights expanded for premium command-centre feel */
  padding: 120px 0;
}

/* Phase 2: ambient orbs floating in the ink — soft lavender + rose bloom */
.track-orbs {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.track-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(72px);
  opacity: 0.55;
  will-change: transform;
}

.track-orb-1 {
  width: 520px;
  height: 520px;
  top: -120px;
  right: -160px;
  background: radial-gradient(circle, #8B7EC8 0%, transparent 70%);
  animation: orb-drift-a 22s ease-in-out infinite;
}

.track-orb-2 {
  width: 380px;
  height: 380px;
  bottom: -100px;
  left: -120px;
  background: radial-gradient(circle, #E8A0BF 0%, transparent 70%);
  animation: orb-drift-b 26s ease-in-out infinite;
}

@keyframes orb-drift-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 20px) scale(1.06); }
}

@keyframes orb-drift-b {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -20px) scale(1.08); }
}

.track-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: 72px;
  align-items: center;
}

.overtitle {
  display: inline-block;
  margin-bottom: 20px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--color-secondary);
}

.track-title {
  margin: 0 0 24px;
  /* Color handled by .section-ink scoped rule in landing.css */
}

.accent {
  /* Inside ink, accent serif gets soft rose glow — defined in landing.css.
     Keep .accent for backwards compat. */
}

.track-body {
  margin: 0 0 32px;
  max-width: 52ch;
}

.track-points {
  list-style: none;
  margin: 0 0 36px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.track-points li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  font-size: 0.95rem;
  color: var(--color-ink-text-primary);
  line-height: 1.5;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: background 0.25s ease, border-color 0.25s ease;
}
.track-points li:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}
.track-points li :deep(svg) {
  margin-top: 3px;
  color: var(--color-mint);
  flex-shrink: 0;
  filter: drop-shadow(0 0 6px rgba(91, 192, 190, 0.4));
}

.track-actions { display: flex; gap: 14px; flex-wrap: wrap; }
.cta-primary, .cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 24px;
  border-radius: 14px;
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.cta-primary {
  background: var(--gradient-cta);
  color: white;
  box-shadow: var(--shadow-glow-primary);
}
.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 48px -4px rgba(139, 126, 200, 0.55);
}
.cta-secondary {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-ink-text-primary);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
}
.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.28);
}

/* ============================================
   Visual — premium dashboard card on ink
   ============================================ */
.track-visual {
  position: relative;
}

.dash-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 24px;
  padding: 28px 30px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 24px 60px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(139, 126, 200, 0.16);
  position: relative;
  overflow: hidden;
}

/* Subtle inner glow */
.dash-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top, rgba(139, 126, 200, 0.10), transparent 60%);
  pointer-events: none;
}

.dash-card > * {
  position: relative;
  z-index: 1;
}

.dash-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 22px;
  gap: 12px;
  flex-wrap: wrap;
}

.dash-head-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dash-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.0625rem;
  letter-spacing: var(--tracking-snug);
  color: var(--color-ink-text-primary);
}

.dash-sub {
  font-size: 0.72rem;
  color: var(--color-ink-text-muted);
}

.dash-head-right {
  display: flex;
  gap: 6px;
  align-items: center;
}

.dash-chip {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-ink-text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.10);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
}

.dash-chip--live {
  background: rgba(212, 114, 124, 0.14);
  border-color: rgba(212, 114, 124, 0.30);
  color: #E89AA1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.dash-chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #D4727C;
  box-shadow: 0 0 0 0 rgba(212, 114, 124, 0.5);
  animation: chief-live-pulse 1.6s ease-in-out infinite;
}

@keyframes chief-live-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212, 114, 124, 0.5); }
  50% { box-shadow: 0 0 0 6px rgba(212, 114, 124, 0); }
}

/* ───── Hero panel: score + trend ───── */
.dash-hero {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 20px;
  align-items: center;
  margin-bottom: 22px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

.dash-score {
  position: relative;
  width: 120px;
  height: 120px;
}

.dash-score-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 16px rgba(91, 192, 190, 0.30));
}

.dash-score-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
}

.dash-score-num {
  font-family: var(--font-mono);
  font-size: 1.8rem;
  font-weight: 500;
  letter-spacing: -0.04em;
  color: var(--color-ink-text-primary);
  line-height: 1;
}

.dash-score-unit {
  font-size: 0.68rem;
  color: var(--color-ink-text-muted);
  letter-spacing: 0.04em;
}

.dash-trend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dash-trend-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.dash-trend-lbl {
  display: block;
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-ink-text-primary);
  letter-spacing: var(--tracking-snug);
}

.dash-trend-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: var(--color-mint);
  margin-top: 2px;
}

.dash-trend-legend {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.62rem;
  color: var(--color-ink-text-muted);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.legend-dot {
  width: 12px;
  height: 2px;
  border-radius: 1px;
}

.legend-dot--main {
  background: #5BC0BE;
  box-shadow: 0 0 4px currentColor;
}

.legend-dot--baseline {
  background: repeating-linear-gradient(90deg, rgba(255,255,255,0.45) 0 3px, transparent 3px 5px);
}

.dash-trend-svg {
  width: 100%;
  height: 70px;
  display: block;
}

.trend-grid line {
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 1;
}

/* ───── KPI grid ───── */
.dash-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 22px;
}

.dash-kpi {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background 0.25s ease, border-color 0.25s ease;
}

.dash-kpi:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.kpi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.kpi-lbl {
  font-size: 0.68rem;
  color: var(--color-ink-text-muted);
  font-weight: 500;
  line-height: 1.3;
}

.kpi-icon-good { color: #5BC0BE; filter: drop-shadow(0 0 4px currentColor); }
.kpi-icon-warn { color: #E0A370; }
.kpi-icon-low { color: var(--color-secondary); }
.kpi-icon-muted { color: var(--color-ink-text-muted); }

.kpi-val {
  font-family: var(--font-mono);
  font-size: 1.35rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums lining-nums;
  letter-spacing: -0.03em;
  line-height: 1;
}

.kpi-val sup {
  font-size: 0.5em;
  vertical-align: super;
}

.kpi-val.good { color: #5BC0BE; }
.kpi-val.warn { color: #E0A370; }
.kpi-val.low { color: var(--color-secondary); }
.kpi-val.muted { color: var(--color-ink-text-muted); }

.kpi-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.kpi-bar-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
}

.kpi-bar-fill--good { background: linear-gradient(90deg, #5BC0BE, #3FA5A3); }
.kpi-bar-fill--warn { background: linear-gradient(90deg, #F2C4A0, #E0A370); }
.kpi-bar-fill--low { background: linear-gradient(90deg, #E8A0BF, #D47EA5); }
.kpi-bar-fill--muted { background: rgba(255, 255, 255, 0.20); }

/* ───── Alerts list ───── */
.dash-alerts {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 18px;
}

.dash-alerts-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.dash-alerts-title {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-ink-text-muted);
}

.dash-alerts-count {
  font-size: 0.7rem;
  color: #E0A370;
  background: rgba(224, 163, 112, 0.12);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(224, 163, 112, 0.24);
  letter-spacing: 0;
}

.dash-row {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.85rem;
  transition: background 0.2s ease;
  border-radius: 8px;
}

.dash-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.dash-row:first-of-type {
  border-top: none;
  padding-top: 8px;
}

.row-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: var(--font-display);
  font-size: 0.66rem;
  font-weight: 600;
  flex-shrink: 0;
}

.row-body {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}

.row-kind {
  color: #E0A370;
  font-weight: 600;
  font-family: var(--font-display);
  font-size: 0.78rem;
  letter-spacing: var(--tracking-snug);
}

.row-who {
  color: var(--color-ink-text-secondary);
  font-size: 0.72rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-action {
  color: #5BC0BE;
  font-weight: 500;
  font-family: var(--font-display);
  font-size: 0.72rem;
  transition: color 0.2s, transform 0.2s;
  cursor: pointer;
  white-space: nowrap;
}

.dash-row:hover .row-action {
  color: white;
  transform: translateX(2px);
}

/* ───── Footer status strip ───── */
.dash-foot {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.dash-foot-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  color: var(--color-ink-text-muted);
}

.dash-foot-item :deep(svg) {
  color: var(--color-mint);
  opacity: 0.7;
}

.dash-foot-item--mint {
  color: var(--color-mint);
  font-weight: 500;
  margin-left: auto;
}

.dash-foot-item--mint :deep(svg) {
  opacity: 1;
  filter: drop-shadow(0 0 4px currentColor);
}

@media (max-width: 1100px) {
  .dash-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .chief-track { padding: 80px 0; }
  .track-grid { grid-template-columns: 1fr; gap: 44px; }
  .track-orb-1 { width: 320px; height: 320px; }
  .track-orb-2 { width: 240px; height: 240px; }
  .dash-hero { grid-template-columns: 100px 1fr; gap: 14px; }
  .dash-score { width: 100px; height: 100px; }
  .dash-score-num { font-size: 1.5rem; }
}

@media (max-width: 600px) {
  .dash-card { padding: 22px 18px; }
  .dash-hero { grid-template-columns: 1fr; }
  .dash-score { width: 110px; height: 110px; margin: 0 auto; }
  .dash-foot { font-size: 0.66rem; }
  .dash-foot-item--mint { margin-left: 0; }
  /* Phase 5.2: improve readability of KPIs on mobile */
  .kpi-val { font-size: clamp(20px, 5.5vw, 26px); }
  .kpi-label { font-size: 0.7rem; }
}

@media (max-width: 380px) {
  .dash-grid { grid-template-columns: 1fr; gap: 10px; }
}
</style>
