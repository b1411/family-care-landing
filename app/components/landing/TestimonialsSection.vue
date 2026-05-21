<template>
  <LandingUiSectionWrapper
    badge="Отзывы"
    title="Что говорят наши пользователи"
    accent="наши пользователи"
    subtitle="Клиники и семьи, которые уже используют платформу"
  >
    <div class="tm-bento">
      <!-- Each testimonial — class derives layout from `span` field -->
      <article
        v-for="(t, i) in testimonials"
        :key="i"
        class="tm-card"
        :class="[`tm-card--${t.span}`, t.featured ? 'is-featured' : '']"
      >
        <!-- Optional top stripe (featured only) -->
        <span v-if="t.featured" class="tm-card-stripe" aria-hidden="true" />

        <!-- Quote symbol -->
        <span class="tm-quote-mark" aria-hidden="true">
          <Icon name="lucide:quote" size="20" />
        </span>

        <!-- Quote text -->
        <p class="tm-quote">{{ t.quote }}</p>

        <!-- Metric block (featured cards only) -->
        <div v-if="t.metric && (t.span === 'lg' || t.span === 'wide')" class="tm-metric">
          <span class="tm-metric-value t-kpi">{{ t.metric }}</span>
          <span class="tm-metric-label">{{ t.metricLabel }}</span>
        </div>

        <!-- Person identity row -->
        <footer class="tm-foot">
          <span class="tm-avatar" :style="{ background: t.color }">
            {{ initials(t.name) }}
          </span>
          <div class="tm-id">
            <span class="tm-name">{{ t.name }}</span>
            <span class="tm-role">{{ t.role }}</span>
            <span class="tm-clinic">{{ t.clinic }}</span>
          </div>
          <span v-if="t.metric && (t.span === 'sm')" class="tm-metric-inline">
            <span class="tm-metric-inline-val font-mono">{{ t.metric }}</span>
            <span class="tm-metric-inline-lbl">{{ t.metricLabel }}</span>
          </span>
          <span class="tm-stars" :aria-label="`Оценка ${t.rating} из 5`">
            <Icon v-for="r in t.rating" :key="r" name="lucide:star" size="11" />
          </span>
        </footer>
      </article>

      <!-- Verified clinics chip strip — bottom -->
      <div class="tm-verified">
        <span class="tm-verified-eyebrow t-eyebrow">
          <Icon name="lucide:badge-check" size="12" />
          Верифицированные клиники-партнёры
        </span>
        <div class="tm-verified-chips">
          <span v-for="c in verifiedClinics" :key="c.name" class="tm-verified-chip">
            <span class="tm-verified-dot" :style="{ background: c.color }" />
            {{ c.name }}
          </span>
        </div>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
interface Testimonial {
  name: string
  role: string
  clinic: string
  quote: string
  rating: number
  metric?: string
  metricLabel?: string
  color: string
  span: 'lg' | 'wide' | 'sm'
  featured?: boolean
}

const testimonials: Testimonial[] = [
  {
    name: 'Айгерим Сатпаева',
    role: 'Директор клиники',
    clinic: 'Мать и Дитя, Алматы',
    quote: 'За 4 месяца мы увеличили удержание с 33% до 61%. Координаторы наконец видят всю картину — кто на каком этапе, кому нужно напомнить, у кого просрочен визит. Окупаемость за квартал.',
    rating: 5,
    metric: '+85%',
    metricLabel: 'рост удержания',
    color: 'linear-gradient(135deg, #8B7EC8, #6E5FB3)',
    span: 'lg',
    featured: true,
  },
  {
    name: 'Дамира Нурланова',
    role: 'Мама',
    clinic: 'MedPark, Астана',
    quote: 'Первая беременность — столько тревоги. А тут открываешь приложение и видишь: сегодня витамин D, через 3 дня — УЗИ, через неделю — скрининг. Всё понятно.',
    rating: 5,
    metric: '0',
    metricLabel: 'пропущенных визитов',
    color: 'linear-gradient(135deg, #E8A0BF, #D47EA5)',
    span: 'sm',
  },
  {
    name: 'Марат Абилов',
    role: 'Руководитель педиатрии',
    clinic: 'SunMed, Шымкент',
    quote: 'Раньше после выписки мы теряли 70% семей. Сейчас маршрут автоматически ведёт их до 2 лет — вакцинация, осмотры, анализы. Семьи остаются с нами на годы.',
    rating: 5,
    metric: '×3.2',
    metricLabel: 'рост дохода на семью',
    color: 'linear-gradient(135deg, #5BC0BE, #3FA5A3)',
    span: 'wide',
    featured: true,
  },
  {
    name: 'Алия Касымова',
    role: 'Мама двойни',
    clinic: 'BabyClinic, Алматы',
    quote: 'С двойней — двойной хаос. Приложение всё разделило и напоминает для каждого ребёнка отдельно.',
    rating: 5,
    metric: '100%',
    metricLabel: 'прививок вовремя',
    color: 'linear-gradient(135deg, #F2C4A0, #E0A370)',
    span: 'sm',
  },
  {
    name: 'Бекзат Оспанов',
    role: 'Координатор',
    clinic: 'Мать и Дитя, Алматы',
    quote: 'Я веду 180 семей через панель. Раньше предел был 35 через WhatsApp. Задачи приоритизированы, я вижу кто «красный» — и звоню.',
    rating: 5,
    metric: '180',
    metricLabel: 'семей одновременно',
    color: 'linear-gradient(135deg, #A8C8E8, #8B7EC8)',
    span: 'sm',
  },
  {
    name: 'Жанна Тулегенова',
    role: 'Мама',
    clinic: 'KidsCare, Караганда',
    quote: 'Документы — моя больная тема. Раньше скриншоты анализов были в 5 чатах. Теперь всё в одном месте. При смене врача — просто показала экран.',
    rating: 5,
    metric: '47',
    metricLabel: 'документов в архиве',
    color: 'linear-gradient(135deg, #E8A0BF, #8B7EC8)',
    span: 'sm',
  },
]

