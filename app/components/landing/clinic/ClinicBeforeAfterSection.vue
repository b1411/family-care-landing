<template>
  <LandingUiSectionWrapper
    id="before-after"
    badge="До и После"
    title="Как меняется работа клиники"
    subtitle="Сравните день координатора без платформы и с UMAI Health"
  >
    <!-- Tab selector: table vs timeline -->
    <div class="view-tabs" data-reveal="fade-up">
      <button
        class="view-tab"
        :class="{ active: view === 'compare' }"
        @click="view = 'compare'"
      >
        Сравнение в цифрах
      </button>
      <button
        class="view-tab"
        :class="{ active: view === 'day' }"
        @click="view = 'day'"
      >
        День координатора
      </button>
    </div>

    <Transition name="cross" mode="out-in">
      <!-- ===== VIEW 1: Comparison Table ===== -->
      <div v-if="view === 'compare'" key="compare" ref="compareRef" class="compare-view" data-reveal="fade-up">
        <div class="compare-table">
          <!-- Header -->
          <div class="ct-row ct-header">
            <div class="ct-metric">Метрика</div>
            <div class="ct-before">Без платформы</div>
            <div class="ct-after">С UMAI Health</div>
          </div>
          <!-- Rows -->
          <div
            v-for="(row, i) in compareRows"
            :key="row.metric"
            class="ct-row"
            :data-stagger="'fade-up'"
            :style="{ transitionDelay: `${i * 60}ms` }"
          >
            <div class="ct-metric">
              <Icon :name="row.icon" size="18" class="ct-icon" />
              {{ row.metric }}
            </div>
            <div class="ct-before">
              <span class="ct-val ct-val--bad">{{ row.before }}</span>
            </div>
            <div class="ct-after">
              <span class="ct-val ct-val--good">{{ row.after }}</span>
              <span v-if="row.delta" class="ct-delta">{{ row.delta }}</span>
            </div>
          </div>
        </div>
        <!-- Bottom CTA -->
        <div class="compare-footer" data-reveal="fade-up">
          <p class="compare-summary">
            Средняя клиника теряет <strong>~1&nbsp;200+&nbsp;точек контроля</strong> в&nbsp;год из-за оттока семей.
            Платформа возвращает <strong>до&nbsp;70%</strong> из&nbsp;них в&nbsp;маршрут.
          </p>
        </div>
      </div>

      <!-- ===== VIEW 2: Day in Life ===== -->
      <div v-else key="day" ref="dayRef" class="day-view" data-reveal="fade-up">
        <div class="day-split">
          <!-- WITHOUT -->
          <div class="day-column day-without">
            <div class="day-label day-label--bad">
              <Icon name="lucide:frown" size="18" class="day-emoji" /> Без платформы
            </div>
            <div class="timeline">
              <div v-for="ev in dayWithout" :key="ev.time" class="tl-event">
                <span class="tl-time font-mono">{{ ev.time }}</span>
                <div class="tl-card" :class="'tl-' + ev.mood">
                  <Icon :name="ev.icon" size="18" class="tl-icon" />
                  <div class="tl-body">
                    <strong class="tl-title">{{ ev.title }}</strong>
                    <p class="tl-desc">{{ ev.desc }}</p>
                  </div>
                </div>
              </div>
              <!-- Result -->
              <div class="day-result day-result--bad">
                <span class="result-label">Итог дня:</span>
                <span class="result-val">4 семьи потеряны • 6 часов на звонки • 0 аналитики</span>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="day-divider">
            <div class="divider-line" />
            <span class="divider-vs font-display">VS</span>
            <div class="divider-line" />
          </div>

          <!-- WITH -->
          <div class="day-column day-with">
            <div class="day-label day-label--good">
              <Icon name="lucide:smile" size="18" class="day-emoji" /> С платформой
            </div>
            <div class="timeline">
              <div v-for="ev in dayWith" :key="ev.time" class="tl-event">
                <span class="tl-time font-mono">{{ ev.time }}</span>
                <div class="tl-card" :class="'tl-' + ev.mood">
                  <Icon :name="ev.icon" size="18" class="tl-icon" />
                  <div class="tl-body">
                    <strong class="tl-title">{{ ev.title }}</strong>
                    <p class="tl-desc">{{ ev.desc }}</p>
                  </div>
                </div>
              </div>
              <!-- Result -->
              <div class="day-result day-result--good">
                <span class="result-label">Итог дня:</span>
                <span class="result-val">0 потерь • 1.5 часа экономии • KPI в реальном времени</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useGsap } from '~/composables/useGsap'

const { gsap, ScrollTrigger } = useGsap()

const view = ref<'compare' | 'day'>('compare')
const compareRef = ref<HTMLElement | null>(null)
const dayRef = ref<HTMLElement | null>(null)

