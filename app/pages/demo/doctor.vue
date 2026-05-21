<template>
  <div class="demo-doctor">
    <!-- Phase 6.1: Onboarding overlay -->
    <AppFamilyDemoWelcomeOverlay ref="welcomeRef" storage-key="umai-demo-doctor-seen" />

    <!-- Phase 6.1: Floating DEMO MODE chip -->
    <div class="demo-status-chip" role="status">
      <span class="status-chip-dot" aria-hidden="true" />
      <span class="status-chip-label font-mono">DEMO MODE</span>
      <button type="button" class="status-chip-action" aria-label="Показать тур заново" @click="welcomeRef?.open()">
        <Icon name="lucide:help-circle" size="13" />
        <span>Тур</span>
      </button>
    </div>

    <!-- Phase 6.1: Greeting -->
    <div class="demo-greeting">
      <span class="t-eyebrow demo-greeting-eyebrow">Врач · {{ todayLabel }}</span>
      <h1 class="t-display-section demo-greeting-title">
        Добрый день, <span class="t-accent-serif">доктор</span> Жумабаева!
      </h1>
      <p class="demo-greeting-sub">
        <Icon name="lucide:users-round" size="14" class="greeting-icon" />
        <span><strong>{{ doctorKpi.totalPatients }}</strong> пациентов</span>
        <span class="greeting-sep">·</span>
        <Icon name="lucide:calendar-check" size="13" class="greeting-icon greeting-icon-primary" />
        <span><strong>{{ doctorKpi.todayAppointments }}</strong> приёмов сегодня</span>
        <span class="greeting-sep">·</span>
        <Icon name="lucide:star" size="13" class="greeting-icon greeting-icon-warm" />
        <span class="greeting-streak">рейтинг <strong>{{ doctorKpi.avgRating }}</strong>/5</span>
      </p>
    </div>

    <!-- Phase 6.2: Bento KPI grid — doctor edition -->
    <div class="bento-grid">
      <!-- Big card: Next Visit (spans 2 cols) -->
      <div class="bento-card bento-next-visit">
        <div class="bento-card-head">
          <div class="bento-card-title-wrap">
            <span class="t-eyebrow bento-card-eyebrow">Следующий приём</span>
            <span class="bento-card-trend trend-primary">
              <Icon name="lucide:clock" size="11" />
              <span class="font-mono">через {{ nextVisitCountdown }}</span>
            </span>
          </div>
          <span class="bento-card-time font-mono">{{ nowLabel }}</span>
        </div>

        <div class="next-visit-body" v-if="nextSlot">
          <!-- Patient avatar + identity -->
          <div class="next-visit-patient">
            <div class="next-visit-avatar" :style="{ background: patientColor(nextSlot.patient_name || 'X') }">
              {{ initials(nextSlot.patient_name || 'Х П') }}
            </div>
            <div class="next-visit-id">
              <span class="next-visit-time t-kpi">{{ nextSlot.start_time }}</span>
              <span class="next-visit-name">{{ nextSlot.patient_name }}</span>
              <span class="next-visit-reason">
                <Icon name="lucide:stethoscope" size="11" />
                {{ nextSlot.reason }}
              </span>
            </div>
          </div>

          <!-- Quick context -->
          <div class="next-visit-context">
            <div class="ctx-row">
              <span class="ctx-label">Маршрут</span>
              <span class="ctx-value">Беременность · 22 неделя</span>
            </div>
            <div class="ctx-row">
              <span class="ctx-label">Адхеренс</span>
              <span class="ctx-value">
                <span class="ctx-pill ctx-pill--good">94%</span>
                <span class="ctx-pill-meta">7 дней</span>
              </span>
            </div>
            <div class="ctx-row">
              <span class="ctx-label">Алерты</span>
              <span class="ctx-value">
                <Icon name="lucide:check-circle-2" size="13" class="ctx-icon-good" />
                <span class="ctx-mute">нет</span>
              </span>
            </div>
            <div class="ctx-row">
              <span class="ctx-label">Документы</span>
              <span class="ctx-value">
                <Icon name="lucide:file-text" size="13" class="ctx-icon-doc" />
                <span class="ctx-mute">3 новых</span>
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="next-visit-actions">
            <button type="button" class="nv-action nv-action--primary">
              <Icon name="lucide:play" size="14" />
              Начать приём
            </button>
            <button type="button" class="nv-action nv-action--ghost">
              <Icon name="lucide:folder-open" size="14" />
              Карта пациента
            </button>
          </div>
        </div>
      </div>

      <!-- Card: Today appointments -->
      <div class="bento-card bento-appointments">
        <div class="bento-card-head">
          <span class="t-eyebrow bento-card-eyebrow">Приёмов</span>
          <Icon name="lucide:calendar-clock" size="16" class="bento-card-icon" />
        </div>
        <div class="appt-big">
          <span class="t-kpi appt-num">{{ doctorKpi.todayAppointments }}</span>
          <span class="appt-unit">визитов сегодня</span>
        </div>
        <div class="appt-breakdown">
          <div class="appt-row">
            <span class="appt-row-dot appt-row-dot--booked" />
            <span class="appt-row-label">Запланировано</span>
            <span class="appt-row-num font-mono">{{ bookedCount }}</span>
          </div>
          <div class="appt-row">
            <span class="appt-row-dot appt-row-dot--free" />
            <span class="appt-row-label">Свободные слоты</span>
            <span class="appt-row-num font-mono">{{ doctorKpi.freeSlots }}</span>
          </div>
          <div class="appt-row">
            <span class="appt-row-dot appt-row-dot--done" />
            <span class="appt-row-label">Завершено</span>
            <span class="appt-row-num font-mono">{{ doneCount }}</span>
          </div>
        </div>
        <!-- Mini bars day-of-week -->
        <div class="appt-week-bars">
          <div v-for="(d, i) in apptWeekBars" :key="i" class="appt-week-bar" :style="{ '--bar-h': `${d.h}%` }">
            <span class="appt-week-fill" />
            <span class="appt-week-label font-mono">{{ d.label }}</span>
          </div>
        </div>
      </div>

      <!-- Card: Patients at risk -->
      <div class="bento-card bento-risk">
        <div class="bento-card-head">
          <span class="t-eyebrow bento-card-eyebrow">Требуют внимания</span>
          <Icon name="lucide:alert-triangle" size="16" class="bento-card-icon icon-warn" />
        </div>
        <div class="risk-big">
          <span class="t-kpi risk-num">{{ atRiskPatients.length }}</span>
          <span class="risk-unit">из {{ doctorPatients.length }} пациентов</span>
        </div>
        <div class="risk-list">
          <button
            v-for="p in atRiskPatients.slice(0, 3)"
            :key="p.id"
            type="button"
            class="risk-row"
          >
            <span class="risk-avatar" :style="{ background: patientColor(p.mother_name) }">
              {{ initials(p.mother_name) }}
            </span>
            <span class="risk-info">
              <span class="risk-name">{{ p.mother_name }}</span>
              <span class="risk-reason">{{ riskReason(p) }}</span>
            </span>
            <span class="risk-arrow">
              <Icon name="lucide:arrow-right" size="13" />
            </span>
          </button>
        </div>
      </div>

      <!-- Card: Quality score -->
      <div class="bento-card bento-quality">
        <div class="bento-card-head">
          <span class="t-eyebrow bento-card-eyebrow">Качество</span>
          <Icon name="lucide:award" size="16" class="bento-card-icon" />
        </div>
        <div class="quality-percent">
          <span class="t-kpi quality-num">{{ qualityScore }}<sup>%</sup></span>
        </div>
        <span class="quality-trend trend-up">
          <Icon name="lucide:trending-up" size="11" />
          +2% за месяц
        </span>
        <!-- Breakdown bars -->
        <div class="quality-bars">
          <div v-for="b in qualityBars" :key="b.key" class="quality-bar">
            <div class="quality-bar-head">
              <span class="quality-bar-name">{{ b.label }}</span>
              <span class="quality-bar-val font-mono">{{ b.value }}<sup>%</sup></span>
            </div>
            <div class="quality-bar-track">
              <div class="quality-bar-fill" :style="{ width: `${b.value}%`, background: b.color }" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Phase 6.3 + 6.4: Schedule + Patients (two columns) -->
    <div class="doctor-grid">
      <!-- ─── Phase 6.3: Vertical day-schedule ─── -->
      <section class="schedule-section">
        <div class="section-head section-head--inline">
          <div>
            <span class="t-eyebrow section-eyebrow">Расписание</span>
            <h2 class="t-h3 section-h2">Сегодня</h2>
          </div>
          <div class="schedule-stats">
            <span class="schedule-stat">
              <span class="schedule-stat-num font-mono">{{ bookedCount }}</span>
              <span class="schedule-stat-lbl">занято</span>
            </span>
            <span class="schedule-stat-divider" />
            <span class="schedule-stat">
              <span class="schedule-stat-num font-mono">{{ doctorKpi.freeSlots }}</span>
              <span class="schedule-stat-lbl">свободно</span>
            </span>
          </div>
        </div>

        <div class="schedule-timeline">
          <!-- Hour spine -->
          <div class="schedule-spine">
            <div
              v-for="h in scheduleHours"
              :key="h"
              class="schedule-hour-mark"
              :style="{ top: `${((h - 8) / 9) * 100}%` }"
            >
              <span class="schedule-hour-label font-mono">{{ String(h).padStart(2, '0') }}:00</span>
              <span class="schedule-hour-tick" />
            </div>
            <!-- "Now" marker -->
            <div class="schedule-now" :style="{ top: `${schedulenowPercent}%` }">
              <span class="schedule-now-dot" />
              <span class="schedule-now-line" />
              <span class="schedule-now-label font-mono">сейчас · {{ nowLabel }}</span>
            </div>
          </div>

          <!-- Visit blocks -->
          <div class="schedule-visits">
            <article
              v-for="slot in todaySchedule"
              :key="slot.id"
              class="visit-block"
              :class="[
                slot.is_booked ? 'visit-block--booked' : 'visit-block--free',
                { 'visit-block--next': nextSlot && nextSlot.id === slot.id, 'visit-block--past': isSlotPast(slot) },
              ]"
              :style="{ top: `${slotTopPercent(slot)}%`, height: `${slotHeightPercent}%` }"
            >
              <span class="visit-block-time font-mono">{{ slot.start_time }}–{{ slot.end_time }}</span>
              <div v-if="slot.is_booked" class="visit-block-body">
                <div class="visit-block-row">
                  <span class="visit-block-avatar" :style="{ background: patientColor(slot.patient_name || 'X') }">
                    {{ initials(slot.patient_name || 'Х П') }}
                  </span>
                  <span class="visit-block-name">{{ slot.patient_name }}</span>
                  <span v-if="nextSlot && nextSlot.id === slot.id" class="visit-block-flag">
                    <span class="visit-block-flag-dot" />
                    Следующий
                  </span>
                </div>
                <span class="visit-block-reason">{{ slot.reason }}</span>
              </div>
              <div v-else class="visit-block-body visit-block-body--empty">
                <Icon name="lucide:plus-circle" size="14" />
                <span>Свободный слот · клик чтобы назначить</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- ─── Phase 6.4: Patients panel ─── -->
      <section class="patients-section">
        <div class="section-head section-head--inline">
          <div>
            <span class="t-eyebrow section-eyebrow">База</span>
            <h2 class="t-h3 section-h2">Мои пациенты</h2>
          </div>
          <!-- Filter pills -->
          <div class="patients-filters" role="tablist">
            <button
              v-for="f in patientFilters"
              :key="f.key"
              type="button"
              class="patients-filter"
              :class="{ 'is-active': patientFilter === f.key }"
              role="tab"
              :aria-selected="patientFilter === f.key"
              @click="patientFilter = f.key"
            >
              <span>{{ f.label }}</span>
              <span class="patients-filter-count font-mono">{{ filterCount(f.key) }}</span>
            </button>
          </div>
        </div>

        <div class="patients-list">
          <article
            v-for="p in filteredPatients"
            :key="p.id"
            class="patient-card"
          >
            <!-- Left: avatar + identity -->
            <div class="patient-head">
              <span class="patient-avatar" :style="{ background: patientColor(p.mother_name) }">
                {{ initials(p.mother_name) }}
              </span>
              <div class="patient-id">
                <span class="patient-name">{{ p.mother_name }}</span>
                <span class="patient-journey">
                  <span class="journey-pill" :class="`journey-pill--${journeyKey(p.journey_type)}`">
                    {{ p.journey_type }}
                  </span>
                  <span v-if="p.children?.[0]" class="patient-child">
                    <Icon name="lucide:baby" size="11" />
                    {{ p.children[0].name }}, {{ p.children[0].age }}
                  </span>
                </span>
              </div>
            </div>

            <!-- Middle: vitals sparkline + adherence -->
            <div class="patient-vitals">
              <div class="patient-vital">
                <span class="patient-vital-lbl t-meta">Адхеренс</span>
                <span class="patient-vital-val" :class="adherenceClass(adherenceFor(p.id))">
                  <span class="font-mono">{{ adherenceFor(p.id) }}<sup>%</sup></span>
                </span>
              </div>
              <svg viewBox="0 0 100 30" class="patient-spark" preserveAspectRatio="none">
                <path
                  :d="sparkPath(p.id)"
                  fill="none"
                  :stroke="adherenceFor(p.id) >= 80 ? '#5BC0BE' : adherenceFor(p.id) >= 60 ? '#E0A370' : '#D4727C'"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <!-- Right: dates + actions -->
            <div class="patient-meta">
              <div class="patient-meta-dates">
                <span class="patient-date">
                  <Icon name="lucide:rotate-ccw" size="11" />
                  <span class="font-mono">{{ formatDate(p.last_visit) }}</span>
                </span>
                <span class="patient-date patient-date--next">
                  <Icon name="lucide:arrow-right" size="11" />
                  <span class="font-mono">{{ formatDate(p.next_visit) }}</span>
                </span>
              </div>
              <div class="patient-actions">
                <button type="button" class="patient-fab" aria-label="Открыть карту">
                  <Icon name="lucide:folder-open" size="13" />
                </button>
                <button type="button" class="patient-fab" aria-label="Сообщение">
                  <Icon name="lucide:message-square" size="13" />
                </button>
                <button type="button" class="patient-fab patient-fab--primary" aria-label="Назначить визит">
                  <Icon name="lucide:calendar-plus" size="13" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- Phase 6.5: AI Daily Summary (reuse component, doctor-flavoured -->
    <section class="demo-section">
      <AppFamilyDailyAiSummary />
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'demo' })