const verifiedClinics = [
  { name: 'Мать и Дитя', color: '#8B7EC8' },
  { name: 'MedPark', color: '#E8A0BF' },
  { name: 'SunMed', color: '#5BC0BE' },
  { name: 'BabyClinic', color: '#F2C4A0' },
  { name: 'KidsCare', color: '#A8C8E8' },
]

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')
}
</script>

<style scoped>
/* ════════════════════════════════════════════════
   Phase 10 — Testimonials bento-grid
   ════════════════════════════════════════════════ */

.tm-bento {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: minmax(180px, auto);
  gap: 16px;
  max-width: 1120px;
  margin: 0 auto;
}

/* Card sizes: lg = 2x2, wide = 2x1, sm = 1x1 */
.tm-card--lg { grid-column: span 2; grid-row: span 2; }
.tm-card--wide { grid-column: span 2; }
.tm-card--sm { grid-column: span 1; }

/* Verified strip spans full width */
.tm-verified {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

/* ─── Card base ─── */
.tm-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px 24px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-lg);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 1px 2px rgba(75, 50, 130, 0.03),
    0 8px 24px -8px rgba(139, 126, 200, 0.10);
  transition: box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.tm-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 4px 8px rgba(75, 50, 130, 0.04),
    0 24px 60px -12px rgba(139, 126, 200, 0.22);
}

/* Featured cards — extra emphasis */
.tm-card.is-featured {
  background: linear-gradient(180deg, #FFFFFF 0%, #FAF7FD 100%);
  border-color: rgba(139, 126, 200, 0.20);
  padding: 26px 28px;
}

.tm-card-stripe {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #5BC0BE, #8B7EC8, #E8A0BF);
}

/* Quote icon */
.tm-quote-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary);
  flex-shrink: 0;
  opacity: 0.7;
}

.tm-card.is-featured .tm-quote-mark {
  background: var(--gradient-cta);
  color: white;
  opacity: 1;
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.45);
}

/* Quote text */
.tm-quote {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--color-text-primary);
  flex: 1;
  text-wrap: pretty;
}

.tm-card--lg .tm-quote {
  font-size: 1.0625rem;
  line-height: 1.55;
}

.tm-card--sm .tm-quote {
  font-size: 0.85rem;
  line-height: 1.5;
}

/* Metric block (featured wide / lg) */
.tm-metric {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.06), rgba(232, 160, 191, 0.04));
  border-left: 3px solid var(--color-primary);
  border-radius: 8px;
}

.tm-metric-value {
  font-size: 1.8rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tm-metric-label {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  letter-spacing: var(--tracking-snug);
}

/* Footer with avatar + identity */
.tm-foot {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border-light);
}

.tm-card--sm .tm-foot {
  grid-template-columns: 32px minmax(0, 1fr) auto;
}

.tm-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  box-shadow:
    0 0 0 2px white,
    0 0 0 3px rgba(139, 126, 200, 0.12),
    0 2px 6px rgba(75, 50, 130, 0.10);
}

.tm-card--sm .tm-avatar {
  width: 32px;
  height: 32px;
  font-size: 0.7rem;
}

.tm-id {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}

.tm-name {
  font-family: var(--font-display);
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tm-role {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
}

.tm-clinic {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

/* Inline metric (for sm cards) */
.tm-metric-inline {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
  padding: 0 8px;
}

.tm-metric-inline-val {
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--color-primary);
  line-height: 1;
}

.tm-metric-inline-lbl {
  font-size: 0.6rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 2px;
}

/* Stars */
.tm-stars {
  display: inline-flex;
  gap: 1px;
  color: #F4C430;
  flex-shrink: 0;
}

.tm-card--sm .tm-stars { display: none; }

/* ─── Verified bottom strip ─── */
.tm-verified-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: rgba(91, 192, 190, 0.10);
  border: 1px solid rgba(91, 192, 190, 0.22);
  color: var(--color-mint-dark, #3FA5A3);
}

.tm-verified-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.tm-verified-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.14);
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: var(--tracking-snug);
  box-shadow: 0 2px 6px -2px rgba(139, 126, 200, 0.10);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tm-verified-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -4px rgba(139, 126, 200, 0.18);
}

.tm-verified-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}

/* ─── Responsive ─── */
@media (max-width: 900px) {
  .tm-bento {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: auto;
  }
  .tm-card--lg { grid-column: span 2; grid-row: auto; }
  .tm-card--wide { grid-column: span 2; }
  .tm-card--sm { grid-column: span 1; }
}

@media (max-width: 600px) {
  .tm-bento {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .tm-card--lg,
  .tm-card--wide,
  .tm-card--sm {
    grid-column: span 1;
  }
  .tm-card,
  .tm-card.is-featured {
    padding: 22px 20px;
  }
  .tm-foot {
    grid-template-columns: 32px 1fr auto;
  }
  .tm-metric-inline { display: none; }
}

@media (max-width: 480px) {
  .tm-quote {
    font-size: 0.92rem;
    line-height: 1.55;
  }
  .tm-card.is-featured .tm-metric {
    font-size: 1.6rem;
  }
}
</style>