function animateCompare() {
  nextTick(() => {
    if (!compareRef.value) return
    const rows = compareRef.value.querySelectorAll('.ct-row:not(.ct-header)')
    gsap.fromTo(rows,
      { opacity: 0, x: -24 },
      { opacity: 1, x: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: compareRef.value, start: 'top 80%', once: true } }
    )
    const deltas = compareRef.value.querySelectorAll('.ct-delta')
    gsap.fromTo(deltas,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, stagger: 0.08, duration: 0.4, ease: 'back.out(1.7)', delay: 0.4,
        scrollTrigger: { trigger: compareRef.value, start: 'top 80%', once: true } }
    )
  })
}

function animateDay() {
  nextTick(() => {
    if (!dayRef.value) return
    const cards = dayRef.value.querySelectorAll('.tl-event')
    gsap.fromTo(cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power2.out',
        scrollTrigger: { trigger: dayRef.value, start: 'top 80%', once: true } }
    )
    // Pulse on the VS divider
    const vs = dayRef.value.querySelector('.divider-vs')
    if (vs) {
      gsap.fromTo(vs, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)', delay: 0.3,
        scrollTrigger: { trigger: dayRef.value, start: 'top 80%', once: true } })
    }
  })
}

watch(view, (v) => {
  if (v === 'compare') animateCompare()
  else animateDay()
})

onMounted(() => {
  animateCompare()
})

const compareRows = [
  {
    icon: 'lucide:users',
    metric: 'Retention семей (6 мес)',
    before: '33%',
    after: '87%',
    delta: '+54%',
  },
  {
    icon: 'lucide:phone',
    metric: 'Время координатора на обзвоны',
    before: '4–6 ч/день',
    after: '1–1.5 ч/день',
    delta: '–70%',
  },
  {
    icon: 'lucide:syringe',
    metric: 'Вакцинация по графику',
    before: '45%',
    after: '98%',
    delta: '+53%',
  },
  {
    icon: 'lucide:bar-chart-3',
    metric: 'Видимость в аналитику',
    before: 'Excel / нет',
    after: 'Real-time дашборд',
    delta: '',
  },
  {
    icon: 'lucide:activity',
    metric: 'Событий маршрута на семью (24 мес)',
    before: '~20 (вручную)',
    after: '~56 (авто)',
    delta: '×2.8',
  },
  {
    icon: 'lucide:clock',
    metric: 'Время до первого визита',
    before: '3–5 дней (звонки)',
    after: '< 2 часа (авто)',
    delta: '–80%',
  },
  {
    icon: 'lucide:bell',
    metric: 'Пропущенные визиты',
    before: '30–40%',
    after: '6%',
    delta: '–85%',
  },
]

const dayWithout = [
  { time: '08:00', icon: 'lucide:clipboard-list', title: 'Открывает Excel', desc: 'Ищет кого нужно обзвонить. 142 строки, нет фильтров.', mood: 'bad' },
  { time: '09:00', icon: 'lucide:phone', title: 'Обзвон вчерашних', desc: 'Набирает 20 номеров. 8 не берут. 3 уже ушли в другую клинику.', mood: 'bad' },
  { time: '10:30', icon: 'lucide:message-circle-warning', title: 'Срочный вопрос от мамы', desc: 'WhatsApp: «Когда прививка?». Ищет карту 15 мин в папках.', mood: 'bad' },
  { time: '12:00', icon: 'lucide:pencil', title: 'Ручная запись', desc: 'Звонит в регистратуру, ждёт свободное окно. 5 мин на 1 запись.', mood: 'bad' },
  { time: '14:00', icon: 'lucide:alert-circle', title: 'Потерянная семья', desc: 'Каримова А. не пришла на УЗИ 3 дня назад. Никто не заметил.', mood: 'bad' },
  { time: '16:00', icon: 'lucide:bar-chart-3', title: 'Отчёт директору', desc: '«Сколько семей осталось?» — «Нужно посчитать...» Нет данных.', mood: 'bad' },
]

const dayWith = [
  { time: '08:00', icon: 'lucide:laptop', title: 'Открывает панель', desc: 'Все задачи на экране: 2 просрочено, 4 сегодня, 8 завтра.', mood: 'good' },
  { time: '08:15', icon: 'lucide:alert-circle', title: 'Просроченные первым делом', desc: 'Каримова А. — пропущено УЗИ. Клик → звонок. 2 минуты → записана.', mood: 'good' },
  { time: '09:00', icon: 'lucide:bell', title: 'Автоуведомления отправлены', desc: '12 семей получили push о визитах. 9 подтвердили. 0 звонков.', mood: 'good' },
  { time: '10:30', icon: 'lucide:message-circle', title: 'Мама спрашивает про прививку', desc: 'Открывает карту за 3 секунды. АКДС через 2 недели. Ответ за 30 сек.', mood: 'good' },
  { time: '12:00', icon: 'lucide:calendar-check', title: 'Автозапись', desc: 'Бекова Д. — вакцинация. Клик «Записать» → окно выбрано → готово.', mood: 'good' },
  { time: '14:00', icon: 'lucide:bar-chart-3', title: 'Дашборд для директора', desc: 'Retention: 87%. Визиты: 94%. NPS: 4.8. Экспорт PDF за 1 клик.', mood: 'good' },
]
</script>

<style scoped>
/* View tabs */
.view-tabs {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 40px;
  background: var(--color-bg-alt);
  border-radius: var(--radius-full);
  padding: 4px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}
