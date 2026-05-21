<template>
  <Teleport to="body">
    <Transition name="cmdk-fade">
      <div
        v-if="isOpen"
        class="cmdk-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cmdk-input"
        @click.self="close"
      >
        <div class="cmdk-backdrop" />

        <div
          ref="panelRef"
          class="cmdk-panel"
          @keydown.down.prevent="moveSelection(1)"
          @keydown.up.prevent="moveSelection(-1)"
          @keydown.enter.prevent="executeSelected"
          @keydown.esc.prevent="close"
        >
          <!-- Search input row -->
          <div class="cmdk-input-row">
            <Icon name="lucide:search" size="18" class="cmdk-search-icon" />
            <input
              id="cmdk-input"
              ref="inputRef"
              v-model="query"
              class="cmdk-input"
              type="text"
              :placeholder="placeholder"
              autocomplete="off"
              spellcheck="false"
              aria-label="Поиск команд"
              @input="resetSelection"
            />
            <kbd class="cmdk-kbd-tip font-mono" aria-hidden="true">{{ shortcutLabel }}</kbd>
            <button
              type="button"
              class="cmdk-close"
              aria-label="Закрыть командную палитру"
              @click="close"
            >
              <Icon name="lucide:x" size="14" />
            </button>
          </div>

          <!-- Results list -->
          <div ref="listRef" class="cmdk-list" role="listbox">
            <template v-if="grouped.length">
              <div
                v-for="group in grouped"
                :key="group.id"
                class="cmdk-group"
              >
                <div class="cmdk-group-title t-eyebrow">{{ group.label }}</div>
                <button
                  v-for="(cmd, _i) in group.items"
                  :key="cmd.id"
                  :ref="(el) => registerItemRef(cmd.id, el as HTMLElement | null)"
                  type="button"
                  class="cmdk-item"
                  :class="{ 'is-selected': selectedId === cmd.id }"
                  role="option"
                  :aria-selected="selectedId === cmd.id"
                  @mouseenter="selectedId = cmd.id"
                  @click="execute(cmd)"
                >
                  <span class="cmdk-item-icon" :data-tone="cmd.tone || 'default'">
                    <Icon :name="cmd.icon" size="15" />
                  </span>
                  <span class="cmdk-item-body">
                    <span class="cmdk-item-label">
                      <span v-for="(chunk, c) in highlight(cmd.label, query)" :key="c" :class="{ 'cmdk-item-match': chunk.match }">{{ chunk.text }}</span>
                    </span>
                    <span v-if="cmd.hint" class="cmdk-item-hint">{{ cmd.hint }}</span>
                  </span>
                  <span v-if="cmd.shortcut" class="cmdk-item-shortcut">
                    <kbd v-for="(k, ki) in cmd.shortcut" :key="ki" class="cmdk-shortcut-kbd font-mono">{{ k }}</kbd>
                  </span>
                  <Icon
                    v-else-if="cmd.kind === 'navigate'"
                    name="lucide:arrow-right"
                    size="13"
                    class="cmdk-item-arrow"
                  />
                </button>
              </div>
            </template>

            <!-- Empty state -->
            <div v-else class="cmdk-empty">
              <div class="cmdk-empty-icon">
                <Icon name="lucide:search-x" size="22" />
              </div>
              <span class="cmdk-empty-text">
                Ничего не найдено по «{{ query }}»
              </span>
              <span class="cmdk-empty-hint">Попробуйте «семья», «врач», «доза», «тур»</span>
            </div>
          </div>

          <!-- Footer hints -->
          <footer class="cmdk-footer">
            <div class="cmdk-footer-hints">
              <span class="cmdk-hint">
                <kbd class="cmdk-shortcut-kbd font-mono">↑</kbd>
                <kbd class="cmdk-shortcut-kbd font-mono">↓</kbd>
                навигация
              </span>
              <span class="cmdk-hint">
                <kbd class="cmdk-shortcut-kbd font-mono">↩</kbd>
                выбрать
              </span>
              <span class="cmdk-hint">
                <kbd class="cmdk-shortcut-kbd font-mono">esc</kbd>
                закрыть
              </span>
            </div>
            <span class="cmdk-footer-brand">
              <Icon name="lucide:heart-pulse" size="11" />
              UMAI Health
            </span>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface CommandItem {
  id: string
  label: string
  hint?: string
  icon: string
  shortcut?: string[]
  group: string
  /** Tone classes the icon background */
  tone?: 'primary' | 'mint' | 'rose' | 'amber' | 'ink' | 'default'
  /** Action kind — drives behavior */
  kind: 'navigate' | 'action'
  /** For navigate — route */
  to?: string
  /** For action — function */
  action?: () => void
}

