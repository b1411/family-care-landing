<template>
  <section class="family-cta landing-section">
    <div class="cta-ambient" aria-hidden="true">
      <div class="cta-blob cta-blob-1" />
      <div class="cta-blob cta-blob-2" />
    </div>
    <div class="landing-container cta-z">
      <div class="cta-card" data-reveal="scale-in">
        <span class="cta-badge">Бесплатно для семей</span>
        <h2 class="font-display">Спросите у вашей клиники</h2>
        <p>
          Доступ предоставляется координатором вашей клиники.<br />
          Если ваша клиника ещё не подключена — расскажите им о нас.
        </p>
        <a href="mailto:?subject=Family Care OS&body=Узнайте о платформе Family Care OS для вашей клиники" class="cta-btn font-heading">
          <span>Отправить ссылку клинике</span>
          <span class="cta-btn-arrow">→</span>
        </a>
        <div class="cta-pills">
          <span class="cta-pill">🔒 Защищено</span>
          <span class="cta-pill">📱 Offline</span>
          <span class="cta-pill">💜 Бесплатно</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.family-cta {
  padding: 80px 0;
  position: relative;
  overflow: hidden;
}

.cta-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cta-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}

.cta-blob-1 {
  width: 350px;
  height: 350px;
  background: var(--color-primary-light);
  top: -100px;
  right: -60px;
  animation: blob-float 14s ease-in-out infinite alternate;
}

.cta-blob-2 {
  width: 280px;
  height: 280px;
  background: var(--color-secondary-light);
  bottom: -80px;
  left: -40px;
  animation: blob-float 18s ease-in-out infinite alternate-reverse;
}

@keyframes blob-float {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(30px, -20px) scale(1.08); }
  100% { transform: translate(-20px, 15px) scale(0.95); }
}

.cta-z { position: relative; z-index: 1; }

.cta-card {
  max-width: var(--content-narrow);
  margin: 0 auto;
  text-align: center;
  padding: clamp(40px, 8vw, 64px) clamp(24px, 5vw, 48px);
  border-radius: 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 16px 64px rgba(139, 126, 200, 0.1);
}

.cta-badge {
  display: inline-block;
  padding: 5px 14px;
  border-radius: var(--radius-full);
  background: var(--gradient-cta);
  color: white;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
  margin-bottom: 20px;
}

.cta-card h2 {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 14px;
}

.cta-card p {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0 0 28px;
  line-height: 1.6;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 36px;
  border-radius: var(--radius-full);
  background: var(--gradient-cta);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.35s ease;
  margin-bottom: 20px;
  box-shadow: 0 4px 24px rgba(139, 126, 200, 0.25);
  position: relative;
  overflow: hidden;
}

.cta-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255,255,255,0.25), transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
}

.cta-btn:hover::before { opacity: 1; }

.cta-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 32px rgba(139, 126, 200, 0.35);
}

.cta-btn-arrow {
  transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.cta-btn:hover .cta-btn-arrow {
  transform: translateX(4px);
}

.cta-pills {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cta-pill {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--color-bg-alt);
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}
</style>
