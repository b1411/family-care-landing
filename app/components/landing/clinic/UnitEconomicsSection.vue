<template>
  <LandingUiSectionWrapper
    id="roi"
    badge="Калькулятор"
    title="Что платформа делает для ваших семей"
    accent="ваших семей"
    class="section-ink"
  >
    <div class="calc-layout" data-reveal="fade-up">
      <!-- Slider input -->
      <div class="calc-slider landing-card">
        <label for="calc-families-slider" class="slider-label font-heading">Количество семей в месяц</label>
        <input
          id="calc-families-slider"
          v-model.number="families"
          type="range"
          :min="10"
          :max="100"
          :step="5"
          aria-label="Количество семей в месяц"
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
/* ============================================
   Phase 2 — Drama mode calculator on ink
   ============================================ */
.calc-layout {
  max-width: 1040px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

/* ---- Slider as hero element ---- */
.calc-slider {
  padding: 44px 48px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 24px;
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 24px 60px -12px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
}

.calc-slider::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top, rgba(139, 126, 200, 0.16), transparent 60%);
  pointer-events: none;
}

.calc-slider > * {
  position: relative;
  z-index: 1;
}

.slider-label {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-ink-text-muted);
  text-align: center;
}

.range-slider {
  width: 100%;
  height: 6px;
  accent-color: var(--color-secondary);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  appearance: none;
  -webkit-appearance: none;
}

.range-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--gradient-cta);
  border: 3px solid var(--color-ink);
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.12),
    0 0 20px rgba(139, 126, 200, 0.6),
    0 4px 12px rgba(0, 0, 0, 0.4);
  cursor: grab;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.12);
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.18),
    0 0 28px rgba(139, 126, 200, 0.8),
    0 4px 16px rgba(0, 0, 0, 0.5);
}

.range-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
}

.range-slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--gradient-cta);
  border: 3px solid var(--color-ink);
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.12),
    0 0 20px rgba(139, 126, 200, 0.6);
}

.slider-value {
  font-family: var(--font-mono);
  font-size: clamp(56px, 10vw, 96px);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.04em;
  text-align: center;
  font-variant-numeric: tabular-nums lining-nums;
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 60px rgba(139, 126, 200, 0.4);
  margin-top: 8px;
}

/* ---- 4 result columns — dark cards with mint/rose KPIs ---- */
.result-columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.result-col {
  padding: 26px 22px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 18px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.20) !important;
  transition: background 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.result-col::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  opacity: 0.5;
}

.result-col:hover {
  background: rgba(255, 255, 255, 0.07) !important;
  border-color: rgba(255, 255, 255, 0.16) !important;
  transform: translateY(-4px);
}

.col-events { color: var(--color-primary); }
.col-reminders { color: var(--color-secondary); }
.col-vaccines { color: var(--color-mint); }
.col-time { color: #F2C4A0; }

.col-heading {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-ink-text-muted);
  margin: 0;
}

.col-metric {
  font-family: var(--font-mono);
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 500;
  margin: 0;
  font-variant-numeric: tabular-nums lining-nums;
  letter-spacing: -0.03em;
  color: currentColor;
  text-shadow: 0 0 24px currentColor;
  filter: brightness(1.05);
}

.col-detail {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-ink-text-secondary);
  margin: 0;
  line-height: 1.5;
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
  gap: 10px;
  padding: 16px 36px;
  border-radius: var(--radius-full);
  background: var(--gradient-cta);
  color: white;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.10) inset,
    0 8px 32px rgba(139, 126, 200, 0.45),
    0 0 64px -8px rgba(232, 160, 191, 0.4);
  position: relative;
  overflow: hidden;
}

.cta-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.16) inset,
    0 12px 40px rgba(139, 126, 200, 0.55),
    0 0 80px -8px rgba(232, 160, 191, 0.55);
}

.cta-btn:hover::before {
  left: 100%;
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
