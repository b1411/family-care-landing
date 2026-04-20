<template>
  <div>
    <!-- 1. Hero — эмоциональный хук -->
    <LandingFamilyHeroSection />

    <!-- 2. Знакомые проблемы (4 боли) -->
    <LandingFamilyEmotionSection />

    <!-- 3. Что даёт приложение (3 экрана) -->
    <LandingFamilyAppShowcaseSection />

    <!-- 4. День с приложением (24h timeline) -->
    <LandingFamilyDayInLifeSection />

    <!-- 5. Вакцинация (щит иммунитета) -->
    <LandingFamilyVaccinationSection />

    <!-- 6. Как подключиться + FAQ -->
    <LandingFamilyOnboardingSection />
    <LandingFamilyFaqSection />

    <!-- 7. CTA для семей -->
    <LandingFamilyCtaSection />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'UMAI Health для родителей — всё о малыше в одном приложении',
  ogTitle: 'UMAI Health для родителей',
  description: 'Приложение от вашей клиники с маршрутом ребёнка: напоминания о витаминах, календарь прививок, хранение документов. Работает оффлайн.',
  ogDescription: 'Маршрут ребёнка, напоминания, прививки, документы. Работает оффлайн. Бесплатно от вашей клиники.',
  ogImage: 'https://umai-health.kz/og-image.png',
  ogUrl: 'https://umai-health.kz/for-families',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://umai-health.kz/for-families' },
  ],
})
</script>
