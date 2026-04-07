<template>
  <LandingUiSectionWrapper
    id="contact"
    :badge="badge"
    :title="title"
    :subtitle="subtitle"
    :custom-gradient="'var(--gradient-accent)'"
  >
    <LandingUiGradientBlob
      bottom="-10%"
      left="-5%"
      size="400px"
      color="var(--color-secondary-light)"
      :opacity="0.3"
      animated
      :duration="20"
    />
    <LandingUiGradientBlob
      top="-8%"
      right="-6%"
      size="350px"
      color="var(--color-accent-blue-light)"
      :opacity="0.25"
      animated
      :duration="24"
      :delay="4"
    />
    <div v-if="showIllustration" class="cta-illustration-wrap" data-reveal="fade-up">
      <LandingIllustrationsCtaIllustration />
    </div>
    <div class="cta-layout">
      <!-- Benefits column -->
      <div class="cta-benefits" data-stagger="fade-right">
        <div v-for="b in benefits" :key="b.title" class="benefit-row">
          <div class="benefit-icon" :style="{ background: b.bg }">
            <Icon :name="b.icon" size="20" :style="{ color: b.color }" />
          </div>
          <div>
            <strong class="benefit-title font-heading">{{ b.title }}</strong>
            <p class="benefit-desc">{{ b.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Form column -->
      <form class="cta-form landing-card" data-reveal="fade-left" @submit.prevent="handleSubmit">
        <div v-for="field in fields" :key="field.id" class="form-group">
          <label :for="field.id">{{ field.label }}</label>
          <input
            :id="field.id"
            v-model="form[field.model]"
            :type="field.type"
            :placeholder="field.placeholder"
            :required="field.required"
          />
        </div>
        <button type="submit" class="submit-btn btn-shimmer" :disabled="submitted">
          <template v-if="!submitted">{{ submitLabel }}</template>
          <template v-else>
            <Icon name="lucide:check" size="18" />
            {{ successMessage }}
          </template>
        </button>
        <p class="form-note">{{ note }}</p>
      </form>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface FormField {
  id: string
  label: string
  type: string
  placeholder: string
  required?: boolean
  model: string
}

interface Benefit {
  icon: string
  title: string
  desc: string
  bg: string
  color: string
}

const props = withDefaults(defineProps<{
  badge?: string
  title?: string
  subtitle?: string
  fields?: FormField[]
  benefits?: Benefit[]
  submitLabel?: string
  successMessage?: string
  note?: string
  showIllustration?: boolean
}>(), {
  badge: 'Связаться',
  title: 'Запросите демо',
  subtitle: 'Оставьте заявку — мы свяжемся в течение 24 часов',
  submitLabel: 'Запросить демо',
  successMessage: 'Заявка отправлена',
  note: 'Бесплатная консультация 30 минут. Без обязательств.',
  showIllustration: true,
  fields: () => [
    { id: 'cta-name', label: 'Имя', type: 'text', placeholder: 'Как к вам обращаться', required: true, model: 'name' },
    { id: 'cta-clinic', label: 'Клиника', type: 'text', placeholder: 'Название клиники', required: true, model: 'clinic' },
    { id: 'cta-email', label: 'Email', type: 'email', placeholder: 'email@clinic.kz', required: true, model: 'email' },
    { id: 'cta-phone', label: 'Телефон', type: 'tel', placeholder: '+7 (___) ___-__-__', required: false, model: 'phone' },
  ],
  benefits: () => [
    {
      icon: 'lucide:calendar-check',
      title: 'Демо за 30 минут',
      desc: 'Покажем платформу на примере реальных маршрутов',
      bg: 'var(--color-primary-light)',
      color: 'var(--color-primary)',
    },
    {
      icon: 'lucide:settings',
      title: 'Настройка за 1 день',
      desc: 'Настройка, брендинг, роли — всё готово в тот же день',
      bg: 'var(--color-secondary-light)',
      color: 'var(--color-secondary)',
    },
    {
      icon: 'lucide:users',
      title: 'Пилот на 10-20 семей',
      desc: '4-8 недель тестирования с полной поддержкой',
      bg: 'var(--color-accent-blue-light)',
      color: 'var(--color-accent-blue)',
    },
    {
      icon: 'lucide:bar-chart-3',
      title: 'ROI с первого месяца',
      desc: '+30–50% удержание, ×3–5 доход на семью, –70% ручной работы',
      bg: '#FEF3C7',
      color: '#92400E',
    },
  ],
})

const form = reactive<Record<string, string>>({})
const submitted = ref(false)

function handleSubmit() {
  console.log('CTA form submitted:', { ...form })
  submitted.value = true
}
</script>

<style scoped>
.cta-illustration-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.cta-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

/* Benefits */
.cta-benefits {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 12px;
}

.benefit-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.benefit-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.benefit-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 2px;
}

.benefit-desc {
  font-size: 13.5px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Form */
.cta-form {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: 'Satoshi', sans-serif;
}

.form-group input {
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: var(--color-text-primary);
  background: var(--color-bg);
  transition: border-color var(--transition-fast);
  outline: none;
}

.form-group input::placeholder {
  color: var(--color-text-muted);
}

.form-group input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 126, 200, 0.12);
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: var(--gradient-cta);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Satoshi', sans-serif;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: var(--shadow-md);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}

.submit-btn:disabled {
  opacity: 0.85;
  cursor: default;
  background: var(--color-success);
}

.form-note {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

@media (max-width: 1024px) {
  .cta-layout {
    gap: 32px;
  }

  .cta-form {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .cta-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
