<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @click.self="close">
        <div class="sheet">
          <!-- Decorative gradient border -->
          <span class="sheet-border" aria-hidden="true" />
          <!-- Ambient glow -->
          <div class="sheet-glow" aria-hidden="true" />

          <header class="sheet-head">
            <div class="head-icon">
              <Icon name="lucide:clipboard-check" size="20" />
            </div>
            <div class="head-body">
              <h2 class="sheet-title">Завершить приём</h2>
              <p class="sheet-sub">
                <span class="sub-patient">{{ patientName }}</span>
                <span class="sub-dot" aria-hidden="true">·</span>
                <span class="sub-time font-mono">{{ time }}</span>
              </p>
            </div>
            <button class="close-btn" @click="close" aria-label="Закрыть">
              <Icon name="lucide:x" size="18" />
            </button>
          </header>

          <form class="sheet-body" @submit.prevent="submit">
            <!-- ICD-10 primary -->
            <div class="fg">
              <label class="fl">
                <Icon name="lucide:file-text" size="13" class="fl-icon" />
                <span>Основной диагноз (МКБ-10)</span>
                <span class="req" aria-label="обязательно">*</span>
              </label>
              <AppSharedIcdAutocomplete v-model="form.icd10_primary" />
              <p v-if="errors.icd10_primary" class="err">
                <Icon name="lucide:alert-circle" size="12" />
                {{ errors.icd10_primary }}
              </p>
            </div>

            <!-- Secondary codes (optional chips) -->
            <div class="fg">
              <label class="fl">
                <Icon name="lucide:tags" size="13" class="fl-icon" />
                <span>Сопутствующие диагнозы</span>
              </label>
              <div class="chip-row">
                <span v-for="c in form.icd10_secondary" :key="c" class="chip">
                  {{ c }}
                  <button type="button" class="chip-x" @click="removeSecondary(c)" aria-label="Удалить код">
                    <Icon name="lucide:x" size="10" />
                  </button>
                </span>
                <AppSharedIcdAutocomplete
                  v-if="addingSecondary"
                  :model-value="null"
                  placeholder="Добавить код"
                  @update:model-value="onAddSecondary"
                />
                <button
                  v-else
                  type="button"
                  class="add-chip"
                  :disabled="(form.icd10_secondary?.length ?? 0) >= 6"
                  @click="addingSecondary = true"
                >
                  <Icon name="lucide:plus" size="12" /> код
                </button>
              </div>
            </div>

            <!-- Checklist -->
            <div class="fg">
              <label class="fl">
                <Icon name="lucide:list-checks" size="13" class="fl-icon" />
                <span>Что зафиксировано в карте</span>
              </label>
              <div class="check-grid">
                <label
                  v-for="item in checklistItems"
                  :key="item.key"
                  class="check-row"
                  :class="{ 'is-checked': form.completion_checklist[item.key] }"
                >
                  <span class="check-box">
                    <input
                      v-model="form.completion_checklist[item.key]"
                      type="checkbox"
                    />
                    <svg viewBox="0 0 14 14" class="check-icon" aria-hidden="true">
                      <polyline
                        points="3 7.5 6 10 11 4.5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{{ item.label }}</span>
                </label>
              </div>
            </div>

            <!-- End time (optional override) -->
            <div class="fg">
              <label class="fl">
                <Icon name="lucide:clock" size="13" class="fl-icon" />
                <span>Фактическое время окончания</span>
              </label>
              <input v-model="form.end_time" type="time" class="fi" />
            </div>

            <!-- Notes -->
            <div class="fg">
              <label class="fl">
                <Icon name="lucide:pen-line" size="13" class="fl-icon" />
                <span>Заключение / план</span>
              </label>
              <textarea
                v-model="form.post_visit_notes"
                class="fi"
                rows="3"
                placeholder="Динамика, назначения, рекомендации на следующий визит…"
              />
            </div>

            <div v-if="submitError" class="submit-err" role="alert">
              <Icon name="lucide:alert-triangle" size="14" />
              {{ submitError }}
            </div>

            <footer class="sheet-foot">
              <button type="button" class="btn btn-ghost" @click="close">Отмена</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <Icon v-if="submitting" name="lucide:loader-2" size="14" class="spin" />
                <Icon v-else name="lucide:check-circle-2" size="14" />
                {{ submitting ? 'Завершаем…' : 'Завершить приём' }}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  open: boolean
  appointmentId: string | null
  patientName: string
  time: string
  defaultEndTime?: string | null
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'completed', id: string): void
}>()

interface Form {
  icd10_primary: string | null
  icd10_secondary: string[]
  completion_checklist: Record<string, boolean>
  end_time: string
  post_visit_notes: string
}

