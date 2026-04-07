<template>
  <section id="security" class="family-security landing-section">
    <div class="landing-container">
      <div class="sec-header" data-reveal="fade-up">
        <span class="landing-badge">Безопасность</span>
        <h2 class="font-heading">Ваши данные под защитой</h2>
      </div>

      <div class="sec-layout">
        <!-- Lock SVG animation -->
        <div ref="lockRef" class="lock-wrap" data-reveal="fade-up">
          <svg width="80" height="100" viewBox="0 0 80 100" class="lock-svg">
            <!-- Body -->
            <rect x="12" y="44" width="56" height="44" rx="6" fill="none" stroke="var(--color-primary)" stroke-width="2.5" />
            <!-- Keyhole -->
            <circle cx="40" cy="62" r="5" fill="none" stroke="var(--color-primary)" stroke-width="2" />
            <line x1="40" y1="67" x2="40" y2="74" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" />
            <!-- Shackle (animated) -->
            <path
              class="shackle"
              :d="shackleClosed ? 'M24 44 L24 30 Q24 14 40 14 Q56 14 56 30 L56 44' : 'M24 44 L24 30 Q24 14 40 14 Q56 14 56 30 L56 20'"
              fill="none"
              stroke="var(--color-primary)"
              stroke-width="2.5"
              stroke-linecap="round"
            />
            <!-- Pulse ring -->
            <circle v-if="shackleClosed" class="pulse-ring" cx="40" cy="66" r="30" fill="none" stroke="var(--color-primary)" stroke-width="1" />
          </svg>
        </div>

        <!-- 3 security points -->
        <div class="sec-points" data-stagger="fade-up">
          <div v-for="pt in points" :key="pt.title" class="sec-point">
            <svg width="24" height="24" viewBox="0 0 24 24" v-html="pt.svg" />
            <div>
              <h4>{{ pt.title }}</h4>
              <p>{{ pt.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const lockRef = ref<HTMLElement | null>(null)
const shackleClosed = ref(false)

const points = [
  {
    title: 'Данные зашифрованы',
    desc: 'Никто кроме вас и врача не видит данные вашего ребёнка',
    svg: '<path d="M12 2 L3 7 L3 12 Q3 19 12 22 Q21 19 21 12 L21 7 Z" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12 L11 14 L15 10" fill="none" stroke="var(--color-success, #22C55E)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    title: 'Ролевой доступ',
    desc: 'Папа видит то, что вы разрешите',
    svg: '<circle cx="9" cy="7" r="3" fill="none" stroke="var(--color-primary)" stroke-width="1.5"/><circle cx="16" cy="7" r="3" fill="none" stroke="var(--color-primary)" stroke-width="1.5"/><path d="M3 20 Q3 14 9 14 M21 20 Q21 14 16 14" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round"/>',
  },
  {
    title: 'Полный контроль',
    desc: 'Удалите аккаунт в любой момент — все данные стираются',
    svg: '<rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="var(--color-primary)" stroke-width="1.5"/><path d="M9 9 L15 15 M15 9 L9 15" fill="none" stroke="var(--color-secondary, #E8A0BF)" stroke-width="1.5" stroke-linecap="round"/>',
  },
]

onMounted(() => {
  if (typeof window === 'undefined' || !lockRef.value) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        setTimeout(() => { shackleClosed.value = true }, 400)
        observer.disconnect()
      }
    },
    { threshold: 0.3 },
  )
  observer.observe(lockRef.value)
})
</script>

<style scoped>
.sec-header {
  text-align: center;
  margin-bottom: 48px;
}

.sec-header h2 {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 12px 0 0;
}

.sec-layout {
  display: flex;
  align-items: center;
  gap: 48px;
  max-width: var(--content-medium);
  margin: 0 auto;
}

.lock-wrap {
  flex-shrink: 0;
}

.lock-svg .shackle {
  transition: opacity 0.3s ease;
}

.pulse-ring {
  animation: pulse-expand 2s ease-out infinite;
}

@keyframes pulse-expand {
  0% { r: 25; opacity: 0.6; }
  100% { r: 40; opacity: 0; }
}

.sec-points {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sec-point {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.sec-point svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.sec-point h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 2px;
}

.sec-point p {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .sec-layout {
    flex-direction: column;
    text-align: center;
  }
  .sec-point {
    flex-direction: column;
    align-items: center;
  }
}
</style>
