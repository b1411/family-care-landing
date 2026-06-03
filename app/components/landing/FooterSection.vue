<template>
  <footer class="footer section-ink" aria-labelledby="footer-heading">
    <h2 id="footer-heading" class="sr-only">Подвал сайта</h2>

    <!-- Decorative dotted-grid + gradient strip -->
    <div class="footer-grid-pattern" aria-hidden="true" />
    <div class="footer-gradient-strip" aria-hidden="true" />

    <div class="landing-container">
      <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="logo-icon">
              <Icon name="lucide:heart-pulse" size="20" />
              <span class="logo-icon-pulse" aria-hidden="true" />
            </span>
            <span class="logo-text font-display">
              <span class="logo-text-gradient">UMAI</span>&nbsp;Health
            </span>
          </div>
          <p class="footer-desc t-body">
            Цифровой маршрут здоровья семьи — от&nbsp;первых недель беременности до&nbsp;2&nbsp;лет ребёнка.
            Платформа для&nbsp;частных клиник под&nbsp;вашим брендом.
          </p>

          <!-- System status pill -->
          <div class="footer-status">
            <span class="status-dot" aria-hidden="true" />
            <span class="status-label">Все системы работают</span>
          </div>
        </div>

        <!-- Navigation -->
        <div class="footer-col">
          <h4 class="footer-heading t-eyebrow">Платформа</h4>
          <ul class="footer-list">
            <li><NuxtLink to="/#what-is">О&nbsp;платформе</NuxtLink></li>
            <li><NuxtLink to="/#modules">Модули</NuxtLink></li>
            <li><NuxtLink to="/#how-it-works">Как&nbsp;это работает</NuxtLink></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-heading t-eyebrow">Страницы</h4>
          <ul class="footer-list">
            <li><NuxtLink to="/for-clinics">Для&nbsp;клиник</NuxtLink></li>
            <li><NuxtLink to="/for-families">Для&nbsp;родителей</NuxtLink></li>
            <li><NuxtLink to="/demo">Попробовать демо</NuxtLink></li>
            <li><NuxtLink to="/integrations">Интеграции</NuxtLink></li>
            <li><NuxtLink to="/security">Безопасность</NuxtLink></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="footer-col">
          <h4 class="footer-heading t-eyebrow">Контакты</h4>
          <ul class="footer-list footer-contacts">
            <li>
              <span class="contact-icon"><Icon name="lucide:mail" size="14" /></span>
              <a href="mailto:info@umai-health.kz">info@umai-health.kz</a>
            </li>
            <li v-if="contact.phone">
              <span class="contact-icon"><Icon name="lucide:phone" size="14" /></span>
              <a :href="`tel:${contact.phone.replace(/\s+/g, '')}`">{{ contact.phone }}</a>
            </li>
            <li v-if="contact.whatsapp">
              <span class="contact-icon"><Icon name="lucide:message-circle" size="14" /></span>
              <a :href="contact.whatsapp" target="_blank" rel="noopener">WhatsApp</a>
            </li>
            <li>
              <span class="contact-icon"><Icon name="lucide:map-pin" size="14" /></span>
              <span>{{ contact.city }}</span>
            </li>
            <li v-if="contact.address">
              <span class="contact-icon"><Icon name="lucide:building-2" size="14" /></span>
              <span>{{ contact.address }}</span>
            </li>
            <li v-if="contact.legal">
              <span class="contact-icon"><Icon name="lucide:landmark" size="14" /></span>
              <span>{{ contact.legal }}</span>
            </li>
          </ul>

          <div v-if="contact.linkedin || contact.instagram || contact.telegram" class="footer-social">
            <a
              v-if="contact.linkedin"
              :href="contact.linkedin"
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
              class="social-link"
            >
              <Icon name="lucide:linkedin" size="16" />
            </a>
            <a
              v-if="contact.instagram"
              :href="contact.instagram"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              class="social-link"
            >
              <Icon name="lucide:instagram" size="16" />
            </a>
            <a
              v-if="contact.telegram"
              :href="contact.telegram"
              target="_blank"
              rel="noopener"
              aria-label="Telegram"
              class="social-link"
            >
              <Icon name="lucide:send" size="16" />
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-bottom-left">
          <span class="footer-locale">
            <Icon name="lucide:globe" size="14" />
            <span>Қазақстан · Алматы</span>
          </span>
          <span class="footer-copy">
            © {{ currentYear }} UMAI Health. Сделано с&nbsp;заботой в&nbsp;Казахстане.
          </span>
        </div>
        <div class="footer-legal">
          <NuxtLink to="/privacy">Политика конфиденциальности</NuxtLink>
          <span class="footer-dot" aria-hidden="true">·</span>
          <NuxtLink to="/terms">Условия использования</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()