const { doctorKpi, todaySchedule, doctorPatients } = useMockData()
const welcomeRef = ref<{ open: () => void; close: () => void } | null>(null)

// ─────────────────────────────────────────────
// Today / now labels
// ─────────────────────────────────────────────
const todayLabel = computed(() => {
  const d = new Date()
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
  const weekdays = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота']
  return `${weekdays[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
})

const nowTick = ref(0)
const nowLabel = computed(() => {
  void nowTick.value
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

let nowTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => { nowTimer = setInterval(() => { nowTick.value++ }, 60_000) })
onUnmounted(() => { if (nowTimer) clearInterval(nowTimer) })

// ─────────────────────────────────────────────
// Phase 6.2 — Schedule counts
// ─────────────────────────────────────────────
const bookedCount = computed(() => todaySchedule.filter(s => s.is_booked).length)
const doneCount = ref(2)  // demo: 2 visits already done

// Next visit — first booked slot whose end_time is in the future (or first booked if all past for demo)
const nextSlot = computed(() => {
  // For demo: take the first booked slot — countdown computed below works regardless
  return todaySchedule.find(s => s.is_booked) || null
})

function slotTimeAsMin(s: { start_time?: string; end_time?: string }, key: 'start_time' | 'end_time') {
  const t = s[key] || '00:00'
  const [hh, mm] = t.split(':').map(Number)
  return (hh ?? 0) * 60 + (mm ?? 0)
}

const nextVisitCountdown = computed(() => {
  void nowTick.value
  if (!nextSlot.value) return '—'
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  const startMin = slotTimeAsMin(nextSlot.value, 'start_time')
  let diff = startMin - nowMin
  // For demo: if visit is in the past, project a positive countdown to make it dramatic
  if (diff <= 0) diff = 27   // 27 minutes for visual interest
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h > 0) return `${h}ч ${m}м`
  return `${m} мин`
})

// Days-of-week mini bars
const apptWeekBars = computed(() => {
  const data = [
    { label: 'Пн', count: 7 },
    { label: 'Вт', count: 9 },
    { label: 'Ср', count: 6 },
    { label: 'Чт', count: 8 },
    { label: 'Пт', count: doctorKpi.todayAppointments },
    { label: 'Сб', count: 4 },
    { label: 'Вс', count: 0 },
  ]
  const max = Math.max(...data.map(d => d.count), 1)
  return data.map(d => ({ ...d, h: Math.round((d.count / max) * 100) }))
})

// ─────────────────────────────────────────────
// Phase 6.2 — Quality score
// ─────────────────────────────────────────────
const qualityScore = 96
interface QualityBar { key: string; label: string; value: number; color: string }
const qualityBars: QualityBar[] = [
  { key: 'a', label: 'Адхеренс назначений',  value: 92, color: 'linear-gradient(90deg, #5BC0BE, #8B7EC8)' },
  { key: 'b', label: 'Время приёма',          value: 88, color: 'linear-gradient(90deg, #8B7EC8, #E8A0BF)' },
  { key: 'c', label: 'Удовлетворённость',     value: 96, color: 'linear-gradient(90deg, #F2C4A0, #E8A0BF)' },
]

// ─────────────────────────────────────────────
// Phase 6.2 — At-risk patients
// ─────────────────────────────────────────────
const patientAdherence: Record<string, number> = {
  p1: 94, p2: 72, p3: 56, p4: 88,
}

function adherenceFor(id: string): number {
  return patientAdherence[id] ?? 80
}

const atRiskPatients = computed(() =>
  doctorPatients.filter(p => adherenceFor(p.id) < 75)
)

function riskReason(p: typeof doctorPatients[number]): string {
  const a = adherenceFor(p.id)
  if (a < 60) return `Адхеренс ${a}% · 3 дня не на связи`
  if (a < 75) return `Адхеренс ${a}% · пропущена доза`
  return 'Требует контроля'
}

// ─────────────────────────────────────────────
// Phase 6.3 — Schedule timeline
// ─────────────────────────────────────────────
// 09:00–17:00 window (9 hours total, indices 0-9)
const scheduleHours = [9, 10, 11, 12, 13, 14, 15, 16, 17]

function slotTopPercent(slot: { start_time?: string }): number {
  const min = slotTimeAsMin({ start_time: slot.start_time }, 'start_time')
  const startMin = 9 * 60
  const endMin = 17 * 60
  return Math.max(0, Math.min(100, ((min - startMin) / (endMin - startMin)) * 100))
}

const slotHeightPercent = 5.5  // ~30 min on 9-hour scale = 100/18

function isSlotPast(slot: { end_time?: string }): boolean {
  void nowTick.value
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  const endMin = slotTimeAsMin({ start_time: slot.end_time }, 'start_time')
  return endMin < nowMin
}

const schedulenowPercent = computed(() => {
  void nowTick.value
  const d = new Date()
  const h = d.getHours() + d.getMinutes() / 60
  if (h < 9) return 0
  if (h > 17) return 100
  return ((h - 9) / 8) * 100
})

// ─────────────────────────────────────────────
// Phase 6.4 — Patient cards
// ─────────────────────────────────────────────
type PatientFilter = 'all' | 'risk' | 'pregnant' | 'newborn'

const patientFilter = ref<PatientFilter>('all')

const patientFilters: { key: PatientFilter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'risk', label: 'Внимание' },
  { key: 'pregnant', label: 'Беременность' },
  { key: 'newborn', label: 'Младенцы' },
]

function filterCount(key: PatientFilter): number {
  if (key === 'all') return doctorPatients.length
  if (key === 'risk') return atRiskPatients.value.length
  if (key === 'pregnant') return doctorPatients.filter(p => /беременность/i.test(p.journey_type)).length
  if (key === 'newborn') return doctorPatients.filter(p => /младен|0-12|новорож/i.test(p.journey_type)).length
  return 0
}

const filteredPatients = computed(() => {
  if (patientFilter.value === 'all') return doctorPatients
  if (patientFilter.value === 'risk') return atRiskPatients.value
  if (patientFilter.value === 'pregnant') return doctorPatients.filter(p => /беременность/i.test(p.journey_type))
  if (patientFilter.value === 'newborn') return doctorPatients.filter(p => /младен|0-12|новорож/i.test(p.journey_type))
  return doctorPatients
})

function journeyKey(j: string): string {
  if (/беремен/i.test(j)) return 'pregnant'
  if (/младен|0-12|новорож/i.test(j)) return 'newborn'
  if (/тоддл|1-2/i.test(j)) return 'toddler'
  if (/послерод/i.test(j)) return 'postpartum'
  return 'other'
}

function adherenceClass(val: number): string {
  if (val >= 80) return 'adh-good'
  if (val >= 60) return 'adh-warn'
  return 'adh-danger'
}

// Sparkline path — deterministic per patient
function sparkPath(id: string): string {
  // 8 points, plausible adherence shape
  const seedSum = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const points = Array.from({ length: 8 }, (_, i) => {
    const v = 60 + Math.sin((seedSum + i * 7) / 4) * 18 + i * 1.5
    return Math.max(20, Math.min(95, v))
  })
  // Map 0-100 → 30..2 on y
  const w = 100, h = 30
  const dx = w / (points.length - 1)
  return points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * dx},${h - (v / 100) * (h - 4) - 2}`).join(' ')
}

