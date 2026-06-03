<template>
  <section ref="heroRef" class="hero hero-gradient-mesh grain-overlay">
    <!-- Animated orbs -->
    <div class="hero-orbs" aria-hidden="true">
      <div class="orb orb-1" />
      <div class="orb orb-2" />
      <div class="orb orb-3" />
    </div>

    <!-- Phase 15: Pulse waveform (slow medical ECG line) -->
    <svg
      class="hero-pulse-line"
      viewBox="0 0 1600 80"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pulse-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(139, 126, 200, 0)" />
          <stop offset="20%" stop-color="rgba(139, 126, 200, 0.5)" />
          <stop offset="50%" stop-color="rgba(232, 160, 191, 0.55)" />
          <stop offset="80%" stop-color="rgba(139, 126, 200, 0.5)" />
          <stop offset="100%" stop-color="rgba(139, 126, 200, 0)" />
        </linearGradient>
      </defs>
      <path
        class="pulse-path"
        d="M0 40 L260 40 L290 40 L300 35 L312 48 L322 24 L334 56 L344 40 L380 40 L640 40 L680 40 L692 30 L704 50 L716 18 L728 60 L740 40 L780 40 L1040 40 L1080 40 L1092 36 L1104 46 L1116 22 L1128 58 L1140 40 L1180 40 L1600 40"
        fill="none"
        stroke="url(#pulse-grad)"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <!-- Phase 15: Cursor follower (soft dot with lag) -->
    <div
      ref="cursorDotRef"
      class="hero-cursor"
      aria-hidden="true"
    />
    <div
      ref="cursorRingRef"
      class="hero-cursor-ring"
      aria-hidden="true"
    />

    <div class="hero-inner landing-container">
      <div class="hero-content" ref="heroContentRef">
        <div ref="heroBadgeRef" class="hero-badge t-eyebrow">
          <span class="hero-badge-dot" />
          Для частных клиник педиатрии и акушерства
        </div>

        <h1 ref="heroTitleRef" class="hero-title t-display-hero">
          Цифровой маршрут <span class="hero-title-accent">здоровья&nbsp;семьи</span> — от первой недели беременности до двух лет ребёнка.
        </h1>

        <p ref="heroSubRef" class="hero-subtitle t-lead">
          Клиника и&nbsp;семья — в&nbsp;едином маршруте наблюдения. Приложение под&nbsp;вашим&nbsp;брендом, готовые медицинские протоколы, аналитика для&nbsp;руководителя.
          <span class="hero-typewriter" :class="{ 'typewriter-active': isTyping, 'typewriter-done': isDone }">{{ displayText }}</span>
        </p>

        <div ref="heroFeaturesRef" class="hero-features">
          <div v-for="(f, i) in heroFeatures" :key="i" class="hero-feature">
            <div class="hero-feature-icon">
              <Icon :name="f.icon" size="18" />
            </div>
            <div class="hero-feature-text">
              <span class="hero-feature-title font-heading">{{ f.title }}</span>
              <span class="hero-feature-desc">{{ f.desc }}</span>
            </div>
          </div>
        </div>

        <div ref="heroActionsRef" class="hero-actions">
          <NuxtLink
            to="/demo"
            class="hero-cta-primary font-heading btn-shimmer magnetic-btn"
            aria-label="Открыть демо-версию платформы"
          >
            Попробовать демо
            <Icon name="lucide:arrow-right" size="18" class="cta-arrow" />
          </NuxtLink>
          <a
            href="#contact"
            class="hero-cta-secondary font-heading magnetic-btn"
            aria-label="Перейти к форме обсуждения подключения"
          >
            Обсудить подключение
            <Icon name="lucide:message-circle" size="18" />
          </a>
        </div>
      </div>

      <!-- ====== NEW: CSS 3D Phone + Floating Cards ====== -->
      <div
        ref="heroVisualRef"
        class="hero-visual"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
      >
        <!-- Phone wrapper: CSS 3D perspective -->
        <div ref="phoneWrapperRef" class="phone-scene">
          <!-- Phase 15: breathing aura behind phone -->
          <div class="phone-aura" aria-hidden="true" />
          <div ref="phoneBodyRef" class="phone-body">
            <!-- Glossy reflection overlay -->
            <div class="phone-gloss" />
            <!-- Phone frame -->
            <div class="phone-frame">
              <!-- Dynamic Island -->
              <div class="phone-island" />
              <!-- Screen content — UMAI Health (premium app mockup) -->
              <div class="phone-screen" ref="phoneScreenRef">
                <!-- Status bar -->
                <div class="screen-statusbar">
                  <span class="statusbar-time font-mono">09:41</span>
                  <div class="statusbar-icons">
                    <Icon name="lucide:signal" size="10" />
                    <Icon name="lucide:wifi" size="10" />
                    <Icon name="lucide:battery-full" size="10" />
                  </div>
                </div>

                <!-- App header: clinic mark + week + bell with badge -->
                <div class="screen-header">
                  <span class="screen-logo">
                    <Icon name="lucide:heart-pulse" size="11" />
                  </span>
                  <span class="screen-title">UMAI Health</span>
                  <span ref="weekBadgeRef" class="screen-week font-mono">{{ phoneWeek }} нед</span>
                  <span class="screen-bell" aria-hidden="true">
                    <Icon name="lucide:bell" size="11" />
                    <span class="screen-bell-dot" />
                  </span>
                </div>

                <!-- Greeting with avatar -->
                <div class="screen-greeting">
                  <div class="screen-avatar">
                    <span class="screen-avatar-initial">А</span>
                  </div>
                  <div class="screen-greeting-body">
                    <span class="screen-greet-name">Привет, Айгерим</span>
                    <span class="screen-greet-sub">Тимур · {{ phoneWeek }} неделя · 2-й&nbsp;триместр</span>
                  </div>
                </div>

                <!-- Hero adherence card with sparkline + trend -->
                <div class="screen-hero-card">
                  <div class="hero-card-head">
                    <span class="hero-card-lbl">Соблюдение сегодня</span>
                    <span class="hero-card-trend">
                      <Icon name="lucide:trending-up" size="10" />
                      <span>+3%</span>
                    </span>
                  </div>
                  <span class="hero-card-val font-mono">94<sup>%</sup></span>
                  <svg class="hero-card-spark" viewBox="0 0 120 24" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="hero-spark-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="rgba(255,255,255,0.32)" />
                        <stop offset="100%" stop-color="rgba(255,255,255,0)" />
                      </linearGradient>
                    </defs>
                    <path d="M0 20 L0 18 L15 16 L30 14 L45 10 L60 12 L75 8 L90 6 L105 4 L120 3 L120 24 L0 24 Z" fill="url(#hero-spark-fill)" />
                    <polyline points="0,18 15,16 30,14 45,10 60,12 75,8 90,6 105,4 120,3" fill="none" stroke="rgba(255,255,255,0.92)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="hero-card-bar">
                    <div ref="progressFillRef" class="hero-card-bar-fill" />
                  </div>
                </div>

                <!-- 3 mini stats row -->
                <div class="screen-stats">
                  <div class="stat-mini">
                    <Icon name="lucide:flame" size="10" class="stat-mini-icon stat-mini-icon--fire" />
                    <span class="stat-mini-num font-mono">14</span>
                    <span class="stat-mini-lbl">streak</span>
                  </div>
                  <div class="stat-mini">
                    <Icon name="lucide:route" size="10" class="stat-mini-icon stat-mini-icon--route" />
                    <span class="stat-mini-num font-mono">68<sup>%</sup></span>
                    <span class="stat-mini-lbl">маршрут</span>
                  </div>
                  <div class="stat-mini">
                    <Icon name="lucide:shield-check" size="10" class="stat-mini-icon stat-mini-icon--shield" />
                    <span class="stat-mini-num font-mono">6/18</span>
                    <span class="stat-mini-lbl">прививок</span>
                  </div>
                </div>

                <!-- Today's events -->
                <div class="screen-section">
                  <div class="screen-section-head">
                    <span class="screen-section-title">Сегодня</span>
                    <span class="screen-section-meta font-mono">4 события</span>
                  </div>
                  <div class="screen-items">
                    <div class="s-item s-item--done">
                      <div class="s-item-icon s-item-icon--pill">
                        <Icon name="lucide:check" size="10" />
                      </div>
                      <div class="s-item-body">
                        <span class="s-item-name">Витамин D3</span>
                        <span class="s-item-meta">09:00 · принято</span>
                      </div>
                      <span class="s-item-time font-mono">✓</span>
                    </div>
                    <div class="s-item s-item--next">
                      <div class="s-item-icon s-item-icon--visit">
                        <Icon name="lucide:calendar-check" size="10" />
                      </div>
                      <div class="s-item-body">
                        <span class="s-item-name">Педиатр — Др. Алия К.</span>
                        <span class="s-item-meta">Завтра 10:30 · Каб.&nbsp;204</span>
                      </div>
                      <span class="s-item-tag s-item-tag--action">2&nbsp;ч</span>
                    </div>
                    <div class="s-item">
                      <div class="s-item-icon s-item-icon--lab">
                        <Icon name="lucide:flask-conical" size="10" />
                      </div>
                      <div class="s-item-body">
                        <span class="s-item-name">Анализ крови</span>
                        <span class="s-item-meta">Результат готов</span>
                      </div>
                      <span class="s-item-tag s-item-tag--new">Нов</span>
                    </div>
                  </div>
                </div>

                <!-- AI insight callout -->
                <div class="screen-ai">
                  <span class="screen-ai-spark">
                    <Icon name="lucide:sparkles" size="10" />
                  </span>
                  <div class="screen-ai-body">
                    <span class="screen-ai-title">AI&nbsp;разбор</span>
                    <span class="screen-ai-text">Маршрут идёт хорошо. Завтра — УЗИ 2&nbsp;триместра.</span>
                  </div>
                </div>

                <!-- Vaccination strip -->
                <div class="screen-vacc">
                  <div class="screen-vacc-head">
                    <span class="screen-vacc-title">Календарь прививок</span>
                    <span class="screen-vacc-next">АКДС-1 · 5&nbsp;дн</span>
                  </div>
                  <div class="screen-vacc-dots">
                    <span v-for="n in 18" :key="`v-${n}`" class="screen-vacc-dot"
                      :class="{ 'is-done': n <= 6, 'is-next': n === 7 }" />
                  </div>
                </div>

                <!-- Bottom nav -->
                <div class="screen-nav">
                  <div class="nav-item nav-item--active">
                    <Icon name="lucide:route" size="14" />
                    <span>Маршрут</span>
                  </div>
                  <div class="nav-item">
                    <Icon name="lucide:calendar-days" size="14" />
                    <span>Записи</span>
                  </div>
                  <div class="nav-item">
                    <Icon name="lucide:file-text" size="14" />
                    <span>Док-ты</span>
                  </div>
                  <div class="nav-item">
                    <Icon name="lucide:user" size="14" />
                    <span>Профиль</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- Phone shadow (below phone, perspective-aware) -->
            <div class="phone-shadow" />
          </div>
        </div>

        <!-- Floating cards orbiting the phone -->
        <div ref="floatingNotifRef" class="hero-float hero-float--notif" data-speed="0.8">
          <div class="float-card glass-card">
            <div class="float-icon float-icon--bell">
              <Icon name="lucide:bell-ring" size="14" />
            </div>
            <div class="float-body">
              <span class="float-title">Напоминание</span>
              <span class="float-desc">Витамин D3 — 08:00</span>
            </div>
            <span class="float-badge">Принять</span>
          </div>
        </div>

        <div ref="floatingAdherenceRef" class="hero-float hero-float--adherence" data-speed="1.2">
          <div class="float-card glass-card">
            <div class="float-icon float-icon--chart">
              <Icon name="lucide:trending-up" size="14" />
            </div>
            <div class="float-body">
              <span class="float-title">Маршрут</span>
              <div class="float-bar"><div class="float-bar-fill" /></div>
            </div>
            <span class="float-pct font-mono">68%</span>
          </div>
        </div>

        <div ref="floatingDocRef" class="hero-float hero-float--doc" data-speed="0.6">
          <div class="float-card glass-card">
            <div class="float-icon float-icon--doc">
              <Icon name="lucide:stethoscope" size="14" />
            </div>
            <div class="float-body">
              <span class="float-title">Др. Алия К.</span>
              <span class="float-desc">Педиатр · завтра</span>
            </div>
          </div>
        </div>

        <div ref="floatingVaccRef" class="hero-float hero-float--vacc" data-speed="1.0">
          <div class="float-card glass-card">
            <div class="float-icon float-icon--shield">
              <Icon name="lucide:shield-check" size="14" />
            </div>
            <div class="float-body">
              <span class="float-title">Прививки 6/18</span>
              <div class="float-vacc-dots" aria-hidden="true">
                <span v-for="n in 18" :key="`fv-${n}`" class="float-vacc-dot"
                  :class="{ 'is-done': n <= 6, 'is-next': n === 7 }" />
              </div>
            </div>
          </div>
        </div>

        <div ref="floatingAiRef" class="hero-float hero-float--ai" data-speed="0.9">
          <div class="float-card glass-card">
            <div class="float-icon float-icon--ai">
              <Icon name="lucide:sparkles" size="14" />
              <span class="float-icon-pulse" aria-hidden="true" />
            </div>
            <div class="float-body">
              <span class="float-title">AI&nbsp;разбор</span>
              <span class="float-desc">+3% маршрут ↗</span>
            </div>
          </div>
        </div>

        <!-- Phase 15: WHO growth curve card -->
        <div ref="floatingGrowthRef" class="hero-float hero-float--growth" data-speed="0.7">
          <div class="float-card float-card--growth glass-card">
            <div class="growth-head">
              <div class="float-icon float-icon--growth">
                <Icon name="lucide:baby" size="13" />
              </div>
              <div class="growth-meta">
                <span class="float-title">Рост по ВОЗ</span>
                <span class="float-desc">Коридор 50–97%</span>
              </div>
              <span class="growth-tag font-mono">75%</span>
            </div>
            <svg
              class="growth-chart"
              viewBox="0 0 132 52"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="growth-area" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="rgba(139, 126, 200, 0.22)" />
                  <stop offset="100%" stop-color="rgba(139, 126, 200, 0)" />
                </linearGradient>
              </defs>
              <!-- 97th percentile (top) -->
              <path
                d="M0 14 C 22 11, 44 9, 66 8 S 110 6, 132 5"
                fill="none"
                stroke="rgba(139, 126, 200, 0.28)"
                stroke-width="1"
                stroke-dasharray="2 3"
              />
              <!-- 75th percentile (middle, ideal) -->
              <path
                class="growth-line-norm"
                d="M0 26 C 22 23, 44 21, 66 19 S 110 16, 132 14"
                fill="none"
                stroke="rgba(139, 126, 200, 0.45)"
                stroke-width="1.1"
              />
              <!-- 50th percentile (bottom) -->
              <path
                d="M0 40 C 22 37, 44 34, 66 31 S 110 27, 132 24"
                fill="none"
                stroke="rgba(139, 126, 200, 0.22)"
                stroke-width="1"
                stroke-dasharray="2 3"
              />
              <!-- Child's actual track -->
              <path
                class="growth-line-actual"
                d="M0 30 C 22 27, 44 24, 66 21 S 110 18, 132 16 L132 52 L0 52 Z"
                fill="url(#growth-area)"
                stroke="none"
              />
              <path
                class="growth-line-actual-stroke"
                d="M0 30 C 22 27, 44 24, 66 21 S 110 18, 132 16"
                fill="none"
                stroke="rgb(232, 160, 191)"
                stroke-width="1.6"
                stroke-linecap="round"
              />
              <!-- Latest measurement dot -->
              <circle class="growth-dot" cx="132" cy="16" r="2.4" fill="rgb(232, 160, 191)" />
              <circle class="growth-dot-ring" cx="132" cy="16" r="5" fill="none" stroke="rgba(232, 160, 191, 0.4)" stroke-width="1" />
            </svg>
            <div class="growth-foot">
              <span class="growth-foot-label">12 мес</span>
              <span class="growth-foot-value font-mono">74 см · 9.4 кг</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div ref="scrollIndicatorRef" class="scroll-indicator">
      <div class="scroll-mouse">
        <div class="scroll-wheel" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const heroRef = ref<HTMLElement | null>(null)
