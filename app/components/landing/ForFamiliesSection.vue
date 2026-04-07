<template>
  <LandingUiSectionWrapper
    id="for-families"
    badge="Для семей"
    title="Знаю, что дальше — каждый день"
    subtitle="Приложение клиники, которое ведёт вас по маршруту заботы с первого визита до 2 лет ребёнка"
  >
    <div class="families-layout">
      <!-- Phone mockup -->
      <div class="phone-mockup-area" data-reveal="fade-right">
        <div class="phone-outer">
          <div class="phone-inner">
            <!-- Screen tabs -->
            <div class="screen-tabs">
              <button
                v-for="(screen, i) in screens"
                :key="screen.id"
                :class="['screen-tab', { active: activeScreen === i }]"
                @click="activeScreen = i"
              >
                {{ screen.tab }}
              </button>
            </div>

            <!-- Screen content -->
            <div class="screen-content">
              <Transition name="screen-slide" mode="out-in">
                <div :key="screens[activeScreen]?.id" class="screen-view">
                  <div class="screen-title font-heading">{{ screens[activeScreen]?.title }}</div>
                  <div v-for="item in screens[activeScreen]?.items" :key="item.text" class="screen-item">
                    <span class="item-icon" :style="{ background: item.bg, color: item.color }">
                      <Icon :name="item.icon" size="14" />
                    </span>
                    <div class="item-content">
                      <span class="item-text font-heading">{{ item.text }}</span>
                      <span v-if="item.sub" class="item-sub">{{ item.sub }}</span>
                    </div>
                    <span v-if="item.badge" class="item-badge" :style="{ background: item.badgeBg, color: item.badgeColor }">
                      {{ item.badge }}
                    </span>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <!-- Benefits list -->
      <div class="family-benefits" data-stagger="fade-left">
        <div v-for="benefit in benefits" :key="benefit.title" class="fb-item">
          <div class="fb-icon" :style="{ background: benefit.bg }">
            <Icon :name="benefit.icon" size="22" :style="{ color: benefit.color }" />
          </div>
          <div>
            <h3 class="fb-title font-heading">{{ benefit.title }}</h3>
            <p class="fb-desc">{{ benefit.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeScreen = ref(0)

const screens = [
  {
    id: 'timeline',
    tab: 'Маршрут',
    title: 'Неделя 24 · 2 триместр',
    items: [
      { icon: 'lucide:check', text: 'УЗИ II триместра', sub: 'Завершено 15 марта', bg: 'rgba(124, 184, 212, 0.15)', color: 'var(--color-success)', badge: 'Done', badgeBg: 'rgba(124, 184, 212, 0.1)', badgeColor: 'var(--color-success)' },
      { icon: 'lucide:calendar-check', text: 'Тест на диабет', sub: 'Сегодня, 10:30', bg: 'var(--color-primary-light)', color: 'var(--color-primary)', badge: 'Сегодня', badgeBg: 'var(--color-primary-light)', badgeColor: 'var(--color-primary)' },
      { icon: 'lucide:stethoscope', text: 'Визит к гинекологу', sub: 'Через 5 дней', bg: 'var(--color-secondary-light)', color: 'var(--color-secondary)' },
      { icon: 'lucide:activity', text: 'УЗИ III триместра', sub: '30–32 неделя', bg: 'var(--color-accent-blue-light)', color: 'var(--color-accent-blue)' },
    ],
  },
  {
    id: 'pills',
    tab: 'Витамины',
    title: 'Назначения на сегодня',
    items: [
      { icon: 'lucide:pill', text: 'Фолиевая кислота 400 мкг', sub: '09:00 · Принята', bg: 'rgba(124, 184, 212, 0.15)', color: 'var(--color-success)', badge: '✓', badgeBg: 'rgba(124, 184, 212, 0.1)', badgeColor: 'var(--color-success)' },
      { icon: 'lucide:pill', text: 'Витамин D3 2000 ME', sub: '09:00 · Ожидает', bg: 'var(--color-warning)', color: '#92400E', badge: 'Принять', badgeBg: '#FEF3C7', badgeColor: '#92400E' },
      { icon: 'lucide:pill', text: 'Йодомарин 200 мкг', sub: '12:00', bg: 'var(--color-primary-light)', color: 'var(--color-primary)' },
      { icon: 'lucide:pill', text: 'Железо 30 мг', sub: '18:00', bg: 'var(--color-secondary-light)', color: 'var(--color-secondary)' },
    ],
  },
  {
    id: 'docs',
    tab: 'Документы',
    title: 'Медицинский архив',
    items: [
      { icon: 'lucide:file-text', text: 'Результат ОАК', sub: '12 марта 2026', bg: 'var(--color-primary-light)', color: 'var(--color-primary)' },
      { icon: 'lucide:file-text', text: 'УЗИ-скрининг II', sub: '15 марта 2026', bg: 'var(--color-accent-blue-light)', color: 'var(--color-accent-blue)' },
      { icon: 'lucide:file-text', text: 'Тройной тест', sub: '20 февраля 2026', bg: 'var(--color-secondary-light)', color: 'var(--color-secondary)' },
    ],
  },
]

const benefits = [
  {
    icon: 'lucide:route',
    title: 'Понятный маршрут',
    desc: 'Больше не нужно гадать «что дальше». Каждый визит, анализ и скрининг запланирован и виден в приложении.',
    bg: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
  },
  {
    icon: 'lucide:bell-ring',
    title: 'Напоминания вовремя',
    desc: 'Уведомления и WhatsApp напомнят о витаминах, визитах и анализах. Ничего не забудется.',
    bg: 'var(--color-secondary-light)',
    color: 'var(--color-secondary)',
  },
  {
    icon: 'lucide:folder',
    title: 'Всё в одном месте',
    desc: 'Анализы, УЗИ, выписки, справки — в едином архиве. Всегда под рукой, привязаны к маршруту.',
    bg: 'var(--color-accent-blue-light)',
    color: 'var(--color-accent-blue)',
  },
  {
    icon: 'lucide:shield-check',
    title: 'Национальный календарь',
    desc: 'Прививки по казахстанскому нацкалендарю. Уведомления заранее, история в цифровом формате.',
    bg: '#FEF3C7',
    color: '#92400E',
  },
  {
    icon: 'lucide:headphones',
    title: 'Координатор рядом',
    desc: 'Если что-то пропущено — координатор клиники свяжется с вами. Вы не одни на этом маршруте.',
    bg: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
  },
]
</script>

<style scoped>
.families-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 64px;
  align-items: center;
}

/* Phone mockup */
.phone-mockup-area {
  display: flex;
  justify-content: center;
}

.phone-outer {
  background: var(--color-surface);
  border-radius: 36px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  padding: 12px;
  width: 300px;
}

.phone-inner {
  border-radius: 26px;
  background: var(--color-bg);
  overflow: hidden;
}

.screen-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border-light);
}

.screen-tab {
  flex: 1;
  padding: 12px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: 2px solid transparent;
  font-family: 'Inter', sans-serif;
}

.screen-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.screen-content {
  padding: 16px;
  min-height: 340px;
}

.screen-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.screen-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  margin-bottom: 8px;
}

.item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-text {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-sub {
  font-size: 11px;
  color: var(--color-text-muted);
}

.item-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  flex-shrink: 0;
}

/* Benefits */
.family-benefits {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.fb-item {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.fb-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fb-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}

.fb-desc {
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-secondary);
  margin: 0;
}

@media (max-width: 1024px) {
  .families-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .phone-mockup-area {
    order: -1;
  }

  .phone-outer {
    width: 280px;
  }
}

.screen-slide-enter-active,
.screen-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.screen-slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.screen-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
