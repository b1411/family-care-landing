<template>
  <LandingUiSectionWrapper
    id="security"
    badge="Безопасность"
    title="Ваши данные под защитой"
  >
    <div class="sec-row" data-stagger="fade-up">
      <div v-for="item in items" :key="item.title" class="sec-item">
        <svg viewBox="0 0 40 40" class="sec-svg" fill="none">
          <circle cx="20" cy="20" r="19" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.3" />
          <path :d="item.icon" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <h4 class="sec-title font-heading">{{ item.title }}</h4>
        <p class="sec-desc">{{ item.desc }}</p>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
const items = [
  {
    title: 'Шифрование',
    desc: 'AES-256 at rest, TLS 1.3 in transit',
    icon: 'M14 16 L16 18 L20 14 M26 20 A6 6 0 1 1 14 20 A6 6 0 0 1 26 20',
  },
  {
    title: 'Row Level Security',
    desc: 'Данные клиник полностью изолированы',
    icon: 'M20 12 L20 28 M12 16 L20 12 L28 16 M12 24 L20 28 L28 24',
  },
  {
    title: 'Журнал действий',
    desc: 'Каждое действие записывается',
    icon: 'M14 14 L26 14 M14 20 L26 20 M14 26 L22 26',
  },
  {
    title: 'Соответствие',
    desc: 'Закон РК «О персональных данных»',
    icon: 'M20 12 L26 16 L26 22 C26 26 20 30 20 30 C20 30 14 26 14 22 L14 16 Z',
  },
]
</script>

<style scoped>
.sec-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  max-width: var(--content-medium);
  margin: 0 auto;
}

.sec-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.sec-svg {
  width: 48px;
  height: 48px;
}

.sec-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.sec-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 4px 0 0;
  line-height: 1.4;
}

@media (max-width: 640px) {
  .sec-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}
</style>
