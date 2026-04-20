<template>
  <footer class="footer">
    <div class="landing-container">
      <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="logo-icon">
              <Icon name="lucide:heart-pulse" size="20" />
            </span>
            <span class="logo-text font-display">UMAI Health</span>
          </div>
          <p class="footer-desc">
            Под покровительством Умай — цифровой маршрут заботы от зачатия до 2 лет. Платформа для частных клиник под вашим брендом.
          </p>
        </div>

        <!-- Navigation -->
        <div class="footer-col">
          <h4 class="footer-heading font-heading">Платформа</h4>
          <ul class="footer-list">
            <li><NuxtLink to="/#what-is">О платформе</NuxtLink></li>
            <li><NuxtLink to="/#modules">Модули</NuxtLink></li>
            <li><NuxtLink to="/#how-it-works">Как это работает</NuxtLink></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-heading font-heading">Страницы</h4>
          <ul class="footer-list">
            <li><NuxtLink to="/for-clinics">Для клиник</NuxtLink></li>
            <li><NuxtLink to="/for-families">Для родителей</NuxtLink></li>
            <li><NuxtLink to="/demo">Попробовать демо</NuxtLink></li>
            <li><NuxtLink to="/integrations">Интеграции</NuxtLink></li>
            <li><NuxtLink to="/security">Безопасность</NuxtLink></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="footer-col">
          <h4 class="footer-heading font-heading">Контакты</h4>
          <ul class="footer-list footer-contacts">
            <li>
              <Icon name="lucide:mail" size="16" />
              <a href="mailto:info@umai-health.kz">info@umai-health.kz</a>
            </li>
            <li v-if="contact.phone">
              <Icon name="lucide:phone" size="16" />
              <a :href="`tel:${contact.phone.replace(/\s+/g, '')}`">{{ contact.phone }}</a>
            </li>
            <li v-if="contact.whatsapp">
              <Icon name="lucide:message-circle" size="16" />
              <a :href="contact.whatsapp" target="_blank" rel="noopener">WhatsApp</a>
            </li>
            <li>
              <Icon name="lucide:map-pin" size="16" />
              <span>{{ contact.city }}</span>
            </li>
            <li v-if="contact.address">
              <Icon name="lucide:building-2" size="16" />
              <span>{{ contact.address }}</span>
            </li>
            <li v-if="contact.legal">
              <Icon name="lucide:landmark" size="16" />
              <span>{{ contact.legal }}</span>
            </li>
          </ul>
          <div v-if="contact.linkedin || contact.instagram || contact.telegram" class="footer-social">
            <a v-if="contact.linkedin" :href="contact.linkedin" target="_blank" rel="noopener" aria-label="LinkedIn">
              <Icon name="lucide:linkedin" size="18" />
            </a>
            <a v-if="contact.instagram" :href="contact.instagram" target="_blank" rel="noopener" aria-label="Instagram">
              <Icon name="lucide:instagram" size="18" />
            </a>
            <a v-if="contact.telegram" :href="contact.telegram" target="_blank" rel="noopener" aria-label="Telegram">
              <Icon name="lucide:send" size="18" />
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-copy">
          © {{ currentYear }} UMAI Health. Сделано с заботой в Казахстане.
        </p>
        <div class="footer-legal">
          <NuxtLink to="/privacy">Политика конфиденциальности</NuxtLink>
          <span class="footer-dot">·</span>
          <NuxtLink to="/terms">Условия использования</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()

// Feature-flagged contact fields — values appear only when set.
// Fill in these as data becomes available (phone, legal entity, office, socials).
const contact = {
  city: 'Алматы, Казахстан',
  phone: '', // e.g. '+7 700 000-00-00'
  whatsapp: '', // e.g. 'https://wa.me/77000000000'
  address: '', // physical office address when available
  legal: '', // e.g. 'ТОО "UMAI Health", БИН 000000000000'
  linkedin: '', // e.g. 'https://linkedin.com/company/umai-health'
  instagram: '', // e.g. 'https://instagram.com/umai.health'
  telegram: '', // e.g. 'https://t.me/umai_health'
}
</script>

<style scoped>
.footer {
  background: var(--color-bg-alt);
  border-top: 1px solid var(--color-border-light);
  padding: 64px 0 32px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  gap: 48px;
}

/* Brand */
.footer-brand {
  max-width: 280px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--gradient-cta);
  color: white;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.footer-desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

/* Columns */
.footer-heading {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 16px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-list a,
.footer-list span {
  font-size: 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-list a:hover {
  color: var(--color-primary);
}

.footer-contacts li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
}

.footer-social {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.footer-social a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-light);
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.footer-social a:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* Bottom */
.footer-bottom {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border-light);
}

.footer-copy {
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .footer-brand {
    grid-column: 1 / -1;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>
