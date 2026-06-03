<template>
  <section ref="sectionRef" class="app-showcase landing-section section-ink">
    <!-- Ambient background -->
    <div class="showcase-bg" aria-hidden="true">
      <div class="showcase-orb showcase-orb-1" />
      <div class="showcase-orb showcase-orb-2" />
    </div>

    <div class="landing-container">
      <div class="showcase-header" data-reveal="fade-up">
        <span class="showcase-eyebrow t-eyebrow">
          <span class="eyebrow-dot" />
          Приложение
        </span>
        <h2 ref="showcaseTitleRef" class="showcase-title t-display-section">
          Что даёт <span class="t-accent-serif-gradient">приложение</span>
        </h2>
        <p class="showcase-subtitle t-lead">
          Три ключевых экрана — всё, что нужно семье каждый день.
        </p>
      </div>

      <!-- Desktop: 3 phones side by side -->
      <div class="phones-row">
        <!-- ─── Phone 1: Route ─── -->
        <div :class="['phone-col', { 'is-active': activePhone === 0 }]">
          <div class="phone-frame" data-tilt>
            <div class="phone-glow" />
            <div class="phone-reflection" />
            <div class="phone-island" />
            <div class="phone-screen">
              <!-- iOS status bar -->
              <div class="screen-statusbar">
                <span class="statusbar-time font-mono">9:41</span>
                <span class="statusbar-icons">
                  <Icon name="lucide:signal" size="9" />
                  <Icon name="lucide:wifi" size="9" />
                  <Icon name="lucide:battery-full" size="10" />
                </span>
              </div>
              <!-- App header -->
              <div class="screen-header">
                <span class="header-logo">
                  <Icon name="lucide:heart-pulse" size="10" />
                </span>
                <span class="header-title">UMAI Health</span>
                <span class="header-week font-mono">22 нед</span>
              </div>

              <!-- Hero progress -->
              <div class="screen-block">
                <div class="route-hero">
                  <div class="route-hero-head">
                    <span class="route-hero-lbl">Ваш маршрут</span>
                    <span class="route-hero-pct font-mono">68<sup>%</sup></span>
                  </div>
                  <div class="route-hero-bar"><span class="route-hero-fill" /></div>
                  <span class="route-hero-meta">12 из 18 событий завершено</span>
                </div>
              </div>

              <!-- Timeline -->
              <div class="screen-block">
                <span class="screen-section-title">Сегодня · 23&nbsp;мая</span>
                <div class="tl-list">
                  <div class="tl-item tl-item--done">
                    <span class="tl-time font-mono">08:00</span>
                    <span class="tl-icon tl-icon--done"><Icon name="lucide:check" size="8" /></span>
                    <span class="tl-name">Витамин D3</span>
                  </div>
                  <div class="tl-item tl-item--now">
                    <span class="tl-time font-mono">10:00</span>
                    <span class="tl-icon tl-icon--now"><Icon name="lucide:calendar-check" size="8" /></span>
                    <span class="tl-name">Педиатр · Алия К.</span>
                    <span class="tl-tag">сейчас</span>
                  </div>
                  <div class="tl-item">
                    <span class="tl-time font-mono">14:00</span>
                    <span class="tl-icon tl-icon--lab"><Icon name="lucide:flask-conical" size="8" /></span>
                    <span class="tl-name">Анализ крови</span>
                  </div>
                  <div class="tl-item">
                    <span class="tl-time font-mono">20:00</span>
                    <span class="tl-icon tl-icon--pill"><Icon name="lucide:pill" size="8" /></span>
                    <span class="tl-name">Магний B6</span>
                  </div>
                </div>
              </div>

              <!-- Upcoming preview -->
              <div class="screen-block screen-block--upcoming">
                <span class="screen-section-title">Впереди</span>
                <div class="upcoming-row">
                  <span class="upcoming-pill">
                    <Icon name="lucide:shield-check" size="9" />
                    АКДС #2 · 5&nbsp;дн
                  </span>
                  <span class="upcoming-pill">
                    <Icon name="lucide:flask-conical" size="9" />
                    ОАК · 20&nbsp;фев
                  </span>
                </div>
              </div>

              <!-- Bottom nav -->
              <div class="screen-nav">
                <span class="nav-item nav-item--active"><Icon name="lucide:route" size="11" /><span>Маршрут</span></span>
                <span class="nav-item"><Icon name="lucide:calendar-days" size="11" /><span>Записи</span></span>
                <span class="nav-item"><Icon name="lucide:file-text" size="11" /><span>Док-ты</span></span>
                <span class="nav-item"><Icon name="lucide:user" size="11" /><span>Профиль</span></span>
              </div>
            </div>
          </div>
          <p class="phone-label">Один экран — весь путь</p>
          <p class="phone-body">Видите, что уже сделано, что сейчас и&nbsp;что впереди. Не&nbsp;нужно ничего запоминать.</p>
        </div>

        <!-- ─── Phone 2: Prescriptions ─── -->
        <div :class="['phone-col', { 'is-active': activePhone === 1 }]">
          <div class="phone-frame" data-tilt>
            <div class="phone-glow" />
            <div class="phone-reflection" />
            <div class="phone-island" />
            <div class="phone-screen">
              <div class="screen-statusbar">
                <span class="statusbar-time font-mono">9:41</span>
                <span class="statusbar-icons">
                  <Icon name="lucide:signal" size="9" />
                  <Icon name="lucide:wifi" size="9" />
                  <Icon name="lucide:battery-full" size="10" />
                </span>
              </div>
              <div class="screen-header">
                <span class="header-logo header-logo--rose">
                  <Icon name="lucide:pill" size="10" />
                </span>
                <span class="header-title">Назначения</span>
                <span class="header-week font-mono">3 на сегодня</span>
              </div>

              <!-- Compliance ring + meta -->
              <div class="screen-block">
                <div class="rx-hero">
                  <svg class="rx-ring" viewBox="0 0 60 60" aria-hidden="true">
                    <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(139, 126, 200, 0.14)" stroke-width="5" />
                    <circle cx="30" cy="30" r="25" fill="none" stroke="url(#rxGrad)" stroke-width="5"
                      stroke-linecap="round" stroke-dasharray="157.08" stroke-dashoffset="9.4" transform="rotate(-90 30 30)" />
                    <defs>
                      <linearGradient id="rxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#8B7EC8" />
                        <stop offset="100%" stop-color="#E8A0BF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div class="rx-hero-body">
                    <span class="rx-hero-pct font-mono">94<sup>%</sup></span>
                    <span class="rx-hero-lbl">соблюдение за неделю</span>
                  </div>
                </div>
              </div>

              <!-- Filter pills -->
              <div class="rx-filters">
                <span class="rx-filter rx-filter--active">Сегодня</span>
                <span class="rx-filter">Неделя</span>
                <span class="rx-filter">Все</span>
              </div>

              <!-- Prescription rows -->
              <div class="screen-block rx-list">
                <div class="rx-card rx-card-anim rx-card--done" data-rx="0">
                  <span class="rx-card-pill rx-card-pill--d">D3</span>
                  <div class="rx-card-body">
                    <span class="rx-card-name">Витамин D3</span>
                    <span class="rx-card-meta">08:00 · 1000&nbsp;МЕ · принято</span>
                  </div>
                  <span class="rx-card-status rx-card-status--done">
                    <Icon name="lucide:check" size="10" />
                  </span>
                </div>
                <div class="rx-card rx-card-anim rx-card--next" data-rx="1">
                  <span class="rx-card-pill rx-card-pill--fe">Fe</span>
                  <div class="rx-card-body">
                    <span class="rx-card-name">Железо</span>
                    <span class="rx-card-meta">14:00 · 50&nbsp;мг · через 2&nbsp;ч</span>
                  </div>
                  <span class="rx-card-status rx-card-status--pending">
                    <Icon name="lucide:clock" size="10" />
                  </span>
                </div>
                <div class="rx-card rx-card-anim" data-rx="2">
                  <span class="rx-card-pill rx-card-pill--mg">Mg</span>
                  <div class="rx-card-body">
                    <span class="rx-card-name">Магний B6</span>
                    <span class="rx-card-meta">20:00 · 200&nbsp;мг</span>
                  </div>
                  <span class="rx-card-status rx-card-status--pending">
                    <Icon name="lucide:clock" size="10" />
                  </span>
                </div>
              </div>

              <div class="screen-nav">
                <span class="nav-item"><Icon name="lucide:route" size="11" /><span>Маршрут</span></span>
                <span class="nav-item nav-item--active"><Icon name="lucide:pill" size="11" /><span>Лекарства</span></span>
                <span class="nav-item"><Icon name="lucide:file-text" size="11" /><span>Док-ты</span></span>
                <span class="nav-item"><Icon name="lucide:user" size="11" /><span>Профиль</span></span>
              </div>
            </div>
          </div>
          <p class="phone-label">Ни одного пропуска</p>
          <p class="phone-body">Напоминание в&nbsp;нужное время. Одно нажатие — принято. Врач видит, что вы&nbsp;выполняете назначения.</p>
        </div>

        <!-- ─── Phone 3: Documents ─── -->
        <div :class="['phone-col', { 'is-active': activePhone === 2 }]">
          <div class="phone-frame" data-tilt>
            <div class="phone-glow" />
            <div class="phone-reflection" />
            <div class="phone-island" />
            <div class="phone-screen">
              <div class="screen-statusbar">
                <span class="statusbar-time font-mono">9:41</span>
                <span class="statusbar-icons">
                  <Icon name="lucide:signal" size="9" />
                  <Icon name="lucide:wifi" size="9" />
                  <Icon name="lucide:battery-full" size="10" />
                </span>
              </div>
              <div class="screen-header">
                <span class="header-logo header-logo--blue">
                  <Icon name="lucide:folder-open" size="10" />
                </span>
                <span class="header-title">Документы</span>
                <span class="header-week font-mono">24</span>
              </div>

              <!-- Search + filters -->
              <div class="screen-block">
                <div class="doc-search">
                  <Icon name="lucide:search" size="10" class="doc-search-icon" />
                  <span class="doc-search-placeholder">Поиск по документам</span>
                </div>
                <div class="doc-filters">
                  <span class="doc-filter doc-filter--active">Все</span>
                  <span class="doc-filter">Анализы</span>
                  <span class="doc-filter">УЗИ</span>
                  <span class="doc-filter">Рецепты</span>
                </div>
              </div>

              <!-- Document grid -->
              <div class="screen-block doc-grid-wrap">
                <span class="screen-section-title">Недавние</span>
                <div class="doc-grid">
                  <div class="doc-card doc-thumb-anim doc-card--ultrasound">
                    <Icon name="lucide:scan" size="14" class="doc-card-icon" />
                    <span class="doc-card-name">УЗИ 12 нед</span>
                    <span class="doc-card-meta font-mono">18 фев</span>
                  </div>
                  <div class="doc-card doc-thumb-anim doc-card--lab">
                    <Icon name="lucide:flask-conical" size="14" class="doc-card-icon" />
                    <span class="doc-card-name">ОАК</span>
                    <span class="doc-card-meta font-mono">15 фев</span>
                  </div>
                  <div class="doc-card doc-thumb-anim doc-card--lab">
                    <Icon name="lucide:activity" size="14" class="doc-card-icon" />
                    <span class="doc-card-name">ЭКГ</span>
                    <span class="doc-card-meta font-mono">10 фев</span>
                  </div>
                  <div class="doc-card doc-thumb-anim doc-card--discharge">
                    <Icon name="lucide:file-text" size="14" class="doc-card-icon" />
                    <span class="doc-card-name">Выписка</span>
                    <span class="doc-card-meta font-mono">08 фев</span>
                  </div>
                  <div class="doc-card doc-thumb-anim doc-card--photo">
                    <Icon name="lucide:image" size="14" class="doc-card-icon" />
                    <span class="doc-card-name">Фото</span>
                    <span class="doc-card-meta font-mono">05 фев</span>
                  </div>
                  <div class="doc-card doc-thumb-anim doc-card--rx">
                    <Icon name="lucide:scroll-text" size="14" class="doc-card-icon" />
                    <span class="doc-card-name">Рецепт</span>
                    <span class="doc-card-meta font-mono">01 фев</span>
                  </div>
                </div>
              </div>

              <div class="screen-nav">
                <span class="nav-item"><Icon name="lucide:route" size="11" /><span>Маршрут</span></span>
                <span class="nav-item"><Icon name="lucide:pill" size="11" /><span>Лекарства</span></span>
                <span class="nav-item nav-item--active"><Icon name="lucide:folder-open" size="11" /><span>Док-ты</span></span>
                <span class="nav-item"><Icon name="lucide:user" size="11" /><span>Профиль</span></span>
              </div>
            </div>
          </div>
          <p class="phone-label">Всё в одном месте</p>
          <p class="phone-body">Сфотографировали анализ — он&nbsp;сохранён навсегда. Перед приёмом — показали врачу одним нажатием.</p>
        </div>
      </div>

      <!-- Mobile: carousel — show all 3 phones as slides -->
      <div class="phones-mobile" data-reveal="fade-up">
        <div class="mobile-track" :style="{ transform: `translateX(-${mobileIdx * 100}%)` }">
          <div class="mobile-slide">
            <p class="mobile-headline">Один экран — весь путь</p>
            <p class="mobile-sub">Видите всё, что нужно делать каждый день.</p>
          </div>
          <div class="mobile-slide">
            <p class="mobile-headline">Ни одного пропуска</p>
            <p class="mobile-sub">Напоминания + 94% соблюдения на виду.</p>
          </div>
          <div class="mobile-slide">
            <p class="mobile-headline">Всё в одном месте</p>
            <p class="mobile-sub">Сфотографировали — сохранили навсегда.</p>
          </div>
        </div>
        <div class="mobile-dots">
          <button
            v-for="(_, i) in 3"
            :key="i"
            type="button"
            :class="['dot', { active: i === mobileIdx }]"
            :aria-label="`Слайд ${i + 1}`"
            @click="mobileIdx = i"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useGsap } from '~/composables/useGsap'
