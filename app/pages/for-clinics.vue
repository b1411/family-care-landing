<template>
  <div>
    <!-- 1. Hero — Воронка восстановления -->
    <LandingClinicHeroSection />

    <!-- 2. Проблема — Burning Money -->
    <LandingClinicProblemsSection />

    <!-- 3. До и После — сравнение + день координатора -->
    <LandingClinicBeforeAfterSection />

    <!-- 4. Три рабочих стола (координатор / руководитель / врач) -->
    <LandingClinicWhatIsSection />

    <!-- 5. Интерактивный тур — онбординг демо -->
    <LandingClinicOnboardingDemo />

    <!-- 6. Модули — Deep Dive Cards -->
    <LandingClinicModulesDeepDiveSection />

    <!-- 7. Аналитика — Dashboard Demo -->
    <LandingClinicAnalyticsShowcase />

    <!-- 8. ROI калькулятор -->
    <LandingClinicUnitEconomicsSection />

    <!-- 9. Кейсы клиник — Testimonials -->
    <LandingClinicTestimonialsSection />

    <!-- 10. Внедрение — 4 шага -->
    <LandingClinicImplementationSection />

    <!-- 11. White-label -->
    <LandingClinicCustomizationSection />

    <!-- 12. Безопасность -->
    <LandingClinicSecuritySection />

    <!-- 13. FAQ -->
    <LandingClinicFaqSection />

    <!-- 14. CTA — форма -->
    <LandingClinicCtaSection />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Family Care OS для клиник — удержание семей, рост дохода',
  ogTitle: 'Family Care OS для клиник — удержание семей, рост дохода',
  description: '67% семей уходят после родов. Платформа возвращает их. Окупаемость от 160%. Внедрение за 4 недели.',
  ogDescription: '67% семей уходят после родов. Платформа возвращает их. Окупаемость от 160%. Внедрение за 4 недели.',
})
</script>