const checklistItems = [
  { key: 'complaints', label: 'Жалобы' },
  { key: 'exam', label: 'Осмотр' },
  { key: 'diagnosis', label: 'Диагноз' },
  { key: 'plan', label: 'План лечения' },
  { key: 'recommendations', label: 'Рекомендации' },
] as const

const form = reactive<Form>({
  icd10_primary: null,
  icd10_secondary: [],
  completion_checklist: {},
  end_time: '',
  post_visit_notes: '',
})

const addingSecondary = ref(false)
const submitting = ref(false)
const submitError = ref('')
const errors = reactive<{ icd10_primary?: string }>({})

watch(() => props.open, (v) => {
  if (v) {
    Object.assign(form, {
      icd10_primary: null,
      icd10_secondary: [] as string[],
      completion_checklist: {},
      end_time: props.defaultEndTime ?? '',
      post_visit_notes: '',
    })
    addingSecondary.value = false
    submitError.value = ''
    Object.keys(errors).forEach(k => delete (errors as any)[k])
  }
})

function onAddSecondary(code: string | null) {
  if (code && !form.icd10_secondary.includes(code) && form.icd10_secondary.length < 6) {
    form.icd10_secondary.push(code)
  }
  addingSecondary.value = false
}
function removeSecondary(code: string) {
  form.icd10_secondary = form.icd10_secondary.filter(c => c !== code)
}

function close() {
  if (submitting.value) return
  emit('close')
}

async function submit() {
  submitError.value = ''
  if (!form.icd10_primary) {
    errors.icd10_primary = 'Выберите основной диагноз — обязательно для аудита главврача.'
    return
  }
  if (!props.appointmentId) return

  submitting.value = true
  try {
    await $fetch(`/api/appointments/${props.appointmentId}/complete`, {
      method: 'POST',
      body: {
        icd10_primary: form.icd10_primary,
        icd10_secondary: form.icd10_secondary,
        completion_checklist: form.completion_checklist,
        post_visit_notes: form.post_visit_notes.trim() || undefined,
        end_time: form.end_time || undefined,
      },
    })
    emit('completed', props.appointmentId)
  }
  catch (err: any) {
    submitError.value = err?.data?.statusMessage || err?.message || 'Не удалось завершить приём'
  }
  finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 50%, rgba(74, 68, 88, 0.35), rgba(74, 68, 88, 0.55));
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  z-index: 80;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}

/* ────── Sheet (the modal body) ────── */
.sheet {
  position: relative;
  width: 100%;
  max-width: 540px;
  background: rgba(255, 254, 255, 0.96);
  border-radius: 24px 24px 0 0;
  max-height: 94vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  isolation: isolate;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 -24px 80px -20px rgba(74, 68, 88, 0.25);
}

/* Gradient border */
.sheet-border {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.45), rgba(232, 160, 191, 0.32) 50%, transparent 80%);
  -webkit-mask:
    linear-gradient(#000, #000) content-box,
    linear-gradient(#000, #000);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000, #000) content-box,
    linear-gradient(#000, #000);
  mask-composite: exclude;
  pointer-events: none;
  z-index: 0;
}

/* Ambient glow at top of sheet */
.sheet-glow {
  position: absolute;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 380px;
  height: 240px;
  background: radial-gradient(ellipse, rgba(139, 126, 200, 0.18), transparent 65%);
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
}

@media (min-width: 720px) {
  .overlay { align-items: center; padding: 24px; }
  .sheet { border-radius: 24px; max-height: 88vh; }
}

/* ────── Header ────── */
.sheet-head {
  position: relative;
  z-index: 1;
  padding: 20px 24px 18px;
  border-bottom: 1px solid rgba(139, 126, 200, 0.08);
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4), transparent);
}

.head-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--gradient-cta);
  color: white;
  flex-shrink: 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 6px 16px -4px rgba(139, 126, 200, 0.4);
}

.head-body {
  flex: 1;
  min-width: 0;
}

.sheet-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.sheet-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin: 4px 0 0;
}

.sub-patient {
  color: var(--color-text-secondary);
  font-weight: 600;
}

.sub-dot {
  opacity: 0.5;
}

.sub-time {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.78rem;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.08);
  border: 1px solid rgba(139, 126, 200, 0.12);
}

.close-btn {
  background: rgba(139, 126, 200, 0.04);
  border: 1px solid rgba(139, 126, 200, 0.08);
  padding: 8px;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  color: var(--color-danger);
  background: rgba(200, 90, 106, 0.08);
  border-color: rgba(200, 90, 106, 0.18);
}

