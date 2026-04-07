<template>
  <LandingUiSectionWrapper
    id="clinic-problems"
    badge="Проблема"
    title="Что теряет ваша клиника сегодня"
    alternate
  >
    <!-- Top: Pains with FLIP cards + BurningMoney -->
    <div class="problems-layout">
      <div class="pains-list" data-stagger="fade-up">
        <div
          v-for="pain in pains"
          :key="pain.title"
          class="pain-card"
          :class="{ 'is-flipped': flippedCards.has(pain.title) }"
          @mouseenter="flipCard(pain.title)"
          @mouseleave="unflipCard(pain.title)"
        >
          <!-- Front: problem -->
          <div class="pain-face pain-front">
            <Icon :name="pain.icon" size="24" class="pain-icon pain-icon--danger" />
            <h4 class="pain-title font-heading">{{ pain.title }}</h4>
            <p class="pain-desc">{{ pain.desc }}</p>
            <span class="pain-cost font-mono">{{ pain.cost }}</span>
          </div>
          <!-- Back: solution -->
          <div class="pain-face pain-back">
            <Icon :name="pain.solIcon" size="24" class="pain-icon pain-icon--success" />
            <h4 class="pain-title font-heading">{{ pain.solution }}</h4>
            <p class="pain-desc">{{ pain.solDesc }}</p>
          </div>
        </div>
      </div>

      <div class="burning-visual" data-reveal="fade-left">
        <LandingSvgBurningMoney />
      </div>
    </div>

    <!-- Bottom: Loss Funnel integrated -->
    <div class="funnel-section">
      <h3 class="funnel-heading font-heading" data-reveal="fade-up">Воронка потерь: от 100 семей остаётся 5</h3>

      <div class="funnel-visual" data-reveal="fade-up">
        <div v-for="(step, i) in funnelSteps" :key="step.label" class="funnel-step">
          <div
            class="funnel-bar"
            :style="{ width: `${step.width}%`, background: step.bg }"
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
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
const flippedCards = ref(new Set<string>())

function flipCard(title: string) {
  flippedCards.value.add(title)
  flippedCards.value = new Set(flippedCards.value)
}

function unflipCard(title: string) {
  flippedCards.value.delete(title)
  flippedCards.value = new Set(flippedCards.value)
}

const pains = [
  {
    title: 'Путь беременная → педиатрия',
    desc: '67% семей уходят после родов. Вы теряете 12–18 мес дохода каждой семьи.',
    cost: '–12-18 мес LTV',
    icon: 'lucide:user-x',
    solution: 'Автоматический маршрут',
    solDesc: 'Платформа ведёт семью от беременности через роды в педиатрию — без потерь.',
    solIcon: 'lucide:route',
  },
  {
    title: 'Контроль назначений',
    desc: 'Соблюдение назначений без системы ~45%. Пациенты пропускают прививки, анализы, витамины.',
    cost: '45% соблюдение, ↓NPS',
    icon: 'lucide:pill',
    solution: 'Умные назначения',
    solDesc: 'Ежедневные напоминания + подтверждения. Соблюдение растёт до 94%.',
    solIcon: 'lucide:check-circle',
  },
  {
    title: 'Координация вручную',
    desc: '50% времени координатора — обзвон и напоминания. 4+ часа в день на рутину.',
    cost: '–50% времени координатора',
    icon: 'lucide:phone-off',
    solution: 'Панель координатора',
    solDesc: 'Очередь задач с приоритетами. Координатор видит кого и зачем обзвонить.',
    solIcon: 'lucide:list-checks',
  },
  {
    title: 'Аналитика пациентов',
    desc: 'Нет данных для решений — удержание, соблюдение назначений, конверсия неизвестны. Решения «на глаз».',
    cost: 'Решения «на глаз»',
    icon: 'lucide:eye-off',
    solution: 'Аналитика',
    solDesc: 'Удержание, LTV, NPS — когортная аналитика для управленческих решений.',
    solIcon: 'lucide:bar-chart-3',
  },
  {
    title: 'Повторные визиты',
    desc: 'Каждый пропущенный визит — потеря 10–30K ₸. Клиника реактивна, а не проактивна.',
    cost: '–10-30K ₸ за пропуск',
    icon: 'lucide:calendar-x',
    solution: 'Умная запись',
    solDesc: 'Автозапись из маршрута, напоминания за 24ч и 2ч. Неявки снижаются на 40%.',
    solIcon: 'lucide:calendar-check',
  },
]

