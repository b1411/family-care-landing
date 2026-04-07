<template>
  <LandingUiSectionWrapper
    badge="Отзывы"
    title="Что говорят наши пользователи"
    subtitle="Клиники и семьи, которые уже используют платформу"
  >
    <div class="testimonials-container" ref="trackWrap">
      <div class="testimonials-track" ref="track">
        <LandingUiTestimonialCard
          v-for="(t, i) in [...testimonials, ...testimonials]"
          :key="`t-${i}`"
          :name="t.name"
          :role="t.role"
          :clinic="t.clinic"
          :quote="t.quote"
          :rating="t.rating"
          :metric="t.metric"
          :metric-label="t.metricLabel"
          :avatar-color="t.color"
        />
      </div>
    </div>

    <!-- Dots -->
    <div class="testimonials-controls">
      <button @click="scroll(-1)" class="control-btn" aria-label="Назад">
        <Icon name="lucide:chevron-left" />
      </button>
      <button @click="scroll(1)" class="control-btn" aria-label="Вперёд">
        <Icon name="lucide:chevron-right" />
      </button>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const track = ref<HTMLElement | null>(null)
const trackWrap = ref<HTMLElement | null>(null)

const testimonials = [
  {
    name: 'Айгерим Сатпаева',
    role: 'Директор клиники',
    clinic: 'Мать и Дитя, Алматы',
    quote: 'За 4 месяца мы увеличили удержание с 33% до 61%. Координаторы наконец видят всю картину — кто на каком этапе, кому нужно напомнить, у кого просрочен визит.',
    rating: 5,
    metric: '+85%',
    metricLabel: 'рост удержания',
    color: 'var(--gradient-cta)',
  },
  {
    name: 'Дамира Нурланова',
    role: 'Мама',
    clinic: 'MedPark, Астана',
    quote: 'Первая беременность — столько тревоги. А тут открываешь приложение и видишь: сегодня витамин D, через 3 дня — УЗИ, через неделю — скрининг. Всё понятно, ничего не забудешь.',
    rating: 5,
    metric: '0',
    metricLabel: 'пропущенных визитов',
    color: 'linear-gradient(135deg, #E8A0BF, #F2C4A0)',
  },
  {
    name: 'Марат Абилов',
    role: 'Руководитель педиатрии',
    clinic: 'SunMed, Шымкент',
    quote: 'Раньше после выписки мы теряли 70% семей. Сейчас маршрут автоматически ведёт их до 2 лет — вакцинация, осмотры, анализы. Семьи остаются с нами.',
    rating: 5,
    metric: '×3.2',
    metricLabel: 'рост дохода на семью',
    color: 'linear-gradient(135deg, #A8C8E8, #8B7EC8)',
  },
  {
    name: 'Алия Касымова',
    role: 'Мама двойни',
    clinic: 'BabyClinic, Алматы',
    quote: 'С двойней — двойной хаос. Два маршрута, два календаря прививок, два набора анализов. Приложение всё разделило и напоминает для каждого ребёнка отдельно.',
    rating: 5,
    metric: '100%',
    metricLabel: 'прививок вовремя',
    color: 'linear-gradient(135deg, #F2C4A0, #E8A0BF)',
  },
  {
    name: 'Бекзат Оспанов',
    role: 'Координатор',
    clinic: 'Мать и Дитя, Алматы',
    quote: 'Я веду 180 семей через панель. Раньше предел был 35-40 через WhatsApp. Задачи приоритизированы, я вижу кто «красный» — и сразу звоню.',
    rating: 5,
    metric: '180',
    metricLabel: 'семей одновременно',
    color: 'linear-gradient(135deg, #8B7EC8, #A8C8E8)',
  },
  {
    name: 'Жанна Тулегенова',
    role: 'Мама',
    clinic: 'KidsCare, Караганда',
    quote: 'Документы — моя больная тема. Раньше скриншоты анализов были в 5 чатах. Теперь всё в одном месте, с датами и категориями. При смене врача — просто показала экран.',
    rating: 5,
    metric: '47',
    metricLabel: 'документов в архиве',
    color: 'linear-gradient(135deg, #E8A0BF, #8B7EC8)',
  },
]

function scroll(direction: number) {
  if (!track.value) return
  const cardWidth = 380
  track.value.scrollBy({ left: direction * cardWidth, behavior: 'smooth' })
}

let autoScrollInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  autoScrollInterval = setInterval(() => {
    if (!track.value) return
    const maxScroll = track.value.scrollWidth - track.value.clientWidth
    if (track.value.scrollLeft >= maxScroll - 10) {
      track.value.scrollLeft = 0
    } else {
      track.value.scrollBy({ left: 380, behavior: 'smooth' })
    }
  }, 4000)
})

onUnmounted(() => {
  if (autoScrollInterval) clearInterval(autoScrollInterval)
})
</script>

<style scoped>
.testimonials-container {
  overflow: hidden;
  margin: 0 -24px;
  padding: 0 24px;
}

.testimonials-track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 8px 0 16px;
}

.testimonials-track::-webkit-scrollbar {
  display: none;
}

.testimonials-track > * {
  scroll-snap-align: start;
  flex-shrink: 0;
}

.testimonials-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.control-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-secondary);
}

.control-btn:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
