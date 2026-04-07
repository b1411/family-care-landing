<template>
  <section ref="sectionRef" class="family-emotion landing-section">
    <div class="landing-container">
      <div class="emotion-header" data-reveal="fade-up">
        <span class="landing-badge">Знакомо?</span>
      </div>

      <div ref="listRef" class="pain-list">
        <div
          v-for="(pain, i) in pains"
          :key="pain.text"
          :class="['pain-row', { checked: pain.checked }]"
          @mouseenter="pain.hover = true"
          @mouseleave="pain.hover = false"
        >
          <div class="pain-index font-heading">{{ String(i + 1).padStart(2, '0') }}</div>
          <svg class="pain-checkbox" width="24" height="24" viewBox="0 0 24 24">
            <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="none" :stroke="pain.checked ? 'var(--color-primary)' : 'var(--color-border)'" stroke-width="1.5" />
            <circle v-if="pain.checked" cx="12" cy="12" r="6" fill="var(--color-primary)" opacity="0.15" />
            <path class="checkmark" d="M7 12.5 L10.5 16 L17 8" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="pain-text">{{ pain.text }}</span>
        </div>
      </div>

      <div class="emotion-resolve" data-reveal="fade-up">
        <div class="resolve-counter">
          <span class="resolve-num font-display">{{ checkedCount }}</span>
          <span class="resolve-slash">/</span>
          <span class="resolve-total font-display">{{ pains.length }}</span>
        </div>
        <p class="resolve-text">
          <strong>проблем решает одно приложение.</strong>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useGsap } from '~/composables/useGsap'

const sectionRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

const pains = reactive([
  { text: 'Перед педиатром: «Где результат ОАК?» Ищу в WhatsApp, Telegram, галерее...', checked: false, hover: false },
  { text: 'Ребёнку 4 месяца — какая прививка следующая? Гуглю и получаю 10 разных ответов', checked: false, hover: false },
  { text: 'После выписки из роддома — тишина. Клиника не звонит. Я не знаю, когда первый осмотр', checked: false, hover: false },
  { text: 'Ночь. Температура 37.8. Это нормально после прививки или нет?', checked: false, hover: false },
])

const checkedCount = computed(() => pains.filter(p => p.checked).length)

let triggers: any[] = []

onMounted(() => {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    pains.forEach(p => { p.checked = true })
    return
  }

  const { gsap, ScrollTrigger } = useGsap()

  // Stagger each pain row entrance + auto-check on scroll
  const rows = listRef.value?.querySelectorAll('.pain-row')
  if (!rows) return

  rows.forEach((row, i) => {
    // Entrance
    gsap.set(row, { opacity: 0, x: -30 })
    const st1 = ScrollTrigger.create({
      trigger: row,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(row, { opacity: 1, x: 0, duration: 0.6, delay: i * 0.1, ease: 'power3.out' })
      },
    })
    triggers.push(st1)

    // Auto-check when scrolled past
    const st2 = ScrollTrigger.create({
      trigger: row,
      start: 'top 60%',
      onEnter: () => { pains[i]!.checked = true },
    })
    triggers.push(st2)
  })
})

onUnmounted(() => {
  triggers.forEach(t => t.kill())
  triggers = []
})
</script>

<style scoped>
.emotion-header {
  text-align: center;
  margin-bottom: 40px;
}

.pain-list {
  max-width: 620px;
  margin: 0 auto 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pain-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid transparent;
  transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
  cursor: default;
  position: relative;
}

.pain-row:hover {
  border-color: var(--color-border);
  box-shadow: 0 4px 20px rgba(139, 126, 200, 0.08);
}

.pain-row.checked {
  border-color: var(--color-primary-light);
  background: var(--color-primary-ultralight);
}

.pain-index {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  opacity: 0.5;
  min-width: 18px;
}

.pain-row.checked .pain-index {
  color: var(--color-primary);
  opacity: 1;
}

.pain-checkbox {
  flex-shrink: 0;
}

.pain-checkbox .checkmark {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  transition: stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.pain-row.checked .checkmark {
  stroke-dashoffset: 0;
}

.pain-text {
  font-size: 15px;
  color: var(--color-text-primary);
  line-height: 1.5;
  text-decoration: line-through;
  text-decoration-color: transparent;
  text-decoration-thickness: 1.5px;
  transition: text-decoration-color 0.5s 0.2s, color 0.4s;
}

.pain-row.checked .pain-text {
  text-decoration-color: var(--color-primary);
  color: var(--color-text-secondary);
}

/* Counter resolve */
.emotion-resolve {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.resolve-counter {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.resolve-num {
  font-size: 48px;
  font-weight: 800;
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.resolve-slash {
  font-size: 28px;
  color: var(--color-text-muted);
  margin: 0 2px;
}

.resolve-total {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.resolve-text {
  font-size: 18px;
  color: var(--color-text-primary);
  margin: 0;
}
</style>
