<template>
  <div class="legal-page landing-container">
    <NuxtLink to="/" class="back-link">
      <Icon name="lucide:arrow-left" size="16" />
      На главную
    </NuxtLink>

    <h1 class="legal-title font-display">Интеграции</h1>
    <p class="legal-updated">
      UMAI&nbsp;Health не&nbsp;заменяет МИС клиники — платформа дополняет её&nbsp;со&nbsp;стороны пациента и&nbsp;координатора.
      Ниже — как мы&nbsp;подключаемся к&nbsp;существующим системам и&nbsp;что уже работает.
    </p>

    <div class="legal-content">
      <section class="integ-grid">
        <div class="integ-card" v-for="block in integrations" :key="block.title">
          <div class="integ-icon" :style="{ background: block.iconBg, color: block.iconColor }">
            <Icon :name="block.icon" size="22" />
          </div>
          <div class="integ-body">
            <div class="integ-head">
              <h2>{{ block.title }}</h2>
              <span class="integ-status" :data-status="block.status">{{ block.statusLabel }}</span>
            </div>
            <p>{{ block.desc }}</p>
            <ul v-if="block.bullets?.length">
              <li v-for="b in block.bullets" :key="b">{{ b }}</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2>Как мы подключаемся к МИС</h2>
        <p>
          Для&nbsp;клиник с&nbsp;существующей МИС у&nbsp;нас два сценария интеграции. Выбор зависит от&nbsp;того,
          какие API предоставляет ваша система и&nbsp;насколько глубокую синхронизацию вы&nbsp;хотите.
        </p>
        <ol class="numbered">
          <li>
            <strong>Read-only синхронизация.</strong> UMAI читает расписание врача и&nbsp;список записанных пациентов
            из&nbsp;МИС (по&nbsp;REST или HL7/FHIR). Координатор видит занятые слоты и&nbsp;не&nbsp;создаёт двойные записи.
          </li>
          <li>
            <strong>Двусторонняя интеграция.</strong> UMAI отправляет запись, назначение, результат анализа обратно
            в&nbsp;МИС. Координатор работает в&nbsp;одном окне — UMAI, а&nbsp;МИС получает нужные поля автоматически.
          </li>
        </ol>
        <p class="note">
          Для МИС без&nbsp;публичного API мы&nbsp;подключаемся через экспорт (CSV/Excel) или напрямую к&nbsp;базе данных
          по&nbsp;согласованию с&nbsp;ИТ-отделом клиники.
        </p>
      </section>

      <section>
        <h2>Поддерживаемые системы</h2>
        <p>
          Список обновляется по&nbsp;мере запуска пилотов. Если вашей МИС нет в&nbsp;списке — напишите,
          оценим совместимость.
        </p>
        <p class="note">
          Активные интеграции будут указаны здесь по&nbsp;мере запуска пилотов в&nbsp;партнёрских клиниках.
        </p>
      </section>

      <section>
        <h2>Нужна другая интеграция?</h2>
        <p>
          Напишите на&nbsp;<a href="mailto:integrations@umai-health.kz">integrations@umai-health.kz</a>
          или через форму «Обсудить подключение». Опишем процесс, сроки и&nbsp;требования.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Интеграции — UMAI Health',
  description: 'Как UMAI Health подключается к МИС клиники, WhatsApp Business, Kaspi Pay, Google Calendar. API, экспорт, совместимость.',
  ogTitle: 'Интеграции — UMAI Health',
  ogDescription: 'МИС, мессенджеры, платёжные системы, календари. Сценарии интеграции и совместимость.',
  ogImage: 'https://umai-health.kz/og-image.png',
  ogUrl: 'https://umai-health.kz/integrations',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://umai-health.kz/integrations' },
  ],
})