const router = useRouter()
const route = useRoute()

// ─────────────────────────────────────────────
// Open / close state
// ─────────────────────────────────────────────
const isOpen = ref(false)
const query = ref('')
const selectedId = ref<string | null>(null)
const itemEls = ref<Record<string, HTMLElement | null>>({})
const inputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

function registerItemRef(id: string, el: HTMLElement | null) {
  itemEls.value[id] = el
}

// Detect macOS vs others for the keyboard hint
const isMac = ref(false)
onMounted(() => {
  if (typeof navigator !== 'undefined') {
    isMac.value = /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  }
})

const shortcutLabel = computed(() => isMac.value ? '⌘K' : 'Ctrl K')
const placeholder = computed(() => `Поиск: страница, действие, помощь…`)

// ─────────────────────────────────────────────
// Commands registry
// ─────────────────────────────────────────────
const allCommands = computed<CommandItem[]>(() => [
  // ── Navigation ──
  {
    id: 'nav-family', group: 'Навигация', kind: 'navigate', to: '/demo/family',
    label: 'Кабинет семьи', hint: 'Дашборд мамы с назначениями и здоровьем',
    icon: 'lucide:heart', tone: 'rose', shortcut: ['G', 'F'],
  },
  {
    id: 'nav-doctor', group: 'Навигация', kind: 'navigate', to: '/demo/doctor',
    label: 'Кабинет врача', hint: 'Расписание, пациенты, назначения',
    icon: 'lucide:stethoscope', tone: 'primary', shortcut: ['G', 'D'],
  },
  {
    id: 'nav-coord', group: 'Навигация', kind: 'navigate', to: '/demo/coordinator',
    label: 'Кабинет координатора', hint: 'Задачи и outreach по семьям',
    icon: 'lucide:clipboard-list', tone: 'amber', shortcut: ['G', 'C'],
  },
  {
    id: 'nav-home', group: 'Навигация', kind: 'navigate', to: '/',
    label: 'На главную', hint: 'Лендинг UMAI Health',
    icon: 'lucide:home', tone: 'default',
  },
  {
    id: 'nav-for-clinics', group: 'Навигация', kind: 'navigate', to: '/for-clinics',
    label: 'Для клиник', hint: 'Преимущества для частных клиник',
    icon: 'lucide:building-2', tone: 'default',
  },

  // ── Quick actions ──
  {
    id: 'act-tour', group: 'Действия', kind: 'action',
    label: 'Показать тур заново',
    hint: 'Welcome-overlay с обзором кабинета',
    icon: 'lucide:help-circle', tone: 'primary',
    action: () => { resetTour() },
  },
  {
    id: 'act-scroll-bento', group: 'Действия', kind: 'action',
    label: 'Перейти к ключевым показателям',
    icon: 'lucide:layout-dashboard', tone: 'primary',
    action: () => { scrollTo('.bento-grid') },
  },
  {
    id: 'act-scroll-timeline', group: 'Действия', kind: 'action',
    label: 'Расписание дня',
    hint: 'Назначения на сегодня',
    icon: 'lucide:clock', tone: 'mint',
    action: () => { scrollTo('.day-timeline-section') },
  },
  {
    id: 'act-scroll-body', group: 'Действия', kind: 'action',
    label: 'Карта здоровья ребёнка',
    icon: 'lucide:baby', tone: 'rose',
    action: () => { scrollTo('.body-health-map') },
  },
  {
    id: 'act-scroll-ai', group: 'Действия', kind: 'action',
    label: 'Сводка от AI-помощника',
    icon: 'lucide:sparkles', tone: 'primary',
    action: () => { scrollTo('.ai-summary') },
  },

  // ── Help ──
  {
    id: 'help-contact', group: 'Помощь', kind: 'navigate', to: '/for-clinics#clinic-cta',
    label: 'Связаться с командой',
    hint: 'Оставить заявку на подключение',
    icon: 'lucide:mail', tone: 'default',
  },
  {
    id: 'help-security', group: 'Помощь', kind: 'navigate', to: '/security',
    label: 'Безопасность платформы',
    icon: 'lucide:shield-check', tone: 'mint',
  },
  {
    id: 'help-back', group: 'Помощь', kind: 'navigate', to: '/',
    label: 'Покинуть демо',
    hint: 'Вернуться на лендинг',
    icon: 'lucide:log-out', tone: 'ink',
  },
])

