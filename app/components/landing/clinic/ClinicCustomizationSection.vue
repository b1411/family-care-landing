<template>
  <LandingUiSectionWrapper
    id="white-label"
    badge="Под вашим брендом"
    title="Ваш бренд. Ваше приложение."
    subtitle="Семья видит приложение вашей клиники — с вашим логотипом, вашими цветами, вашим доменом. О платформе за кулисами они не узнают никогда."
    alternate
  >
    <div class="wl-layout" data-reveal="fade-up">
      <div class="wl-visual">
        <LandingSvgWhiteLabelDemo />
      </div>
      <div class="wl-info">
        <p class="wl-desc">Бренды переключаются каждые 3 секунды — наведите чтобы остановить.</p>
        <ul class="wl-bullets">
          <li>Ваш логотип и цвета</li>
          <li>Ваш домен (app.yourClinic.kz)</li>
          <li>Ваши маршруты и протоколы</li>
          <li>Ваши шаблоны уведомлений</li>
        </ul>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<style scoped>
.wl-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 48px;
  align-items: center;
  max-width: var(--content-medium);
  margin: 0 auto;
}

.wl-visual {
  display: flex;
  justify-content: center;
}

.wl-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 16px;
  line-height: 1.6;
}

.wl-bullets {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wl-bullets li {
  position: relative;
  padding-left: 20px;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.wl-bullets li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
}

@media (max-width: 768px) {
  .wl-layout {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .wl-bullets li { text-align: left; }
}
</style>
