<template>
  <LandingUiSectionWrapper
    id="clinic-cta"
    badge="Начните"
    title="Обсудить подключение"
    subtitle="Расскажите о вашей клинике — мы подготовим предложение по пилотному запуску."
    alternate
  >
    <form class="cta-form landing-card" data-reveal="fade-up" @submit.prevent="onSubmit">
      <div class="form-grid">
        <div class="form-field">
          <label for="cta-name">Имя</label>
          <input id="cta-name" v-model="form.name" type="text" required placeholder="Ваше имя" />
        </div>
        <div class="form-field">
          <label for="cta-clinic">Клиника</label>
          <input id="cta-clinic" v-model="form.clinic" type="text" required placeholder="Название клиники" />
        </div>
        <div class="form-field">
          <label for="cta-phone">Телефон</label>
          <input id="cta-phone" v-model="form.phone" type="tel" required placeholder="+7 (7XX) XXX-XX-XX" />
        </div>
        <div class="form-field">
          <label for="cta-email">Email</label>
          <input id="cta-email" v-model="form.email" type="email" required placeholder="you@clinic.kz" />
        </div>
      </div>
      <button type="submit" class="submit-btn font-heading" :disabled="submitted">
        {{ submitted ? 'Отправлено ✓' : 'Обсудить подключение' }}
      </button>
      <p class="form-footer">Ответим в течение 1 рабочего дня. Никакого спама.</p>
    </form>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const submitted = ref(false)
const form = reactive({ name: '', clinic: '', phone: '', email: '' })

async function onSubmit() {
  try {
    await $fetch('/api/contact-request', {
      method: 'POST',
      body: {
        name: form.name,
        organization: form.clinic,
        email: form.email,
        phone_or_messenger: form.phone,
        comment: '',
        type: 'clinic_inquiry',
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
.cta-form {
  max-width: var(--content-narrow);
  margin: 0 auto;
  padding: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.form-field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.form-field input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 15px;
  color: var(--color-text-primary);
  background: var(--color-bg);
  outline: none;
  transition: border-color 0.2s;
}

.form-field input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 126, 200, 0.12);
}

.submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  background: var(--color-success);
  cursor: default;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-field--full {
  grid-column: 1 / -1;
}

.form-footer {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 12px 0 0;
  line-height: 1.5;
}
</style>
