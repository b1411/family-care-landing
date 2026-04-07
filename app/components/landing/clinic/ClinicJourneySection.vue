<template>
  <LandingUiSectionWrapper
    badge="Путь пациента"
    title="Маршрут семьи — глазами координатора"
    subtitle="Что происходит на каждом этапе и как платформа помогает вашей команде"
    alternate
  >
    <div class="journey-timeline" ref="timelineRef">
      <div v-for="(stage, i) in stages" :key="stage.title" class="journey-stage" :data-reveal="i % 2 === 0 ? 'fade-right' : 'fade-left'">
        <div class="stage-marker">
          <div class="stage-dot" :style="{ background: stage.color }" />
          <div v-if="i < stages.length - 1" class="stage-line" />
        </div>
        <div class="stage-content landing-card hover-lift">
          <div class="stage-header">
            <div class="stage-icon-wrap" :style="{ background: stage.iconBg }">
              <Icon :name="stage.icon" class="stage-icon" />
            </div>
            <div>
              <h3 class="stage-title font-heading">{{ stage.title }}</h3>
              <span class="stage-period">{{ stage.period }}</span>
            </div>
          </div>
          <p class="stage-desc">{{ stage.desc }}</p>
          <div class="stage-actions">
            <div v-for="action in stage.coordinatorActions" :key="action" class="action-item">
              <Icon name="lucide:check-square" class="action-icon" />
              <span>{{ action }}</span>
            </div>
          </div>
          <div class="stage-family-view">
            <Icon name="lucide:eye" class="eye-icon" />
            <span class="family-label">Семья видит:</span>
            <span class="family-text">{{ stage.familySees }}</span>
          </div>
        </div>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const timelineRef = ref<HTMLElement | null>(null)

const stages = [
  {
    icon: 'lucide:user-plus',
    title: 'Регистрация семьи',
    period: 'День 1',
    color: 'var(--color-primary)',
    iconBg: 'var(--color-primary-light)',
    desc: 'Координатор создаёт семейный аккаунт и запускает маршрут. Система автоматически генерирует план наблюдения по ЕДД.',
    coordinatorActions: [
      'Создать семью в панели',
      'Указать ЕДД / дату рождения',
      'Выбрать шаблон маршрута',
      'Отправить приглашение маме',
    ],
    familySees: 'Маршрут с первыми событиями, приветственное сообщение, чек-лист анализов',
  },
  {
    icon: 'lucide:heart-pulse',
    title: 'Ведение беременности',
    period: '40 недель',
    color: 'var(--color-secondary)',
    iconBg: 'var(--color-secondary-light)',
    desc: 'Маршрут автоматически расставляет визиты, скрининги, УЗИ, анализы. Координатор получает задачи при пропусках.',
    coordinatorActions: [
      'Мониторинг выполнения событий',
      'Эскалация при пропуске скрининга',
      'Отправка напоминаний о витаминах',
      'Загрузка результатов анализов',
    ],
    familySees: 'Еженедельный прогресс, ближайшие события, напоминания, документы',
  },
  {
    icon: 'lucide:baby',
    title: 'Роды и выписка',
    period: 'Критическая точка',
    color: 'var(--color-danger)',
    iconBg: 'rgba(212,114,124,0.12)',
    desc: 'Самый критичный момент — переход от беременности к педиатрии. Без системы 40% семей теряются здесь.',
    coordinatorActions: [
      'Зафиксировать дату рождения',
      'Переключить маршрут на Infant (0-12 мес)',
      'Назначить первый педиатрический визит',
      'Отправить поздравление + план первого месяца',
    ],
    familySees: 'Новый маршрут ребёнка, календарь прививок, чек-лист первого месяца',
  },
  {
    icon: 'lucide:stethoscope',
    title: 'Грудничок (0-12 месяцев)',
    period: '12 месяцев',
    color: 'var(--color-accent-blue)',
    iconBg: 'var(--color-accent-blue-light)',
    desc: 'Ежемесячные визиты, вакцинация по нац. календарю, скрининги развития. Максимальная плотность событий.',
    coordinatorActions: [
      'Контроль вакцинации (18+ прививок)',
      'Напоминания о ежемесячных осмотрах',
      'Мониторинг развития ребёнка',
      'Возврат семей без визитов 30+ дней',
    ],
    familySees: 'Прогресс развития, следующая прививка, ближайший визит, анализы онлайн',
  },
  {
    icon: 'lucide:footprints',
    title: 'Малыш (1-2 года)',
    period: '12 месяцев',
    color: 'var(--color-accent-warm)',
    iconBg: 'rgba(242,196,160,0.25)',
    desc: 'Квартальные визиты, оставшиеся прививки, мониторинг развития речи и моторики. Маршрут адаптируется.',
    coordinatorActions: [
      'Квартальные напоминания о визитах',
      'Финальные прививки по календарю',
      'Скрининги: зрение, слух, развитие',
      'Отчёт руководству по удержанию когорты',
    ],
    familySees: 'Вехи развития, оставшиеся прививки, итоги 2 лет наблюдения',
  },
]
</script>

<style scoped>
.journey-timeline {
  max-width: var(--content-medium);
  margin: 0 auto;
}

.journey-stage {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
}

.stage-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
}

.stage-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 4px white, 0 0 0 5px var(--color-border-light);
}

.stage-line {
  width: 2px;
  flex: 1;
  background: var(--color-border);
  margin: 4px 0;
}

.stage-content {
  flex: 1;
  padding: 24px;
  margin-bottom: 16px;
}

.stage-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.stage-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stage-icon {
  width: 22px;
  height: 22px;
  color: var(--color-text-primary);
}

.stage-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.stage-period {
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.stage-desc {
  font-size: 14px;
  line-height: 160%;
  color: var(--color-text-secondary);
  margin: 0 0 16px;
}

.stage-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.action-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.action-icon {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 1px;
}

.stage-family-view {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: var(--color-primary-ultralight);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.eye-icon {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 1px;
}

.family-label {
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
}

.family-text {
  color: var(--color-text-secondary);
}

@media (max-width: 640px) {
  .stage-actions {
    grid-template-columns: 1fr;
  }
}
</style>
