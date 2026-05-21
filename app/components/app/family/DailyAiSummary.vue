<template>
  <section
    class="ai-summary"
    :class="{ 'is-streaming': isStreaming, 'is-collapsed': collapsed }"
    aria-label="AI-сводка дня"
  >
    <!-- Ambient glow blob — sits behind everything -->
    <div class="ai-blob ai-blob-1" aria-hidden="true" />
    <div class="ai-blob ai-blob-2" aria-hidden="true" />

    <!-- Header row -->
    <header class="ai-head">
      <div class="ai-head-left">
        <!-- Avatar — animated gradient orb with sparkles icon -->
        <div class="ai-avatar" :class="{ 'is-thinking': isStreaming }">
          <div class="ai-avatar-core">
            <Icon name="lucide:sparkles" size="18" />
          </div>
          <div class="ai-avatar-ring ai-avatar-ring-1" aria-hidden="true" />
          <div class="ai-avatar-ring ai-avatar-ring-2" aria-hidden="true" />
        </div>

        <div class="ai-head-titles">
          <div class="ai-head-titles-row">
            <h3 class="ai-name t-h4">UMAI Health Coach</h3>
            <span class="ai-status">
              <span class="ai-status-dot" />
              <span class="ai-status-text font-mono">{{ statusLabel }}</span>
            </span>
          </div>
          <span class="ai-tagline">{{ tagline }}</span>
        </div>
      </div>

      <div class="ai-head-actions">
        <button
          type="button"
          class="ai-action-btn"
          :aria-label="collapsed ? 'Развернуть сводку' : 'Свернуть сводку'"
          @click="toggleCollapse"
        >
          <Icon :name="collapsed ? 'lucide:chevron-down' : 'lucide:chevron-up'" size="16" />
        </button>
        <button
          type="button"
          class="ai-action-btn"
          aria-label="Перегенерировать сводку"
          :disabled="isStreaming"
          @click="regenerate"
        >
          <Icon name="lucide:refresh-cw" size="14" :class="{ 'is-spinning': isStreaming }" />
        </button>
      </div>
    </header>

    <!-- Body — streamed text -->
    <div v-show="!collapsed" class="ai-body">
      <div class="ai-paragraphs">
        <p
          v-for="(p, i) in paragraphs"
          :key="`p-${runKey}-${i}`"
          class="ai-paragraph"
          :class="{ 'is-active': activeIdx === i }"
        >
          <Icon v-if="p.icon" :name="p.icon" size="14" class="ai-paragraph-icon" />
          <span class="ai-paragraph-text">
            <span v-html="displayedText(i)" />
            <span
              v-if="activeIdx === i && isStreaming"
              class="ai-cursor"
              aria-hidden="true"
            />
          </span>
        </p>
      </div>

      <!-- Quick-action chips appear after streaming finishes -->
      <Transition name="chips-fade">
        <div v-if="!isStreaming" class="ai-actions">
          <button
            v-for="action in actions"
            :key="action.key"
            type="button"
            class="ai-chip"
            :class="`ai-chip--${action.tone}`"
          >
            <Icon :name="action.icon" size="13" />
            <span>{{ action.label }}</span>
          </button>
        </div>
      </Transition>

      <!-- Source / freshness line -->
      <div v-if="!isStreaming" class="ai-source">
        <Icon name="lucide:link-2" size="11" class="ai-source-icon" />
        <span>
          Источник:
          <span class="ai-source-list">{{ sources.join(' · ') }}</span>
          ·
          <span class="ai-source-fresh">обновлено {{ updatedLabel }}</span>
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface AiParagraph {
  icon?: string
  text: string
  /** millisecond delay BEFORE this paragraph starts streaming */
  startDelay?: number
}

interface AiAction {
  key: string
  label: string
  icon: string
  tone: 'primary' | 'mint' | 'rose' | 'ghost'
}

