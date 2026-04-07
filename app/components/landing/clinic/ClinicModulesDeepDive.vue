<template>
  <LandingUiSectionWrapper
    badge="Модули"
    title="11 модулей — полная экосистема для клиники"
    subtitle="Каждый модуль решает конкретную задачу координатора, врача или руководителя"
  >
    <!-- Tabs -->
    <div class="module-tabs" data-reveal="fade-up">
      <button
        v-for="(tab, i) in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === i }]"
        @click="activeTab = i"
      >
        <Icon :name="tab.icon" class="tab-icon" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Module content -->
    <Transition name="tab-slide" mode="out-in">
      <div :key="activeTab" class="module-detail">
        <div class="module-info">
          <div class="module-number font-display">{{ String(activeTab + 1).padStart(2, '0') }}</div>
          <h3 class="module-name font-heading">{{ currentModule.title }}</h3>
          <p class="module-desc">{{ currentModule.desc }}</p>
          <div class="module-features">
            <div v-for="f in currentModule.features" :key="f" class="mf-item">
              <Icon name="lucide:check" class="mf-check" />
              <span>{{ f }}</span>
            </div>
          </div>
          <div class="module-roles">
            <span class="role-label">Роли:</span>
            <span v-for="r in currentModule.roles" :key="r" class="role-badge">{{ r }}</span>
          </div>
        </div>
        <div class="module-visual">
          <div class="mock-screen landing-card">
            <div class="mock-header">
              <div class="mock-dots">
                <span /><span /><span />
              </div>
              <span class="mock-title">{{ currentModule.title }}</span>
            </div>
            <div class="mock-body" :style="{ background: currentModule.mockBg }">
              <Icon :name="currentModule.icon" class="mock-icon" />
              <div v-for="line in currentModule.mockLines" :key="line" class="mock-line" :style="{ width: line }" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref(0)

const tabs = [
  { id: 'family', icon: 'lucide:users', label: 'Семья' },
  { id: 'care', icon: 'lucide:route', label: 'Маршрут' },
  { id: 'dashboard', icon: 'lucide:layout-dashboard', label: 'Сводка' },
  { id: 'appointments', icon: 'lucide:calendar-check', label: 'Записи' },
  { id: 'lab', icon: 'lucide:file-text', label: 'Документы' },
  { id: 'rx', icon: 'lucide:pill', label: 'Назначения' },
  { id: 'vaccine', icon: 'lucide:syringe', label: 'Прививки' },
  { id: 'coordinator', icon: 'lucide:headphones', label: 'Координатор' },
  { id: 'notifications', icon: 'lucide:bell', label: 'Уведомления' },
  { id: 'analytics', icon: 'lucide:bar-chart-3', label: 'Аналитика' },
  { id: 'admin', icon: 'lucide:settings', label: 'Админ' },
]

