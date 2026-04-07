<template>
  <LandingUiSectionWrapper
    badge="Маршрут"
    title="От зачатия до 2 лет — один маршрут"
    subtitle="Каждый этап автоматически рассчитывается. Система знает, что должно произойти следующим"
    alternate
  >
    <div class="journey-wrapper">
      <!-- Stage tabs -->
      <div class="stage-tabs" data-reveal="fade-up">
        <button
          v-for="(stage, i) in stages"
          :key="stage.id"
          :class="['stage-tab font-heading', { active: activeStage === i }]"
          @click="activeStage = i"
        >
          <Icon :name="stage.icon" size="18" />
          {{ stage.label }}
        </button>
      </div>

      <!-- Timeline -->
      <div class="timeline-container" data-reveal="fade-up" data-reveal-delay="200">
        <div class="timeline-track" />
        <Transition name="tab-fade" mode="out-in">
          <div class="timeline-events" :key="activeStage">
          <div
            v-for="(event, idx) in currentEvents"
            :key="event.label"
            class="event-node"
            :style="{ '--delay': `${idx * 80}ms` }"
          >
            <div class="event-dot" :style="{ background: event.color }" />
            <div class="event-card">
              <span class="event-week font-heading">{{ event.time }}</span>
              <span class="event-label">{{ event.label }}</span>
              <span v-if="event.tag" class="event-tag" :style="{ background: event.tagBg, color: event.tagColor }">
                {{ event.tag }}
              </span>
            </div>
          </div>
          </div>
        </Transition>
      </div>
      <div class="stage-info" data-stagger="scale-in">
        <div class="info-item" v-for="info in stages[activeStage]?.info" :key="info.label">
          <span class="info-number font-display">{{ info.value }}</span>
          <span class="info-label">{{ info.label }}</span>
        </div>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeStage = ref(0)

