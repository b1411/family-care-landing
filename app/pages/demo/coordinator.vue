<template>
  <div class="demo-coord">
    <!-- Phase 5.1: Onboarding overlay -->
    <AppFamilyDemoWelcomeOverlay ref="welcomeRef" storage-key="umai-demo-coord-seen" />

    <!-- Phase 5.1: Floating DEMO MODE chip -->
    <div class="demo-status-chip" role="status">
      <span class="status-chip-dot" aria-hidden="true" />
      <span class="status-chip-label font-mono">DEMO MODE</span>
      <button
        type="button"
        class="status-chip-action"
        aria-label="Показать тур заново"
        @click="welcomeRef?.open()"
      >
        <Icon name="lucide:help-circle" size="13" />
        <span>Тур</span>
      </button>
    </div>

    <!-- Greeting -->
    <div class="demo-greeting">
      <span class="t-eyebrow demo-greeting-eyebrow">Координатор · {{ todayLabel }}</span>
      <h1 class="t-display-section demo-greeting-title">
        Добрый день, <span class="t-accent-serif">Динара</span>!
      </h1>
      <p class="demo-greeting-sub">
        <Icon name="lucide:users-round" size="14" class="greeting-icon" />
        <span><strong>{{ coordinatorKpi.activeFamilies.value }}</strong> семей в маршруте</span>
        <span class="greeting-sep">·</span>
        <Icon name="lucide:flame" size="13" class="greeting-icon greeting-icon-accent" />
        <span class="greeting-streak"><strong>{{ pendingCritical }}</strong> срочных задач сегодня</span>
        <span class="greeting-sep">·</span>
        <Icon name="lucide:check-circle-2" size="13" class="greeting-icon greeting-icon-good" />
        <span><strong>{{ doneTodayCount }}</strong> закрыто</span>
      </p>
    </div>

    <!-- Phase 5.2: Bento KPI grid — coordinator edition -->
    <div class="bento-grid">
      <!-- Big card: SLA Clock — live ticking countdown to next overdue task -->
      <div class="bento-card bento-sla">
        <div class="bento-card-head">
          <div class="bento-card-title-wrap">
            <span class="t-eyebrow bento-card-eyebrow">SLA · Следующая просрочка</span>
            <span class="bento-card-trend">
              <Icon name="lucide:radio" size="11" class="live-pulse" />
              <span class="font-mono">LIVE</span>
            </span>
          </div>
          <span class="bento-card-time font-mono">{{ nowLabel }}</span>
        </div>

        <div class="sla-body">
          <!-- Big SLA countdown -->
          <div class="sla-clock">
            <svg viewBox="0 0 180 180" class="sla-ring-svg">
              <defs>
                <linearGradient id="slaGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#E0A370" />
                  <stop offset="100%" stop-color="#D4727C" />
                </linearGradient>
              </defs>
              <!-- Tick marks around the perimeter (60 ticks) -->
              <g class="sla-ticks">
                <line
                  v-for="t in 60"
                  :key="t"
                  :x1="90 + Math.cos((t * 6 - 90) * Math.PI / 180) * 76"
                  :y1="90 + Math.sin((t * 6 - 90) * Math.PI / 180) * 76"
                  :x2="90 + Math.cos((t * 6 - 90) * Math.PI / 180) * (t % 5 === 0 ? 70 : 73)"
                  :y2="90 + Math.sin((t * 6 - 90) * Math.PI / 180) * (t % 5 === 0 ? 70 : 73)"
                  :stroke="t <= slaTicksLit ? '#E0A370' : 'rgba(139,126,200,0.15)'"
                  :stroke-width="t % 5 === 0 ? 1.5 : 0.9"
                  stroke-linecap="round"
                />
              </g>
              <!-- Inner glow -->
              <circle cx="90" cy="90" r="56" fill="rgba(224, 163, 112, 0.04)" />
              <!-- Hand -->
              <g :style="{ transform: `rotate(${slaHandDeg}deg)`, transformOrigin: '90px 90px', transition: 'transform 1s linear' }">
                <line x1="90" y1="90" x2="90" y2="36" stroke="url(#slaGrad)" stroke-width="3" stroke-linecap="round" />
              </g>
              <!-- Center dot -->
              <circle cx="90" cy="90" r="6" fill="white" stroke="#E0A370" stroke-width="2.5" />
            </svg>
            <div class="sla-clock-center">
              <span class="sla-clock-num t-kpi">{{ slaCountdown.mm }}<span class="sla-clock-sep">:</span>{{ slaCountdown.ss }}</span>
              <span class="sla-clock-unit">мин до эскалации</span>
            </div>
          </div>

          <!-- Right side — list of upcoming SLA breaches -->
          <div class="sla-list">
            <span class="sla-list-title t-meta">Скоро эскалируется</span>
            <div
              v-for="(item, i) in slaList"
              :key="i"
              class="sla-list-item"
              :class="`sla-list-item--${item.severity}`"
            >
              <div class="sla-list-meta">
                <span class="sla-list-time font-mono">{{ item.time }}</span>
                <span class="sla-list-name">{{ item.family }}</span>
              </div>
              <span class="sla-list-action">{{ item.action }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card: Active families -->
      <div class="bento-card bento-families">
        <div class="bento-card-head">
          <span class="t-eyebrow bento-card-eyebrow">Активных семей</span>
          <Icon name="lucide:users-round" size="16" class="bento-card-icon" />
        </div>
        <div class="families-big">
          <span class="t-kpi families-num">{{ coordinatorKpi.activeFamilies.value }}</span>
          <span class="families-trend trend-up font-mono">+{{ coordinatorKpi.activeFamilies.trend }} <Icon name="lucide:trending-up" size="11" /></span>
        </div>
        <span class="families-caption">за последнюю неделю</span>
        <!-- Distribution by stage -->
        <div class="families-stages">
          <div
            v-for="s in familyStages"
            :key="s.key"
            class="families-stage"
          >
            <span class="families-stage-dot" :style="{ background: s.color }" />
            <span class="families-stage-name">{{ s.label }}</span>
            <span class="families-stage-count font-mono">{{ s.count }}</span>
          </div>
        </div>
      </div>

      <!-- Card: Outreach reach this week -->
      <div class="bento-card bento-outreach">
        <div class="bento-card-head">
          <span class="t-eyebrow bento-card-eyebrow">Охват за неделю</span>
          <Icon name="lucide:phone-call" size="16" class="bento-card-icon" />
        </div>
        <div class="outreach-percent">
          <span class="t-kpi outreach-num">{{ outreachPercent }}<sup>%</sup></span>
        </div>
        <div class="outreach-meta-row">
          <span class="font-mono outreach-meta-num">{{ outreachReached }}/{{ coordinatorKpi.activeFamilies.value }}</span>
          <span class="outreach-meta-lbl">семей на связи</span>
        </div>
        <!-- 7-day mini bars -->
        <div class="outreach-bars">
          <div
            v-for="(b, i) in outreachWeekly"
            :key="i"
            class="outreach-bar"
            :style="{ '--bar-h': `${b.h}%` }"
            :title="`${b.label}: ${b.calls} контактов`"
          >
            <span class="outreach-bar-fill" />
            <span class="outreach-bar-label font-mono">{{ b.label }}</span>
          </div>
        </div>
      </div>

      <!-- Card: Today appointments + accompanied -->
      <div class="bento-card bento-today">
        <div class="bento-card-head">
          <span class="t-eyebrow bento-card-eyebrow">Визитов сегодня</span>
          <Icon name="lucide:calendar-clock" size="16" class="bento-card-icon" />
        </div>
        <div class="today-meta">
          <span class="t-kpi today-num">{{ coordinatorKpi.todayAppointments.value }}</span>
          <div class="today-meta-sub">
            <span class="today-sub-row"><Icon name="lucide:user-check" size="11" /> {{ accompaniedCount }} с сопровождением</span>
            <span class="today-sub-row today-sub-row--warn"><Icon name="lucide:alert-circle" size="11" /> {{ overdueAppts }} с просрочкой</span>
          </div>
        </div>
        <!-- Timeline strip (mini) — 12h with appointment pins -->
        <div class="today-strip" aria-hidden="true">
          <div
            v-for="(slot, i) in todayApptHours"
            :key="i"
            class="today-slot"
            :class="{ 'is-booked': slot.booked, 'is-overdue': slot.overdue }"
            :style="{ left: `${slot.pos}%` }"
            :title="slot.label"
          />
          <div class="today-strip-line" />
          <div class="today-strip-now" :style="{ left: `${todayStripNowPercent}%` }" />
        </div>
      </div>
    </div>

    <!-- Phase 5.3: Kanban board for tasks -->
    <section class="kanban-section">
      <div class="section-head section-head--inline">
        <div>
          <span class="t-eyebrow section-eyebrow">Операции</span>
          <h2 class="t-h3 section-h2">Доска задач</h2>
        </div>
        <div class="kanban-stats">
          <div class="kanban-stats-item">
            <span class="kanban-stats-num font-mono">{{ kanbanCounts.today }}</span>
            <span class="kanban-stats-lbl">сегодня</span>
          </div>
          <div class="kanban-stats-divider" aria-hidden="true" />
          <div class="kanban-stats-item">
            <span class="kanban-stats-num font-mono">{{ kanbanCounts.week }}</span>
            <span class="kanban-stats-lbl">на неделе</span>
          </div>
          <div class="kanban-stats-divider" aria-hidden="true" />
          <div class="kanban-stats-item kanban-stats-item--done">
            <span class="kanban-stats-num font-mono">{{ kanbanCounts.done }}</span>
            <span class="kanban-stats-lbl">закрыто</span>
          </div>
        </div>
      </div>

      <div class="kanban-board">
        <section
          v-for="col in kanbanColumns"
          :key="col.id"
          class="kanban-col"
          :class="[`kanban-col--${col.id}`, { 'is-drop-target': dragOverCol === col.id, 'is-source': draggingFrom === col.id }]"
          @dragenter.prevent="onDragEnter(col.id)"
          @dragover.prevent="onDragOver(col.id, $event)"
          @dragleave="onDragLeave(col.id, $event)"
          @drop.prevent="onDrop(col.id)"
        >
          <header class="kanban-col-head">
            <div class="kanban-col-head-left">
              <span class="kanban-col-marker" />
              <span class="kanban-col-title">{{ col.title }}</span>
              <span class="kanban-col-count font-mono">{{ tasksByCol(col.id).length }}</span>
            </div>
            <div class="kanban-col-head-actions">
              <button v-if="col.id !== 'done'" type="button" class="kanban-col-add" :aria-label="`Добавить задачу в ${col.title}`" @click="openQuickAdd(col.id)">
                <Icon name="lucide:plus" size="14" />
              </button>
              <button type="button" class="kanban-col-more" aria-label="Действия колонки">
                <Icon name="lucide:more-horizontal" size="14" />
              </button>
            </div>
          </header>

          <div class="kanban-col-body">
            <!-- Quick add input -->
            <div v-if="quickAddCol === col.id" class="kanban-quick">
              <input
                ref="quickInputEl"
                v-model="quickAddText"
                class="kanban-quick-input"
                type="text"
                placeholder="Опишите задачу и нажмите ↩"
                @keydown.enter="submitQuickAdd"
                @keydown.esc="cancelQuickAdd"
                @blur="cancelQuickAdd"
              />
              <span class="kanban-quick-hint t-meta">↩ создать · esc отменить</span>
            </div>

            <article
              v-for="task in tasksByCol(col.id)"
              :key="task.id"
              class="kanban-card"
              :class="[
                `priority-${task.priority}`,
                {
                  'is-dragging': draggingId === task.id,
                  'is-just-dropped': justDroppedId === task.id,
                  'is-done': task.status === 'done',
                },
              ]"
              draggable="true"
              :aria-grabbed="draggingId === task.id"
              @dragstart="onDragStart(task.id, col.id, $event)"
              @dragend="onDragEnd"
            >
              <!-- Top bar: priority + meta -->
              <div class="kanban-card-top">
                <span class="kanban-card-priority" :class="`priority-pill--${task.priority}`">
                  <span class="priority-pill-dot" />
                  {{ priorityLabel(task.priority) }}
                </span>
                <span class="kanban-card-type">{{ taskTypeLabel(task.type) }}</span>
              </div>

              <!-- Body -->
              <h3 class="kanban-card-title">{{ task.title }}</h3>

              <!-- Family row with avatar -->
              <div class="kanban-card-fam">
                <span class="kanban-fam-avatar" :style="{ background: familyColor(task.family_name) }">
                  {{ initials(task.family_name) }}
                </span>
                <span class="kanban-fam-name">{{ task.family_name }}</span>
              </div>

              <!-- Footer: created date + actions -->
              <div class="kanban-card-foot">
                <span class="kanban-card-date font-mono">{{ formatDate(task.created_at) }}</span>
                <div class="kanban-card-actions">
                  <button type="button" class="kanban-fab" aria-label="Позвонить" @click.stop>
                    <Icon name="lucide:phone" size="13" />
                  </button>
                  <button type="button" class="kanban-fab" aria-label="Назначить визит" @click.stop>
                    <Icon name="lucide:calendar-plus" size="13" />
                  </button>
                  <button
                    v-if="col.id !== 'done'"
                    type="button"
                    class="kanban-fab kanban-fab--done"
                    aria-label="Закрыть задачу"
                    @click.stop="moveTask(task.id, 'done')"
                  >
                    <Icon name="lucide:check" size="13" />
                  </button>
                  <button
                    v-else
                    type="button"
                    class="kanban-fab"
                    aria-label="Открыть заново"
                    @click.stop="moveTask(task.id, 'week')"
                  >
                    <Icon name="lucide:rotate-ccw" size="13" />
                  </button>
                </div>
              </div>
            </article>

            <!-- Drop zone hint when empty (so drop area stays clickable) -->
            <div v-if="tasksByCol(col.id).length === 0 && quickAddCol !== col.id" class="kanban-empty">
              <Icon name="lucide:inbox" size="20" />
              <span>{{ col.id === 'done' ? 'Пока ничего не закрыто' : 'Перетащите сюда задачу' }}</span>
            </div>
          </div>
        </section>
      </div>
    </section>

    <!-- Phase 5.4: Family map view (Kazakhstan) + list toggle -->
    <section class="map-section">
      <div class="section-head section-head--inline">
        <div>
          <span class="t-eyebrow section-eyebrow">География</span>
          <h2 class="t-h3 section-h2">Семьи на маршруте</h2>
        </div>
        <div class="map-controls">
          <!-- View toggle -->
          <div class="map-view-toggle" role="tablist" aria-label="Переключение вида">
            <button
              type="button"
              class="map-view-btn"
              :class="{ 'is-active': mapView === 'map' }"
              :aria-selected="mapView === 'map'"
              role="tab"
              @click="mapView = 'map'"
            >
              <Icon name="lucide:map" size="14" />
              <span>Карта</span>
            </button>
            <button
              type="button"
              class="map-view-btn"
              :class="{ 'is-active': mapView === 'list' }"
              :aria-selected="mapView === 'list'"
              role="tab"
              @click="mapView = 'list'"
            >
              <Icon name="lucide:list" size="14" />
              <span>Список</span>
            </button>
            <div class="map-view-pill" :style="{ transform: `translateX(${mapView === 'map' ? 0 : '100%'})` }" aria-hidden="true" />
          </div>
        </div>
      </div>

      <!-- ─── Map view ─── -->
      <div v-if="mapView === 'map'" class="map-canvas-wrap">
        <!-- Stats overlay top-left -->
        <div class="map-stats">
          <div class="map-stats-row">
            <span class="map-stats-num font-mono">{{ families.length }}</span>
            <span class="map-stats-lbl">семей в маршруте</span>
          </div>
          <div class="map-stats-divider" />
          <div class="map-stats-row">
            <span class="map-stats-num font-mono">{{ kzCities.length }}</span>
            <span class="map-stats-lbl">городов</span>
          </div>
          <div class="map-stats-divider" />
          <div class="map-stats-row map-stats-row--warn">
            <span class="map-stats-num font-mono">{{ familiesAtRisk }}</span>
            <span class="map-stats-lbl">требуют внимания</span>
          </div>
        </div>

        <!-- Legend top-right -->
        <div class="map-legend">
          <span class="map-legend-title t-meta">Adherence</span>
          <span class="map-legend-item">
            <span class="map-legend-dot map-legend-dot--good" />
            <span>≥ 80 %</span>
          </span>
          <span class="map-legend-item">
            <span class="map-legend-dot map-legend-dot--warning" />
            <span>60 — 79 %</span>
          </span>
          <span class="map-legend-item">
            <span class="map-legend-dot map-legend-dot--danger" />
            <span>&lt; 60 %</span>
          </span>
        </div>

        <!-- Stylised Kazakhstan SVG map -->
        <svg
          viewBox="0 0 1000 520"
          class="map-canvas-svg"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Карта Казахстана с распределением семей по городам"
        >
          <defs>
            <linearGradient id="mapLand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#F5F0FA" />
              <stop offset="100%" stop-color="#FAE9F0" />
            </linearGradient>
            <linearGradient id="mapStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#8B7EC8" stop-opacity="0.55" />
              <stop offset="100%" stop-color="#E8A0BF" stop-opacity="0.55" />
            </linearGradient>
          </defs>

          <!-- Subtle dotted background grid -->
          <pattern id="mapGrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="rgba(139,126,200,0.12)" />
          </pattern>
          <rect width="1000" height="520" fill="url(#mapGrid)" />

          <!-- Stylised Kazakhstan land shape — approximated to read as KZ silhouette
               without being a precise geographic projection. -->
          <path
            d="M 90 250
               Q 80 220 110 200
               L 160 195
               Q 175 165 220 160
               L 270 168
               Q 300 130 360 130
               L 430 140
               Q 470 100 530 105
               L 600 120
               Q 670 80 770 95
               L 850 110
               Q 920 130 930 180
               L 925 240
               Q 905 290 850 310
               L 800 320
               Q 770 360 700 360
               L 620 350
               Q 580 410 510 410
               L 430 405
               Q 380 440 310 435
               L 240 425
               Q 180 440 130 415
               Q 95 380 90 320 Z"
            fill="url(#mapLand)"
            stroke="url(#mapStroke)"
            stroke-width="1.5"
            class="map-land"
          />

          <!-- Decorative river-like accents -->
          <path
            d="M 280 270 Q 380 280 480 250 Q 560 230 640 260"
            fill="none"
            stroke="rgba(139,126,200,0.18)"
            stroke-width="1"
            stroke-dasharray="2 4"
          />
          <path
            d="M 150 360 Q 230 380 330 360"
            fill="none"
            stroke="rgba(139,126,200,0.18)"
            stroke-width="1"
            stroke-dasharray="2 4"
          />

          <!-- City pins — clickable dots with families pulsing -->
          <g class="map-cities">
            <g
              v-for="city in kzCities"
              :key="city.key"
              :transform="`translate(${city.x} ${city.y})`"
              class="map-city"
              :class="[`map-city--${city.tone}`, { 'is-selected': selectedCityKey === city.key }]"
              role="button"
              tabindex="0"
              :aria-label="`${city.name}: ${city.families.length} семей`"
              @click="selectCity(city.key)"
              @keydown.enter="selectCity(city.key)"
              @keydown.space.prevent="selectCity(city.key)"
            >
              <!-- Outer pulse rings -->
              <circle :r="20 + city.families.length * 1.4" class="map-city-ring map-city-ring-3" />
              <circle :r="14 + city.families.length * 0.9" class="map-city-ring map-city-ring-2" />
              <circle :r="10 + city.families.length * 0.6" class="map-city-halo" />

              <!-- Core pin -->
              <circle :r="6 + Math.min(city.families.length, 14) * 0.25" class="map-city-core" />

              <!-- Family count badge above pin -->
              <g class="map-city-badge" transform="translate(0 -22)">
                <rect x="-14" y="-9" width="28" height="18" rx="9" fill="white" stroke="currentColor" stroke-width="1.2" />
                <text x="0" y="3" text-anchor="middle" font-family="Geist Mono, monospace" font-size="10" font-weight="500" fill="currentColor">
                  {{ city.families.length }}
                </text>
              </g>

              <!-- Label below pin -->
              <text x="0" y="32" text-anchor="middle" font-family="Bricolage Grotesque, Inter, sans-serif" font-size="12" font-weight="600" class="map-city-label">
                {{ city.name }}
              </text>
            </g>
          </g>
        </svg>

        <!-- Detail panel (when city selected) -->
        <Transition name="map-detail-fade">
          <aside v-if="selectedCity" :key="selectedCity.key" class="map-detail">
            <header class="map-detail-head">
              <div class="map-detail-head-left">
                <div class="map-detail-icon" :data-tone="selectedCity.tone">
                  <Icon name="lucide:map-pin" size="18" />
                </div>
                <div>
                  <span class="t-eyebrow map-detail-eyebrow">Город</span>
                  <h3 class="map-detail-title t-h4">{{ selectedCity.name }}</h3>
                </div>
              </div>
              <button type="button" class="map-detail-close" aria-label="Закрыть" @click="selectedCityKey = null">
                <Icon name="lucide:x" size="14" />
              </button>
            </header>

            <div class="map-detail-stats">
              <div class="map-detail-stat">
                <span class="map-detail-stat-num font-mono">{{ selectedCity.families.length }}</span>
                <span class="map-detail-stat-lbl">семей</span>
              </div>
              <div class="map-detail-stat">
                <span class="map-detail-stat-num font-mono">{{ Math.round(cityAvgAdherence(selectedCity)) }}<sup>%</sup></span>
                <span class="map-detail-stat-lbl">средний адхеренс</span>
              </div>
              <div class="map-detail-stat">
                <span class="map-detail-stat-num font-mono" :class="{ 'text-danger': cityOverdueCount(selectedCity) > 0 }">{{ cityOverdueCount(selectedCity) }}</span>
                <span class="map-detail-stat-lbl">с просрочкой</span>
              </div>
            </div>

            <div class="map-detail-list">
              <div
                v-for="fam in selectedCity.families"
                :key="fam.id"
                class="map-detail-row"
              >
                <div class="map-detail-row-info">
                  <span class="map-detail-row-name">{{ fam.mother_name }}</span>
                  <span class="map-detail-row-stage">{{ fam.week_or_age }}</span>
                </div>
                <div class="map-detail-row-meta">
                  <span class="map-detail-row-adh" :class="adherenceClass(fam.adherence)">
                    {{ fam.adherence }}%
                  </span>
                  <span v-if="fam.overdue_count > 0" class="map-detail-row-warn">
                    <Icon name="lucide:alert-circle" size="11" />
                    {{ fam.overdue_count }}
                  </span>
                </div>
              </div>
            </div>

            <footer class="map-detail-foot">
              <button type="button" class="map-detail-btn map-detail-btn--primary">
                <Icon name="lucide:phone-call" size="13" />
                Связаться со всеми
              </button>
              <button type="button" class="map-detail-btn map-detail-btn--ghost">
                <Icon name="lucide:file-down" size="13" />
                Экспорт
              </button>
            </footer>
          </aside>

          <aside v-else class="map-placeholder">
            <div class="map-placeholder-icon">
              <Icon name="lucide:map-pinned" size="22" />
            </div>
            <span class="map-placeholder-text">
              Нажмите на любой город, чтобы увидеть семей
            </span>
            <ul class="map-placeholder-list">
              <li v-for="city in kzCities" :key="city.key">
                <span class="map-placeholder-dot" :data-tone="city.tone" />
                {{ city.name }}
                <span class="map-placeholder-count font-mono">{{ city.families.length }}</span>
              </li>
            </ul>
          </aside>
        </Transition>
      </div>

      <!-- ─── List view (fallback / alternative) ─── -->
      <div v-else class="map-list-wrap">
        <div class="family-list">
          <div v-for="fam in families" :key="fam.id" class="family-card">
            <div class="family-info">
              <span class="family-name">{{ fam.mother_name }}</span>
              <span class="family-stage">{{ fam.week_or_age }} · {{ familyCityName(fam.id) }}</span>
            </div>
            <div class="family-meta">
              <span class="family-adherence" :class="adherenceClass(fam.adherence)">
                {{ fam.adherence }}%
              </span>
              <span v-if="fam.overdue_count > 0" class="family-overdue">
                {{ fam.overdue_count }} просроч.
              </span>
              <span class="family-activity">{{ fam.last_activity }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Phase 5.5: Live Outreach activity feed -->
    <section class="feed-section">
      <div class="section-head section-head--inline">
        <div class="feed-head-left">
          <span class="t-eyebrow section-eyebrow">Активность</span>
          <h2 class="t-h3 section-h2">Лента команды</h2>
          <span class="feed-live-badge">
            <span class="feed-live-dot" />
            <span class="font-mono">LIVE</span>
          </span>
        </div>
        <!-- Filter pills -->
        <div class="feed-filters" role="tablist" aria-label="Фильтр ленты">
          <button
            v-for="f in feedFilters"
            :key="f.key"
            type="button"
            class="feed-filter-pill"
            :class="{ 'is-active': feedFilter === f.key }"
            :aria-selected="feedFilter === f.key"
            role="tab"
            @click="feedFilter = f.key"
          >
            <Icon v-if="f.icon" :name="f.icon" size="12" />
            <span>{{ f.label }}</span>
            <span class="feed-filter-count font-mono">{{ filterCount(f.key) }}</span>
          </button>
        </div>
      </div>

      <div class="feed-body">
        <template v-for="(group, gi) in groupedFeed" :key="group.key">
          <!-- Group divider -->
          <div class="feed-divider">
            <span class="feed-divider-label t-meta">{{ group.label }}</span>
            <span class="feed-divider-line" />
            <span v-if="gi === 0" class="feed-divider-count font-mono">{{ group.items.length }}</span>
          </div>

          <TransitionGroup name="feed-row" tag="div" class="feed-rows">
            <article
              v-for="item in group.items"
              :key="item.id"
              class="feed-row"
              :class="[
                `feed-row--${item.type}`,
                { 'is-fresh': freshIds.has(item.id) },
              ]"
            >
              <!-- Type marker icon -->
              <div class="feed-marker">
                <Icon :name="typeIcon(item.type)" size="14" />
              </div>

              <!-- Avatar -->
              <span class="feed-avatar" :style="{ background: familyColor(item.family) }">
                {{ initials(item.family) }}
              </span>

              <!-- Body -->
              <div class="feed-body-text">
                <div class="feed-body-line">
                  <span class="feed-actor">{{ item.actor }}</span>
                  <span class="feed-verb">{{ item.verb }}</span>
                  <span class="feed-family">{{ item.family }}</span>
                </div>
                <div class="feed-body-meta">
                  <span class="feed-time font-mono">{{ relativeTime(item.at) }}</span>
                  <span class="feed-dot" />
                  <span>{{ item.detail }}</span>
                  <span v-if="item.outcome" :class="`feed-outcome feed-outcome--${item.outcome.tone}`">
                    <Icon :name="item.outcome.icon" size="11" />
                    {{ item.outcome.label }}
                  </span>
                </div>
              </div>

              <!-- Quick "Open" button (revealed on hover) -->
              <button class="feed-open" type="button" aria-label="Открыть">
                <span>Открыть</span>
                <Icon name="lucide:arrow-right" size="12" />
              </button>
            </article>
          </TransitionGroup>
        </template>

        <!-- Stream marker — shows when next event will arrive -->
        <div class="feed-stream-bar">
          <span class="feed-stream-pulse" />
          <span class="feed-stream-text">
            <span>Следующее событие через</span>
            <span class="feed-stream-secs font-mono">{{ nextInSeconds }}с</span>
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'demo' })