const modules = [
  {
    title: 'Семейный аккаунт',
    icon: 'lucide:users',
    desc: 'Единый аккаунт семьи: мама, папа, дети. Связь с клиникой, ролевой доступ. Мама контролирует, кто видит данные ребёнка.',
    features: ['Мульти-ребёнок (до 5 детей)', 'Приглашение второго родителя', 'Ролевой доступ (viewer / editor)', 'Привязка к клинике'],
    roles: ['Мама', 'Папа', 'Координатор'],
    mockBg: 'var(--color-primary-ultralight)',
    mockLines: ['80%', '60%', '90%', '40%'],
  },
  {
    title: 'Care Plan Engine',
    icon: 'lucide:route',
    desc: 'Автогенерация маршрута наблюдения по ЕДД/дате рождения. 40 недель беременности + 24 месяца ребёнка — каждое событие спланировано.',
    features: ['Автогенерация по шаблону', 'Этапы: Беременность → Младенец → Малыш', 'Автоэскалация при пропусках', 'Настройка маршрутов клиникой'],
    roles: ['Координатор', 'Врач', 'Админ'],
    mockBg: 'var(--color-secondary-light)',
    mockLines: ['90%', '70%', '50%', '85%', '60%'],
  },
  {
    title: 'Сводка маршрута',
    icon: 'lucide:layout-dashboard',
    desc: 'Визуальный таймлайн маршрута: прошлые, текущие и будущие события. Прогресс-бар, цветовая разметка статусов.',
    features: ['Горизонтальный timeline', 'Статусы: выполнено/просрочено/ожидание', 'Фильтр по типу события', 'Прогресс маршрута в %'],
    roles: ['Семья', 'Координатор'],
    mockBg: 'var(--color-accent-blue-light)',
    mockLines: ['70%', '85%', '40%', '95%'],
  },
  {
    title: 'Умная запись',
    icon: 'lucide:calendar-check',
    desc: 'Запись на визит с автоматическим напоминанием. Уведомление за 24ч и 2ч. Отмена/перенос в один клик.',
    features: ['Запись онлайн 24/7', 'Уведомления + WhatsApp напоминания', 'Автоматическая запись по маршруту', 'Отмена / перенос через приложение'],
    roles: ['Семья', 'Координатор'],
    mockBg: 'rgba(242,196,160,0.15)',
    mockLines: ['60%', '80%', '45%', '70%'],
  },
  {
    title: 'Медицинский архив',
    icon: 'lucide:file-text',
    desc: 'Облачное хранилище документов: анализы, УЗИ, выписки. Загрузка координатором или семьёй. Поиск, категоризация.',
    features: ['Загрузка фото и PDF', 'Категории: анализы, УЗИ, выписки', 'Поиск по дате и типу', 'Привязка к событию маршрута'],
    roles: ['Семья', 'Координатор', 'Врач'],
    mockBg: 'var(--color-primary-ultralight)',
    mockLines: ['50%', '75%', '90%', '30%', '65%'],
  },
  {
    title: 'Умные назначения',
    icon: 'lucide:pill',
    desc: 'Назначения врача с контролем приёма. Мама видит: что, когда, сколько. Напоминания о витаминах и лекарствах.',
    features: ['Список назначений с дозировкой', 'Напоминания о приёме', 'Отметка «принято» / «пропущено»', 'Контроль соблюдения для координатора'],
    roles: ['Семья', 'Врач', 'Координатор'],
    mockBg: 'var(--color-secondary-light)',
    mockLines: ['85%', '60%', '40%', '75%'],
  },
  {
    title: 'Календарь вакцинации',
    icon: 'lucide:syringe',
    desc: 'Национальный календарь прививок РК, рассчитанный по дате рождения. 18+ прививок за первые 2 года — ни одна не потеряется.',
    features: ['Автогенерация по нац. календарю', 'Напоминания за 7 дней и 1 день', 'Отметка: дата, серия, врач', 'Экспорт карты прививок'],
    roles: ['Семья', 'Координатор'],
    mockBg: 'var(--color-accent-blue-light)',
    mockLines: ['70%', '55%', '80%', '40%', '90%'],
  },
  {
    title: 'Панель координатора',
    icon: 'lucide:headphones',
    desc: 'Единое рабочее место: KPI, очередь задач, приоритеты, возврат семей. 200+ семей — каждая на виду.',
    features: ['Панель аналитики в реальном времени', 'Очередь задач с приоритизацией', 'Массовые уведомления', 'Фильтры: этап, статус, дни без визита'],
    roles: ['Координатор'],
    mockBg: 'rgba(242,196,160,0.15)',
    mockLines: ['90%', '70%', '60%', '85%', '45%'],
  },
  {
    title: 'Уведомления',
    icon: 'lucide:bell',
    desc: 'Мультиканальные уведомления: WhatsApp, SMS, в приложении. Шаблоны, расписания, автоматическая отправка по событиям маршрута.',
    features: ['WhatsApp, SMS', 'Центр уведомлений в приложении', 'Шаблоны с перменными ({имя}, {дата})', 'Автоотправка по событиям маршрута'],
    roles: ['Система', 'Координатор'],
    mockBg: 'var(--color-primary-ultralight)',
    mockLines: ['65%', '80%', '50%', '70%'],
  },
  {
    title: 'Аналитика клиники',
    icon: 'lucide:bar-chart-3',
    desc: 'Панель аналитики для руководителя: удержание когорт, LTV, NPS, загрузка координаторов. Данные для бизнес-решений.',
    features: ['Удержание по когортам', 'LTV и ARPU по семьям', 'NPS и удовлетворённость', 'Экспорт в CSV / PDF'],
    roles: ['Менеджер', 'Директор'],
    mockBg: 'var(--color-secondary-light)',
    mockLines: ['85%', '60%', '75%', '50%', '90%'],
  },
  {
    title: 'Администрирование',
    icon: 'lucide:settings',
    desc: 'Настройки клиники: брендирование, роли, маршруты, шаблоны уведомлений. Полный контроль над платформой.',
    features: ['Брендирование: логотип, цвета, домен', 'Управление ролями и правами', 'Настройка шаблонов маршрутов', 'Журнал всех действий'],
    roles: ['Администратор'],
    mockBg: 'var(--color-accent-blue-light)',
    mockLines: ['70%', '55%', '80%', '45%'],
  },
]

const currentModule = computed(() => modules[activeTab.value]!)
</script>

<style scoped>
.module-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 40px;
  justify-content: center;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tab-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.tab-icon {
  width: 16px;
  height: 16px;
}

.module-detail {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
  align-items: start;
}

.module-number {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-primary-light);
  line-height: 1;
  margin-bottom: 8px;
}

.module-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 12px;
}

.module-desc {
  font-size: 15px;
  line-height: 160%;
  color: var(--color-text-secondary);
  margin: 0 0 20px;
}

.module-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.mf-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.mf-check {
  width: 18px;
  height: 18px;
  color: var(--color-success);
  flex-shrink: 0;
  margin-top: 1px;
}

.module-roles {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.role-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.role-badge {
  padding: 4px 12px;
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
}

.mock-screen {
  overflow: hidden;
  padding: 0;
}

.mock-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-light);
}

.mock-dots {
  display: flex;
  gap: 5px;
}

.mock-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
}

.mock-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.mock-body {
  padding: 24px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
}

.mock-icon {
  width: 36px;
  height: 36px;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.mock-line {
  height: 10px;
  background: var(--color-border-light);
  border-radius: 5px;
}

.tab-slide-enter-active,
.tab-slide-leave-active {
  transition: all 0.25s ease;
}

.tab-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.tab-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (max-width: 768px) {
  .module-detail {
    grid-template-columns: 1fr;
  }
  .module-tabs {
    gap: 6px;
  }
  .tab-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