const heroContentRef = ref<HTMLElement | null>(null)
const heroVisualRef = ref<HTMLElement | null>(null)
const heroTitleRef = ref<HTMLElement | null>(null)
const heroSubRef = ref<HTMLElement | null>(null)
const heroActionsRef = ref<HTMLElement | null>(null)
const heroFeaturesRef = ref<HTMLElement | null>(null)
const scrollIndicatorRef = ref<HTMLElement | null>(null)

const heroFeatures = [
  { icon: 'lucide:zap', title: 'Маршрут за 2 секунды', desc: '50+ событий планируются автоматически' },
  { icon: 'lucide:users', title: '3 роли', desc: 'Родитель, координатор, руководитель — каждый видит своё' },
  { icon: 'lucide:palette', title: 'Под вашим брендом', desc: 'Приложение с логотипом и цветами клиники' },
  { icon: 'lucide:rocket', title: 'Без IT-отдела', desc: 'Внедрение и настройку берём на себя' },
]

const heroBadgeRef = ref<HTMLElement | null>(null)

// Week badge ref
const weekBadgeRef = ref<HTMLElement | null>(null)

// Typewriter for subtitle
const { displayText, isTyping, isDone } = useTypewriter(
  ['для клиник', 'для семей', 'для врачей'],
  { typeSpeed: 70, deleteSpeed: 40, pauseAfterType: 2500 }
)