const integrations = [
  {
    title: 'МИС клиники',
    icon: 'lucide:network',
    iconBg: 'var(--color-primary-light)',
    iconColor: 'var(--color-primary)',
    status: 'available',
    statusLabel: 'По запросу',
    desc: 'Двусторонняя интеграция через REST или HL7/FHIR: расписание, пациенты, назначения, результаты анализов.',
    bullets: [
      'REST API с OpenAPI-спецификацией',
      'HL7 v2 / FHIR R4 для обмена клиническими данными',
      'Экспорт-импорт CSV/Excel для систем без API',
    ],
  },
  {
    title: 'WhatsApp Business API',
    icon: 'lucide:message-circle',
    iconBg: 'rgba(37, 211, 102, 0.1)',
    iconColor: '#25D366',
    status: 'roadmap',
    statusLabel: 'В roadmap',
    desc: 'Push-напоминания семье через WhatsApp — привычный канал коммуникации в РК.',
    bullets: [
      'Напоминания о визитах, прививках, приёме витаминов',
      'Подтверждение приёма одним кликом',
      'Шаблоны сообщений, одобренные Meta',
    ],
  },
  {
    title: 'Kaspi Pay',
    icon: 'lucide:credit-card',
    iconBg: 'rgba(237, 27, 36, 0.08)',
    iconColor: '#ED1B24',
    status: 'roadmap',
    statusLabel: 'В roadmap',
    desc: 'Оплата услуг клиники прямо из приложения семьи — Kaspi как основной платёжный канал в Казахстане.',
    bullets: [
      'QR-оплата для разовых визитов',
      'Kaspi Red для рассрочки программ наблюдения',
      'Фискальный чек автоматически',
    ],
  },
  {
    title: 'Google Calendar / iCal',
    icon: 'lucide:calendar',
    iconBg: 'var(--color-accent-blue-light)',
    iconColor: 'var(--color-accent-blue)',
    status: 'available',
    statusLabel: 'Готово',
    desc: 'Семья подписывается на свой маршрут — все визиты и прививки в календаре телефона.',
    bullets: [
      'Подписка по iCal URL',
      'Автообновление при изменении расписания',
      'Напоминания средствами самого календаря',
    ],
  },
  {
    title: 'Экспорт отчётов',
    icon: 'lucide:download',
    iconBg: 'rgba(232, 160, 191, 0.12)',
    iconColor: 'var(--color-secondary-dark)',
    status: 'available',
    statusLabel: 'Готово',
    desc: 'Отчёты для руководителя и для аккредитации — в читаемых форматах.',
    bullets: [
      'CSV — для аналитики в Excel/Google Sheets',
      'XLSX с форматированием — для презентаций',
      'PDF для официальных документов',
    ],
  },
  {
    title: 'Single Sign-On',
    icon: 'lucide:key-round',
    iconBg: 'var(--color-bg-alt)',
    iconColor: 'var(--color-text-secondary)',
    status: 'enterprise',
    statusLabel: 'Enterprise',
    desc: 'Вход в координаторскую панель через корпоративный SSO клиники. Для сетей и крупных клиник.',
    bullets: [
      'SAML 2.0, OIDC',
      'Active Directory / LDAP',
      'Прозрачная синхронизация ролей',
    ],
  },
]
</script>

<style scoped>
.legal-page {
  padding: 140px 0 80px;
  max-width: 900px;
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
  max-width: 680px;
  line-height: 1.6;
}

.legal-content section {
  margin-bottom: 48px;
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

.legal-content .note {
  padding: 12px 16px;
  background: var(--color-bg-alt);
  border-radius: var(--radius-md);
  font-size: 14.5px;
  color: var(--color-text-secondary);
}

.numbered {
  padding-left: 20px;
  margin: 0 0 12px;
  counter-reset: num;
  list-style: none;
}

.numbered li {
  counter-increment: num;
  position: relative;
  margin-bottom: 14px;
  padding-left: 32px;
  font-size: 16px;
  line-height: 1.65;
  color: var(--color-text-secondary);
  max-width: 68ch;
}

.numbered li::before {
  content: counter(num);
  position: absolute;
  left: 0;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.numbered li strong {
  color: var(--color-text-primary);
  font-weight: 600;
}

/* Integration grid */
.integ-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 48px !important;
}

.integ-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.integ-card:hover {
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-card);
}

.integ-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.integ-body {
  flex: 1;
  min-width: 0;
}

.integ-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.integ-head h2 {
  font-size: 1rem !important;
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}

.integ-body p {
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-secondary);
  margin: 0 0 8px;
}

.integ-body ul {
  padding-left: 18px;
  margin: 0;
}

.integ-body li {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}

.integ-status {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.integ-status[data-status="available"] {
  background: rgba(124, 184, 212, 0.16);
  color: #2E6F85;
}

.integ-status[data-status="roadmap"] {
  background: rgba(233, 196, 106, 0.2);
  color: #8F6A0D;
}

.integ-status[data-status="enterprise"] {
  background: var(--color-primary-light);
  color: var(--color-primary);
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
  .integ-grid { grid-template-columns: 1fr; }
}
</style>
