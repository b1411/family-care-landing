<template>
  <div class="demo-family">
    <!-- Phase 4: Onboarding overlay (auto-shown on first visit) -->
    <AppFamilyDemoWelcomeOverlay ref="welcomeRef" storage-key="umai-demo-family-seen" />

    <!-- Phase 4: Floating sample-mode chip + replay-tour button -->
    <div class="demo-status-chip" role="status">
      <span class="status-chip-dot" aria-hidden="true" />
      <span class="status-chip-label font-mono">DEMO MODE</span>
      <button
        type="button"
        class="status-chip-action"
        :aria-label="'Показать тур заново'"
        @click="welcomeRef?.open()"
      >
        <Icon name="lucide:help-circle" size="13" />
        <span>Тур</span>
      </button>
    </div>

    <!-- Greeting -->
    <div class="demo-greeting">
      <span class="t-eyebrow demo-greeting-eyebrow">Сегодня · {{ todayLabel }}</span>
      <h1 class="t-display-section demo-greeting-title">
        Привет, <span class="t-accent-serif">Айгерим</span>!
      </h1>
      <p class="demo-greeting-sub">
        <Icon name="lucide:user-round" size="14" class="greeting-icon" />
        {{ children[0]?.first_name || 'Ваш ребёнок' }} · {{ childAge }}
        <span class="greeting-sep" aria-hidden="true">·</span>
        <Icon name="lucide:sparkles" size="13" class="greeting-icon greeting-icon-accent" />
        <span class="greeting-streak">{{ streaks.doses.current }} дней подряд без пропусков</span>
      </p>
    </div>

    <!-- Phase 4: Bento KPI grid -->
    <div class="bento-grid">
      <!-- Big card: Adherence today with progress ring + sparkline + AI insight -->
      <div class="bento-card bento-adherence">
        <div class="bento-card-head">
          <div class="bento-card-title-wrap">
            <span class="t-eyebrow bento-card-eyebrow">Адхеренс сегодня</span>
            <span class="bento-card-trend trend-up font-mono">
              <Icon name="lucide:trending-up" size="11" />
              +{{ familyKpi.adherence.trend }}% к прошлой неделе
            </span>
          </div>
          <span class="bento-card-time font-mono">{{ todayHourLabel }}</span>
        </div>

        <div class="adherence-body">
          <!-- Big ring on the left -->
          <div class="adherence-ring">
            <svg viewBox="0 0 160 160" class="ring-svg">
              <defs>
                <linearGradient id="adherenceGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#8B7EC8" />
                  <stop offset="100%" stop-color="#E8A0BF" />
                </linearGradient>
              </defs>
              <!-- Track -->
              <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(139,126,200,0.10)" stroke-width="12" />
              <!-- Fill (animated via dashoffset) -->
              <circle
                cx="80" cy="80" r="68" fill="none"
                stroke="url(#adherenceGrad)" stroke-width="12"
                stroke-linecap="round"
                transform="rotate(-90 80 80)"
                :stroke-dasharray="adherenceCircumference"
                :stroke-dashoffset="adherenceOffset"
                class="ring-fill"
              />
            </svg>
            <div class="ring-center">
              <span class="ring-percent t-kpi">{{ todayAdherencePercent }}<sup>%</sup></span>
              <span class="ring-sub font-mono">{{ todayTaken }} из {{ todayTotal }} доз</span>
            </div>
          </div>

          <!-- 7-day sparkline + AI insight -->
          <div class="adherence-details">
            <div class="adherence-sparkline">
              <span class="sparkline-label t-meta">7 дней</span>
              <svg viewBox="0 0 200 60" class="sparkline-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#8B7EC8" stop-opacity="0.35" />
                    <stop offset="100%" stop-color="#8B7EC8" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path :d="sparklineFillPath" fill="url(#sparkFill)" />
                <path :d="sparklineLinePath" fill="none" stroke="#8B7EC8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <!-- Day dots -->
                <g>
                  <circle
                    v-for="(d, i) in adherenceDays"
                    :key="i"
                    :cx="i * (200 / 6)"
                    :cy="60 - d * 0.6"
                    :r="i === 6 ? 4 : 2.5"
                    :fill="i === 6 ? '#E8A0BF' : '#8B7EC8'"
                  />
                </g>
              </svg>
              <div class="sparkline-days">
                <span v-for="d in dayLabels" :key="d">{{ d }}</span>
              </div>
            </div>

            <!-- AI insight badge -->
            <div class="adherence-insight">
              <div class="insight-icon">
                <Icon name="lucide:sparkles" size="14" />
              </div>
              <div class="insight-body">
                <span class="insight-title">Тренд недели</span>
                <span class="insight-text">Стабильный рост. Так держать — это поможет железу усвоиться.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card: Streak with mini heatmap -->
      <div class="bento-card bento-streak">
        <div class="bento-card-head">
          <span class="t-eyebrow bento-card-eyebrow">Streak</span>
          <Icon name="lucide:flame" size="16" class="bento-card-icon icon-flame" />
        </div>
        <div class="streak-big">
          <span class="t-kpi streak-number">{{ streaks.doses.current }}</span>
          <span class="streak-unit">дней</span>
        </div>
        <span class="streak-caption">подряд без пропусков</span>
        <!-- Mini 14-day heatmap -->
        <div class="streak-heatmap" :aria-label="`Активность за последние ${heatmapDays.length} дней`">
          <div
            v-for="(day, i) in heatmapDays"
            :key="i"
            class="heatmap-cell"
            :class="`heatmap-cell-l${day.level}`"
            :title="`${day.label}: ${day.taken}/${day.total} доз`"
          />
        </div>
        <span class="streak-record font-mono">Рекорд: {{ streaks.doses.best }} дн.</span>
      </div>

      <!-- Card: Journey progress -->
      <div class="bento-card bento-journey">
        <div class="bento-card-head">
          <span class="t-eyebrow bento-card-eyebrow">Маршрут</span>
          <Icon name="lucide:route" size="16" class="bento-card-icon" />
        </div>
        <div class="journey-percent">
          <span class="t-kpi journey-number">{{ familyKpi.journeyProgress.value }}<sup>%</sup></span>
        </div>
        <div class="journey-bar">
          <div class="journey-bar-fill" :style="{ width: `${familyKpi.journeyProgress.value}%` }" />
        </div>
        <div class="journey-meta">
          <span class="journey-meta-num font-mono">{{ familyKpi.completedEvents }}/{{ familyKpi.totalEvents }}</span>
          <span class="journey-meta-lbl">событий пройдено</span>
        </div>
        <!-- Mini step dots (10 dots = 10% steps) -->
        <div class="journey-steps">
          <span
            v-for="i in 10"
            :key="i"
            class="journey-step"
            :class="{ 'is-passed': i * 10 <= familyKpi.journeyProgress.value }"
          />
        </div>
      </div>

      <!-- Card: Next event countdown -->
      <div class="bento-card bento-next">
        <div class="bento-card-head">
          <span class="t-eyebrow bento-card-eyebrow">Следующее событие</span>
          <Icon name="lucide:calendar-clock" size="16" class="bento-card-icon" />
        </div>
        <div class="next-event-meta">
          <span class="t-kpi next-event-num">{{ familyKpi.nextEventDays }}</span>
          <span class="next-event-unit">{{ daysWord(familyKpi.nextEventDays) }}</span>
        </div>
        <div class="next-event-title t-h4">{{ nextEvent?.title || 'Приём гинеколога' }}</div>
        <div class="next-event-sub">
          <Icon name="lucide:stethoscope" size="13" />
          <span>{{ nextEvent?.description || 'Плановый осмотр' }}</span>
        </div>
        <button class="next-event-cta" type="button">
          Подробнее
          <Icon name="lucide:arrow-right" size="14" />
        </button>
      </div>
    </div>

    <!-- Phase 4.6: AI summary card — generated daily insights for the family -->
    <section class="demo-section">
      <AppFamilyDailyAiSummary />
    </section>

    <!-- Phase 4.3: Vertical 24h day-timeline for prescriptions -->
    <section class="demo-section day-timeline-section">
      <div class="section-head">
        <div>
          <span class="t-eyebrow section-eyebrow">Расписание дня</span>
          <h2 class="t-h3 section-h2">Назначения на сегодня</h2>
        </div>
        <div class="section-head-stats">
          <div class="head-stat">
            <span class="head-stat-num font-mono">{{ todayTaken }}/{{ todayTotal }}</span>
            <span class="head-stat-lbl">принято</span>
          </div>
          <div class="head-stat-divider" aria-hidden="true" />
          <div class="head-stat">
            <span class="head-stat-num font-mono">{{ pendingNowOrPast }}</span>
            <span class="head-stat-lbl">ожидают</span>
          </div>
        </div>
      </div>

      <div class="day-timeline">
        <!-- Spine — 24h vertical axis -->
        <div class="day-spine" aria-hidden="true">
          <!-- Hour markers every 4h -->
          <div
            v-for="h in [0, 4, 8, 12, 16, 20, 24]"
            :key="h"
            class="day-hour"
            :style="{ top: `${(h / 24) * 100}%` }"
          >
            <span class="day-hour-label font-mono">{{ String(h % 24).padStart(2, '0') }}:00</span>
            <span class="day-hour-tick" />
          </div>

          <!-- Sun (morning) icon at ~07:00 -->
          <div class="day-sky-icon day-sky-sun" :style="{ top: `${(7 / 24) * 100}%` }" aria-hidden="true">
            <Icon name="lucide:sun" size="14" />
          </div>
          <!-- Moon (night) icon at ~22:00 -->
          <div class="day-sky-icon day-sky-moon" :style="{ top: `${(22 / 24) * 100}%` }" aria-hidden="true">
            <Icon name="lucide:moon" size="13" />
          </div>

          <!-- Night-shade zones (00-06 and 22-24) -->
          <div class="day-shade day-shade-dawn" :style="{ height: `${(6 / 24) * 100}%` }" />
          <div class="day-shade day-shade-night" :style="{ top: `${(22 / 24) * 100}%`, height: `${(2 / 24) * 100}%` }" />

          <!-- "Now" marker — animated horizontal line -->
          <div class="day-now" :style="{ top: `${nowPercent}%` }">
            <span class="day-now-dot" />
            <span class="day-now-line" />
            <span class="day-now-label font-mono">сейчас · {{ nowLabel }}</span>
          </div>
        </div>

        <!-- Doses pinned at their hour positions -->
        <div class="day-doses">
          <button
            v-for="dose in allDoses"
            :key="dose.id"
            class="dose-pin"
            :class="[
              `dose-pin--${dose.state}`,
              { 'is-expanded': expandedDoseId === dose.id },
            ]"
            :style="{
              top: `${(dose.hour / 24) * 100}%`,
              '--dose-accent': dose.color,
            }"
            type="button"
            :aria-label="`${dose.medication} в ${dose.time}, ${dose.dosage}`"
            @click="toggleDoseExpand(dose.id)"
          >
            <!-- Connector to the spine -->
            <span class="dose-pin-connector" />

            <!-- Card -->
            <div class="dose-pin-card">
              <div class="dose-pin-top">
                <div class="dose-pin-icon">
                  <Icon
                    v-if="dose.state === 'taken'"
                    name="lucide:check"
                    size="14"
                  />
                  <Icon
                    v-else
                    name="lucide:pill"
                    size="14"
                  />
                </div>
                <div class="dose-pin-body">
                  <span class="dose-pin-time font-mono">{{ dose.time }}</span>
                  <span class="dose-pin-name">{{ dose.medication }}</span>
                  <span class="dose-pin-meta">{{ dose.dosage }} · {{ dose.frequency }}</span>
                </div>
                <span class="dose-pin-status" :class="`dose-pin-status--${dose.state}`">
                  {{ statusText(dose.state) }}
                </span>
              </div>

              <!-- Expanded detail (only when active) -->
              <div v-if="expandedDoseId === dose.id" class="dose-pin-detail" @click.stop>
                <div class="dose-detail-row">
                  <Icon name="lucide:info" size="13" class="dose-detail-icon" />
                  <span class="dose-detail-text">Принимать с водой за 15 минут до еды.</span>
                </div>
                <div class="dose-detail-row">
                  <Icon name="lucide:trending-up" size="13" class="dose-detail-icon" />
                  <span class="dose-detail-text">Адхеренс по препарату: <strong>{{ dose.adherence }}%</strong></span>
                </div>
                <div class="dose-detail-actions">
                  <button
                    v-if="dose.state !== 'taken'"
                    type="button"
                    class="dose-detail-btn dose-detail-btn-primary"
                    @click.stop="takeDose(dose.id)"
                  >
                    <Icon name="lucide:check" size="14" />
                    Принять сейчас
                  </button>
                  <button
                    v-if="dose.state === 'pending'"
                    type="button"
                    class="dose-detail-btn dose-detail-btn-ghost"
                    @click.stop="snoozeDose(dose.id)"
                  >
                    <Icon name="lucide:alarm-clock" size="14" />
                    Отложить 15 мин
                  </button>
                  <button
                    v-if="dose.state === 'taken'"
                    type="button"
                    class="dose-detail-btn dose-detail-btn-ghost"
                    @click.stop="undoTake(dose.id)"
                  >
                    <Icon name="lucide:undo-2" size="14" />
                    Отменить
                  </button>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Legend -->
      <div class="day-legend">
        <span class="legend-item">
          <span class="legend-swatch legend-swatch-taken" />
          Принято
        </span>
        <span class="legend-item">
          <span class="legend-swatch legend-swatch-pending" />
          Ожидает приёма
        </span>
        <span class="legend-item">
          <span class="legend-swatch legend-swatch-future" />
          Запланировано
        </span>
        <span class="legend-item legend-item--hint">
          <Icon name="lucide:mouse-pointer-click" size="12" />
          <span>Клик по карточке — детали</span>
        </span>
      </div>
    </section>

    <!-- Phase 4.4: Body health map — interactive child anatomy overview -->
    <section class="demo-section">
      <AppFamilyBodyHealthMap />
    </section>

    <!-- Phase 4.8: Upcoming events — horizontal scroll pill carousel -->
    <section class="demo-section">
      <div class="section-head section-head--inline">
        <div>
          <span class="t-eyebrow section-eyebrow">Маршрут</span>
          <h2 class="t-h3 section-h2">Ближайшие события</h2>
        </div>
        <div class="events-scroll-controls">
          <span class="events-hint">
            <Icon name="lucide:mouse-pointer-2" size="13" />
            Прокрутка
          </span>
          <button class="events-arrow-btn" type="button" :disabled="!canScrollLeft" aria-label="Назад" @click="scrollEvents(-1)">
            <Icon name="lucide:chevron-left" size="16" />
          </button>
          <button class="events-arrow-btn" type="button" :disabled="!canScrollRight" aria-label="Вперёд" @click="scrollEvents(1)">
            <Icon name="lucide:chevron-right" size="16" />
          </button>
        </div>
      </div>

      <div ref="eventsScrollRef" class="events-strip" @scroll.passive="onEventsScroll">
        <article
          v-for="(event, idx) in upcomingEvents"
          :key="event.id"
          class="event-pill"
          :class="[
            `event-pill--${event.status}`,
            { 'event-pill--featured': idx === 0 && event.status !== 'upcoming' },
          ]"
        >
          <!-- Days countdown column -->
          <div class="event-pill-days">
            <span class="event-pill-days-num font-mono">{{ daysUntilLabel(event.due_date).num }}</span>
            <span class="event-pill-days-unit">{{ daysUntilLabel(event.due_date).unit }}</span>
          </div>

          <div class="event-pill-divider" aria-hidden="true" />

          <!-- Content -->
          <div class="event-pill-content">
            <div class="event-pill-head">
              <div class="event-pill-icon">
                <Icon :name="eventIcon(event.type)" size="14" />
              </div>
              <span class="event-pill-status">{{ statusLabel(event.status) }}</span>
            </div>
            <h3 class="event-pill-title t-h4">{{ event.title }}</h3>
            <p class="event-pill-desc">{{ event.description }}</p>
            <div class="event-pill-foot">
              <span class="event-pill-date font-mono">{{ formatLongDate(event.due_date) }}</span>
              <button type="button" class="event-pill-cta">
                <span>Открыть</span>
                <Icon name="lucide:arrow-right" size="12" />
              </button>
            </div>
          </div>
        </article>

        <!-- Trailing "add event" placeholder -->
        <button class="event-pill event-pill--add" type="button" aria-label="Добавить событие">
          <div class="event-pill-add-icon">
            <Icon name="lucide:plus" size="22" />
          </div>
          <span class="event-pill-add-text">Добавить событие</span>
          <span class="event-pill-add-hint">консультация или анализ</span>
        </button>
      </div>
    </section>

    <!-- Phase 4.8: Vaccinations as a horizontal timeline -->
    <section class="demo-section">
      <div class="section-head section-head--inline">
        <div>
          <span class="t-eyebrow section-eyebrow">Иммунизация</span>
          <h2 class="t-h3 section-h2">Прививки по нац. календарю РК</h2>
        </div>
        <div class="vax-summary">
          <div class="vax-summary-row">
            <span class="vax-summary-num font-mono">{{ vaxDone }}/{{ vaccinations.length }}</span>
            <span class="vax-summary-lbl">выполнено</span>
          </div>
          <div class="vax-summary-bar">
            <div class="vax-summary-fill" :style="{ width: `${(vaxDone / vaccinations.length) * 100}%` }" />
          </div>
        </div>
      </div>

      <!-- Timeline rail -->
      <div class="vax-timeline">
        <!-- Track behind all dots -->
        <div class="vax-rail" aria-hidden="true">
          <div class="vax-rail-fill" :style="{ width: `${(vaxDone / vaccinations.length) * 100}%` }" />
        </div>

        <div class="vax-dots">
          <button
            v-for="(v, i) in vaccinations"
            :key="v.id"
            type="button"
            class="vax-dot"
            :class="[
              `vax-dot--${v.status}`,
              { 'is-selected': selectedVaxId === v.id },
            ]"
            :aria-label="`${v.name}, ${v.status === 'completed' ? 'выполнено ' + formatDate(v.date) : 'предстоит ' + formatDate(v.date)}`"
            @click="selectedVaxId = selectedVaxId === v.id ? null : v.id"
          >
            <span class="vax-dot-ring" />
            <span class="vax-dot-core">
              <Icon
                :name="v.status === 'completed' ? 'lucide:check' : 'lucide:syringe'"
                size="13"
              />
            </span>
            <span class="vax-dot-label font-mono">{{ shortVaxName(v.name) }}</span>
            <span class="vax-dot-date font-mono">{{ formatDate(v.date) }}</span>
          </button>
        </div>
      </div>

      <!-- Selected vaccine detail card -->
      <Transition name="vax-detail-fade">
        <div v-if="selectedVax" :key="selectedVax.id" class="vax-detail">
          <div class="vax-detail-icon" :data-status="selectedVax.status">
            <Icon :name="selectedVax.status === 'completed' ? 'lucide:shield-check' : 'lucide:syringe'" size="22" />
          </div>
          <div class="vax-detail-body">
            <div class="vax-detail-head">
              <div>
                <span class="t-eyebrow vax-detail-eyebrow">{{ selectedVax.status === 'completed' ? 'Выполнено' : 'Предстоит' }}</span>
                <h3 class="vax-detail-title t-h4">{{ selectedVax.name }}</h3>
              </div>
              <button class="vax-detail-close" type="button" aria-label="Закрыть" @click="selectedVaxId = null">
                <Icon name="lucide:x" size="14" />
              </button>
            </div>
            <div class="vax-detail-meta-row">
              <div class="vax-detail-meta">
                <Icon name="lucide:calendar" size="13" class="vax-meta-icon" />
                <span>{{ formatLongDate(selectedVax.date) }}</span>
              </div>
              <div v-if="selectedVax.batch" class="vax-detail-meta">
                <Icon name="lucide:package" size="13" class="vax-meta-icon" />
                <span class="font-mono">партия {{ selectedVax.batch }}</span>
              </div>
              <div class="vax-detail-meta">
                <Icon name="lucide:file-check-2" size="13" class="vax-meta-icon" />
                <span>доза {{ selectedVax.dose }}</span>
              </div>
            </div>
            <div class="vax-detail-actions">
              <button type="button" class="vax-detail-btn vax-detail-btn--primary">
                <Icon name="lucide:file-text" size="13" />
                {{ selectedVax.status === 'completed' ? 'Сертификат' : 'Подготовиться к приёму' }}
              </button>
              <button type="button" class="vax-detail-btn vax-detail-btn--ghost">
                <Icon name="lucide:bell" size="13" />
                Напомнить
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'demo' })

