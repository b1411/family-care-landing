<template>
  <div class="legal-page landing-container">
    <NuxtLink to="/" class="back-link">
      <Icon name="lucide:arrow-left" size="16" />
      На главную
    </NuxtLink>

    <h1 class="legal-title font-display">Безопасность данных</h1>
    <p class="legal-updated">
      UMAI Health работает с данными пациентов. Ниже — технические и организационные меры защиты.
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
          <strong>Row Level Security</strong>: врач одной клиники физически не может запросить
          данные другой клиники, даже если попробует.
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
.legal-page {
  padding: 140px 0 80px;
  max-width: 760px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  margin-bottom: 24px;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-primary);
}

.legal-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: var(--lh-h1);
}

.legal-updated {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0 0 40px;
  max-width: 640px;
  line-height: 1.6;
}

.legal-content section {
  margin-bottom: 36px;
}

.legal-content h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 12px;
  line-height: var(--lh-h3);
  color: var(--color-text-primary);
}

.legal-content p {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
  max-width: 68ch;
}

.legal-content strong {
  color: var(--color-text-primary);
  font-weight: 600;
}

.controls-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-top: 12px;
}

.controls-table th,
.controls-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
  font-size: 15px;
  line-height: 1.55;
}

.controls-table tbody tr:last-child td {
  border-bottom: 0;
}

.controls-table th {
  background: var(--color-bg-alt);
  font-weight: 600;
  color: var(--color-text-primary);
}

.controls-table td {
  color: var(--color-text-secondary);
}

details {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  margin-bottom: 10px;
  background: var(--color-surface);
}

details summary {
  font-weight: 600;
  cursor: pointer;
  color: var(--color-text-primary);
  font-size: 15px;
  list-style: none;
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
}

.legal-content a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .legal-page { padding: 100px 16px 60px; }
  .legal-title { font-size: 1.75rem; }
  .legal-content h2 { font-size: 1.1rem; }
  .legal-content p,
  .legal-content li,
  .controls-table td,
  .controls-table th { font-size: 14.5px; }
}
</style>