const { coordinatorKpi, coordinatorTasks, families } = useMockData()

const welcomeRef = ref<{ open: () => void; close: () => void } | null>(null)

// Reactive copy of mock tasks — Kanban mutates priority/status in-place
const tasks = ref(coordinatorTasks.map(t => ({ ...t })))

const pendingCritical = computed(() =>
  tasks.value.filter(t => (t.priority === 'critical' || t.priority === 'high') && t.status === 'pending').length
)
const doneTodayCount = computed(() => tasks.value.filter(t => t.status === 'done').length)

// ─────────────────────────────────────────────
// Phase 5.3 — Kanban board (drag&drop)
// ─────────────────────────────────────────────
type KanbanColId = 'today' | 'week' | 'done'

interface KanbanColDef { id: KanbanColId; title: string; toneVar: string }
const kanbanColumns: KanbanColDef[] = [
  { id: 'today', title: 'Сегодня', toneVar: '#D4727C' },
  { id: 'week',  title: 'На неделе', toneVar: '#8B7EC8' },
  { id: 'done',  title: 'Выполнено', toneVar: '#5BC0BE' },
]

function tasksByCol(id: KanbanColId) {
  if (id === 'done') {
    return tasks.value.filter(t => t.status === 'done')
  }
  if (id === 'today') {
    return tasks.value.filter(t => t.status === 'pending' && (t.priority === 'critical' || t.priority === 'high'))
  }
  // week
  return tasks.value.filter(t => t.status === 'pending' && (t.priority === 'medium' || t.priority === 'low'))
}

