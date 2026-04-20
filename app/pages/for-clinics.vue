<template>
  <div>
    <!-- Sticky section navigation -->
    <LandingUiSectionNav :sections="sectionNavItems" />

    <!-- 1. Hero — Воронка восстановления -->
    <LandingClinicHeroSection id="clinic-hero" />

    <!-- 2. Проблема + До/После (merged) -->
    <LandingClinicProblemsSection id="clinic-problem" />

    <!-- 3. Три рабочих стола (координатор / руководитель / врач) -->
    <LandingClinicWhatIsSection id="clinic-solution" />

    <!-- 4. ROI калькулятор -->
    <LandingClinicUnitEconomicsSection id="clinic-roi" />

    <!-- 5. Программа пилотного запуска -->
    <LandingClinicPilotSection id="clinic-pilot" />

    <!-- 6. Внедрение — 4 шага -->
    <LandingClinicImplementationSection id="clinic-launch" />

    <!-- 7. White-label -->
    <LandingClinicCustomizationSection id="clinic-brand" />

    <!-- 8. FAQ (+ безопасность) -->
    <LandingClinicFaqSection id="clinic-faq" />

    <!-- 9. CTA — форма -->
    <LandingClinicCtaSection id="clinic-cta" />

    <!-- Mobile sticky CTA -->
    <LandingStickyMobileCta />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const sectionNavItems = [
  { id: 'clinic-hero', label: 'Главная' },
  { id: 'clinic-problem', label: 'Проблема' },
  { id: 'clinic-solution', label: 'Решение' },
  { id: 'clinic-roi', label: 'Экономика' },
  { id: 'clinic-pilot', label: 'Пилот' },
  { id: 'clinic-launch', label: 'Запуск' },
  { id: 'clinic-brand', label: 'Бренд' },
  { id: 'clinic-faq', label: 'FAQ' },
  { id: 'clinic-cta', label: 'Контакт' },
]

useSeoMeta({
  title: 'UMAI Health для клиник — удержание семей после родов',
  ogTitle: 'UMAI Health для клиник — удержание семей',
  description: 'Платформа для частных клиник педиатрии и акушерства: удержание семей после родов, панель координатора, аналитика, white-label.',
  ogDescription: 'Удержание семей после родов, панель координатора, аналитика, white-label. Без IT-отдела.',
  ogImage: 'https://umai-health.kz/og-image.png',
  ogUrl: 'https://umai-health.kz/for-clinics',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://umai-health.kz/for-clinics' },
  ],
})
</script>
