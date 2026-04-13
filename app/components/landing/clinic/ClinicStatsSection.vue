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
    icon: 'lucide:route',
    value: 50,
    prefix: '',
    suffix: '+',
    label: 'Событий в маршруте каждой семьи',
    sublabel: 'Осмотры, анализы, прививки, назначения — всё автоматически',
    bg: 'var(--color-primary-light)',
  },
  {
    icon: 'lucide:users',
    value: 3,
    prefix: '',
    suffix: '',
    label: 'Роли в платформе',
    sublabel: 'Мама, координатор, руководитель — каждый видит своё',
    bg: 'var(--color-secondary-light)',
  },
  {
    icon: 'lucide:palette',
    value: 100,
    prefix: '',
    suffix: '%',
    label: 'White-label брендирование',
    sublabel: 'Ваш логотип, цвета, домен — семьи видят только вашу клинику',
    bg: 'var(--color-accent-blue-light)',
  },
  {
    icon: 'lucide:zap',
    value: 0,
    prefix: '',
    suffix: '',
    label: 'Дней на IT с вашей стороны',
    sublabel: 'Всё настраиваем мы. Координатору нужен только браузер',
    bg: 'rgba(233,196,106,0.12)',
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