// ─────────────────────────────────────────────
// Avatar helpers (shared with coordinator)
// ─────────────────────────────────────────────
const patientPalette = ['#8B7EC8', '#E8A0BF', '#5BC0BE', '#F2C4A0', '#A8C8E8']
function patientColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return patientPalette[Math.abs(h) % patientPalette.length]!
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')
}

function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${d.getDate()} ${months[d.getMonth()]}`
}
</script>

<style scoped>
.demo-doctor {
  position: relative;
  max-width: 1120px;
  margin: 0 auto;
}

/* ─── DEMO chip (shared) ─── */
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
  box-shadow: 0 1px 2px rgba(75, 50, 130, 0.06), 0 12px 32px -8px rgba(139, 126, 200, 0.18);
  font-size: 0.72rem;
  font-family: var(--font-mono);
  font-weight: 500;
  letter-spacing: 0.08em;
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

.status-chip-label { color: var(--color-mint-dark, #3FA5A3); }

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
  text-transform: none;
  letter-spacing: 0;
  transition: background 0.2s ease;
}

.status-chip-action:hover { background: rgba(139, 126, 200, 0.18); }

/* ─── Greeting ─── */
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

.demo-greeting-sub strong { color: var(--color-text-primary); font-weight: 600; }
.greeting-icon { color: var(--color-text-muted); }
.greeting-icon-primary { color: var(--color-primary); }
.greeting-icon-warm { color: #C4870E; }
.greeting-sep { color: var(--color-text-muted); opacity: 0.5; margin: 0 4px; }

/* ═══════════════════════════════════════════════
   Phase 6.2 — Bento KPI grid
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
  transform: translateY(-2px);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 4px 8px rgba(75, 50, 130, 0.04),
    0 16px 40px -8px rgba(139, 126, 200, 0.18);
}

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

.bento-card-eyebrow { color: var(--color-text-muted); }

.bento-card-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.trend-up { color: var(--color-mint-dark, #3FA5A3); }
.trend-primary {
  color: var(--color-primary);
  background: rgba(139, 126, 200, 0.10);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.bento-card-time {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.bento-card-icon { color: var(--color-text-muted); }
.icon-warn { color: #E0A370; filter: drop-shadow(0 0 6px rgba(224, 163, 112, 0.4)); }

/* ───── Next-visit card (spans 2 cols) — main hero ───── */
.bento-next-visit {
  grid-column: span 2;
  background:
    radial-gradient(ellipse at top right, rgba(139, 126, 200, 0.06), transparent 55%),
    linear-gradient(180deg, #FFFFFF 0%, #FAF7FD 100%);
  border-color: rgba(139, 126, 200, 0.18);
}

.next-visit-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: 22px;
  align-items: stretch;
}

.next-visit-patient {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: white;
  border-radius: 14px;
  border: 1px solid rgba(139, 126, 200, 0.10);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.85) inset, 0 4px 12px -4px rgba(139, 126, 200, 0.10);
}

.next-visit-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.5rem;
  color: white;
  letter-spacing: 0;
  box-shadow:
    0 0 0 3px white,
    0 0 0 4px rgba(139, 126, 200, 0.18),
    0 6px 16px -4px rgba(75, 50, 130, 0.18);
}

.next-visit-id {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.next-visit-time {
  font-size: 2.4rem;
  font-weight: 500;
  letter-spacing: -0.04em;
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
}

.next-visit-name {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: var(--tracking-snug);
}

.next-visit-reason {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.82rem;
  color: var(--color-text-secondary);
}

.next-visit-context {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ctx-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: center;
  gap: 12px;
  padding: 7px 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: 10px;
  font-size: 0.82rem;
}

.ctx-label {
  font-family: var(--font-display);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-text-muted);
  font-weight: 600;
}

.ctx-value {
  color: var(--color-text-primary);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ctx-pill {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  letter-spacing: 0;
}

.ctx-pill--good {
  background: rgba(91, 192, 190, 0.12);
  color: var(--color-mint-dark, #3FA5A3);
}

.ctx-pill-meta {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.ctx-icon-good { color: var(--color-mint-dark, #3FA5A3); }
.ctx-icon-doc { color: var(--color-primary); }
.ctx-mute { color: var(--color-text-muted); font-size: 0.78rem; }

.next-visit-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
  margin-top: 2px;
}

.nv-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 20px;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.nv-action--primary {
  background: var(--gradient-cta);
  color: white;
  box-shadow: 0 6px 16px -4px rgba(139, 126, 200, 0.45);
}

.nv-action--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px -4px rgba(139, 126, 200, 0.55);
}

.nv-action--ghost {
  background: white;
  color: var(--color-primary);
  border: 1px solid rgba(139, 126, 200, 0.18);
}

.nv-action--ghost:hover {
  background: rgba(139, 126, 200, 0.06);
  border-color: rgba(139, 126, 200, 0.30);
}

/* ───── Appointments card ───── */
.appt-big {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: auto;
}

.appt-num {
  font-size: 2.6rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
  line-height: 1;
}

.appt-unit {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.appt-breakdown {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.appt-row {
  display: grid;
  grid-template-columns: 8px 1fr auto;
  gap: 8px;
  align-items: center;
  font-size: 0.78rem;
}

.appt-row-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}

.appt-row-dot--booked { background: var(--color-primary); color: var(--color-primary); }
.appt-row-dot--free { background: rgba(139, 126, 200, 0.30); color: rgba(139, 126, 200, 0.30); }
.appt-row-dot--done { background: #5BC0BE; color: #5BC0BE; }

.appt-row-label { color: var(--color-text-secondary); }
.appt-row-num { color: var(--color-text-primary); font-weight: 500; }

.appt-week-bars {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  height: 40px;
  align-items: end;
  margin-top: 4px;
}

.appt-week-bar {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  height: 100%;
  justify-content: flex-end;
}

.appt-week-fill {
  width: 100%;
  height: var(--bar-h, 0%);
  background: rgba(139, 126, 200, 0.32);
  border-radius: 2px 2px 0 0;
}

.appt-week-bar:nth-child(5) .appt-week-fill {
  background: var(--gradient-cta);
}

.appt-week-label {
  font-size: 0.55rem;
  color: var(--color-text-muted);
}

/* ───── Risk card ───── */
.risk-big {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: auto;
}

.risk-num {
  font-size: 2.6rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: var(--color-danger);
  line-height: 1;
}

.risk-unit {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.risk-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
}

.risk-row {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 7px 10px;
  background: rgba(212, 114, 124, 0.04);
  border: 1px solid rgba(212, 114, 124, 0.10);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease, transform 0.2s ease;
}

.risk-row:hover {
  background: rgba(212, 114, 124, 0.10);
  transform: translateX(2px);
}

.risk-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 600;
  color: white;
}

.risk-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.risk-name {
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.risk-reason {
  font-size: 0.68rem;
  color: var(--color-danger);
}

.risk-arrow {
  color: var(--color-danger);
}

/* ───── Quality card ───── */
.quality-percent { margin-top: auto; }

.quality-num {
  font-size: 2.6rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #5BC0BE, #8B7EC8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
}

.quality-num sup { font-size: 1.2rem; vertical-align: super; }

.quality-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: var(--color-mint-dark, #3FA5A3);
  font-weight: 500;
}

.quality-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.quality-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quality-bar-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.quality-bar-name { font-weight: 500; }
.quality-bar-val { color: var(--color-text-primary); font-weight: 500; font-size: 0.72rem; }
.quality-bar-val sup { font-size: 0.55rem; }

.quality-bar-track {
  height: 5px;
  background: rgba(139, 126, 200, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.quality-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

/* Bento responsive */
@media (max-width: 1024px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
  .bento-next-visit { grid-column: span 2; }
}

@media (max-width: 720px) {
  .demo-status-chip { top: auto; bottom: 16px; right: 16px; }
  .bento-grid { grid-template-columns: 1fr; }
  .bento-next-visit { grid-column: span 1; }
  .next-visit-body { grid-template-columns: 1fr; }
}

/* ═══════════════════════════════════════════════
   Phase 6.3 + 6.4 — Schedule + Patients grid
   ═══════════════════════════════════════════════ */

.doctor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: 18px;
  margin-bottom: 28px;
}

@media (max-width: 1024px) {
  .doctor-grid { grid-template-columns: 1fr; }
}

.section-head--inline {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
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

/* ═══════════════════════════════════════════════
   Phase 6.3 — Schedule timeline
   ═══════════════════════════════════════════════ */
.schedule-section {
  background: linear-gradient(180deg, #FBF6FF 0%, #FFFFFF 100%);
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-xl);
  padding: 24px 26px;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.85) inset, 0 12px 32px -12px rgba(139, 126, 200, 0.10);
}

.schedule-stats {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 6px 12px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: 10px;
}

.schedule-stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.schedule-stat-num {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.schedule-stat-lbl {
  font-family: var(--font-display);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-text-muted);
  font-weight: 600;
}

.schedule-stat-divider {
  width: 1px;
  background: var(--color-border-light);
}

.schedule-timeline {
  position: relative;
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 16px;
  min-height: 480px;
}

.schedule-spine {
  position: relative;
  height: 100%;
}

.schedule-hour-mark {
  position: absolute;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
}

.schedule-hour-label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
  font-weight: 500;
}

.schedule-hour-tick {
  flex: 1;
  height: 1px;
  background: var(--color-border-light);
}

.schedule-now {
  position: absolute;
  left: -8px;
  right: -8px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  z-index: 3;
  pointer-events: none;
}

.schedule-now-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(232, 160, 191, 0.25), 0 0 12px rgba(232, 160, 191, 0.5);
  flex-shrink: 0;
  animation: schedule-pulse 2s ease-in-out infinite;
}

@keyframes schedule-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(232, 160, 191, 0.25), 0 0 12px rgba(232, 160, 191, 0.5); }
  50% { box-shadow: 0 0 0 6px rgba(232, 160, 191, 0.15), 0 0 20px rgba(232, 160, 191, 0.75); }
}

.schedule-now-line {
  flex: 1;
  height: 1.5px;
  background: linear-gradient(90deg, var(--color-secondary), transparent);
  margin-left: 4px;
}

.schedule-now-label {
  font-size: 0.62rem;
  color: var(--color-secondary-dark);
  background: white;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(232, 160, 191, 0.30);
  margin-left: 6px;
  font-weight: 500;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

/* Visit blocks */
.schedule-visits {
  position: relative;
  min-height: 100%;
}

.visit-block {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.16);
  border-radius: 10px;
  border-left: 3px solid var(--color-primary);
  font-size: 0.78rem;
  transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
  cursor: pointer;
  min-height: 36px;
  overflow: hidden;
}

.visit-block:hover {
  transform: translateY(-1px);
  border-color: rgba(139, 126, 200, 0.30);
  box-shadow: 0 6px 16px -4px rgba(139, 126, 200, 0.18);
  z-index: 5;
}

.visit-block--booked {
  background: white;
}

.visit-block--free {
  background: rgba(139, 126, 200, 0.04);
  border-left-color: rgba(139, 126, 200, 0.20);
  border-style: dashed;
  color: var(--color-text-muted);
}

.visit-block--past {
  opacity: 0.55;
}

.visit-block--past .visit-block-time {
  text-decoration: line-through;
  text-decoration-color: rgba(91, 192, 190, 0.6);
}

.visit-block--next {
  background: linear-gradient(135deg, rgba(232, 160, 191, 0.08), rgba(139, 126, 200, 0.05));
  border-color: var(--color-secondary);
  border-left-color: var(--color-secondary);
  box-shadow: 0 0 0 1px rgba(232, 160, 191, 0.30), 0 8px 20px -4px rgba(232, 160, 191, 0.30);
  animation: next-block-glow 2.6s ease-in-out infinite;
}

@keyframes next-block-glow {
  0%, 100% { box-shadow: 0 0 0 1px rgba(232, 160, 191, 0.30), 0 8px 20px -4px rgba(232, 160, 191, 0.30); }
  50% { box-shadow: 0 0 0 2px rgba(232, 160, 191, 0.50), 0 12px 28px -4px rgba(232, 160, 191, 0.45); }
}

.visit-block-time {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
}

.visit-block-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.visit-block-body--empty {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-direction: row;
  color: var(--color-text-muted);
  font-size: 0.72rem;
}

.visit-block-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.visit-block-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: var(--font-display);
  font-size: 0.6rem;
  font-weight: 600;
  flex-shrink: 0;
}

.visit-block-name {
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.visit-block-flag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--color-secondary-dark);
}

.visit-block-flag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-secondary);
  box-shadow: 0 0 6px currentColor;
}

.visit-block-reason {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  padding-left: 30px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ═══════════════════════════════════════════════
   Phase 6.4 — Patients
   ═══════════════════════════════════════════════ */
.patients-section {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: var(--radius-xl);
  padding: 24px 26px;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.85) inset, 0 12px 32px -12px rgba(139, 126, 200, 0.10);
}

.patients-filters {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: rgba(139, 126, 200, 0.06);
  border-radius: var(--radius-full);
}

.patients-filter {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: var(--radius-full);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-family: var(--font-display);
  font-size: 0.74rem;
  font-weight: 500;
  letter-spacing: var(--tracking-snug);
  cursor: pointer;
  transition: all 0.2s ease;
}

.patients-filter:hover {
  background: rgba(139, 126, 200, 0.10);
  color: var(--color-text-primary);
}

.patients-filter.is-active {
  background: var(--gradient-cta);
  color: white;
  box-shadow: 0 2px 6px -2px rgba(139, 126, 200, 0.4);
}

.patients-filter-count {
  font-size: 0.68rem;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.4);
  color: var(--color-text-muted);
  letter-spacing: 0;
}

.patients-filter.is-active .patients-filter-count {
  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.95);
}

.patients-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.patient-card {
  display: grid;
  grid-template-columns: minmax(160px, 1.2fr) minmax(120px, 0.8fr) auto;
  gap: 14px;
  align-items: center;
  padding: 12px 14px;
  background: rgba(248, 246, 252, 0.5);
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: 14px;
  transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

.patient-card:hover {
  background: white;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -4px rgba(139, 126, 200, 0.16);
}

.patient-head {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.patient-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  box-shadow:
    0 0 0 2px white,
    0 0 0 3px rgba(139, 126, 200, 0.12),
    0 2px 6px rgba(75, 50, 130, 0.10);
}

.patient-id {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.patient-name {
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.patient-journey {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.journey-pill {
  font-family: var(--font-display);
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: var(--radius-full);
}

.journey-pill--pregnant { background: rgba(232, 160, 191, 0.14); color: var(--color-secondary-dark); }
.journey-pill--newborn { background: rgba(168, 200, 232, 0.18); color: #4A8AC5; }
.journey-pill--toddler { background: rgba(242, 196, 160, 0.18); color: #C4870E; }
.journey-pill--postpartum { background: rgba(91, 192, 190, 0.14); color: var(--color-mint-dark, #3FA5A3); }
.journey-pill--other { background: rgba(139, 126, 200, 0.10); color: var(--color-primary); }

.patient-child {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

/* Vitals column */
.patient-vitals {
  display: flex;
  align-items: center;
  gap: 10px;
}

.patient-vital {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.patient-vital-lbl { color: var(--color-text-muted); }

.patient-vital-val {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.patient-vital-val sup { font-size: 0.6rem; }

.adh-good { color: var(--color-mint-dark, #3FA5A3); }
.adh-warn { color: #C4870E; }
.adh-danger { color: var(--color-danger); }

.patient-spark {
  width: 100px;
  height: 30px;
  flex-shrink: 0;
}

/* Right column */
.patient-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.patient-meta-dates {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.patient-date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.patient-date--next {
  color: var(--color-primary);
  font-weight: 500;
}

.patient-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transform: translateX(8px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.patient-card:hover .patient-actions {
  opacity: 1;
  transform: translateX(0);
}

.patient-fab {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-text-secondary);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.patient-fab:hover {
  background: rgba(139, 126, 200, 0.18);
  color: var(--color-primary);
  transform: scale(1.05);
}

.patient-fab--primary {
  background: var(--gradient-cta);
  color: white;
}

.patient-fab--primary:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 10px -4px rgba(139, 126, 200, 0.5);
}

@media (max-width: 720px) {
  .patient-card { grid-template-columns: 1fr; gap: 10px; }
  .patient-meta { align-items: flex-start; }
  .patient-meta-dates { flex-wrap: wrap; }
  .patient-actions { opacity: 1; transform: none; }
  /* Phase 5.1: schedule fits mobile width */
  .schedule-timeline { grid-template-columns: 44px 1fr; gap: 8px; }
  .schedule-hour-label { font-size: 0.7rem; }
  .visit-block { padding: 8px 10px; }
}

@media (max-width: 480px) {
  .schedule-timeline { grid-template-columns: 36px 1fr; }
  .schedule-hour-label { font-size: 0.65rem; }
  /* Patient sparkline narrower */
  .patient-sparkline { width: 80px; }
}

/* AI Summary spacing */
.demo-section { margin-bottom: 24px; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .status-chip-dot,
  .schedule-now-dot,
  .visit-block--next {
    animation: none;
  }
}
</style>