// ─────────────────────────────────────────────
// Content — could be props in future, hardcoded for demo
// ─────────────────────────────────────────────
const paragraphs: AiParagraph[] = [
  {
    icon: 'lucide:sun',
    text: 'Доброе утро! Сегодня <strong>стабильный тренд</strong> по адхерентности — четвёртый день подряд выше 90%. Так держать — это поможет железу усвоиться полностью.',
    startDelay: 0,
  },
  {
    icon: 'lucide:moon',
    text: 'Замечу: <strong>сон Тимура снизился на 30 минут</strong> за неделю. Возможно, идёт регресс 4-х месяцев. Попробуйте сдвинуть последнее кормление на 19:30.',
    startDelay: 350,
  },
  {
    icon: 'lucide:calendar-check',
    text: 'Через <strong>5 дней</strong> — АКДС-2. Я добавила напоминание за 24 часа и подготовила список вопросов педиатру. Можно открыть и распечатать.',
    startDelay: 350,
  },
]

const actions: AiAction[] = [
  { key: 'sleep', label: 'Открыть журнал сна', icon: 'lucide:bed', tone: 'primary' },
  { key: 'feeding', label: 'Сдвинуть кормление', icon: 'lucide:utensils', tone: 'ghost' },
  { key: 'questions', label: 'Вопросы к педиатру', icon: 'lucide:file-text', tone: 'ghost' },
]

const sources = [
  'Адхеренс назначений',
  'Журнал сна',
  'Календарь прививок',
]

// ─────────────────────────────────────────────
// Streaming state
// ─────────────────────────────────────────────
const collapsed = ref(false)
const isStreaming = ref(false)
const activeIdx = ref(-1)
const streamedChars = ref<number[]>(paragraphs.map(() => 0))
const runKey = ref(0)         // bump to force re-render on regenerate
const updatedLabel = ref('сегодня в 09:42')

const statusLabel = computed(() => isStreaming.value ? 'Думает…' : 'Готово')

const taglines = [
  'Ваш персональный AI-ассистент здоровья',
  'Подбирает рекомендации каждое утро',
  'Учится на вашем маршруте',
]
const tagline = ref(taglines[0]!)

function displayedText(idx: number): string {
  const full = paragraphs[idx]?.text || ''
  return full.slice(0, streamedChars.value[idx] || 0)
}

let timers: ReturnType<typeof setTimeout>[] = []

function clearTimers() {
  timers.forEach(t => clearTimeout(t))
  timers = []
}

function streamParagraph(idx: number, onComplete: () => void) {
  activeIdx.value = idx
  const full = paragraphs[idx]?.text || ''
  const CHAR_DELAY = 16   // base ms per char
  const PUNCT_DELAY = 90  // pause on . , ; :

  function step() {
    const cur = streamedChars.value[idx] || 0
    if (cur >= full.length) {
      onComplete()
      return
    }
    streamedChars.value[idx] = cur + 1
    const nextChar = full[cur] || ''
    const delay = '.,;:'.includes(nextChar) ? PUNCT_DELAY : CHAR_DELAY
    timers.push(setTimeout(step, delay))
  }
  step()
}

