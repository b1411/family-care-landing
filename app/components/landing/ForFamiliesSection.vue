<template>
  <LandingUiSectionWrapper
    id="for-families"
    badge="Для семей"
    title="Знаю, что дальше — каждый день"
    accent="каждый день"
    subtitle="Приложение клиники, которое ведёт вас по маршруту заботы с первого визита до 2 лет ребёнка"
  >
    <div class="ff-stage">
      <!-- ─── Phones fan (left) ─── -->
      <div class="ff-fan" data-reveal="fade-right">
        <!-- Decorative bloom -->
        <div class="ff-bloom ff-bloom-1" aria-hidden="true" />
        <div class="ff-bloom ff-bloom-2" aria-hidden="true" />

        <div class="ff-phones" :data-active="activeIdx">
          <button
            v-for="(screen, i) in screens"
            :key="screen.id"
            type="button"
            class="ff-phone"
            :class="[`ff-phone-${i}`, { 'is-active': activeIdx === i, 'is-side': activeIdx !== i }]"
            :aria-label="`Показать экран: ${screen.tab}`"
            @click="setActive(i)"
          >
            <div class="ff-phone-frame">
              <!-- Dynamic island -->
              <span class="ff-phone-island" aria-hidden="true" />

              <div class="ff-screen" :style="screen.brand">
                <!-- Status bar -->
                <header class="ff-screen-head">
                  <span class="ff-screen-clinic">UMAI Health</span>
                  <span class="ff-screen-time font-mono">09:41</span>
                </header>

                <!-- Tab strip (mini) -->
                <div class="ff-screen-tabs">
                  <span
                    v-for="(s, si) in screens"
                    :key="s.id"
                    class="ff-screen-tab"
                    :class="{ 'is-active-tab': si === i }"
                  >
                    <Icon :name="s.tabIcon" size="11" />
                    <span>{{ s.tab }}</span>
                  </span>
                </div>

                <!-- Content -->
                <div class="ff-screen-body">
                  <div class="ff-screen-title">{{ screen.title }}</div>
                  <div
                    v-for="item in screen.items"
                    :key="item.text"
                    class="ff-item"
                  >
                    <span class="ff-item-icon" :style="{ background: item.bg, color: item.color }">
                      <Icon :name="item.icon" size="11" />
                    </span>
                    <div class="ff-item-body">
                      <span class="ff-item-text">{{ item.text }}</span>
                      <span v-if="item.sub" class="ff-item-sub">{{ item.sub }}</span>
                    </div>
                    <span
                      v-if="item.badge"
                      class="ff-item-badge"
                      :style="{ background: item.badgeBg, color: item.badgeColor }"
                    >
                      {{ item.badge }}
                    </span>
                  </div>
                </div>

                <!-- Bottom nav -->
                <nav class="ff-screen-nav">
                  <span
                    v-for="(s, ni) in screens"
                    :key="s.id"
                    class="ff-screen-nav-item"
                    :class="{ 'is-active-nav': ni === i }"
                  >
                    <Icon :name="s.tabIcon" size="13" />
                  </span>
                  <span class="ff-screen-nav-item">
                    <Icon name="lucide:user" size="13" />
                  </span>
                </nav>
              </div>
            </div>
          </button>
        </div>

        <!-- Bottom progress dots -->
        <div class="ff-dots" role="tablist" aria-label="Переключение экранов">
          <button
            v-for="(screen, i) in screens"
            :key="screen.id"
            type="button"
            class="ff-dot"
            :class="{ 'is-active': activeIdx === i }"
            role="tab"
            :aria-selected="activeIdx === i"
            @click="setActive(i)"
          >
            <span class="ff-dot-inner" />
            <span class="ff-dot-label">{{ screen.tab }}</span>
          </button>
        </div>
      </div>

      <!-- ─── Benefits column (right) ─── -->
      <div class="ff-benefits">
        <div
          v-for="(benefit, i) in benefits"
          :key="benefit.title"
          class="ff-benefit"
          :class="{ 'is-highlighted': i === highlightedBenefit }"
          @mouseenter="highlightedBenefit = i"
          @mouseleave="highlightedBenefit = null"
        >
          <div class="ff-benefit-icon" :style="{ background: benefit.bg, color: benefit.color }">
            <Icon :name="benefit.icon" size="18" />
          </div>
          <div class="ff-benefit-body">
            <h3 class="ff-benefit-title t-h4">{{ benefit.title }}</h3>
            <p class="ff-benefit-desc">{{ benefit.desc }}</p>
          </div>
          <span class="ff-benefit-chev">
            <Icon name="lucide:arrow-right" size="13" />
          </span>
        </div>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
