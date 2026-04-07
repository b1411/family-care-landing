<template>
  <div>
    <!-- 1. Hero -->
    <LandingHeroSection />

    <!-- 2. Платформа в цифрах -->
    <LandingTrustBadgesSection />

    <!-- 3. Проблема — "Знакомая ситуация?" -->
    <LandingProblemSection />

    <!-- 4. Что такое Family Care OS -->
    <LandingWhatIsSection />

    <!-- 5. Как это работает (timeline) -->
    <LandingHowItWorksSection />

    <!-- 6. Продукт — три интерфейса -->
    <LandingProductShowcaseSection />

    <!-- 7. Ключевые модули -->
    <LandingModulesShowcase />

    <!-- 8. CTA-разделитель -->
    <LandingCtaSplitSection />

    <!-- 9. Финальный CTA -->
    <LandingFinalCtaSection />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'Family Care OS — цифровой маршрут семьи от зачатия до 2 лет',
  ogTitle: 'Family Care OS — цифровой маршрут семьи',
  description: 'Платформа сопровождения семьи для клиник. Назначения, прививки, осмотры, аналитика. Увеличьте удержание семей в 3–5 раз.',
  ogDescription: 'Платформа для клиник: ведение семьи от зачатия до 2 лет',
  ogType: 'website',
  ogLocale: 'ru_RU',
  twitterCard: 'summary_large_image',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Family Care OS',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web',
        description: 'Цифровая платформа для частных клиник. Ведёт семью по маршруту наблюдения от зачатия до 2 лет ребёнка.',
        offers: {
          '@type': 'Offer',
          category: 'SaaS Subscription',
        },
        author: {
          '@type': 'Organization',
          name: 'Family Care OS',
        },
      }),
    },
  ],
})
</script>
