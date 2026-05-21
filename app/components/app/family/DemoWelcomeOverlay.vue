<template>
  <Transition name="welcome-fade">
    <div
      v-if="visible"
      class="welcome-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      @click.self="dismiss"
    >
      <!-- Backdrop with grain -->
      <div class="welcome-backdrop" />

      <!-- Card -->
      <div class="welcome-card" :data-step="step">
        <!-- Close X -->
        <button class="welcome-close" type="button" :aria-label="`Закрыть. Шаг ${step + 1} из ${steps.length}.`" @click="dismiss">
          <Icon name="lucide:x" size="18" />
        </button>

        <!-- Visual side — animated illustration per step -->
        <div class="welcome-visual" aria-hidden="true">
          <!-- Step 0 — Welcome / Brand intro -->
          <div v-if="step === 0" class="visual-stage visual-stage-0">
            <div class="brand-pulse">
              <div class="brand-pulse-core">
                <Icon name="lucide:heart-pulse" size="32" />
              </div>
              <div class="brand-pulse-ring brand-pulse-ring-1" />
              <div class="brand-pulse-ring brand-pulse-ring-2" />
              <div class="brand-pulse-ring brand-pulse-ring-3" />
            </div>
          </div>

          <!-- Step 1 — Adherence hint (mini progress visual) -->
          <div v-else-if="step === 1" class="visual-stage visual-stage-1">
            <div class="hint-card">
              <span class="hint-card-label t-eyebrow">Сегодня</span>
              <div class="hint-progress">
                <svg viewBox="0 0 120 120" class="hint-ring">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(139,126,200,0.12)" stroke-width="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#welcomeGrad)" stroke-width="10"
                    stroke-linecap="round"
                    transform="rotate(-90 60 60)"
                    stroke-dasharray="314"
                    stroke-dashoffset="78"
                  />
                  <defs>
                    <linearGradient id="welcomeGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stop-color="#8B7EC8" />
                      <stop offset="100%" stop-color="#E8A0BF" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="hint-progress-center">
                  <span class="hint-progress-num font-mono">75<sup>%</sup></span>
                </div>
              </div>
              <div class="hint-progress-meta">
                <Icon name="lucide:check-circle-2" size="14" class="meta-icon meta-icon-good" />
                <span>4 из 5 доз приняты</span>
              </div>
            </div>
          </div>

          <!-- Step 2 — Body map preview -->
          <div v-else-if="step === 2" class="visual-stage visual-stage-2">
            <div class="body-preview">
              <svg viewBox="0 0 120 180" class="body-svg">
                <!-- Simplified body silhouette -->
                <path
                  d="M60 12 a14 14 0 1 1 0 28 a14 14 0 1 1 0 -28
                     M48 42 L72 42 L78 58 L72 95 L68 130 L66 168
                     L54 168 L52 130 L48 95 L42 58 Z"
                  fill="rgba(139,126,200,0.08)"
                  stroke="rgba(139,126,200,0.20)"
                  stroke-width="1"
                />
                <!-- Pulse dots on organs -->
                <g class="body-dots">
                  <circle cx="60" cy="62" r="4" fill="#5BC0BE" class="dot dot-heart">
                    <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="60" cy="62" r="4" fill="#5BC0BE" opacity="0.3" class="dot dot-heart-pulse">
                    <animate attributeName="r" values="4;14;4" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="68" cy="82" r="3" fill="#E8A0BF">
                    <animate attributeName="r" values="3;5;3" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="52" cy="100" r="3" fill="#8B7EC8">
                    <animate attributeName="r" values="3;5;3" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                </g>
              </svg>
              <div class="body-tag body-tag-1">сердце</div>
              <div class="body-tag body-tag-2">сон</div>
            </div>
          </div>

          <!-- Step 3 — Quick keys -->
          <div v-else class="visual-stage visual-stage-3">
            <div class="kbd-row">
              <span class="kbd">⌘</span>
              <span class="kbd-plus">+</span>
              <span class="kbd">K</span>
            </div>
            <div class="kbd-caption">Командная палитра</div>
            <div class="kbd-sub-row">
              <span class="kbd kbd-sm">Esc</span>
              <span class="kbd-sm-label">— закрыть</span>
            </div>
          </div>
        </div>

        <!-- Text side -->
        <div class="welcome-body">
          <span class="welcome-step-counter font-mono">{{ String(step + 1).padStart(2, '0') }} / {{ String(steps.length).padStart(2, '0') }}</span>
          <h2 id="welcome-title" class="welcome-title t-h3">{{ currentStep.title }}</h2>
          <p class="welcome-text t-body">{{ currentStep.body }}</p>

          <!-- Step indicators -->
          <div class="welcome-dots" role="tablist" aria-label="Шаги тура">
            <button
              v-for="(_, i) in steps"
              :key="i"
              class="welcome-dot"
              :class="{ 'is-active': i === step, 'is-passed': i < step }"
              type="button"
              :aria-label="`Перейти к шагу ${i + 1}`"
              :aria-current="i === step ? 'step' : undefined"
              @click="goTo(i)"
            />
          </div>

          <!-- Actions -->
          <div class="welcome-actions">
            <button
              v-if="step > 0"
              class="welcome-btn welcome-btn-ghost"
              type="button"
              @click="prev"
            >
              <Icon name="lucide:arrow-left" size="14" />
              Назад
            </button>
            <button
              v-else
              class="welcome-btn welcome-btn-ghost"
              type="button"
              @click="dismiss"
            >
              Пропустить
            </button>

            <button
              class="welcome-btn welcome-btn-primary"
              type="button"
              @click="next"
            >
              {{ step === steps.length - 1 ? 'Начать' : 'Дальше' }}
              <Icon :name="step === steps.length - 1 ? 'lucide:sparkles' : 'lucide:arrow-right'" size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** localStorage key used to remember dismissal — keeps the modal from re-appearing */
  storageKey?: string
}>()

