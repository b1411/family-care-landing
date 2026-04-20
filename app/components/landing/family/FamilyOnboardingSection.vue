<template>
  <section ref="sectionRef" class="family-onboarding landing-section">
    <div class="landing-container">
      <div class="onboarding-header" data-reveal="fade-up">
        <span class="landing-badge">Начало</span>
        <h2 ref="titleRef" class="font-display section-title">Как подключиться за 3 минуты</h2>
        <p class="section-subtitle font-heading" data-reveal="fade-up">
          Никаких регистраций. Координатор клиники всё настроит — вам останется открыть ссылку.
        </p>
      </div>

      <!-- Progress line connecting steps -->
      <div class="onboarding-track">
        <div class="track-line" aria-hidden="true">
          <div ref="lineRef" class="track-line-fill" />
        </div>

        <div class="onboarding-steps">
          <!-- Step 1 -->
          <div class="step-card" data-reveal="fade-up">
            <div class="step-dot" :class="{ active: activeStep >= 0 }">
              <span>1</span>
            </div>
            <h3 class="step-title font-heading">Координатор создаёт аккаунт</h3>
            <p class="step-desc">На приёме или по телефону. Вводит имя ребёнка — маршрут рассчитывается автоматически.</p>
            <div class="step-screen">
              <div class="screen-inner">
                <div class="screen-row">
                  <span class="s-label">Ребёнок</span>
                  <span ref="typeName" class="s-value typed">{{ typeNameText }}</span>
                </div>
                <div class="screen-row">
                  <span class="s-label">Дата рождения</span>
                  <span class="s-value">15.07.2025</span>
                </div>
                <div class="screen-row">
                  <span class="s-label">Телефон мамы</span>
                  <span class="s-value">+7 7** *** **42</span>
                </div>
                <div class="screen-btn" :class="{ 'btn-done': activeStep >= 1 }">
                  {{ activeStep >= 1 ? '✓ Маршрут создан' : 'Создать маршрут' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="step-card" data-reveal="fade-up" data-reveal-delay="150">
            <div class="step-dot" :class="{ active: activeStep >= 1 }">
              <span>2</span>
            </div>
            <h3 class="step-title font-heading">Мама получает ссылку</h3>
            <p class="step-desc">WhatsApp-сообщение от клиники. Одно нажатие — приложение открылось.</p>
            <div class="step-screen">
              <div class="screen-inner chat-screen">
                <div :class="['chat-bubble', { visible: activeStep >= 1 }]">
                  <span class="chat-sender">Ваша клиника</span>
                  <p>Здравствуйте! Маршрут вашего ребёнка готов. Откройте: <span class="chat-link">care.clinic.kz/a/xK3m</span></p>
                  <span class="chat-time">09:41</span>
                </div>
                <div :class="['chat-action', { visible: activeStep >= 2 }]">
                  <Icon name="lucide:smartphone" size="16" class="action-icon" />
                  <span>Добавить на главный экран</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="step-card" data-reveal="fade-up" data-reveal-delay="300">
            <div class="step-dot" :class="{ active: activeStep >= 2 }">
              <span>3</span>
            </div>
            <h3 class="step-title font-heading">Маршрут готов</h3>
            <p class="step-desc">Визиты, прививки и назначения — уже на экране. Уведомления приходят автоматически.</p>
            <div class="step-screen">
              <div class="screen-inner welcome-screen">
                <div :class="['welcome-block', { visible: activeStep >= 2 }]">
                  <Icon name="lucide:party-popper" size="20" class="welcome-emoji" />
                  <strong>Добро пожаловать!</strong>
                  <span class="welcome-sub">Маршрут Алисы — 47 событий</span>
                </div>
                <div class="welcome-events">
                  <div :class="['w-event', { visible: activeStep >= 2 }]" style="transition-delay: 0.15s">
                    <span class="ev-dot ev-done" />
                    <span>Витамин D — сегодня</span>
                  </div>
                  <div :class="['w-event', { visible: activeStep >= 2 }]" style="transition-delay: 0.3s">
                    <span class="ev-dot ev-next" />
                    <span>Педиатр — завтра 10:00</span>
                  </div>
                  <div :class="['w-event', { visible: activeStep >= 2 }]" style="transition-delay: 0.45s">
                    <span class="ev-dot ev-future" />
                    <span>АКДС #2 — через 5 дней</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p class="onboarding-note" data-reveal="fade-up">
        <span class="note-pill">PWA</span>
        Работает без App Store. Открывается как сайт — но работает как приложение, даже без интернета.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGsap } from '~/composables/useGsap'

const sectionRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const lineRef = ref<HTMLElement | null>(null)
const activeStep = ref(-1)
const typeNameText = ref('')

useSplitText(titleRef, {
  type: 'words',
  from: { y: '100%', opacity: 0 },
  stagger: 0.04,
  duration: 0.7,
  ease: 'power3.out',
  scroll: true,
  scrollStart: 'top 85%',
})

let triggers: any[] = []
let typeTimer: ReturnType<typeof setTimeout> | null = null

function typeName() {
  const name = 'Алиса'
  let i = 0
  typeTimer = setInterval(() => {
    typeNameText.value = name.slice(0, ++i)
    if (i >= name.length) { clearInterval(typeTimer!); typeTimer = null }
  }, 120)
}

onMounted(() => {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    activeStep.value = 2
    typeNameText.value = 'Алиса'
    return
  }

  const { gsap, ScrollTrigger } = useGsap()
  const section = sectionRef.value
  if (!section) return

  // Drive progress line and step activation by scroll
  const st = ScrollTrigger.create({
    trigger: section,
    start: 'top 70%',
    end: 'bottom 40%',
    onUpdate: (self: any) => {
      const p = self.progress
      if (lineRef.value) lineRef.value.style.height = `${p * 100}%`
      if (p > 0.05 && activeStep.value < 0) { activeStep.value = 0; typeName() }
      if (p > 0.4 && activeStep.value < 1) activeStep.value = 1
      if (p > 0.7 && activeStep.value < 2) activeStep.value = 2
    },
  })
  triggers.push(st)
})

