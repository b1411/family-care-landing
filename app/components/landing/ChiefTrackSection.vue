<template>
  <section class="chief-track">
    <LandingUiGradientBlob
      top="50%"
      right="-8%"
      size="460px"
      color="var(--color-accent-warm)"
      :opacity="0.22"
    />

    <div class="landing-container">
      <div class="track-grid">
        <div class="track-text">
          <span class="overtitle font-heading" data-reveal="fade-up">ДЛЯ ГЛАВВРАЧА</span>
          <h2 class="track-title font-display" data-reveal="fade-up" data-reveal-delay="50">
            Собственник видит выручку. <br />
            Главный врач должен видеть <span class="accent">качество.</span>
          </h2>
          <p class="track-body" data-reveal="fade-up" data-reveal-delay="100">
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
            <div class="dash-head">
              <span class="dash-title">Качество клиники</span>
              <span class="dash-chip">30 дней</span>
            </div>
            <div class="dash-grid">
              <div class="dash-kpi">
                <span class="kpi-lbl">Приёмы с МКБ-10</span>
                <span class="kpi-val good">87%</span>
              </div>
              <div class="dash-kpi">
                <span class="kpi-lbl">Отклонений</span>
                <span class="kpi-val warn">12</span>
              </div>
              <div class="dash-kpi">
                <span class="kpi-lbl">Rx без МНН</span>
                <span class="kpi-val low">5</span>
              </div>
              <div class="dash-kpi">
                <span class="kpi-lbl">Кейсы на ревью</span>
                <span class="kpi-val muted">3</span>
              </div>
            </div>
            <div class="dash-row">
              <span class="row-kind">Полипрагмазия</span>
              <span class="row-who">Жакишева А. · 6 активных</span>
              <span class="row-action">→ разбор</span>
            </div>
            <div class="dash-row">
              <span class="row-kind">Без диагноза</span>
              <span class="row-who">Султанов М. · 2 приёма</span>
              <span class="row-action">→ разбор</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chief-track {
  position: relative;
  padding: 100px 0;
  overflow: hidden;
  background: linear-gradient(180deg, transparent, rgba(139, 126, 200, 0.04));
}

.track-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.overtitle {
  display: inline-block;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  margin-bottom: 14px;
}
.track-title {
  font-size: clamp(2rem, 3.5vw, 2.8rem);
  line-height: 1.15;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 16px;
}
.accent {
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.track-body {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0 0 24px;
  max-width: 48ch;
}

.track-points {
  list-style: none;
  margin: 0 0 30px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.track-points li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.95rem;
  color: var(--color-text-primary);
  line-height: 1.5;
}
.track-points li :deep(svg) {
  margin-top: 3px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.track-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.cta-primary, .cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}
.cta-primary {
  background: var(--gradient-cta);
  color: white;
  box-shadow: 0 6px 18px rgba(139, 126, 200, 0.25);
}
.cta-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(139, 126, 200, 0.35); }
.cta-secondary {
  background: white;
  color: var(--color-text-primary);
  border: 1px solid rgba(139, 126, 200, 0.2);
}
.cta-secondary:hover { border-color: var(--color-primary); color: var(--color-primary); }

/* Visual */
.track-visual {
  position: relative;
}
.dash-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(139, 126, 200, 0.14);
  border-radius: 20px;
  padding: 22px 24px;
  box-shadow: 0 24px 60px rgba(139, 126, 200, 0.15);
}
.dash-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.dash-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text-primary);
}
.dash-chip {
  background: rgba(139, 126, 200, 0.1);
  color: var(--color-primary-dark);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 600;
}
.dash-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}
.dash-kpi {
  background: rgba(139, 126, 200, 0.04);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
}
.kpi-lbl { font-size: 0.72rem; color: var(--color-text-muted); }
.kpi-val {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  margin-top: 4px;
}
.kpi-val.good { color: #2d8560; }
.kpi-val.warn { color: #b27100; }
.kpi-val.low { color: #c85a6a; }
.kpi-val.muted { color: var(--color-text-muted); }

.dash-row {
  display: grid;
  grid-template-columns: 1fr 1.3fr auto;
  gap: 10px;
  align-items: center;
  padding: 9px 12px;
  border-top: 1px solid var(--color-border-light);
  font-size: 0.8rem;
}
.dash-row:first-of-type { border-top: none; padding-top: 4px; }
.row-kind { color: #b27100; font-weight: 600; }
.row-who { color: var(--color-text-secondary); }
.row-action { color: var(--color-primary); font-weight: 500; }

@media (max-width: 900px) {
  .chief-track { padding: 70px 0; }
  .track-grid { grid-template-columns: 1fr; gap: 36px; }
  .track-title { font-size: 1.9rem; }
}
</style>
