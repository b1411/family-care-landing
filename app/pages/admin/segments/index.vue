<template>
  <div class="page">
    <div class="page-hero">
      <NuxtLink to="/admin" class="back-link"><Icon name="lucide:chevron-left" size="16" /> Админ</NuxtLink>
      <div class="hero-top">
        <div>
          <h1 class="page-title"><Icon name="lucide:users" size="22" /> Сегменты</h1>
          <p class="page-desc">Группировка семей по критериям для точечных коммуникаций</p>
        </div>
        <button class="btn-action" @click="showCreate = true"><Icon name="lucide:plus" size="14" /> Создать сегмент</button>
      </div>
    </div>

    <div v-if="loading" class="card"><div class="empty-mini">Загрузка...</div></div>
    <div v-else-if="!segments.length" class="card"><div class="empty-mini">Сегментов пока нет. Создайте первый!</div></div>

    <div v-for="s in segments" :key="s.id" class="card seg-card">
      <div class="seg-header">
        <h3 class="seg-name">{{ s.name }}</h3>
        <span class="seg-count">{{ s.family_count || 0 }} семей</span>
      </div>
      <p v-if="s.description" class="seg-desc">{{ s.description }}</p>
      <div class="seg-rules">
        <span class="seg-op">{{ s.criteria_json?.operator || 'AND' }}</span>
        <span v-for="(cond, i) in (s.criteria_json?.conditions || [])" :key="i" class="rule-chip">
          {{ fieldLabel(cond.field) }} {{ opLabel(cond.op) }} {{ cond.value }}
        </span>
      </div>
      <div class="seg-footer">
        <span class="seg-date">{{ fmtDate(s.created_at) }}</span>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="modal-card modal-lg">
          <h2 class="modal-title">Новый сегмент</h2>
          <div class="fg"><label class="fl">Название</label><input v-model="form.name" class="fi" placeholder="Например: Беременные 3 триместр" /></div>
          <div class="fg"><label class="fl">Описание</label><textarea v-model="form.description" class="fi" rows="2" placeholder="Опционально..." /></div>

          <div class="conditions-section">
            <div class="cond-op-row">
              <label class="fl">Оператор</label>
              <select v-model="form.operator" class="fi fi-sm">
                <option value="AND">ВСЕ условия (AND)</option>
                <option value="OR">ЛЮБОЕ условие (OR)</option>
              </select>
            </div>

            <div v-for="(cond, i) in form.conditions" :key="i" class="cond-row">
              <select v-model="cond.field" class="fi fi-sm">
                <option value="stage">Стадия</option>
                <option value="week">Неделя беременности</option>
                <option value="child_age_months">Возраст ребёнка (мес)</option>
                <option value="adherence">Приверженность %</option>
                <option value="overdue_events">Просроченные события</option>
                <option value="days_inactive">Дней неактивна</option>
              </select>
              <select v-model="cond.op" class="fi fi-sm">
                <option value="eq">=</option>
                <option value="gt">&gt;</option>
                <option value="lt">&lt;</option>
                <option value="gte">≥</option>
                <option value="lte">≤</option>
              </select>
              <input v-model="cond.value" class="fi fi-sm" placeholder="Значение" />
              <button class="btn-icon-danger" @click="form.conditions.splice(i, 1)"><Icon name="lucide:x" size="14" /></button>
            </div>
            <button class="btn-sm" @click="form.conditions.push({ field: 'stage', op: 'eq', value: '' })">
              <Icon name="lucide:plus" size="12" /> Добавить условие
            </button>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="showCreate = false">Отмена</button>
            <button class="btn-submit" :disabled="!form.name || !form.conditions.length || saving" @click="save">
              {{ saving ? 'Сохранение...' : 'Создать' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const loading = ref(true)
const saving = ref(false)
const showCreate = ref(false)
const segments = ref<any[]>([])

const form = reactive({
  name: '',
  description: '',
  operator: 'AND' as 'AND' | 'OR',
  conditions: [{ field: 'stage', op: 'eq', value: '' }] as Array<{ field: string; op: string; value: string }>,
})

function fmtDate(d: string) { return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) }

function fieldLabel(f: string) {
  const m: Record<string, string> = { stage: 'Стадия', week: 'Неделя', child_age_months: 'Возраст (мес)', adherence: 'Приверженность', overdue_events: 'Просрочки', days_inactive: 'Дней неактивна' }
  return m[f] || f
}
function opLabel(op: string) {
  const m: Record<string, string> = { eq: '=', gt: '>', lt: '<', gte: '≥', lte: '≤' }
  return m[op] || op
}

async function save() {
  saving.value = true
  try {
    const data = await $fetch('/api/admin/segments', {
      method: 'POST',
      body: {
        name: form.name,
        description: form.description || undefined,
        criteria_json: {
          operator: form.operator,
          conditions: form.conditions.filter(c => c.value),
        },
      },
    })
    segments.value.unshift(data)
    showCreate.value = false
    form.name = ''
    form.description = ''
    form.conditions = [{ field: 'stage', op: 'eq', value: '' }]
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    segments.value = await $fetch<any[]>('/api/admin/segments')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }

.page-hero {
  background: linear-gradient(135deg, rgba(139,126,200,0.08), rgba(232,160,191,0.06));
  border: 1px solid rgba(139,126,200,0.12); border-radius: 16px; padding: 24px 28px;
}
.back-link { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--color-text-muted); text-decoration: none; margin-bottom: 10px; }
.hero-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.page-title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.page-desc { font-size: 0.82rem; color: var(--color-text-muted); margin-top: 4px; }

.card { background: white; border: 1px solid var(--color-border-light); border-radius: 14px; padding: 18px; }
.empty-mini { text-align: center; padding: 24px; font-size: 0.82rem; color: var(--color-text-muted); }

.seg-card { transition: box-shadow 0.15s; }
.seg-card:hover { box-shadow: 0 2px 12px rgba(139,126,200,0.08); }
.seg-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.seg-name { font-weight: 700; font-size: 0.95rem; }
.seg-count { font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 10px; background: rgba(139,126,200,0.08); color: var(--color-primary); }
.seg-desc { font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 8px; }
.seg-rules { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; }
.seg-op { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: var(--color-primary); color: white; }
.rule-chip { font-size: 0.72rem; padding: 3px 10px; border-radius: 8px; background: rgba(168,200,232,0.12); color: #6B9AC4; font-weight: 500; }
.seg-footer { display: flex; justify-content: flex-end; }
.seg-date { font-size: 0.68rem; color: var(--color-text-muted); }

.btn-action { display: flex; align-items: center; gap: 6px; padding: 9px 18px; background: var(--gradient-cta); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 0.82rem; cursor: pointer; font-family: var(--font-body); white-space: nowrap; }
.btn-sm { display: flex; align-items: center; gap: 4px; padding: 5px 12px; border: 1px solid var(--color-border-light); border-radius: 8px; background: white; font-size: 0.72rem; font-weight: 600; cursor: pointer; font-family: var(--font-body); color: var(--color-primary); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: white; border-radius: 16px; padding: 24px; width: 100%; max-width: 460px; display: flex; flex-direction: column; gap: 14px; }
.modal-lg { max-width: 560px; }
.modal-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fl { font-size: 0.78rem; font-weight: 600; color: var(--color-text-muted); }
.fi { padding: 9px 12px; border: 1px solid var(--color-border-light); border-radius: 10px; font-size: 0.88rem; font-family: var(--font-body); outline: none; background: white; resize: vertical; }
.fi:focus { border-color: var(--color-primary); }
.fi-sm { padding: 7px 10px; font-size: 0.82rem; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border-light); border-radius: 10px; cursor: pointer; font-family: var(--font-body); }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* Conditions */
.conditions-section { display: flex; flex-direction: column; gap: 10px; padding: 12px; background: rgba(139,126,200,0.03); border: 1px solid rgba(139,126,200,0.08); border-radius: 10px; }
.cond-op-row { display: flex; align-items: center; gap: 8px; }
.cond-row { display: flex; gap: 6px; align-items: center; }
.cond-row .fi-sm { flex: 1; }
.btn-icon-danger { width: 28px; height: 28px; border-radius: 6px; border: none; background: rgba(212,114,124,0.08); color: var(--color-danger); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
</style>
