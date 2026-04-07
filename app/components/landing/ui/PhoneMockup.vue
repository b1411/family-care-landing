<template>
  <div class="phone-mockup" :class="{ 'mockup-small': small }">
    <div class="phone-frame">
      <div class="phone-notch" />
      <div class="phone-screen">
        <slot />
      </div>
      <div class="phone-home-bar" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  small?: boolean
}>()
</script>

<style scoped>
.phone-mockup {
  display: flex;
  justify-content: center;
}

.phone-frame {
  width: 280px;
  height: 560px;
  background: white;
  border-radius: 36px;
  border: 3px solid var(--color-border);
  box-shadow: var(--shadow-lg), inset 0 0 0 1px var(--color-border-light);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.phone-notch {
  width: 120px;
  height: 28px;
  background: var(--color-border-light);
  border-radius: 0 0 16px 16px;
  margin: 0 auto;
  flex-shrink: 0;
}

.phone-screen {
  flex: 1;
  overflow: hidden;
  padding: 8px;
}

.phone-home-bar {
  width: 100px;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  margin: 8px auto 12px;
  flex-shrink: 0;
}

.mockup-small .phone-frame {
  width: 220px;
  height: 440px;
  border-radius: 28px;
}

@media (max-width: 768px) {
  .phone-frame {
    width: 240px;
    height: 480px;
  }
  .mockup-small .phone-frame {
    width: 180px;
    height: 360px;
  }
}
</style>
