<template>
  <section ref="heroRef" class="family-hero landing-section">
    <!-- Ambient floating blobs -->
    <div class="hero-ambient" aria-hidden="true">
      <div class="blob blob-1" />
      <div class="blob blob-2" />
      <div class="blob blob-3" />
    </div>

    <div class="landing-container hero-z">
      <div class="hero-grid">
        <!-- Text content -->
        <div class="hero-text">
          <span class="landing-badge badge-secondary" data-reveal="blur-in">ДЛЯ МАМЫ И ПАПЫ</span>
          <h1 ref="familyTitleRef" class="hero-title font-display">
            Один маршрут.<br />Ноль забытых прививок.<br />Спокойные ночи.
          </h1>
          <p class="hero-subtitle" data-reveal="fade-up" data-reveal-delay="500">
            Приложение от вашей клиники, которое помнит всё за вас:<br />
            когда следующий осмотр, какой витамин принять,<br />
            когда прививка — и что делать, если что-то тревожит.
          </p>
          <a
            ref="ctaBtnRef"
            href="#family-faq"
            class="hero-cta hero-cta--secondary font-heading"
            data-reveal="fade-up"
            data-reveal-delay="700"
            @mouseenter="onCtaEnter"
            @mouseleave="onCtaLeave"
          >
            <span class="cta-label">Узнайте у вашей клиники</span>
            <span class="cta-arrow">→</span>
          </a>
        </div>

        <!-- Hand with Phone SVG -->
        <div ref="visualRef" class="hero-visual">
          <div class="visual-glow" />
          <LandingSvgHandWithPhone />
        </div>
      </div>

      <!-- Metrics strip -->
      <div class="hero-metrics" data-stagger="fade-up">
        <div v-for="m in metrics" :key="m.label" class="metric-item">
          <span class="metric-value font-heading">{{ m.value }}</span>
          <span class="metric-label">{{ m.label }}</span>
          <div class="metric-bar">
            <div class="metric-bar-fill" :style="{ width: m.bar }" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const heroRef = ref<HTMLElement | null>(null)
const familyTitleRef = ref<HTMLElement | null>(null)
const visualRef = ref<HTMLElement | null>(null)
const ctaBtnRef = ref<HTMLElement | null>(null)

const metrics = [
  { value: 'Все назначения', label: 'в одном приложении', bar: '100%' },
  { value: 'Каждый анализ', label: 'сохранён и доступен', bar: '100%' },
  { value: 'Каждая прививка', label: 'с напоминанием за 3 дня', bar: '100%' },
  { value: '24/7', label: 'маршрут всегда под рукой', bar: '100%' },
]

useSplitText(familyTitleRef, {
  type: 'words',
  from: { y: '100%', opacity: 0, rotateX: -45 },
  stagger: 0.05,
  duration: 0.9,
  ease: 'power4.out',
  scroll: false,
  delay: 0.15,
})

// Parallax on mouse move for visual
let raf: number | null = null
let mouseX = 0
let mouseY = 0

function onMouseMove(e: MouseEvent) {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2
}

function animate() {
  if (visualRef.value) {
    const tx = mouseX * -12
    const ty = mouseY * -8
    const rx = mouseY * 4
    const ry = mouseX * -4
    visualRef.value.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`
  }
  raf = requestAnimationFrame(animate)
}

function onCtaEnter(e: MouseEvent) {
  const btn = ctaBtnRef.value
  if (!btn) return
  const rect = btn.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.04)`
}

function onCtaLeave() {
  const btn = ctaBtnRef.value
  if (!btn) return
  btn.style.transform = ''
}

onMounted(() => {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (window.matchMedia('(pointer: coarse)').matches) return
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  raf = requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<style scoped>
.family-hero {
  padding: 140px 0 80px;
  position: relative;
  overflow: hidden;
}

.hero-z { position: relative; z-index: 1; }

/* ----- Ambient floating blobs ----- */
.hero-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.45;
  will-change: transform;
}

.blob-1 {
  width: 420px;
  height: 420px;
  background: var(--color-primary-light);
  top: -80px;
  right: 5%;
  animation: blob-float 14s ease-in-out infinite alternate;
}

.blob-2 {
  width: 320px;
  height: 320px;
  background: var(--color-secondary-light);
  bottom: -40px;
  left: 10%;
  animation: blob-float 18s ease-in-out infinite alternate-reverse;
}

.blob-3 {
  width: 200px;
  height: 200px;
  background: var(--color-accent-blue-light);
  top: 30%;
  left: 50%;
  animation: blob-float 12s ease-in-out infinite alternate;
}

@keyframes blob-float {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(30px, -20px) scale(1.08); }
  100% { transform: translate(-20px, 15px) scale(0.95); }
}

/* ----- Grid ----- */
.hero-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 48px;
  align-items: center;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-text-primary);
  margin: 16px 0 20px;
}

.hero-subtitle {
  font-size: 18px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  max-width: 480px;
  margin: 0 0 32px;
}

/* ----- CTA with magnetic effect ----- */
.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: white;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.35s ease;
  will-change: transform;
  position: relative;
  overflow: hidden;
}

.hero-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
}

.hero-cta:hover::before { opacity: 1; }

.hero-cta--secondary {
  background: var(--gradient-cta);
  box-shadow: 0 4px 24px rgba(139, 126, 200, 0.25);
}

.hero-cta:hover {
  box-shadow: 0 8px 32px rgba(139, 126, 200, 0.35);
}

.cta-arrow {
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.hero-cta:hover .cta-arrow {
  transform: translateX(5px);
}

.badge-secondary {
  color: var(--color-secondary, #E8A0BF) !important;
  letter-spacing: 0.08em;
  font-size: 13px;
  font-weight: 600;
}

/* ----- Visual with glow ----- */
.hero-visual {
  display: flex;
  justify-content: center;
  position: relative;
  perspective: 800px;
  transition: transform 0.15s ease-out;
  will-change: transform;
}

.visual-glow {
  position: absolute;
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
  background: radial-gradient(ellipse, var(--color-primary-light) 0%, transparent 70%);
  filter: blur(40px);
  opacity: 0.6;
  animation: glow-pulse 4s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes glow-pulse {
  0%   { opacity: 0.4; transform: scale(0.95); }
  100% { opacity: 0.7; transform: scale(1.05); }
}

/* ----- Metrics ----- */
.hero-metrics {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 56px;
  padding-top: 32px;
  border-top: 1px solid var(--color-border-light);
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 100px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.metric-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.metric-bar {
  width: 48px;
  height: 3px;
  border-radius: 2px;
  background: var(--color-border-light);
  margin-top: 6px;
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--gradient-cta);
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.8s;
}

@media (max-width: 768px) {
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }
  .hero-visual { order: -1; }
  .hero-metrics { gap: 20px; flex-wrap: wrap; }
  .blob { display: none; }
}
</style>