const kanbanCounts = computed(() => ({
  today: tasksByCol('today').length,
  week: tasksByCol('week').length,
  done: tasksByCol('done').length,
}))

// Drag state
const draggingId = ref<string | null>(null)
const draggingFrom = ref<KanbanColId | null>(null)
const dragOverCol = ref<KanbanColId | null>(null)
const justDroppedId = ref<string | null>(null)

function onDragStart(id: string, fromCol: KanbanColId, e: DragEvent) {
  draggingId.value = id
  draggingFrom.value = fromCol
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
}

function onDragEnd() {
  draggingId.value = null
  draggingFrom.value = null
  dragOverCol.value = null
}

function onDragEnter(col: KanbanColId) {
  dragOverCol.value = col
}

function onDragOver(col: KanbanColId, e: DragEvent) {
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverCol.value = col
}

function onDragLeave(col: KanbanColId, e: DragEvent) {
  // Avoid flicker when entering a child element
  const related = e.relatedTarget as Element | null
  if (related && (e.currentTarget as HTMLElement).contains(related)) return
  if (dragOverCol.value === col) dragOverCol.value = null
}

function onDrop(col: KanbanColId) {
  const id = draggingId.value
  if (!id) return
  moveTask(id, col)
  onDragEnd()
}

function moveTask(id: string, col: KanbanColId) {
  const task = tasks.value.find(t => t.id === id)
  if (!task) return
  // Update status + priority based on destination column
  if (col === 'done') {
    task.status = 'done'
  } else if (col === 'today') {
    task.status = 'pending'
    // Make sure priority elevates if it was low/medium
    if (task.priority === 'low' || task.priority === 'medium') task.priority = 'high'
  } else { // week
    task.status = 'pending'
    if (task.priority === 'critical' || task.priority === 'high') task.priority = 'medium'
  }
  // Trigger drop-pulse for visual feedback
  justDroppedId.value = id
  setTimeout(() => {
    if (justDroppedId.value === id) justDroppedId.value = null
  }, 800)
}

// ─────────────────────────────────────────────
// Quick add inline input
// ─────────────────────────────────────────────
const quickAddCol = ref<KanbanColId | null>(null)
const quickAddText = ref('')
const quickInputEl = ref<HTMLInputElement[]>([])