import { useSplitText } from '~/composables/useSplitText'

const { gsap, ScrollTrigger } = useGsap()

const showcaseTitleRef = ref<HTMLElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)
const mobileIdx = ref(0)
const activePhone = ref(1) // center phone highlighted by default

let cycleInterval: ReturnType<typeof setInterval> | null = null
let rxInterval: ReturnType<typeof setInterval> | null = null
let entranceTrigger: { kill: () => void } | null = null

// Animate the prescription "next" card swipe-to-accept loop
function startPrescriptionSwipe() {
  rxInterval = setInterval(() => {
    if (!sectionRef.value) return
    const cards = sectionRef.value.querySelectorAll<HTMLElement>('.rx-card-anim')
    if (!cards.length) return

    const waiting = Array.from(cards).find(
      c => c.querySelector('.rx-card-status--pending'),
    )
    if (!waiting) {
      // Reset to initial: only first one done, others pending
      cards.forEach((c, i) => {
        gsap.set(c, { x: 0, opacity: 1 })
        c.classList.remove('rx-card--done')
        const statusEl = c.querySelector('.rx-card-status')
        if (statusEl) {
          statusEl.classList.remove('rx-card-status--done')
          statusEl.classList.add('rx-card-status--pending')
          statusEl.innerHTML = '<span class="iconify-inline" data-icon="lucide:clock"></span>'
        }
        if (i === 0) {
          // First always done
          c.classList.add('rx-card--done')
          if (statusEl) {
            statusEl.classList.remove('rx-card-status--pending')
            statusEl.classList.add('rx-card-status--done')
            statusEl.innerHTML = '<span class="iconify-inline" data-icon="lucide:check"></span>'
          }
        }
      })
      return
    }

    gsap.to(waiting, {
      x: 28,
      duration: 0.28,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(waiting, { x: 0, duration: 0.22, ease: 'power2.in' })
        waiting.classList.add('rx-card--done')
        const statusEl = waiting.querySelector('.rx-card-status')
        if (statusEl) {
          statusEl.classList.remove('rx-card-status--pending')
          statusEl.classList.add('rx-card-status--done')
        }
      },
    })
  }, 3200)
}

