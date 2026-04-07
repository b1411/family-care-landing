<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <Icon name="lucide:heart-pulse" size="36" />
          <h1 class="auth-brand">Family Care</h1>
        </div>
        <slot />
      </div>
      <p class="auth-footer-text">
        © {{ new Date().getFullYear() }} Family Care OS. Все права защищены.
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-hero);
  padding: 24px;
}

.auth-container {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.auth-card {
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 40px 32px;
  box-shadow: var(--shadow-lg);
}

.auth-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  color: var(--color-primary);
}

.auth-brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--color-text-primary);
}

.auth-footer-text {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

@media (max-width: 480px) {
  .auth-card {
    padding: 32px 20px;
    border-radius: var(--radius-lg);
  }
}
</style>
