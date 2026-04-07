<template>
  <div
    class="gradient-blob"
    :class="{ 'blob-animated': animated }"
    :style="{
      top,
      left,
      right,
      bottom,
      width: size,
      height: size,
      background: color,
      opacity,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
    }"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  top?: string
  left?: string
  right?: string
  bottom?: string
  size?: string
  color?: string
  opacity?: number
  animated?: boolean
  duration?: number
  delay?: number
}>(), {
  size: '400px',
  color: 'var(--color-primary-light)',
  opacity: 0.5,
  animated: true,
  duration: 20,
  delay: 0,
})
</script>

<style scoped>
.gradient-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.blob-animated {
  animation:
    blob-drift var(--_dur, 20s) ease-in-out infinite alternate,
    blob-morph var(--_dur, 20s) ease-in-out infinite;
  animation-duration: inherit;
  animation-delay: inherit;
}

@keyframes blob-drift {
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -20px) scale(1.05);
  }
  66% {
    transform: translate(-20px, 15px) scale(0.95);
  }
  100% {
    transform: translate(10px, -10px) scale(1.02);
  }
}

@keyframes blob-morph {
  0%, 100% {
    border-radius: 50% 40% 60% 50% / 50% 60% 40% 50%;
  }
  25% {
    border-radius: 40% 60% 50% 55% / 55% 45% 60% 40%;
  }
  50% {
    border-radius: 55% 45% 45% 60% / 40% 55% 50% 55%;
  }
  75% {
    border-radius: 45% 55% 55% 40% / 60% 40% 55% 45%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .blob-animated {
    animation: none;
  }
}
</style>
