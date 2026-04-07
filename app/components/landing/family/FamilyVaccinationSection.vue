<template>
  <section class="vaccination-section landing-section" data-clip-reveal="inset">
    <div class="landing-container">
      <div class="vax-header" data-reveal="fade-up">
        <span class="landing-badge">Вакцинация</span>
        <h2 ref="vaxTitleRef" class="font-display">Заполняющийся щит иммунитета</h2>
        <p class="vax-subtitle">Все 18+ прививок по нацкалендарю. Напоминания за 3 дня.</p>
      </div>

      <div class="vax-layout">
        <!-- Shield SVG -->
        <div class="vax-shield-col" data-reveal="fade-up">
          <div class="vax-shield">
            <LandingSvgImmunityShield />
          </div>
          <!-- Progress indicator under shield -->
          <div class="vax-progress">
            <div class="vax-progress-bar">
              <div
                class="vax-progress-fill"
                :style="{ width: `${(doneCount / vaccines.length) * 100}%` }"
              />
            </div>
            <span class="vax-progress-text">{{ doneCount }}/{{ vaccines.length }} выполнено</span>
          </div>
        </div>

        <!-- Vaccine list -->
        <div class="vax-list" data-stagger="fade-up">
          <div
            v-for="v in vaccines"
            :key="v.name"
            :class="['vax-item', `vax-${v.status}`]"
          >
            <div class="vax-status-icon">
              <svg v-if="v.status === 'done'" width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="7" fill="var(--color-success, #22C55E)" opacity="0.15" />
                <path d="M5 8 L7 10 L11 6" fill="none" stroke="var(--color-success, #22C55E)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg v-else-if="v.status === 'progress'" width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="7" fill="var(--color-primary)" opacity="0.15" />
                <circle cx="8" cy="8" r="3" fill="var(--color-primary)" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="7" fill="var(--color-border)" opacity="0.3" />
                <circle cx="8" cy="8" r="2" fill="var(--color-border)" />
              </svg>
            </div>
            <div class="vax-info">
              <span class="vax-name">{{ v.name }}</span>
              <span class="vax-desc">{{ v.desc }}</span>
            </div>
            <span v-if="v.status === 'progress'" class="vax-badge-active">В процессе</span>
            <span v-else-if="v.status === 'upcoming'" class="vax-badge-soon">Скоро</span>
          </div>
          <p class="vax-footer">Напоминание за 3 дня · История каждой прививки · Серия и номер партии</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSplitText } from '~/composables/useSplitText'

const vaxTitleRef = ref<HTMLElement | null>(null)

const vaccines = [
  { name: 'БЦЖ', desc: 'Туберкулёз — при рождении', status: 'done' },
  { name: 'Гепатит B ×3', desc: '0, 1, 6 месяцев', status: 'done' },
  { name: 'Пентавакцина ×3', desc: 'Дифтерия, коклюш, столбняк, полио, Hib', status: 'done' },
  { name: 'Полиомиелит ×4', desc: 'ИПВ / ОПВ', status: 'progress' },
  { name: 'Пневмококк ×3', desc: 'PCV13', status: 'progress' },
  { name: 'КПК', desc: 'Корь, паротит, краснуха — 12 мес', status: 'upcoming' },
  { name: 'Ревакцинация АКДС', desc: '18 месяцев', status: 'upcoming' },
]

const doneCount = computed(() => vaccines.filter(v => v.status === 'done').length)

onMounted(() => {
  if (vaxTitleRef.value) useSplitText(vaxTitleRef)
})
</script>

<style scoped>
.vax-header {
  text-align: center;
  margin-bottom: 48px;
}

.vax-header h2 {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 12px 0 8px;
}

.vax-subtitle {
  font-size: 17px;
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 500px;
  margin-inline: auto;
}

.vax-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 48px;
  align-items: start;
  max-width: 720px;
  margin: 0 auto;
}

.vax-shield-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.vax-shield {
  display: flex;
  justify-content: center;
  max-width: 200px;
}

/* Progress bar */
.vax-progress {
  width: 100%;
  text-align: center;
}

.vax-progress-bar {
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}

.vax-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-success, #22C55E), var(--color-primary));
  border-radius: 2px;
  transition: width 1s ease;
}

.vax-progress-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.vax-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vax-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--color-surface, #f9f9f9);
  border: 1px solid var(--color-border-light);
  transition: border-color 0.3s, box-shadow 0.3s;
}

.vax-item:hover {
  border-color: var(--color-primary-light);
}

.vax-item.vax-progress {
  border-color: var(--color-primary-light);
  box-shadow: 0 2px 12px rgba(139, 126, 200, 0.08);
}

.vax-status-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.vax-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.vax-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.vax-desc {
  font-size: 12px;
  color: var(--color-text-muted);
}

.vax-badge-active {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light, rgba(139, 126, 200, 0.1));
  padding: 2px 8px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.vax-badge-soon {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-surface-alt, #f5f5f5);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.vax-footer {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 8px 0 0;
  font-style: italic;
}

@media (max-width: 768px) {
  .vax-layout {
    grid-template-columns: 1fr;
    justify-items: center;
  }
}
</style>
