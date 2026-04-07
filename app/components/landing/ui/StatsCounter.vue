<template>
  <div class="stats-counter" ref="counterEl">
    <div v-if="icon" class="counter-icon" :style="{ background: iconBg }">
      <Icon :name="icon" class="icon" />
    </div>
    <div class="counter-value font-display" ref="valueEl">
      {{ prefix }}0{{ suffix }}
    </div>
    <p v-if="label" class="counter-label">{{ label }}</p>
    <p v-if="sublabel" class="counter-sublabel">{{ sublabel }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  target: number
  prefix?: string
  suffix?: string
  label?: string
  sublabel?: string
  icon?: string
  iconBg?: string
  duration?: number
  delay?: number
}>(), {
  prefix: '',
  suffix: '',
  duration: 2,
  delay: 0,
  iconBg: 'var(--color-primary-light)',
})

const valueEl = ref<HTMLElement | null>(null)

useCountUp(valueEl, props.target, {
  duration: props.duration,
  delay: props.delay,
  prefix: props.prefix,
  suffix: props.suffix,
})
</script>

<style scoped>
.stats-counter {
  text-align: center;
  padding: 24px 16px;
}

.counter-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.counter-icon .icon {
  width: 28px;
  height: 28px;
  color: var(--color-primary);
}

.counter-value {
  font-size: 40px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 110%;
  font-variant-numeric: tabular-nums;
  margin-bottom: 8px;
}

.counter-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.counter-sublabel {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
}
</style>
