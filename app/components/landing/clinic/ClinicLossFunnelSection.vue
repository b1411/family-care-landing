<template>
  <LandingUiSectionWrapper
    badge="Воронка потерь"
    title="Каждый этап — потеря дохода"
    subtitle="Без системного сопровождения клиника теряет семьи на каждом переходе"
    alternate
  >
    <div class="funnel-container" ref="funnelRef">
      <!-- SVG funnel -->
      <div class="funnel-visual" data-reveal="fade-up">
        <div v-for="(step, i) in funnelSteps" :key="step.label" class="funnel-step">
          <div
            class="funnel-bar"
            :style="{
              width: `${step.width}%`,
              background: step.bg,
            }"
          >
            <span class="funnel-count font-display">{{ step.count }}</span>
            <span class="funnel-label">{{ step.label }}</span>
          </div>
          <div v-if="i < funnelSteps.length - 1" class="funnel-loss">
            <Icon name="lucide:arrow-down" class="loss-arrow" />
            <span class="loss-text">−{{ step.loss }} семей: {{ step.lossReason }}</span>
          </div>
        </div>
      </div>

      <!-- Revenue loss -->
      <div class="revenue-loss" data-reveal="scale-in">
        <div class="loss-card landing-card">
          <Icon name="lucide:trending-down" class="loss-icon" />
          <div>
            <div class="loss-amount font-display">
              <LandingUiAnimatedCounter :target="43" suffix=" млн ₸/год" />
            </div>
            <p class="loss-desc">Потерянный доход средней клиники из-за оттока семей после родов</p>
          </div>
        </div>
      </div>

      <!-- Hover insights -->
      <div class="funnel-insights" data-stagger="fade-up">
        <div v-for="insight in insights" :key="insight.title" class="insight-card landing-card hover-lift">
          <Icon :name="insight.icon" class="insight-icon" :style="{ color: insight.color }" />
          <h4>{{ insight.title }}</h4>
          <p>{{ insight.desc }}</p>
        </div>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const funnelRef = ref<HTMLElement | null>(null)

const funnelSteps = [
  { count: '100', label: 'Семей начинают наблюдение', width: 100, bg: 'var(--gradient-accent)', loss: 45, lossReason: 'уходят в 1 триместре' },
  { count: '55', label: 'Доходят до родов', width: 55, bg: 'linear-gradient(90deg, #E8E4F5, #E8A0BF)', loss: 22, lossReason: 'не возвращаются после выписки' },
  { count: '33', label: 'Остаются после родов', width: 33, bg: 'linear-gradient(90deg, #E8A0BF, #F2C4A0)', loss: 18, lossReason: 'теряются к 6 месяцам ребёнка' },
  { count: '15', label: 'Наблюдаются до года', width: 15, bg: 'linear-gradient(90deg, #F2C4A0, #D4727C)', loss: 10, lossReason: 'уходят после 1 года' },
  { count: '5', label: 'Остаются до 2 лет', width: 8, bg: 'rgba(212,114,124,0.3)' },
]

const insights = [
  {
    icon: 'lucide:alert-triangle',
    title: 'Критическая точка — выписка',
    desc: 'Без цифрового маршрута после родов 40% семей «невидимы» для клиники. Нет контакта = нет визитов.',
    color: 'var(--color-danger)',
  },
  {
    icon: 'lucide:calculator',
    title: 'Цена одной потерянной семьи',
    desc: 'Средний LTV семьи на полном маршруте — 540 000 ₸. Каждый уход — это потерянные визиты, анализы, вакцинации.',
    color: 'var(--color-warning)',
  },
  {
    icon: 'lucide:target',
    title: 'Возможность роста',
    desc: 'С системным сопровождением удержание вырастает с 15% до 60%+. Это ×4 роста дохода без привлечения новых пациентов.',
    color: 'var(--color-success)',
  },
]
</script>

<style scoped>
.funnel-visual {
  max-width: var(--content-medium);
  margin: 0 auto 48px;
}

.funnel-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4px;
}

.funnel-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: var(--radius-md);
  transition: transform var(--transition-fast);
  min-height: 52px;
}

.funnel-bar:hover {
  transform: scale(1.02);
}

.funnel-count {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.funnel-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.funnel-loss {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.loss-arrow {
  width: 16px;
  height: 16px;
  color: var(--color-danger);
}

.loss-text {
  font-size: 12px;
  color: var(--color-danger);
  font-weight: 500;
}

.revenue-loss {
  margin-bottom: 48px;
}

.loss-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 32px;
  max-width: 600px;
  margin: 0 auto;
  border-left: 4px solid var(--color-danger);
}

.loss-icon {
  width: 36px;
  height: 36px;
  color: var(--color-danger);
  flex-shrink: 0;
}

.loss-amount {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-danger);
  margin-bottom: 4px;
}

.loss-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 150%;
}

.funnel-insights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.insight-card {
  padding: 24px;
}

.insight-icon {
  width: 28px;
  height: 28px;
  margin-bottom: 12px;
}

.insight-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.insight-card p {
  font-size: 13px;
  line-height: 160%;
  color: var(--color-text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .funnel-insights {
    grid-template-columns: 1fr;
  }
  .loss-card {
    flex-direction: column;
    text-align: center;
  }
  .funnel-bar {
    padding: 12px 16px;
  }
  .funnel-count {
    font-size: 20px;
  }
}
</style>
