<template>
  <section ref="sectionRef" class="cta-split">
    <div class="landing-container">
      <div ref="gridRef" class="split-grid">
        <!-- For clinics -->
        <NuxtLink to="/for-clinics" class="split-card split-card--clinic landing-card">
          <div class="split-svg-wrap">
            <svg viewBox="0 0 200 100" fill="none" class="split-svg">
              <!-- Dashboard bars -->
              <rect x="20" y="60" width="24" height="30" rx="4" fill="var(--color-primary)" opacity="0.3" class="bar bar-1" />
              <rect x="52" y="40" width="24" height="50" rx="4" fill="var(--color-primary)" opacity="0.5" class="bar bar-2" />
              <rect x="84" y="25" width="24" height="65" rx="4" fill="var(--color-primary)" opacity="0.7" class="bar bar-3" />
              <rect x="116" y="15" width="24" height="75" rx="4" fill="var(--color-primary)" class="bar bar-4" />
              <!-- Trend line -->
              <path d="M32 55 L64 35 L96 20 L128 10" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-dasharray="120" class="trend-line" />
            </svg>
          </div>
          <h3 class="split-title font-heading">Вы управляете клиникой?</h3>
          <p class="split-desc">Узнайте, как удержать 67% семей, которые уходят после родов, и вырастить LTV каждого пациента</p>
          <span class="split-link font-heading">
            Подробнее
            <Icon name="lucide:arrow-right" size="18" class="split-arrow" />
          </span>
        </NuxtLink>

        <!-- For families -->
        <NuxtLink to="/for-families" class="split-card split-card--family landing-card">
          <div class="split-svg-wrap">
            <svg viewBox="0 0 120 180" fill="none" class="split-svg split-svg--phone">
              <!-- Phone frame -->
              <rect x="10" y="5" width="100" height="170" rx="16" stroke="var(--color-secondary)" stroke-width="1.5" fill="var(--color-surface)" />
              <rect x="40" y="10" width="40" height="5" rx="2.5" fill="var(--color-border)" />
              <!-- Timeline items -->
              <rect x="20" y="30" width="80" height="14" rx="4" fill="var(--color-secondary-light)" class="phone-item phone-item-1" />
              <rect x="20" y="50" width="80" height="14" rx="4" fill="var(--color-surface-hover)" class="phone-item phone-item-2" />
              <rect x="20" y="70" width="80" height="14" rx="4" fill="var(--color-surface-hover)" class="phone-item phone-item-3" />
              <rect x="20" y="90" width="80" height="14" rx="4" fill="var(--color-secondary-light)" class="phone-item phone-item-4" />
              <!-- Notification -->
              <rect x="16" y="120" width="88" height="24" rx="6" fill="var(--color-secondary)" opacity="0.15" class="phone-notif" />
              <circle cx="30" cy="132" r="6" fill="var(--color-secondary)" opacity="0.4" />
              <rect x="40" y="128" width="50" height="4" rx="2" fill="var(--color-secondary)" opacity="0.3" />
              <rect x="40" y="135" width="30" height="3" rx="1.5" fill="var(--color-secondary)" opacity="0.2" />
            </svg>
          </div>
          <h3 class="split-title font-heading">Вы ждёте малыша?</h3>
          <p class="split-desc">Узнайте, как приложение поведёт вас по маршруту от зачатия до 2 лет — ничего не забудете</p>
          <span class="split-link font-heading">
            Подробнее
            <Icon name="lucide:arrow-right" size="18" class="split-arrow" />
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { gsap, ScrollTrigger } = useGsap()

const sectionRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!gsap || !ScrollTrigger || !sectionRef.value || !gridRef.value) return

  const cards = gridRef.value.querySelectorAll('.split-card')

  // Cards entrance
  gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 })

  ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: 'back.out(1.3)',
      })
    },
  })

  // Magnetic hover — card follows mouse slightly
  cards.forEach((card) => {
    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height
      gsap.to(card, {
        x: x * 8,
        y: y * 6,
        rotateY: x * 3,
        rotateX: -y * 3,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
    const handleLeave = () => {
      gsap.to(card, {
        x: 0,
        y: 0,
        rotateY: 0,
        rotateX: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      })
    }
    card.addEventListener('mousemove', handleMove)
    card.addEventListener('mouseleave', handleLeave)
  })
})
</script>

<style scoped>
.cta-split {
  padding: var(--section-py) 0;
}

.split-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  perspective: 800px;
}

.split-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 32px;
  text-decoration: none;
  cursor: pointer;
  flex: 1;
  will-change: transform;
  transform-style: preserve-3d;
  transition: box-shadow 0.3s ease;
}

.split-card:hover {
  box-shadow: var(--shadow-hover);
}

.split-grid:hover .split-card:not(:hover) {
  opacity: 0.85;
}

.split-svg-wrap {
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.split-svg {
  height: 100px;
  width: auto;
}

.split-svg--phone {
  height: 100px;
}

/* Animate bars on hover */
.split-card--clinic .bar {
  transform-origin: bottom;
  transition: transform 0.4s ease;
}
.split-card--clinic:hover .bar-1 { transform: scaleY(1.2); }
.split-card--clinic:hover .bar-2 { transform: scaleY(1.15); }
.split-card--clinic:hover .bar-3 { transform: scaleY(1.1); }
.split-card--clinic:hover .bar-4 { transform: scaleY(1.05); }

.split-card--clinic .trend-line {
  stroke-dashoffset: 120;
  transition: stroke-dashoffset 0.8s ease;
}
.split-card--clinic:hover .trend-line {
  stroke-dashoffset: 0;
}

/* Animate phone items on hover */
.split-card--family .phone-item {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}
.split-card--family:hover .phone-item { opacity: 1; }
.split-card--family .phone-notif {
  opacity: 0;
  transition: opacity 0.4s ease 0.2s;
}
.split-card--family:hover .phone-notif { opacity: 1; }

.split-title {
  font-size: var(--text-h3);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.split-desc {
  font-size: var(--text-body);
  line-height: 1.55;
  color: var(--color-text-secondary);
  margin: 0 0 20px;
  max-width: 320px;
}

.split-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary);
  transition: gap 0.2s;
}

.split-card:hover .split-link {
  gap: 10px;
}

.split-arrow {
  transition: transform 0.2s;
}

.split-card:hover .split-arrow {
  transform: translateX(3px);
}

@media (max-width: 768px) {
  .split-grid {
    grid-template-columns: 1fr;
  }
  .cta-split {
    padding: 48px 0;
  }
}
</style>