function openQuickAdd(col: KanbanColId) {
  quickAddCol.value = col
  quickAddText.value = ''
  nextTick(() => {
    const el = Array.isArray(quickInputEl.value) ? quickInputEl.value[0] : quickInputEl.value
    el?.focus?.()
  })
}

function submitQuickAdd() {
  const txt = quickAddText.value.trim()
  if (!txt) {
    cancelQuickAdd()
    return
  }
  const col = quickAddCol.value || 'week'
  const priority = col === 'today' ? 'high' : 'medium'
  tasks.value.unshift({
    id: `t-${Date.now()}`,
    type: 'welcome_call',
    priority,
    title: txt,
    family_name: 'Без привязки',
    created_at: new Date().toISOString(),
    status: 'pending',
  } as any)
  quickAddText.value = ''
  quickAddCol.value = null
}

function cancelQuickAdd() {
  // Don't cancel right away if blur came from clicking the same input
  setTimeout(() => {
    if (quickAddText.value.trim() === '') {
      quickAddCol.value = null
      quickAddText.value = ''
    }
  }, 120)
}

// ─────────────────────────────────────────────
// Family avatar helpers
// ─────────────────────────────────────────────
const familyPalette = ['#8B7EC8', '#E8A0BF', '#5BC0BE', '#F2C4A0', '#A8C8E8']
function familyColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return familyPalette[Math.abs(h) % familyPalette.length]!
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')
}

// ─────────────────────────────────────────────
// Phase 5.4 — Family map (Kazakhstan)
// ─────────────────────────────────────────────
type MapView = 'map' | 'list'
const mapView = ref<MapView>('map')

type CityTone = 'good' | 'warning' | 'danger' | 'normal'
interface KzCity {
  key: string
  name: string
  x: number       // viewBox coords (0–1000)
  y: number       // viewBox coords (0–520)
  tone: CityTone
  families: typeof families
}

/* The 5 cities are positioned to read as Kazakhstan geography on the
   stylised SVG silhouette: Atyrau west, Astana north-centre, Almaty
   south-east, Shymkent south, Karaganda centre. Coordinates picked
   to align with the painted land-shape, not real lat/lng. */
const familyCityMap: Record<string, string> = {
  fam1: 'almaty',     // Айгерим Касымова
  fam2: 'astana',     // Дана Нурланова
  fam3: 'shymkent',   // Мадина Ержанова
  fam4: 'karaganda',  // Сара Абдикаримова
  fam5: 'atyrau',     // Камила Бекмуратова
}

const cityMeta: Array<{ key: string; name: string; x: number; y: number }> = [
  { key: 'atyrau',    name: 'Атырау',    x: 175, y: 220 },
  { key: 'astana',    name: 'Астана',    x: 520, y: 180 },
  { key: 'karaganda', name: 'Караганда', x: 600, y: 250 },
  { key: 'shymkent',  name: 'Шымкент',   x: 550, y: 370 },
  { key: 'almaty',    name: 'Алматы',    x: 770, y: 320 },
]

const kzCities = computed<KzCity[]>(() => {
  return cityMeta.map((meta) => {
    // Filter families whose mapped city is this one
    const cityFamilies = families.filter(f => familyCityMap[f.id] === meta.key)
    // Also evenly distribute "extra" demo families to bulk up each city's count
    // so visual scale matches the 47 total mentioned in KPIs
    const extraPerCity = 8 + Math.floor(Math.random() * 3) // 8–10
    const filler = Array.from({ length: extraPerCity }).map((_, i) => ({
      id: `extra-${meta.key}-${i}`,
      mother_name: '—',
      week_or_age: '',
      adherence: 0,
      overdue_count: 0,
      last_activity: '',
      // mark these as placeholder by giving them zero adherence — we don't list them
      phone: '',
      journey_type: 'pregnancy' as const,
      children: [],
    }))
    void filler // Don't actually use filler in the panel — kept reserved for future
    // Compute tone from average adherence of REAL families assigned here
    const avg = cityFamilies.length
      ? cityFamilies.reduce((s, f) => s + f.adherence, 0) / cityFamilies.length
      : 85
    let tone: CityTone = 'good'
    if (avg < 60) tone = 'danger'
    else if (avg < 80) tone = 'warning'
    else if (avg < 90) tone = 'normal'
    return {
      ...meta,
      tone,
      families: cityFamilies,
    }
  })
})

const selectedCityKey = ref<string | null>(null)

const selectedCity = computed(() =>
  kzCities.value.find(c => c.key === selectedCityKey.value) || null
)

function selectCity(key: string) {
  selectedCityKey.value = selectedCityKey.value === key ? null : key
}

function cityAvgAdherence(city: KzCity): number {
  if (!city.families.length) return 0
  return city.families.reduce((s, f) => s + f.adherence, 0) / city.families.length
}

function cityOverdueCount(city: KzCity): number {
  return city.families.reduce((s, f) => s + (f.overdue_count > 0 ? 1 : 0), 0)
}

function familyCityName(familyId: string): string {
  const cityKey = familyCityMap[familyId]
  const meta = cityMeta.find(c => c.key === cityKey)
  return meta?.name || ''
}

const familiesAtRisk = computed(() =>
  families.filter(f => f.adherence < 70 || f.overdue_count > 0).length
)

// Auto-open Almaty on mount for visual story
onMounted(() => {
  setTimeout(() => { selectedCityKey.value = 'almaty' }, 600)
})

// ─────────────────────────────────────────────
// Phase 5.5 — Outreach activity feed
// ─────────────────────────────────────────────
type FeedType = 'call' | 'sms' | 'email' | 'task' | 'visit'

interface FeedItem {
  id: string
  type: FeedType
  actor: string
  verb: string
  family: string
  detail: string
  at: number   // timestamp ms
  outcome?: { label: string; tone: 'good' | 'warn' | 'neutral'; icon: string }
}

type FeedFilter = 'all' | FeedType

const feedFilter = ref<FeedFilter>('all')

const feedFilters: Array<{ key: FeedFilter; label: string; icon?: string }> = [
  { key: 'all', label: 'Все' },
  { key: 'call', label: 'Звонки', icon: 'lucide:phone' },
  { key: 'sms', label: 'Сообщения', icon: 'lucide:message-square' },
  { key: 'task', label: 'Задачи', icon: 'lucide:clipboard-check' },
  { key: 'visit', label: 'Визиты', icon: 'lucide:calendar-check' },
]

// Seed feed — 12 events spread over last 24h
function seedFeedItems(): FeedItem[] {
  const now = Date.now()
  const m = 60_000
  const h = 60 * m
  return [
    { id: 'e1', type: 'call',  actor: 'Динара',  verb: 'позвонила',     family: 'Каримова А.',     detail: '4 мин 12 сек', at: now - 2 * m,  outcome: { label: 'отвечено', tone: 'good', icon: 'lucide:check' } },
    { id: 'e2', type: 'sms',   actor: 'Айгуль',  verb: 'отправила SMS', family: 'Нурланова Д.',    detail: 'напоминание о приёме', at: now - 7 * m,  outcome: { label: 'прочитано', tone: 'good', icon: 'lucide:eye' } },
    { id: 'e3', type: 'task',  actor: 'Динара',  verb: 'закрыла задачу', family: 'Бекмуратова К.', detail: 'Welcome-call', at: now - 18 * m, outcome: { label: 'выполнено', tone: 'good', icon: 'lucide:check-circle-2' } },
    { id: 'e4', type: 'call',  actor: 'Айгуль',  verb: 'попыталась дозвониться', family: 'Ержанова М.',  detail: 'не ответили', at: now - 34 * m, outcome: { label: 'без ответа', tone: 'warn', icon: 'lucide:phone-missed' } },
    { id: 'e5', type: 'email', actor: 'Динара',  verb: 'отправила email', family: 'Абдикаримова С.', detail: 'инструкция АКДС', at: now - 52 * m, outcome: { label: 'доставлено', tone: 'good', icon: 'lucide:mail-check' } },
    { id: 'e6', type: 'visit', actor: 'Айгуль',  verb: 'подтвердила визит', family: 'Каримова А.', detail: 'УЗИ 18 мая 14:00', at: now - 1.5 * h, outcome: { label: 'подтверждён', tone: 'good', icon: 'lucide:calendar-check' } },
    { id: 'e7', type: 'task',  actor: 'Динара',  verb: 'создала задачу', family: 'Ержанова М.',    detail: 'связаться о пропущенном осмотре', at: now - 3 * h,  outcome: { label: 'критично', tone: 'warn', icon: 'lucide:flag' } },
    { id: 'e8', type: 'call',  actor: 'Динара',  verb: 'провела консультацию', family: 'Нурланова Д.', detail: '12 мин', at: now - 5 * h, outcome: { label: 'успешно', tone: 'good', icon: 'lucide:thumbs-up' } },
    { id: 'e9', type: 'sms',   actor: 'Бот',     verb: 'отправил напоминание', family: 'Абдикаримова С.', detail: 'дозы вечерних витаминов', at: now - 8 * h },
    { id: 'e10', type: 'visit', actor: 'Динара', verb: 'перенесла визит', family: 'Бекмуратова К.', detail: 'УЗИ → 20 мая 10:30', at: now - 12 * h, outcome: { label: 'перенесён', tone: 'neutral', icon: 'lucide:calendar' } },
    { id: 'e11', type: 'email', actor: 'Айгуль', verb: 'отправила брошюру', family: 'Каримова А.',  detail: 'питание во 2 триместре', at: now - 18 * h, outcome: { label: 'открыто', tone: 'good', icon: 'lucide:eye' } },
    { id: 'e12', type: 'task', actor: 'Бот',     verb: 'выставил алерт',   family: 'Ержанова М.',    detail: 'адхеренс < 60% за 7 дней', at: now - 22 * h, outcome: { label: 'высокий риск', tone: 'warn', icon: 'lucide:alert-triangle' } },
  ]
}

const feedItems = ref<FeedItem[]>(seedFeedItems())
const freshIds = ref<Set<string>>(new Set())

function filterCount(key: FeedFilter): number {
  if (key === 'all') return feedItems.value.length
  return feedItems.value.filter(i => i.type === key).length
}

const filteredFeed = computed(() => {
  if (feedFilter.value === 'all') return feedItems.value
  return feedItems.value.filter(i => i.type === feedFilter.value)
})

interface FeedGroup { key: string; label: string; items: FeedItem[] }
const groupedFeed = computed<FeedGroup[]>(() => {
  const now = Date.now()
  const justNow: FeedItem[] = []
  const today: FeedItem[] = []
  const yesterday: FeedItem[] = []
  for (const item of filteredFeed.value) {
    const age = now - item.at
    if (age < 10 * 60_000) justNow.push(item)
    else if (age < 24 * 60 * 60_000) today.push(item)
    else yesterday.push(item)
  }
  const groups: FeedGroup[] = []
  if (justNow.length) groups.push({ key: 'now', label: 'Только что', items: justNow })
  if (today.length) groups.push({ key: 'today', label: 'Сегодня', items: today })
  if (yesterday.length) groups.push({ key: 'yest', label: 'Вчера', items: yesterday })
  return groups
})

