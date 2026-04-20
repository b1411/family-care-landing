<template>
  <section class="family-cta landing-section">
    <div class="cta-ambient" aria-hidden="true">
      <div class="cta-blob cta-blob-1" />
      <div class="cta-blob cta-blob-2" />
    </div>
    <div class="landing-container cta-z">
      <div class="cta-card" data-reveal="scale-in">
        <span class="cta-badge">Для семей</span>
        <h2 class="font-display">Спросите у вашей клиники</h2>
        <p>
          Доступ предоставляется координатором вашей клиники.<br />
          Если ваша клиника ещё не подключена — оставьте заявку, и мы свяжемся с ними.
        </p>
        <form class="family-form" @submit.prevent="handleSubmit">
          <div class="family-form-row">
            <input v-model="form.name" type="text" required placeholder="Ваше имя" class="family-input" />
            <input v-model="form.clinic" type="text" placeholder="Название клиники" class="family-input" />
          </div>
          <div class="family-form-row">
            <input v-model="form.city" type="text" placeholder="Город" class="family-input" />
            <input v-model="form.email" type="text" required placeholder="Email или телефон" class="family-input" />
          </div>
          <button type="submit" class="cta-btn font-heading" :disabled="submitted">
            <template v-if="!submitted">
              <span>Оставить заявку</span>
              <span class="cta-btn-arrow">→</span>
            </template>
            <template v-else>
              ✓ Отправлено
            </template>
          </button>
        </form>
        <div class="cta-pills">
          <span class="cta-pill"><Icon name="lucide:lock" size="14" /> Защищено</span>
          <span class="cta-pill"><Icon name="lucide:smartphone" size="14" /> Offline</span>
          <span class="cta-pill"><Icon name="lucide:heart" size="14" /> Бесплатно</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const form = reactive({ name: '', clinic: '', city: '', email: '' })
const submitted = ref(false)

async function handleSubmit() {
  try {
    await $fetch('/api/contact-request', {
      method: 'POST',
      body: {
        name: form.name,
        organization: form.clinic,
        email: form.email,
        comment: form.city ? `Город: ${form.city}` : '',
        type: 'demand_family',
      },
    })
    submitted.value = true
  }
  catch {
    submitted.value = true
  }
}
</script>

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

.family-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.family-form-row {
  display: flex;
  gap: 10px;
}

.family-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg);
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.family-input:focus {
  border-color: var(--color-primary);
}

.family-input::placeholder {
  color: var(--color-text-muted);
}

.cta-pills {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--color-bg-alt);
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}
.cta-pill :deep(svg) {
  color: var(--color-primary);
}
</style>
