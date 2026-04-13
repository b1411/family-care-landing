<template>
  <LandingUiSectionWrapper
    id="roi"
    badge="Калькулятор"
    title="Что платформа делает для ваших семей"
    alternate
  >
    <div class="calc-layout" data-reveal="fade-up">
      <!-- Slider input -->
      <div class="calc-slider landing-card">
        <label class="slider-label font-heading">Количество семей в месяц</label>
        <input
          v-model.number="families"
          type="range"
          :min="10"
          :max="100"
          :step="5"
          class="range-slider"
        />
        <span class="slider-value font-display">{{ families }}</span>
      </div>

      <!-- 4 functional metric columns -->
      <div class="result-columns">
        <div class="result-col landing-card col-events">
          <h4 class="col-heading font-heading">События маршрута</h4>
          <p class="col-metric font-display">{{ animatedEvents }}/год</p>
          <p class="col-detail">осмотры, анализы, прививки, назначения</p>
        </div>
        <div class="result-col landing-card col-reminders">
          <h4 class="col-heading font-heading">Напоминаний</h4>
          <p class="col-metric font-display">{{ animatedReminders }}/год</p>
          <p class="col-detail">push-уведомления семьям автоматически</p>
        </div>
        <div class="result-col landing-card col-vaccines">
          <h4 class="col-heading font-heading">Прививок по календарю</h4>
          <p class="col-metric font-display">{{ animatedVaccines }}/год</p>
          <p class="col-detail">контроль по нац. календарю РК</p>
        </div>
        <div class="result-col landing-card col-time">
          <h4 class="col-heading font-heading">Время координатора</h4>
          <p class="col-metric font-display">−{{ animatedHours }} ч/день</p>
          <p class="col-detail">экономия на ручных обзвонах и напоминаниях</p>
        </div>
      </div>

      <!-- Cost note -->
      <div class="roi-strip">
        <div class="roi-item">
          <span class="roi-label">Стоимость</span>
          <span class="roi-val font-mono">Рассчитывается индивидуально</span>
        </div>
      </div>

      <div class="calc-cta" data-reveal="fade-up">
        <a href="#clinic-cta" class="cta-btn font-heading">
          Обсудить подключение
          <Icon name="lucide:arrow-right" size="18" />
        </a>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGsap } from '~/composables/useGsap'

const { gsap } = useGsap()

const families = ref(30)

// Functional metrics based on family count
const eventsPerYear = computed(() => families.value * 12 * 50) // ~50 events per family per journey
const remindersPerYear = computed(() => families.value * 12 * 120) // ~120 push reminders per family
const vaccinesPerYear = computed(() => families.value * 12 * 18) // ~18 vaccines per child
const hoursSaved = computed(() => Math.round(families.value * 0.1)) // ~6 min per family → hours/day

// Animated display values
const displayEvents = ref({ value: eventsPerYear.value })
const displayReminders = ref({ value: remindersPerYear.value })
const displayVaccines = ref({ value: vaccinesPerYear.value })
const displayHours = ref({ value: hoursSaved.value })

const animatedEvents = computed(() => Math.round(displayEvents.value.value).toLocaleString('ru-RU'))
const animatedReminders = computed(() => Math.round(displayReminders.value.value).toLocaleString('ru-RU'))
const animatedVaccines = computed(() => Math.round(displayVaccines.value.value).toLocaleString('ru-RU'))
const animatedHours = computed(() => Math.round(displayHours.value.value))

watch(eventsPerYear, (val) => { gsap.to(displayEvents.value, { value: val, duration: 0.6, ease: 'power2.out' }) })
watch(remindersPerYear, (val) => { gsap.to(displayReminders.value, { value: val, duration: 0.6, ease: 'power2.out' }) })
watch(vaccinesPerYear, (val) => { gsap.to(displayVaccines.value, { value: val, duration: 0.6, ease: 'power2.out' }) })
watch(hoursSaved, (val) => { gsap.to(displayHours.value, { value: val, duration: 0.6, ease: 'power2.out' }) })
</script>

<style scoped>
.calc-layout {
  max-width: var(--content-medium);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.calc-slider {
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.slider-label {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.range-slider {
  width: 100%;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.slider-value {
  font-size: clamp(28px, 8vw, 40px);
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}

/* 4 columns */
.result-columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.result-col {
  padding: 24px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.col-heading {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-muted);
  margin: 0;
}

.col-metric {
  font-size: clamp(18px, 4vw, 26px);
  font-weight: 700;
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.col-events .col-metric { color: var(--color-primary); }
.col-reminders .col-metric { color: var(--color-secondary-dark); }
.col-vaccines .col-metric { color: var(--color-success); }
.col-time .col-metric { color: var(--color-accent-blue); }

.col-detail {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* ROI strip */
.roi-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 20px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
}

.roi-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.roi-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.roi-val {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.roi-val--highlight {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
}

.roi-divider {
  width: 1px;
  height: 36px;
  background: var(--color-border);
}

/* Formulas */
.formulas-block {
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
}

.formulas-toggle {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.formulas-body {
  padding: 0 16px 16px;
  font-size: 12px;
  line-height: 1.8;
  color: var(--color-text-muted);
}

.formulas-body p {
  margin: 0;
}

/* CTA */
.calc-cta {
  text-align: center;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: var(--radius-full);
  background: var(--gradient-cta);
  color: white;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 4px 20px rgba(139, 126, 200, 0.3);
}

.cta-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .result-columns {
    grid-template-columns: 1fr;
  }
  .roi-strip {
    flex-direction: column;
    gap: 16px;
  }
  .roi-divider {
    width: 100%;
    height: 1px;
  }
}
</style>
