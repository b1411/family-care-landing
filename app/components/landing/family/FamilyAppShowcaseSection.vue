<template>
  <section ref="sectionRef" class="app-showcase landing-section">
    <div class="landing-container">
      <div class="showcase-header" data-reveal="fade-up">
        <span class="landing-badge">Приложение</span>
        <h2 ref="showcaseTitleRef" class="font-display">Что даёт приложение</h2>
        <p class="showcase-subtitle">Три ключевых экрана — всё, что нужно каждый день</p>
      </div>

      <!-- Desktop: 3 phones side by side -->
      <div class="phones-row">
        <div
          v-for="(phone, i) in phones"
          :key="phone.title"
          :class="['phone-col', { 'is-active': activePhone === i }]"
        >
          <div class="phone-frame" data-tilt>
            <div class="phone-glow" />
            <div class="phone-reflection" />
            <div class="phone-notch" />
            <div class="phone-screen">
              <div class="screen-header">
                <span class="screen-header-dot" />
                {{ phone.title }}
              </div>
              <div class="screen-body" v-html="phone.content" />
            </div>
          </div>
          <p class="phone-label">{{ phone.label }}</p>
          <p v-if="phone.body" class="phone-body">{{ phone.body }}</p>
        </div>
      </div>

      <!-- Mobile: carousel -->
      <div class="phones-mobile" data-reveal="fade-up">
        <div class="mobile-track" :style="{ transform: `translateX(-${mobileIdx * 100}%)` }">
          <div v-for="phone in phones" :key="phone.title" class="mobile-slide">
            <div class="phone-frame">
              <div class="phone-notch" />
              <div class="phone-screen">
                <div class="screen-header">{{ phone.title }}</div>
                <div class="screen-body" v-html="phone.content" />
              </div>
            </div>
            <p class="phone-label">{{ phone.label }}</p>
            <p v-if="phone.body" class="phone-body">{{ phone.body }}</p>
          </div>
        </div>
        <div class="mobile-dots">
          <button v-for="(_, i) in phones" :key="i" :class="['dot', { active: i === mobileIdx }]" @click="mobileIdx = i" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGsap } from '~/composables/useGsap'
import { useSplitText } from '~/composables/useSplitText'

const { gsap, ScrollTrigger } = useGsap()

const showcaseTitleRef = ref<HTMLElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)
const mobileIdx = ref(0)
const activePhone = ref(1) // center phone highlighted
let rxInterval: ReturnType<typeof setInterval> | null = null

const phones = [
  {
    title: 'Ваш маршрут',
    label: 'Один экран — весь путь',
    body: 'Видите, что уже сделано, что сейчас и что впереди. Не нужно ничего запоминать.',
    content: `
      <div class="tl-item done"><span class="tl-dot green"></span><span>Витамин D — принят</span></div>
      <div class="tl-item today"><span class="tl-dot teal"></span><span>Педиатр — сегодня 10:00</span></div>
      <div class="tl-item"><span class="tl-dot gray"></span><span>АКДС #2 — через 5 дней</span></div>
      <div class="tl-item"><span class="tl-dot gray"></span><span>Анализ крови — 20 Фев</span></div>
    `,
  },
  {
    title: 'Ваши назначения',
    label: 'Ни одного пропуска',
    body: 'Напоминание в нужное время. Одно нажатие — принято. Врач видит, что вы выполняете его назначения.',
    content: `
      <div class="rx-card-anim" data-rx="0"><span class="rx-time">08:00</span><span class="rx-name">Витамин D3</span><span class="rx-status">✓</span></div>
      <div class="rx-card-anim" data-rx="1"><span class="rx-time">14:00</span><span class="rx-name">Железо</span><span class="rx-status">⏳</span></div>
      <div class="rx-card-anim" data-rx="2"><span class="rx-time">20:00</span><span class="rx-name">Магний B6</span><span class="rx-status">⏳</span></div>
    `,
  },
  {
    title: 'Ваши документы',
    label: 'Всё в одном месте',
    body: 'Сфотографировали анализ — он сохранён навсегда. Перед приёмом — показали врачу одним нажатием.',
    content: `
      <div class="doc-grid-anim">
        <div class="doc-thumb-anim"><span>УЗИ</span></div>
        <div class="doc-thumb-anim"><span>ОАК</span></div>
        <div class="doc-thumb-anim"><span>ЭКГ</span></div>
        <div class="doc-thumb-anim"><span>Выписка</span></div>
        <div class="doc-thumb-anim"><span>Фото</span></div>
        <div class="doc-thumb-anim"><span>Рецепт</span></div>
      </div>
    `,
  },
]

function startPrescriptionSwipe() {
  rxInterval = setInterval(() => {
    const cards = document.querySelectorAll('.rx-card-anim')
    if (!cards.length) return

    // Find first waiting card
    const waiting = Array.from(cards).find(
      c => c.querySelector('.rx-status')?.textContent === '⏳',
    )
    if (!waiting) {
      // Reset all to waiting state
      cards.forEach((c, i) => {
        const status = c.querySelector('.rx-status')
        if (status && i > 0) {
          gsap.set(c, { x: 0, opacity: 1 })
          status.textContent = '⏳'
          c.classList.remove('swiped')
        }
      })
      return
    }

    // Swipe animation
    const status = waiting.querySelector('.rx-status')
    gsap.to(waiting, {
      x: 40,
      duration: 0.3,
      ease: 'power2.out',
      onComplete() {
        gsap.to(waiting, { x: 0, duration: 0.2, ease: 'power2.in' })
        if (status) {
          status.textContent = '✓'
          waiting.classList.add('swiped')
        }
      },
    })
  }, 3000)
}

