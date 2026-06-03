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
        <Icon name="lucide:shield-check" size="12" />
        Безопасность и compliance
      </div>

      <h1 class="legal-title t-display-section">
        Безопасность <span class="t-accent-serif-gradient">данных</span>
      </h1>
      <p class="legal-lead">
        UMAI Health работает с&nbsp;данными пациентов. Ниже — технические и&nbsp;организационные меры защиты.
      </p>

      <div class="legal-content prose-readable">
      <section>
        <h2>Шифрование</h2>
        <p>
          Данные шифруются <strong>AES-256</strong> в состоянии покоя (at rest) и передаются по <strong>TLS&nbsp;1.3</strong>
          (in transit). Сертификаты обновляются автоматически; HSTS включён для всего домена.
        </p>
      </section>

      <section>
        <h2>Изоляция клиник</h2>
        <p>
          Каждая клиника — изолированный арендатор. На уровне СУБД PostgreSQL включён
          <strong>Row Level Security</strong>: врач одной клиники не может запросить
          данные другой — изоляция действует и при прямых обращениях к базе.
        </p>
      </section>

      <section>
        <h2>Резервные копии</h2>
        <p>
          Ежедневные автоматические бэкапы базы данных и хранилища документов. Текущий retention — 30&nbsp;дней
          (уточняется по&nbsp;запросу клиники в&nbsp;договоре).
        </p>
      </section>

      <section>
        <h2>Журнал аудита</h2>
        <p>
          Каждый доступ к&nbsp;персональным данным пациента записывается: кто, когда, к&nbsp;какому разделу карты.
          Журнал недоступен для удаления даже администратору клиники.
        </p>
      </section>

      <section>
        <h2>Соответствие законодательству</h2>
        <p>
          Платформа построена в&nbsp;соответствии с&nbsp;Законом Республики Казахстан
          <strong>«О персональных данных и&nbsp;их&nbsp;защите»</strong> (№&nbsp;94-V от&nbsp;21&nbsp;мая 2013&nbsp;года).
          Обработка данных пациентов ведётся на&nbsp;основании их&nbsp;согласия (или согласия родителя — для&nbsp;детей).
        </p>
      </section>

      <section>
        <h2>Локализация данных</h2>
        <p>
          По&nbsp;умолчанию данные клиентов хранятся на&nbsp;серверах в&nbsp;ЕС. Для&nbsp;клиник, которым требуется
          хранение данных на&nbsp;территории Казахстана, доступен вариант развёртывания на&nbsp;локальных серверах РК —
          обсуждается на&nbsp;этапе договора.
        </p>
      </section>

      <section>
        <h2>Технические контроли</h2>
        <table class="controls-table">
          <thead>
            <tr>
              <th>Контроль</th>
              <th>Реализация</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Аутентификация</td>
              <td>Supabase Auth + magic links / SMS (2FA опционально)</td>
            </tr>
            <tr>
              <td>Управление ролями</td>
              <td>RBAC: мама, папа, координатор, врач, руководитель</td>
            </tr>
            <tr>
              <td>Пароли и&nbsp;токены</td>
              <td>Bcrypt-хеширование; ротация refresh-токенов</td>
            </tr>
            <tr>
              <td>DDoS / брут-форс</td>
              <td>Rate-limiting на&nbsp;API; WAF на&nbsp;уровне CDN</td>
            </tr>
            <tr>
              <td>Уязвимости</td>
              <td>Еженедельный scan зависимостей; patch-релизы в&nbsp;течение&nbsp;72&nbsp;часов</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Частые вопросы</h2>
        <details>
          <summary>Передаются ли данные третьим лицам?</summary>
          <p>
            Нет, кроме случаев, предусмотренных законом. Данные пациента принадлежат клинике; UMAI&nbsp;Health —
            оператор обработки. Мы&nbsp;не&nbsp;продаём данные и&nbsp;не&nbsp;используем их&nbsp;для&nbsp;рекламы.
          </p>
        </details>
        <details>
          <summary>Что происходит при разрыве договора с клиникой?</summary>
          <p>
            Данные пациентов передаются клинике в&nbsp;экспорте (CSV&nbsp;+&nbsp;PDF документы) и&nbsp;удаляются
            с&nbsp;наших серверов в&nbsp;течение 30&nbsp;дней.
          </p>
        </details>
        <details>
          <summary>Как мама может удалить свои данные?</summary>
          <p>
            Через кабинет: «Настройки → Удалить аккаунт». Удаление — безвозвратное; данные анонимизируются
            в&nbsp;медицинской истории клиники согласно требованиям хранения медкарт.
          </p>
        </details>
      </section>

      <section>
        <h2>Контакт DPO</h2>
        <p>
          По&nbsp;вопросам обработки персональных данных пишите на&nbsp;
          <a href="mailto:security@umai-health.kz">security@umai-health.kz</a>.
          Ответ — в&nbsp;течение 3&nbsp;рабочих дней.
        </p>
      </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Безопасность данных — UMAI Health',
  description: 'AES-256, TLS 1.3, Row Level Security, соответствие Закону РК о персональных данных. Как UMAI Health защищает данные пациентов.',
  ogTitle: 'Безопасность данных — UMAI Health',
  ogDescription: 'Шифрование, изоляция клиник, аудит доступа, локализация в РК. Технические и организационные меры защиты.',
  ogImage: 'https://umai-health.kz/og-image.png',
  ogUrl: 'https://umai-health.kz/security',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://umai-health.kz/security' },
  ],
})
</script>