// ─────────────────────────────────────────────
// Fuzzy filter — simple "contains every query word, case-insensitive"
// + small score boost when label starts with query
// ─────────────────────────────────────────────
function matches(cmd: CommandItem, q: string): { hit: boolean; score: number } {
  if (!q.trim()) return { hit: true, score: 0 }
  const haystack = `${cmd.label} ${cmd.hint || ''} ${cmd.group}`.toLowerCase()
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  let score = 0
  for (const w of words) {
    const idx = haystack.indexOf(w)
    if (idx === -1) return { hit: false, score: 0 }
    score += idx === 0 ? 10 : idx < 8 ? 5 : 1
    if (cmd.label.toLowerCase().startsWith(w)) score += 20
  }
  return { hit: true, score }
}

// Filtered + grouped commands
const filtered = computed(() => {
  const q = query.value.trim()
  const list = allCommands.value
    .map(c => ({ cmd: c, ...matches(c, q) }))
    .filter(x => x.hit)
    .sort((a, b) => b.score - a.score)
    .map(x => x.cmd)
  return list
})

const grouped = computed(() => {
  const groups: { id: string; label: string; items: CommandItem[] }[] = []
  const order = ['Навигация', 'Действия', 'Помощь']
  for (const g of order) {
    const items = filtered.value.filter(c => c.group === g)
    if (items.length) groups.push({ id: g, label: g, items })
  }
  return groups
})

// Default selection — first item
watch(filtered, (list) => {
  if (!list.find(c => c.id === selectedId.value)) {
    selectedId.value = list[0]?.id || null
  }
}, { immediate: true })

function resetSelection() {
  selectedId.value = filtered.value[0]?.id || null
}

function moveSelection(delta: number) {
  const list = filtered.value
  if (!list.length) return
  const curIdx = list.findIndex(c => c.id === selectedId.value)
  let nextIdx = curIdx + delta
  if (nextIdx < 0) nextIdx = list.length - 1
  if (nextIdx >= list.length) nextIdx = 0
  selectedId.value = list[nextIdx]?.id || null
  nextTick(() => scrollSelectionIntoView())
}

function scrollSelectionIntoView() {
  const el = selectedId.value ? itemEls.value[selectedId.value] : null
  if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

function executeSelected() {
  const cmd = filtered.value.find(c => c.id === selectedId.value)
  if (cmd) execute(cmd)
}

function execute(cmd: CommandItem) {
  close()
  // Defer the navigation so the overlay can fade out first
  setTimeout(() => {
    if (cmd.kind === 'navigate' && cmd.to) {
      router.push(cmd.to)
    } else if (cmd.kind === 'action' && cmd.action) {
      cmd.action()
    }
  }, 90)
}

function scrollTo(selector: string) {
  const el = document.querySelector(selector) as HTMLElement | null
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Add a brief highlight pulse on the target
    el.classList.add('cmdk-target-pulse')
    setTimeout(() => el.classList.remove('cmdk-target-pulse'), 1600)
  }
}

function resetTour() {
  // Clear all welcome-seen flags so the modal appears again on next mount
  if (typeof window !== 'undefined') {
    try {
      window.localStorage?.removeItem('umai-demo-family-seen')
      window.localStorage?.removeItem('umai-demo-doctor-seen')
      window.localStorage?.removeItem('umai-demo-coordinator-seen')
    } catch { /* ignore quota / privacy mode errors */ }
    // Force re-mount of the welcome modal by emitting an event
    window.dispatchEvent(new CustomEvent('umai:reopen-welcome'))
  }
}

// ─────────────────────────────────────────────
// Open/close + keyboard hook
// ─────────────────────────────────────────────
function open() {
  isOpen.value = true
  query.value = ''
  selectedId.value = allCommands.value[0]?.id || null
  nextTick(() => inputRef.value?.focus())
}

function close() {
  isOpen.value = false
}

function toggle() {
  isOpen.value ? close() : open()
}

