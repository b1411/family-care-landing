<template>
  <LandingUiSectionWrapper
    badge="Документы"
    title="Все документы — в одном месте"
    subtitle="Больше никаких потерянных бумажек и фото в галерее"
    alternate
  >
    <div class="docs-layout">
      <div class="docs-demo landing-card" data-reveal="fade-up">
        <div class="docs-header">
          <Icon name="lucide:folder" class="d-icon" />
          <span>Медицинский архив</span>
          <span class="docs-count-badge">{{ totalDocs }} файлов</span>
        </div>

        <div class="docs-categories">
          <button
            v-for="(cat, i) in categories"
            :key="cat.label"
            :class="['doc-cat', { active: activeCat === i }]"
            @click="switchCategory(i)"
          >
            <Icon :name="cat.icon" />
            {{ cat.label }}
            <span class="cat-count">{{ cat.count }}</span>
          </button>
        </div>

        <Transition name="docs-fade" mode="out-in">
          <div :key="activeCat" class="docs-list">
            <div v-for="(doc, i) in currentDocs" :key="doc.name" class="doc-item" :style="{ animationDelay: `${i * 60}ms` }">
              <div class="doc-thumb" :style="{ background: doc.thumbBg }">
                <Icon :name="doc.thumbIcon" class="doc-thumb-icon" />
              </div>
              <div class="doc-meta">
                <span class="doc-name">{{ doc.name }}</span>
                <span class="doc-date">{{ doc.date }}</span>
              </div>
              <div class="doc-action">
                <Icon name="lucide:download" class="doc-dl" />
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <div class="docs-features" data-stagger="fade-up">
        <div v-for="f in features" :key="f.title" class="df-card landing-card hover-lift" data-tilt>
          <div class="df-icon-wrap" :style="{ '--df-color': f.color }">
            <Icon :name="f.icon" class="df-icon" />
          </div>
          <h4>{{ f.title }}</h4>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </div>
  </LandingUiSectionWrapper>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeCat = ref(0)

function switchCategory(i: number) {
  activeCat.value = i
}

const categories = [
  { label: 'Анализы', icon: 'lucide:test-tube-2', count: 12 },
  { label: 'УЗИ', icon: 'lucide:scan', count: 5 },
  { label: 'Выписки', icon: 'lucide:file-text', count: 3 },
  { label: 'Прививки', icon: 'lucide:syringe', count: 8 },
]

const totalDocs = computed(() => categories.reduce((s, c) => s + c.count, 0))

const allDocs = [
  [
    { name: 'ОАК — 15.03.2025', date: '15 Мар 2025', thumbBg: 'var(--color-primary-light)', thumbIcon: 'lucide:test-tube-2' },
    { name: 'Глюкоза — 12.03.2025', date: '12 Мар 2025', thumbBg: 'var(--color-secondary-light)', thumbIcon: 'lucide:test-tube-2' },
    { name: 'Биохимия — 01.03.2025', date: '01 Мар 2025', thumbBg: 'var(--color-accent-blue-light)', thumbIcon: 'lucide:test-tube-2' },
  ],
  [
    { name: 'УЗИ 2 скрининг — 28.02.2025', date: '28 Фев 2025', thumbBg: 'var(--color-primary-light)', thumbIcon: 'lucide:scan' },
    { name: 'УЗИ 1 скрининг — 20.01.2025', date: '20 Янв 2025', thumbBg: 'var(--color-secondary-light)', thumbIcon: 'lucide:scan' },
  ],
  [
    { name: 'Выписка из роддома', date: '15 Янв 2025', thumbBg: 'rgba(242,196,160,0.2)', thumbIcon: 'lucide:file-text' },
    { name: 'Обменная карта', date: '10 Янв 2025', thumbBg: 'var(--color-primary-light)', thumbIcon: 'lucide:file-text' },
  ],
  [
    { name: 'БЦЖ — серия 1234', date: '15 Янв 2025', thumbBg: 'var(--color-accent-blue-light)', thumbIcon: 'lucide:syringe' },
    { name: 'Гепатит B (1-я)', date: '15 Янв 2025', thumbBg: 'var(--color-secondary-light)', thumbIcon: 'lucide:syringe' },
  ],
]

const currentDocs = computed(() => allDocs[activeCat.value])

const features = [
  { icon: 'lucide:camera', title: 'Фото результатов', desc: 'Сфотографируйте бумажный документ — он сохранится в архиве.', color: 'var(--color-primary)' },
  { icon: 'lucide:search', title: 'Быстрый поиск', desc: 'Фильтр по дате и категории. Нужный анализ — за 2 секунды.', color: 'var(--color-accent-blue)' },
  { icon: 'lucide:share-2', title: 'Показать врачу', desc: 'На приёме откройте документ на телефоне. Ничего не забудете.', color: 'var(--color-secondary)' },
  { icon: 'lucide:link', title: 'Привязка к маршруту', desc: 'Каждый документ привязан к событию: анализ → визит → решение.', color: 'var(--color-accent-warm)' },
]
</script>

<style scoped>
.docs-layout {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 32px;
  align-items: start;
}

.docs-demo {
  padding: 0;
  overflow: hidden;
}

.docs-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border-light);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.d-icon {
  width: 18px;
  height: 18px;
  color: var(--color-primary);
}

.docs-count-badge {
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: var(--color-surface-alt, #f5f5f5);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.docs-categories {
  display: flex;
  gap: 6px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border-light);
  overflow-x: auto;
}

.doc-cat {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s ease;
}

.doc-cat:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light, rgba(139, 126, 200, 0.05));
}

.doc-cat.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.cat-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 10px;
}

.doc-cat:not(.active) .cat-count {
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
}

/* Transition */
.docs-fade-enter-active { animation: docs-in 0.3s ease; }
.docs-fade-leave-active { animation: docs-out 0.2s ease; }

@keyframes docs-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes docs-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-4px); }
}

.docs-list {
  padding: 8px 24px 16px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-light);
  animation: doc-slide-in 0.35s ease both;
}

@keyframes doc-slide-in {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

.doc-item:last-child {
  border-bottom: 0;
}

.doc-thumb {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doc-thumb-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-secondary);
}

.doc-meta {
  flex: 1;
}

.doc-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: block;
}

.doc-date {
  font-size: 11px;
  color: var(--color-text-muted);
}

.doc-action {
  opacity: 0;
  transition: opacity 0.2s;
}

.doc-item:hover .doc-action {
  opacity: 1;
}

.doc-dl {
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  cursor: pointer;
}

.docs-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.df-card {
  padding: 20px;
}

.df-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--df-color) 12%, transparent);
  color: var(--df-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.df-icon {
  width: 20px;
  height: 20px;
}

.df-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

.df-card p {
  font-size: 13px;
  line-height: 150%;
  color: var(--color-text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }
}
</style>