const contact = {
  city: 'Алматы, Казахстан',
  phone: '',
  whatsapp: '',
  address: '',
  legal: '',
  linkedin: '',
  instagram: '',
  telegram: '',
}
</script>

<style scoped>
.footer {
  position: relative;
  padding: 84px 0 36px;
  overflow: hidden;
}

/* Top gradient strip (lavender → rose → mint sweep) */
.footer-gradient-strip {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(139, 126, 200, 0.6) 25%,
    rgba(232, 160, 191, 0.7) 50%,
    rgba(91, 192, 190, 0.55) 75%,
    transparent 100%
  );
  z-index: 2;
}

/* Dotted-grid background pattern */
.footer-grid-pattern {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: radial-gradient(
    rgba(255, 255, 255, 0.06) 1px,
    transparent 1px
  );
  background-size: 28px 28px;
  background-position: 0 0;
  mask-image: radial-gradient(ellipse 80% 60% at center, black 30%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at center, black 30%, transparent 100%);
  opacity: 0.7;
}

.landing-container {
  position: relative;
  z-index: 1;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  gap: 56px;
}

/* Brand */
.footer-brand {
  max-width: 320px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.logo-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--gradient-cta);
  color: white;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    0 6px 18px rgba(139, 126, 200, 0.38);
  isolation: isolate;
}

.logo-icon-pulse {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--gradient-cta);
  z-index: -1;
  opacity: 0;
}

@media (prefers-reduced-motion: no-preference) {
  .logo-icon-pulse {
    animation: logo-icon-pulse 3.4s ease-out infinite;
  }
}

@keyframes logo-icon-pulse {
  0% { opacity: 0.5; transform: scale(1); }
  70% { opacity: 0; transform: scale(1.6); }
  100% { opacity: 0; transform: scale(1.6); }
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.logo-text-gradient {
  background: linear-gradient(115deg, #B4A6E8 0%, #F0B8D2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 800;
}

.footer-desc {
  font-size: 13.5px;
  line-height: 1.65;
  margin: 0 0 18px;
}

/* System status pill */
.footer-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 10px;
  border-radius: var(--radius-full);
  background: rgba(91, 192, 190, 0.12);
  border: 1px solid rgba(91, 192, 190, 0.2);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(127, 220, 218, 0.95);
}

.status-dot {
  position: relative;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5BC0BE;
  box-shadow: 0 0 8px rgba(91, 192, 190, 0.6);
}

@media (prefers-reduced-motion: no-preference) {
  .status-dot::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: rgba(91, 192, 190, 0.45);
    animation: status-pulse 2.2s ease-out infinite;
  }
}

@keyframes status-pulse {
  0% { transform: scale(0.6); opacity: 0.85; }
  100% { transform: scale(2.2); opacity: 0; }
}

/* Columns */
.footer-heading {
  margin: 0 0 18px;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--color-ink-text-muted);
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.footer-list a,
.footer-list span {
  font-size: 14px;
  color: var(--color-ink-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast), transform var(--transition-fast);
  display: inline-block;
}

.footer-list a:hover {
  color: var(--color-ink-text-primary);
  transform: translateX(2px);
}

.footer-contacts li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-ink-text-secondary);
}

.contact-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--color-ink-text-muted);
  flex-shrink: 0;
}

/* Social — glassmorphic circles with hover-glow */
.footer-social {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-ink-text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.22s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.social-link:hover {
  color: white;
  border-color: rgba(232, 160, 191, 0.45);
  box-shadow:
    0 0 0 4px rgba(232, 160, 191, 0.08),
    0 6px 18px -4px rgba(232, 160, 191, 0.35);
  transform: translateY(-2px);
}

/* Bottom */
.footer-bottom {
  margin-top: 56px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.footer-bottom-left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 18px;
  font-size: 12.5px;
  color: var(--color-ink-text-muted);
}

.footer-locale {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  color: var(--color-ink-text-secondary);
  font-weight: 500;
}

.footer-copy {
  margin: 0;
  letter-spacing: 0.01em;
}

.footer-legal {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
}

.footer-legal a {
  color: var(--color-ink-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-legal a:hover {
  color: var(--color-ink-text-primary);
}

.footer-dot {
  color: var(--color-ink-text-muted);
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: 40px;
  }
  .footer-grid > :nth-child(4) {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 64px 0 32px;
  }
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  .footer-brand {
    grid-column: 1 / -1;
    max-width: 100%;
  }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
}

@media (max-width: 480px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .footer-grid-pattern {
    background-size: 22px 22px;
    opacity: 0.5;
  }
}
</style>
