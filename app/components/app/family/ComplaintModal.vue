<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @click.self="close">
        <div class="sheet">
          <header class="sheet-head">
            <div>
              <h2 class="sheet-title">Обратная связь</h2>
              <p v-if="appointmentLabel" class="sheet-sub">О приёме: {{ appointmentLabel }}</p>
              <p v-else class="sheet-sub">Мы передадим обращение главврачу клиники</p>
            </div>
            <button class="close-btn" @click="close" aria-label="Закрыть">
              <Icon name="lucide:x" size="18" />
            </button>
          </header>

          <form v-if="!submitted" class="sheet-body" @submit.prevent="submit">
            <div class="fg">
              <label class="fl">Что именно произошло?</label>
              <div class="chip-row">
                <label v-for="k in kindOptions" :key="k.key" class="kind-chip" :class="{ active: form.kind === k.key }">
                  <input v-model="form.kind" type="radio" :value="k.key" />
                  <Icon :name="k.icon" size="13" />
                  <span>{{ k.label }}</span>
                </label>
              </div>
            </div>

            <div class="fg">
              <label class="fl">Насколько это важно?</label>
              <div class="chip-row">
                <label v-for="s in severityOptions" :key="s.key" class="sev-chip" :class="[`sev-${s.key}`, { active: form.severity === s.key }]">
                  <input v-model="form.severity" type="radio" :value="s.key" />
                  <span>{{ s.label }}</span>
                </label>
              </div>
            </div>

            <div class="fg">
              <label class="fl">Подробнее <span class="req">*</span></label>
              <textarea
                v-model="form.body"
                rows="4"
                class="fi"
                placeholder="Опишите ситуацию. Чем больше деталей, тем точнее мы разберёмся."
                maxlength="2000"
              />
              <span class="hint">{{ form.body.length }} / 2000</span>
            </div>

            <div v-if="submitError" class="err-box">{{ submitError }}</div>

            <footer class="sheet-foot">
              <button type="button" class="btn btn-ghost" @click="close">Отмена</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting || !canSubmit">
                <Icon v-if="submitting" name="lucide:loader-2" size="14" class="spin" />
                Отправить
              </button>
            </footer>
          </form>

          <div v-else class="success-block">
            <div class="success-ic">
              <Icon name="lucide:check" size="28" />
            </div>
            <h3 class="success-title">Спасибо за обращение</h3>
            <p class="success-sub">
              Мы передали его главврачу клиники. Он разберёт ситуацию
              и свяжется с вами в течение 48 часов.
            </p>
            <button class="btn btn-primary" @click="close">Закрыть</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  open: boolean
  familyId: string
  appointmentId?: string | null
  doctorId?: string | null
  appointmentLabel?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submitted', complaint: { id: string }): void
}>()

const form = reactive({
  kind: 'medical' as 'medical' | 'service' | 'billing' | 'other',
  severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  body: '',
})
const submitting = ref(false)
const submitted = ref(false)
const submitError = ref('')

const kindOptions = [
  { key: 'medical', label: 'Медицинский вопрос', icon: 'lucide:stethoscope' },
  { key: 'service', label: 'Сервис / ожидание', icon: 'lucide:clock' },
  { key: 'billing', label: 'Оплата', icon: 'lucide:credit-card' },
  { key: 'other', label: 'Другое', icon: 'lucide:message-circle' },
] as const

const severityOptions = [
  { key: 'low', label: 'Пожелание' },
  { key: 'medium', label: 'Замечание' },
  { key: 'high', label: 'Серьёзно' },
  { key: 'critical', label: 'Критично' },
] as const

const canSubmit = computed(() => form.body.trim().length >= 10)

watch(() => props.open, (v) => {
  if (v) {
    form.kind = 'medical'
    form.severity = 'medium'
    form.body = ''
    submitError.value = ''
    submitted.value = false
  }
})

const sb = useSupabaseClient()

function close() {
  if (submitting.value) return
  emit('close')
}

