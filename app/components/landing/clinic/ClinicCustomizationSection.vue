<template>
  <LandingUiSectionWrapper
    id="white-label"
    badge="White-label"
    title="Ваш бренд. Ваше приложение."
    accent="Ваше приложение"
    subtitle="Семья видит приложение вашей клиники — с вашим логотипом, вашими цветами, вашим доменом. О платформе за кулисами они никогда не узнают."
  >
    <div class="wl-stage">
      <!-- ─── Drag-divider showcase ─── -->
      <div
        ref="stageRef"
        class="wl-frame"
        @mousedown="onPointerDown"
        @touchstart="onPointerDown"
      >
        <!-- Phone mockup — двойной экран (default + branded) -->
        <div class="wl-phone">
          <div class="wl-phone-frame">
            <!-- Dynamic Island -->
            <span class="wl-phone-island" aria-hidden="true" />

            <!-- Both screens stacked, clipped by divider -->
            <div class="wl-screens">
              <!-- LEFT: UMAI default brand -->
              <div class="wl-screen wl-screen--default">
                <div class="mock" :style="defaultBrandStyle">
                  <header class="mock-head">
                    <div class="mock-logo" :style="{ background: 'var(--brand-accent)' }">
                      <Icon name="lucide:heart" size="11" />
                    </div>
                    <span class="mock-clinic">UMAI Health</span>
                    <span class="mock-status">●</span>
                  </header>
                  <div class="mock-body">
                    <div class="mock-greeting">
                      <span class="mock-greet-name">Привет, Айгерим</span>
                      <span class="mock-greet-sub">{{ defaultFamily.child }} · {{ defaultFamily.age }}</span>
                    </div>
                    <div class="mock-card mock-card--big" :style="{ background: 'var(--brand-accent)' }">
                      <span class="mock-card-lbl">Адхеренс сегодня</span>
                      <span class="mock-card-val">94<sup>%</sup></span>
                      <div class="mock-card-bar">
                        <span class="mock-card-bar-fill" style="width: 94%;" />
                      </div>
                    </div>
                    <div class="mock-row">
                      <div class="mock-mini" :style="{ background: 'var(--brand-accent-soft)' }">
                        <span class="mock-mini-num">14</span>
                        <span class="mock-mini-lbl">дней streak</span>
                      </div>
                      <div class="mock-mini" :style="{ background: 'var(--brand-accent-soft)' }">
                        <span class="mock-mini-num">68<sup>%</sup></span>
                        <span class="mock-mini-lbl">маршрут</span>
                      </div>
                    </div>
                    <div class="mock-event">
                      <span class="mock-event-dot" :style="{ background: 'var(--brand-accent)' }" />
                      <div class="mock-event-body">
                        <span class="mock-event-name">УЗИ 2 триместра</span>
                        <span class="mock-event-when">через 3 дня</span>
                      </div>
                    </div>
                  </div>
                  <nav class="mock-nav">
                    <span class="mock-nav-item is-active" :style="{ color: 'var(--brand-accent-text-fallback)' }">●</span>
                    <span class="mock-nav-item">○</span>
                    <span class="mock-nav-item">○</span>
                    <span class="mock-nav-item">○</span>
                  </nav>
                </div>
              </div>

              <!-- RIGHT: Active clinic brand (clipped from left to dividerPos) -->
              <div class="wl-screen wl-screen--brand" :style="brandedClipStyle">
                <div class="mock" :style="activeBrandStyle">
                  <header class="mock-head">
                    <div class="mock-logo" :style="{ background: 'var(--brand-accent)' }">
                      <Icon :name="activeBrand.icon" size="11" />
                    </div>
                    <span class="mock-clinic">{{ activeBrand.name }}</span>
                    <span class="mock-status">●</span>
                  </header>
                  <div class="mock-body">
                    <div class="mock-greeting">
                      <span class="mock-greet-name">Привет, {{ activeBrand.family.mother }}</span>
                      <span class="mock-greet-sub">{{ activeBrand.family.child }} · {{ activeBrand.family.age }}</span>
                    </div>
                    <div class="mock-card mock-card--big" :style="{ background: 'var(--brand-accent)' }">
                      <span class="mock-card-lbl">Адхеренс сегодня</span>
                      <span class="mock-card-val">94<sup>%</sup></span>
                      <div class="mock-card-bar">
                        <span class="mock-card-bar-fill" style="width: 94%;" />
                      </div>
                    </div>
                    <div class="mock-row">
                      <div class="mock-mini" :style="{ background: 'var(--brand-accent-soft)' }">
                        <span class="mock-mini-num">14</span>
                        <span class="mock-mini-lbl">дней streak</span>
                      </div>
                      <div class="mock-mini" :style="{ background: 'var(--brand-accent-soft)' }">
                        <span class="mock-mini-num">68<sup>%</sup></span>
                        <span class="mock-mini-lbl">маршрут</span>
                      </div>
                    </div>
                    <div class="mock-event">
                      <span class="mock-event-dot" :style="{ background: 'var(--brand-accent)' }" />
                      <div class="mock-event-body">
                        <span class="mock-event-name">УЗИ 2 триместра</span>
                        <span class="mock-event-when">через 3 дня</span>
                      </div>
                    </div>
                  </div>
                  <nav class="mock-nav">
                    <span class="mock-nav-item is-active">●</span>
                    <span class="mock-nav-item">○</span>
                    <span class="mock-nav-item">○</span>
                    <span class="mock-nav-item">○</span>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          <!-- Brand label badges on each side -->
          <div class="wl-label wl-label--left" :style="{ left: `calc(${dividerPos}% - 130px)` }">
            <span class="wl-label-tag wl-label-tag--default">
              <span class="wl-label-dot" />
              UMAI default
            </span>
          </div>
          <div class="wl-label wl-label--right" :style="{ left: `calc(${dividerPos}% + 20px)` }">
            <span class="wl-label-tag" :style="{ background: activeBrand.accent, color: 'white' }">
              <span class="wl-label-dot" style="background: white;" />
              {{ activeBrand.name }}
            </span>
          </div>
        </div>

        <!-- Divider line + handle -->
        <div
          class="wl-divider"
          :style="{ left: `${dividerPos}%` }"
          role="slider"
          tabindex="0"
          aria-label="Перетащите, чтобы сравнить брендинг"
          :aria-valuenow="Math.round(dividerPos)"
          aria-valuemin="10"
          aria-valuemax="90"
          @keydown.left.prevent="moveDivider(-2)"
          @keydown.right.prevent="moveDivider(2)"
        >
          <span class="wl-divider-line" />
          <button type="button" class="wl-divider-handle" aria-hidden="true">
            <Icon name="lucide:chevron-left" size="13" class="handle-arrow" />
            <Icon name="lucide:chevron-right" size="13" class="handle-arrow" />
          </button>
          <span class="wl-divider-hint font-mono">drag</span>
        </div>

        <!-- Floating "drag me" hint (first-time) -->
        <div v-if="showHint" class="wl-hint" aria-hidden="true">
          <Icon name="lucide:move-horizontal" size="14" />
          <span>Потяните за разделитель</span>
        </div>
      </div>

      <!-- ─── Brand selector ─── -->
      <div class="wl-selector">
        <header class="wl-selector-head">
          <span class="t-eyebrow">Выберите клинику</span>
          <h3 class="t-h4 wl-selector-title">Бренд переключается мгновенно</h3>
        </header>

        <div class="wl-brands" role="tablist" aria-label="Бренды клиник">
          <button
            v-for="(brand, i) in brandPresets"
            :key="brand.key"
            type="button"
            class="wl-brand"
            :class="{ 'is-active': activeBrandKey === brand.key }"
            role="tab"
            :aria-selected="activeBrandKey === brand.key"
            @click="setBrand(brand.key)"
          >
            <span class="wl-brand-logo" :style="{ background: brand.accent }">
              <Icon :name="brand.icon" size="16" />
            </span>
            <div class="wl-brand-id">
              <span class="wl-brand-name">{{ brand.name }}</span>
              <span class="wl-brand-domain font-mono">{{ brand.domain }}</span>
            </div>
            <span class="wl-brand-swatch" :style="{ background: brand.accent }" />
            <span class="wl-brand-tabindex font-mono">0{{ i + 1 }}</span>
            <span v-if="activeBrandKey === brand.key" class="wl-brand-active-mark">
              <Icon name="lucide:check" size="11" />
            </span>
          </button>
        </div>

        <!-- Brand customization features -->
        <div class="wl-features">
          <div class="wl-feature">
            <span class="wl-feature-icon"><Icon name="lucide:palette" size="14" /></span>
            <div>
              <span class="wl-feature-title">Логотип и фирменные цвета</span>
              <span class="wl-feature-meta">RGB · HEX · CSS-переменные</span>
            </div>
          </div>
          <div class="wl-feature">
            <span class="wl-feature-icon"><Icon name="lucide:globe" size="14" /></span>
            <div>
              <span class="wl-feature-title">Свой домен</span>
              <span class="wl-feature-meta font-mono">app.yourClinic.kz</span>
            </div>
          </div>
          <div class="wl-feature">
            <span class="wl-feature-icon"><Icon name="lucide:route" size="14" /></span>
            <div>
              <span class="wl-feature-title">Свои маршруты и протоколы</span>
              <span class="wl-feature-meta">50+ событий per template</span>
            </div>
          </div>
          <div class="wl-feature">
            <span class="wl-feature-icon"><Icon name="lucide:mail" size="14" /></span>
            <div>
              <span class="wl-feature-title">Шаблоны уведомлений</span>
              <span class="wl-feature-meta">SMS · push · email</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