interface ScreenItem {
  icon: string
  text: string
  sub?: string
  bg: string
  color: string
  badge?: string
  badgeBg?: string
  badgeColor?: string
}

interface Screen {
  id: string
  tab: string
  tabIcon: string
  title: string
  items: ScreenItem[]
  brand: Record<string, string>
}

const screens: Screen[] = [
  {
    id: 'timeline',
    tab: 'Маршрут',
    tabIcon: 'lucide:route',
    title: 'Неделя 24 · 2 триместр',
    brand: { '--screen-accent': '#8B7EC8' },
    items: [
      { icon: 'lucide:check', text: 'УЗИ II триместра', sub: 'Завершено 15 марта', bg: 'rgba(91, 192, 190, 0.15)', color: '#3FA5A3', badge: '✓', badgeBg: 'rgba(91, 192, 190, 0.12)', badgeColor: '#3FA5A3' },
      { icon: 'lucide:calendar-check', text: 'Тест на диабет', sub: 'Сегодня, 10:30', bg: 'rgba(139, 126, 200, 0.15)', color: '#8B7EC8', badge: 'Сегодня', badgeBg: 'rgba(139, 126, 200, 0.10)', badgeColor: '#8B7EC8' },
      { icon: 'lucide:stethoscope', text: 'Визит к гинекологу', sub: 'Через 5 дней', bg: 'rgba(232, 160, 191, 0.18)', color: '#D47EA5' },
      { icon: 'lucide:activity', text: 'УЗИ III триместра', sub: '30–32 неделя', bg: 'rgba(168, 200, 232, 0.20)', color: '#4A8AC5' },
    ],
  },
  {
    id: 'pills',
    tab: 'Витамины',
    tabIcon: 'lucide:pill',
    title: 'Назначения на сегодня',
    brand: { '--screen-accent': '#E8A0BF' },
    items: [
      { icon: 'lucide:pill', text: 'Фолиевая кислота', sub: '09:00 · принята', bg: 'rgba(91, 192, 190, 0.15)', color: '#3FA5A3', badge: '✓', badgeBg: 'rgba(91, 192, 190, 0.12)', badgeColor: '#3FA5A3' },
      { icon: 'lucide:pill', text: 'Витамин D3 2000 ME', sub: '09:00 · сейчас', bg: 'rgba(232, 160, 191, 0.18)', color: '#D47EA5', badge: 'Принять', badgeBg: 'linear-gradient(135deg, #8B7EC8, #E8A0BF)', badgeColor: 'white' },
      { icon: 'lucide:pill', text: 'Йодомарин 200', sub: '12:00', bg: 'rgba(139, 126, 200, 0.15)', color: '#8B7EC8' },
      { icon: 'lucide:pill', text: 'Железо 30 мг', sub: '18:00', bg: 'rgba(242, 196, 160, 0.20)', color: '#C4870E' },
    ],
  },
  {
    id: 'docs',
    tab: 'Документы',
    tabIcon: 'lucide:folder',
    title: 'Медицинский архив',
    brand: { '--screen-accent': '#5BC0BE' },
    items: [
      { icon: 'lucide:file-text', text: 'Результат ОАК', sub: '12 марта 2026', bg: 'rgba(139, 126, 200, 0.15)', color: '#8B7EC8', badge: 'PDF', badgeBg: 'rgba(139, 126, 200, 0.10)', badgeColor: '#8B7EC8' },
      { icon: 'lucide:file-text', text: 'УЗИ-скрининг II', sub: '15 марта 2026', bg: 'rgba(168, 200, 232, 0.20)', color: '#4A8AC5', badge: 'PDF', badgeBg: 'rgba(168, 200, 232, 0.20)', badgeColor: '#4A8AC5' },
      { icon: 'lucide:file-text', text: 'Тройной тест', sub: '20 февраля 2026', bg: 'rgba(232, 160, 191, 0.18)', color: '#D47EA5', badge: 'PDF', badgeBg: 'rgba(232, 160, 191, 0.18)', badgeColor: '#D47EA5' },
      { icon: 'lucide:image', text: 'Фото УЗИ 16 нед.', sub: '01 февраля 2026', bg: 'rgba(91, 192, 190, 0.15)', color: '#3FA5A3' },
    ],
  },
]

