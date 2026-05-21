<template>
  <section ref="sectionRef" class="family-emotion landing-section">
    <!-- Ambient orbs + dotted-grid pattern -->
    <div class="emotion-bg" aria-hidden="true">
      <div class="emotion-orb emotion-orb-1" />
      <div class="emotion-orb emotion-orb-2" />
      <div class="emotion-pattern" />
    </div>

    <div class="landing-container">
      <div class="emotion-header" data-reveal="fade-up">
        <span class="emotion-eyebrow t-eyebrow">
          <span class="eyebrow-dot" aria-hidden="true" />
          Знакомо?
        </span>
        <h2 class="emotion-title t-display-section">
          Каждая мама проходит <span class="t-accent-serif-gradient">через&nbsp;это</span>
        </h2>
        <p class="emotion-sub t-lead">
          4&nbsp;типичные ситуации — и&nbsp;как UMAI закрывает каждую из&nbsp;них в&nbsp;один тап.
        </p>
      </div>

      <div ref="listRef" class="pain-list">
        <article
          v-for="(pain, i) in pains"
          :key="pain.id"
          :class="['pain-card', { 'is-checked': pain.checked }]"
          :style="{ '--pain-accent': pain.color }"
        >
          <!-- Gradient border on hover/checked -->
          <span class="pain-card-border" aria-hidden="true" />

          <!-- Card header strip -->
          <header class="pain-head">
            <div class="pain-context">
              <span class="pain-context-icon" :style="{ background: pain.contextBg }">
                <Icon :name="pain.contextIcon" size="11" />
              </span>
              <span class="pain-context-label font-mono">{{ pain.context }}</span>
            </div>
            <span class="pain-index font-mono">0{{ i + 1 }}</span>
          </header>

          <!-- Pain body -->
          <div class="pain-body">
            <div class="pain-icon-wrap" :style="{ background: pain.iconBg }">
              <Icon :name="pain.icon" size="18" :style="{ color: pain.iconColor }" />
            </div>
            <div class="pain-text-wrap">
              <p class="pain-text">{{ pain.text }}</p>
            </div>
            <svg class="pain-checkbox" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <rect
                x="2" y="2" width="20" height="20" rx="6"
                fill="none"
                :stroke="pain.checked ? pain.iconColor : 'var(--color-border)'"
                stroke-width="1.5"
              />
              <path
                class="pain-checkmark"
                d="M7 12.5 L10.5 16 L17 8"
                fill="none"
                :stroke="pain.iconColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <!-- Solution preview -->
          <div class="pain-solution">
            <span class="pain-solution-arrow" aria-hidden="true">
              <Icon name="lucide:arrow-down" size="11" />
            </span>
            <div class="pain-solution-body">
              <span class="pain-solution-tag" :style="{ background: pain.iconBg, color: pain.iconColor }">
                В UMAI
              </span>
              <span class="pain-solution-text">{{ pain.solution }}</span>
            </div>
          </div>
        </article>
      </div>

      <!-- Resolve counter + CTA -->
      <div class="emotion-resolve" data-reveal="fade-up">
        <div class="resolve-counter-card">
          <div class="resolve-counter">
            <span ref="resolveNumRef" class="resolve-num font-display">{{ checkedCount }}</span>
            <span class="resolve-slash">/</span>
            <span class="resolve-total font-mono">{{ pains.length }}</span>
          </div>
          <p class="resolve-text">
            <span class="resolve-lead">проблем</span><br>
            <strong>решает одно приложение</strong>
          </p>
          <NuxtLink to="/demo?role=mom" class="resolve-cta">
            <span>Открыть демо для семьи</span>
            <Icon name="lucide:arrow-right" size="14" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useGsap } from '~/composables/useGsap'

const sectionRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const resolveNumRef = ref<HTMLElement | null>(null)

interface Pain {
  id: string
  context: string
  contextIcon: string
  contextBg: string
  icon: string
  iconColor: string
  iconBg: string
  color: string
  text: string
  solution: string
  checked: boolean
}