interface Brand {
  key: string
  name: string
  domain: string
  icon: string
  accent: string
  accentSoft: string
  family: { mother: string; child: string; age: string }
}

const brandPresets: Brand[] = [
  {
    key: 'mid',
    name: 'Мать и Дитя',
    domain: 'app.mother-child.kz',
    icon: 'lucide:heart-pulse',
    accent: 'linear-gradient(135deg, #2A9D8F, #1E7A6E)',
    accentSoft: 'rgba(42, 157, 143, 0.10)',
    family: { mother: 'Камила Б.', child: 'Тимур', age: '22 неделя' },
  },
  {
    key: 'medpark',
    name: 'MedPark Family',
    domain: 'app.medpark.kz',
    icon: 'lucide:building-2',
    accent: 'linear-gradient(135deg, #E63946, #B82B36)',
    accentSoft: 'rgba(230, 57, 70, 0.10)',
    family: { mother: 'Дана Н.', child: 'Алиса', age: '3 мес 12 дней' },
  },
  {
    key: 'sunmed',
    name: 'SunMed',
    domain: 'app.sunmed.kz',
    icon: 'lucide:sun',
    accent: 'linear-gradient(135deg, #F4A261, #E76F51)',
    accentSoft: 'rgba(244, 162, 97, 0.10)',
    family: { mother: 'Мадина Е.', child: 'Аян', age: '14 месяцев' },
  },
  {
    key: 'kidscare',
    name: 'KidsCare',
    domain: 'app.kidscare.kz',
    icon: 'lucide:baby',
    accent: 'linear-gradient(135deg, #457B9D, #2E5F7C)',
    accentSoft: 'rgba(69, 123, 157, 0.10)',
    family: { mother: 'Жанна Т.', child: 'Дамир', age: '8 месяцев' },
  },
]