// Reactive phone week counter
const phoneWeek = ref(16)

// Phone refs
const phoneWrapperRef = ref<HTMLElement | null>(null)
const phoneBodyRef = ref<HTMLElement | null>(null)
const phoneScreenRef = ref<HTMLElement | null>(null)
const progressFillRef = ref<HTMLElement | null>(null)

// Floating refs
const floatingNotifRef = ref<HTMLElement | null>(null)
const floatingAdherenceRef = ref<HTMLElement | null>(null)
const floatingDocRef = ref<HTMLElement | null>(null)
const floatingVaccRef = ref<HTMLElement | null>(null)
const floatingAiRef = ref<HTMLElement | null>(null)
const floatingGrowthRef = ref<HTMLElement | null>(null)

// Phase 15 — cursor follower refs
const cursorDotRef = ref<HTMLElement | null>(null)
const cursorRingRef = ref<HTMLElement | null>(null)

// Mouse tracking state for 3D tilt
const mouseActive = ref(false)
const currentRotX = ref(0)
const currentRotY = ref(0)
const targetRotX = ref(0)
const targetRotY = ref(0)
let lerpRaf: number | null = null
let cursorCleanup: (() => void) | null = null
const magneticCleanups: Array<() => void> = []

const MAX_ROT_Y = 8
const MAX_ROT_X = 5
const LERP_SPEED = 0.08

function onMouseMove(e: MouseEvent) {
  if (!heroVisualRef.value) return
  const rect = heroVisualRef.value.getBoundingClientRect()
  // Normalize to [-1, 1]
  const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
  const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1
  targetRotY.value = nx * MAX_ROT_Y
  targetRotX.value = -ny * MAX_ROT_X
  mouseActive.value = true
}

function onMouseLeave() {
  targetRotX.value = 0
  targetRotY.value = 0
  mouseActive.value = false
}