<style scoped>
.legal-page-wrap {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(91, 192, 190, 0.05), transparent 60%),
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
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(91, 192, 190, 0.4), transparent 70%);
  top: -100px;
  right: -100px;
}

.orb-2 {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.3), transparent 70%);
  bottom: 10%;
  left: -100px;
}

.legal-page {
  position: relative;
  z-index: 1;
  padding: 140px 0 80px;
  max-width: 820px;
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
  background: rgba(91, 192, 190, 0.1);
  border: 1px solid rgba(91, 192, 190, 0.2);
  color: var(--color-mint-dark, #2A8886);
  margin-bottom: 18px;
}

.eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-mint, #5BC0BE);
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

.legal-lead {
  font-size: 16px;
  line-height: 1.65;
  color: var(--color-text-secondary);
  margin: 0 0 48px;
  max-width: 640px;
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
  margin-bottom: 36px;
}

.legal-content section:last-child {
  margin-bottom: 0;
}

.legal-content h2 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0 0 14px;
  line-height: var(--lh-h3);
  color: var(--color-text-primary);
}

.legal-content p {
  font-size: 15.5px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
  max-width: 68ch;
}

.legal-content strong {
  color: var(--color-text-primary);
  font-weight: 700;
}

.controls-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid rgba(139, 126, 200, 0.12);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-top: 14px;
  background: rgba(255, 255, 255, 0.4);
}

.controls-table th,
.controls-table td {
  padding: 13px 18px;
  text-align: left;
  border-bottom: 1px solid rgba(139, 126, 200, 0.08);
  font-size: 14.5px;
  line-height: 1.55;
}

.controls-table tbody tr:last-child td {
  border-bottom: 0;
}

.controls-table th {
  background: rgba(139, 126, 200, 0.06);
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.005em;
}

.controls-table td {
  color: var(--color-text-secondary);
}

details {
  border: 1px solid rgba(139, 126, 200, 0.12);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.22s ease;
}

details:hover {
  border-color: rgba(139, 126, 200, 0.22);
  background: rgba(255, 255, 255, 0.72);
}

details[open] {
  border-color: rgba(139, 126, 200, 0.28);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 18px -8px rgba(139, 126, 200, 0.18);
}

details summary {
  font-weight: 700;
  font-family: var(--font-display);
  cursor: pointer;
  color: var(--color-text-primary);
  font-size: 15px;
  list-style: none;
  letter-spacing: -0.005em;
}

details summary::-webkit-details-marker {
  display: none;
}

details[open] summary {
  margin-bottom: 10px;
}

details p {
  margin: 0;
  font-size: 15px;
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
  .legal-content h2 { font-size: 1.1rem; }
  .legal-content p,
  .controls-table td,
  .controls-table th { font-size: 14px; }
}

@media (max-width: 480px) {
  .legal-page { padding: 90px 12px 48px; }
  .legal-content { padding: 22px 18px; }
}
</style>