const benefits = [
  { icon: 'lucide:route',         title: 'Понятный маршрут',         desc: 'Каждый визит, анализ и скрининг запланирован и виден в приложении. Больше не нужно гадать "что дальше".', bg: 'rgba(139, 126, 200, 0.12)', color: '#8B7EC8' },
  { icon: 'lucide:bell-ring',     title: 'Напоминания вовремя',      desc: 'Push и WhatsApp напомнят о витаминах, визитах и анализах за 3 дня. Ничего не забудется.', bg: 'rgba(232, 160, 191, 0.14)', color: '#D47EA5' },
  { icon: 'lucide:folder',         title: 'Всё в одном месте',         desc: 'Анализы, УЗИ, выписки, справки — в едином архиве. Привязаны к маршруту, всегда под рукой.', bg: 'rgba(168, 200, 232, 0.18)', color: '#4A8AC5' },
  { icon: 'lucide:shield-check',   title: 'Календарь прививок',        desc: '18 прививок по нацкалендарю РК. История партий, сертификат за один клик, уведомления заранее.', bg: 'rgba(91, 192, 190, 0.14)', color: '#3FA5A3' },
  { icon: 'lucide:headphones',     title: 'Координатор рядом',         desc: 'Если что-то пропущено — координатор клиники свяжется с вами. Вы не одни на этом маршруте.', bg: 'rgba(242, 196, 160, 0.18)', color: '#C4870E' },
]

const activeIdx = ref(0)
const highlightedBenefit = ref<number | null>(null)

function setActive(i: number) {
  activeIdx.value = i
}

// Auto-rotate phones every 5.5 sec — only when reduced motion is off and tab is visible
let rotateTimer: ReturnType<typeof setInterval> | null = null
let visibilityHandler: (() => void) | null = null

function startRotation() {
  if (rotateTimer) return
  rotateTimer = setInterval(() => {
    activeIdx.value = (activeIdx.value + 1) % screens.length
  }, 5500)
}

function stopRotation() {
  if (rotateTimer) {
    clearInterval(rotateTimer)
    rotateTimer = null
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) return

  if (!document.hidden) startRotation()

  visibilityHandler = () => {
    if (document.hidden) stopRotation()
    else startRotation()
  }
  document.addEventListener('visibilitychange', visibilityHandler)
})

onUnmounted(() => {
  stopRotation()
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler)
    visibilityHandler = null
  }
})
</script>

<style scoped>
/* ════════════════════════════════════════════════
   Phase 13 — Three-phones fan with auto-shuffle
   ════════════════════════════════════════════════ */

.ff-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 40px;
  align-items: center;
  max-width: 1120px;
  margin: 0 auto;
}

/* ─── Phones fan ─── */
.ff-fan {
  position: relative;
  perspective: 1600px;
  perspective-origin: center 60%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
  padding: 16px 0;
}

.ff-bloom {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.ff-bloom-1 {
  width: 380px;
  height: 380px;
  top: -60px;
  left: -40px;
  background: radial-gradient(circle, rgba(232, 160, 191, 0.28), transparent 70%);
}

.ff-bloom-2 {
  width: 320px;
  height: 320px;
  bottom: -40px;
  right: -40px;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.32), transparent 70%);
}

/* Phones container */
.ff-phones {
  position: relative;
  width: 100%;
  max-width: 540px;
  aspect-ratio: 1;
  transform-style: preserve-3d;
}

.ff-phone {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 220px;
  aspect-ratio: 9 / 19;
  margin-top: -240px;
  margin-left: -110px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transform-style: preserve-3d;
  will-change: transform;
  transition:
    transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1),
    opacity 0.7s ease,
    filter 0.7s ease;
  outline: none;
}

.ff-phone:focus-visible .ff-phone-frame {
  box-shadow:
    0 0 0 3px white,
    0 0 0 5px var(--color-primary),
    0 30px 60px -16px rgba(75, 50, 130, 0.50);
}