// Document scatter-in animation
function startDocumentScatter() {
  if (!sectionRef.value) return
  const docs = sectionRef.value.querySelectorAll<HTMLElement>('.doc-thumb-anim')
  if (!docs.length) return
  docs.forEach((doc) => {
    gsap.set(doc, {
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 60,
      rotation: (Math.random() - 0.5) * 18,
      opacity: 0,
      scale: 0.7,
    })
  })
  gsap.to(docs, {
    x: 0, y: 0, rotation: 0, opacity: 1, scale: 1,
    duration: 0.55, stagger: 0.08, ease: 'back.out(1.3)',
  })
}

onMounted(() => {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  if (showcaseTitleRef.value) {
    useSplitText(showcaseTitleRef)
  }

  if (!gsap || !ScrollTrigger || !sectionRef.value) return

  const phoneFrames = sectionRef.value.querySelectorAll<HTMLElement>('.phone-col')
  if (phoneFrames.length) {
    gsap.set(phoneFrames, { opacity: 0, y: 50, rotateY: -8, scale: 0.94 })
    entranceTrigger = ScrollTrigger.create({
      trigger: sectionRef.value,
      start: 'top 75%',
      once: true,
      onEnter() {
        gsap.to(phoneFrames, {
          opacity: 1, y: 0, rotateY: 0, scale: 1,
          duration: 0.85, stagger: 0.15, ease: 'power3.out',
          onComplete() {
            startPrescriptionSwipe()
            startDocumentScatter()
          },
        })
      },
    })
  }

  cycleInterval = setInterval(() => {
    activePhone.value = (activePhone.value + 1) % 3
  }, 4000)
})

