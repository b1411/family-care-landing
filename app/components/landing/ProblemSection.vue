<template>
  <section ref="sectionRef" class="problem-section landing-section">
    <div class="landing-container">
      <div class="section-header">
        <span class="section-badge font-heading">Проблема</span>
        <h2 ref="titleRef" class="section-title font-display">Знакомая ситуация?</h2>
      </div>

      <!-- Tab switcher -->
      <div class="problem-tabs">
        <button
          class="problem-tab font-heading"
          :class="{ 'is-active': !showSolution }"
          @click="showSolution = false"
        >
          <span class="problem-tab-dot problem-tab-dot--red" />
          Без платформы
        </button>
        <button
          class="problem-tab font-heading"
          :class="{ 'is-active': showSolution }"
          @click="showSolution = true"
        >
          <span class="problem-tab-dot problem-tab-dot--green" />
          С платформой
        </button>
      </div>

      <!-- Cards grid -->
      <div ref="cardsRef" class="problem-cards">
        <TransitionGroup name="problem-card" tag="div" class="problem-cards-inner">
          <div
            v-for="(item, i) in activeItems"
            :key="item.title"
            class="problem-card landing-card"
            :class="showSolution ? 'problem-card--solution' : 'problem-card--problem'"
            :style="{ transitionDelay: `${i * 80}ms` }"
          >
            <div class="problem-card-icon" :class="`problem-card-icon--${item.color}`">
              <Icon :name="item.icon" size="20" />
            </div>
            <div class="problem-card-content">
              <h3 class="problem-card-title font-heading">{{ item.title }}</h3>
              <p class="problem-card-desc">{{ item.desc }}</p>
            </div>
            <!-- Micro-illustration for solution cards -->
            <div v-if="showSolution && item.micro" class="problem-card-micro">
              <div v-if="item.micro === 'progress'" class="micro-progress">
                <div class="micro-progress-bar">
                  <div class="micro-progress-fill" :style="{ width: item.microValue }" />
                </div>
                <span class="micro-progress-label font-mono">{{ item.microValue }}</span>
              </div>
              <div v-else-if="item.micro === 'badge'" class="micro-badge font-mono">
                {{ item.microValue }}
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { gsap, ScrollTrigger } = useGsap()

const sectionRef = ref<HTMLElement | null>(null)
const cardsRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const showSolution = ref(false)
let autoSwitchTimer: ReturnType<typeof setTimeout> | null = null

const problemItems = [
  {
    icon: 'lucide:smartphone',
    color: 'danger',
    title: 'Мама ищет результаты в 3 чатах',
    desc: 'Анализы в WhatsApp, направления в SMS, назначения на бумажке. Каждый раз — заново.'
  },
  {
    icon: 'lucide:clipboard-list',
    color: 'danger',
    title: 'Координатор обзванивает вслепую',
    desc: '40 семей в Excel — без приоритетов, без статусов соблюдения. Кто выпал — неизвестно.'
  },
  {
    icon: 'lucide:trending-down',
    color: 'danger',
    title: 'Руководитель не видит потерь',
    desc: '67% семей уходят после родов, но клиника узнаёт об этом слишком поздно.'
  },
]

const solutionItems = [
  {
    icon: 'lucide:check-circle',
    color: 'success',
    title: 'Всё в одном приложении',
    desc: 'Push-напоминания, документы, запись к врачу — мама нашла за 5 секунд.',
    micro: 'badge',
    microValue: '5 сек',
  },
  {
    icon: 'lucide:target',
    color: 'success',
    title: 'Координатор видит кого звать',
    desc: 'Сводка: 3 семьи просрочили визит, соблюдение назначений — 94%.',
    micro: 'progress',
    microValue: '94%',
  },
  {
    icon: 'lucide:trending-up',
    color: 'success',
    title: 'Удержание на экране',
    desc: 'Руководитель видит: 87% остались, конверсия в педиатрию — 73%.',
    micro: 'progress',
    microValue: '87%',
  },
]

type ProblemItem = { icon: string; color: string; title: string; desc: string; micro?: string; microValue?: string }
const activeItems = computed<ProblemItem[]>(() => showSolution.value ? solutionItems : problemItems)

useSplitText(titleRef, {
  type: 'words',
  from: { y: '100%', opacity: 0 },
  stagger: 0.06,
  duration: 0.7,
  ease: 'back.out(1.4)',
  scrollStart: 'top 80%',
})

onMounted(() => {
  if (!gsap || !ScrollTrigger || !sectionRef.value) return

  // Auto-switch to solution after 3s of being in viewport
  ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 60%',
    once: true,
    onEnter: () => {
      autoSwitchTimer = setTimeout(() => {
        if (!showSolution.value) showSolution.value = true
      }, 3000)
    },
  })
})

onUnmounted(() => {
  if (autoSwitchTimer) clearTimeout(autoSwitchTimer)
})
</script>

<style scoped>
.problem-section {
  background: var(--color-bg-alt);
}

.section-header {
  text-align: center;
  margin-bottom: 36px;
}

.section-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: var(--radius-full);
  background: var(--color-secondary-light);
  color: var(--color-secondary-dark);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  margin-bottom: 16px;
}

.section-title {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

/* Tab switcher */
.problem-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
}

.problem-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.problem-tab:hover {
  border-color: var(--color-primary);
  color: var(--color-text-primary);
}

.problem-tab.is-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  box-shadow: 0 4px 16px rgba(139, 126, 200, 0.3);
}

.problem-tab.is-active .problem-tab-dot {
  background: white;
}

.problem-tab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.3s;
}

.problem-tab-dot--red { background: var(--color-danger); }
.problem-tab-dot--green { background: var(--color-success); }

/* Cards grid */
.problem-cards-inner {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.problem-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 24px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.problem-card--problem {
  border-left: 3px solid rgba(212, 114, 124, 0.4);
}

.problem-card--solution {
  border-left: 3px solid rgba(124, 184, 212, 0.5);
}

.problem-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.problem-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.problem-card-icon--danger {
  background: rgba(212, 114, 124, 0.1);
  color: var(--color-danger);
}

.problem-card-icon--success {
  background: rgba(124, 184, 212, 0.12);
  color: var(--color-success);
}

.problem-card-title {
  font-size: var(--text-card-title);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
}

.problem-card-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.5;
}

/* Micro-illustrations */
.problem-card-micro {
  margin-top: auto;
  padding-top: 8px;
}

.micro-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.micro-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-border-light);
  border-radius: 3px;
  overflow: hidden;
}

.micro-progress-fill {
  height: 100%;
  background: var(--gradient-cta);
  border-radius: 3px;
  transition: width 0.8s ease;
}

.micro-progress-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-primary);
}

.micro-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: 600;
}

/* TransitionGroup animations */
.problem-card-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.problem-card-leave-active {
  transition: all 0.25s ease-in;
  position: absolute;
}

.problem-card-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}

.problem-card-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.96);
}

/* Responsive */
@media (max-width: 900px) {
  .problem-cards-inner {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .problem-tabs {
    flex-direction: column;
    align-items: stretch;
  }
  .problem-tab {
    justify-content: center;
  }
}
</style>
