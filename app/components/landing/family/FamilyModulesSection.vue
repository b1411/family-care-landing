<template>
  <LandingUiSectionWrapper
    id="modules"
    badge="Возможности"
    title="Что умеет приложение"
    subtitle="9 модулей, которые делают жизнь родителей проще каждый день"
  >
    <!-- Module selector -->
    <div class="module-tabs" data-reveal="fade-up">
      <button
        v-for="(m, i) in modules"
        :key="m.title"
        :class="['mod-tab', { active: activeModule === i }]"
        @click="switchModule(i)"
      >
        <div class="mod-tab-icon" :style="{ background: m.iconBg }">
          <Icon :name="m.icon" size="16" :style="{ color: m.iconColor }" />
        </div>
        <span class="mod-tab-label font-heading">{{ m.shortName }}</span>
      </button>
    </div>

    <!-- Module counter -->
    <div class="module-indicator" data-reveal="fade-up">
      <span class="indicator-current font-display">{{ String(activeModule + 1).padStart(2, '0') }}</span>
      <div class="indicator-bar">
        <div class="indicator-fill" :style="{ width: `${((activeModule + 1) / modules.length) * 100}%` }" />
      </div>
      <span class="indicator-total font-heading">{{ String(modules.length).padStart(2, '0') }}</span>
    </div>

    <!-- Active module detail -->
    <div class="module-detail" data-reveal="fade-up">
      <div :key="activeModule" class="detail-info" :class="{ 'detail-enter': isTransitioning }">
        <div class="detail-badge" :style="{ background: currentModule.iconBg, color: currentModule.iconColor }">
          <Icon :name="currentModule.icon" size="18" />
          {{ currentModule.title }}
        </div>
        <h3 class="detail-title font-heading">{{ currentModule.headline }}</h3>
        <p class="detail-desc">{{ currentModule.desc }}</p>
        <ul class="detail-features">
          <li v-for="(f, fi) in currentModule.features" :key="f" :style="{ transitionDelay: `${fi * 80 + 100}ms` }">
            <span class="feature-check">
              <Icon name="lucide:check" size="14" />
            </span>
            {{ f }}
          </li>
        </ul>
      </div>

      <div class="detail-phone">
        <div class="phone-glow" :style="{ background: currentModule.iconBg }" />
        <div class="phone-frame" :class="{ 'phone-enter': isTransitioning }">
          <div class="phone-notch" />
          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>{{ currentModule.phoneTime }}</span>
              <span class="font-heading">{{ currentModule.shortName }}</span>
              <span>●●●</span>
            </div>
            <div class="phone-content">
              <component :is="phoneScreens[activeModule]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { h, ref, computed, type Component } from 'vue'

const activeModule = ref(0)
const isTransitioning = ref(false)

function switchModule(i: number) {
  if (i === activeModule.value) return
  isTransitioning.value = true
  setTimeout(() => {
    activeModule.value = i
    requestAnimationFrame(() => {
      isTransitioning.value = false
    })
  }, 180)
}