/* ────── Body ────── */
.sheet-body {
  position: relative;
  z-index: 1;
  overflow-y: auto;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.fg { display: flex; flex-direction: column; gap: 8px; }

.fl {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.01em;
}

.fl-icon {
  color: var(--color-primary);
  opacity: 0.7;
}

.req {
  color: var(--color-danger);
  font-weight: 700;
}

/* Inputs */
.fi {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid rgba(139, 126, 200, 0.14);
  border-radius: 12px;
  font-size: 0.88rem;
  font-family: var(--font-body);
  outline: none;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: all 0.2s ease;
  color: var(--color-text-primary);
}

.fi:hover {
  border-color: rgba(139, 126, 200, 0.28);
}

.fi:focus {
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(139, 126, 200, 0.12);
}

textarea.fi {
  resize: vertical;
  min-height: 70px;
  line-height: 1.5;
}

/* Chips */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 6px 4px 10px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.12);
  border: 1px solid rgba(139, 126, 200, 0.18);
  color: var(--color-primary-dark);
  font-size: 0.76rem;
  font-weight: 700;
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

.chip-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: rgba(139, 126, 200, 0.18);
  border: none;
  border-radius: 50%;
  color: var(--color-primary-dark);
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.chip-x:hover {
  opacity: 1;
  background: var(--color-danger);
  color: white;
}

.add-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px dashed rgba(139, 126, 200, 0.4);
  background: rgba(139, 126, 200, 0.03);
  border-radius: var(--radius-full);
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.74rem;
  font-weight: 600;
  font-family: var(--font-body);
  transition: all 0.2s ease;
}

.add-chip:hover {
  background: rgba(139, 126, 200, 0.1);
  border-color: var(--color-primary);
  border-style: solid;
}

.add-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Checklist — animated checkmarks */
.check-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 0.84rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(139, 126, 200, 0.08);
  transition: all 0.22s ease;
}

.check-row:hover {
  background: rgba(139, 126, 200, 0.05);
  border-color: rgba(139, 126, 200, 0.16);
}

.check-row.is-checked {
  background: rgba(91, 192, 190, 0.08);
  border-color: rgba(91, 192, 190, 0.3);
  color: var(--color-text-primary);
}

.check-box {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid rgba(139, 126, 200, 0.32);
  background: white;
  flex-shrink: 0;
  transition: all 0.22s ease;
}

.check-row.is-checked .check-box {
  background: var(--color-mint, #5BC0BE);
  border-color: var(--color-mint, #5BC0BE);
  box-shadow: 0 0 0 3px rgba(91, 192, 190, 0.18);
}

.check-box input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.check-icon {
  width: 14px;
  height: 14px;
  color: white;
  opacity: 0;
  transform: scale(0.6);
  transition: all 0.32s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.check-row.is-checked .check-icon {
  opacity: 1;
  transform: scale(1);
}

.check-icon polyline {
  stroke-dasharray: 14;
  stroke-dashoffset: 14;
  transition: stroke-dashoffset 0.4s cubic-bezier(0.22, 0.61, 0.36, 1) 0.05s;
}

.check-row.is-checked .check-icon polyline {
  stroke-dashoffset: 0;
}

/* Footer */
.sheet-foot {
  position: relative;
  z-index: 1;
  padding: 16px 24px 22px;
  border-top: 1px solid rgba(139, 126, 200, 0.08);
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.4), transparent);
}

.btn {
  padding: 11px 22px;
  border-radius: 12px;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: var(--font-body);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.22s ease;
  letter-spacing: -0.005em;
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-text-secondary);
  border-color: rgba(139, 126, 200, 0.14);
  backdrop-filter: blur(8px);
}

.btn-ghost:hover {
  background: rgba(139, 126, 200, 0.06);
  border-color: rgba(139, 126, 200, 0.28);
  color: var(--color-text-primary);
}

.btn-primary {
  background: var(--gradient-cta);
  color: white;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 4px 16px -2px rgba(139, 126, 200, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 8px 24px -4px rgba(139, 126, 200, 0.55);
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: wait;
}

/* Error states */
.err {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: var(--color-danger);
  margin: 0;
  font-weight: 600;
}

.submit-err {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: rgba(200, 90, 106, 0.08);
  color: var(--color-danger);
  border: 1px solid rgba(200, 90, 106, 0.2);
  border-radius: 10px;
  font-size: 0.83rem;
  font-weight: 600;
}

.spin {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-active .sheet,
.modal-leave-active .sheet {
  transition: transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.modal-enter-from .sheet,
.modal-leave-to .sheet {
  transform: translateY(40px) scale(0.98);
}

@media (max-width: 768px) {
  /* Phase 5.3: prevent iOS zoom on input focus */
  .fi { font-size: 16px; }
}

@media (max-width: 480px) {
  .check-grid {
    grid-template-columns: 1fr;
  }
  .sheet-head { padding: 16px 18px 14px; }
  .sheet-body { padding: 18px; }
  .sheet-foot { padding: 14px 18px 18px; }
  .head-icon { width: 36px; height: 36px; }
}
</style>