const funnelSteps = [
  { count: '100', label: 'Семей начинают наблюдение', width: 100, bg: 'var(--gradient-accent)', loss: 45, lossReason: 'уходят в 1 триместре' },
  { count: '55', label: 'Доходят до родов', width: 55, bg: 'linear-gradient(90deg, #E8E4F5, #E8A0BF)', loss: 22, lossReason: 'не возвращаются после выписки' },
  { count: '33', label: 'Остаются после родов', width: 33, bg: 'linear-gradient(90deg, #E8A0BF, #F2C4A0)', loss: 18, lossReason: 'теряются к 6 месяцам ребёнка' },
  { count: '15', label: 'Наблюдаются до года', width: 15, bg: 'linear-gradient(90deg, #F2C4A0, #D4727C)', loss: 10, lossReason: 'уходят после 1 года' },
  { count: '5', label: 'Остаются до 2 лет', width: 8, bg: 'rgba(212,114,124,0.3)' },
]
</script>

<style scoped>
.problems-layout {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 48px;
  align-items: center;
}

.pains-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* FLIP card */
.pain-card {
  perspective: 800px;
  min-height: 120px;
  cursor: default;
}

.pain-face {
  padding: 20px;
  border-radius: var(--radius-lg);
  backface-visibility: hidden;
  transition: transform 0.5s ease;
}

.pain-front {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
}

.pain-back {
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary);
  position: absolute;
  inset: 0;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.pain-card {
  position: relative;
}

.is-flipped .pain-front {
  transform: rotateY(180deg);
}

.is-flipped .pain-back {
  transform: rotateY(0deg);
}

.pain-icon {
  margin-bottom: 8px;
}

.pain-icon--danger {
  color: var(--color-danger);
}

.pain-icon--success {
  color: var(--color-success);
}

.pain-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

.pain-desc {
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-secondary);
  margin: 0;
}

.pain-cost {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-danger);
  letter-spacing: var(--tracking-wide);
}

.burning-visual {
  display: flex;
  justify-content: center;
}

/* ---- Funnel integrated ---- */
.funnel-section {
  margin-top: 64px;
  padding-top: 48px;
  border-top: 1px solid var(--color-border-light);
}

.funnel-heading {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0 0 36px;
}

.funnel-visual {
  max-width: 700px;
  margin: 0 auto 40px;
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
  padding: 14px 24px;
  border-radius: var(--radius-md);
  transition: transform var(--transition-fast);
  min-height: 48px;
}

.funnel-bar:hover {
  transform: scale(1.02);
}

.funnel-count {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.funnel-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.funnel-loss {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.loss-arrow {
  width: 14px;
  height: 14px;
  color: var(--color-danger);
}

.loss-text {
  font-size: 12px;
  color: var(--color-danger);
  font-weight: 500;
}

.revenue-loss {
  margin-bottom: 0;
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
  width: 32px;
  height: 32px;
  color: var(--color-danger);
  flex-shrink: 0;
}

.loss-amount {
  font-size: 26px;
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

@media (max-width: 768px) {
  .problems-layout {
    grid-template-columns: 1fr;
  }
  .burning-visual { order: -1; }
  .loss-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  .funnel-bar {
    padding: 10px 14px;
  }
  .funnel-count {
    font-size: 18px;
  }
}
</style>
