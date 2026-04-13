<template>
  <LandingUiSectionWrapper
    id="clinic-pilot"
    badge="Программа пилотного запуска"
    title="Ищем 3–5 клиник-партнёров"
    subtitle="Мы на стадии первого запуска и ищем клиники, готовые попробовать платформу вместе с нами."
    alternate
  >
    <div class="pilot-layout" data-stagger="fade-up">
      <div class="pilot-card landing-card" data-tilt>
        <div class="pilot-icon">
          <Icon name="lucide:settings" size="24" />
        </div>
        <h3 class="pilot-title font-heading">Настройка под вас</h3>
        <p class="pilot-desc">Настроим платформу под ваши маршруты и протоколы. Брендирование под вашу клинику.</p>
      </div>
      <div class="pilot-card landing-card" data-tilt>
        <div class="pilot-icon">
          <Icon name="lucide:users" size="24" />
        </div>
        <h3 class="pilot-title font-heading">30–50 семей</h3>
        <p class="pilot-desc">Запуск на ограниченной группе семей — достаточно для оценки эффекта, безопасно для клиники.</p>
      </div>
      <div class="pilot-card landing-card" data-tilt>
        <div class="pilot-icon">
          <Icon name="lucide:bar-chart-3" size="24" />
        </div>
        <h3 class="pilot-title font-heading">3 месяца пилот</h3>
        <p class="pilot-desc">Совместный анализ результатов. Вы получаете платформу — мы получаем обратную связь.</p>
      </div>
    </div>

    <div class="pilot-cta" data-reveal="fade-up">
      <p class="pilot-cta-text">Подробности — по запросу. Оставьте заявку, и мы подготовим персональное предложение для вашей клиники.</p>
      <a href="#clinic-cta" class="pilot-cta-btn font-heading">
        Обсудить подключение
        <Icon name="lucide:arrow-right" size="16" />
      </a>
    </div>
  </LandingUiSectionWrapper>
</template>

<style scoped>
.pilot-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: var(--content-medium);
  margin: 0 auto 40px;
}

.pilot-card {
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.pilot-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.pilot-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.pilot-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}

.pilot-cta {
  text-align: center;
}

.pilot-cta-text {
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 560px;
  margin: 0 auto 24px;
}

.pilot-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: var(--radius-full);
  background: var(--gradient-cta);
  color: white;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.pilot-cta-btn:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .pilot-layout {
    grid-template-columns: 1fr;
  }
}
</style>
