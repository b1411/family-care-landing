<template>
  <LandingUiSectionWrapper
    id="roi"
    badge="ROI"
    title="ROI-калькулятор"
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

      <!-- 3 columns: Now / With platform / Difference -->
      <div class="result-columns">
        <div class="result-col landing-card col-loss">
          <h4 class="col-heading font-heading">Сейчас вы теряете</h4>
          <p class="col-metric font-display">{{ animatedLost }} семей/год</p>
          <p class="col-detail">уходят после родов (67%)</p>
        </div>
        <div class="result-col landing-card col-gain">
          <h4 class="col-heading font-heading">С платформой сохраняете</h4>
          <p class="col-metric font-display">{{ animatedRetained }} семей</p>
          <p class="col-detail">из {{ Math.round(displayLost.value !== undefined ? displayLost.value : lostFamilies) }} остаются в педиатрию (70%)</p>
        </div>
        <div class="result-col landing-card col-diff" :class="{ 'roi-positive': roiPercent > 100 }">
          <h4 class="col-heading font-heading">Разница</h4>
          <p class="col-metric font-display">+{{ animatedDiffRevenue }} ₸/год</p>
          <p class="col-detail">{{ animatedRetained }} семей × 1.8M ₸ LTV</p>
        </div>
      </div>

      <!-- Cost & ROI strip -->
      <div class="roi-strip">
        <div class="roi-item">
          <span class="roi-label">Стоимость платформы</span>
          <span class="roi-val font-mono">{{ formattedCost }} ₸/год</span>
        </div>
        <div class="roi-divider" />
        <div class="roi-item">
          <span class="roi-label">ROI</span>
          <span class="roi-val roi-val--highlight font-display">{{ animatedRoi }}%</span>
        </div>
      </div>

      <!-- Formulas breakdown -->
      <details class="formulas-block">
        <summary class="formulas-toggle font-heading">Как считаем</summary>
        <div class="formulas-body font-mono">
          <p>Семей уходит: {{ families }} × 12 мес × 0.67 = {{ Math.round(families * 12 * 0.67) }}</p>
          <p>Остаётся с платформой: {{ Math.round(families * 12 * 0.67) }} × 0.70 = {{ Math.round(families * 12 * 0.67 * 0.70) }}</p>
          <p>Revenue per family: 1,800,000 ₸ (150K/мес × 12)</p>
          <p>Platform cost: 1,500,000 ₸/мес × 12 = 18,000,000 ₸/год</p>
        </div>
      </details>

      <div class="calc-cta" data-reveal="fade-up">
        <a href="#clinic-cta" class="cta-btn font-heading">
          Запросить персональный расчёт
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

// Revenue per retained family ~ 1.8M ₸/year
const revenuePerFamily = 1_800_000
// Churn rate without platform: 67%
const churnRate = 0.67
// Re-retention with platform: 70% of those who would have left
const reRetention = 0.70
// Platform cost: 1.5M/month
const platformCostYear = 18_000_000

const lostFamilies = computed(() => Math.round(families.value * 12 * churnRate))
const retainedFamilies = computed(() => Math.round(lostFamilies.value * reRetention))
const diffRevenue = computed(() => retainedFamilies.value * revenuePerFamily)
const roiPercent = computed(() => Math.round((diffRevenue.value - platformCostYear) / platformCostYear * 100))

// Animated display values
const displayLost = ref({ value: lostFamilies.value })
const displayRetained = ref({ value: retainedFamilies.value })
const displayDiffRevenue = ref({ value: diffRevenue.value })
const displayRoi = ref({ value: roiPercent.value })

const animatedLost = computed(() => Math.round(displayLost.value.value))
const animatedRetained = computed(() => Math.round(displayRetained.value.value))
const animatedDiffRevenue = computed(() => Math.round(displayDiffRevenue.value.value).toLocaleString('ru-RU'))
const animatedRoi = computed(() => Math.round(displayRoi.value.value))
const formattedCost = computed(() => platformCostYear.toLocaleString('ru-RU'))

watch(lostFamilies, (val) => { gsap.to(displayLost.value, { value: val, duration: 0.6, ease: 'power2.out' }) })
watch(retainedFamilies, (val) => { gsap.to(displayRetained.value, { value: val, duration: 0.6, ease: 'power2.out' }) })
watch(diffRevenue, (val) => { gsap.to(displayDiffRevenue.value, { value: val, duration: 0.6, ease: 'power2.out' }) })
watch(roiPercent, (val) => { gsap.to(displayRoi.value, { value: val, duration: 0.6, ease: 'power2.out' }) })
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

/* 3 columns */
.result-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.col-loss .col-metric { color: var(--color-danger); }
.col-gain .col-metric { color: var(--color-success); }
.col-diff .col-metric { color: var(--color-primary); }

.col-detail {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}

.roi-positive {
  border-color: var(--color-success);
  box-shadow: 0 0 24px rgba(76, 175, 80, 0.15);
}

.roi-positive .col-metric {
  color: var(--color-success);
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
