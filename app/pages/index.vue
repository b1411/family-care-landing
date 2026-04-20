<template>
  <div>
    <!-- 1. Hero -->
    <LandingHeroSection />

    <!-- 2. Платформа в цифрах -->
    <LandingTrustBadgesSection />

    <!-- 3. Проблема — "Знакомая ситуация?" -->
    <LandingProblemSection />

    <!-- 4. Что такое UMAI Health -->
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

    <!-- Mobile sticky CTA -->
    <LandingStickyMobileCta />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'UMAI Health — цифровой маршрут семьи от зачатия до 2 лет',
  ogTitle: 'UMAI Health — цифровой маршрут семьи',
  description: 'UMAI Health — цифровой маршрут семьи от зачатия до 2 лет под брендом вашей клиники. 50+ событий, 3 роли, white-label, без IT-отдела.',
  ogDescription: 'Цифровой маршрут семьи под брендом вашей клиники. 50+ событий, white-label, без IT-отдела.',
  ogType: 'website',
  ogLocale: 'ru_RU',
  ogImage: 'https://umai-health.kz/og-image.png',
  ogUrl: 'https://umai-health.kz/',
  twitterCard: 'summary_large_image',
  twitterImage: 'https://umai-health.kz/og-image.png',
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://umai-health.kz/' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'UMAI Health',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web',
        description: 'Цифровая платформа для частных клиник. Ведёт семью по маршруту наблюдения от зачатия до 2 лет ребёнка.',
        offers: {
          '@type': 'Offer',
          category: 'SaaS Subscription',
        },
        author: {
          '@type': 'Organization',
          name: 'UMAI Health',
        },
      }),
    },
  ],
})
</script>