function startDocumentScatter() {
  const docs = document.querySelectorAll('.doc-thumb-anim')
  if (!docs.length) return

  // Initial scattered state
  docs.forEach((doc) => {
    gsap.set(doc, {
      x: (Math.random() - 0.5) * 120,
      y: (Math.random() - 0.5) * 120,
      rotation: (Math.random() - 0.5) * 40,
      opacity: 0,
      scale: 0.6,
    })
  })

  // Snap into grid
  gsap.to(docs, {
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1,
    scale: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out',
  })
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // Split text on title
  if (showcaseTitleRef.value) {
    useSplitText(showcaseTitleRef)
  }

  // Phone entrance with 3D perspective
  const phoneFrames = document.querySelectorAll('.app-showcase .phone-col')
  if (phoneFrames.length) {
    gsap.set(phoneFrames, { opacity: 0, y: 60, rotateY: -8, scale: 0.92 })
    ScrollTrigger.create({
      trigger: '.app-showcase',
      start: 'top 75%',
      once: true,
      onEnter() {
        gsap.to(phoneFrames, {
          opacity: 1,
          y: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          onComplete() {
            startPrescriptionSwipe()
            startDocumentScatter()
          },
        })
      },
    })
  }

  // Cycle active phone highlight
  const cycleInterval = setInterval(() => {
    activePhone.value = (activePhone.value + 1) % 3
  }, 4000)
  onUnmounted(() => clearInterval(cycleInterval))
})

onUnmounted(() => {
  if (rxInterval) clearInterval(rxInterval)
})
</script>

<style scoped>
.app-showcase {
  perspective: 1200px;
}

.showcase-header {
  text-align: center;
  margin-bottom: 56px;
}

.showcase-header h2 {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 12px 0 8px;
}

.showcase-subtitle {
  font-size: 17px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Phone column */
.phone-col {
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.6s ease;
  transform-style: preserve-3d;
}

.phone-col.is-active {
  transform: translateY(-8px) scale(1.04);
}

.phone-col:not(.is-active) {
  filter: brightness(0.92);
}

/* Phone frame */
.phone-frame {
  position: relative;
  width: clamp(200px, 55vw, 230px);
  background: var(--color-surface, #fff);
  border: 2px solid var(--color-border);
  border-radius: 28px;
  padding: 8px;
  margin: 0 auto;
  overflow: hidden;
  transition: border-color 0.4s;
}

.phone-col.is-active .phone-frame {
  border-color: var(--color-primary);
  box-shadow: 0 8px 40px rgba(139, 126, 200, 0.15), 0 0 0 1px var(--color-primary-light);
}

/* Phone glow */
.phone-glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.6s;
  pointer-events: none;
}

.phone-col.is-active .phone-glow {
  opacity: 0.5;
}

/* Reflection shimmer */
.phone-reflection {
  position: absolute;
  top: -80%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255, 255, 255, 0.06) 45%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.06) 55%,
    transparent 70%
  );
  transform: translateX(-100%);
  pointer-events: none;
  z-index: 2;
}

.phone-col.is-active .phone-reflection {
  animation: shimmer 2s ease-in-out;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.phone-notch {
  width: 60px;
  height: 5px;
  background: var(--color-border);
  border-radius: 3px;
  margin: 4px auto 8px;
}

.phone-screen {
  background: var(--color-bg, #fafafa);
  border-radius: 20px;
  overflow: hidden;
  min-height: 300px;
}

.screen-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-light);
}

.screen-header-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
}

.screen-body {
  padding: 12px 14px;
  overflow: hidden;
}

.phone-label {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 16px 0 4px;
  transition: color 0.4s;
}

.phone-col.is-active .phone-label {
  color: var(--color-primary);
}

.phone-body {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
  max-width: 220px;
  margin-inline: auto;
}

/* Timeline items */
:deep(.tl-item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}
:deep(.tl-item.done) { color: var(--color-text-muted); text-decoration: line-through; }
:deep(.tl-item.today) { color: var(--color-primary); font-weight: 600; }
:deep(.tl-dot) { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
:deep(.tl-dot.green) { background: var(--color-success, #22C55E); }
:deep(.tl-dot.teal) { background: var(--color-primary); }
:deep(.tl-dot.gray) { background: var(--color-border); }

/* Prescription cards */
:deep(.rx-card-anim) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: var(--color-surface-alt, #f5f5f5);
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  transition: background 0.3s;
}
:deep(.rx-card-anim.swiped) {
  background: rgba(124, 184, 212, 0.1);
}
:deep(.rx-time) { font-weight: 600; color: var(--color-text-muted); width: 40px; }
:deep(.rx-name) { flex: 1; color: var(--color-text-primary); }
:deep(.rx-status) { font-weight: 700; min-width: 20px; text-align: center; }
:deep(.rx-card-anim.swiped .rx-status) { color: var(--color-success, #22C55E); }

/* Document grid */
:deep(.doc-grid-anim) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
:deep(.doc-thumb-anim) {
  aspect-ratio: 1;
  background: var(--color-surface-alt, #f0f0f0);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}

/* Desktop: 3 side by side */
.phones-row {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.phones-mobile { display: none; }

@media (max-width: 768px) {
  .phones-row { display: none; }
  .phones-mobile {
    display: block;
    overflow: hidden;
  }
  .mobile-track {
    display: flex;
    transition: transform 0.4s ease;
    overflow: hidden;
  }
  .mobile-slide {
    flex-shrink: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .mobile-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-border);
    border: none;
    cursor: pointer;
  }
  .dot.active {
    background: var(--color-primary);
  }
}
</style>