const pains = reactive<Pain[]>([
  {
    id: 'p1',
    context: '20:34 · WhatsApp',
    contextIcon: 'lucide:message-circle',
    contextBg: 'rgba(91, 192, 190, 0.14)',
    icon: 'lucide:search',
    iconColor: '#2A8886',
    iconBg: 'rgba(91, 192, 190, 0.14)',
    color: '#5BC0BE',
    text: 'Перед педиатром: «Где результат ОАК?» Ищу в WhatsApp, Telegram, галерее…',
    solution: 'Все анализы — в одном месте. Один тап → ОАК за 2 секунды.',
    checked: false,
  },
  {
    id: 'p2',
    context: 'Утро · Google',
    contextIcon: 'lucide:globe',
    contextBg: 'rgba(139, 126, 200, 0.14)',
    icon: 'lucide:shield-question',
    iconColor: '#8B7EC8',
    iconBg: 'rgba(139, 126, 200, 0.14)',
    color: '#8B7EC8',
    text: 'Ребёнку 4 месяца — какая прививка следующая? Гуглю и получаю 10 разных ответов.',
    solution: 'Нацкалендарь РК встроен. Следующая прививка с датой и партией.',
    checked: false,
  },
  {
    id: 'p3',
    context: 'После выписки · тишина',
    contextIcon: 'lucide:bell-off',
    contextBg: 'rgba(232, 160, 191, 0.16)',
    icon: 'lucide:phone-off',
    iconColor: '#D47EA5',
    iconBg: 'rgba(232, 160, 191, 0.16)',
    color: '#E8A0BF',
    text: 'После выписки из роддома — тишина. Клиника не звонит. Я не знаю, когда первый осмотр.',
    solution: 'Маршрут 0–24 мес. Координатор пишет первой, не вы.',
    checked: false,
  },
  {
    id: 'p4',
    context: '02:14 · паника',
    contextIcon: 'lucide:moon',
    contextBg: 'rgba(244, 162, 97, 0.16)',
    icon: 'lucide:thermometer',
    iconColor: '#C25E3E',
    iconBg: 'rgba(244, 162, 97, 0.16)',
    color: '#F4A261',
    text: 'Ночь. Температура 37.8. Это нормально после прививки или нет?',
    solution: 'AI-разбор симптомов + горячая линия клиники 24/7.',
    checked: false,
  },
])

const checkedCount = computed(() => pains.filter(p => p.checked).length)

let triggers: Array<{ kill: () => void }> = []

onMounted(() => {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    pains.forEach(p => { p.checked = true })
    return
  }

  const { gsap, ScrollTrigger } = useGsap()
  if (!gsap || !ScrollTrigger) return

  const rows = listRef.value?.querySelectorAll('.pain-card')
  if (!rows) return

  rows.forEach((row, i) => {
    gsap.set(row, { opacity: 0, y: 30, scale: 0.97 })

    const tEntrance = ScrollTrigger.create({
      trigger: row,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(row, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7, delay: i * 0.1, ease: 'power3.out',
        })
      },
    })
    triggers.push(tEntrance)

    const tCheck = ScrollTrigger.create({
      trigger: row,
      start: 'top 60%',
      once: true,
      onEnter: () => {
        // Stagger check-mark + slight bounce
        setTimeout(() => {
          pains[i]!.checked = true
          // Pulse the resolve counter
          if (resolveNumRef.value) {
            gsap.fromTo(resolveNumRef.value,
              { scale: 1 },
              { scale: 1.15, duration: 0.18, ease: 'power2.out',
                onComplete: () => gsap.to(resolveNumRef.value, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.4)' }) }
            )
          }
        }, i * 120)
      },
    })
    triggers.push(tCheck)
  })
})

onBeforeUnmount(() => {
  triggers.forEach(t => t.kill())
  triggers = []
})
</script>

<style scoped>
.family-emotion {
  position: relative;
  overflow: hidden;
  padding: 96px 0;
}

/* ─── Background decoration ─── */
.emotion-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.emotion-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.22;
}

.emotion-orb-1 {
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.38), transparent 65%);
  top: 6%;
  left: -120px;
}

.emotion-orb-2 {
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, rgba(232, 160, 191, 0.32), transparent 65%);
  bottom: 8%;
  right: -100px;
}

.emotion-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(139, 126, 200, 0.06) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse 70% 60% at center, black 20%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at center, black 20%, transparent 90%);
  opacity: 0.6;
}

.landing-container {
  position: relative;
  z-index: 1;
}

/* ─── Header ─── */
.emotion-header {
  text-align: center;
  margin-bottom: 56px;
}

.emotion-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 10px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.08);
  border: 1px solid rgba(139, 126, 200, 0.16);
  color: var(--color-primary);
  margin-bottom: 18px;
}

.eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: eyebrow-pulse 2s ease-in-out infinite;
}

@keyframes eyebrow-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}

.emotion-title {
  margin: 0 0 14px;
}

.emotion-sub {
  max-width: 600px;
  margin: 0 auto;
  color: var(--color-text-secondary);
}

/* ─── Pain list (4 cards) ─── */
.pain-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 920px;
  margin: 0 auto 56px;
}

