<template>
  <LandingUiSectionWrapper
    id="faq"
    badge="FAQ"
    :title="title"
    :subtitle="subtitle"
  >
    <div class="faq-layout">
      <!-- Categories rail (left) -->
      <aside class="faq-cats" role="tablist" aria-label="Категории вопросов">
        <button
          v-for="(cat, ci) in categories"
          :key="cat.key"
          type="button"
          class="faq-cat"
          :class="{ 'is-active': activeCat === cat.key }"
          role="tab"
          :aria-selected="activeCat === cat.key"
          @click="setCat(cat.key)"
        >
          <div class="faq-cat-icon" :data-tone="cat.tone">
            <Icon :name="cat.icon" size="16" />
          </div>
          <div class="faq-cat-body">
            <span class="faq-cat-name">{{ cat.label }}</span>
            <span class="faq-cat-meta">{{ catCount(cat.key) }} вопросов</span>
          </div>
          <Icon name="lucide:chevron-right" size="14" class="faq-cat-arrow" />
        </button>

        <!-- Help footer card -->
        <div class="faq-help">
          <div class="faq-help-icon">
            <Icon name="lucide:message-circle-question" size="18" />
          </div>
          <div class="faq-help-body">
            <span class="faq-help-title">Не нашли ответ?</span>
            <span class="faq-help-text">Команда отвечает в среднем за <strong>3 часа</strong></span>
            <a href="#contact" class="faq-help-cta">
              Написать нам
              <Icon name="lucide:arrow-right" size="11" />
            </a>
          </div>
        </div>
      </aside>

      <!-- Answers column (right) -->
      <div class="faq-answers">
        <!-- Active category header -->
        <div class="faq-cat-header">
          <div class="faq-cat-header-icon" :data-tone="activeCategory?.tone">
            <Icon :name="activeCategory?.icon || 'lucide:circle-help'" size="20" />
          </div>
          <div>
            <span class="t-eyebrow faq-cat-header-eyebrow">{{ activeCategory?.label }}</span>
            <h3 class="faq-cat-header-title t-h4">{{ activeCategory?.tagline }}</h3>
          </div>
        </div>

        <!-- Items -->
        <div class="faq-list">
          <article
            v-for="(item, idx) in activeItems"
            :key="`${activeCat}-${idx}`"
            class="faq-item"
            :class="{ 'is-open': openIndex === idx }"
          >
            <button class="faq-q" type="button" :aria-expanded="openIndex === idx" @click="toggle(idx)">
              <span class="faq-q-text">{{ item.q }}</span>
              <span class="faq-q-icon">
                <Icon name="lucide:plus" size="14" />
              </span>
            </button>
            <Transition name="faq-slide">
              <div v-if="openIndex === idx" class="faq-a">
                <p class="faq-a-text">{{ item.a }}</p>

                <!-- Inline visual per item -->
                <component
                  :is="'div'"
                  v-if="item.visual"
                  class="faq-visual"
                  :class="`faq-visual--${item.visual}`"
                >
                  <!-- Security badge stack -->
                  <template v-if="item.visual === 'security'">
                    <div class="vis-row">
                      <span class="vis-badge vis-badge--check">
                        <Icon name="lucide:lock" size="11" />
                        AES-256
                      </span>
                      <span class="vis-badge vis-badge--check">
                        <Icon name="lucide:shield-check" size="11" />
                        TLS 1.3
                      </span>
                      <span class="vis-badge vis-badge--check">
                        <Icon name="lucide:fingerprint" size="11" />
                        MFA
                      </span>
                      <span class="vis-badge vis-badge--check">
                        <Icon name="lucide:scroll-text" size="11" />
                        Audit · 3 года
                      </span>
                    </div>
                  </template>

                  <!-- 1-week implementation timeline -->
                  <template v-else-if="item.visual === 'timeline'">
                    <div class="vis-timeline">
                      <div v-for="(s, si) in implTimeline" :key="si" class="vis-step">
                        <span class="vis-step-num font-mono">{{ s.day }}</span>
                        <span class="vis-step-label">{{ s.label }}</span>
                      </div>
                    </div>
                  </template>

                  <!-- Languages chips -->
                  <template v-else-if="item.visual === 'langs'">
                    <div class="vis-row">
                      <span class="vis-lang vis-lang--live">🇰🇿 Қазақша</span>
                      <span class="vis-lang vis-lang--live">🇷🇺 Русский</span>
                      <span class="vis-lang">🇺🇿 Ўзбекча</span>
                      <span class="vis-lang">🇰🇬 Кыргыз</span>
                      <span class="vis-lang">🇬🇧 English</span>
                    </div>
                  </template>

                  <!-- Pricing tiers -->
                  <template v-else-if="item.visual === 'pricing'">
                    <div class="vis-pricing">
                      <div class="vis-tier">
                        <span class="vis-tier-name">Pilot</span>
                        <span class="vis-tier-price font-mono">3 мес.</span>
                        <span class="vis-tier-meta">особые условия</span>
                      </div>
                      <div class="vis-tier vis-tier--featured">
                        <span class="vis-tier-name">Production</span>
                        <span class="vis-tier-price font-mono">по пациентам</span>
                        <span class="vis-tier-meta">все 11 модулей</span>
                      </div>
                      <div class="vis-tier">
                        <span class="vis-tier-name">Enterprise</span>
                        <span class="vis-tier-price font-mono">персонально</span>
                        <span class="vis-tier-meta">white-label</span>
                      </div>
                    </div>
                  </template>

                  <!-- Device chips for PWA q -->
                  <template v-else-if="item.visual === 'pwa'">
                    <div class="vis-row">
                      <span class="vis-device">
                        <Icon name="lucide:smartphone" size="12" />
                        iOS Safari
                      </span>
                      <span class="vis-device">
                        <Icon name="lucide:smartphone" size="12" />
                        Android Chrome
                      </span>
                      <span class="vis-device">
                        <Icon name="lucide:laptop" size="12" />
                        Web-панель
                      </span>
                      <span class="vis-device vis-device--feature">
                        <Icon name="lucide:wifi-off" size="12" />
                        Офлайн
                      </span>
                    </div>
                  </template>

                  <!-- Partner clinics chips -->
                  <template v-else-if="item.visual === 'clinics'">
                    <div class="vis-row">
                      <span v-for="c in partnerClinics" :key="c" class="vis-clinic">{{ c }}</span>
                    </div>
                  </template>
                </component>
              </div>
            </Transition>
          </article>
        </div>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script lang="ts">