const defaultFamily = { mother: 'Айгерим', child: 'Тимур', age: '5 месяцев' }

const activeBrandKey = ref('mid')
const activeBrand = computed(
  () => brandPresets.find(b => b.key === activeBrandKey.value) || brandPresets[0]!,
)

function setBrand(key: string) {
  activeBrandKey.value = key
}

// ─── Divider state ───
const dividerPos = ref(50)
const showHint = ref(true)

const stageRef = ref<HTMLElement | null>(null)
let isDragging = false

function onPointerDown(e: MouseEvent | TouchEvent) {
  isDragging = true
  showHint.value = false
  movePointer(e)
  window.addEventListener('mousemove', movePointer)
  window.addEventListener('touchmove', movePointer, { passive: false })
  window.addEventListener('mouseup', onPointerUp)
  window.addEventListener('touchend', onPointerUp)
}

function movePointer(e: MouseEvent | TouchEvent) {
  if (!isDragging || !stageRef.value) return
  if ('touches' in e) e.preventDefault?.()
  const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
  if (clientX == null) return
  const rect = stageRef.value.getBoundingClientRect()
  const pct = ((clientX - rect.left) / rect.width) * 100
  dividerPos.value = Math.max(10, Math.min(90, pct))
}

function onPointerUp() {
  isDragging = false
  window.removeEventListener('mousemove', movePointer)
  window.removeEventListener('touchmove', movePointer)
  window.removeEventListener('mouseup', onPointerUp)
  window.removeEventListener('touchend', onPointerUp)
}

function moveDivider(delta: number) {
  dividerPos.value = Math.max(10, Math.min(90, dividerPos.value + delta))
  showHint.value = false
}