.pain-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px 22px 20px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(139, 126, 200, 0.08);
  isolation: isolate;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 2px 6px rgba(139, 126, 200, 0.04),
    0 16px 36px -22px rgba(139, 126, 200, 0.24);
  transition:
    transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1),
    box-shadow 0.42s ease;
}

.pain-card-border {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, var(--pain-accent) 0%, transparent 65%);
  -webkit-mask:
    linear-gradient(#000, #000) content-box,
    linear-gradient(#000, #000);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000, #000) content-box,
    linear-gradient(#000, #000);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.32s ease;
  pointer-events: none;
  z-index: -1;
}

.pain-card:hover {
  transform: translateY(-4px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 8px 22px rgba(139, 126, 200, 0.12),
    0 28px 60px -22px rgba(139, 126, 200, 0.35);
}

.pain-card:hover .pain-card-border,
.pain-card.is-checked .pain-card-border {
  opacity: 1;
}

/* ─── Card header ─── */
.pain-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.pain-context {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pain-context-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  color: var(--pain-accent);
}

.pain-context-label {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: -0.005em;
}

.pain-index {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.06em;
  padding: 3px 9px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.06);
  border: 1px solid rgba(139, 126, 200, 0.1);
}

/* ─── Pain body ─── */
.pain-body {
  display: grid;
  grid-template-columns: 38px 1fr 22px;
  gap: 12px;
  align-items: flex-start;
}

.pain-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.pain-text-wrap {
  min-width: 0;
}

.pain-text {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.5;
  color: var(--color-text-primary);
  font-weight: 500;
  text-decoration: line-through;
  text-decoration-color: transparent;
  text-decoration-thickness: 1.5px;
  transition: text-decoration-color 0.5s 0.2s, color 0.4s;
}

.pain-card.is-checked .pain-text {
  color: var(--color-text-secondary);
  text-decoration-color: var(--pain-accent);
}

.pain-checkbox {
  flex-shrink: 0;
}

.pain-checkmark {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  transition: stroke-dashoffset 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.pain-card.is-checked .pain-checkmark {
  stroke-dashoffset: 0;
}

/* ─── Solution preview ─── */
.pain-solution {
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  background:
    linear-gradient(135deg, rgba(139, 126, 200, 0.04), rgba(232, 160, 191, 0.04));
  border: 1px solid rgba(139, 126, 200, 0.08);
}

.pain-solution-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: rgba(139, 126, 200, 0.1);
  color: var(--color-primary);
}

.pain-solution-body {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pain-solution-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.pain-solution-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  line-height: 1.45;
}

/* ─── Resolve counter card ─── */
.emotion-resolve {
  display: flex;
  justify-content: center;
}

.resolve-counter-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 32px;
  align-items: center;
  padding: 22px 32px;
  border-radius: var(--radius-lg);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 246, 252, 0.7));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(139, 126, 200, 0.14);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 16px 40px -20px rgba(139, 126, 200, 0.28);
  max-width: 720px;
}

.resolve-counter {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.resolve-num {
  display: inline-block;
  font-size: 64px;
  font-weight: 800;
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variation-settings: "opsz" 144;
}

.resolve-slash {
  font-size: 32px;
  color: var(--color-text-muted);
  margin: 0 3px;
  opacity: 0.6;
}

.resolve-total {
  font-size: 28px;
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: -0.02em;
}

.resolve-text {
  font-size: 15px;
  line-height: 1.45;
  margin: 0;
}

.resolve-lead {
  color: var(--color-text-muted);
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
}

.resolve-text strong {
  color: var(--color-text-primary);
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.resolve-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 18px;
  border-radius: var(--radius-full);
  background: var(--gradient-cta);
  color: white;
  font-family: var(--font-display);
  font-size: 13.5px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 4px 14px -2px rgba(139, 126, 200, 0.4);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.resolve-cta:hover {
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 8px 22px -4px rgba(139, 126, 200, 0.55);
}

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .pain-list {
    grid-template-columns: 1fr;
    max-width: 620px;
  }
}

@media (max-width: 768px) {
  .family-emotion {
    padding: 64px 0;
  }
  .emotion-header { margin-bottom: 36px; }
  .pain-card { padding: 18px; }
  .resolve-counter-card {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 16px;
    padding: 22px 24px;
  }
  .resolve-counter, .resolve-text { justify-content: center; }
  .resolve-num { font-size: 52px; }
}

@media (max-width: 480px) {
  .pain-body { grid-template-columns: 32px 1fr 20px; gap: 10px; }
  .pain-icon-wrap { width: 32px; height: 32px; }
  .pain-text { font-size: 13.5px; }
  .pain-solution-body { flex-direction: column; align-items: flex-start; gap: 4px; }
  .resolve-num { font-size: 44px; }
}
</style>