onBeforeUnmount(() => {
  if (cycleInterval) clearInterval(cycleInterval)
  if (rxInterval) clearInterval(rxInterval)
  if (entranceTrigger) entranceTrigger.kill()
})
</script>

<style scoped>
.app-showcase {
  position: relative;
  perspective: 1400px;
  overflow: hidden;
  padding: 96px 0;
}

/* ─── Background ─── */
.showcase-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.showcase-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.2;
}

.showcase-orb-1 {
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.4), transparent 65%);
  top: -10%;
  left: -8%;
}

.showcase-orb-2 {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(232, 160, 191, 0.34), transparent 65%);
  bottom: -10%;
  right: -8%;
}

.landing-container {
  position: relative;
  z-index: 1;
}

/* ─── Header ─── */
.showcase-header {
  text-align: center;
  margin-bottom: 64px;
}

.showcase-eyebrow {
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
  animation: eb-pulse 2s ease-in-out infinite;
}

@keyframes eb-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}

.showcase-title { margin: 0 0 14px; }

.showcase-subtitle {
  max-width: 600px;
  margin: 0 auto;
  color: var(--color-text-secondary);
}

/* ─── Phones row ─── */
.phones-row {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 32px;
  flex-wrap: nowrap;
}

.phone-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 1 280px;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.6s ease;
  transform-style: preserve-3d;
}

