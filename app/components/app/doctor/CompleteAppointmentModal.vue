<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @click.self="close">
        <div class="sheet">
          <header class="sheet-head">
            <div>
              <h2 class="sheet-title">Завершить приём</h2>
              <p class="sheet-sub">{{ patientName }} · {{ time }}</p>
            </div>
            <button class="close-btn" @click="close" aria-label="Закрыть">
              <Icon name="lucide:x" size="18" />
            </button>
          </header>

          <form class="sheet-body" @submit.prevent="submit">
            <!-- ICD-10 primary -->
            <div class="fg">
              <label class="fl">
                Основной диагноз (МКБ-10)
                <span class="req">*</span>
              </label>
              <AppSharedIcdAutocomplete v-model="form.icd10_primary" />
              <p v-if="errors.icd10_primary" class="err">{{ errors.icd10_primary }}</p>
            </div>

            <!-- Secondary codes (optional chips) -->
            <div class="fg">
              <label class="fl">Сопутствующие диагнозы</label>
              <div class="chip-row">
                <span v-for="c in form.icd10_secondary" :key="c" class="chip">
                  {{ c }}
                  <button type="button" class="chip-x" @click="removeSecondary(c)" aria-label="Удалить">
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
              <label class="fl">Что зафиксировано в карте</label>
              <div class="check-grid">
                <label v-for="item in checklistItems" :key="item.key" class="check-row">
                  <input
                    v-model="form.completion_checklist[item.key]"
                    type="checkbox"
                  />
                  <span>{{ item.label }}</span>
                </label>
              </div>
            </div>

            <!-- End time (optional override) -->
            <div class="fg">
              <label class="fl">Фактическое время окончания</label>
              <input v-model="form.end_time" type="time" class="fi" />
            </div>

            <!-- Notes -->
            <div class="fg">
              <label class="fl">Заключение / план</label>
              <textarea
                v-model="form.post_visit_notes"
                class="fi"
                rows="3"
                placeholder="Динамика, назначения, рекомендации на следующий визит…"
              />
            </div>

            <div v-if="submitError" class="submit-err">{{ submitError }}</div>

            <footer class="sheet-foot">
              <button type="button" class="btn btn-ghost" @click="close">Отмена</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <Icon v-if="submitting" name="lucide:loader-2" size="14" class="spin" />
                Завершить приём
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
  background: rgba(74, 68, 88, 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 80;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}

.sheet {
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 20px 20px 0 0;
  max-height: 94vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -12px 40px rgba(74, 68, 88, 0.2);
}

@media (min-width: 720px) {
  .overlay { align-items: center; padding: 24px; }
  .sheet { border-radius: 20px; max-height: 88vh; }
}

.sheet-head {
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.sheet-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-primary);
}
.sheet-sub {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 3px 0 0;
}
.close-btn {
  background: none;
  border: none;
  padding: 6px;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
}
.close-btn:hover { color: var(--color-danger); background: rgba(200, 90, 106, 0.06); }

.sheet-body {
  overflow-y: auto;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fg { display: flex; flex-direction: column; gap: 6px; }
.fl {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  gap: 4px;
}
.req { color: var(--color-danger); }
.fi {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  font-size: 0.85rem;
  font-family: var(--font-body);
  outline: none;
  background: white;
  transition: border-color 0.2s;
}
.fi:focus { border-color: var(--color-primary); }

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 4px 3px 8px;
  border-radius: var(--radius-full);
  background: rgba(139, 126, 200, 0.1);
  color: var(--color-primary-dark);
  font-size: 0.75rem;
  font-weight: 600;
}
.chip-x {
  background: none;
  border: none;
  padding: 2px;
  color: var(--color-primary-dark);
  cursor: pointer;
  opacity: 0.7;
}
.chip-x:hover { opacity: 1; }
.add-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border: 1px dashed rgba(139, 126, 200, 0.4);
  background: none;
  border-radius: var(--radius-full);
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 500;
  font-family: var(--font-body);
}
.add-chip:disabled { opacity: 0.5; cursor: not-allowed; }

.check-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  cursor: pointer;
}
.check-row:hover { background: rgba(139, 126, 200, 0.04); }
.check-row input { cursor: pointer; accent-color: var(--color-primary); }

.sheet-foot {
  padding: 14px 22px 20px;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.btn {
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: var(--font-body);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-ghost {
  background: white;
  color: var(--color-text-secondary);
  border-color: var(--color-border-light);
}
.btn-ghost:hover { background: rgba(139, 126, 200, 0.04); }
.btn-primary {
  background: var(--color-primary);
  color: white;
}
.btn-primary:disabled { opacity: 0.6; cursor: wait; }

.err {
  font-size: 0.75rem;
  color: var(--color-danger);
  margin: 0;
}
.submit-err {
  padding: 10px 12px;
  background: rgba(200, 90, 106, 0.08);
  color: var(--color-danger);
  border-radius: 8px;
  font-size: 0.8rem;
}
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Transitions */
.modal-enter-active, .modal-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .sheet, .modal-leave-to .sheet {
  transform: translateY(24px);
}
</style>
