<template>
  <section
    :class="[
      'landing-section',
      alternate ? 'bg-alt' : '',
      surface ? `surface-${surface}` : '',
    ]"
    :style="bgStyle"
    v-bind="$attrs"
  >
    <div class="landing-container">
      <div v-if="title || subtitle" class="section-header">
        <span v-if="badge" class="section-badge t-eyebrow" data-reveal="scale-in">{{ badge }}</span>
        <h2 v-if="title" ref="titleRef" class="section-title t-display-section">
          <template v-if="accent">
            <span>{{ titleBeforeAccent }}</span><span class="t-accent-serif"> {{ accent }}</span><span>{{ titleAfterAccent }}</span>
          </template>
          <template v-else>
            {{ title }}
          </template>
        </h2>
        <p v-if="subtitle" class="section-subtitle t-lead" data-reveal="fade-up" data-reveal-delay="300">{{ subtitle }}</p>
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
  accent?: string
  alternate?: boolean
  gradient?: string
  customGradient?: string
  /** Phase 2: premium background surface modifier — 'pearl' | 'pearl-alt' | 'pearl-cool' | 'ink' */
  surface?: 'pearl' | 'pearl-alt' | 'pearl-cool' | 'ink'
}>()

/* Auto-split title around the `accent` substring so callers can mark
 * an italic-serif highlight without writing markup. Falls back gracefully
 * when accent is missing or not found in the title. */
const titleBeforeAccent = computed(() => {
  if (!props.accent || !props.title) return props.title || ''
  const idx = props.title.toLowerCase().indexOf(props.accent.toLowerCase())
  if (idx === -1) return props.title
  return props.title.slice(0, idx).trimEnd()
})

const titleAfterAccent = computed(() => {
  if (!props.accent || !props.title) return ''
  const idx = props.title.toLowerCase().indexOf(props.accent.toLowerCase())
  if (idx === -1) return ''
  return props.title.slice(idx + props.accent.length)
})

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

/* Phase 2: premium surface modifiers — pearl radial gradients */
.surface-pearl { background: var(--gradient-pearl); }
.surface-pearl-alt { background: var(--gradient-pearl-alt); }
.surface-pearl-cool { background: var(--gradient-pearl-cool); }
.surface-ink {
  background: var(--gradient-ink-radial);
  color: var(--color-ink-text-primary);
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

/* .section-badge: now styled by .t-eyebrow token in landing.css
 * Local rules below add the pill background + spacing wrapper.
 * Token sets font/letter-spacing/color. */
.section-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.08);
  border: 1px solid rgba(139, 126, 200, 0.12);
  margin-bottom: 20px;
}

/* .section-title now inherits from .t-display-section.
 * Only override margin here for header rhythm. */
.section-title {
  margin: 0 0 20px;
}

/* .section-subtitle now inherits from .t-lead.
 * Override centering for hero-style centred subheaders. */
.section-subtitle {
  margin: 0 auto;
  text-align: center;
}

@media (max-width: 768px) {
  .section-header {
    margin-bottom: 44px;
  }
}
</style>