interface FaqItem {
  q: string
  a: string
  visual?: 'security' | 'timeline' | 'langs' | 'pricing' | 'pwa' | 'clinics'
}

interface FaqCategory {
  key: string
  label: string
  tagline: string
  icon: string
  tone: 'primary' | 'mint' | 'rose' | 'warm'
  items: FaqItem[]
}

const faqCategories: FaqCategory[] = [
  {
    key: 'platform',
    label: 'О платформе',
    tagline: 'Что такое UMAI Health и как она работает',
    icon: 'lucide:sparkles',
    tone: 'primary',
    items: [
      {
        q: 'Что такое UMAI Health?',
        a: 'Это цифровая платформа-маршрут для частных клиник. Названная в честь Умай — тюркской богини-покровительницы матерей и детей, — она ведёт семью по персональному маршруту наблюдения от зачатия до 2 лет ребёнка, автоматизирует напоминания, координацию и контроль назначений.',
      },
      {
        q: 'Это мобильное приложение?',
        a: 'Платформа — это PWA (Progressive Web App), которое устанавливается на телефон из браузера без App Store. Работает офлайн, отправляет пуш-уведомления, занимает минимум места. Для клиники — web-панель на компьютере.',
        visual: 'pwa',
      },
      {
        q: 'Какие клиники уже подключены?',
        a: 'Платформа находится на стадии запуска с первыми клиниками-партнёрами в Казахстане. Мы приглашаем клиники присоединиться на этапе пилота с особыми условиями.',
        visual: 'clinics',
      },
    ],
  },
  {
    key: 'security',
    label: 'Безопасность',
    tagline: 'Защита данных и соответствие законодательству',
    icon: 'lucide:shield-check',
    tone: 'mint',
    items: [
      {
        q: 'Мои данные в безопасности?',
        a: 'Да. Row Level Security изолирует данные каждой клиники. AES-256 шифрование, TLS 1.3, MFA для персонала, аудит-логи 3 года. Полное соответствие законодательству РК о персональных данных.',
        visual: 'security',
      },
      {
        q: 'Где хранятся данные?',
        a: 'Данные хранятся на серверах в дата-центрах Tier-III с резервированием. Региональное размещение в соответствии с требованиями локализации персональных данных РК.',
      },
      {
        q: 'Кто может видеть данные пациента?',
        a: 'Только медперсонал клиники с явным согласием семьи. Координатор видит маршрут и статусы, врач — клинические данные. Семья всегда видит, кто и когда смотрел её карту.',
      },
    ],
  },
  {
    key: 'impl',
    label: 'Внедрение',
    tagline: 'Как клиника подключается к UMAI Health',
    icon: 'lucide:rocket',
    tone: 'warm',
    items: [
      {
        q: 'Сколько времени занимает запуск?',
        a: 'Стандартный запуск — одна рабочая неделя. Мы загружаем брендинг, импортируем существующих пациентов, обучаем команду и переключаем семьи на платформу.',
        visual: 'timeline',
      },
      {
        q: 'Нужно ли менять существующие процессы?',
        a: 'Нет. Платформа адаптируется под ваши протоколы и формат работы координаторов. Мы делаем кастомизацию в первую неделю и продолжаем настраивать под обратную связь команды.',
      },
      {
        q: 'Какая поддержка после запуска?',
        a: 'Выделенный customer-success менеджер на первые 90 дней. Чат поддержки 09-22 по будням, экстренная линия 24/7. Ежемесячные ревью KPI и рекомендации по росту.',
      },
    ],
  },
  {
    key: 'pricing',
    label: 'Стоимость',
    tagline: 'Модель оплаты и пакеты',
    icon: 'lucide:credit-card',
    tone: 'rose',
    items: [
      {
        q: 'Сколько стоит платформа?',
        a: 'Модель — ежемесячная подписка для клиники. Базовый пакет включает все 11 модулей. Стоимость зависит от объёма пациентов — запросите демо для индивидуального предложения.',
        visual: 'pricing',
      },
      {
        q: 'Какие языки поддерживаются?',
        a: 'На старте — казахский и русский. Архитектура позволяет добавить любой язык. В планах — узбекский, кыргызский и английский.',
        visual: 'langs',
      },
      {
        q: 'Есть ли пилот?',
        a: 'Да. Первые 3 месяца — пилотная программа с фиксированной стоимостью и поддержкой 24/7. Если результат не устроит — расторгаем без штрафов.',
      },
    ],
  },
]

