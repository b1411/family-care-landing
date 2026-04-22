<template>
  <div class="icd-auto" :class="{ 'is-open': open }">
    <div class="input-row">
      <Icon name="lucide:search" size="14" class="lead-icon" />
      <input
        ref="inputEl"
        v-model="query"
        :placeholder="placeholder || 'Код или название диагноза (МКБ-10)'"
        class="input"
        type="text"
        autocomplete="off"
        @focus="open = true"
        @blur="handleBlur"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="pick(items[activeIdx])"
        @keydown.esc="open = false"
      />
      <button
        v-if="modelValue"
        class="clear-btn"
        type="button"
        @mousedown.prevent="clear"
        aria-label="Очистить"
      >
        <Icon name="lucide:x" size="14" />
      </button>
    </div>

    <div v-if="modelValue && !open" class="chosen">
      <span class="chosen-code">{{ modelValue }}</span>
      <span v-if="chosenName" class="chosen-name">{{ chosenName }}</span>
    </div>

    <Transition name="fade">
      <div v-if="open && items.length" class="dropdown">
        <button
          v-for="(it, i) in items"
          :key="it.code"
          type="button"
          class="opt"
          :class="{ active: i === activeIdx }"
          @mousedown.prevent="pick(it)"
          @mouseenter="activeIdx = i"
        >
          <span class="opt-code">{{ it.code }}</span>
          <span class="opt-name">{{ it.name_ru }}</span>
        </button>
      </div>
    </Transition>

    <div v-if="open && !items.length && !loading && query.length >= 1" class="dropdown empty-drop">
      Ничего не найдено
    </div>
  </div>
</template>

<script setup lang="ts">
interface IcdCode { code: string; name_ru: string; category: string | null }

const props = defineProps<{
  modelValue: string | null
  placeholder?: string
  category?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'pick', code: IcdCode): void
}>()

const inputEl = ref<HTMLInputElement | null>(null)
const query = ref('')
const open = ref(false)
const items = ref<IcdCode[]>([])
const activeIdx = ref(0)
const loading = ref(false)
const chosenName = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function fetchItems() {
  loading.value = true
  try {
    const params: Record<string, string> = { limit: '20' }
    if (query.value.trim()) params.q = query.value.trim()
    if (props.category) params.category = props.category
    const res = await $fetch<{ items: IcdCode[] }>('/api/icd10', { query: params })
    items.value = res.items
    activeIdx.value = 0
  }
  catch {
    items.value = []
  }
  finally {
    loading.value = false
  }
}

watch(query, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchItems, 200)
})

watch(
  () => props.modelValue,
  async (code) => {
    if (!code) { chosenName.value = ''; return }
    // Resolve display name once if not in local items
    const found = items.value.find(i => i.code === code)
    if (found) { chosenName.value = found.name_ru; return }
    try {
      const res = await $fetch<{ items: IcdCode[] }>('/api/icd10', { query: { q: code, limit: 5 } })
      chosenName.value = res.items.find(i => i.code === code)?.name_ru ?? ''
    }
    catch { chosenName.value = '' }
  },
  { immediate: true },
)

onMounted(() => { fetchItems() })

function move(dir: number) {
  if (!items.value.length) return
  activeIdx.value = (activeIdx.value + dir + items.value.length) % items.value.length
}

function pick(it?: IcdCode) {
  if (!it) return
  emit('update:modelValue', it.code)
  emit('pick', it)
  chosenName.value = it.name_ru
  query.value = ''
  open.value = false
}

function clear() {
  emit('update:modelValue', null)
  chosenName.value = ''
  query.value = ''
  nextTick(() => inputEl.value?.focus())
}

function handleBlur() {
  // allow click on option before closing
  setTimeout(() => { open.value = false }, 150)
}
</script>

<style scoped>
.icd-auto {
  position: relative;
  width: 100%;
}
.input-row {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  background: white;
  transition: border-color 0.2s;
}
.is-open .input-row {
  border-color: var(--color-primary);
}
.lead-icon {
  margin-left: 10px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.input {
  flex: 1;
  border: none;
  outline: none;
  padding: 9px 10px;
  font-size: 0.85rem;
  font-family: var(--font-body);
  color: var(--color-text-primary);
  background: transparent;
}
.clear-btn {
  background: none;
  border: none;
  padding: 4px 10px;
  color: var(--color-text-muted);
  cursor: pointer;
}
.clear-btn:hover { color: var(--color-danger); }

.chosen {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 4px 0;
  font-size: 0.75rem;
}
.chosen-code {
  background: rgba(139, 126, 200, 0.12);
  color: var(--color-primary-dark);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}
.chosen-name { color: var(--color-text-secondary); }

.dropdown {
  position: absolute;
  z-index: 80;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.15);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(139, 126, 200, 0.12);
  max-height: 260px;
  overflow-y: auto;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.opt {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 10px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;
  font-family: var(--font-body);
  transition: background 0.15s;
}
.opt.active, .opt:hover {
  background: rgba(139, 126, 200, 0.08);
}
.opt-code {
  font-weight: 700;
  font-size: 0.78rem;
  color: var(--color-primary-dark);
  min-width: 56px;
}
.opt-name {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.empty-drop {
  padding: 14px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  max-height: none;
}

.fade-enter-active, .fade-leave-active { transition: all 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