function onKeydown(e: KeyboardEvent) {
  // ⌘K / Ctrl+K — toggle
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    toggle()
    return
  }
  // / (slash) on any page — open palette (Vercel/Linear pattern)
  if (
    !isOpen.value
    && e.key === '/'
    && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
  ) {
    e.preventDefault()
    open()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

// Close on route change (defensive)
watch(() => route.fullPath, () => {
  if (isOpen.value) close()
})

// Expose programmatic API
defineExpose({ open, close, toggle })

// ─────────────────────────────────────────────
// Highlighter — splits label into matched/unmatched chunks
// ─────────────────────────────────────────────
function highlight(label: string, q: string): { text: string; match: boolean }[] {
  const trimmed = q.trim()
  if (!trimmed) return [{ text: label, match: false }]
  const lower = label.toLowerCase()
  const term = trimmed.toLowerCase().split(/\s+/)[0] || ''
  if (!term) return [{ text: label, match: false }]
  const idx = lower.indexOf(term)
  if (idx === -1) return [{ text: label, match: false }]
  return [
    { text: label.slice(0, idx), match: false },
    { text: label.slice(idx, idx + term.length), match: true },
    { text: label.slice(idx + term.length), match: false },
  ]
}
</script>

<style scoped>
/* ════════════════════════════════════════════════
   Phase 4.7 — Command Palette (⌘K)
   ════════════════════════════════════════════════ */

.cmdk-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: clamp(80px, 12vh, 160px);
  padding-left: 20px;
  padding-right: 20px;
}

.cmdk-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(27, 19, 48, 0.42);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
}

.cmdk-panel {
  position: relative;
  width: min(640px, 100%);
  background: linear-gradient(180deg, #FEFCFF 0%, #FAF7FD 100%);
  border-radius: 18px;
  border: 1px solid rgba(139, 126, 200, 0.16);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.8) inset,
    0 1px 2px rgba(75, 50, 130, 0.04),
    0 20px 60px -16px rgba(75, 50, 130, 0.28),
    0 40px 100px -20px rgba(75, 50, 130, 0.24);
  overflow: hidden;
  isolation: isolate;
}

/* Top gradient hairline */
.cmdk-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, #5BC0BE, #8B7EC8, #E8A0BF);
}

/* ─── Input row ─── */
.cmdk-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(139, 126, 200, 0.10);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
}

.cmdk-search-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.cmdk-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 500;
  letter-spacing: var(--tracking-snug);
  color: var(--color-text-primary);
  min-width: 0;
}

.cmdk-input::placeholder {
  color: var(--color-text-muted);
  font-weight: 400;
}

.cmdk-kbd-tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 9px;
  border-radius: 8px;
  background: rgba(139, 126, 200, 0.08);
  border: 1px solid rgba(139, 126, 200, 0.16);
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  letter-spacing: 0.04em;
  font-weight: 500;
  white-space: nowrap;
}

.cmdk-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-text-muted);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.cmdk-close:hover {
  background: rgba(139, 126, 200, 0.18);
  color: var(--color-text-primary);
  transform: rotate(90deg);
}

/* ─── List ─── */
.cmdk-list {
  max-height: min(60vh, 460px);
  overflow-y: auto;
  padding: 8px 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 126, 200, 0.30) transparent;
}

.cmdk-list::-webkit-scrollbar {
  width: 6px;
}

.cmdk-list::-webkit-scrollbar-thumb {
  background: rgba(139, 126, 200, 0.30);
  border-radius: 3px;
}

.cmdk-group {
  margin-bottom: 8px;
}

.cmdk-group-title {
  padding: 10px 12px 6px;
  color: var(--color-text-muted);
}

.cmdk-item {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  transition: background 0.15s ease, transform 0.15s ease;
}

.cmdk-item.is-selected {
  background: linear-gradient(90deg, rgba(139, 126, 200, 0.10), rgba(232, 160, 191, 0.06));
  box-shadow:
    inset 2px 0 0 var(--color-primary),
    0 1px 2px rgba(75, 50, 130, 0.04);
}

.cmdk-item:active {
  transform: scale(0.99);
}

.cmdk-item-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  transition: transform 0.2s ease;
}

.cmdk-item.is-selected .cmdk-item-icon {
  transform: scale(1.05);
}