/* ─── Default positions for 3 phones — fan-out
   When activeIdx=1 (centre), phones are:
   0 (left): -28% rotate -12°, scale 0.88, behind
   1 (centre): 0% rotate 0°, scale 1, front
   2 (right): +28% rotate +12°, scale 0.88, behind
   ───
   When activeIdx changes — all phones shuffle */

/* Default layout (active = 0) */
.ff-phones[data-active="0"] .ff-phone-0 {
  transform: translate3d(0, 0, 80px) rotateY(0deg) scale(1);
  z-index: 3;
}
.ff-phones[data-active="0"] .ff-phone-1 {
  transform: translate3d(38%, 6%, -40px) rotateY(-22deg) scale(0.86);
  z-index: 2;
  filter: brightness(0.92);
  opacity: 0.88;
}
.ff-phones[data-active="0"] .ff-phone-2 {
  transform: translate3d(64%, 10%, -100px) rotateY(-30deg) scale(0.76);
  z-index: 1;
  filter: brightness(0.82) blur(0.5px);
  opacity: 0.72;
}

/* Layout when active = 1 (centre) */
.ff-phones[data-active="1"] .ff-phone-0 {
  transform: translate3d(-32%, 6%, -40px) rotateY(22deg) scale(0.86);
  z-index: 2;
  filter: brightness(0.92);
  opacity: 0.88;
}
.ff-phones[data-active="1"] .ff-phone-1 {
  transform: translate3d(0, 0, 80px) rotateY(0deg) scale(1);
  z-index: 3;
}
.ff-phones[data-active="1"] .ff-phone-2 {
  transform: translate3d(32%, 6%, -40px) rotateY(-22deg) scale(0.86);
  z-index: 2;
  filter: brightness(0.92);
  opacity: 0.88;
}

/* Layout when active = 2 */
.ff-phones[data-active="2"] .ff-phone-0 {
  transform: translate3d(-64%, 10%, -100px) rotateY(30deg) scale(0.76);
  z-index: 1;
  filter: brightness(0.82) blur(0.5px);
  opacity: 0.72;
}
.ff-phones[data-active="2"] .ff-phone-1 {
  transform: translate3d(-38%, 6%, -40px) rotateY(22deg) scale(0.86);
  z-index: 2;
  filter: brightness(0.92);
  opacity: 0.88;
}
.ff-phones[data-active="2"] .ff-phone-2 {
  transform: translate3d(0, 0, 80px) rotateY(0deg) scale(1);
  z-index: 3;
}

/* Side phone hover lift */
.ff-phone.is-side:hover {
  filter: brightness(0.98);
  opacity: 0.95;
}

/* Phone frame */
.ff-phone-frame {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 28px;
  background: linear-gradient(160deg, #1B1330, #2A1E47);
  padding: 8px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 24px 56px -16px rgba(75, 50, 130, 0.40),
    0 12px 24px -8px rgba(0, 0, 0, 0.25);
  transition: box-shadow 0.4s ease;
}

.ff-phone.is-active .ff-phone-frame {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.10) inset,
    0 32px 72px -16px rgba(75, 50, 130, 0.55),
    0 0 60px -8px var(--screen-accent, rgba(139, 126, 200, 0.4));
}

.ff-phone-island {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 16px;
  border-radius: 12px;
  background: #000;
  z-index: 10;
}

.ff-screen {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 22px;
  background: linear-gradient(180deg, #FAF7FD 0%, #FFFFFF 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-top: 30px;
}

/* Screen header */
.ff-screen-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 14px 4px;
}

.ff-screen-clinic {
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.ff-screen-time {
  font-size: 0.62rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
}

/* Mini tab strip */
.ff-screen-tabs {
  display: flex;
  gap: 4px;
  padding: 6px 10px 4px;
}

.ff-screen-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 4px 4px;
  border-radius: 6px;
  font-family: var(--font-display);
  font-size: 0.52rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
  background: transparent;
}

.ff-screen-tab.is-active-tab {
  background: rgba(139, 126, 200, 0.10);
  color: var(--color-primary);
}

/* Screen body */
.ff-screen-body {
  flex: 1;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow: hidden;
}

.ff-screen-title {
  font-family: var(--font-display);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--color-text-primary);
  padding: 0 4px;
  margin-bottom: 2px;
}