const implTimeline = [
  { day: '01', label: 'Брендинг + домен' },
  { day: '02', label: 'Импорт пациентов' },
  { day: '03', label: 'Настройка протоколов' },
  { day: '04', label: 'Обучение команды' },
  { day: '05', label: 'Подключение семей' },
]

const partnerClinics = ['Мать и Дитя', 'MedPark', 'SunMed', 'BabyClinic', 'KidsCare']
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
}>(), {
  title: 'Частые вопросы',
  subtitle: 'Ответы на ключевые вопросы о платформе и сотрудничестве',
})
void props // satisfies TS unused-var

const categories = faqCategories

const activeCat = ref<string>(categories[0]!.key)
const openIndex = ref<number | null>(0)

const activeCategory = computed(() => categories.find(c => c.key === activeCat.value) || null)
const activeItems = computed(() => activeCategory.value?.items || [])

function setCat(key: string) {
  activeCat.value = key
  openIndex.value = 0
}

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}

function catCount(key: string): number {
  return categories.find(c => c.key === key)?.items.length || 0
}
</script>

<style scoped>
/* ════════════════════════════════════════════════
   Phase 9 — FAQ two-column with inline visuals
   ════════════════════════════════════════════════ */

.faq-layout {
  display: grid;
  grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
  gap: 32px;
  align-items: start;
  max-width: 1080px;
  margin: 0 auto;
}

/* ─── Categories rail ─── */
.faq-cats {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: sticky;
  top: 100px;
}

