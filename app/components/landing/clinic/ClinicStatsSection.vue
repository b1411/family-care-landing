<template>
  <section class="clinic-stats-section landing-section" ref="sectionRef">
    <div class="landing-container">
      <div class="stats-grid" data-stagger="scale-in">
        <div v-for="stat in stats" :key="stat.label" class="stat-card glass-card" data-tilt>
          <div class="stat-icon-wrap" :style="{ background: stat.bg }">
            <Icon :name="stat.icon" class="stat-icon" />
          </div>
          <div class="stat-value font-display" ref="counterRefs">
            <LandingUiAnimatedCounter :target="stat.value" :suffix="stat.suffix" :prefix="stat.prefix" />
          </div>
          <p class="stat-label">{{ stat.label }}</p>
          <p class="stat-sublabel">{{ stat.sublabel }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const sectionRef = ref<HTMLElement | null>(null)

const stats = [
  {
    icon: 'lucide:user-x',
    value: 67,
    prefix: '',
    suffix: '%',
    label: 'Клиник теряют пациентов после родов',
    sublabel: 'Без системного сопровождения семьи уходят в первые 3 месяца',
    bg: 'rgba(212,114,124,0.12)',
  },
  {
    icon: 'lucide:smartphone',
    value: 85,
    prefix: '',
    suffix: '%',
    label: 'Мам ищут digital-решение',
    sublabel: 'Современные родители ожидают цифровой опыт от клиники',
    bg: 'var(--color-primary-light)',
  },
  {
    icon: 'lucide:trending-up',
    value: 5,
    prefix: '×',
    suffix: '',
    label: 'Рост LTV при сопровождении',
    sublabel: 'Средний LTV семьи с маршрутом vs без маршрута',
    bg: 'var(--color-secondary-light)',
  },
  {
    icon: 'lucide:clock',
    value: 70,
    prefix: '−',
    suffix: '%',
    label: 'Снижение ручной работы',
    sublabel: 'Автоматизация задач координатора через панель управления',
    bg: 'var(--color-accent-blue-light)',
  },
]
</script>

<style scoped>
.clinic-stats-section {
  padding: 48px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  text-align: center;
  padding: 32px 20px;
  border-radius: var(--radius-lg);
  transition: transform var(--transition-smooth), box-shadow var(--transition-smooth);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.stat-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.stat-icon {
  width: 26px;
  height: 26px;
  color: var(--color-text-primary);
}

.stat-value {
  font-size: 40px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 110%;
}

.stat-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 8px 0 4px;
}

.stat-sublabel {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 150%;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .stat-value {
    font-size: 32px;
  }
}
</style>