function typeIcon(t: FeedType): string {
  const map: Record<FeedType, string> = {
    call: 'lucide:phone',
    sms: 'lucide:message-square',
    email: 'lucide:mail',
    task: 'lucide:clipboard-check',
    visit: 'lucide:calendar-check',
  }
  return map[t]
}

function relativeTime(at: number): string {
  void nowTick.value
  const ageSec = Math.max(0, Math.round((Date.now() - at) / 1000))
  if (ageSec < 60) return `${ageSec} с назад`
  const ageMin = Math.round(ageSec / 60)
  if (ageMin < 60) return `${ageMin} мин назад`
  const ageHr = Math.round(ageMin / 60)
  if (ageHr < 24) return `${ageHr} ч назад`
  return `${Math.round(ageHr / 24)} д назад`
}

// ─── Live streaming: emit a new event every 12-18s ───
const nextInSeconds = ref(14)
let streamCountdownTimer: ReturnType<typeof setInterval> | null = null
let streamInjectTimer: ReturnType<typeof setTimeout> | null = null
let bootInjectTimer: ReturnType<typeof setTimeout> | null = null
const freshDropTimers = new Set<ReturnType<typeof setTimeout>>()

const streamTemplates: Omit<FeedItem, 'id' | 'at'>[] = [
  { type: 'call', actor: 'Динара', verb: 'позвонила', family: 'Касымова А.', detail: '3 мин 48 сек', outcome: { label: 'отвечено', tone: 'good', icon: 'lucide:check' } },
  { type: 'sms', actor: 'Бот', verb: 'отправил SMS', family: 'Нурланова Д.', detail: 'витамин D — 09:00' },
  { type: 'task', actor: 'Айгуль', verb: 'закрыла задачу', family: 'Бекмуратова К.', detail: 'согласование плана', outcome: { label: 'выполнено', tone: 'good', icon: 'lucide:check-circle-2' } },
  { type: 'visit', actor: 'Динара', verb: 'подтвердила визит', family: 'Абдикаримова С.', detail: 'педиатр 22 мая 11:30', outcome: { label: 'подтверждён', tone: 'good', icon: 'lucide:calendar-check' } },
  { type: 'call', actor: 'Айгуль', verb: 'попыталась дозвониться', family: 'Ержанова М.', detail: 'занято', outcome: { label: 'без ответа', tone: 'warn', icon: 'lucide:phone-missed' } },
  { type: 'email', actor: 'Динара', verb: 'отправила email', family: 'Касымова А.', detail: 'результаты УЗИ', outcome: { label: 'доставлено', tone: 'good', icon: 'lucide:mail-check' } },
]