.faq-cat {
  display: grid;
  grid-template-columns: 36px 1fr 14px;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-cat:hover {
  border-color: rgba(139, 126, 200, 0.24);
  transform: translateX(2px);
  box-shadow: 0 6px 16px -4px rgba(139, 126, 200, 0.12);
}

.faq-cat.is-active {
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.06), rgba(232, 160, 191, 0.04));
  border-color: rgba(139, 126, 200, 0.30);
  box-shadow: 0 0 0 1px rgba(139, 126, 200, 0.18), 0 8px 24px -8px rgba(139, 126, 200, 0.18);
}

.faq-cat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.25s ease;
}

.faq-cat-icon[data-tone="primary"] {
  background: linear-gradient(135deg, #8B7EC8, #6E5FB3);
  box-shadow: 0 4px 10px -4px rgba(139, 126, 200, 0.5);
}
.faq-cat-icon[data-tone="mint"] {
  background: linear-gradient(135deg, #5BC0BE, #3FA5A3);
  box-shadow: 0 4px 10px -4px rgba(91, 192, 190, 0.5);
}
.faq-cat-icon[data-tone="warm"] {
  background: linear-gradient(135deg, #F2C4A0, #E0A370);
  box-shadow: 0 4px 10px -4px rgba(242, 196, 160, 0.5);
}
.faq-cat-icon[data-tone="rose"] {
  background: linear-gradient(135deg, #E8A0BF, #D47EA5);
  box-shadow: 0 4px 10px -4px rgba(232, 160, 191, 0.5);
}

.faq-cat.is-active .faq-cat-icon {
  transform: scale(1.06);
}

.faq-cat-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.faq-cat-name {
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  color: var(--color-text-primary);
}

.faq-cat-meta {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.faq-cat-arrow {
  color: var(--color-text-muted);
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.faq-cat.is-active .faq-cat-arrow,
.faq-cat:hover .faq-cat-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--color-primary);
}

/* Help card */
.faq-help {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 12px;
  padding: 16px 16px;
  margin-top: 14px;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.08), rgba(232, 160, 191, 0.06));
  border: 1px solid rgba(139, 126, 200, 0.16);
  border-radius: 14px;
}

.faq-help-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(75, 50, 130, 0.10);
}

.faq-help-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.faq-help-title {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.faq-help-text {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.faq-help-text strong {
  color: var(--color-primary-dark);
  font-weight: 600;
}

.faq-help-cta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  transition: gap 0.2s ease;
}

.faq-help-cta:hover {
  gap: 6px;
}

/* ─── Answers column ─── */
.faq-answers {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-xl);
  padding: 28px 32px 30px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 12px 32px -12px rgba(139, 126, 200, 0.10);
}

.faq-cat-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--color-border-light);
}

.faq-cat-header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.faq-cat-header-icon[data-tone="primary"] {
  background: linear-gradient(135deg, #8B7EC8, #6E5FB3);
  box-shadow: 0 6px 14px -4px rgba(139, 126, 200, 0.5);
}
.faq-cat-header-icon[data-tone="mint"] {
  background: linear-gradient(135deg, #5BC0BE, #3FA5A3);
  box-shadow: 0 6px 14px -4px rgba(91, 192, 190, 0.5);
}
.faq-cat-header-icon[data-tone="warm"] {
  background: linear-gradient(135deg, #F2C4A0, #E0A370);
  box-shadow: 0 6px 14px -4px rgba(242, 196, 160, 0.5);
}
.faq-cat-header-icon[data-tone="rose"] {
  background: linear-gradient(135deg, #E8A0BF, #D47EA5);
  box-shadow: 0 6px 14px -4px rgba(232, 160, 191, 0.5);
}

.faq-cat-header-eyebrow {
  display: block;
  margin-bottom: 2px;
  color: var(--color-text-muted);
}

.faq-cat-header-title {
  margin: 0;
  color: var(--color-text-primary);
}

/* ─── Items ─── */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-item {
  border-radius: 14px;
  border: 1px solid rgba(139, 126, 200, 0.08);
  background: rgba(248, 246, 252, 0.4);
  overflow: hidden;
  transition: border-color 0.25s ease, background 0.25s ease;
}

.faq-item:hover {
  background: rgba(248, 246, 252, 0.7);
}

.faq-item.is-open {
  background: white;
  border-color: rgba(139, 126, 200, 0.22);
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.10);
}

.faq-q {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: padding 0.2s ease;
}

.faq-q-text {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  color: var(--color-text-primary);
  flex: 1;
}

.faq-q-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(139, 126, 200, 0.10);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.25s ease;
}

.faq-item.is-open .faq-q-icon {
  transform: rotate(45deg);
  background: var(--gradient-cta);
  color: white;
}

.faq-a {
  padding: 0 18px 18px;
  overflow: hidden;
}

.faq-a-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
  text-wrap: pretty;
}

/* ─── Inline visuals ─── */
.faq-visual {
  margin-top: 14px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.04), rgba(232, 160, 191, 0.03));
  border-radius: 12px;
  border: 1px solid rgba(139, 126, 200, 0.06);
}