const STORAGE_KEY = props.storageKey || 'umai-demo-welcome-seen'

const steps = [
  {
    title: 'Добро пожаловать в кабинет семьи',
    body: 'Это интерактивная демо-версия — все данные тестовые. Покажу основные блоки за 30 секунд, потом можно изучать самостоятельно.',
  },
  {
    title: 'Соблюдение назначений в одно касание',
    body: 'Каждое утро видите дневной план: какие препараты, во сколько, что уже принято. Одно касание — и доза отмечена. История адхеренса автоматически едет к врачу.',
  },
  {
    title: 'Карта здоровья ребёнка',
    body: 'Один экран — все органы и системы: сердцебиение, сон, рост, прививки, питание. Каждая точка кликается и раскрывает детали с тенденцией за месяц.',
  },
  {
    title: 'Быстрая навигация — ⌘ K',
    body: 'Откройте командную палитру и перейдите к любому разделу за две клавиши. Это инструмент уровня Linear и Notion — теперь и в медицине.',
  },
]

const visible = ref(false)
const step = ref(0)
const currentStep = computed(() => steps[step.value]!)

onMounted(() => {
  // Show after small delay — let the dashboard render first
  if (typeof window === 'undefined') return
  const seen = window.localStorage?.getItem(STORAGE_KEY)
  if (!seen) {
    setTimeout(() => { visible.value = true }, 700)
  }
})

function next() {
  if (step.value < steps.length - 1) {
    step.value++
  } else {
    dismiss()
  }
}

function prev() {
  if (step.value > 0) step.value--
}

function goTo(i: number) {
  step.value = i
}

function dismiss() {
  visible.value = false
  if (typeof window !== 'undefined') {
    window.localStorage?.setItem(STORAGE_KEY, '1')
  }
}

// Keyboard navigation
function onKeydown(e: KeyboardEvent) {
  if (!visible.value) return
  if (e.key === 'Escape') { e.preventDefault(); dismiss() }
  if (e.key === 'ArrowRight') { e.preventDefault(); next() }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// Expose for parent: programmatic open if user clicks "show tour again"
defineExpose({
  open() { step.value = 0; visible.value = true },
  close() { dismiss() },
})
</script>

<style scoped>
.welcome-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.welcome-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(27, 19, 48, 0.55);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
}

/* Grain over backdrop for premium feel */
.welcome-backdrop::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
  mix-blend-mode: overlay;
}

.welcome-card {
  position: relative;
  width: min(880px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.25fr);
  background: linear-gradient(160deg, #FEFCFF 0%, #FDF8FB 100%);
  border-radius: 24px;
  box-shadow:
    0 0 0 1px rgba(139, 126, 200, 0.08),
    0 32px 80px -16px rgba(75, 50, 130, 0.30),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  overflow: hidden;
  isolation: isolate;
}

.welcome-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-cta);
  z-index: 2;
}

.welcome-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(139, 126, 200, 0.10);
  color: var(--color-text-secondary);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  transition: background 0.2s ease, transform 0.2s ease;
}

.welcome-close:hover {
  background: rgba(139, 126, 200, 0.18);
  transform: rotate(90deg);
}

/* ─── Visual side ─── */
.welcome-visual {
  background: var(--gradient-pearl);
  position: relative;
  padding: 56px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 340px;
  border-right: 1px solid rgba(139, 126, 200, 0.08);
}

.welcome-visual::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232, 160, 191, 0.30), transparent 70%);
  filter: blur(40px);
}

.welcome-visual::after {
  content: '';
  position: absolute;
  bottom: -40px;
  left: -40px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.28), transparent 70%);
  filter: blur(40px);
}

.visual-stage {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Step 0 — Brand pulse */
.brand-pulse {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-pulse-core {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--gradient-cta);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.5) inset,
    0 16px 40px -8px rgba(139, 126, 200, 0.45),
    0 0 64px rgba(232, 160, 191, 0.4);
  z-index: 2;
}

.brand-pulse-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(139, 126, 200, 0.30);
  animation: brand-ring-grow 2.6s ease-out infinite;
}