function injectStreamEvent() {
  const template = streamTemplates[Math.floor(Math.random() * streamTemplates.length)]
  if (!template) return
  const id = `live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const newItem: FeedItem = { ...template, id, at: Date.now() }
  feedItems.value.unshift(newItem)
  freshIds.value.add(id)
  // Keep feed bounded
  if (feedItems.value.length > 24) feedItems.value.pop()
  // Drop "fresh" flag after the bloom animation completes
  const dropTimer = setTimeout(() => {
    freshIds.value.delete(id)
    freshDropTimers.delete(dropTimer)
  }, 1800)
  freshDropTimers.add(dropTimer)
}

function scheduleNextInjection() {
  const wait = 12 + Math.floor(Math.random() * 7) // 12-18s
  nextInSeconds.value = wait
  if (streamInjectTimer) clearTimeout(streamInjectTimer)
  streamInjectTimer = setTimeout(() => {
    injectStreamEvent()
    scheduleNextInjection()
  }, wait * 1000)
}

onMounted(() => {
  // Tick countdown to next event each second
  streamCountdownTimer = setInterval(() => {
    if (nextInSeconds.value > 0) nextInSeconds.value -= 1
  }, 1000)
  // Schedule first injection
  bootInjectTimer = setTimeout(scheduleNextInjection, 3000)
})

onBeforeUnmount(() => {
  if (streamCountdownTimer) clearInterval(streamCountdownTimer)
  if (streamInjectTimer) clearTimeout(streamInjectTimer)
  if (bootInjectTimer) clearTimeout(bootInjectTimer)
  freshDropTimers.forEach((t) => clearTimeout(t))
  freshDropTimers.clear()
})

function priorityLabel(priority: string) {
  const labels: Record<string, string> = { critical: 'Критично', high: 'Высокий', medium: 'Средний', low: 'Низкий' }
  return labels[priority] || priority
}

function taskTypeLabel(type: string) {
  const labels: Record<string, string> = {
    missed_appointment: 'Неявка',
    overdue_followup: 'Просрочено',
    low_adherence: 'Низкий Adherence',
    vaccination_reminder: 'Вакцинация',
    welcome_call: 'Звонок',
    reactivation: 'Реактивация',
  }
  return labels[type] || type
}

function adherenceClass(val: number) {
  if (val >= 80) return 'adherence--success'
  if (val >= 60) return 'adherence--warning'
  return 'adherence--danger'
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

// ─────────────────────────────────────────────
// Phase 5.1 — header helpers
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

// ─────────────────────────────────────────────
// Phase 5.2 — SLA Clock
// ─────────────────────────────────────────────
// Live SLA countdown — starts at 15:00 ("min:sec to escalation"), counts down each second
const SLA_TOTAL_SECONDS = 15 * 60
const slaRemaining = ref(SLA_TOTAL_SECONDS - 47)  // initial ~14m13s — dramatic but believable

let slaTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  slaTimer = setInterval(() => {
    if (slaRemaining.value <= 1) {
      // Reset for visual continuity (in production this would be re-fetched from API)
      slaRemaining.value = SLA_TOTAL_SECONDS - Math.floor(Math.random() * 200)
    } else {
      slaRemaining.value -= 1
    }
    nowTick.value++  // also update HH:MM display
  }, 1000)
})
onUnmounted(() => { if (slaTimer) clearInterval(slaTimer) })

const slaCountdown = computed(() => {
  const mm = Math.floor(slaRemaining.value / 60)
  const ss = slaRemaining.value % 60
  return {
    mm: String(mm).padStart(2, '0'),
    ss: String(ss).padStart(2, '0'),
  }
})

// Hand position on 60-minute dial
const slaHandDeg = computed(() => {
  // The hand sweeps from 0 to 360 over a full 60-minute cycle of the SLA budget
  return ((SLA_TOTAL_SECONDS - slaRemaining.value) / SLA_TOTAL_SECONDS) * 360
})

const slaTicksLit = computed(() => {
  // Number of ticks (out of 60) that should be lit — equals "used" minutes
  return Math.floor(((SLA_TOTAL_SECONDS - slaRemaining.value) / SLA_TOTAL_SECONDS) * 60)
})

interface SlaItem { time: string; family: string; action: string; severity: 'urgent' | 'high' | 'normal' }
const slaList: SlaItem[] = [
  { time: '15 мин', family: 'Мадина Ержанова', action: 'Звонок по неявке', severity: 'urgent' },
  { time: '38 мин', family: 'Дана Нурланова', action: 'Скрининг 1-го триместра', severity: 'high' },
  { time: '1 ч 12 мин', family: 'Сара Абдикаримова', action: 'Напоминание АКДС', severity: 'normal' },
]

// ─────────────────────────────────────────────
// Phase 5.2 — Family stages distribution
// ─────────────────────────────────────────────
interface StageBlock { key: string; label: string; count: number; color: string }
const familyStages = computed<StageBlock[]>(() => {
  const total = coordinatorKpi.activeFamilies.value
  return [
    { key: 'preg', label: 'Беременность', count: Math.round(total * 0.36), color: '#8B7EC8' },
    { key: 'post', label: 'Послеродовой',  count: Math.round(total * 0.14), color: '#E8A0BF' },
    { key: 'inf',  label: '0–12 месяцев',  count: Math.round(total * 0.32), color: '#5BC0BE' },
    { key: 'todd', label: '1–2 года',       count: Math.round(total * 0.18), color: '#F2C4A0' },
  ]
})

// ─────────────────────────────────────────────
// Phase 5.2 — Outreach weekly bars
// ─────────────────────────────────────────────
const outreachReached = computed(() => Math.round(coordinatorKpi.activeFamilies.value * 0.83))
const outreachPercent = computed(() =>
  Math.round((outreachReached.value / coordinatorKpi.activeFamilies.value) * 100)
)

interface OutBar { label: string; calls: number; h: number }
const outreachWeekly = computed<OutBar[]>(() => {
  const data = [
    { label: 'Пн', calls: 22 },
    { label: 'Вт', calls: 28 },
    { label: 'Ср', calls: 24 },
    { label: 'Чт', calls: 31 },
    { label: 'Пт', calls: 33 },
    { label: 'Сб', calls: 18 },
    { label: 'Сегодня', calls: 26 },
  ]
  const max = Math.max(...data.map(d => d.calls))
  return data.map(d => ({ ...d, h: Math.round((d.calls / max) * 100) }))
})

// ─────────────────────────────────────────────
// Phase 5.2 — Today appointments strip
// ─────────────────────────────────────────────
const accompaniedCount = computed(() => 4)  // demo
const overdueAppts = computed(() => 1)

interface TodaySlot { pos: number; booked: boolean; overdue: boolean; label: string }
const todayApptHours = computed<TodaySlot[]>(() => {
  // 12 appointments distributed across 09:00–18:00 (9 hours window)
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17]
  return hours.flatMap((h, i): TodaySlot[] => {
    const a: TodaySlot = {
      pos: ((h - 9) / 9) * 100,
      booked: i !== 3,  // 12:00 free
      overdue: i === 1,  // 10:00 overdue
      label: `${h}:00`,
    }
    // Add a second slot for some hours to reach 12 total
    if ([0, 2, 5, 7].includes(i)) {
      return [a, { pos: ((h - 9) / 9) * 100 + 4, booked: true, overdue: false, label: `${h}:30` }]
    }
    return [a]
  })
})

const todayStripNowPercent = computed(() => {
  void nowTick.value
  const d = new Date()
  const h = d.getHours() + d.getMinutes() / 60
  if (h < 9) return 0
  if (h > 18) return 100
  return ((h - 9) / 9) * 100
})
</script>

<style scoped>
.demo-coord {
  position: relative;
  max-width: 1120px;
  margin: 0 auto;
}

/* ═══════════════════════════════════════════════
   Phase 5.1 — DEMO MODE chip (shared style with /demo/family)
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

.demo-greeting-sub strong {
  color: var(--color-text-primary);
  font-weight: 600;
}

.greeting-icon { color: var(--color-text-muted); }
.greeting-icon-accent { color: #E0A370; }
.greeting-icon-good { color: var(--color-mint-dark, #3FA5A3); }

.greeting-sep {
  color: var(--color-text-muted);
  opacity: 0.5;
  margin: 0 4px;
}

/* ═══════════════════════════════════════════════
   Phase 5.2 — Bento KPI grid
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
.trend-down { color: var(--color-danger); }

.live-pulse {
  color: var(--color-danger);
  animation: live-blink 1.4s ease-in-out infinite;
}

@keyframes live-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

.bento-card-time {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.bento-card-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* ───── SLA Clock (spans 2 cols) ───── */
.bento-sla {
  grid-column: span 2;
  background:
    radial-gradient(ellipse at top right, rgba(224, 163, 112, 0.06), transparent 55%),
    linear-gradient(180deg, #FFFFFF 0%, #FDF8F3 100%);
  border-color: rgba(224, 163, 112, 0.20);
}

.sla-body {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  align-items: center;
}

.sla-clock {
  position: relative;
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.sla-ring-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 6px 20px rgba(224, 163, 112, 0.20));
}

.sla-clock-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.sla-clock-num {
  font-size: 2.2rem;
  font-weight: 500;
  background: linear-gradient(135deg, #E0A370, #D4727C);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.04em;
  line-height: 1;
}

.sla-clock-sep {
  animation: sep-blink 1s step-end infinite;
}

@keyframes sep-blink {
  50% { opacity: 0.3; }
}

.sla-clock-unit {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
  text-align: center;
}

.sla-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.sla-list-title {
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.sla-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: 10px;
  transition: background 0.2s ease;
}

.sla-list-item:hover {
  background: white;
  border-color: rgba(139, 126, 200, 0.18);
}

.sla-list-item--urgent { border-left: 3px solid var(--color-danger); }
.sla-list-item--high { border-left: 3px solid #E0A370; }
.sla-list-item--normal { border-left: 3px solid var(--color-primary); }

.sla-list-meta {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.sla-list-time {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.sla-list-item--urgent .sla-list-time { color: var(--color-danger); font-weight: 500; }

.sla-list-name {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sla-list-action {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ───── Active families card ───── */
.families-big {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: auto;
}

.families-num {
  font-size: 2.6rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
  line-height: 1;
}

.families-trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.75rem;
  font-weight: 500;
}

.families-caption {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  margin-top: -6px;
}

.families-stages {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.families-stage {
  display: grid;
  grid-template-columns: 8px 1fr auto;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

.families-stage-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}

.families-stage-name {
  font-weight: 500;
}

.families-stage-count {
  color: var(--color-text-primary);
  font-weight: 500;
}

/* ───── Outreach card ───── */
.outreach-percent { margin-top: auto; }

.outreach-num {
  font-size: 2.6rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #5BC0BE, #8B7EC8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
}

.outreach-num sup {
  font-size: 1.2rem;
  vertical-align: super;
}

.outreach-meta-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

.outreach-meta-num {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 0.85rem;
}

.outreach-meta-lbl { color: var(--color-text-muted); }

.outreach-bars {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  height: 56px;
  align-items: end;
  margin-top: 6px;
}

.outreach-bar {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
  cursor: pointer;
}

.outreach-bar-fill {
  width: 100%;
  height: var(--bar-h, 0%);
  background: linear-gradient(180deg, #5BC0BE, #3FA5A3);
  border-radius: 3px 3px 0 0;
  transition: height 0.6s ease;
}

.outreach-bar:last-child .outreach-bar-fill {
  background: linear-gradient(180deg, #8B7EC8, #6E5FB3);
}

.outreach-bar-label {
  font-size: 0.6rem;
  color: var(--color-text-muted);
  letter-spacing: 0;
}

.outreach-bar:last-child .outreach-bar-label {
  color: var(--color-primary);
  font-weight: 500;
}

/* ───── Today appointments card ───── */
.today-meta {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-top: auto;
}

.today-num {
  font-size: 2.6rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
  line-height: 1;
}

.today-meta-sub {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.today-sub-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.today-sub-row--warn {
  color: var(--color-danger);
}

.today-strip {
  position: relative;
  height: 24px;
  margin-top: 4px;
}

.today-strip-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(139, 126, 200, 0.12);
  border-radius: 1px;
  transform: translateY(-50%);
}

.today-strip-now {
  position: absolute;
  top: 0;
  width: 1.5px;
  height: 100%;
  background: var(--color-secondary);
  box-shadow: 0 0 6px rgba(232, 160, 191, 0.5);
}

.today-slot {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid white;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 1px rgba(139, 126, 200, 0.18);
}

.today-slot.is-overdue {
  background: var(--color-danger);
  box-shadow: 0 0 0 1px rgba(212, 114, 124, 0.4), 0 0 8px rgba(212, 114, 124, 0.4);
}

.today-slot.is-booked {
  background: linear-gradient(135deg, #5BC0BE, #3FA5A3);
}

/* ─── Bento responsive ─── */
@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .bento-sla { grid-column: span 2; }
}

@media (max-width: 720px) {
  .demo-status-chip {
    top: auto;
    bottom: 16px;
    right: 16px;
  }
  .bento-grid { grid-template-columns: 1fr; }
  .bento-sla { grid-column: span 1; }
  .sla-body { grid-template-columns: 1fr; }
  .sla-clock { margin: 0 auto; }
}

/* ═══════════════════════════════════════════════
   Phase 5.3 — Kanban board
   ═══════════════════════════════════════════════ */

.kanban-section {
  margin-bottom: 28px;
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

.kanban-stats {
  display: flex;
  align-items: stretch;
  gap: 14px;
  padding: 8px 14px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: 12px;
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.10);
}

.kanban-stats-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 56px;
}

.kanban-stats-num {
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.kanban-stats-item--done .kanban-stats-num {
  color: var(--color-mint-dark, #3FA5A3);
}

.kanban-stats-lbl {
  font-family: var(--font-display);
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-text-muted);
  font-weight: 600;
}

.kanban-stats-divider {
  width: 1px;
  background: var(--color-border-light);
}

/* ─── Board ─── */
.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.kanban-col {
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #FBF6FF 0%, #FFFFFF 100%);
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-lg);
  min-height: 380px;
  transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* Top accent stripe per column */
.kanban-col::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
}

.kanban-col--today::before { background: linear-gradient(90deg, var(--color-danger), #E89AA1); }
.kanban-col--week::before { background: var(--gradient-cta); }
.kanban-col--done::before { background: linear-gradient(90deg, #5BC0BE, #3FA5A3); }

.kanban-col.is-source {
  background: linear-gradient(180deg, #F5F0FA 0%, #FAF7FD 100%);
  opacity: 0.95;
}

.kanban-col.is-drop-target {
  background: linear-gradient(180deg, rgba(139, 126, 200, 0.06) 0%, rgba(232, 160, 191, 0.04) 100%);
  border-color: rgba(139, 126, 200, 0.32);
  box-shadow: 0 0 0 1px rgba(139, 126, 200, 0.22), 0 12px 32px -8px rgba(139, 126, 200, 0.18);
}

/* Subtle pulsing dashed border on drop target */
.kanban-col.is-drop-target::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 14px;
  border: 1.5px dashed rgba(139, 126, 200, 0.35);
  pointer-events: none;
  animation: drop-pulse 1.4s ease-in-out infinite;
}

@keyframes drop-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* ─── Column header ─── */
.kanban-col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  gap: 8px;
}

.kanban-col-head-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.kanban-col-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 8px currentColor;
}

.kanban-col--today .kanban-col-marker { background: var(--color-danger); color: var(--color-danger); }
.kanban-col--week .kanban-col-marker { background: var(--color-primary); color: var(--color-primary); }
.kanban-col--done .kanban-col-marker { background: #5BC0BE; color: #5BC0BE; }

.kanban-col-title {
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-text-primary);
}

.kanban-col-count {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.08);
  border: 1px solid rgba(139, 126, 200, 0.10);
  letter-spacing: 0;
}

.kanban-col-head-actions {
  display: flex;
  gap: 4px;
}

.kanban-col-add,
.kanban-col-more {
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

.kanban-col-add:hover,
.kanban-col-more:hover {
  background: var(--gradient-cta);
  color: white;
  transform: translateY(-1px);
}

.kanban-col-more:hover { background: rgba(139, 126, 200, 0.18); color: var(--color-text-primary); }

/* ─── Column body ─── */
.kanban-col-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 12px 12px;
  flex: 1;
  min-height: 0;
}

/* Quick-add input */
.kanban-quick {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: white;
  border: 1.5px dashed rgba(139, 126, 200, 0.35);
  border-radius: 10px;
}

.kanban-quick-input {
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-display);
  font-size: 0.88rem;
  font-weight: 500;
  letter-spacing: var(--tracking-snug);
  color: var(--color-text-primary);
}

.kanban-quick-input::placeholder {
  color: var(--color-text-muted);
}

.kanban-quick-hint {
  color: var(--color-text-muted);
  font-size: 0.7rem;
}

/* ─── Card ─── */
.kanban-card {
  position: relative;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: grab;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 1px 2px rgba(75, 50, 130, 0.03),
    0 4px 10px -4px rgba(139, 126, 200, 0.08);
  transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease, opacity 0.25s ease;
}

.kanban-card:hover {
  border-color: rgba(139, 126, 200, 0.24);
  transform: translateY(-2px);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 4px 8px rgba(75, 50, 130, 0.04),
    0 14px 32px -8px rgba(139, 126, 200, 0.20);
}

.kanban-card:active {
  cursor: grabbing;
}

/* Left priority stripe — overlap as a tiny inner accent */
.kanban-card::before {
  content: '';
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 0;
  width: 3px;
  border-radius: 2px;
}

.kanban-card.priority-critical::before { background: var(--color-danger); }
.kanban-card.priority-high::before { background: #E0A370; }
.kanban-card.priority-medium::before { background: var(--color-primary); }
.kanban-card.priority-low::before { background: rgba(139, 126, 200, 0.30); }

.kanban-card.is-dragging {
  opacity: 0.45;
  transform: scale(0.98);
}

.kanban-card.is-done {
  background: linear-gradient(180deg, #F8FCFB 0%, white 100%);
}

.kanban-card.is-done .kanban-card-title {
  text-decoration: line-through;
  text-decoration-color: rgba(91, 192, 190, 0.5);
  color: var(--color-text-secondary);
}

/* "Just dropped" success pulse */
.kanban-card.is-just-dropped {
  animation: card-just-dropped 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
}

@keyframes card-just-dropped {
  0% { box-shadow: 0 0 0 0 rgba(91, 192, 190, 0.5); transform: scale(1); }
  30% { box-shadow: 0 0 0 6px rgba(91, 192, 190, 0.30); transform: scale(1.02); }
  100% { box-shadow: 0 0 0 0 rgba(91, 192, 190, 0); transform: scale(1); }
}

/* Card top row */
.kanban-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.kanban-card-priority {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
}

.priority-pill-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.priority-pill--critical { background: rgba(212, 114, 124, 0.12); color: var(--color-danger); }
.priority-pill--critical .priority-pill-dot { background: var(--color-danger); box-shadow: 0 0 6px currentColor; }

.priority-pill--high { background: rgba(224, 163, 112, 0.14); color: #C4870E; }
.priority-pill--high .priority-pill-dot { background: #E0A370; box-shadow: 0 0 6px currentColor; }

.priority-pill--medium { background: rgba(139, 126, 200, 0.10); color: var(--color-primary); }
.priority-pill--medium .priority-pill-dot { background: var(--color-primary); }

.priority-pill--low { background: rgba(139, 126, 200, 0.06); color: var(--color-text-muted); }
.priority-pill--low .priority-pill-dot { background: var(--color-text-muted); }

.kanban-card-type {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.kanban-card-title {
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.35;
  text-wrap: pretty;
}

/* Family avatar row */
.kanban-card-fam {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px solid var(--color-border-light);
}

.kanban-fam-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.65rem;
  font-weight: 600;
  color: white;
  letter-spacing: 0;
  flex-shrink: 0;
  box-shadow:
    0 0 0 2px white,
    0 0 0 3px rgba(139, 126, 200, 0.12),
    0 2px 6px rgba(75, 50, 130, 0.10);
}

.kanban-fam-name {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Card foot */
.kanban-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.kanban-card-date {
  font-size: 0.68rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
}

.kanban-card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transform: translateX(6px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.kanban-card:hover .kanban-card-actions,
.kanban-card:focus-within .kanban-card-actions {
  opacity: 1;
  transform: translateX(0);
}

.kanban-fab {
  width: 24px;
  height: 24px;
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

.kanban-fab:hover {
  background: var(--color-primary);
  color: white;
  transform: scale(1.1);
}

.kanban-fab--done:hover {
  background: linear-gradient(135deg, #5BC0BE, #3FA5A3);
}

/* Empty col placeholder */
.kanban-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 16px;
  border: 1.5px dashed rgba(139, 126, 200, 0.18);
  border-radius: 12px;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  text-align: center;
  flex: 1;
}

.kanban-empty :deep(svg) {
  opacity: 0.5;
}

/* ─── Kanban mobile ─── */
@media (max-width: 900px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
  .kanban-col { min-height: 0; }
}

/* ═══════════════════════════════════════════════
   Phase 5.4 — Kazakhstan family map
   ═══════════════════════════════════════════════ */

.map-section {
  position: relative;
}

.map-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* View toggle pill */
.map-view-toggle {
  position: relative;
  display: inline-flex;
  background: rgba(139, 126, 200, 0.06);
  border: 1px solid rgba(139, 126, 200, 0.12);
  border-radius: var(--radius-full);
  padding: 3px;
  z-index: 0;
}

.map-view-btn {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: var(--tracking-snug);
  border-radius: var(--radius-full);
  transition: color 0.2s ease;
}

.map-view-btn.is-active {
  color: white;
}

.map-view-pill {
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc(50% - 3px);
  height: calc(100% - 6px);
  background: var(--gradient-cta);
  border-radius: var(--radius-full);
  transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  box-shadow: 0 2px 8px -2px rgba(139, 126, 200, 0.35);
  z-index: 0;
}

/* Canvas wrap */
.map-canvas-wrap {
  position: relative;
  background:
    radial-gradient(ellipse at top right, rgba(232, 160, 191, 0.08), transparent 50%),
    linear-gradient(180deg, #FBF6FF 0%, #FFFFFF 60%);
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-xl);
  padding: 22px;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
  gap: 16px;
  align-items: stretch;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 1px 2px rgba(75, 50, 130, 0.03),
    0 12px 32px -12px rgba(139, 126, 200, 0.12);
}

/* Stats overlay floating */
.map-stats {
  position: absolute;
  top: 30px;
  left: 38px;
  z-index: 4;
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(139, 126, 200, 0.14);
  border-radius: 12px;
  box-shadow: 0 4px 16px -4px rgba(139, 126, 200, 0.14);
}

.map-stats-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
}

.map-stats-num {
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  line-height: 1.1;
}

.map-stats-lbl {
  font-family: var(--font-display);
  font-size: 0.62rem;
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--color-text-muted);
  font-weight: 600;
}

.map-stats-row--warn .map-stats-num { color: var(--color-danger); }

.map-stats-divider {
  width: 1px;
  background: rgba(139, 126, 200, 0.16);
}

/* Legend top-right */
.map-legend {
  position: absolute;
  top: 30px;
  right: 38px;
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(139, 126, 200, 0.14);
  border-radius: 12px;
  box-shadow: 0 4px 16px -4px rgba(139, 126, 200, 0.14);
}

.map-legend-title {
  color: var(--color-text-muted);
  margin-bottom: 2px;
}

.map-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: var(--color-text-secondary);
}

.map-legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 8px currentColor;
}

.map-legend-dot--good { background: #5BC0BE; color: #5BC0BE; }
.map-legend-dot--warning { background: #E0A370; color: #E0A370; }
.map-legend-dot--danger { background: var(--color-danger); color: var(--color-danger); }

/* SVG canvas itself */
.map-canvas-svg {
  width: 100%;
  height: auto;
  min-height: 380px;
  display: block;
  grid-column: 1;
  align-self: center;
}

.map-land {
  filter: drop-shadow(0 8px 24px rgba(75, 50, 130, 0.08));
}

/* ─── City pins ─── */
.map-city {
  cursor: pointer;
  outline: none;
  transition: opacity 0.3s ease;
}

.map-city:focus-visible .map-city-core {
  filter: drop-shadow(0 0 0 2px white) drop-shadow(0 0 0 4px currentColor);
}

.map-city--good { color: #5BC0BE; }
.map-city--warning { color: #E0A370; }
.map-city--danger { color: var(--color-danger); }
.map-city--normal { color: var(--color-primary); }

.map-city-ring {
  fill: currentColor;
  opacity: 0;
  transform-origin: center;
  transform-box: fill-box;
}

.map-city-ring-3 {
  animation: city-ring 2.6s ease-out infinite;
}
.map-city-ring-2 {
  animation: city-ring 2.6s ease-out infinite;
  animation-delay: 0.7s;
}

@keyframes city-ring {
  0% { opacity: 0.32; transform: scale(0.4); }
  100% { opacity: 0; transform: scale(1.2); }
}

.map-city-halo {
  fill: currentColor;
  opacity: 0.18;
  transform-origin: center;
  transform-box: fill-box;
  animation: city-halo 3.4s ease-in-out infinite;
}

@keyframes city-halo {
  0%, 100% { opacity: 0.16; transform: scale(1); }
  50% { opacity: 0.28; transform: scale(1.08); }
}

.map-city-core {
  fill: currentColor;
  filter: drop-shadow(0 0 6px currentColor) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.12));
  transition: transform 0.25s ease;
  transform-origin: center;
  transform-box: fill-box;
}

.map-city:hover .map-city-core {
  transform: scale(1.18);
}

.map-city.is-selected .map-city-core {
  transform: scale(1.28);
}

.map-city.is-selected .map-city-halo {
  opacity: 0.4;
}

.map-city-badge {
  pointer-events: none;
  color: currentColor;
}

.map-city-label {
  fill: var(--color-text-primary);
  pointer-events: none;
  text-shadow:
    0 0 2px white,
    0 0 4px white;
}

.map-city.is-selected .map-city-label {
  fill: currentColor;
}

/* ─── Detail panel (right side) ─── */
.map-detail,
.map-placeholder {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 4px 16px -4px rgba(139, 126, 200, 0.14);
  grid-column: 2;
  align-self: stretch;
  z-index: 3;
}

.map-detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.map-detail-head-left {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.map-detail-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.map-detail-icon[data-tone="good"] {
  background: linear-gradient(135deg, #5BC0BE, #3FA5A3);
  box-shadow: 0 4px 12px -4px rgba(91, 192, 190, 0.45);
}
.map-detail-icon[data-tone="warning"] {
  background: linear-gradient(135deg, #F2C4A0, #E0A370);
  box-shadow: 0 4px 12px -4px rgba(224, 163, 112, 0.45);
}
.map-detail-icon[data-tone="danger"] {
  background: linear-gradient(135deg, #E89AA1, #D4727C);
  box-shadow: 0 4px 12px -4px rgba(212, 114, 124, 0.45);
}
.map-detail-icon[data-tone="normal"] {
  background: var(--gradient-cta);
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.45);
}

.map-detail-eyebrow {
  display: block;
  margin-bottom: 2px;
  color: var(--color-text-muted);
}

.map-detail-title {
  margin: 0;
  color: var(--color-text-primary);
}

.map-detail-close {
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
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.map-detail-close:hover {
  background: rgba(139, 126, 200, 0.18);
  transform: rotate(90deg);
}

/* Stats row */
.map-detail-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.05), rgba(232, 160, 191, 0.05));
  border-radius: 12px;
}

.map-detail-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
}

.map-detail-stat-num {
  font-size: 1.15rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  line-height: 1;
}

.map-detail-stat-num.text-danger { color: var(--color-danger); }

.map-detail-stat-num sup {
  font-size: 0.65rem;
}

.map-detail-stat-lbl {
  font-family: var(--font-display);
  font-size: 0.62rem;
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--color-text-muted);
  font-weight: 600;
}

/* List inside detail */
.map-detail-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 260px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 126, 200, 0.20) transparent;
}

.map-detail-list::-webkit-scrollbar { width: 5px; }
.map-detail-list::-webkit-scrollbar-thumb { background: rgba(139, 126, 200, 0.20); border-radius: 3px; }

.map-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(248, 246, 252, 0.6);
  border-radius: 10px;
  transition: background 0.2s ease;
}

.map-detail-row:hover { background: rgba(139, 126, 200, 0.06); }

.map-detail-row-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.map-detail-row-name {
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-detail-row-stage {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.map-detail-row-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.map-detail-row-adh {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0;
}

.map-detail-row-warn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.7rem;
  color: var(--color-danger);
  background: rgba(212, 114, 124, 0.10);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

/* Detail foot */
.map-detail-foot {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.map-detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.map-detail-btn--primary {
  background: var(--gradient-cta);
  color: white;
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.40);
  flex: 1;
}

.map-detail-btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -4px rgba(139, 126, 200, 0.55);
}

.map-detail-btn--ghost {
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary);
}

.map-detail-btn--ghost:hover {
  background: rgba(139, 126, 200, 0.16);
}

/* Placeholder */
.map-placeholder {
  align-items: center;
  text-align: center;
  justify-content: center;
  gap: 12px;
}

.map-placeholder-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.12), rgba(232, 160, 191, 0.12));
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-placeholder-text {
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text-primary);
  max-width: 24ch;
}

.map-placeholder-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.map-placeholder-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(248, 246, 252, 0.6);
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.map-placeholder-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}

.map-placeholder-dot[data-tone="good"] { background: #5BC0BE; color: #5BC0BE; }
.map-placeholder-dot[data-tone="warning"] { background: #E0A370; color: #E0A370; }
.map-placeholder-dot[data-tone="danger"] { background: var(--color-danger); color: var(--color-danger); }
.map-placeholder-dot[data-tone="normal"] { background: var(--color-primary); color: var(--color-primary); }

.map-placeholder-count {
  margin-left: auto;
  color: var(--color-text-primary);
  font-weight: 500;
  font-size: 0.78rem;
}

/* Transitions */
.map-detail-fade-enter-active,
.map-detail-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.map-detail-fade-enter-from,
.map-detail-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* List-view wrap (placeholder for fallback) */
.map-list-wrap {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 4px 16px -4px rgba(139, 126, 200, 0.12);
}

/* Responsive */
@media (max-width: 900px) {
  .map-canvas-wrap {
    grid-template-columns: 1fr;
  }
  .map-canvas-svg {
    grid-column: 1;
  }
  .map-detail, .map-placeholder {
    grid-column: 1;
  }
  .map-stats, .map-legend {
    position: static;
    margin-bottom: 8px;
  }
  .map-stats { order: -1; }
  .map-legend { order: -1; }
}

@media (max-width: 720px) {
  .map-canvas-wrap {
    padding: 16px;
  }
  .map-detail-stats {
    grid-template-columns: 1fr 1fr 1fr;
    padding: 10px;
    gap: 8px;
  }
}

/* Phase 5.1: KZ map stats 1-col on very small screens */
@media (max-width: 480px) {
  .map-detail-stats {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}

/* ═══════════════════════════════════════════════
   Legacy demo-panel (used by list view)
   ═══════════════════════════════════════════════ */

.demo-panel {
  background: var(--color-surface);
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 1px 2px rgba(75, 50, 130, 0.03),
    0 8px 24px -8px rgba(139, 126, 200, 0.08);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.panel-title {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: var(--tracking-tight);
}

.family-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.family-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
  transition: box-shadow var(--transition-fast);
}

.family-card:hover {
  box-shadow: var(--shadow-sm);
}

.family-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.family-name {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.family-stage {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.family-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.family-adherence {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
}

.adherence--success { color: var(--color-mint-dark, #3FA5A3); }
.adherence--warning { color: #C4930E; }
.adherence--danger { color: var(--color-danger); }

.family-overdue {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-danger);
  background: rgba(212, 114, 124, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.family-activity {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .demo-grid-2 { grid-template-columns: 1fr; }
}

/* ═══════════════════════════════════════════════
   Phase 5.5 — Live activity feed
   ═══════════════════════════════════════════════ */

.feed-section {
  margin-top: 28px;
}

.feed-head-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  position: relative;
}

.feed-live-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  margin-top: 6px;
  border-radius: var(--radius-full);
  background: rgba(212, 114, 124, 0.08);
  border: 1px solid rgba(212, 114, 124, 0.18);
  color: var(--color-danger);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.08em;
}

.feed-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-danger);
  box-shadow: 0 0 0 0 rgba(212, 114, 124, 0.4);
  animation: feed-live-pulse 1.6s ease-in-out infinite;
}

@keyframes feed-live-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212, 114, 124, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(212, 114, 124, 0); }
}

/* Filter pills */
.feed-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.feed-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.06);
  border: 1px solid rgba(139, 126, 200, 0.12);
  color: var(--color-text-secondary);
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: var(--tracking-snug);
  cursor: pointer;
  transition: all 0.2s ease;
}

.feed-filter-pill:hover {
  background: rgba(139, 126, 200, 0.12);
  border-color: rgba(139, 126, 200, 0.25);
  color: var(--color-text-primary);
}

.feed-filter-pill.is-active {
  background: var(--gradient-cta);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.4);
}

.feed-filter-count {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  padding: 1px 6px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.5);
  letter-spacing: 0;
}

.feed-filter-pill.is-active .feed-filter-count {
  background: rgba(255, 255, 255, 0.20);
  color: rgba(255, 255, 255, 0.95);
}

/* Feed body */
.feed-body {
  background: linear-gradient(180deg, #FBF6FF 0%, #FFFFFF 60%);
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-xl);
  padding: 18px 22px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 1px 2px rgba(75, 50, 130, 0.03),
    0 12px 32px -12px rgba(139, 126, 200, 0.12);
}

/* Divider */
.feed-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 4px 8px;
  position: relative;
}

.feed-divider:first-child {
  padding-top: 4px;
}

.feed-divider-label {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-text-muted);
}

.feed-divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(139, 126, 200, 0.18), transparent);
}

.feed-divider-count {
  font-size: 0.68rem;
  color: var(--color-text-muted);
  background: rgba(139, 126, 200, 0.06);
  border: 1px solid rgba(139, 126, 200, 0.10);
  padding: 1px 8px;
  border-radius: var(--radius-full);
}

/* Rows wrapper */
.feed-rows {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Single row */
.feed-row {
  display: grid;
  grid-template-columns: 32px 32px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  position: relative;
  transition: background 0.25s ease, transform 0.25s ease;
}

.feed-row:hover {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.10);
}

.feed-row.is-fresh {
  animation: feed-row-bloom 1.8s cubic-bezier(0.22, 0.61, 0.36, 1);
}

@keyframes feed-row-bloom {
  0% {
    box-shadow: 0 0 0 0 rgba(139, 126, 200, 0);
    background: rgba(139, 126, 200, 0.18);
  }
  30% {
    box-shadow: 0 0 0 4px rgba(139, 126, 200, 0.25);
    background: rgba(139, 126, 200, 0.10);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(139, 126, 200, 0);
    background: transparent;
  }
}

/* Type marker */
.feed-marker {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.feed-row--call .feed-marker { background: linear-gradient(135deg, #8B7EC8, #6E5FB3); box-shadow: 0 4px 10px -4px rgba(139, 126, 200, 0.45); }
.feed-row--sms .feed-marker { background: linear-gradient(135deg, #A8C8E8, #8B7EC8); box-shadow: 0 4px 10px -4px rgba(168, 200, 232, 0.5); }
.feed-row--email .feed-marker { background: linear-gradient(135deg, #F2C4A0, #E0A370); box-shadow: 0 4px 10px -4px rgba(242, 196, 160, 0.5); }
.feed-row--task .feed-marker { background: linear-gradient(135deg, #5BC0BE, #3FA5A3); box-shadow: 0 4px 10px -4px rgba(91, 192, 190, 0.5); }
.feed-row--visit .feed-marker { background: linear-gradient(135deg, #E8A0BF, #D47EA5); box-shadow: 0 4px 10px -4px rgba(232, 160, 191, 0.5); }

/* Avatar */
.feed-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  box-shadow:
    0 0 0 2px white,
    0 0 0 3px rgba(139, 126, 200, 0.12),
    0 2px 6px rgba(75, 50, 130, 0.10);
}

/* Body text */
.feed-body-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.feed-body-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.feed-actor {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.feed-verb {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.feed-family {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary);
}

.feed-body-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: var(--color-text-muted);
  flex-wrap: wrap;
}

.feed-time {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
}

.feed-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-text-muted);
  opacity: 0.6;
}

.feed-outcome {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0;
  font-family: var(--font-display);
}

.feed-outcome--good { background: rgba(91, 192, 190, 0.14); color: var(--color-mint-dark, #3FA5A3); }
.feed-outcome--warn { background: rgba(224, 163, 112, 0.14); color: #C4870E; }
.feed-outcome--neutral { background: rgba(139, 126, 200, 0.10); color: var(--color-primary); }

/* Open button */
.feed-open {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary);
  border: none;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  opacity: 0;
  transform: translateX(6px);
  transition: all 0.25s ease;
  white-space: nowrap;
}

.feed-row:hover .feed-open {
  opacity: 1;
  transform: translateX(0);
}

.feed-open:hover {
  background: var(--gradient-cta);
  color: white;
}

/* Stream marker */
.feed-stream-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 14px;
  background: rgba(139, 126, 200, 0.04);
  border: 1px dashed rgba(139, 126, 200, 0.20);
  border-radius: 12px;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

.feed-stream-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 0 rgba(139, 126, 200, 0.5);
  animation: feed-stream 1.8s ease-out infinite;
  flex-shrink: 0;
}

@keyframes feed-stream {
  0% { box-shadow: 0 0 0 0 rgba(139, 126, 200, 0.5); }
  100% { box-shadow: 0 0 0 12px rgba(139, 126, 200, 0); }
}

.feed-stream-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.feed-stream-secs {
  font-size: 0.78rem;
  color: var(--color-primary);
  font-weight: 500;
  letter-spacing: 0.04em;
  background: rgba(139, 126, 200, 0.10);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

/* Feed transitions */
.feed-row-enter-active {
  transition: all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.feed-row-leave-active {
  transition: all 0.3s ease;
}
.feed-row-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}
.feed-row-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
.feed-row-move {
  transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* Mobile */
@media (max-width: 720px) {
  .feed-body {
    padding: 14px 14px;
  }
  .feed-row {
    grid-template-columns: 28px 28px 1fr;
    gap: 10px;
    padding: 10px 10px;
  }
  .feed-open { display: none; }
  .feed-body-meta { font-size: 0.68rem; }
  .feed-outcome { display: none; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .feed-live-dot,
  .feed-stream-pulse,
  .feed-row.is-fresh,
  .feed-row-enter-active,
  .feed-row-leave-active,
  .feed-row-move {
    animation: none !important;
    transition: none !important;
  }
}
</style>
