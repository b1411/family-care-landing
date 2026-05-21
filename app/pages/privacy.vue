<template>
  <div class="legal-page-wrap">
    <!-- Ambient orbs -->
    <div class="legal-orbs" aria-hidden="true">
      <div class="orb orb-1" />
      <div class="orb orb-2" />
    </div>

    <div class="legal-page landing-container">
      <NuxtLink to="/" class="back-link" aria-label="Вернуться на главную">
        <Icon name="lucide:arrow-left" size="14" />
        <span>На главную</span>
      </NuxtLink>

      <div class="legal-eyebrow t-eyebrow">
        <span class="eyebrow-dot" aria-hidden="true" />
        Юридические документы
      </div>

      <h1 class="legal-title t-display-section">
        Политика <span class="t-accent-serif-gradient">конфиденциальности</span>
      </h1>
      <p class="legal-updated">
        <Icon name="lucide:calendar" size="13" />
        Дата обновления: <strong>13 апреля 2026 г.</strong>
      </p>

      <div class="legal-content">
      <section>
        <h2>1. Общие положения</h2>
        <p>
          Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных
          пользователей сайта umai-health.kz (далее — «Сайт»), принадлежащего команде UMAI Health (далее — «Оператор»).
        </p>
        <p>
          Политика разработана в соответствии с Законом Республики Казахстан от 21 мая 2013 года № 94-V
          «О персональных данных и их защите».
        </p>
      </section>

      <section>
        <h2>2. Какие данные мы собираем</h2>
        <p>Через формы на Сайте мы можем собирать следующие данные:</p>
        <ul>
          <li>Имя</li>
          <li>Название организации</li>
          <li>Адрес электронной почты (email)</li>
          <li>Номер телефона или мессенджер</li>
          <li>Текст комментария (при наличии)</li>
        </ul>
        <p>
          В демо-режиме платформы используются исключительно тестовые (фиктивные) данные.
          Реальные персональные данные пользователей в демо-режиме не обрабатываются.
        </p>
      </section>

      <section>
        <h2>3. Цели обработки</h2>
        <p>Персональные данные обрабатываются для следующих целей:</p>
        <ul>
          <li>Обработка заявки на подключение платформы</li>
          <li>Связь с пользователем по вопросам сотрудничества</li>
          <li>Улучшение качества обслуживания</li>
        </ul>
      </section>

      <section>
        <h2>4. Передача данных третьим лицам</h2>
        <p>
          Мы не передаём персональные данные третьим лицам, за исключением случаев,
          предусмотренных законодательством Республики Казахстан.
        </p>
      </section>

      <section>
        <h2>5. Хранение данных</h2>
        <p>
          Данные хранятся на серверах Supabase (облачная инфраструктура).
          Мы применяем организационные и технические меры для защиты данных от несанкционированного доступа.
        </p>
      </section>

      <section>
        <h2>6. Права пользователя</h2>
        <p>Вы имеете право:</p>
        <ul>
          <li>Запросить информацию о ваших персональных данных</li>
          <li>Потребовать их изменения или удаления</li>
          <li>Отозвать согласие на обработку</li>
        </ul>
        <p>Для реализации этих прав направьте запрос на <a href="mailto:info@umai-health.kz">info@umai-health.kz</a>.</p>
      </section>

      <section>
        <h2>7. Файлы cookie</h2>
        <p>
          Сайт может использовать cookie-файлы для обеспечения работы аналитических сервисов.
          Вы можете отключить cookie в настройках браузера.
        </p>
      </section>

      <section>
        <h2>8. Изменения политики</h2>
        <p>
          Оператор вправе вносить изменения в настоящую Политику. Актуальная версия
          всегда доступна по адресу
          <NuxtLink to="/privacy">umai-health.kz/privacy</NuxtLink>.
        </p>
      </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Политика конфиденциальности — UMAI Health',
  description: 'Политика обработки персональных данных сайта UMAI Health.',
})
</script>

<style scoped>
.legal-page-wrap {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 126, 200, 0.05), transparent 60%),
    var(--color-bg);
}

/* Ambient orbs */
.legal-orbs {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.4), transparent 70%);
  top: -100px;
  right: -100px;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(232, 160, 191, 0.3), transparent 70%);
  bottom: 10%;
  left: -80px;
}

.legal-page {
  position: relative;
  z-index: 1;
  padding: 140px 0 80px;
  max-width: 760px;
}

/* Back link */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px 6px 10px;
  border-radius: var(--radius-full);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(139, 126, 200, 0.12);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  text-decoration: none;
  margin-bottom: 24px;
  transition: all 0.22s ease;
}

.back-link:hover {
  color: var(--color-primary);
  border-color: rgba(139, 126, 200, 0.28);
  transform: translateX(-2px);
  box-shadow: 0 4px 14px -4px rgba(139, 126, 200, 0.18);
}

/* Eyebrow */
.legal-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 10px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.08);
  border: 1px solid rgba(139, 126, 200, 0.16);
  color: var(--color-primary);
  margin-bottom: 18px;
}

.eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}

.legal-title {
  margin: 0 0 16px;
  color: var(--color-text-primary);
}

.legal-updated {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 56px;
  padding: 8px 14px 8px 12px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(139, 126, 200, 0.08);
  backdrop-filter: blur(8px);
}

.legal-updated .iconify {
  color: var(--color-primary);
}

.legal-updated strong {
  color: var(--color-text-primary);
  font-weight: 700;
}

/* Content card */
.legal-content {
  padding: 36px 40px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(139, 126, 200, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 16px 40px -22px rgba(139, 126, 200, 0.22);
}

.legal-content section {
  margin-bottom: 32px;
}

.legal-content section:last-child {
  margin-bottom: 0;
}

.legal-content h2 {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0 0 14px;
  color: var(--color-text-primary);
}

.legal-content p {
  font-size: 15px;
  line-height: 1.72;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
}

.legal-content ul {
  padding-left: 22px;
  margin: 0 0 12px;
}

.legal-content li {
  font-size: 15px;
  line-height: 1.72;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.legal-content a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px solid rgba(139, 126, 200, 0.3);
  transition: border-color 0.22s ease;
}

.legal-content a:hover {
  border-color: var(--color-primary);
}

@media (max-width: 768px) {
  .legal-page { padding: 110px 16px 60px; }
  .legal-content { padding: 28px 22px; }
}

@media (max-width: 480px) {
  .legal-page { padding: 90px 12px 48px; }
  .legal-content { padding: 22px 18px; }
  .legal-content h2 { font-size: 1.08rem; }
  .legal-content p, .legal-content li { font-size: 14px; line-height: 1.65; }
}
</style>
