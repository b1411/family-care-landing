<template>
  <div ref="connectorRef" class="timeline-connector" :class="[direction, { animate: shouldAnimate }]">
    <svg
      v-if="direction === 'vertical'"
      :width="strokeWidth"
      :height="height"
      class="connector-svg"
    >
      <path
        class="svg-draw-path connector-path"
        :d="`M${strokeWidth/2} 0 L${strokeWidth/2} ${height}`"
        fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
    </svg>
    <svg
      v-else
      :width="width"
      :height="strokeWidth"
      class="connector-svg"
    >
      <path
        class="svg-draw-path connector-path"
        :d="`M0 ${strokeWidth/2} L${width} ${strokeWidth/2}`"
        fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  direction?: 'vertical' | 'horizontal'
  height?: number
  width?: number
  color?: string
  strokeWidth?: number
  shouldAnimate?: boolean
}>(), {
  direction: 'vertical',
  height: 60,
  width: 100,
  color: 'var(--color-primary-light)',
  strokeWidth: 2,
  shouldAnimate: true,
})

const connectorRef = ref<HTMLElement | null>(null)

if (props.shouldAnimate) {
  useSvgLineDraw(connectorRef, {
    selector: '.connector-path',
    duration: 0.8,
  })
}
</script>

<style scoped>
.timeline-connector {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.connector-svg {
  overflow: visible;
}
</style>