const modules = [
  {
    icon: 'lucide:users',
    title: 'Family Account',
    shortName: 'Семья',
    headline: 'Вся семья в одном аккаунте',
    desc: 'Мама, папа, дети — каждый со своим профилем. Пригласите второго родителя и управляйте доступом.',
    features: ['Профили всех членов семьи', 'Приглашение второго родителя', 'Управление согласиями'],
    iconBg: 'var(--color-primary-light)',
    iconColor: 'var(--color-primary)',
    phoneTime: '09:41',
  },
  {
    icon: 'lucide:heart-pulse',
    title: 'Care Plan Engine',
    shortName: 'Маршрут',
    headline: 'Персональный маршрут вашего ребёнка',
    desc: 'Система автоматически рассчитывает план по дате рождения: визиты, анализы, прививки — всё по расписанию.',
    features: ['План рассчитан по датам ребёнка', 'Визиты и анализы запланированы', 'Автоматические напоминания'],
    iconBg: 'var(--color-secondary-light)',
    iconColor: 'var(--color-secondary)',
    phoneTime: '10:15',
  },
  {
    icon: 'lucide:layout-dashboard',
    title: 'Сводка маршрута',
    shortName: 'Сводка',
    headline: 'Где я сейчас и что дальше?',
    desc: 'Главный экран: прогресс маршрута, ближайшие события, задачи на сегодня. Всё видно с первого взгляда.',
    features: ['Прогресс-бар маршрута', 'Ближайшие события', 'Задачи на сегодня'],
    iconBg: 'var(--color-accent-blue-light)',
    iconColor: 'var(--color-accent-blue)',
    phoneTime: '08:00',
  },
  {
    icon: 'lucide:calendar-check',
    title: 'Умная запись',
    shortName: 'Визиты',
    headline: 'Запись на приём в 2 клика',
    desc: 'Записывайтесь из маршрута, получайте напоминания за 24ч и 2ч, заполняйте предвизитную анкету заранее.',
    features: ['Запись из маршрута', 'Напоминания + WhatsApp', 'Предвизитная анкета'],
    iconBg: 'var(--color-primary-light)',
    iconColor: 'var(--color-primary)',
    phoneTime: '14:30',
  },
  {
    icon: 'lucide:file-text',
    title: 'Медицинский архив',
    shortName: 'Документы',
    headline: 'Все документы — в одном месте',
    desc: 'Анализы, УЗИ, выписки. Фото с камеры или PDF. Привязаны к маршруту, никогда не потеряются.',
    features: ['Загрузка фото и PDF', 'Привязка к маршруту', 'Поиск по типу и дате'],
    iconBg: 'var(--color-accent-blue-light)',
    iconColor: 'var(--color-accent-blue)',
    phoneTime: '12:00',
  },
  {
    icon: 'lucide:pill',
    title: 'Умные назначения',
    shortName: 'Витамины',
    headline: 'Напоминания каждый день, вовремя',
    desc: 'Уведомления в нужное время. Подтверждение приёма в 1 клик. Контроль показывает статистику.',
    features: ['Уведомление в нужное время', 'Подтверждение в 1 клик', 'Контроль приёма'],
    iconBg: 'var(--color-secondary-light)',
    iconColor: 'var(--color-secondary)',
    phoneTime: '08:00',
  },
  {
    icon: 'lucide:shield-check',
    title: 'Календарь вакцинации',
    shortName: 'Прививки',
    headline: 'Все прививки в срок — без стресса',
    desc: 'Календарь по национальному календарю Казахстана. Напоминания за 3 дня. Полная история вакцинаций.',
    features: ['Нацкалендарь Казахстана', 'Напоминания заранее', 'История вакцинаций'],
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
    phoneTime: '11:00',
  },
  {
    icon: 'lucide:headphones',
    title: 'Координатор',
    shortName: 'Поддержка',
    headline: 'Координатор следит за вашим маршрутом',
    desc: 'Если вы пропустили визит или забыли о прививке — координатор клиники свяжется и поможет.',
    features: ['Персональный координатор', 'Помощь при пропусках', 'Welcome call при подключении'],
    iconBg: 'var(--color-primary-light)',
    iconColor: 'var(--color-primary)',
    phoneTime: '16:00',
  },
  {
    icon: 'lucide:bell',
    title: 'Уведомления',
    shortName: 'Уведомления',
    headline: 'Всегда в курсе — в удобном канале',
    desc: 'WhatsApp, в приложении. Настройте, как хотите получать уведомления.',
    features: ['Уведомления в приложении', 'WhatsApp напоминания', 'История уведомлений'],
    iconBg: 'var(--color-secondary-light)',
    iconColor: 'var(--color-secondary)',
    phoneTime: '09:00',
  },
]

const currentModule = computed(() => modules[activeModule.value]!)

// Simple phone screen renders using render functions
const PhoneFamily = () => h('div', { class: 'phone-list' }, [
  h('div', { class: 'phone-avatar-row' }, [
    h('div', { class: 'phone-avatar', style: 'background:var(--color-secondary-light)' }, '👩'),
    h('div', { class: 'phone-avatar-info' }, [
      h('strong', 'Айгерим (мама)'),
      h('span', 'Администратор'),
    ]),
  ]),
  h('div', { class: 'phone-avatar-row' }, [
    h('div', { class: 'phone-avatar', style: 'background:var(--color-primary-light)' }, '👨'),
    h('div', { class: 'phone-avatar-info' }, [
      h('strong', 'Нурлан (папа)'),
      h('span', 'Просмотр'),
    ]),
  ]),
  h('div', { class: 'phone-avatar-row' }, [
    h('div', { class: 'phone-avatar', style: 'background:#FEF3C7' }, '👶'),
    h('div', { class: 'phone-avatar-info' }, [
      h('strong', 'Алиса (6 мес)'),
      h('span', 'Активный маршрут'),
    ]),
  ]),
])

