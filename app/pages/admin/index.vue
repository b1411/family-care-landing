<template>
  <div class="adm-page">
    <!-- Hero -->
    <div class="adm-hero">
      <div class="hero-main">
        <div>
          <h1 class="adm-hero-title">Администрирование</h1>
          <p class="adm-hero-sub">Центр управления клиникой · {{ todayStr }}</p>
        </div>
        <div class="hero-live">
          <span class="live-dot" />
          <span class="live-label">Система в норме</span>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div v-for="k in kpis" :key="k.label" class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">{{ k.label }}</span>
          <span class="kpi-trend" :class="k.trend > 0 ? 'up' : k.trend < 0 ? 'down' : ''">
            {{ k.trend > 0 ? '+' : '' }}{{ k.trend }}%
          </span>
        </div>
        <span class="kpi-value">{{ k.value }}</span>
        <svg class="kpi-spark" viewBox="0 0 56 20" fill="none">
          <polyline :points="sparkPoints(k.sparkline)" stroke="var(--color-primary)" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>

    <!-- Alerts / Требует внимания -->
    <div v-if="alerts.length" class="card alerts-card">
      <div class="alerts-header">
        <h2 class="card-title" style="margin-bottom:0">
          <Icon name="lucide:bell-ring" size="16" style="color:var(--color-danger)" /> Требует внимания
        </h2>
        <span class="alerts-count">{{ alerts.length }}</span>
      </div>
      <div class="alerts-list">
        <NuxtLink v-for="a in alerts" :key="a.text" :to="a.to" class="alert-row" :class="`alert-row--${a.level}`">
          <Icon :name="a.icon" size="14" />
          <span class="alert-text">{{ a.text }}</span>
          <Icon name="lucide:arrow-right" size="12" class="alert-arrow" />
        </NuxtLink>
      </div>
    </div>

    <!-- CRM Navigation -->
    <div class="card">
      <h2 class="card-title"><Icon name="lucide:target" size="16" style="margin-right: 6px" />CRM & Продажи</h2>
      <div class="nav-grid">
        <NuxtLink v-for="item in crmNavItems" :key="item.to" :to="item.to" class="nav-item">
          <div class="nav-icon" :style="{ background: item.bg }">
            <Icon :name="item.icon" size="18" />
          </div>
          <div>
            <h3 class="nav-name">{{ item.name }}</h3>
            <p class="nav-desc">{{ item.desc }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Management Navigation -->
    <div class="card">
      <h2 class="card-title"><Icon name="lucide:settings" size="16" style="margin-right: 6px" />Управление</h2>
      <div class="nav-grid">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-item">
          <div class="nav-icon" :style="{ background: item.bg }">
            <Icon :name="item.icon" size="18" />
          </div>
          <div>
            <h3 class="nav-name">{{ item.name }}</h3>
            <p class="nav-desc">{{ item.desc }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const appData = useAppData()

const todayStr = computed(() => {
  const d = new Date()
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
})

// Simulated alerts based on KPI thresholds
const alerts = computed(() => {
  const list: { level: string; icon: string; text: string; to: string }[] = []
  const adm = appData.adminKpi
  if (adm.totalUsers.trend < 0) list.push({ level: 'warning', icon: 'lucide:trending-down', text: `Рост пользователей замедлился (${adm.totalUsers.trend}% за период)`, to: '/admin/analytics' })
  if (adm.monthlyAppointments.trend < -5) list.push({ level: 'danger', icon: 'lucide:calendar-x', text: `Число записей снизилось на ${Math.abs(adm.monthlyAppointments.trend)}%`, to: '/admin/analytics' })
  if (adm.activeFamilies.trend < 0) list.push({ level: 'warning', icon: 'lucide:users', text: `Активные семьи уменьшились`, to: '/admin/analytics/retention' })
  return list
})

function sparkPoints(pts: number[]): string {
  const max = Math.max(...pts, 1)
  return pts.map((v, i) => `${(i / Math.max(pts.length - 1, 1)) * 56},${20 - (v / max) * 18}`).join(' ')
}

const kpis = computed(() => [
  { label: 'Пользователей', value: appData.adminKpi.totalUsers.value, trend: appData.adminKpi.totalUsers.trend, sparkline: appData.adminKpi.totalUsers.sparkline },
  { label: 'Активных семей', value: appData.adminKpi.activeFamilies.value, trend: appData.adminKpi.activeFamilies.trend, sparkline: appData.adminKpi.activeFamilies.sparkline },
  { label: 'Врачей', value: appData.adminKpi.totalDoctors.value, trend: appData.adminKpi.totalDoctors.trend, sparkline: appData.adminKpi.totalDoctors.sparkline },
  { label: 'Записей/мес', value: appData.adminKpi.monthlyAppointments.value, trend: appData.adminKpi.monthlyAppointments.trend, sparkline: appData.adminKpi.monthlyAppointments.sparkline },
])

const crmNavItems = [
  { to: '/admin/leads', icon: 'lucide:user-plus', name: 'Лиды', desc: 'Воронка входящих', bg: 'rgba(139,126,200,0.1)' },
  { to: '/admin/deals', icon: 'lucide:handshake', name: 'Сделки', desc: 'Pipeline продаж', bg: 'rgba(168,200,232,0.12)' },
  { to: '/admin/family-360', icon: 'lucide:heart', name: 'Семья 360°', desc: 'Полный профиль', bg: 'rgba(232,160,191,0.1)' },
  { to: '/admin/campaigns', icon: 'lucide:megaphone', name: 'Кампании', desc: 'Массовые рассылки', bg: 'rgba(242,196,160,0.1)' },
  { to: '/admin/segments', icon: 'lucide:filter', name: 'Сегменты', desc: 'Целевые аудитории', bg: 'rgba(124,184,212,0.1)' },
  { to: '/admin/templates', icon: 'lucide:file-text', name: 'Шаблоны', desc: 'Сообщения и e-mail', bg: 'rgba(233,196,106,0.1)' },
  { to: '/admin/calls', icon: 'lucide:phone', name: 'Колл-центр', desc: 'Журнал звонков', bg: 'rgba(139,126,200,0.1)' },
  { to: '/admin/funnel', icon: 'lucide:trending-up', name: 'Воронка', desc: 'Аналитика конверсий', bg: 'rgba(168,200,232,0.12)' },
]

const navItems = [
  { to: '/admin/users', icon: 'lucide:users', name: 'Пользователи', desc: 'Учётные записи', bg: 'rgba(139,126,200,0.1)' },
  { to: '/admin/analytics', icon: 'lucide:line-chart', name: 'Аналитика', desc: 'KPI и метрики', bg: 'rgba(168,200,232,0.12)' },
  { to: '/admin/clinic', icon: 'lucide:building-2', name: 'Клиника', desc: 'Профиль и брендинг', bg: 'rgba(242,196,160,0.1)' },
  { to: '/admin/capacity', icon: 'lucide:bar-chart-3', name: 'Мощность', desc: 'Загрузка ресурсов', bg: 'rgba(168,200,232,0.12)' },
  { to: '/admin/compliance', icon: 'lucide:shield-check', name: 'Протоколы', desc: 'Соблюдение стандартов', bg: 'rgba(124,184,212,0.1)' },
  { to: '/admin/reputation', icon: 'lucide:star', name: 'Репутация', desc: 'NPS и отзывы', bg: 'rgba(233,196,106,0.1)' },
  { to: '/admin/packages', icon: 'lucide:package', name: 'Пакеты', desc: 'Сервисные пакеты', bg: 'rgba(139,126,200,0.1)' },
  { to: '/admin/outreach', icon: 'lucide:phone-call', name: 'Outreach', desc: 'Обзвон и SMS', bg: 'rgba(232,160,191,0.1)' },
  { to: '/admin/integrations', icon: 'lucide:plug', name: 'Интеграции', desc: 'API и webhooks', bg: 'rgba(168,200,232,0.12)' },
  { to: '/admin/network', icon: 'lucide:globe', name: 'Сеть', desc: 'Филиалы', bg: 'rgba(242,196,160,0.1)' },
  { to: '/admin/training', icon: 'lucide:graduation-cap', name: 'Обучение', desc: 'Персонал', bg: 'rgba(124,184,212,0.1)' },
  { to: '/admin/settings', icon: 'lucide:settings', name: 'Настройки', desc: 'Рабочие часы и пр.', bg: 'rgba(139,126,200,0.1)' },
]
</script>

<style scoped>
.adm-page { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }

.adm-hero {
  background: linear-gradient(135deg, rgba(139,126,200,0.08), rgba(232,160,191,0.06));
  border: 1px solid rgba(139,126,200,0.12); border-radius: 16px; padding: 28px;
}
.hero-main { display: flex; align-items: center; justify-content: space-between; }
.adm-hero-title { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; }
.adm-hero-sub { font-size: 0.82rem; color: var(--color-text-muted); margin-top: 4px; }
.hero-live { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: rgba(124,184,212,0.08); border: 1px solid rgba(124,184,212,0.2); border-radius: 20px; }
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-success); box-shadow: 0 0 0 3px rgba(124,184,212,0.2); animation: pulse 2s infinite; }
.live-label { font-size: 0.72rem; font-weight: 600; color: var(--color-success); }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

