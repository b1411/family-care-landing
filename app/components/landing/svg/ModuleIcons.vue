<template>
  <div ref="containerRef" class="module-icons-grid" data-stagger="fade-up">
    <div
      v-for="(mod, key) in modules"
      :key="key"
      class="module-icon-card stagger-item"
      @mouseenter="onHover(key, $event)"
      @mouseleave="onLeave(key, $event)"
    >
      <div class="module-icon-wrap">
        <svg
          :ref="el => setIconRef(key, el as SVGElement)"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          stroke="var(--color-primary)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path :d="mod.path" />
        </svg>
      </div>
      <h4 class="module-icon-title">{{ mod.label }}</h4>
      <p class="module-icon-desc">{{ mod.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGsap } from '~/composables/useGsap'
import { moduleIcons, type ModuleKey } from '~/data/svg-paths/module-icons'

const containerRef = ref<HTMLElement | null>(null)
const iconRefs = new Map<string, SVGElement>()
const tweens = new Map<string, gsap.core.Tween>()

const modules = moduleIcons

function setIconRef(key: string, el: SVGElement | null) {
  if (el) iconRefs.set(key, el)
}

function onHover(key: ModuleKey, _e: MouseEvent) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (window.matchMedia('(hover: none)').matches) return

  const el = iconRefs.get(key)
  if (!el) return
  const { gsap } = useGsap()
  const mod = moduleIcons[key] as Record<string, unknown>
  const path = el.querySelector('path')
  if (!path) return

  // Kill existing tween
  tweens.get(key)?.kill()

  if (mod.customHover === 'bar-grow') {
    tweens.set(key, gsap.fromTo(el, { scaleY: 0.3, transformOrigin: 'bottom center' }, { scaleY: 1, duration: 0.5, ease: 'power2.out' }))
  } else if (mod.customHover === 'pill-bounce') {
    const tl = gsap.timeline()
    tl.to(el, { y: -6, duration: 0.15, ease: 'power2.out' })
      .to(el, { y: 0, duration: 0.12, ease: 'bounce.out' })
      .to(el, { y: -3, duration: 0.1, ease: 'power2.out' })
      .to(el, { y: 0, duration: 0.1, ease: 'bounce.out' })
    tweens.set(key, tl as unknown as gsap.core.Tween)
  } else if (mod.customHover === 'checklist-sequential') {
    tweens.set(key, gsap.fromTo(path, { strokeDashoffset: path.getTotalLength?.() || 100 }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }))
  } else if (mod.customHover === 'folder-open') {
    tweens.set(key, gsap.to(el, { rotation: -3, y: -2, duration: 0.3, ease: 'power2.out' }))
  } else if (mod.needsStrokeDraw) {
    const len = path.getTotalLength?.() || 80
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
    tweens.set(key, gsap.to(path, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }))
  } else if (mod.hoverAnimation && Object.keys(mod.hoverAnimation).length > 0) {
    tweens.set(key, gsap.to(el, { ...mod.hoverAnimation, duration: 0.4, ease: 'power2.out' }))
  }
}

function onLeave(key: ModuleKey, _e: MouseEvent) {
  const tween = tweens.get(key)
  if (tween) {
    tween.reverse()
  }
}

onMounted(() => {
  // Icons are revealed via data-stagger on container
})
</script>

<style scoped>
.module-icons-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.module-icon-card {
  padding: 24px 16px;
  border-radius: var(--radius-lg, 16px);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  text-align: center;
  cursor: default;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.module-icon-card:hover {
  border-color: var(--color-primary-light);
  box-shadow: 0 4px 24px rgba(139, 126, 200, 0.1);
}

.module-icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.module-icon-title {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

.module-icon-desc {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 1024px) {
  .module-icons-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .module-icons-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