.vis-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Security badges */
.vis-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  background: white;
  border: 1px solid rgba(91, 192, 190, 0.20);
  color: var(--color-mint-dark, #3FA5A3);
}

/* Timeline of implementation */
.vis-timeline {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  position: relative;
}

.vis-timeline::before {
  content: '';
  position: absolute;
  top: 16px;
  left: 8%;
  right: 8%;
  height: 1.5px;
  background: linear-gradient(90deg, #5BC0BE, #8B7EC8, #E8A0BF);
  z-index: 0;
}

.vis-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 1;
}

.vis-step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  box-shadow: 0 4px 10px -4px rgba(139, 126, 200, 0.4);
}

.vis-step-label {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.3;
}

/* Language chips */
.vis-lang {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.16);
  color: var(--color-text-secondary);
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 500;
}

.vis-lang--live {
  background: linear-gradient(135deg, rgba(91, 192, 190, 0.10), rgba(139, 126, 200, 0.06));
  border-color: rgba(91, 192, 190, 0.24);
  color: var(--color-text-primary);
  font-weight: 600;
}

/* Pricing tiers */
.vis-pricing {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.vis-tier {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: 10px;
}

.vis-tier--featured {
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.08), rgba(232, 160, 191, 0.06));
  border-color: rgba(139, 126, 200, 0.30);
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.18);
}

.vis-tier-name {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  color: var(--color-text-muted);
}

.vis-tier--featured .vis-tier-name {
  color: var(--color-primary);
}

.vis-tier-price {
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.vis-tier-meta {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

/* Device chips */
.vis-device {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.16);
  color: var(--color-text-secondary);
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 500;
}

.vis-device--feature {
  background: linear-gradient(135deg, rgba(91, 192, 190, 0.10), rgba(139, 126, 200, 0.06));
  border-color: rgba(91, 192, 190, 0.30);
  color: var(--color-mint-dark, #3FA5A3);
  font-weight: 600;
}

/* Clinic chips */
.vis-clinic {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: white;
  border: 1px solid rgba(232, 160, 191, 0.24);
  color: var(--color-secondary-dark);
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 500;
}

/* Slide animation */
.faq-slide-enter-active,
.faq-slide-leave-active {
  transition: max-height 0.3s ease, opacity 0.25s ease;
  overflow: hidden;
}

.faq-slide-enter-from,
.faq-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.faq-slide-enter-to,
.faq-slide-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* Mobile */
@media (max-width: 900px) {
  .faq-layout {
    grid-template-columns: 1fr;
  }
  .faq-cats {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 4px;
  }
  .faq-cats::-webkit-scrollbar { display: none; }
  .faq-cat {
    flex-shrink: 0;
    min-width: 220px;
  }
  .faq-help { display: none; }
  .faq-answers {
    padding: 22px 18px;
  }
  .vis-pricing {
    grid-template-columns: 1fr;
  }
  .vis-timeline {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px 8px;
  }
  .vis-timeline::before { display: none; }
}

@media (max-width: 480px) {
  .faq-cat { min-width: 180px; }
  .faq-answers { padding: 18px 14px; }
  .vis-timeline { grid-template-columns: 1fr; }
}
</style>