.alerts-card { border-color: rgba(212,114,124,0.15); background: rgba(212,114,124,0.02); }
.alerts-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.alerts-count { background: var(--color-danger); color: white; font-size: 0.68rem; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.alerts-list { display: flex; flex-direction: column; gap: 4px; }
.alert-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: inherit; font-size: 0.82rem; transition: background 0.15s; }
.alert-row:hover { background: rgba(212,114,124,0.06); }
.alert-row--danger { color: var(--color-danger); }
.alert-row--warning { color: var(--color-warning); }
.alert-text { flex: 1; }
.alert-arrow { opacity: 0.5; }

.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.kpi-card {
  background: white; border: 1px solid var(--color-border-light); border-radius: 14px; padding: 16px;
  display: flex; flex-direction: column; gap: 4px; position: relative; overflow: hidden;
}
.kpi-top { display: flex; align-items: center; justify-content: space-between; }
.kpi-label { font-size: 0.72rem; color: var(--color-text-muted); font-weight: 500; }
.kpi-trend { font-size: 0.68rem; font-weight: 700; font-family: var(--font-mono); }
.kpi-trend.up { color: var(--color-success); }
.kpi-trend.down { color: var(--color-danger); }
.kpi-value { font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); }
.kpi-spark { width: 100%; height: 20px; margin-top: 4px; }

.card { background: white; border: 1px solid var(--color-border-light); border-radius: 14px; padding: 20px; }
.card-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 14px; }

.nav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.nav-item {
  display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px;
  text-decoration: none; color: inherit; transition: background 0.15s;
}
.nav-item:hover { background: rgba(139,126,200,0.04); }
.nav-icon {
  width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center;
  justify-content: center; color: var(--color-primary); flex-shrink: 0;
}
.nav-name { font-size: 0.82rem; font-weight: 600; }
.nav-desc { font-size: 0.7rem; color: var(--color-text-muted); }
</style>