const stages = [
  {
    id: 'pregnancy',
    label: 'Беременность',
    icon: 'lucide:heart-pulse',
    info: [
      { value: '40', label: 'недель' },
      { value: '12+', label: 'визитов' },
      { value: '3', label: 'УЗИ-скрининга' },
      { value: '15+', label: 'анализов' },
    ],
    events: [
      { time: '6–8 нед.', label: 'Первый визит к гинекологу', color: 'var(--color-primary)', tag: 'Визит', tagBg: 'var(--color-primary-light)', tagColor: 'var(--color-primary)' },
      { time: '11–14 нед.', label: 'УЗИ-скрининг I триместра', color: 'var(--color-accent-blue)', tag: 'УЗИ', tagBg: 'var(--color-accent-blue-light)', tagColor: 'var(--color-accent-blue)' },
      { time: '16 нед.', label: 'Тройной тест (АФП, ХГЧ, эстриол)', color: 'var(--color-secondary)', tag: 'Анализ', tagBg: 'var(--color-secondary-light)', tagColor: 'var(--color-secondary-dark)' },
      { time: '18–21 нед.', label: 'УЗИ-скрининг II триместра', color: 'var(--color-accent-blue)', tag: 'УЗИ', tagBg: 'var(--color-accent-blue-light)', tagColor: 'var(--color-accent-blue)' },
      { time: '24–28 нед.', label: 'Тест на гестационный диабет', color: 'var(--color-secondary)', tag: 'Анализ', tagBg: 'var(--color-secondary-light)', tagColor: 'var(--color-secondary-dark)' },
      { time: '30–32 нед.', label: 'УЗИ-скрининг III триместра', color: 'var(--color-accent-blue)', tag: 'УЗИ', tagBg: 'var(--color-accent-blue-light)', tagColor: 'var(--color-accent-blue)' },
      { time: '36–40 нед.', label: 'Еженедельные КТГ + визиты', color: 'var(--color-primary)', tag: 'Визит', tagBg: 'var(--color-primary-light)', tagColor: 'var(--color-primary)' },
    ],
  },
  {
    id: 'infant',
    label: '0 – 12 месяцев',
    icon: 'lucide:baby',
    info: [
      { value: '12', label: 'месяцев' },
      { value: '10+', label: 'осмотров' },
      { value: '8', label: 'вакцинаций' },
      { value: '365', label: 'дней витамин D3' },
    ],
    events: [
      { time: '0–3 дня', label: 'БЦЖ + Гепатит B (родильный дом)', color: 'var(--color-warning)', tag: 'Вакцина', tagBg: '#FEF3C7', tagColor: '#92400E' },
      { time: '1 мес.', label: 'Первый осмотр педиатра', color: 'var(--color-primary)', tag: 'Визит', tagBg: 'var(--color-primary-light)', tagColor: 'var(--color-primary)' },
      { time: '2 мес.', label: 'АКДС + Полиомиелит + Пневмококк', color: 'var(--color-warning)', tag: 'Вакцина', tagBg: '#FEF3C7', tagColor: '#92400E' },
      { time: '3 мес.', label: 'АКДС + Полиомиелит (повтор)', color: 'var(--color-warning)', tag: 'Вакцина', tagBg: '#FEF3C7', tagColor: '#92400E' },
      { time: '4 мес.', label: 'АКДС + Полиомиелит + Пневмококк', color: 'var(--color-warning)', tag: 'Вакцина', tagBg: '#FEF3C7', tagColor: '#92400E' },
      { time: '6 мес.', label: 'Осмотр + ОАК + введение прикорма', color: 'var(--color-primary)', tag: 'Визит', tagBg: 'var(--color-primary-light)', tagColor: 'var(--color-primary)' },
      { time: '12 мес.', label: 'КПК (корь, паротит, краснуха)', color: 'var(--color-warning)', tag: 'Вакцина', tagBg: '#FEF3C7', tagColor: '#92400E' },
    ],
  },
  {
    id: 'toddler',
    label: '1 – 2 года',
    icon: 'lucide:footprints',
    info: [
      { value: '12', label: 'месяцев' },
      { value: '4', label: 'осмотра' },
      { value: '2', label: 'ревакцинации' },
      { value: '1', label: 'milestone-check' },
    ],
    events: [
      { time: '12 мес.', label: 'Годовой осмотр + специалисты', color: 'var(--color-primary)', tag: 'Визит', tagBg: 'var(--color-primary-light)', tagColor: 'var(--color-primary)' },
      { time: '15 мес.', label: 'Контрольный осмотр педиатра', color: 'var(--color-primary)', tag: 'Визит', tagBg: 'var(--color-primary-light)', tagColor: 'var(--color-primary)' },
      { time: '18 мес.', label: 'Ревакцинация АКДС + Полиомиелит', color: 'var(--color-warning)', tag: 'Вакцина', tagBg: '#FEF3C7', tagColor: '#92400E' },
      { time: '21 мес.', label: 'Контрольный осмотр педиатра', color: 'var(--color-primary)', tag: 'Визит', tagBg: 'var(--color-primary-light)', tagColor: 'var(--color-primary)' },
      { time: '24 мес.', label: 'Milestone-check: речь, моторика', color: 'var(--color-accent-blue)', tag: 'Развитие', tagBg: 'var(--color-accent-blue-light)', tagColor: 'var(--color-accent-blue)' },
      { time: '24 мес.', label: 'Ревакцинация Пневмококк', color: 'var(--color-warning)', tag: 'Вакцина', tagBg: '#FEF3C7', tagColor: '#92400E' },
    ],
  },
]

const currentEvents = computed(() => stages[activeStage.value]?.events ?? [])
</script>

<style scoped>
.journey-wrapper {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Stage tabs */
.stage-tabs {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.stage-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.stage-tab:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.stage-tab.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  box-shadow: 0 4px 16px rgba(139, 126, 200, 0.3);
}

/* Timeline */
.timeline-container {
  position: relative;
  padding: 0 24px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.timeline-track {
  position: absolute;
  top: 12px;
  left: 48px;
  right: 48px;
  height: 2px;
  background: var(--color-border);
  border-radius: 1px;
}

.timeline-events {
  display: flex;
  gap: 0;
  min-width: max-content;
  padding-bottom: 8px;
}

.event-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 160px;
  flex: 1;
  position: relative;
}

.event-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid var(--color-surface);
  box-shadow: 0 0 0 2px var(--color-border);
  z-index: 1;
  flex-shrink: 0;
}

.event-card {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  padding: 12px;
}

.event-week {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
}

.event-label {
  font-size: 13px;
  line-height: 1.4;
  color: var(--color-text-secondary);
  max-width: 140px;
}

.event-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  margin-top: 4px;
}

/* Stage info */
.stage-info {
  display: flex;
  justify-content: center;
  gap: 48px;
  padding: 24px 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.info-number {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.info-label {
  font-size: 13px;
  color: var(--color-text-muted);
  font-weight: 500;
}

@media (max-width: 768px) {
  .stage-info {
    gap: 24px;
    flex-wrap: wrap;
  }

  .info-number {
    font-size: 26px;
  }

  .event-node {
    min-width: 130px;
  }
}

/* Tab transition */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