.ff-item {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  gap: 7px;
  align-items: center;
  padding: 5px 7px;
  background: rgba(248, 246, 252, 0.7);
  border-radius: 8px;
}

.ff-item-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ff-item-body {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}

.ff-item-text {
  font-family: var(--font-display);
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.005em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ff-item-sub {
  font-size: 0.52rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ff-item-badge {
  font-family: var(--font-display);
  font-size: 0.5rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

/* Nav bar */
.ff-screen-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 6px 14px 8px;
  border-top: 1px solid rgba(75, 50, 130, 0.06);
}

.ff-screen-nav-item {
  color: var(--color-text-muted);
  opacity: 0.55;
  display: flex;
}

.ff-screen-nav-item.is-active-nav {
  color: var(--color-primary);
  opacity: 1;
  filter: drop-shadow(0 0 4px rgba(139, 126, 200, 0.4));
}

/* ─── Progress dots ─── */
.ff-dots {
  display: flex;
  gap: 6px;
  align-items: center;
  z-index: 5;
}

.ff-dot {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  border-radius: var(--radius-full);
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.14);
  cursor: pointer;
  transition: all 0.25s ease;
}

.ff-dot-inner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(139, 126, 200, 0.30);
  transition: all 0.3s ease;
}

.ff-dot-label {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: var(--tracking-snug);
}

.ff-dot:hover {
  border-color: rgba(139, 126, 200, 0.30);
  transform: translateY(-1px);
}

.ff-dot.is-active {
  background: var(--gradient-cta);
  border-color: transparent;
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.40);
}

.ff-dot.is-active .ff-dot-inner {
  background: white;
}

.ff-dot.is-active .ff-dot-label {
  color: white;
}

/* ─── Benefits column ─── */
.ff-benefits {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ff-benefit {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 14px;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.08);
  border-radius: 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.ff-benefit:hover,
.ff-benefit.is-highlighted {
  border-color: rgba(139, 126, 200, 0.24);
  transform: translateX(4px);
  box-shadow: 0 8px 20px -6px rgba(139, 126, 200, 0.18);
}

.ff-benefit-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.ff-benefit:hover .ff-benefit-icon,
.ff-benefit.is-highlighted .ff-benefit-icon {
  transform: scale(1.08);
}

.ff-benefit-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.ff-benefit-title {
  margin: 0;
  color: var(--color-text-primary);
}

.ff-benefit-desc {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
  text-wrap: pretty;
}

.ff-benefit-chev {
  color: var(--color-text-muted);
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.25s ease;
}

.ff-benefit:hover .ff-benefit-chev,
.ff-benefit.is-highlighted .ff-benefit-chev {
  opacity: 1;
  transform: translateX(0);
  color: var(--color-primary);
}

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .ff-stage {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .ff-phones {
    max-width: 480px;
  }
}

@media (max-width: 720px) {
  .ff-phone {
    width: 180px;
    margin-top: -200px;
    margin-left: -90px;
  }
  /* Reduce fan spread on mobile */
  .ff-phones[data-active="0"] .ff-phone-1 {
    transform: translate3d(45%, 8%, -40px) rotateY(-18deg) scale(0.82);
  }
  .ff-phones[data-active="0"] .ff-phone-2 {
    transform: translate3d(70%, 12%, -100px) rotateY(-26deg) scale(0.70);
  }
  .ff-phones[data-active="1"] .ff-phone-0 {
    transform: translate3d(-38%, 8%, -40px) rotateY(18deg) scale(0.82);
  }
  .ff-phones[data-active="1"] .ff-phone-2 {
    transform: translate3d(38%, 8%, -40px) rotateY(-18deg) scale(0.82);
  }
  .ff-phones[data-active="2"] .ff-phone-0 {
    transform: translate3d(-70%, 12%, -100px) rotateY(26deg) scale(0.70);
  }
  .ff-phones[data-active="2"] .ff-phone-1 {
    transform: translate3d(-45%, 8%, -40px) rotateY(18deg) scale(0.82);
  }
}

@media (max-width: 480px) {
  .ff-phones { aspect-ratio: 0.9; }
  .ff-dots { flex-wrap: wrap; justify-content: center; }
  .ff-dot-label { display: none; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ff-phone {
    transition: none !important;
  }
}
</style>