.cmdk-item-icon[data-tone="primary"] {
  background: linear-gradient(135deg, #8B7EC8, #6E5FB3);
  box-shadow: 0 4px 10px -4px rgba(139, 126, 200, 0.5);
}
.cmdk-item-icon[data-tone="rose"] {
  background: linear-gradient(135deg, #E8A0BF, #D47EA5);
  box-shadow: 0 4px 10px -4px rgba(232, 160, 191, 0.5);
}
.cmdk-item-icon[data-tone="mint"] {
  background: linear-gradient(135deg, #5BC0BE, #3FA5A3);
  box-shadow: 0 4px 10px -4px rgba(91, 192, 190, 0.5);
}
.cmdk-item-icon[data-tone="amber"] {
  background: linear-gradient(135deg, #F2C4A0, #E0A370);
  box-shadow: 0 4px 10px -4px rgba(242, 196, 160, 0.5);
}
.cmdk-item-icon[data-tone="ink"] {
  background: linear-gradient(135deg, #2A1E47, #1B1330);
  box-shadow: 0 4px 10px -4px rgba(75, 50, 130, 0.4);
}
.cmdk-item-icon[data-tone="default"] {
  background: rgba(139, 126, 200, 0.10);
  color: var(--color-primary);
  border: 1px solid rgba(139, 126, 200, 0.16);
}

.cmdk-item.is-selected .cmdk-item-icon[data-tone="default"] {
  background: rgba(139, 126, 200, 0.18);
}

.cmdk-item-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cmdk-item-label {
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: var(--tracking-snug);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cmdk-item-match {
  color: var(--color-primary);
  background: linear-gradient(120deg, rgba(139, 126, 200, 0.20), rgba(232, 160, 191, 0.16));
  padding: 0 2px;
  border-radius: 3px;
}

.cmdk-item-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cmdk-item-shortcut {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  align-items: center;
}

.cmdk-shortcut-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 5px;
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.18);
  box-shadow: 0 1px 0 rgba(75, 50, 130, 0.04);
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  letter-spacing: 0;
}

.cmdk-item-arrow {
  color: var(--color-text-muted);
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.cmdk-item.is-selected .cmdk-item-arrow {
  opacity: 1;
  transform: translateX(2px);
  color: var(--color-primary);
}

/* ─── Empty state ─── */
.cmdk-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 36px 24px;
}

.cmdk-empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(139, 126, 200, 0.10);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cmdk-empty-text {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.cmdk-empty-hint {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

/* ─── Footer ─── */
.cmdk-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 14px;
  border-top: 1px solid rgba(139, 126, 200, 0.10);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  flex-wrap: wrap;
}

.cmdk-footer-hints {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.cmdk-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.cmdk-footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

/* ─── Transitions ─── */
.cmdk-fade-enter-active,
.cmdk-fade-leave-active {
  transition: opacity 0.25s ease;
}

.cmdk-fade-enter-active .cmdk-panel,
.cmdk-fade-leave-active .cmdk-panel {
  transition: transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.25s ease;
}

.cmdk-fade-enter-from {
  opacity: 0;
}
.cmdk-fade-leave-to {
  opacity: 0;
}

.cmdk-fade-enter-from .cmdk-panel,
.cmdk-fade-leave-to .cmdk-panel {
  opacity: 0;
  transform: translateY(-12px) scale(0.97);
}

/* ─── Mobile ─── */
@media (max-width: 600px) {
  .cmdk-overlay {
    padding-top: 60px;
    padding-left: 12px;
    padding-right: 12px;
  }
  .cmdk-input {
    font-size: 0.95rem;
  }
  .cmdk-item-hint {
    display: none;
  }
  .cmdk-item-shortcut {
    display: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .cmdk-fade-enter-active,
  .cmdk-fade-leave-active,
  .cmdk-fade-enter-active .cmdk-panel,
  .cmdk-fade-leave-active .cmdk-panel {
    transition: none;
  }
}
</style>

<!-- Phase 4.7: Global pulse highlight when scrollTo targets a section -->
<style>
.cmdk-target-pulse {
  animation: cmdk-target-bloom 1.6s cubic-bezier(0.22, 0.61, 0.36, 1);
  border-radius: inherit;
}

@keyframes cmdk-target-bloom {
  0%   { box-shadow: 0 0 0 0 rgba(139, 126, 200, 0.0); }
  10%  { box-shadow: 0 0 0 4px rgba(139, 126, 200, 0.30); }
  100% { box-shadow: 0 0 0 0 rgba(139, 126, 200, 0); }
}
</style>