.phone-col.is-active {
  transform: translateY(-10px) scale(1.04);
}

.phone-col:not(.is-active) {
  filter: brightness(0.94) saturate(0.92);
}

/* ─── Phone frame (premium iOS look) ─── */
.phone-frame {
  position: relative;
  width: 244px;
  padding: 8px;
  border-radius: 38px;
  background: linear-gradient(160deg, #1B1330, #2A1E47);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    0 24px 60px -16px rgba(75, 50, 130, 0.45),
    0 12px 24px -8px rgba(0, 0, 0, 0.30);
  isolation: isolate;
}

.phone-col.is-active .phone-frame {
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.12),
    0 30px 80px -18px rgba(139, 126, 200, 0.55),
    0 14px 28px -10px rgba(75, 50, 130, 0.4);
}

.phone-glow {
  position: absolute;
  inset: -30px;
  border-radius: 60px;
  background: radial-gradient(circle at center, rgba(139, 126, 200, 0.35), transparent 60%);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.phone-col.is-active .phone-glow {
  opacity: 0.7;
}

.phone-reflection {
  position: absolute;
  top: -100%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(105deg,
    transparent 30%,
    rgba(255, 255, 255, 0.04) 45%,
    rgba(255, 255, 255, 0.10) 50%,
    rgba(255, 255, 255, 0.04) 55%,
    transparent 70%);
  transform: translateX(-100%);
  pointer-events: none;
  z-index: 2;
  border-radius: inherit;
}

.phone-col.is-active .phone-reflection {
  animation: phone-shimmer 2.4s ease-in-out;
}

@keyframes phone-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.phone-island {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: 84px;
  height: 22px;
  border-radius: 16px;
  background: #000;
  z-index: 4;
}

/* ─── Screen ─── */
.phone-screen {
  position: relative;
  border-radius: 30px;
  background: #FAF7FD;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 440px;
  padding-top: 36px;
}

.screen-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 14px 0;
  font-size: 0.55rem;
  color: var(--color-text-primary);
}

