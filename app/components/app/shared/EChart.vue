<template>
  <div ref="chartRef" class="echart-wrapper" :style="{ height: typeof height === 'number' ? `${height}px` : height }" />
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'

const props = withDefaults(defineProps<{
  option: EChartsOption
  height?: number | string
  autoresize?: boolean
}>(), {
  height: 300,
  autoresize: true,
})

const chartRef = ref<HTMLElement>()
let chart: any = null

const themeColors = {
  color: ['#8B7EC8', '#E8A0BF', '#A8C8E8', '#F2C4A0', '#7CB8D4', '#E9C46A', '#B8ADE8', '#D4727C'],
  textStyle: {
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#7B7394',
  },
  title: {
    textStyle: { fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 700, color: '#4A4458' },
  },
}

function responsiveGrid() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1024
  if (w < 380) return { left: 28, right: 8, top: 24, bottom: 24, containLabel: true }
  if (w < 640) return { left: 32, right: 10, top: 28, bottom: 28, containLabel: true }
  return { left: 40, right: 16, top: 32, bottom: 32, containLabel: true }
}

function mergeTheme(opt: EChartsOption): EChartsOption {
  return {
    ...themeColors,
    ...opt,
    textStyle: { ...themeColors.textStyle, ...(opt.textStyle as Record<string, unknown> || {}) },
    grid: { ...responsiveGrid(), ...(opt.grid as Record<string, unknown> || {}) },
  }
}

onMounted(async () => {
  if (!chartRef.value) return
  const { init: echartsInit } = await import('echarts')
  chart = echartsInit(chartRef.value)
  chart.setOption(mergeTheme(props.option))

  if (props.autoresize) {
    window.addEventListener('resize', handleResize)
  }
})

function handleResize() {
  chart?.resize()
  chart?.setOption({ grid: responsiveGrid() })
}

watch(() => props.option, (opt) => {
  chart?.setOption(mergeTheme(opt), { notMerge: true })
}, { deep: true })

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.echart-wrapper {
  width: 100%;
  min-height: 100px;
}
</style>