function lerpLoop() {
  const dx = targetRotX.value - currentRotX.value
  const dy = targetRotY.value - currentRotY.value

  if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
    currentRotX.value += dx * LERP_SPEED
    currentRotY.value += dy * LERP_SPEED
  } else {
    currentRotX.value = targetRotX.value
    currentRotY.value = targetRotY.value
  }

  if (phoneBodyRef.value) {
    phoneBodyRef.value.style.transform =
      `rotateY(${currentRotY.value}deg) rotateX(${currentRotX.value}deg)`
  }

  lerpRaf = requestAnimationFrame(lerpLoop)
}

// H1 is now a slogan with an inline gradient accent span — split-text would
// destroy that markup (it rewrites innerHTML), so use a clean whole-line
// fade-up instead. Calmer and more "expensive" than per-word rotation anyway.
onMounted(() => {
  if (!import.meta.client || !heroTitleRef.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { gsap } = useGsap()
  gsap.from(heroTitleRef.value, {
    y: 28,
    opacity: 0,
    duration: 0.9,
    delay: 0.15,
    ease: 'power3.out',
  })
})

// Subtitle — words, gentler
useSplitText(heroSubRef, {
  type: 'words',
  from: { y: '100%', opacity: 0 },
  stagger: 0.02,
  duration: 0.7,
  ease: 'power3.out',
  scroll: false,
  delay: 0.6,
})

onMounted(() => {
  if (!import.meta.client) return
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isDesktop = window.innerWidth >= 768

  // Start mouse lerp loop on desktop
  if (isDesktop && !reducedMotion) {
    lerpLoop()
  }

  if (reducedMotion) return

  const { gsap } = useGsap()
  const allFloats = [
    floatingNotifRef.value,
    floatingAdherenceRef.value,
    floatingDocRef.value,
    floatingVaccRef.value,
    floatingAiRef.value,
    floatingGrowthRef.value,
  ].filter(Boolean) as HTMLElement[]

  // ---- Master entrance timeline ----
  const masterTL = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // 1. Phone slides up + fades in
  if (phoneWrapperRef.value) {
    gsap.set(phoneWrapperRef.value, { opacity: 0, y: 60 })
    masterTL.to(phoneWrapperRef.value, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
    }, 0)
  }

  // 2. Screen content wipe-in via clip-path
  if (phoneScreenRef.value) {
    gsap.set(phoneScreenRef.value, { clipPath: 'inset(100% 0 0 0)' })
    masterTL.to(phoneScreenRef.value, {
      clipPath: 'inset(0% 0 0 0)',
      duration: 0.8,
      ease: 'power3.inOut',
    }, 0.3)
  }

  // 3. Progress bar fill
  if (progressFillRef.value) {
    gsap.set(progressFillRef.value, { width: '0%' })
    masterTL.to(progressFillRef.value, {
      width: '68%',
      duration: 1.0,
      ease: 'power2.out',
    }, 0.8)
  }

  // 4. Floating cards pop in staggered
  allFloats.forEach((el, i) => {
    gsap.set(el, { scale: 0, opacity: 0 })
    masterTL.to(el, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: 'back.out(1.7)',
    }, 0.7 + i * 0.12)
  })

  // 5. Phone glow pulse
  if (phoneBodyRef.value) {
    masterTL.fromTo(
      phoneBodyRef.value,
      { boxShadow: '0 20px 60px rgba(139, 126, 200, 0)' },
      {
        boxShadow: '0 20px 60px rgba(139, 126, 200, 0.18)',
        duration: 0.6,
        ease: 'power2.out',
      },
      1.0,
    )
  }

  // CTA buttons entrance
  if (heroActionsRef.value) {
    gsap.from(heroActionsRef.value, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: 0.8,
      ease: 'power3.out',
    })
  }

  // Features stagger entrance
  if (heroFeaturesRef.value) {
    const features = heroFeaturesRef.value.querySelectorAll('.hero-feature')
    gsap.set(features, { opacity: 0, y: 20 })
    gsap.to(features, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      delay: 0.5,
      ease: 'power3.out',
    })
  }

  // Badge entrance
  if (heroBadgeRef.value) {
    gsap.from(heroBadgeRef.value, {
      opacity: 0,
      y: -10,
      duration: 0.5,
      delay: 0.1,
      ease: 'power2.out',
    })
  }

  // ---- Continuous floating animation on cards ----
  allFloats.forEach((el, i) => {
    gsap.to(el, {
      y: '+=12',
      duration: 2.4 + i * 0.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.5 + i * 0.15,
    })
  })

  // Scroll indicator fade
  if (scrollIndicatorRef.value) {
    gsap.from(scrollIndicatorRef.value, {
      opacity: 0,
      y: -10,
      duration: 0.5,
      delay: 1.4,
    })
  }

  // ScrollTrigger: phone timeline animation on scroll
  if (heroRef.value && isDesktop) {
    // Animate week counter from 16 to 24 on scroll
    const weekObj = { val: 16 }
    gsap.to(weekObj, {
      val: 24,
      duration: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.value,
        start: 'top top',
        end: '60% top',
        scrub: 1,
      },
      onUpdate: () => {
        phoneWeek.value = Math.round(weekObj.val)
      },
    })

    // Animate screen items appearing sequentially
    const screenItems = heroRef.value.querySelectorAll('.s-item')
    screenItems.forEach((item, i) => {
      gsap.from(item, {
        opacity: 0,
        x: -20,
        duration: 0.5,
        delay: 1.2 + i * 0.15,
        ease: 'power2.out',
      })
    })

    // Animate "Принять" button pulse on the vitamin item
    const actionTag = heroRef.value.querySelector('.s-item-tag--action')
    if (actionTag) {
      gsap.to(actionTag, {
        scale: 1.1,
        duration: 0.4,
        delay: 2.5,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      })
    }
  }

  // ScrollTrigger: hero parallax scroll-out
  if (heroRef.value && isDesktop) {
    const scrollTL = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.value,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
      },
    })
    if (heroContentRef.value) {
      scrollTL.to(heroContentRef.value, { y: -80, opacity: 0, ease: 'none' }, 0)
    }
    if (heroVisualRef.value) {
      scrollTL.to(heroVisualRef.value, { y: -40, scale: 0.92, opacity: 0, ease: 'none' }, 0)
    }
    if (scrollIndicatorRef.value) {
      scrollTL.to(scrollIndicatorRef.value, { opacity: 0, ease: 'none' }, 0)
    }
  }

  // Phase 15 — Cursor follower (desktop only, no reduced motion)
  if (isDesktop && heroRef.value && cursorDotRef.value && cursorRingRef.value) {
    const dot = cursorDotRef.value
    const ring = cursorRingRef.value
    let mouseX = 0
    let mouseY = 0
    let dotX = 0
    let dotY = 0
    let ringX = 0
    let ringY = 0
    let hovering = false
    let raf: number | null = null

    const enter = () => { hovering = true; dot.style.opacity = '1'; ring.style.opacity = '1' }
    const leave = () => { hovering = false; dot.style.opacity = '0'; ring.style.opacity = '0' }
    const move = (e: MouseEvent) => {
      const rect = heroRef.value!.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      if (!hovering) enter()
    }

    const tick = () => {
      // Dot follows tightly, ring lags
      dotX += (mouseX - dotX) * 0.28
      dotY += (mouseY - dotY) * 0.28
      ringX += (mouseX - ringX) * 0.09
      ringY += (mouseY - ringY) * 0.09
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(tick)
    }

    heroRef.value.addEventListener('mousemove', move)
    heroRef.value.addEventListener('mouseenter', enter)
    heroRef.value.addEventListener('mouseleave', leave)
    tick()
    cursorCleanup = () => {
      if (raf) cancelAnimationFrame(raf)
      heroRef.value?.removeEventListener('mousemove', move)
      heroRef.value?.removeEventListener('mouseenter', enter)
      heroRef.value?.removeEventListener('mouseleave', leave)
    }
  }

  // Magnetic CTA buttons
  document.querySelectorAll<HTMLElement>('.magnetic-btn').forEach((btn) => {
    const onMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`
    }
    let resetTimer: ReturnType<typeof setTimeout> | null = null
    const onLeave = () => {
      btn.style.transform = 'translate(0, 0)'
      btn.style.transition = 'transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
      resetTimer = setTimeout(() => { btn.style.transition = '' }, 400)
    }
    btn.addEventListener('mousemove', onMove)
    btn.addEventListener('mouseleave', onLeave)
    magneticCleanups.push(() => {
      btn.removeEventListener('mousemove', onMove)
      btn.removeEventListener('mouseleave', onLeave)
      if (resetTimer) clearTimeout(resetTimer)
    })
  })
})

onBeforeUnmount(() => {
  if (lerpRaf) cancelAnimationFrame(lerpRaf)
  if (cursorCleanup) cursorCleanup()
  magneticCleanups.forEach((fn) => fn())
  magneticCleanups.length = 0
})
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: 132px 0 104px;
  min-height: min(880px, 92vh);
  display: flex;
  align-items: center;
}

/* Animated gradient orbs */
.hero-orbs {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}

.orb-1 {
  width: 620px;
  height: 620px;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.16) 0%, transparent 70%);
  top: -18%;
  left: -12%;
  animation: orb-float-1 32s ease-in-out infinite;
}

.orb-2 {
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(232, 160, 191, 0.12) 0%, transparent 70%);
  top: 20%;
  right: -16%;
  animation: orb-float-2 38s ease-in-out infinite;
}

/* Third orb removed from the motion budget — calmer, more "expensive" field */
.orb-3 {
  display: none;
}

@keyframes orb-float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(80px, 60px) scale(1.1); }
  66% { transform: translate(-40px, 30px) scale(0.95); }
}

@keyframes orb-float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-60px, -80px) scale(1.05); }
  66% { transform: translate(40px, 40px) scale(0.9); }
}

@keyframes orb-float-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(60px, -40px) scale(1.1); }
  66% { transform: translate(-80px, -20px) scale(0.95); }
}

/* Scroll indicator */
.scroll-indicator {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
}

.scroll-mouse {
  width: 24px;
  height: 38px;
  border: 2px solid var(--color-text-muted);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  padding-top: 8px;
  opacity: 0.5;
}

.scroll-wheel {
  width: 3px;
  height: 8px;
  border-radius: 2px;
  background: var(--color-primary);
  animation: scroll-wheel-pulse 1.8s ease-in-out infinite;
}

@keyframes scroll-wheel-pulse {
  0% { opacity: 1; transform: translateY(0); }
  50% { opacity: 0.3; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* ---- Layout ---- */
.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  position: relative;
  z-index: 2;
}

.hero-content {
  max-width: 560px;
}

/* Compact brand wordmark — small pill above the slogan (no longer a giant
   serif headline). Clean grotesk = Linear/Stripe restraint. */
.hero-wordmark {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 22px;
}

.hero-wordmark-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--gradient-cta);
  color: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 4px 12px -3px rgba(139, 126, 200, 0.5);
  flex-shrink: 0;
}

.hero-wordmark-text {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-heading);
}

/* Slogan is now the H1 — sentence scale, ink, tight grotesk.
   Overrides the oversized .t-display-hero token sizing. */
.hero-title {
  color: var(--color-heading);
  font-family: var(--font-display);
  font-size: clamp(2.15rem, 3.8vw, 3.5rem);
  font-weight: 720;
  line-height: 1.08;
  letter-spacing: -0.028em;
  margin: 0 0 22px;
  max-width: 640px;
  text-wrap: balance;
  text-indent: 0;
  padding-left: 0;
  font-variation-settings: normal;
}

/* Single restrained accent — a richer 3-stop brand gradient on the key phrase only.
   Deeper plum start adds dimension vs the flat 2-stop; stays legible on light. */
.hero-title-accent {
  background: linear-gradient(118deg, #6E5FB3 0%, #8B7EC8 38%, #D47EA5 78%, #E8A0BF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  margin: 0 0 36px;
  max-width: 520px;
  text-indent: 0;
  padding-left: 0;
}

/* Hero badge */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px 7px 11px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(139, 126, 200, 0.18);
  color: var(--color-primary-dark);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: 0.01em;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 2px 10px -2px rgba(139, 126, 200, 0.14);
}

.hero-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

/* Hero features list */
.hero-features {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 36px;
}

.hero-feature {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.hero-feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.16) 0%, rgba(232, 160, 191, 0.12) 100%);
  border: 1px solid rgba(139, 126, 200, 0.16);
  color: var(--color-primary);
  flex-shrink: 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.65),
    0 2px 8px -3px rgba(139, 126, 200, 0.22);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.hero-feature:hover .hero-feature-icon {
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.75),
    0 6px 16px -4px rgba(139, 126, 200, 0.34);
}

.hero-feature-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-feature-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.hero-feature-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

/* Hero stats row */
.hero-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding: 16px 0;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-stat-number {
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1.1;
}

.hero-stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.hero-stat-divider {
  width: 1px;
  height: 32px;
  background: var(--color-border);
  flex-shrink: 0;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: var(--radius-full);
  background: var(--gradient-cta);
  color: white;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.3s, box-shadow 0.3s, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.38),
    0 1px 2px rgba(75, 50, 130, 0.18),
    0 6px 22px -4px rgba(139, 126, 200, 0.4);
  will-change: transform;
}

.hero-cta-primary:hover {
  opacity: 0.97;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    0 2px 4px rgba(75, 50, 130, 0.2),
    0 12px 40px -6px rgba(139, 126, 200, 0.5);
  transform: translateY(-2px);
}

.hero-cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 1px 3px rgba(139, 126, 200, 0.06);
  will-change: transform;
}

.hero-cta-secondary:hover {
  border-color: var(--color-primary);
  box-shadow: 0 6px 24px rgba(139, 126, 200, 0.18);
  transform: translateY(-2px);
}

/* Typewriter in subtitle */
.hero-typewriter {
  color: var(--color-primary);
  font-weight: 600;
}

/* Smart segment banner */
.hero-segment-banner {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
}

.segment-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none;
  transition: background var(--transition-fast), border-color var(--transition-fast);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.segment-link:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-ultralight);
}

.segment-link--clinic .iconify {
  color: var(--color-primary);
}

.segment-link--family .iconify {
  color: var(--color-secondary);
}

.segment-arrow {
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.segment-link:hover .segment-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Auth hint below CTA */
.hero-auth-hint {
  margin-top: 16px;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.hero-auth-link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.hero-auth-link:hover {
  text-decoration: underline;
}

.cta-arrow {
  transition: transform 0.2s;
}

.hero-cta-primary:hover .cta-arrow {
  transform: translateX(3px);
}

/* ============================================
   CSS 3D Phone
   ============================================ */
.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 540px;
  perspective: 1200px;
}

.phone-scene {
  position: relative;
  z-index: 2;
}

.phone-body {
  position: relative;
  transform-style: preserve-3d;
  will-change: transform;
  transition: box-shadow 0.6s ease;
  border-radius: 44px;
}

.phone-frame {
  position: relative;
  width: 280px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 44px;
  padding: 12px;
  box-shadow:
    0 1px 0 rgba(139, 126, 200, 0.06),
    0 8px 30px rgba(139, 126, 200, 0.12),
    0 20px 60px rgba(139, 126, 200, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow: hidden;
}

/* Dynamic Island */
.phone-island {
  width: 90px;
  height: 26px;
  background: #2a2a2c;
  border-radius: 20px;
  margin: 2px auto 8px;
}

/* Glossy reflection overlay */
.phone-gloss {
  position: absolute;
  inset: 0;
  border-radius: 44px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.18) 0%,
    rgba(255, 255, 255, 0.04) 40%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 10;
}

/* Phone shadow — sits below phone in 3D space */
.phone-shadow {
  position: absolute;
  bottom: -16px;
  left: 10%;
  right: 10%;
  height: 40px;
  background: radial-gradient(ellipse, rgba(139, 126, 200, 0.18) 0%, transparent 70%);
  filter: blur(12px);
  transform: translateZ(-20px);
  pointer-events: none;
}

/* ---- Phone Screen Content ---- */
.phone-screen {
  background: var(--color-bg-alt);
  border-radius: 32px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.screen-statusbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px 4px;
  font-size: 10px;
  color: var(--color-text-muted);
}

.statusbar-time {
  font-weight: 600;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.statusbar-icons {
  display: flex;
  gap: 4px;
  color: var(--color-text-muted);
}

/* ─── App header: logo + name + week pill + bell ─── */
.screen-header {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px 8px;
}

.screen-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--gradient-cta);
  color: white;
  flex-shrink: 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 2px 6px -2px rgba(139, 126, 200, 0.45);
}

.screen-title {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.screen-week {
  font-size: 9.5px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-weight: 700;
  letter-spacing: -0.005em;
  flex-shrink: 0;
}

.screen-bell {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: rgba(139, 126, 200, 0.08);
  border: 1px solid rgba(139, 126, 200, 0.12);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.screen-bell-dot {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-secondary);
  border: 1.5px solid var(--color-bg-alt);
  box-shadow: 0 0 4px var(--color-secondary);
}

/* ─── Greeting with avatar ─── */
.screen-greeting {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 9px;
  align-items: center;
  padding: 0 12px 8px;
}

.screen-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light));
  border: 1.5px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 6px -2px rgba(139, 126, 200, 0.32);
}

.screen-avatar-initial {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.02em;
}

.screen-greeting-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.screen-greet-name {
  font-family: var(--font-display);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  line-height: 1.15;
}

.screen-greet-sub {
  font-size: 9.5px;
  color: var(--color-text-muted);
  font-weight: 500;
  margin-top: 1px;
}

/* ─── Hero adherence card ─── */
.screen-hero-card {
  position: relative;
  margin: 0 12px 8px;
  padding: 10px 12px 9px;
  border-radius: 13px;
  background: var(--gradient-cta);
  color: white;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 6px 18px -6px rgba(139, 126, 200, 0.45);
}

.screen-hero-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top right, rgba(255,255,255,0.18), transparent 55%);
  pointer-events: none;
}

.hero-card-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.hero-card-lbl {
  font-family: var(--font-body);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.92;
}

.hero-card-trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  font-family: var(--font-mono);
  font-size: 8.5px;
  font-weight: 600;
}

.hero-card-val {
  position: relative;
  display: block;
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
  margin: 4px 0 0;
}

.hero-card-val sup {
  font-size: 0.5em;
  vertical-align: super;
}

.hero-card-spark {
  position: relative;
  width: 100%;
  height: 18px;
  display: block;
  margin-top: 2px;
}

.hero-card-bar {
  position: relative;
  height: 3px;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 3px;
}

.hero-card-bar-fill {
  height: 100%;
  width: 94%;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 2px;
}

/* ─── 3 mini stats ─── */
.screen-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 5px;
  padding: 0 12px 8px;
}

.stat-mini {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 7px 8px 6px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(139, 126, 200, 0.08);
}

.stat-mini-icon { margin-bottom: 2px; }
.stat-mini-icon--fire { color: #E76F51; }
.stat-mini-icon--route { color: var(--color-primary); }
.stat-mini-icon--shield { color: var(--color-mint-dark, #2A8886); }

.stat-mini-num {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  line-height: 1;
}
.stat-mini-num sup { font-size: 0.5em; vertical-align: super; }

.stat-mini-lbl {
  font-family: var(--font-body);
  font-size: 8.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 1px;
}

/* ─── Section header (Сегодня) ─── */
.screen-section {
  padding: 0 12px 6px;
}

.screen-section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 5px;
}

.screen-section-title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.screen-section-meta {
  font-size: 8.5px;
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
}

/* Screen items */
.screen-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.s-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(139, 126, 200, 0.06);
  box-shadow: 0 1px 2px rgba(139, 126, 200, 0.04);
}

.s-item--done .s-item-name {
  color: var(--color-text-muted);
  text-decoration: line-through;
  text-decoration-color: rgba(139, 126, 200, 0.3);
}

.s-item--next {
  background: white;
  border-color: rgba(139, 126, 200, 0.22);
  box-shadow: 0 3px 10px -3px rgba(139, 126, 200, 0.22);
}

.s-item-icon {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.s-item-icon--pill { background: linear-gradient(135deg, #5BC0BE, #2A8886); }
.s-item-icon--visit { background: var(--gradient-cta); }
.s-item-icon--lab { background: linear-gradient(135deg, #7CB8D4, #4A8AC5); }
.s-item-icon--vaccine { background: linear-gradient(135deg, #5BC0BE, #1E7A6E); }

.s-item-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.s-item-name {
  display: block;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.005em;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.s-item-meta {
  display: block;
  font-size: 8.5px;
  color: var(--color-text-muted);
  font-weight: 500;
  line-height: 1.2;
  margin-top: 1px;
}

.s-item-time {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-mint-dark, #2A8886);
  flex-shrink: 0;
}

.s-item-tag {
  font-size: 8.5px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: -0.005em;
}

.s-item-tag--action {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.s-item-tag--new {
  background: var(--color-secondary-light);
  color: var(--color-secondary-dark);
}

/* ─── AI insight callout ─── */
.screen-ai {
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 8px;
  align-items: flex-start;
  margin: 0 12px 8px;
  padding: 7px 10px 8px;
  border-radius: 10px;
  background:
    linear-gradient(135deg, rgba(139, 126, 200, 0.08), rgba(232, 160, 191, 0.08));
  border: 1px solid rgba(139, 126, 200, 0.14);
}

.screen-ai-spark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--gradient-cta);
  color: white;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32);
}

.screen-ai-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.screen-ai-title {
  font-family: var(--font-display);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: 1px;
}

.screen-ai-text {
  font-size: 9.5px;
  line-height: 1.35;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* ─── Vaccinations strip ─── */
.screen-vacc {
  margin: 0 12px 6px;
  padding: 7px 10px 8px;
  border-radius: 10px;
  background: rgba(248, 246, 252, 0.85);
  border: 1px solid rgba(139, 126, 200, 0.06);
}

.screen-vacc-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 4px;
}

.screen-vacc-title {
  font-family: var(--font-display);
  font-size: 9.5px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.screen-vacc-next {
  font-family: var(--font-mono);
  font-size: 8.5px;
  font-weight: 600;
  color: var(--color-secondary-dark);
}

.screen-vacc-dots {
  display: grid;
  grid-template-columns: repeat(18, 1fr);
  gap: 2px;
}

.screen-vacc-dot {
  height: 4px;
  border-radius: 1px;
  background: rgba(139, 126, 200, 0.14);
}

.screen-vacc-dot.is-done {
  background: var(--gradient-cta);
}

.screen-vacc-dot.is-next {
  background: rgba(232, 160, 191, 0.7);
  box-shadow: 0 0 4px rgba(232, 160, 191, 0.7);
}

/* Bottom nav */
.screen-nav {
  display: flex;
  justify-content: space-around;
  padding: 8px 4px 10px;
  border-top: 1px solid var(--color-border-light);
  background: var(--color-surface);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 8.5px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.nav-item--active {
  color: var(--color-primary);
}

/* ============================================
   Floating cards
   ============================================ */
.hero-float {
  position: absolute;
  z-index: 3;
  pointer-events: none;
}

.hero-float--notif {
  top: 4%;
  right: -2%;
}

.hero-float--adherence {
  bottom: 12%;
  left: -6%;
}

.hero-float--doc {
  top: 32%;
  left: -12%;
}

.hero-float--vacc {
  bottom: 4%;
  right: -4%;
}

.hero-float--ai {
  top: 14%;
  left: 2%;
}

.float-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 14px;
  font-size: 12px;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(139, 126, 200, 0.12);
  box-shadow: 0 4px 20px rgba(139, 126, 200, 0.1);
}

.float-card--compact {
  padding: 7px 12px;
  gap: 6px;
}

.float-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.float-icon--bell { background: var(--color-primary); }
.float-icon--chart { background: var(--color-success); }
.float-icon--doc { background: var(--color-secondary); }
.float-icon--shield { background: var(--color-accent-blue); }
.float-icon--ai { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); }

.float-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.float-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.float-desc {
  font-size: 9.5px;
  color: var(--color-text-muted);
}

.float-badge {
  padding: 3px 9px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 600;
}

.float-pct {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-success);
}

.float-bar {
  width: 48px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border-light);
  overflow: hidden;
}

.float-bar-fill {
  width: 94%;
  height: 100%;
  border-radius: 2px;
  background: var(--gradient-cta);
}

/* Mini vacc-dots inside floating card */
.float-vacc-dots {
  display: grid;
  grid-template-columns: repeat(18, 1fr);
  gap: 1.5px;
  width: 64px;
  margin-top: 3px;
}

.float-vacc-dot {
  height: 3px;
  border-radius: 1px;
  background: rgba(139, 126, 200, 0.18);
}

.float-vacc-dot.is-done {
  background: var(--gradient-cta);
}

.float-vacc-dot.is-next {
  background: var(--color-secondary);
  box-shadow: 0 0 3px var(--color-secondary);
}

/* AI float — sparkle icon with pulsing aura */
.float-icon-pulse {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  opacity: 0;
  z-index: -1;
}

.float-icon--ai { position: relative; isolation: isolate; }

@media (prefers-reduced-motion: no-preference) {
  .float-icon--ai .float-icon-pulse {
    animation: float-ai-pulse 2.4s ease-out infinite;
  }
}

@keyframes float-ai-pulse {
  0% { opacity: 0.55; transform: scale(1); }
  70% { opacity: 0; transform: scale(1.55); }
  100% { opacity: 0; transform: scale(1.55); }
}

/* ---- Idle float animation (CSS fallback) ---- */
@media (prefers-reduced-motion: no-preference) {
  .phone-body {
    animation: phone-idle-float 5s ease-in-out infinite;
  }
}

@keyframes phone-idle-float {
  0%, 100% { transform: translateY(0) rotateY(0deg) rotateX(0deg); }
  25% { transform: translateY(-6px) rotateY(1deg) rotateX(-0.5deg); }
  50% { transform: translateY(-10px) rotateY(0deg) rotateX(0.5deg); }
  75% { transform: translateY(-4px) rotateY(-1deg) rotateX(0deg); }
}

/* ============================================
   Phase 15 — Pulse waveform (background ECG line)
   ============================================ */
.hero-pulse-line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 18%;
  width: 100%;
  height: 80px;
  z-index: 1;
  pointer-events: none;
  opacity: 0.55;
}

.pulse-path {
  stroke-dasharray: 1600;
  stroke-dashoffset: 1600;
  animation: pulse-trace 9s linear infinite;
  filter: drop-shadow(0 0 8px rgba(139, 126, 200, 0.35));
}

@keyframes pulse-trace {
  0% { stroke-dashoffset: 1600; opacity: 0; }
  10% { opacity: 1; }
  85% { opacity: 1; }
  100% { stroke-dashoffset: -1600; opacity: 0; }
}

/* ============================================
   Phase 15 — Cursor follower (soft lavender dot + lagging ring)
   ============================================ */
.hero-cursor,
.hero-cursor-ring {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0;
  z-index: 50;
  transition: opacity 0.3s ease;
  will-change: transform;
}

.hero-cursor {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 126, 200, 0.95) 0%, rgba(139, 126, 200, 0.6) 60%, transparent 100%);
  box-shadow:
    0 0 14px rgba(139, 126, 200, 0.55),
    0 0 28px rgba(232, 160, 191, 0.25);
  mix-blend-mode: multiply;
}

.hero-cursor-ring {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(139, 126, 200, 0.35);
  background: radial-gradient(circle, transparent 60%, rgba(232, 160, 191, 0.08) 100%);
  backdrop-filter: blur(2px);
  animation: cursor-ring-pulse 2.6s ease-in-out infinite;
}

@keyframes cursor-ring-pulse {
  0%, 100% { border-color: rgba(139, 126, 200, 0.35); }
  50% { border-color: rgba(232, 160, 191, 0.45); }
}

/* Hide cursor follower on touch */
@media (hover: none) {
  .hero-cursor,
  .hero-cursor-ring { display: none; }
}

/* ============================================
   Phase 15 — Phone breathing aura
   ============================================ */
.phone-aura {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 380px;
  height: 580px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    rgba(139, 126, 200, 0.18) 0%,
    rgba(232, 160, 191, 0.12) 35%,
    transparent 70%
  );
  filter: blur(40px);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
}

@media (prefers-reduced-motion: no-preference) {
  .phone-aura {
    animation: phone-aura-breathe 4.5s ease-in-out infinite;
  }
}

@keyframes phone-aura-breathe {
  0%, 100% {
    transform: translate(-50%, -50%) scale(0.92);
    opacity: 0.65;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.08);
    opacity: 1;
  }
}

/* ============================================
   Phase 15 — Growth curve floating card
   ============================================ */
.hero-float--growth {
  top: 48%;
  right: -10%;
}

.float-card--growth {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  min-width: 170px;
  white-space: normal;
}

.growth-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.float-icon--growth {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.18), rgba(232, 160, 191, 0.18));
  color: var(--color-primary);
}

.growth-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.growth-tag {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary);
  background: rgba(139, 126, 200, 0.12);
  padding: 2px 7px;
  border-radius: var(--radius-full);
}

.growth-chart {
  width: 100%;
  height: 52px;
  display: block;
}

.growth-line-norm {
  stroke-dasharray: 220;
  stroke-dashoffset: 220;
  animation: growth-norm-draw 2.4s ease-out 1.3s forwards;
}

.growth-line-actual-stroke {
  stroke-dasharray: 220;
  stroke-dashoffset: 220;
  animation: growth-norm-draw 2s ease-out 1.6s forwards;
}

.growth-dot,
.growth-dot-ring {
  opacity: 0;
  animation: growth-dot-pop 0.5s ease-out 3.4s forwards;
}

.growth-dot-ring {
  transform-origin: 132px 16px;
  animation: growth-dot-ring 2.4s ease-out 3.4s infinite;
}

@keyframes growth-norm-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes growth-dot-pop {
  0% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes growth-dot-ring {
  0% { opacity: 0.6; transform: scale(0.7); }
  80% { opacity: 0; transform: scale(2.4); }
  100% { opacity: 0; transform: scale(2.4); }
}

.growth-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 2px;
  border-top: 1px solid rgba(139, 126, 200, 0.08);
}

.growth-foot-label {
  font-size: 9.5px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.growth-foot-value {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-text-primary);
}

/* ---- Responsive ---- */
@media (max-width: 1024px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 48px;
    text-align: center;
  }
  .hero-content { max-width: 100%; }
  .hero-subtitle { margin-left: auto; margin-right: auto; }
  .hero-stats { justify-content: center; }
  .hero-actions { justify-content: center; }
  .hero-features { max-width: 480px; margin-left: auto; margin-right: auto; }
  .hero-badge { margin-left: auto; margin-right: auto; }
  .hero-segment-banner { justify-content: center; }
  .hero-visual { order: -1; min-height: 440px; }
  .hero-float--doc { left: -4%; }
  .hero-float--adherence { left: 0; }
  .hero-float--ai { left: 6%; }
  .hero-float--growth { right: -2%; top: 52%; }
  .hero-pulse-line { bottom: 8%; height: 60px; opacity: 0.4; }
  .hero-cursor,
  .hero-cursor-ring { display: none; }
}

@media (max-width: 768px) {
  .hero-visual {
    min-height: 400px;
    perspective: none;
  }
  .phone-body {
    animation: none !important;
    transform: none !important;
  }
  .phone-gloss { display: none; }
  .phone-frame { width: 260px; }
  /* Keep only 2 floating cards on mobile */
  .hero-float--doc,
  .hero-float--vacc,
  .hero-float--ai,
  .hero-float--growth { display: none; }
  .hero-pulse-line { display: none; }
  .phone-aura { display: none; }
  .hero-float--notif { top: 2%; right: 0; }
  .hero-float--adherence { bottom: 2%; left: 0; }
}

@media (max-width: 480px) {
  .hero {
    padding: 110px 0 64px;
    min-height: auto;
  }
  .hero-visual { min-height: 360px; }
  .phone-frame { width: clamp(200px, 70vw, 260px); }
  .hero-features { flex-wrap: wrap; max-width: 100%; }

  .hero-stats {
    flex-wrap: wrap;
    gap: 12px;
    justify-content: flex-start;
  }
  .hero-stat-divider { display: none; }
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .hero-cta-primary,
  .hero-cta-secondary {
    justify-content: center;
  }
  .hero-float { display: none; }
  .hero-segment-banner {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