onUnmounted(() => {
  triggers.forEach(t => t.kill())
  triggers = []
  if (typeTimer) clearInterval(typeTimer)
})
</script>

<style scoped>
.onboarding-header {
  text-align: center;
  margin-bottom: 56px;
}

.onboarding-track {
  position: relative;
  max-width: var(--content-wide);
  margin: 0 auto;
}

/* Connecting vertical line */
.track-line {
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border-light);
  z-index: 0;
}

.track-line-fill {
  width: 100%;
  height: 0;
  background: var(--gradient-cta);
  border-radius: 1px;
  transition: height 0.1s linear;
}

.onboarding-steps {
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: relative;
  z-index: 1;
}

/* Step card */
.step-card {
  display: grid;
  grid-template-columns: auto 1fr 240px;
  gap: 20px 24px;
  align-items: start;
}

.step-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-muted);
  transition: all 0.5s cubic-bezier(0.2, 0.9, 0.3, 1);
  position: relative;
  z-index: 2;
}

.step-dot.active {
  background: var(--gradient-cta);
  border-color: var(--color-primary);
  color: white;
  box-shadow: 0 0 0 6px rgba(139, 126, 200, 0.15);
}

.step-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 8px 0 6px;
  grid-column: 2;
  grid-row: 1;
}

.step-desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0;
  grid-column: 2;
  grid-row: 2;
}

/* Mini screens */
.step-screen {
  grid-column: 3;
  grid-row: 1 / 3;
  align-self: center;
}

.screen-inner {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.4s;
}

.step-card:hover .screen-inner {
  box-shadow: var(--shadow-hover);
}

.screen-row {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.screen-row:last-of-type { border-bottom: none; }

.s-label {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.s-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.s-value.typed::after {
  content: '|';
  animation: blink 0.8s step-end infinite;
  color: var(--color-primary);
  margin-left: 1px;
}

@keyframes blink {
  50% { opacity: 0; }
}

.screen-btn {
  margin-top: 12px;
  padding: 8px;
  background: var(--color-border-light);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  text-align: center;
  transition: all 0.5s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.screen-btn.btn-done {
  background: var(--gradient-cta);
  color: white;
}

/* Chat screen */
.chat-bubble {
  background: var(--color-bg-alt);
  border-radius: 14px 14px 14px 4px;
  padding: 12px;
  opacity: 0;
  transform: translateY(10px) scale(0.95);
  transition: all 0.5s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.chat-bubble.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.chat-sender {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-primary);
  display: block;
  margin-bottom: 4px;
}

.chat-bubble p {
  font-size: 11px;
  line-height: 1.5;
  color: var(--color-text-primary);
  margin: 0;
}

.chat-link {
  color: var(--color-accent-blue);
  text-decoration: underline;
}

.chat-time {
  font-size: 9px;
  color: var(--color-text-muted);
  display: block;
  text-align: right;
  margin-top: 4px;
}

.chat-action {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px;
  border: 1.5px solid var(--color-primary);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  text-align: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) 0.3s;
}

.chat-action.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Welcome screen */
.welcome-block {
  text-align: center;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.5s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.welcome-block.visible {
  opacity: 1;
  transform: scale(1);
}

.welcome-emoji { font-size: 28px; }

.welcome-block strong {
  font-size: 14px;
  color: var(--color-text-primary);
}

.welcome-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.welcome-events {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.w-event {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.w-event.visible {
  opacity: 1;
  transform: translateX(0);
}

.ev-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ev-done { background: var(--color-success); }
.ev-next { background: var(--color-primary); }
.ev-future { background: var(--color-border); }

.onboarding-note {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 48px auto 0;
  max-width: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.note-pill {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

/* Mobile */
@media (max-width: 768px) {
  .step-card {
    grid-template-columns: auto 1fr;
    gap: 12px 16px;
  }

  .step-screen {
    grid-column: 1 / -1;
    grid-row: auto;
  }

  .track-line {
    left: 12px;
  }

  .step-dot {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
}
</style>
