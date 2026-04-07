<template>
  <div class="testimonial-card landing-card" data-tilt>
    <div class="testimonial-header">
      <div class="testimonial-avatar" :style="{ background: avatarColor }">
        {{ initials }}
      </div>
      <div class="testimonial-meta">
        <h4 class="testimonial-name font-heading">{{ name }}</h4>
        <p class="testimonial-role">{{ role }}</p>
        <p v-if="clinic" class="testimonial-clinic">{{ clinic }}</p>
      </div>
    </div>
    <blockquote class="testimonial-quote">
      <Icon name="lucide:quote" class="quote-icon" />
      <p>{{ quote }}</p>
    </blockquote>
    <div v-if="rating" class="testimonial-stars">
      <Icon v-for="i in 5" :key="i" :name="i <= rating ? 'lucide:star' : 'lucide:star'" :class="['star', { filled: i <= rating }]" />
    </div>
    <div v-if="metric" class="testimonial-metric">
      <span class="metric-value font-display">{{ metric }}</span>
      <span class="metric-label">{{ metricLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  role: string
  clinic?: string
  quote: string
  rating?: number
  metric?: string
  metricLabel?: string
  avatarColor?: string
}>()

const initials = computed(() =>
  props.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
)

const avatarColor = computed(() =>
  props.avatarColor || 'var(--gradient-cta)'
)
</script>

<style scoped>
.testimonial-card {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 340px;
  max-width: 400px;
}

.testimonial-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.testimonial-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}

.testimonial-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.testimonial-role {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.testimonial-clinic {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

.testimonial-quote {
  position: relative;
  font-size: 15px;
  line-height: 160%;
  color: var(--color-text-primary);
  margin: 0;
  padding-left: 0;
  border: none;
}

.quote-icon {
  color: var(--color-primary-light);
  width: 24px;
  height: 24px;
  margin-bottom: 8px;
  display: block;
}

.testimonial-stars {
  display: flex;
  gap: 2px;
}

.star {
  width: 16px;
  height: 16px;
  color: var(--color-border);
}

.star.filled {
  color: var(--color-warning);
}

.testimonial-metric {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-light);
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-primary);
}

.metric-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
