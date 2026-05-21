<template>
  <div class="legal-page-wrap">
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
        Условия <span class="t-accent-serif-gradient">использования</span>
      </h1>
      <p class="legal-updated">
        <Icon name="lucide:calendar" size="13" />
        Дата обновления: <strong>13 апреля 2026 г.</strong>
      </p>

      <div class="legal-content">
      <section>
        <h2>1. Общие положения</h2>
        <p>
          Настоящие Условия регулируют использование сайта umai-health.kz (далее — «Сайт»)
          и демо-режима платформы UMAI Health.
        </p>
        <p>Используя Сайт, вы соглашаетесь с настоящими Условиями.</p>
      </section>

      <section>
        <h2>2. Информационный характер</h2>
        <p>
          Сайт носит информационный характер и предназначен для ознакомления с возможностями
          платформы UMAI Health. Информация на Сайте не является публичной офертой.
        </p>
      </section>

      <section>
        <h2>3. Демо-режим</h2>
        <p>
          Демо-режим платформы предоставляется для ознакомительных целей. Все данные в демо-режиме
          являются тестовыми и не отражают реальных пациентов, семей или медицинских записей.
        </p>
        <p>
          Демо-данные не могут быть использованы для принятия медицинских или иных решений.
        </p>
      </section>

      <section>
        <h2>4. Платформа</h2>
        <p>
          Доступ к полнофункциональной платформе UMAI Health предоставляется клиникам
          на основании отдельного договора. Условия подключения, стоимость и объём услуг
          определяются индивидуально.
        </p>
      </section>

      <section>
        <h2>5. Ограничение ответственности</h2>
        <p>
          Оператор не несёт ответственности за содержание демо-данных, а также за решения,
          принятые на их основании. Платформа не заменяет медицинскую консультацию.
        </p>
      </section>

      <section>
        <h2>6. Интеллектуальная собственность</h2>
        <p>
          Все материалы Сайта (тексты, дизайн, программный код, иллюстрации) являются
          интеллектуальной собственностью команды UMAI Health и защищены законодательством
          Республики Казахстан.
        </p>
      </section>

      <section>
        <h2>7. Изменения условий</h2>
        <p>
          Оператор вправе изменять настоящие Условия. Актуальная версия доступна по адресу
          <NuxtLink to="/terms">umai-health.kz/terms</NuxtLink>.
        </p>
      </section>

      <section>
        <h2>8. Контакты</h2>
        <p>По вопросам, связанным с использованием Сайта: <a href="mailto:info@umai-health.kz">info@umai-health.kz</a></p>
      </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Условия использования — UMAI Health',
  description: 'Условия использования сайта и демо-режима платформы UMAI Health.',
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
  background: radial-gradient(circle, rgba(232, 160, 191, 0.34), transparent 70%);
  top: -100px;
  right: -100px;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.3), transparent 70%);
  bottom: 10%;
  left: -80px;
}

.legal-page {
  position: relative;
  z-index: 1;
  padding: 140px 0 80px;
  max-width: 760px;
}

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
  .legal-content p { font-size: 14px; line-height: 1.65; }
}
</style>
