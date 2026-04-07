<template>
  <section
    :class="[
      'landing-section',
      alternate ? 'bg-alt' : '',
    ]"
    :style="bgStyle"
    v-bind="$attrs"
  >
    <div class="landing-container">
      <div v-if="title || subtitle" class="section-header">
        <span v-if="badge" class="section-badge" data-reveal="scale-in">{{ badge }}</span>
        <h2 v-if="title" ref="titleRef" class="section-title font-display">{{ title }}</h2>
        <p v-if="subtitle" class="section-subtitle font-heading" data-reveal="fade-up" data-reveal-delay="300">{{ subtitle }}</p>
      </div>
      <div>
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string
  subtitle?: string
  badge?: string
  alternate?: boolean
  gradient?: string
  customGradient?: string
}>()

defineOptions({ inheritAttrs: false })

const titleRef = ref<HTMLElement | null>(null)

// Split-text reveal for ALL section titles
useSplitText(titleRef, {
  type: 'words',
  from: { y: '100%', opacity: 0 },
  stagger: 0.04,
  duration: 0.7,
  ease: 'power3.out',
  scroll: true,
  scrollStart: 'top 85%',
})

const bgStyle = computed(() => {
  if (props.customGradient) return { background: props.customGradient }
  if (props.gradient) return { background: props.gradient }
  if (props.alternate) return { backgroundColor: 'var(--color-bg-alt)' }
  return {}
})
</script>

<style scoped>
.bg-alt {
  background-color: var(--color-bg-alt);
}

.section-header {
  text-align: center;
  margin-bottom: 56px;
}

.section-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.section-title {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 700;
  line-height: 1.15;
  color: var(--color-text-primary);
  margin: 0 0 16px;
}

.section-subtitle {
  font-size: clamp(16px, 2vw, 18px);
  line-height: 1.6;
  color: var(--color-text-secondary);
  max-width: 640px;
  margin: 0 auto;
}
</style>