onUnmounted(() => { onPointerUp() })

// ─── Brand styles via CSS-vars ───
const defaultBrandStyle = computed(() => ({
  '--brand-accent': 'linear-gradient(135deg, #8B7EC8, #E8A0BF)',
  '--brand-accent-soft': 'rgba(139, 126, 200, 0.10)',
  '--brand-accent-text-fallback': '#8B7EC8',
}))

const activeBrandStyle = computed(() => ({
  '--brand-accent': activeBrand.value.accent,
  '--brand-accent-soft': activeBrand.value.accentSoft,
}))

const brandedClipStyle = computed(() => ({
  clipPath: `inset(0 0 0 ${dividerPos.value}%)`,
  WebkitClipPath: `inset(0 0 0 ${dividerPos.value}%)`,
}))
</script>

<style scoped>
/* ════════════════════════════════════════════════
   Phase 14 — White-label drag-divider showcase
   ════════════════════════════════════════════════ */

.wl-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 360px);
  gap: 36px;
  align-items: center;
  max-width: 1120px;
  margin: 0 auto;
}

/* ─── Drag frame ─── */
.wl-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  max-width: 460px;
  margin: 0 auto;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

/* ─── Phone mockup ─── */
.wl-phone {
  position: relative;
  width: 100%;
  height: 100%;
}

.wl-phone-frame {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 36px;
  background: linear-gradient(160deg, #1B1330, #2A1E47);
  padding: 10px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06) inset,
    0 24px 60px -16px rgba(75, 50, 130, 0.45),
    0 12px 24px -8px rgba(0, 0, 0, 0.30);
}

.wl-phone-island {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: 88px;
  height: 22px;
  border-radius: 16px;
  background: #000;
  z-index: 10;
}

.wl-screens {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 28px;
  overflow: hidden;
  background: #FAF7FD;
}

.wl-screen {
  position: absolute;
  inset: 0;
}

.wl-screen--default { z-index: 1; }
.wl-screen--brand { z-index: 2; }

/* ─── Mock interface (shared by both sides) ─── */
.mock {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  padding-top: 38px;
}

.mock-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 1px solid rgba(75, 50, 130, 0.06);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
}

.mock-logo {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.mock-clinic {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-text-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mock-status {
  color: #5BC0BE;
  font-size: 0.5rem;
  filter: drop-shadow(0 0 4px currentColor);
}

.mock-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  overflow: hidden;
}

.mock-greeting {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-bottom: 6px;
}

.mock-greet-name {
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.mock-greet-sub {
  font-size: 0.6rem;
  color: var(--color-text-muted);
}

.mock-card--big {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px 14px;
  border-radius: 12px;
  color: white;
  overflow: hidden;
  box-shadow: 0 6px 14px -4px rgba(75, 50, 130, 0.3);
}

.mock-card--big::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top right, rgba(255,255,255,0.20), transparent 50%);
  pointer-events: none;
}

.mock-card-lbl {
  position: relative;
  font-family: var(--font-display);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.85;
}

.mock-card-val {
  position: relative;
  font-family: var(--font-mono);
  font-size: 1.6rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
}

.mock-card-val sup {
  font-size: 0.5em;
  vertical-align: super;
}

.mock-card-bar {
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.20);
  border-radius: 2px;
  overflow: hidden;
}

.mock-card-bar-fill {
  display: block;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 2px;
}

.mock-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.mock-mini {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  padding: 8px 10px;
  border-radius: 10px;
}

.mock-mini-num {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  line-height: 1;
}

.mock-mini-num sup { font-size: 0.5em; vertical-align: super; }

.mock-mini-lbl {
  font-family: var(--font-display);
  font-size: 0.58rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.mock-event {
  display: grid;
  grid-template-columns: 8px 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  background: rgba(248, 246, 252, 0.7);
  border-radius: 10px;
}

.mock-event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}

.mock-event-body {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}

.mock-event-name {
  font-family: var(--font-display);
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mock-event-when {
  font-size: 0.55rem;
  color: var(--color-text-muted);
}

.mock-nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 14px 12px;
  border-top: 1px solid rgba(75, 50, 130, 0.06);
}

.mock-nav-item {
  font-size: 0.5rem;
  color: var(--color-text-muted);
}

.mock-nav-item.is-active {
  color: var(--color-primary);
  filter: drop-shadow(0 0 4px currentColor);
}