const PhoneCarePlan = () => h('div', { class: 'phone-list' }, [
  h('div', { class: 'phone-progress' }, [
    h('div', { class: 'phone-progress-bar', style: 'width:78%' }),
    h('span', { class: 'phone-progress-text' }, '78% пройдено'),
  ]),
  h('div', { class: 'phone-step done' }, '✓ 0-3 мес: неонатальный период'),
  h('div', { class: 'phone-step done' }, '✓ 3-6 мес: первые прикормы'),
  h('div', { class: 'phone-step current' }, '● 6-9 мес: активное развитие'),
  h('div', { class: 'phone-step' }, '○ 9-12 мес: первые шаги'),
])

const PhoneDashboard = () => h('div', { class: 'phone-list' }, [
  h('div', { class: 'phone-today' }, [
    h('strong', 'Сегодня'),
    h('div', { class: 'phone-task' }, '💊 Витамин D — 08:00'),
    h('div', { class: 'phone-task' }, '📋 Заполнить анкету'),
  ]),
  h('div', { class: 'phone-upcoming' }, [
    h('strong', 'Ближайшее'),
    h('div', { class: 'phone-task' }, '🏥 Педиатр — завтра 10:00'),
    h('div', { class: 'phone-task' }, '💉 АКДС #3 — через 3 дня'),
  ]),
])

const PhoneAppointments = () => h('div', { class: 'phone-list' }, [
  h('div', { class: 'phone-appt booked' }, [
    h('strong', 'Педиатр — проф. осмотр'),
    h('span', 'Завтра, 10:00 · каб. 204'),
    h('span', { class: 'phone-chip green' }, 'Подтверждён'),
  ]),
  h('div', { class: 'phone-appt' }, [
    h('strong', 'Невролог — плановый'),
    h('span', '25 янв, 14:00'),
    h('span', { class: 'phone-chip blue' }, 'Записан'),
  ]),
])

const PhoneDocuments = () => h('div', { class: 'phone-list' }, [
  h('div', { class: 'phone-doc' }, [
    h('span', { class: 'phone-doc-icon' }, '📄'),
    h('div', { class: 'phone-doc-info' }, [h('strong', 'ОАК'), h('span', '15.01.2026')]),
  ]),
  h('div', { class: 'phone-doc' }, [
    h('span', { class: 'phone-doc-icon' }, '🖼'),
    h('div', { class: 'phone-doc-info' }, [h('strong', 'УЗИ сердца'), h('span', '10.01.2026')]),
  ]),
  h('div', { class: 'phone-doc' }, [
    h('span', { class: 'phone-doc-icon' }, '📄'),
    h('div', { class: 'phone-doc-info' }, [h('strong', 'Выписка роддом'), h('span', '15.07.2025')]),
  ]),
])

const PhonePrescriptions = () => h('div', { class: 'phone-list' }, [
  h('div', { class: 'phone-rx done' }, [
    h('span', '✓'),
    h('div', [h('strong', 'Витамин D3'), h('span', '1 капля · утро')]),
  ]),
  h('div', { class: 'phone-rx pending' }, [
    h('span', '○'),
    h('div', [h('strong', 'Железо'), h('span', '1 мл · обед')]),
  ]),
  h('div', { class: 'phone-rx pending' }, [
    h('span', '○'),
    h('div', [h('strong', 'Омега-3'), h('span', '½ ч.л. · вечер')]),
  ]),
  h('div', { class: 'phone-streak' }, '🔥 Серия: 12 дней без пропусков'),
])

const PhoneVaccinations = () => h('div', { class: 'phone-list' }, [
  h('div', { class: 'phone-vax done' }, '✅ БЦЖ — при рождении'),
  h('div', { class: 'phone-vax done' }, '✅ Гепатит B #1 — при рождении'),
  h('div', { class: 'phone-vax done' }, '✅ АКДС #1 — 2 мес'),
  h('div', { class: 'phone-vax done' }, '✅ АКДС #2 — 4 мес'),
  h('div', { class: 'phone-vax upcoming' }, '📅 АКДС #3 — через 3 дня'),
  h('div', { class: 'phone-vax future' }, '○ КПК #1 — 12 мес'),
])

