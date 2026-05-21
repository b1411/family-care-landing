<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="close">
      <div class="modal-card">
        <h2 class="modal-title">Создать маршрут заботы</h2>
        <p class="modal-sub">Маршрут — это автоматически сгенерированный план событий (осмотры, скрининги, прививки) с рассчитанными датами.</p>

        <div class="fg">
          <label class="fl">Тип маршрута</label>
          <select v-model="form.type" class="fi">
            <option value="pregnancy">Беременность</option>
            <option value="postpartum">Послеродовой период</option>
            <option value="infant">Младенец (0–12 мес)</option>
            <option value="toddler">Тоддлер (1–3 года)</option>
          </select>
        </div>

        <div class="fg">
          <label class="fl">{{ refDateLabel }}</label>
          <input v-model="form.refDate" type="date" class="fi" :max="todayIso" />
          <span class="fl-hint">{{ refDateHint }}</span>
        </div>

        <div v-if="error" class="error-box">{{ error }}</div>

        <div class="modal-actions">
          <button class="btn-cancel" :disabled="saving" @click="close">Отмена</button>
          <button class="btn-submit" :disabled="!canSubmit || saving" @click="submit">
            {{ saving ? 'Создаём…' : 'Создать маршрут' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { JourneyType } from '~/types/database'

const props = defineProps<{
  open: boolean
  familyId: string
}>()

const emit = defineEmits<{
  close: []
  created: [journeyId: string]
}>()

const form = reactive<{ type: JourneyType; refDate: string }>({
  type: 'pregnancy',
  refDate: '',
})
const saving = ref(false)
const error = ref<string | null>(null)

const todayIso = computed(() => new Date().toISOString().split('T')[0])

const refDateLabel = computed(() => {
  if (form.type === 'pregnancy') return 'Дата последней менструации (LMP)'
  if (form.type === 'postpartum') return 'Дата родов'
  return 'Дата рождения ребёнка'
})

const refDateHint = computed(() => {
  if (form.type === 'pregnancy') return 'События будут привязаны к неделям беременности'
  if (form.type === 'postpartum') return 'Патронажные визиты на 3, 7, 14 и 42 день'
  if (form.type === 'infant') return 'Стандартные осмотры на 1, 2, 3, 6, 9, 12 мес'
  return 'Осмотры на 18 и 24 мес'
})

const canSubmit = computed(() => Boolean(form.type && form.refDate && props.familyId))

watch(() => props.open, (v) => {
  if (v) {
    error.value = null
    saving.value = false
  }
})

async function submit() {
  if (!canSubmit.value) return
  saving.value = true
  error.value = null

  const journey = useJourney()
  const result = await journey.generateCarePlan({
    familyId: props.familyId,
    type: form.type,
    lmpDate: form.type === 'pregnancy' ? form.refDate : undefined,
    dob: form.type === 'infant' || form.type === 'toddler' ? form.refDate : undefined,
  })

  saving.value = false

  if (!result) {
    error.value = journey.error.value || 'Не удалось создать маршрут'
    return
  }

  emit('created', result.id)
  close()
}

function close() {
  if (saving.value) return
  emit('close')
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: white; border-radius: 16px; padding: 24px; width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 14px; }
.modal-title { font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; }
.modal-sub { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4; margin-top: -6px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fl { font-size: 0.78rem; font-weight: 600; color: var(--color-text-muted); }
.fl-hint { font-size: 0.7rem; color: var(--color-text-muted); margin-top: 2px; }
.fi { padding: 9px 12px; border: 1px solid var(--color-border-light); border-radius: 10px; font-size: 0.88rem; font-family: var(--font-body); outline: none; background: white; }
.fi:focus { border-color: var(--color-primary); }
.error-box { background: rgba(212,114,124,0.08); border: 1px solid rgba(212,114,124,0.2); color: var(--color-danger); border-radius: 10px; padding: 9px 12px; font-size: 0.8rem; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border-light); border-radius: 10px; cursor: pointer; font-family: var(--font-body); }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 640px) {
  .fi { font-size: 16px; }
}
</style>