.brand-pulse-ring-1 { width: 96px; height: 96px; }
.brand-pulse-ring-2 { width: 96px; height: 96px; animation-delay: 0.8s; }
.brand-pulse-ring-3 { width: 96px; height: 96px; animation-delay: 1.6s; }

@keyframes brand-ring-grow {
  0% { transform: scale(1); opacity: 0.6; border-color: rgba(139, 126, 200, 0.55); }
  100% { transform: scale(2.3); opacity: 0; border-color: rgba(232, 160, 191, 0.0); }
}

/* Step 1 — Adherence hint */
.hint-card {
  background: white;
  border-radius: 20px;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  box-shadow:
    0 0 0 1px rgba(139, 126, 200, 0.08),
    0 12px 32px -8px rgba(139, 126, 200, 0.18);
}

.hint-card-label {
  color: var(--color-text-muted);
}

.hint-progress {
  position: relative;
  width: 120px;
  height: 120px;
}

.hint-ring {
  width: 100%;
  height: 100%;
}

.hint-progress-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hint-progress-num {
  font-size: 1.75rem;
  font-weight: 500;
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.03em;
}

.hint-progress-num sup {
  font-size: 0.7rem;
  font-weight: 500;
}

.hint-progress-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.meta-icon-good {
  color: var(--color-mint, #5BC0BE);
}

/* Step 2 — Body map preview */
.body-preview {
  position: relative;
}

.body-svg {
  width: 140px;
  height: auto;
}

.body-tag {
  position: absolute;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: white;
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-primary);
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.25);
  white-space: nowrap;
}

.body-tag-1 {
  top: 38%;
  right: -16%;
  transform: translateY(-50%);
  color: var(--color-mint-dark, #3FA5A3);
}

.body-tag-1::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -16px;
  width: 16px;
  height: 1.5px;
  background: rgba(91, 192, 190, 0.45);
}

.body-tag-2 {
  top: 60%;
  left: -16%;
  transform: translateY(-50%);
  color: var(--color-secondary-dark);
}

.body-tag-2::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -16px;
  width: 16px;
  height: 1.5px;
  background: rgba(232, 160, 191, 0.45);
}

/* Step 3 — Keyboard */
.kbd-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 56px;
  padding: 0 14px;
  border-radius: 14px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.16);
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--color-text-primary);
  box-shadow:
    0 1px 0 rgba(75, 50, 130, 0.08) inset,
    0 4px 12px -4px rgba(139, 126, 200, 0.18),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
}

.kbd-plus {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--color-text-muted);
}

.kbd-caption {
  margin-top: 18px;
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.kbd-sub-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.kbd-sm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(139, 126, 200, 0.08);
  border: 1px solid rgba(139, 126, 200, 0.16);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

/* ─── Text side ─── */
.welcome-body {
  padding: 48px 44px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.welcome-step-counter {
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 500;
}

.welcome-title {
  margin: 0;
  color: var(--color-text-primary);
}

.welcome-text {
  margin: 0;
  color: var(--color-text-secondary);
  max-width: 36ch;
}

.welcome-dots {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.welcome-dot {
  width: 28px;
  height: 4px;
  border-radius: 2px;
  background: rgba(139, 126, 200, 0.18);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background 0.3s ease, transform 0.3s ease;
}

.welcome-dot:hover {
  background: rgba(139, 126, 200, 0.32);
}

.welcome-dot.is-active {
  background: var(--gradient-cta);
  transform: scaleY(1.4);
}

.welcome-dot.is-passed {
  background: var(--color-primary);
}

.welcome-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  align-items: center;
}

.welcome-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 20px;
  border-radius: 12px;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.welcome-btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.welcome-btn-ghost:hover {
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-text-primary);
}

.welcome-btn-primary {
  background: var(--gradient-cta);
  color: white;
  box-shadow: var(--shadow-glow-primary);
  margin-left: auto;
}

.welcome-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 40px -4px rgba(139, 126, 200, 0.5);
}

/* ─── Transitions ─── */
.welcome-fade-enter-active,
.welcome-fade-leave-active {
  transition: opacity 0.4s ease;
}

.welcome-fade-enter-active .welcome-card,
.welcome-fade-leave-active .welcome-card {
  transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.4s ease;
}

.welcome-fade-enter-from,
.welcome-fade-leave-to {
  opacity: 0;
}

.welcome-fade-enter-from .welcome-card,
.welcome-fade-leave-to .welcome-card {
  opacity: 0;
  transform: scale(0.96) translateY(20px);
}

/* ─── Mobile ─── */
@media (max-width: 720px) {
  .welcome-card {
    grid-template-columns: 1fr;
    max-width: 480px;
  }
  .welcome-visual {
    min-height: 220px;
    padding: 36px 24px;
    border-right: none;
    border-bottom: 1px solid rgba(139, 126, 200, 0.08);
  }
  .welcome-body {
    padding: 30px 28px 26px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .brand-pulse-ring,
  .dot-heart-pulse circle {
    animation: none;
  }
}
</style>