const PhoneCoordinator = () => h('div', { class: 'phone-list' }, [
  h('div', { class: 'phone-msg from' }, [
    h('strong', 'Координатор Асем'),
    h('p', 'Здравствуйте! Заметила, что визит к неврологу пропущен. Помочь перезаписать?'),
    h('span', { class: 'phone-msg-time' }, '15:42'),
  ]),
  h('div', { class: 'phone-msg to' }, [
    h('p', 'Да, пожалуйста! На следующую неделю.'),
    h('span', { class: 'phone-msg-time' }, '15:45'),
  ]),
])

const PhoneNotifications = () => h('div', { class: 'phone-list' }, [
  h('div', { class: 'phone-notif' }, [
    h('span', '💊'),
    h('div', [h('strong', 'Время витамина D'), h('span', '08:00 · push')]),
  ]),
  h('div', { class: 'phone-notif' }, [
    h('span', '🏥'),
    h('div', [h('strong', 'Визит завтра в 10:00'), h('span', '09:30 · WhatsApp')]),
  ]),
  h('div', { class: 'phone-notif' }, [
    h('span', '💉'),
    h('div', [h('strong', 'АКДС через 3 дня'), h('span', '15:00 · push')]),
  ]),
])

const phoneScreens: Component[] = [
  PhoneFamily,
  PhoneCarePlan,
  PhoneDashboard,
  PhoneAppointments,
  PhoneDocuments,
  PhonePrescriptions,
  PhoneVaccinations,
  PhoneCoordinator,
  PhoneNotifications,
]
</script>

<style scoped>
/* Module tabs */
.module-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}

.mod-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.mod-tab:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.mod-tab.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  box-shadow: 0 4px 16px rgba(139, 126, 200, 0.3);
  transform: translateY(-2px);
}

.mod-tab.active .mod-tab-label {
  color: white;
}

.mod-tab-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.3s;
}

.mod-tab.active .mod-tab-icon {
  background: rgba(255, 255, 255, 0.2) !important;
}

.mod-tab-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

/* Module indicator bar */
.module-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 240px;
  margin: 0 auto 32px;
}

.indicator-current {
  font-size: 20px;
  font-weight: 800;
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-width: 28px;
}

.indicator-bar {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: var(--color-border-light);
  overflow: hidden;
}

.indicator-fill {
  height: 100%;
  background: var(--gradient-cta);
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.indicator-total {
  font-size: 13px;
  color: var(--color-text-muted);
  min-width: 20px;
  text-align: right;
}

/* Module detail */
.module-detail {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 40px;
  align-items: center;
  max-width: var(--content-wide);
  margin: 0 auto;
}

/* Transition animation for detail info */
.detail-info {
  transition: opacity 0.2s, transform 0.2s;
}

.detail-info.detail-enter {
  opacity: 0;
  transform: translateY(8px);
}

.detail-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 14px;
}

.detail-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 12px;
  line-height: 1.2;
}

.detail-desc {
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0 0 20px;
}

.detail-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-features li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-primary);
  opacity: 1;
  transform: translateX(0);
  transition: opacity 0.3s, transform 0.3s;
}

.detail-enter .detail-features li {
  opacity: 0;
  transform: translateX(-6px);
}

.feature-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-primary);
}

/* Phone frame with glow */
.detail-phone {
  position: relative;
}

.phone-glow {
  position: absolute;
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
  transition: background 0.5s;
  pointer-events: none;
}

.phone-frame {
  width: 260px;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 28px;
  padding: 8px;
  margin: 0 auto;
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 1;
  transition: opacity 0.2s, transform 0.2s;
}

.phone-frame.phone-enter {
  opacity: 0;
  transform: scale(0.96);
}

.phone-notch {
  width: 80px;
  height: 6px;
  background: var(--color-border);
  border-radius: 4px;
  margin: 4px auto 6px;
}

.phone-screen {
  background: var(--color-bg);
  border-radius: 20px;
  overflow: hidden;
  min-height: 380px;
}

.phone-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  font-size: 11px;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}

.phone-content {
  padding: 12px;
}

