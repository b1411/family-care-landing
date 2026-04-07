<template>
  <div>
    <!-- 1. Hero — эмоциональный хук -->
    <LandingFamilyHeroSection />

    <!-- 2. Знакомые проблемы (4 боли) -->
    <LandingFamilyEmotionSection />

    <!-- 3. Цифры доверия -->
    <LandingFamilyStatsSection />

    <!-- 4. Как подключиться за 3 минуты (онбординг) -->
    <LandingFamilyOnboardingSection />

    <!-- 5. Что даёт приложение (3 phones) -->
    <LandingFamilyAppShowcaseSection />

    <!-- 6. Все 9 модулей с интерактивными экранами -->
    <LandingFamilyModulesSection />

    <!-- 7. День с приложением (24h timeline) -->
    <LandingFamilyDayInLifeSection />

    <!-- 8. Документы — глубокий дайв в архив -->
    <LandingFamilyDocumentsSection />

    <!-- 9. Маршрут ребёнка (GrowingChild morph) -->
    <LandingFamilyGrowingChildSection />

    <!-- 10. Вакцинация (ImmunityShield) -->
    <LandingFamilyVaccinationSection />

    <!-- 11. Безопасность (lock + 3 points) -->
    <LandingFamilySecuritySection />

    <!-- 12. FAQ (5 вопросов) -->
    <LandingFamilyFaqSection />

    <!-- 13. CTA -->
    <LandingFamilyCtaSection />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Family Care OS для родителей — всё о малыше в одном приложении',
  ogTitle: 'Family Care OS для родителей — всё о малыше в одном приложении',
  description: 'Маршрут ребёнка, напоминания о витаминах, прививки, анализы — бесплатно от вашей клиники.',
  ogDescription: 'Маршрут ребёнка, напоминания о витаминах, прививки, анализы — бесплатно от вашей клиники.',
})
</script>