.statusbar-time {
  font-weight: 600;
  font-size: 0.6rem;
  letter-spacing: -0.01em;
}

.statusbar-icons {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--color-text-primary);
}

/* ─── App header ─── */
.screen-header {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px 8px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.header-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: var(--gradient-cta);
  color: white;
  flex-shrink: 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 2px 6px -2px rgba(139, 126, 200, 0.45);
}

.header-logo--rose { background: linear-gradient(135deg, #E8A0BF, #D47EA5); }
.header-logo--blue { background: linear-gradient(135deg, #7CB8D4, #4A8AC5); }

.header-title {
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--color-text-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-week {
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--color-primary);
  background: rgba(139, 126, 200, 0.12);
  padding: 3px 8px;
  border-radius: var(--radius-full);
  letter-spacing: -0.005em;
  white-space: nowrap;
}

/* ─── Screen blocks (shared padding) ─── */
.screen-block {
  padding: 8px 12px 0;
}

.screen-section-title {
  display: block;
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: -0.005em;
  color: var(--color-text-primary);
  margin-bottom: 5px;
}

/* ═══════════════════════════════════════════
   PHONE 1 — Route
   ═══════════════════════════════════════════ */

.route-hero {
  padding: 10px 12px;
  border-radius: 11px;
  background: var(--gradient-cta);
  color: white;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 4px 12px -4px rgba(139, 126, 200, 0.4);
}

.route-hero-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 5px;
}

.route-hero-lbl {
  font-family: var(--font-body);
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.92;
}

.route-hero-pct {
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1;
}

.route-hero-pct sup { font-size: 0.5em; vertical-align: super; }

.route-hero-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.route-hero-fill {
  display: block;
  width: 68%;
  height: 100%;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 2px;
}

.route-hero-meta {
  font-size: 0.55rem;
  font-weight: 500;
  opacity: 0.92;
}

/* Timeline */
.tl-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tl-item {
  display: grid;
  grid-template-columns: 28px 14px 1fr auto;
  gap: 7px;
  align-items: center;
  padding: 5px 8px 5px 4px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(139, 126, 200, 0.06);
}

.tl-item--done {
  background: rgba(248, 246, 252, 0.5);
}
.tl-item--done .tl-name {
  color: var(--color-text-muted);
  text-decoration: line-through;
  text-decoration-color: rgba(139, 126, 200, 0.25);
}

.tl-item--now {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(139, 126, 200, 0.22);
  box-shadow: 0 2px 6px -2px rgba(139, 126, 200, 0.18);
}

.tl-time {
  font-size: 0.5rem;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: -0.005em;
  text-align: right;
}

.tl-icon {
  width: 14px;
  height: 14px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: rgba(75, 50, 130, 0.2);
}

.tl-icon--done {
  background: linear-gradient(135deg, #5BC0BE, #2A8886);
}

.tl-icon--now {
  background: var(--gradient-cta);
  box-shadow: 0 0 6px rgba(139, 126, 200, 0.45);
}

.tl-icon--lab {
  background: linear-gradient(135deg, #7CB8D4, #4A8AC5);
}

.tl-icon--pill {
  background: linear-gradient(135deg, #E8A0BF, #D47EA5);
}

.tl-name {
  font-family: var(--font-display);
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.15;
}

.tl-tag {
  font-family: var(--font-mono);
  font-size: 0.5rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* Upcoming pills */
.screen-block--upcoming {
  margin-top: 4px;
}

.upcoming-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.upcoming-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(139, 126, 200, 0.1);
  font-size: 0.52rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: -0.005em;
}

.upcoming-pill .iconify {
  color: var(--color-primary);
}

/* ═══════════════════════════════════════════
   PHONE 2 — Prescriptions
   ═══════════════════════════════════════════ */

.rx-hero {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(139, 126, 200, 0.1);
  box-shadow: 0 2px 6px -2px rgba(139, 126, 200, 0.12);
}

.rx-ring { width: 60px; height: 60px; }

.rx-hero-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.rx-hero-pct {
  font-size: 1.3rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--color-primary);
}

.rx-hero-pct sup { font-size: 0.5em; vertical-align: super; }

.rx-hero-lbl {
  font-family: var(--font-body);
  font-size: 0.52rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.rx-filters {
  display: flex;
  gap: 4px;
  padding: 0 12px;
  margin-top: 6px;
  margin-bottom: 4px;
}

.rx-filter {
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(139, 126, 200, 0.08);
  font-family: var(--font-display);
  font-size: 0.52rem;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: -0.005em;
}

.rx-filter--active {
  background: var(--gradient-cta);
  color: white;
  border-color: transparent;
}

.rx-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rx-card {
  display: grid;
  grid-template-columns: 24px 1fr 22px;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(139, 126, 200, 0.08);
  transition: background 0.3s, border-color 0.3s;
  will-change: transform;
}

.rx-card--next {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(139, 126, 200, 0.22);
  box-shadow: 0 2px 6px -2px rgba(139, 126, 200, 0.18);
}

.rx-card--done {
  background: rgba(91, 192, 190, 0.06);
  border-color: rgba(91, 192, 190, 0.18);
}

.rx-card-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  color: white;
  font-family: var(--font-mono);
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.rx-card-pill--d { background: linear-gradient(135deg, #F4A261, #E76F51); }
.rx-card-pill--fe { background: linear-gradient(135deg, #D47EA5, #B82B36); }
.rx-card-pill--mg { background: linear-gradient(135deg, #8B7EC8, #6F5FA0); }

.rx-card-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.rx-card-name {
  font-family: var(--font-display);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: -0.005em;
  color: var(--color-text-primary);
  line-height: 1.15;
}

.rx-card-meta {
  font-size: 0.5rem;
  color: var(--color-text-muted);
  font-weight: 500;
  margin-top: 1px;
}

.rx-card--done .rx-card-name {
  color: var(--color-text-muted);
  text-decoration: line-through;
  text-decoration-color: rgba(91, 192, 190, 0.45);
}

.rx-card-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
}

.rx-card-status--done {
  background: linear-gradient(135deg, #5BC0BE, #2A8886);
  color: white;
  box-shadow: 0 0 6px rgba(91, 192, 190, 0.45);
}

.rx-card-status--pending {
  background: rgba(139, 126, 200, 0.12);
  color: var(--color-text-muted);
}

/* ═══════════════════════════════════════════
   PHONE 3 — Documents
   ═══════════════════════════════════════════ */

.doc-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(139, 126, 200, 0.1);
  margin-bottom: 6px;
}

.doc-search-icon {
  color: var(--color-text-muted);
}

.doc-search-placeholder {
  font-family: var(--font-body);
  font-size: 0.55rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.doc-filters {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
  overflow-x: auto;
}

.doc-filter {
  flex-shrink: 0;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(139, 126, 200, 0.08);
  font-family: var(--font-display);
  font-size: 0.5rem;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: -0.005em;
  white-space: nowrap;
}

.doc-filter--active {
  background: linear-gradient(135deg, #7CB8D4, #4A8AC5);
  color: white;
  border-color: transparent;
}

.doc-grid-wrap { padding-bottom: 4px; }

.doc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.doc-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  padding: 7px 8px 6px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(139, 126, 200, 0.08);
  box-shadow: 0 1px 2px rgba(139, 126, 200, 0.04);
  min-height: 52px;
}

.doc-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 9px 9px 0 0;
}

.doc-card--ultrasound::before { background: linear-gradient(90deg, #8B7EC8, #E8A0BF); }
.doc-card--lab::before { background: linear-gradient(90deg, #7CB8D4, #4A8AC5); }
.doc-card--discharge::before { background: linear-gradient(90deg, #5BC0BE, #2A8886); }
.doc-card--photo::before { background: linear-gradient(90deg, #F4A261, #E76F51); }
.doc-card--rx::before { background: linear-gradient(90deg, #D47EA5, #B82B36); }

.doc-card-icon {
  margin-bottom: 2px;
  color: var(--color-text-secondary);
}

.doc-card--ultrasound .doc-card-icon { color: #8B7EC8; }
.doc-card--lab .doc-card-icon { color: #4A8AC5; }
.doc-card--discharge .doc-card-icon { color: #2A8886; }
.doc-card--photo .doc-card-icon { color: #E76F51; }
.doc-card--rx .doc-card-icon { color: #B82B36; }

.doc-card-name {
  font-family: var(--font-display);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: -0.005em;
  color: var(--color-text-primary);
  line-height: 1.15;
}

.doc-card-meta {
  font-size: 0.48rem;
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
  margin-top: 1px;
}

/* ═══════════════════════════════════════════
   Bottom nav (shared)
   ═══════════════════════════════════════════ */

.screen-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 6px 4px 10px;
  margin-top: auto;
  border-top: 1px solid rgba(139, 126, 200, 0.06);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.nav-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-family: var(--font-body);
  font-size: 0.45rem;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--color-text-muted);
}

.nav-item--active {
  color: var(--color-primary);
}

.nav-item--active .iconify {
  filter: drop-shadow(0 0 4px currentColor);
}

/* ─── Phone caption ─── */
.phone-label {
  text-align: center;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  margin: 22px 0 6px;
  transition: color 0.4s;
}

.phone-col.is-active .phone-label {
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.phone-body {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.55;
  max-width: 240px;
  margin-inline: auto;
}

/* ─── Mobile carousel ─── */
.phones-mobile { display: none; }

@media (max-width: 1100px) {
  .phones-row { gap: 22px; }
  .phone-col { flex: 0 1 240px; }
  .phone-frame { width: 224px; }
}

@media (max-width: 900px) {
  .phones-row { gap: 16px; flex-wrap: wrap; }
  .phone-col { flex: 0 1 calc(50% - 8px); max-width: 260px; }
}

@media (max-width: 600px) {
  .app-showcase { padding: 64px 0; }
  .showcase-header { margin-bottom: 40px; }
  .phones-row { display: none; }
  .phones-mobile {
    display: block;
    overflow: hidden;
  }
  .mobile-track {
    display: flex;
    transition: transform 0.4s ease;
  }
  .mobile-slide {
    flex-shrink: 0;
    width: 100%;
    padding: 24px 16px;
    text-align: center;
  }
  .mobile-headline {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 700;
    margin: 0 0 6px;
  }
  .mobile-sub {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0;
  }
  .mobile-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(139, 126, 200, 0.18);
    border: none;
    cursor: pointer;
    padding: 0;
  }
  .dot.active {
    background: var(--gradient-cta);
    width: 22px;
    border-radius: 4px;
  }
}

/* ============================================
   Dark stage (.section-ink) — phones glow as products.
   Phone-internal text stays dark (it sits on light screens);
   only the copy OUTSIDE the phones needs inverting.
   ============================================ */
.section-ink .phone-label {
  color: var(--color-ink-text-primary);
}
.section-ink .phone-body {
  color: var(--color-ink-text-secondary);
}
.section-ink .showcase-eyebrow {
  color: var(--color-secondary);
}
/* Dim the ambient orbs on dark — the .section-ink glow already lights
   the stage; full-strength orbs would muddy the deep plum. */
.section-ink .showcase-orb {
  opacity: 0.35;
}

/* Inactive phones recede; active one lifts with a coloured glow */
.section-ink .phone-frame {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 24px 64px -16px rgba(0, 0, 0, 0.6);
}
.section-ink .phone-col.is-active .phone-frame {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 28px 80px -16px rgba(0, 0, 0, 0.6),
    0 0 90px -24px rgba(139, 126, 200, 0.5);
}
</style>