.view-tab {
  padding: 8px 24px;
  border: none;
  border-radius: var(--radius-full);
  background: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-smooth);
  font-family: inherit;
}
.view-tab.active {
  background: var(--color-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

/* ===== COMPARISON TABLE ===== */
.compare-table {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.ct-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1.2fr;
  gap: 0;
}
.ct-row:not(:last-child) {
  border-bottom: 1px solid var(--color-border-light);
}
.ct-header {
  background: var(--color-primary-ultralight);
}
.ct-header > div {
  padding: 14px 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
}
.ct-metric,
.ct-before,
.ct-after {
  padding: 16px 20px;
  font-size: 14px;
}
.ct-metric {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.ct-icon {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}
.ct-before {
  background: rgba(212, 114, 124, 0.04);
}
.ct-after {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ct-val {
  font-weight: 600;
}
.ct-val--bad {
  color: var(--color-danger);
}
.ct-val--good {
  color: var(--color-primary);
}
.ct-delta {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: inline-block;
  transform-origin: center;
}
.compare-footer {
  text-align: center;
  margin-top: 32px;
}
.compare-summary {
  font-size: var(--text-body-lg);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
  max-width: var(--content-medium);
  margin: 0 auto;
}
.compare-summary strong {
  color: var(--color-text-primary);
}

/* ===== DAY IN LIFE ===== */
.day-split {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 24px;
  align-items: start;
}
.day-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  padding: 12px 20px;
  border-radius: var(--radius-sm);
  margin-bottom: 20px;
}
.day-label--bad {
  background: rgba(212, 114, 124, 0.08);
  color: var(--color-danger);
}
.day-label--good {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.day-emoji {
  display: inline-flex;
  align-items: center;
}
.day-label--bad .day-emoji { color: var(--color-danger); }
.day-label--good .day-emoji { color: var(--color-primary); }

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tl-event {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.tl-time {
  flex-shrink: 0;
  width: 48px;
  font-size: 11px;
  color: var(--color-text-muted);
  padding-top: 10px;
}
.tl-card {
  flex: 1;
  display: flex;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
  background: var(--color-surface);
}
.tl-card.tl-bad {
  border-left: 3px solid var(--color-danger);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.tl-card.tl-bad:hover {
  transform: translateX(4px);
  box-shadow: -3px 0 12px rgba(212, 114, 124, 0.1);
}
.tl-card.tl-good {
  border-left: 3px solid var(--color-success);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.tl-card.tl-good:hover {
  transform: translateX(4px);
  box-shadow: -3px 0 12px rgba(139, 126, 200, 0.1);
}
.tl-icon {
  flex-shrink: 0;
  padding-top: 2px;
  color: var(--color-text-secondary);
}
.tl-card.tl-bad .tl-icon { color: var(--color-danger); }
.tl-card.tl-good .tl-icon { color: var(--color-primary); }
.tl-body {
  display: flex;
  flex-direction: column;
  gap: var(--card-gap-xxs);
  min-width: 0;
}
.tl-title {
  font-size: 13px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
  display: block;
  line-height: var(--lh-h4);
  margin: 0;
}
.tl-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: var(--lh-body);
  margin: 0;
}

/* Day result */
.day-result {
  margin-top: 8px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
}
.day-result--bad {
  background: rgba(212, 114, 124, 0.06);
  border: 1px solid rgba(212, 114, 124, 0.15);
}
.day-result--good {
  background: var(--color-primary-light);
  border: 1px solid rgba(139, 126, 200, 0.2);
}
.result-label {
  font-weight: 700;
  color: var(--color-text-primary);
  margin-right: 6px;
}
.result-val {
  color: var(--color-text-secondary);
}

/* Divider */
.day-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 60px;
}
.divider-line {
  width: 2px;
  height: 80px;
  background: var(--color-border);
}
.divider-vs {
  font-size: 18px;
  color: var(--color-primary);
  padding: 8px;
  text-shadow: 0 0 20px rgba(139, 126, 200, 0.3);
}
.divider-line {
  background: linear-gradient(180deg, var(--color-border), var(--color-primary), var(--color-border));
}

/* Cross transition */
.cross-enter-active,
.cross-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.cross-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.cross-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Responsive */
@media (max-width: 900px) {
  .ct-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .ct-header {
    display: none;
  }
  .ct-metric,
  .ct-before,
  .ct-after {
    padding: 8px 16px;
  }
  .ct-metric {
    padding-top: 14px;
    font-size: 13px;
  }
  .ct-before::before {
    content: 'Без: ';
    font-size: 11px;
    color: var(--color-text-muted);
  }
  .ct-after::before {
    content: 'С платформой: ';
    font-size: 11px;
    color: var(--color-text-muted);
  }
  .ct-after {
    padding-bottom: 14px;
  }

  .day-split {
    grid-template-columns: 1fr;
  }
  .day-divider {
    flex-direction: row;
    padding-top: 0;
    padding: 16px 0;
  }
  .divider-line {
    width: 80px;
    height: 2px;
  }
}
</style>