async function submit() {
  if (!canSubmit.value) return
  submitError.value = ''
  submitting.value = true
  try {
    // family_id is required by RLS policy "Family can create complaints for their family"
    const { data: user } = await sb.auth.getUser()
    // SLA: 24h for critical, 48h for high, 72h otherwise
    const slaHours = form.severity === 'critical' ? 24 : form.severity === 'high' ? 48 : 72
    const sla = new Date(Date.now() + slaHours * 3600 * 1000).toISOString()

    // Resolve clinic_id from the family (needed by the insert; RLS doesn't backfill it)
    const { data: fam, error: famErr } = await sb
      .from('families')
      .select('clinic_id')
      .eq('id', props.familyId)
      .single()
    if (famErr || !fam) throw new Error('Не удалось определить клинику')

    const { data, error } = await sb
      .from('complaints')
      .insert({
        clinic_id: fam.clinic_id,
        family_id: props.familyId,
        appointment_id: props.appointmentId ?? null,
        doctor_id: props.doctorId ?? null,
        submitted_by: user.user?.id ?? null,
        kind: form.kind,
        severity: form.severity,
        body: form.body.trim(),
        status: 'new',
        sla_due_at: sla,
      })
      .select('id')
      .single()

    if (error) throw error

    submitted.value = true
    emit('submitted', { id: data.id })
  }
  catch (err: any) {
    submitError.value = err?.message || 'Не удалось отправить. Попробуйте ещё раз.'
  }
  finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0;
  background: rgba(74, 68, 88, 0.38);
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
  border-radius: 22px 22px 0 0;
  max-height: 94vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -14px 44px rgba(74, 68, 88, 0.22);
}

@media (min-width: 720px) {
  .overlay { align-items: center; padding: 24px; }
  .sheet { border-radius: 22px; max-height: 88vh; }
}

.sheet-head {
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.sheet-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
}
.sheet-sub {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin: 4px 0 0;
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
  padding: 18px 22px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fg { display: flex; flex-direction: column; gap: 8px; }
.fl { font-size: 0.82rem; font-weight: 600; color: var(--color-text-secondary); }
.req { color: var(--color-danger); }
.fi {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  font-size: 0.9rem;
  font-family: var(--font-body);
  outline: none;
  background: white;
  resize: vertical;
  min-height: 96px;
}
.fi:focus { border-color: var(--color-primary); }
.hint {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  text-align: right;
}

.chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
.kind-chip, .sev-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  background: white;
  cursor: pointer;
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  transition: all 0.2s;
}
.kind-chip input, .sev-chip input { display: none; }
.kind-chip.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.kind-chip.active :deep(svg) { color: white; }
.sev-chip.active.sev-low { background: rgba(123, 115, 148, 0.14); color: var(--color-text-primary); border-color: rgba(123, 115, 148, 0.3); }
.sev-chip.active.sev-medium { background: rgba(210, 140, 50, 0.16); color: #b27100; border-color: rgba(210, 140, 50, 0.3); }
.sev-chip.active.sev-high { background: rgba(200, 90, 106, 0.14); color: #c85a6a; border-color: rgba(200, 90, 106, 0.3); }
.sev-chip.active.sev-critical { background: rgba(200, 90, 106, 0.22); color: #a0404f; border-color: rgba(200, 90, 106, 0.4); }

.sheet-foot {
  padding: 14px 22px 22px;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.88rem;
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
.btn-primary {
  background: var(--gradient-cta);
  color: white;
}
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

.err-box {
  padding: 10px 12px;
  background: rgba(200, 90, 106, 0.08);
  color: var(--color-danger);
  border-radius: 8px;
  font-size: 0.82rem;
}

.success-block {
  padding: 36px 22px 28px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.success-ic {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(45, 133, 96, 0.12);
  color: #2d8560;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}
.success-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
}
.success-sub {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0 0 14px;
  max-width: 380px;
  line-height: 1.5;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.modal-enter-active, .modal-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .sheet, .modal-leave-to .sheet { transform: translateY(24px); }
</style>