/* Phone screen shared styles */
:deep(.phone-list) {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

:deep(.phone-avatar-row) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

:deep(.phone-avatar) {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

:deep(.phone-avatar-info) {
  display: flex;
  flex-direction: column;
}

:deep(.phone-avatar-info strong) {
  font-size: 13px;
  color: var(--color-text-primary);
}

:deep(.phone-avatar-info span) {
  font-size: 11px;
  color: var(--color-text-secondary);
}

:deep(.phone-progress) {
  position: relative;
  height: 20px;
  background: var(--color-surface);
  border-radius: 10px;
  overflow: hidden;
}

:deep(.phone-progress-bar) {
  height: 100%;
  background: var(--gradient-cta);
  border-radius: 10px;
  transition: width 0.5s ease;
}

:deep(.phone-progress-text) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-primary);
}

:deep(.phone-step) {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
}

:deep(.phone-step.done) {
  color: #22C55E;
  opacity: 0.8;
}

:deep(.phone-step.current) {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

:deep(.phone-today),
:deep(.phone-upcoming) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.phone-today strong),
:deep(.phone-upcoming strong) {
  font-size: 12px;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

:deep(.phone-task) {
  font-size: 12px;
  padding: 6px 8px;
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
}

:deep(.phone-appt) {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

:deep(.phone-appt strong) {
  font-size: 13px;
  color: var(--color-text-primary);
}

:deep(.phone-appt span) {
  font-size: 11px;
  color: var(--color-text-secondary);
}

:deep(.phone-chip) {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
  width: fit-content;
}

:deep(.phone-chip.green) {
  background: rgba(34, 197, 94, 0.15);
  color: #22C55E;
}

:deep(.phone-chip.blue) {
  background: var(--color-accent-blue-light);
  color: var(--color-accent-blue);
}

:deep(.phone-doc) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

:deep(.phone-doc-icon) {
  font-size: 20px;
}

:deep(.phone-doc-info) {
  display: flex;
  flex-direction: column;
}

:deep(.phone-doc-info strong) {
  font-size: 13px;
  color: var(--color-text-primary);
}

:deep(.phone-doc-info span) {
  font-size: 11px;
  color: var(--color-text-secondary);
}

:deep(.phone-rx) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

:deep(.phone-rx.done) span:first-child {
  color: #22C55E;
  font-size: 16px;
}

:deep(.phone-rx.pending) span:first-child {
  color: var(--color-text-secondary);
  font-size: 16px;
}

:deep(.phone-rx div strong) {
  font-size: 13px;
  color: var(--color-text-primary);
  display: block;
}

:deep(.phone-rx div span) {
  font-size: 11px;
  color: var(--color-text-secondary);
}

:deep(.phone-streak) {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  padding: 8px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: var(--radius-md);
  color: #22C55E;
}

:deep(.phone-vax) {
  font-size: 12px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
}

:deep(.phone-vax.done) {
  color: #22C55E;
}

:deep(.phone-vax.upcoming) {
  background: #FEF3C7;
  color: #92400E;
  font-weight: 600;
}

:deep(.phone-vax.future) {
  color: var(--color-text-secondary);
}

:deep(.phone-msg) {
  padding: 10px;
  border-radius: 12px;
  max-width: 90%;
}

:deep(.phone-msg.from) {
  background: var(--color-surface);
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

:deep(.phone-msg.to) {
  background: var(--color-primary-light);
  align-self: flex-end;
  border-bottom-right-radius: 4px;
  margin-left: auto;
}

:deep(.phone-msg strong) {
  font-size: 11px;
  color: var(--color-primary);
  display: block;
  margin-bottom: 4px;
}

:deep(.phone-msg p) {
  font-size: 12px;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.4;
}

:deep(.phone-msg-time) {
  font-size: 10px;
  color: var(--color-text-secondary);
  display: block;
  text-align: right;
  margin-top: 4px;
}

:deep(.phone-notif) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

:deep(.phone-notif) > span:first-child {
  font-size: 18px;
}

:deep(.phone-notif div strong) {
  font-size: 13px;
  color: var(--color-text-primary);
  display: block;
}

:deep(.phone-notif div span) {
  font-size: 11px;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .module-detail {
    grid-template-columns: 1fr;
  }

  .detail-phone {
    order: -1;
  }

  .mod-tab-label {
    display: none;
  }

  .mod-tab {
    padding: 6px;
  }
}
</style>