const {
  familyKpi, prescriptions, journeyEvents, vaccinations,
  children, streaks,
} = useMockData()

// Welcome overlay ref so we can re-open the tour from the chip
const welcomeRef = ref<{ open: () => void; close: () => void } | null>(null)

// Track dose statuses reactively — initialized from mock data
const doseStatuses = ref<Record<string, string>>({})
for (const rx of prescriptions) {
  for (const dose of rx.todayDoses) {
    doseStatuses.value[dose.id] = dose.status
  }
}

const todayTotal = computed(() => prescriptions.reduce((sum, rx) => sum + rx.todayDoses.length, 0))
const todayTaken = computed(() => Object.values(doseStatuses.value).filter(s => s === 'confirmed').length)
const todayAdherencePercent = computed(() => todayTotal.value ? Math.round((todayTaken.value / todayTotal.value) * 100) : 0)

const upcomingEvents = computed(() => journeyEvents.filter(e => e.status !== 'completed').slice(0, 5))
const nextEvent = computed(() => upcomingEvents.value[0])

// ─────────────────────────────────────────────
// Phase 4: Bento KPI helpers
// ─────────────────────────────────────────────

// Today date / hour label
const todayLabel = computed(() => {
  const d = new Date()
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
  const weekdays = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота']
  return `${weekdays[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
})

const todayHourLabel = computed(() => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

// Adherence circle math (r=68 -> circumference ~ 427)
const adherenceCircumference = 2 * Math.PI * 68
const adherenceOffset = computed(() => {
  return adherenceCircumference - (adherenceCircumference * todayAdherencePercent.value) / 100
})

// 7-day adherence sparkline (use mock or derive)
const adherenceDays = computed(() => {
  // Pull from familyKpi.adherence.sparkline if present, else fake plausible week
  const sp = familyKpi.adherence.sparkline as number[] | undefined
  if (sp && sp.length >= 7) return sp.slice(0, 7)
  return [82, 88, 91, 86, 92, 95, todayAdherencePercent.value]
})

const dayLabels = ['Пн','Вт','Ср','Чт','Пт','Сб','Сегодня']

const sparklineLinePath = computed(() => {
  const pts = adherenceDays.value.map((d, i) => `${i * (200 / 6)},${60 - d * 0.6}`)
  return `M ${pts.join(' L ')}`
})

const sparklineFillPath = computed(() => {
  const pts = adherenceDays.value.map((d, i) => `${i * (200 / 6)},${60 - d * 0.6}`)
  return `M 0,60 L ${pts.join(' L ')} L 200,60 Z`
})

// 14-day mini heatmap for streak card
interface HeatmapDay { taken: number; total: number; level: 0 | 1 | 2 | 3; label: string }
const heatmapDays = computed<HeatmapDay[]>(() => {
  const out: HeatmapDay[] = []
  const dayNames = ['вс','пн','вт','ср','чт','пт','сб']
  for (let i = 13; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    // Deterministic but varied: based on day-of-year mod
    const seed = (date.getDate() * 7 + date.getMonth() * 31) % 11
    const total = 5
    const taken = Math.min(total, Math.max(0, total - (seed > 8 ? 2 : seed > 6 ? 1 : 0)))
    const ratio = taken / total
    const level: 0 | 1 | 2 | 3 = ratio === 0 ? 0 : ratio < 0.6 ? 1 : ratio < 1 ? 2 : 3
    out.push({ taken, total, level, label: `${date.getDate()} (${dayNames[date.getDay()]})` })
  }
  return out
})

function daysWord(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if ([2,3,4].includes(mod10) && ![12,13,14].includes(mod100)) return 'дня'
  return 'дней'
}

// ─────────────────────────────────────────────
// Phase 4.3 — Vertical day-timeline helpers
// ─────────────────────────────────────────────

// "Now" position on the 24h vertical axis
const nowTick = ref(0)
const nowPercent = computed(() => {
  // Re-read on tick to keep reactive
  void nowTick.value
  const d = new Date()
  const hour = d.getHours() + d.getMinutes() / 60
  return (hour / 24) * 100
})

const nowLabel = computed(() => {
  void nowTick.value
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

// Tick once per minute so the "now" line stays accurate
let nowTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  nowTimer = setInterval(() => { nowTick.value++ }, 60_000)
})
onUnmounted(() => { if (nowTimer) clearInterval(nowTimer) })

// Currently expanded dose id (single-open accordion behaviour)
const expandedDoseId = ref<string | null>(null)
function toggleDoseExpand(id: string) {
  expandedDoseId.value = expandedDoseId.value === id ? null : id
}

interface TimelineDose {
  id: string
  rxId: string
  time: string
  hour: number              // 0–24 float
  medication: string
  dosage: string
  frequency: string
  adherence: number
  color: string
  state: 'taken' | 'pending' | 'future'
}

// Flatten all today's doses across prescriptions, attach state + position
const allDoses = computed<TimelineDose[]>(() => {
  void nowTick.value
  const now = new Date()
  const nowHour = now.getHours() + now.getMinutes() / 60
  const out: TimelineDose[] = []
  for (const rx of prescriptions) {
    for (const dose of rx.todayDoses) {
      const [hh, mm] = dose.time.split(':').map(Number)
      const hour = (hh ?? 0) + (mm ?? 0) / 60
      const taken = doseStatuses.value[dose.id] === 'confirmed'
      const state: TimelineDose['state'] = taken
        ? 'taken'
        : hour <= nowHour
          ? 'pending'
          : 'future'
      out.push({
        id: dose.id,
        rxId: rx.id,
        time: dose.time,
        hour,
        medication: rx.medication,
        dosage: rx.dosage,
        frequency: rx.frequency,
        adherence: rx.adherencePercent,
        color: rxColors[rx.id] || 'var(--color-primary)',
        state,
      })
    }
  }
  // Sort by hour ascending
  return out.sort((a, b) => a.hour - b.hour)
})

const pendingNowOrPast = computed(() => allDoses.value.filter(d => d.state === 'pending').length)

function statusText(state: TimelineDose['state']) {
  if (state === 'taken') return 'Принято'
  if (state === 'pending') return 'Принять'
  return 'Позже'
}

function snoozeDose(id: string) {
  // Demo behaviour: just collapse the card; in real product we'd schedule a reminder
  expandedDoseId.value = null
}

function undoTake(id: string) {
  doseStatuses.value[id] = 'pending'
}

// ─────────────────────────────────────────────
// Phase 4.8 — Events horizontal strip helpers
// ─────────────────────────────────────────────
const eventsScrollRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

function onEventsScroll() {
  const el = eventsScrollRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function scrollEvents(dir: number) {
  const el = eventsScrollRef.value
  if (!el) return
  el.scrollBy({ left: dir * 340, behavior: 'smooth' })
}

onMounted(() => {
  // Initial state — defer to make sure layout has computed
  nextTick(onEventsScroll)
})

interface DaysLabel { num: string; unit: string }
function daysUntilLabel(iso: string): DaysLabel {
  if (!iso) return { num: '—', unit: '' }
  const due = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return { num: 'СЕГ', unit: '' }
  if (diff < 0) return { num: String(Math.abs(diff)), unit: `${daysWord(Math.abs(diff))} назад` }
  return { num: String(diff), unit: daysWord(diff) }
}

function formatLongDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const wd = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  return `${wd[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
}

// ─────────────────────────────────────────────
// Phase 4.8 — Vaccinations timeline helpers
// ─────────────────────────────────────────────
const selectedVaxId = ref<string | null>(null)
const selectedVax = computed(() => vaccinations.find(v => v.id === selectedVaxId.value) || null)
const vaxDone = computed(() => vaccinations.filter(v => v.status === 'completed').length)

function shortVaxName(name: string): string {
  // Strip the parenthetical "(1-я)" etc — keep core name + dose number prefix
  const m = name.match(/^([A-Za-zА-Яа-я0-9\-]+)/)
  return m ? m[1]! : name
}

const childAge = computed(() => {
  if (!children[0]) return ''
  const birth = new Date(children[0].birth_date)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
  const days = now.getDate() - birth.getDate()
  return `${months} мес. ${days >= 0 ? days : 30 + days} дней`
})

function takeDose(id: string) {
  doseStatuses.value[id] = 'confirmed'
}

const rxColors: Record<string, string> = {
  rx1: 'var(--color-primary)',
  rx2: 'var(--color-secondary)',
  rx3: 'var(--color-accent-blue)',
  rx4: 'var(--color-success)',
}

function adherenceClass(val: number) {
  if (val >= 90) return 'adherence--success'
  if (val >= 70) return 'adherence--warning'
  return 'adherence--danger'
}

function eventColor(status: string) {
  const colors: Record<string, string> = {
    overdue: 'var(--color-danger)',
    due: 'var(--color-warning)',
    upcoming: 'var(--color-accent-blue)',
  }
  return colors[status] || 'var(--color-primary)'
}

function eventIcon(type: string) {
  const icons: Record<string, string> = {
    ultrasound: 'lucide:scan',
    analysis: 'lucide:flask-conical',
    screening: 'lucide:scan-search',
    checkup: 'lucide:stethoscope',
    vaccination: 'lucide:shield-check',
  }
  return icons[type] || 'lucide:calendar'
}

function statusLabel(status: string) {
  const labels: Record<string, string> = { overdue: 'Просрочено', due: 'Сегодня', upcoming: 'Скоро' }
  return labels[status] || status
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${d.getDate()} ${months[d.getMonth()]}`
}
</script>

<style scoped>
.demo-family {
  /* Phase 4: expanded width — bento needs space */
  max-width: 1120px;
  margin: 0 auto;
  position: relative;
}

/* ═══════════════════════════════════════════════
   Phase 4: Floating DEMO MODE chip (top-right)
   ═══════════════════════════════════════════════ */
.demo-status-chip {
  position: fixed;
  top: 96px;
  right: 24px;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 6px 6px 12px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(139, 126, 200, 0.18);
  border-radius: var(--radius-full);
  box-shadow:
    0 1px 2px rgba(75, 50, 130, 0.06),
    0 12px 32px -8px rgba(139, 126, 200, 0.18);
  font-size: 0.72rem;
  font-family: var(--font-mono);
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--color-text-primary);
}

.status-chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5BC0BE;
  box-shadow: 0 0 0 0 rgba(91, 192, 190, 0.5);
  animation: chip-pulse 2.2s ease-out infinite;
}

@keyframes chip-pulse {
  0% { box-shadow: 0 0 0 0 rgba(91, 192, 190, 0.5); }
  100% { box-shadow: 0 0 0 10px rgba(91, 192, 190, 0); }
}

.status-chip-label {
  color: var(--color-mint-dark, #3FA5A3);
}

.status-chip-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.10);
  color: var(--color-primary);
  border: none;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
  transition: background 0.2s ease;
}

.status-chip-action:hover {
  background: rgba(139, 126, 200, 0.18);
}

/* ═══════════════════════════════════════════════
   Greeting
   ═══════════════════════════════════════════════ */
.demo-greeting {
  margin-bottom: 32px;
}

.demo-greeting-eyebrow {
  display: inline-block;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.08);
  border: 1px solid rgba(139, 126, 200, 0.14);
  margin-bottom: 12px;
}

.demo-greeting-title {
  margin: 0 0 8px;
  color: var(--color-text-primary);
}

.demo-greeting-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.92rem;
  color: var(--color-text-secondary);
  margin: 0;
  flex-wrap: wrap;
}

.greeting-icon {
  color: var(--color-text-muted);
}

.greeting-icon-accent {
  color: var(--color-secondary);
}

.greeting-sep {
  color: var(--color-text-muted);
  opacity: 0.5;
  margin: 0 4px;
}

.greeting-streak {
  font-weight: 500;
  color: var(--color-text-primary);
}

/* ═══════════════════════════════════════════════
   Bento KPI grid
   ═══════════════════════════════════════════════
   Layout:
     col 1-2: adherence (big, spans 2 cols)
     col 3:   streak
     col 4:   journey
     col 5:   next event
   On narrower screens collapses to 2-col, then 1-col.
   ═══════════════════════════════════════════════ */

.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 36px;
}

.bento-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 1px 2px rgba(75, 50, 130, 0.03),
    0 8px 24px -8px rgba(139, 126, 200, 0.10);
  transition: box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.bento-card:hover {
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 4px 8px rgba(75, 50, 130, 0.04),
    0 16px 40px -8px rgba(139, 126, 200, 0.18);
  transform: translateY(-2px);
}

/* Subtle gradient sheen on hover */
.bento-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(139, 126, 200, 0.4) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}
.bento-card:hover::after { opacity: 1; }

.bento-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.bento-card-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bento-card-eyebrow {
  color: var(--color-text-muted);
}

.bento-card-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0;
}

.trend-up { color: var(--color-mint-dark, #3FA5A3); }
.trend-down { color: var(--color-danger); }

.bento-card-time {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.bento-card-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.icon-flame {
  color: var(--color-accent-warm);
  filter: drop-shadow(0 0 8px rgba(242, 196, 160, 0.6));
}

/* ───── Adherence card (spans 2 cols) ───── */
.bento-adherence {
  grid-column: span 2;
}

.adherence-body {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 24px;
  align-items: center;
}

.adherence-ring {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}

.ring-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 6px 20px rgba(139, 126, 200, 0.15));
}

.ring-fill {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.ring-percent {
  font-size: 2.4rem;
  font-weight: 500;
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.04em;
  line-height: 1;
}

.ring-percent sup {
  font-size: 1rem;
  vertical-align: super;
  font-weight: 500;
}

.ring-sub {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
}

.adherence-details {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.adherence-sparkline {
  position: relative;
}

.sparkline-label {
  display: block;
  margin-bottom: 6px;
}

.sparkline-svg {
  display: block;
  width: 100%;
  height: 60px;
  margin-bottom: 4px;
}

.sparkline-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-size: 0.65rem;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  text-align: center;
}

.sparkline-days span:last-child {
  color: var(--color-secondary-dark);
  font-weight: 600;
}

.adherence-insight {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.06), rgba(232, 160, 191, 0.06));
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: 12px;
}

.insight-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-cta);
  color: white;
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.4);
}

.insight-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.insight-title {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-primary-dark);
  letter-spacing: var(--tracking-snug);
}

.insight-text {
  font-size: 0.78rem;
  line-height: 1.45;
  color: var(--color-text-secondary);
}

/* ───── Streak card ───── */
.streak-big {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: auto;
}

.streak-number {
  font-size: 2.6rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
  line-height: 1;
}

.streak-unit {
  font-size: 1rem;
  color: var(--color-text-muted);
}

.streak-caption {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  margin-top: -6px;
}

.streak-heatmap {
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  gap: 3px;
  margin-top: 6px;
}

.heatmap-cell {
  aspect-ratio: 1;
  border-radius: 3px;
  transition: transform 0.2s ease;
}

.heatmap-cell:hover {
  transform: scale(1.18);
}

.heatmap-cell-l0 { background: rgba(139, 126, 200, 0.08); }
.heatmap-cell-l1 { background: rgba(139, 126, 200, 0.32); }
.heatmap-cell-l2 { background: rgba(139, 126, 200, 0.62); }
.heatmap-cell-l3 { background: linear-gradient(135deg, #8B7EC8, #E8A0BF); }

.streak-record {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  margin-top: 6px;
  letter-spacing: 0.04em;
}

/* ───── Journey card ───── */
.journey-percent {
  margin-top: auto;
}

.journey-number {
  font-size: 2.6rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #A8C8E8, #8B7EC8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
}

.journey-number sup {
  font-size: 1.2rem;
  vertical-align: super;
}

.journey-bar {
  height: 6px;
  border-radius: 3px;
  background: rgba(139, 126, 200, 0.10);
  overflow: hidden;
  margin-top: 6px;
}

.journey-bar-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #A8C8E8, #8B7EC8);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.journey-meta {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

.journey-meta-num {
  font-weight: 500;
  color: var(--color-primary);
  font-size: 0.85rem;
}

.journey-meta-lbl {
  color: var(--color-text-muted);
}

.journey-steps {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 3px;
  margin-top: 4px;
}

.journey-step {
  height: 4px;
  border-radius: 2px;
  background: rgba(139, 126, 200, 0.12);
  transition: background 0.4s ease;
}

.journey-step.is-passed {
  background: linear-gradient(90deg, #A8C8E8, #8B7EC8);
}

/* ───── Next event card ───── */
.bento-next {
  background: linear-gradient(160deg, #FBF6FF 0%, #FDF4F8 100%);
  border-color: rgba(232, 160, 191, 0.18);
}

.next-event-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: auto;
}

.next-event-num {
  font-size: 2.6rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: var(--color-secondary-dark);
  line-height: 1;
}

.next-event-unit {
  font-size: 1rem;
  color: var(--color-text-muted);
}

.next-event-title {
  margin: 0;
  color: var(--color-text-primary);
  /* Clamp to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.next-event-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

.next-event-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  background: white;
  color: var(--color-secondary-dark);
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid rgba(232, 160, 191, 0.28);
  cursor: pointer;
  align-self: flex-start;
  margin-top: 6px;
  transition: all 0.2s ease;
}

.next-event-cta:hover {
  background: var(--gradient-cta);
  color: white;
  border-color: transparent;
  transform: translateX(2px);
}

/* ═══════════════════════════════════════════════
   Bento responsive
   ═══════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .bento-adherence {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .demo-status-chip {
    top: auto;
    bottom: 16px;
    right: 16px;
  }
  .bento-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .bento-adherence {
    grid-column: span 1;
  }
  .adherence-body {
    grid-template-columns: 130px 1fr;
    gap: 16px;
  }
  .adherence-ring {
    width: 130px;
    height: 130px;
  }
  /* Phase 5.1: heatmap 14 → 7 cols on mobile */
  .streak-heatmap {
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }
  .ring-percent {
    font-size: 1.9rem;
  }
}

/* Sections */
.demo-section {
  margin-bottom: 36px;
}

.demo-section-title {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 16px;
}

/* ═══════════════════════════════════════════════
   Phase 4.3 — Vertical day-timeline
   ═══════════════════════════════════════════════ */

.day-timeline-section {
  background: linear-gradient(180deg, #FBF6FF 0%, #FFFFFF 100%);
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: var(--radius-xl);
  padding: 28px 32px 24px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 1px 2px rgba(75, 50, 130, 0.03),
    0 12px 32px -12px rgba(139, 126, 200, 0.10);
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.section-eyebrow {
  display: inline-block;
  margin-bottom: 6px;
}

.section-h2 {
  margin: 0;
  color: var(--color-text-primary);
}

.section-head-stats {
  display: flex;
  align-items: stretch;
  gap: 18px;
  padding: 10px 16px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: 14px;
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.10);
}

.head-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.head-stat-num {
  font-size: 1.15rem;
  font-weight: 500;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.head-stat-lbl {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  font-family: var(--font-display);
  font-weight: 600;
}

.head-stat-divider {
  width: 1px;
  background: var(--color-border-light);
}

/* ───── Timeline body ───── */
.day-timeline {
  position: relative;
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 24px;
  /* Height: 24 segments × 36px = 864px (full day) */
  min-height: 864px;
}

/* ─── Left spine ─── */
.day-spine {
  position: relative;
  height: 100%;
}

/* Hour-marker labels and ticks */
.day-hour {
  position: absolute;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-hour-label {
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  font-weight: 500;
}

.day-hour-tick {
  flex: 1;
  height: 1px;
  background: var(--color-border-light);
}

/* Sky icons (sun / moon) */
.day-sky-icon {
  position: absolute;
  right: -8px;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  z-index: 2;
}

.day-sky-sun {
  background: linear-gradient(135deg, #FFE2A8, #F2C4A0);
  color: #C4900E;
  box-shadow: 0 0 16px rgba(242, 196, 160, 0.5);
}

.day-sky-moon {
  background: linear-gradient(135deg, #E4DFF0, #8B7EC8);
  color: #4A4458;
  box-shadow: 0 0 14px rgba(139, 126, 200, 0.35);
}

/* Night-shade vertical regions */
.day-shade {
  position: absolute;
  left: 0;
  right: 8px;
  background: linear-gradient(180deg, rgba(75, 50, 130, 0.05), rgba(75, 50, 130, 0.01));
  border-radius: 6px;
  pointer-events: none;
}

.day-shade-dawn {
  top: 0;
}

.day-shade-night {
  /* top/height set inline */
}

/* "Now" line — bright moving horizontal indicator */
.day-now {
  position: absolute;
  left: -8px;
  right: -8px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  z-index: 3;
  pointer-events: none;
}

.day-now-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-secondary);
  box-shadow:
    0 0 0 3px rgba(232, 160, 191, 0.25),
    0 0 12px rgba(232, 160, 191, 0.55);
  flex-shrink: 0;
  animation: now-pulse 2s ease-in-out infinite;
}

@keyframes now-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(232, 160, 191, 0.25), 0 0 12px rgba(232, 160, 191, 0.55); }
  50% { box-shadow: 0 0 0 6px rgba(232, 160, 191, 0.15), 0 0 20px rgba(232, 160, 191, 0.75); }
}

.day-now-line {
  flex: 1;
  height: 1.5px;
  background: linear-gradient(90deg, var(--color-secondary), transparent);
  margin-left: 4px;
}

.day-now-label {
  font-size: 0.65rem;
  color: var(--color-secondary-dark);
  background: white;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(232, 160, 191, 0.30);
  margin-left: 6px;
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: 0.04em;
}

/* ─── Right column: dose pins ─── */
.day-doses {
  position: relative;
  min-height: 100%;
}

.dose-pin {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  /* Anchor: time marker is at TOP of the pin, so subtract a bit for visual centering */
  transform: translateY(-12px);
  transition: transform 0.25s ease;
}

.dose-pin:hover {
  z-index: 4;
}

.dose-pin:hover .dose-pin-card {
  transform: translateY(-2px);
  box-shadow:
    0 0 0 1px rgba(139, 126, 200, 0.16),
    0 4px 12px rgba(75, 50, 130, 0.06),
    0 16px 32px -8px rgba(139, 126, 200, 0.20);
}

/* Connector — small line from spine to card */
.dose-pin-connector {
  width: 24px;
  height: 1.5px;
  background: var(--dose-accent, var(--color-primary));
  flex-shrink: 0;
  position: relative;
  border-radius: 1px;
  opacity: 0.5;
}

.dose-pin-connector::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--dose-accent, var(--color-primary));
}

/* Card body */
.dose-pin-card {
  flex: 1;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 1px 2px rgba(75, 50, 130, 0.03),
    0 4px 12px -4px rgba(139, 126, 200, 0.10);
  transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
  overflow: hidden;
}

.dose-pin-top {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.dose-pin-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dose-accent, var(--color-primary));
  color: white;
  flex-shrink: 0;
  transition: background 0.3s ease, transform 0.3s ease;
}

.dose-pin-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.dose-pin-time {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
  font-weight: 500;
}

.dose-pin-name {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dose-pin-meta {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dose-pin-status {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  letter-spacing: 0;
  flex-shrink: 0;
}

.dose-pin-status--taken {
  background: rgba(91, 192, 190, 0.14);
  color: var(--color-mint-dark, #3FA5A3);
}

.dose-pin-status--pending {
  background: var(--gradient-cta);
  color: white;
  box-shadow: 0 0 0 0 rgba(139, 126, 200, 0.4);
  animation: pending-shimmer 2s ease-in-out infinite;
}

@keyframes pending-shimmer {
  0%, 100% { box-shadow: 0 0 0 0 rgba(139, 126, 200, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(139, 126, 200, 0); }
}

.dose-pin-status--future {
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-text-muted);
  border: 1px dashed rgba(139, 126, 200, 0.25);
}

/* State variants */
.dose-pin--taken .dose-pin-card {
  opacity: 0.62;
  background: rgba(255, 255, 255, 0.7);
}
.dose-pin--taken .dose-pin-icon {
  background: rgba(91, 192, 190, 0.2);
  color: var(--color-mint-dark, #3FA5A3);
}

.dose-pin--future .dose-pin-card {
  border-style: dashed;
  background: transparent;
  opacity: 0.85;
}

.dose-pin--future .dose-pin-icon {
  background: rgba(139, 126, 200, 0.10);
  color: var(--color-primary);
}

.dose-pin--pending .dose-pin-card {
  border-color: rgba(139, 126, 200, 0.30);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 2px 4px rgba(75, 50, 130, 0.04),
    0 12px 28px -8px rgba(139, 126, 200, 0.22);
}

.dose-pin.is-expanded {
  z-index: 5;
}

.dose-pin.is-expanded .dose-pin-card {
  border-color: rgba(139, 126, 200, 0.30);
  box-shadow:
    0 0 0 1px rgba(139, 126, 200, 0.20),
    0 8px 20px rgba(75, 50, 130, 0.06),
    0 24px 48px -12px rgba(139, 126, 200, 0.28);
}

/* Expanded detail panel */
.dose-pin-detail {
  padding-top: 12px;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dose-detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.dose-detail-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.dose-detail-text strong {
  color: var(--color-text-primary);
  font-weight: 600;
}

.dose-detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.dose-detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.dose-detail-btn-primary {
  background: var(--gradient-cta);
  color: white;
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.40);
}

.dose-detail-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -4px rgba(139, 126, 200, 0.55);
}

.dose-detail-btn-ghost {
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary);
}

.dose-detail-btn-ghost:hover {
  background: rgba(139, 126, 200, 0.16);
}

/* ───── Legend ───── */
.day-legend {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-light);
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

.legend-swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-swatch-taken { background: rgba(91, 192, 190, 0.18); border: 1px solid rgba(91, 192, 190, 0.4); }
.legend-swatch-pending { background: var(--gradient-cta); }
.legend-swatch-future {
  background: transparent;
  border: 1.5px dashed rgba(139, 126, 200, 0.4);
}

.legend-item--hint {
  margin-left: auto;
  color: var(--color-text-muted);
  font-size: 0.72rem;
}

/* ─── Mobile ─── */
@media (max-width: 720px) {
  .day-timeline-section {
    padding: 20px 16px 18px;
  }
  .day-timeline {
    grid-template-columns: 44px 1fr;
    gap: 10px;
    min-height: 520px;
  }
  .day-now-label {
    display: none;
  }
  .dose-pin-meta {
    display: none;
  }
  .dose-pin-status {
    padding: 4px 8px;
    font-size: 0.65rem;
  }
}

@media (max-width: 480px) {
  .day-timeline {
    min-height: 460px;
  }
  .day-hour {
    font-size: 0.62rem;
  }
}

/* ═══════════════════════════════════════════════
   Phase 4.8 — Events horizontal scroll strip
   ═══════════════════════════════════════════════ */

.section-head--inline {
  margin-bottom: 16px;
}

.events-scroll-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.events-hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.events-arrow-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.16);
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 1px 0 rgba(75, 50, 130, 0.04);
}

.events-arrow-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.4);
}

.events-arrow-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.events-strip {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 4px 4px 16px;
  margin: 0 -4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 126, 200, 0.20) transparent;
}

.events-strip::-webkit-scrollbar {
  height: 6px;
}

.events-strip::-webkit-scrollbar-thumb {
  background: rgba(139, 126, 200, 0.20);
  border-radius: 3px;
}

.events-strip::-webkit-scrollbar-track {
  background: transparent;
}

.event-pill {
  flex: 0 0 320px;
  scroll-snap-align: start;
  display: grid;
  grid-template-columns: 72px 1px 1fr;
  align-items: stretch;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  text-align: left;
  text-decoration: none;
  color: inherit;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 1px 2px rgba(75, 50, 130, 0.03),
    0 8px 24px -8px rgba(139, 126, 200, 0.10);
  transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.event-pill::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--color-primary);
  opacity: 0.45;
}

.event-pill--overdue {
  border-color: rgba(212, 114, 124, 0.30);
  background: linear-gradient(160deg, #FFFFFF 0%, #FDF1F2 100%);
}
.event-pill--overdue::before { background: var(--color-danger); opacity: 1; }

.event-pill--due {
  border-color: rgba(233, 196, 106, 0.30);
  background: linear-gradient(160deg, #FFFFFF 0%, #FDF9F0 100%);
}
.event-pill--due::before { background: #E0A370; opacity: 0.9; }

.event-pill--upcoming {
  /* default */
}
.event-pill--upcoming::before { background: var(--gradient-cta); opacity: 0.55; }

.event-pill:hover {
  transform: translateY(-3px);
  border-color: rgba(139, 126, 200, 0.30);
  box-shadow:
    0 4px 12px -4px rgba(75, 50, 130, 0.06),
    0 16px 40px -8px rgba(139, 126, 200, 0.20);
}

.event-pill--featured {
  flex: 0 0 380px;
  padding: 18px 24px;
  background: linear-gradient(160deg, #FFFFFF 0%, #FAF7FD 100%);
  border-color: rgba(139, 126, 200, 0.22);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 4px 12px -4px rgba(75, 50, 130, 0.04),
    0 24px 60px -12px rgba(139, 126, 200, 0.18);
}

/* Days column */
.event-pill-days {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding-right: 14px;
}

.event-pill-days-num {
  font-size: 1.65rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
  line-height: 1;
}

.event-pill--overdue .event-pill-days-num { color: var(--color-danger); }
.event-pill--due .event-pill-days-num { color: #C4930E; }

.event-pill-days-unit {
  font-size: 0.65rem;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  text-transform: uppercase;
  font-family: var(--font-display);
  font-weight: 600;
}

.event-pill-divider {
  background: var(--color-border-light);
}

.event-pill-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 16px;
  min-width: 0;
}

.event-pill-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.event-pill-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(139, 126, 200, 0.10);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.event-pill--overdue .event-pill-icon { background: rgba(212, 114, 124, 0.14); color: var(--color-danger); }
.event-pill--due .event-pill-icon { background: rgba(233, 196, 106, 0.18); color: #C4930E; }

.event-pill-status {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-text-muted);
}

.event-pill--overdue .event-pill-status { color: var(--color-danger); }
.event-pill--due .event-pill-status { color: #C4930E; }

.event-pill-title {
  margin: 2px 0 0;
  color: var(--color-text-primary);
  /* Clamp to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-pill-desc {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.45;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-pill-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--color-border-light);
  gap: 10px;
}

.event-pill-date {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  letter-spacing: 0.03em;
}

.event-pill-cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary);
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.event-pill-cta:hover {
  background: var(--gradient-cta);
  color: white;
  transform: translateX(2px);
}

/* "Add event" trailing card */
.event-pill--add {
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px;
  background: transparent;
  border: 1.5px dashed rgba(139, 126, 200, 0.30);
  cursor: pointer;
}

.event-pill--add::before {
  display: none;
}

.event-pill--add:hover {
  border-color: var(--color-primary);
  background: rgba(139, 126, 200, 0.04);
  transform: translateY(-3px);
}

.event-pill-add-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(139, 126, 200, 0.10);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.event-pill-add-text {
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.event-pill-add-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  text-align: center;
}

/* ═══════════════════════════════════════════════
   Phase 4.8 — Vaccinations horizontal timeline
   ═══════════════════════════════════════════════ */

.vax-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: 200px;
}

.vax-summary-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.vax-summary-num {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.vax-summary-lbl {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  font-family: var(--font-display);
  font-weight: 600;
}

.vax-summary-bar {
  width: 180px;
  height: 4px;
  background: rgba(139, 126, 200, 0.10);
  border-radius: 2px;
  overflow: hidden;
}

.vax-summary-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #5BC0BE, #8B7EC8);
  transition: width 0.6s ease;
}

/* Timeline body */
.vax-timeline {
  position: relative;
  background: linear-gradient(180deg, #FBF6FF 0%, #FFFFFF 100%);
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: var(--radius-lg);
  padding: 28px 24px 22px;
  overflow-x: auto;
  margin-bottom: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 126, 200, 0.20) transparent;
}

.vax-timeline::-webkit-scrollbar { height: 5px; }
.vax-timeline::-webkit-scrollbar-thumb { background: rgba(139, 126, 200, 0.20); border-radius: 3px; }

.vax-rail {
  position: absolute;
  top: 50%;
  left: 24px;
  right: 24px;
  height: 2px;
  background: rgba(139, 126, 200, 0.12);
  border-radius: 2px;
  transform: translateY(-1px);
  z-index: 0;
}

.vax-rail-fill {
  height: 100%;
  background: linear-gradient(90deg, #5BC0BE, #8B7EC8);
  border-radius: 2px;
}

.vax-dots {
  display: flex;
  gap: 32px;
  position: relative;
  z-index: 1;
  min-width: max-content;
  padding: 0 4px;
}

.vax-dot {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  min-width: 78px;
}

.vax-dot-ring {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(28px);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  pointer-events: none;
}

.vax-dot-core {
  position: relative;
  z-index: 2;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid;
  color: var(--color-primary);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  /* Lift this above the rail line */
  margin-top: 18px;
  margin-bottom: 4px;
}

.vax-dot--completed .vax-dot-core {
  background: linear-gradient(135deg, #5BC0BE, #3FA5A3);
  border-color: white;
  color: white;
  box-shadow:
    0 0 0 1px rgba(91, 192, 190, 0.20),
    0 4px 10px -2px rgba(91, 192, 190, 0.40);
}

.vax-dot--upcoming .vax-dot-core {
  background: white;
  border-color: rgba(139, 126, 200, 0.40);
  color: var(--color-primary);
  border-style: dashed;
}

.vax-dot:hover .vax-dot-core {
  transform: scale(1.12);
}

.vax-dot.is-selected .vax-dot-core {
  transform: scale(1.18);
  box-shadow:
    0 0 0 4px rgba(139, 126, 200, 0.25),
    0 0 0 1px var(--color-primary),
    0 6px 16px -4px rgba(139, 126, 200, 0.4);
}

.vax-dot.is-selected .vax-dot-ring {
  animation: vax-ring-pulse 1.8s ease-out infinite;
  background: currentColor;
  opacity: 0;
}

@keyframes vax-ring-pulse {
  0% { transform: translateX(-50%) translateY(28px) scale(0.8); opacity: 0.35; }
  100% { transform: translateX(-50%) translateY(28px) scale(1.8); opacity: 0; }
}

.vax-dot--completed { color: #5BC0BE; }
.vax-dot--upcoming { color: var(--color-primary); }

.vax-dot-label {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--color-text-primary);
  letter-spacing: 0;
  max-width: 90px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vax-dot--upcoming .vax-dot-label {
  color: var(--color-text-secondary);
}

.vax-dot-date {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
}

/* Vax detail card */
.vax-detail {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 16px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-lg);
  padding: 18px 22px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 8px 24px -8px rgba(139, 126, 200, 0.16);
}

.vax-detail-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.vax-detail-icon[data-status="completed"] {
  background: linear-gradient(135deg, #5BC0BE, #3FA5A3);
  box-shadow: 0 4px 12px -4px rgba(91, 192, 190, 0.45);
}

.vax-detail-icon[data-status="upcoming"] {
  background: var(--gradient-cta);
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.45);
}

.vax-detail-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.vax-detail-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.vax-detail-eyebrow {
  display: block;
  margin-bottom: 2px;
}

.vax-detail-title {
  margin: 0;
  color: var(--color-text-primary);
}

.vax-detail-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-text-muted);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.vax-detail-close:hover {
  background: rgba(139, 126, 200, 0.18);
  transform: rotate(90deg);
}

.vax-detail-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.82rem;
  color: var(--color-text-secondary);
}

.vax-detail-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.vax-meta-icon {
  color: var(--color-text-muted);
}

.vax-detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.vax-detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  border: none;
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  cursor: pointer;
  transition: all 0.2s ease;
}

.vax-detail-btn--primary {
  background: var(--gradient-cta);
  color: white;
  box-shadow: 0 4px 10px -4px rgba(139, 126, 200, 0.4);
}

.vax-detail-btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px -4px rgba(139, 126, 200, 0.5);
}

.vax-detail-btn--ghost {
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary);
}

.vax-detail-btn--ghost:hover {
  background: rgba(139, 126, 200, 0.16);
}

.vax-detail-fade-enter-active,
.vax-detail-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.vax-detail-fade-enter-from,
.vax-detail-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ─── Mobile ─── */
@media (max-width: 720px) {
  .event-pill,
  .event-pill--featured {
    flex: 0 0 280px;
    padding: 14px 16px;
  }
  .event-pill--add {
    flex: 0 0 200px;
  }
  .vax-summary {
    align-items: flex-start;
    min-width: 0;
  }
  .vax-detail {
    grid-template-columns: 1fr;
  }
  .vax-detail-icon {
    width: 44px;
    height: 44px;
  }
}

@media (max-width: 480px) {
  .demo-kpi-row {
    grid-template-columns: 1fr;
  }
}
</style>
