<template>
  <section id="family-faq" class="family-faq landing-section">
    <div class="landing-container">
      <div class="faq-header" data-reveal="fade-up">
        <span class="landing-badge">FAQ</span>
        <h2 class="font-heading">Частые вопросы</h2>
      </div>

      <div class="faq-list" data-stagger="fade-up">
        <div v-for="(faq, i) in faqs" :key="faq.q" class="faq-item landing-card">
          <button class="faq-toggle" @click="toggle(i)">
            <span class="faq-q">{{ faq.q }}</span>
            <svg class="faq-chevron" :class="{ open: openIdx === i }" width="18" height="18" viewBox="0 0 18 18">
              <path d="M5 7 L9 11 L13 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <Transition name="faq-expand">
            <div v-show="openIdx === i" class="faq-a">
              <p>{{ faq.a }}</p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const openIdx = ref<number | null>(0)

function toggle(i: number) {
  openIdx.value = openIdx.value === i ? null : i
}

const faqs = [
  {
    q: 'Это бесплатно?',
    a: 'Да. Приложение предоставляется вашей клиникой бесплатно. Никаких скрытых платежей.',
  },
  {
    q: 'Как получить доступ?',
    a: 'Скажите координатору вашей клиники. Вам создадут аккаунт за 2 минуты и отправят ссылку в WhatsApp.',
  },
  {
    q: 'Работает без интернета?',
    a: 'Да. Маршрут, назначения и документы доступны offline. Данные синхронизируются при подключении.',
  },
  {
    q: 'Кто видит мои данные?',
    a: 'Только вы и ваш врач. Данные зашифрованы. Мы не продаём и не передаём информацию.',
  },
  {
    q: 'Можно добавить папу или бабушку?',
    a: 'Да. Пригласите второго родителя с уровнем доступа «просмотр» или полный.',
  },
]
</script>

<style scoped>
.faq-header {
  text-align: center;
  margin-bottom: 40px;
}

.faq-header h2 {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 12px 0 0;
}

.faq-list {
  max-width: var(--content-medium);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-item {
  padding: 0;
  overflow: hidden;
}

.faq-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 18px 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.faq-q {
  font-size: clamp(13px, 4vw, 15px);
  font-weight: 600;
  color: var(--color-text-primary);
  flex: 1;
  padding-right: 16px;
}

.faq-chevron {
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform 0.2s;
}

.faq-chevron.open { transform: rotate(180deg); }

.faq-a {
  padding: 0 24px 18px;
}

.faq-a p {
  font-size: 14px;
  line-height: 170%;
  color: var(--color-text-secondary);
  margin: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}

.faq-expand-enter-active,
.faq-expand-leave-active {
  transition: all 0.2s ease;
}

.faq-expand-enter-from,
.faq-expand-leave-to {
  opacity: 0;
}
</style>