/* ─── Brand labels (floating outside phone) ─── */
.wl-label {
  position: absolute;
  top: -6px;
  z-index: 12;
  pointer-events: none;
}

.wl-label-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(75, 50, 130, 0.20);
}

.wl-label-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 4px currentColor;
}

.wl-label-tag--default {
  background: linear-gradient(135deg, #8B7EC8, #6E5FB3);
  color: white;
}

/* ─── Divider line + handle ─── */
.wl-divider {
  position: absolute;
  top: 16px;
  bottom: 16px;
  width: 0;
  transform: translateX(-50%);
  z-index: 15;
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.wl-divider:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 6px;
  border-radius: 4px;
}

.wl-divider-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.5));
  box-shadow:
    0 0 0 1px rgba(75, 50, 130, 0.20),
    0 0 16px rgba(255, 255, 255, 0.5);
}

.wl-divider-handle {
  position: relative;
  z-index: 2;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  box-shadow:
    0 0 0 4px rgba(255, 255, 255, 0.55),
    0 0 0 1px rgba(75, 50, 130, 0.20),
    0 8px 20px rgba(75, 50, 130, 0.30);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.wl-divider:hover .wl-divider-handle,
.wl-divider:focus-visible .wl-divider-handle {
  transform: scale(1.08);
  box-shadow:
    0 0 0 5px rgba(255, 255, 255, 0.65),
    0 0 0 1px var(--color-primary),
    0 12px 28px rgba(75, 50, 130, 0.40);
}

.wl-divider-handle .handle-arrow { margin: 0 -2px; }

.wl-divider-hint {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 0 4px rgba(75, 50, 130, 0.50);
  text-transform: uppercase;
}

/* First-time hint */
.wl-hint {
  position: absolute;
  top: -38px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.20);
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  color: var(--color-text-primary);
  white-space: nowrap;
  box-shadow: 0 6px 16px -4px rgba(139, 126, 200, 0.25);
  animation: wl-hint-bob 1.8s ease-in-out infinite;
}

@keyframes wl-hint-bob {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -4px); }
}

.wl-hint::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 9px;
  height: 9px;
  background: white;
  border-right: 1px solid rgba(139, 126, 200, 0.20);
  border-bottom: 1px solid rgba(139, 126, 200, 0.20);
}

/* ════════════════════════════════════════════════
   Brand selector
   ════════════════════════════════════════════════ */

.wl-selector {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.wl-selector-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wl-selector-head .t-eyebrow { color: var(--color-text-muted); }

.wl-selector-title {
  margin: 0;
  color: var(--color-text-primary);
}

.wl-brands {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wl-brand {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 16px auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
}

.wl-brand:hover {
  border-color: rgba(139, 126, 200, 0.30);
  transform: translateX(2px);
}

.wl-brand.is-active {
  border-color: rgba(139, 126, 200, 0.40);
  background: linear-gradient(90deg, rgba(139, 126, 200, 0.04), rgba(232, 160, 191, 0.02));
  box-shadow: 0 0 0 1px rgba(139, 126, 200, 0.20), 0 6px 16px -4px rgba(139, 126, 200, 0.18);
}

.wl-brand-logo {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 10px -4px rgba(75, 50, 130, 0.40);
}

.wl-brand-id {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.wl-brand-name {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: var(--tracking-snug);
}

.wl-brand-domain {
  font-size: 0.68rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
}

.wl-brand-swatch {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  box-shadow: 0 0 0 2px white, 0 0 0 3px rgba(139, 126, 200, 0.10);
}

.wl-brand-tabindex {
  font-size: 0.62rem;
  color: var(--color-text-muted);
  letter-spacing: 0.06em;
}

.wl-brand-active-mark {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--gradient-cta);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px white, 0 2px 6px rgba(139, 126, 200, 0.30);
}

/* Features list */
.wl-features {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px dashed rgba(139, 126, 200, 0.18);
}

.wl-feature {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  align-items: center;
  padding: 8px 12px;
  background: rgba(248, 246, 252, 0.5);
  border-radius: 10px;
}

.wl-feature-icon {
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

.wl-feature > div {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}

.wl-feature-title {
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: var(--tracking-snug);
}

.wl-feature-meta {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

/* ─── Mobile ─── */
@media (max-width: 900px) {
  .wl-stage {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .wl-frame {
    max-width: 360px;
  }
}

@media (max-width: 600px) {
  .wl-label {
    display: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .wl-hint {
    animation: none;
  }
}
</style>