function runStream() {
  clearTimers()
  isStreaming.value = true
  streamedChars.value = paragraphs.map(() => 0)
  activeIdx.value = -1
  runKey.value++

  // Chain paragraphs with their startDelays
  let cursor = 0
  function next(i: number) {
    if (i >= paragraphs.length) {
      isStreaming.value = false
      activeIdx.value = -1
      // Update last-updated timestamp
      const d = new Date()
      updatedLabel.value = `сегодня в ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      return
    }
    const delay = paragraphs[i]?.startDelay || 0
    timers.push(setTimeout(() => {
      streamParagraph(i, () => next(i + 1))
    }, delay))
    void cursor
  }
  next(0)
}

function regenerate() {
  if (isStreaming.value) return
  // Cycle the tagline for fun
  const nextIdx = (taglines.indexOf(tagline.value) + 1) % taglines.length
  tagline.value = taglines[nextIdx]!
  runStream()
}

function toggleCollapse() {
  collapsed.value = !collapsed.value
}

// Boot the stream on mount — small delay so user sees the page first
onMounted(() => {
  // Respect reduced motion: show all text immediately, skip streaming
  const reduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    streamedChars.value = paragraphs.map(p => p.text.length)
    isStreaming.value = false
    return
  }
  timers.push(setTimeout(runStream, 1100))
})

onUnmounted(clearTimers)
</script>

<style scoped>
/* ════════════════════════════════════════════════
   Phase 4.6 — Daily AI Summary Card
   ════════════════════════════════════════════════ */

.ai-summary {
  position: relative;
  background:
    linear-gradient(160deg, #FBF6FF 0%, #FAF1F6 100%);
  border: 1px solid rgba(139, 126, 200, 0.10);
  border-radius: var(--radius-xl);
  padding: 26px 30px;
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 1px 2px rgba(75, 50, 130, 0.04),
    0 16px 40px -12px rgba(139, 126, 200, 0.18);
  isolation: isolate;
}

/* Gradient top edge — signature AI-feature accent */
.ai-summary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #5BC0BE, #8B7EC8, #E8A0BF);
  background-size: 200% 100%;
  animation: ai-gradient-drift 6s linear infinite;
}

@keyframes ai-gradient-drift {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

/* Ambient blobs */
.ai-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  z-index: -1;
}

.ai-blob-1 {
  width: 280px;
  height: 280px;
  top: -120px;
  right: -100px;
  background: radial-gradient(circle, rgba(232, 160, 191, 0.32), transparent 70%);
}

.ai-blob-2 {
  width: 240px;
  height: 240px;
  bottom: -120px;
  left: -60px;
  background: radial-gradient(circle, rgba(91, 192, 190, 0.20), transparent 70%);
}

/* ─── Header ─── */
.ai-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.ai-head-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

/* Avatar — animated gradient orb */
.ai-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.ai-avatar-core {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: linear-gradient(135deg, #8B7EC8, #E8A0BF, #5BC0BE);
  background-size: 200% 200%;
  animation: ai-avatar-drift 8s ease-in-out infinite;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.5) inset,
    0 4px 12px -4px rgba(139, 126, 200, 0.4),
    0 0 24px rgba(232, 160, 191, 0.3);
  z-index: 2;
}

@keyframes ai-avatar-drift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Pulsing rings around avatar when thinking */
.ai-avatar-ring {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  border: 1.5px solid rgba(139, 126, 200, 0.35);
  opacity: 0;
  pointer-events: none;
  z-index: 1;
}

.ai-avatar.is-thinking .ai-avatar-ring-1 {
  animation: avatar-ring 1.8s ease-out infinite;
}

.ai-avatar.is-thinking .ai-avatar-ring-2 {
  animation: avatar-ring 1.8s ease-out infinite;
  animation-delay: 0.6s;
}

@keyframes avatar-ring {
  0% { opacity: 0.7; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.6); }
}

.ai-head-titles {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-head-titles-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-name {
  margin: 0;
  color: var(--color-text-primary);
}

.ai-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: var(--radius-full);
  background: rgba(91, 192, 190, 0.10);
  border: 1px solid rgba(91, 192, 190, 0.22);
}

.ai-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5BC0BE;
  box-shadow: 0 0 6px rgba(91, 192, 190, 0.6);
}

.is-streaming .ai-status-dot {
  animation: status-blink 0.9s ease-in-out infinite;
}

@keyframes status-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

.ai-status-text {
  font-size: 0.68rem;
  color: var(--color-mint-dark, #3FA5A3);
  letter-spacing: 0.06em;
  font-weight: 500;
}

.ai-tagline {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-style: italic;
  font-family: var(--font-accent);
  letter-spacing: -0.005em;
}

/* Head action buttons */
.ai-head-actions {
  display: flex;
  gap: 4px;
}

.ai-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(139, 126, 200, 0.06);
  color: var(--color-text-secondary);
  border: 1px solid rgba(139, 126, 200, 0.10);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.ai-action-btn:hover:not(:disabled) {
  background: rgba(139, 126, 200, 0.14);
  color: var(--color-primary);
}

.ai-action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.is-spinning {
  animation: spin-360 0.9s linear infinite;
}

@keyframes spin-360 {
  to { transform: rotate(360deg); }
}

/* ─── Body ─── */
.ai-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ai-paragraphs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-paragraph {
  display: flex;
  gap: 12px;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--color-text-primary);
  margin: 0;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(139, 126, 200, 0.06);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  transition: background 0.4s ease, border-color 0.4s ease;
}

.ai-paragraph.is-active {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(139, 126, 200, 0.18);
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.12);
}

.ai-paragraph-icon {
  flex-shrink: 0;
  margin-top: 4px;
  color: var(--color-primary);
  filter: drop-shadow(0 0 4px rgba(139, 126, 200, 0.4));
}

.ai-paragraph-text {
  flex: 1;
  min-width: 0;
}

.ai-paragraph-text :deep(strong) {
  color: var(--color-primary-dark);
  font-weight: 600;
  background: linear-gradient(120deg, rgba(139, 126, 200, 0.10) 0%, rgba(232, 160, 191, 0.10) 100%);
  padding: 1px 4px;
  border-radius: 4px;
  margin: 0 -2px;
}

/* Streaming cursor (block char that blinks) */
.ai-cursor {
  display: inline-block;
  width: 6px;
  height: 14px;
  margin-left: 2px;
  background: var(--color-primary);
  vertical-align: -2px;
  animation: cursor-blink 0.9s step-end infinite;
  border-radius: 1px;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
}

/* ─── Chips ─── */
.ai-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ai-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  border: 1px solid transparent;
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-chip--primary {
  background: var(--gradient-cta);
  color: white;
  box-shadow: 0 4px 12px -4px rgba(139, 126, 200, 0.4);
}

.ai-chip--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px -4px rgba(139, 126, 200, 0.5);
}

.ai-chip--mint {
  background: rgba(91, 192, 190, 0.12);
  color: var(--color-mint-dark, #3FA5A3);
  border-color: rgba(91, 192, 190, 0.24);
}

.ai-chip--mint:hover {
  background: rgba(91, 192, 190, 0.22);
}

.ai-chip--rose {
  background: rgba(232, 160, 191, 0.14);
  color: var(--color-secondary-dark);
  border-color: rgba(232, 160, 191, 0.24);
}

.ai-chip--rose:hover {
  background: rgba(232, 160, 191, 0.22);
}

.ai-chip--ghost {
  background: rgba(255, 255, 255, 0.7);
  color: var(--color-text-primary);
  border-color: rgba(139, 126, 200, 0.18);
}

.ai-chip--ghost:hover {
  background: white;
  border-color: rgba(139, 126, 200, 0.32);
  color: var(--color-primary);
}

/* ─── Source line ─── */
.ai-source {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 14px;
  border-top: 1px solid rgba(139, 126, 200, 0.10);
  font-size: 0.74rem;
  color: var(--color-text-muted);
  font-family: var(--font-body);
  flex-wrap: wrap;
}

.ai-source-icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.ai-source-list {
  color: var(--color-text-secondary);
}

.ai-source-fresh {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}

/* ─── Transitions ─── */
.chips-fade-enter-active,
.chips-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.chips-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.chips-fade-leave-to {
  opacity: 0;
}

/* ─── Mobile ─── */
@media (max-width: 720px) {
  .ai-summary {
    padding: 20px 18px;
  }
  .ai-head {
    flex-wrap: wrap;
  }
  .ai-paragraph {
    font-size: 0.88rem;
    padding: 8px 12px;
  }
  .ai-source {
    font-size: 0.7rem;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ai-summary::before,
  .ai-avatar-core,
  .ai-avatar-ring,
  .ai-status-dot,
  .ai-cursor {
    animation: none;
  }
}
</style>
