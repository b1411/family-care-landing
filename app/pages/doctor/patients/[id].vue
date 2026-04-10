<template>
  <div class="pd-page">
    <!-- Loading -->
    <div v-if="loading" class="pd-loading">
      <Icon name="lucide:loader-2" size="24" class="spin" /> Загрузка…
    </div>

    <!-- Hero -->
    <div v-else class="pd-hero">
      <NuxtLink to="/doctor/patients" class="back-link"><Icon name="lucide:chevron-left" size="16" /> Пациенты</NuxtLink>
      <div class="hero-row">
        <div class="hero-avatar">{{ patientName.split(' ').map(w => w[0]).join('').slice(0, 2) }}</div>
        <div>
          <h1 class="hero-title">{{ patientName }}</h1>
          <p class="hero-sub">{{ patientMeta }}</p>
        </div>
      </div>
    </div>

    <!-- Children -->
    <div v-if="!loading" class="card">
      <h2 class="card-title"><Icon name="lucide:baby" size="16" /> Дети</h2>
      <div v-for="c in children" :key="c.id" class="child-card">
        <div class="child-top">
          <strong>{{ c.name }}</strong>
          <span class="child-age">{{ c.age }}</span>
        </div>
        <div class="child-meta">
          <span v-if="c.weight">Вес: {{ c.weight }} кг</span>
          <span v-if="c.height">Рост: {{ c.height }} см</span>
          <span v-if="c.blood">{{ c.blood }}</span>
        </div>
      </div>
    </div>

    <!-- Journeys + Events -->
    <div v-if="!loading" class="card">
      <h2 class="card-title"><Icon name="lucide:route" size="16" /> Маршруты</h2>
      <div v-for="j in journeys" :key="j.id" class="journey-block">
        <div class="j-head">
          <span class="j-badge" :class="j.type">{{ j.label }}</span>
          <span class="j-status" :class="j.status">{{ j.status === 'active' ? 'Активен' : 'Завершён' }}</span>
        </div>

        <!-- Tab filters -->
        <div class="ev-tabs">
          <button v-for="tab in eventTabs" :key="tab.value" class="ev-tab" :class="{ active: activeTab === tab.value }" @click="activeTab = tab.value">
            {{ tab.label }}
            <span v-if="tab.count" class="tab-cnt">{{ tab.count }}</span>
          </button>
        </div>

        <div class="ev-list">
          <div v-for="e in filteredEvents(j.id)" :key="e.id" class="ev-row" :class="e.status">
            <div class="ev-icon" :class="e.type"><Icon :name="evIcon(e.type)" size="14" /></div>
            <div class="ev-body">
              <span class="ev-name">{{ e.title }}</span>
              <span class="ev-date">{{ e.dueDate }}</span>
            </div>
            <span class="ev-badge" :class="e.status">{{ evLabel(e.status) }}</span>
            <button v-if="e.status === 'upcoming' || e.status === 'due' || e.status === 'overdue'" class="ev-check" @click="e.status = 'completed'">
              <Icon name="lucide:check" size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Prescriptions -->
    <div v-if="!loading" class="card">
      <div class="card-head-row">
        <h2 class="card-title"><Icon name="lucide:pill" size="16" /> Назначения</h2>
        <button class="btn-add" @click="showRx = true"><Icon name="lucide:plus" size="14" /> Новое</button>
      </div>
      <div v-for="rx in prescriptions" :key="rx.id" class="rx-row">
        <div class="rx-info">
          <h4>{{ rx.medication }}</h4>
          <p>{{ rx.dosage }} · {{ rx.frequency }}</p>
          <span class="rx-dates">{{ rx.startDate }} — {{ rx.endDate || 'бессрочно' }}</span>
        </div>
        <span class="rx-badge" :class="{ active: rx.active }">{{ rx.active ? 'Активно' : 'Завершено' }}</span>
      </div>
    </div>

    <!-- Vaccinations -->
    <div v-if="!loading" class="card">
      <h2 class="card-title"><Icon name="lucide:shield-check" size="16" /> Прививки</h2>
      <div v-for="v in vaccinations" :key="v.id" class="vax-row" :class="v.status">
        <span class="vax-name">{{ v.name }}</span>
        <span class="vax-dose">Доза {{ v.dose }}</span>
        <span class="vax-date">{{ v.date }}</span>
        <span class="vax-badge" :class="v.status">{{ vaxLabel(v.status) }}</span>
      </div>
    </div>

    <!-- Documents -->
    <div v-if="!loading" class="card">
      <h2 class="card-title"><Icon name="lucide:folder" size="16" /> Документы</h2>
      <div v-for="d in docs" :key="d.id" class="doc-row">
        <Icon :name="d.icon" size="14" class="doc-ic" />
        <span class="doc-name">{{ d.title }}</span>
        <span class="doc-date">{{ d.date }}</span>
      </div>
    </div>

    <!-- Prescription modal -->
    <Teleport to="body">
      <div v-if="showRx" class="modal-overlay" @click.self="showRx = false">
        <div class="modal-card">
          <h2 class="modal-title">Новое назначение</h2>
          <div class="fg"><label class="fl">Препарат</label><input v-model="rxForm.medication" class="fi" placeholder="Витамин D3" /></div>
          <div class="fg-row">
            <div class="fg"><label class="fl">Дозировка</label><input v-model="rxForm.dosage" class="fi" placeholder="1000 МЕ" /></div>
            <div class="fg"><label class="fl">Частота</label><input v-model="rxForm.frequency" class="fi" placeholder="1 раз в день" /></div>
          </div>
          <div class="fg">
            <label class="fl">Время приёма</label>
            <div class="time-grid">
              <label v-for="t in ['08:00','12:00','14:00','18:00','21:00']" :key="t" class="time-check">
                <input v-model="rxForm.times" type="checkbox" :value="t" /> {{ t }}
              </label>
            </div>
          </div>
          <div class="fg-row">
            <div class="fg"><label class="fl">Начало</label><input v-model="rxForm.startDate" type="date" class="fi" /></div>
            <div class="fg"><label class="fl">Конец</label><input v-model="rxForm.endDate" type="date" class="fi" /></div>
          </div>
          <div class="fg"><label class="fl">Примечания</label><textarea v-model="rxForm.instructions" class="fi" rows="2" placeholder="Принимать после еды" /></div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showRx = false">Отмена</button>
            <button class="btn-submit" @click="showRx = false">Назначить</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app' })

const route = useRoute()
const sb = useSupabaseClient()
const showRx = ref(false)
const rxForm = reactive({ medication: '', dosage: '', frequency: '', times: [] as string[], startDate: '', endDate: '', instructions: '' })
const activeTab = ref('all')
const loading = ref(true)
const patientName = ref('Пациент')
const patientMeta = ref('')

const children = ref<any[]>([])
const journeys = ref<any[]>([])
const allEvents = reactive<any[]>([])
const prescriptions = ref<any[]>([])
const vaccinations = ref<any[]>([])
const docs = ref<any[]>([])

const eventTabs = computed(() => {
  const ov = allEvents.filter(e => e.status === 'overdue').length
  const du = allEvents.filter(e => e.status === 'due').length
  const up = allEvents.filter(e => e.status === 'upcoming').length
  return [
    { label: 'Все', value: 'all', count: 0 },
    { label: 'Просрочено', value: 'overdue', count: ov },
    { label: 'Сегодня', value: 'due', count: du },
    { label: 'Предстоит', value: 'upcoming', count: up },
    { label: 'Выполнено', value: 'completed', count: 0 },
  ]
})

function filteredEvents(jId: string) {
  let evts = allEvents.filter(e => e.journeyId === jId)
  if (activeTab.value !== 'all') evts = evts.filter(e => e.status === activeTab.value)
  return evts
}

function evIcon(type: string) {
  return ({ consultation: 'lucide:stethoscope', screening: 'lucide:scan', analysis: 'lucide:test-tubes', ultrasound: 'lucide:monitor', vaccination: 'lucide:shield-check', checkup: 'lucide:clipboard-check' } as Record<string, string>)[type] || 'lucide:circle'
}
function evLabel(status: string) {
  return ({ upcoming: 'Предстоит', due: 'Сегодня', overdue: 'Просрочено', completed: 'Выполнено' } as Record<string, string>)[status] || status
}
function vaxLabel(status: string) {
  return ({ scheduled: 'Запланировано', completed: 'Сделано', skipped: 'Пропущено' } as Record<string, string>)[status] || status
}
function formatDate(d: string) { return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) }

onMounted(async () => {
  const familyId = route.params.id as string

  // Fetch family with parent + children
  const { data: family } = await sb
    .from('families')
    .select('id, primary_parent:users!families_primary_parent_id_fkey(first_name, last_name, phone), mother_profiles(blood_type, edd_date)')
    .eq('id', familyId)
    .single()

  if (family) {
    const parent = family.primary_parent as any
    patientName.value = `${parent?.first_name || ''} ${parent?.last_name || ''}`.trim()
    const mp = Array.isArray(family.mother_profiles) ? family.mother_profiles[0] : family.mother_profiles
    const parts = []
    if (parent?.phone) parts.push(parent.phone)
    if (mp?.blood_type) parts.push(`Группа крови: ${mp.blood_type}`)
    if (mp?.edd_date) parts.push(`ПДР: ${formatDate(mp.edd_date)}`)
    patientMeta.value = parts.join(' · ')
  }

  // Children
  const { data: childData } = await sb.from('child_profiles').select('*').eq('family_id', familyId)
  children.value = (childData || []).map(c => {
    const ageDays = c.dob ? Math.floor((Date.now() - new Date(c.dob).getTime()) / 86400000) : 0
    const ageLabel = ageDays < 30 ? `${ageDays} дн` : ageDays < 365 ? `${Math.floor(ageDays / 30)} мес` : `${Math.floor(ageDays / 365)} г ${Math.floor((ageDays % 365) / 30)} мес`
    return { id: c.id, name: c.name, age: ageLabel, weight: c.birth_weight, height: c.birth_height, blood: c.blood_type || '' }
  })

  // Journeys + events
  const { data: jData } = await sb.from('journeys').select('id, type, status').eq('family_id', familyId).in('status', ['active', 'paused'])
  const typeLabels: Record<string, string> = { pregnancy: 'Беременность', postpartum: 'Послеродовой', infant: 'Младенец', toddler: 'Тоддлер' }
  journeys.value = (jData || []).map(j => ({ id: j.id, type: j.type, label: typeLabels[j.type] || j.type, status: j.status }))

  if (jData?.length) {
    const jIds = jData.map(j => j.id)
    const { data: evData } = await sb.from('journey_events').select('id, journey_id, title, type, status, due_date').in('journey_id', jIds).order('due_date')
    for (const ev of evData || []) {
      allEvents.push({ id: ev.id, journeyId: ev.journey_id, title: ev.title, type: ev.type, status: ev.status, dueDate: ev.due_date ? formatDate(ev.due_date) : '' })
    }
  }

  // Prescriptions
  const { data: rxData } = await sb.from('prescriptions').select('id, medication, dosage, frequency, start_date, end_date, is_active').eq('family_id', familyId)
  prescriptions.value = (rxData || []).map(r => ({
    id: r.id, medication: r.medication, dosage: r.dosage, frequency: r.frequency,
    startDate: r.start_date ? formatDate(r.start_date) : '', endDate: r.end_date ? formatDate(r.end_date) : '', active: r.is_active !== false,
  }))

  // Vaccinations (for first child)
  if (childData?.length) {
    const { data: vaxData } = await sb.from('vaccinations').select('id, vaccine_name, dose_number, scheduled_date, status').eq('child_id', childData[0]!.id).order('scheduled_date')
    vaccinations.value = (vaxData || []).map(v => ({
      id: v.id, name: v.vaccine_name, dose: v.dose_number, date: v.scheduled_date ? formatDate(v.scheduled_date) : '', status: v.status,
    }))
  }

  // Documents
  const { data: docData } = await sb.from('documents').select('id, title, created_at, type').eq('family_id', familyId).order('created_at', { ascending: false }).limit(10)
  const docIcons: Record<string, string> = { analysis: 'lucide:test-tubes', ultrasound: 'lucide:monitor', screening: 'lucide:scan', prescription: 'lucide:pill', discharge: 'lucide:file-output', photo: 'lucide:image' }
  docs.value = (docData || []).map(d => ({
    id: d.id, title: d.title, date: d.created_at ? formatDate(d.created_at) : '', icon: docIcons[d.type] || 'lucide:file',
  }))

  loading.value = false
})
</script>

<style scoped>
.pd-page { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }

.pd-hero {
  background: linear-gradient(135deg, rgba(139,126,200,0.08), rgba(168,200,232,0.06));
  border: 1px solid rgba(139,126,200,0.12); border-radius: 16px; padding: 24px 28px;
}
.back-link { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--color-text-muted); text-decoration: none; margin-bottom: 10px; }
.hero-row { display: flex; align-items: center; gap: 14px; }
.hero-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--gradient-cta); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
.hero-title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; }
.hero-sub { font-size: 0.78rem; color: var(--color-text-muted); margin-top: 2px; }
.tag-row { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }
.tag { font-size: 0.7rem; font-weight: 600; padding: 3px 10px; border-radius: 8px; }
.tag-warn { background: rgba(233,196,106,0.15); color: #B8941E; }
.tag-danger { background: rgba(212,114,124,0.12); color: var(--color-danger); }

.card { background: white; border: 1px solid var(--color-border-light); border-radius: 14px; padding: 18px; }
.card-title { font-size: 0.92rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.card-head-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.card-head-row .card-title { margin-bottom: 0; }

.child-card { padding: 10px 0; border-bottom: 1px solid var(--color-border-light); }
.child-card:last-child { border: none; }
.child-top { display: flex; justify-content: space-between; align-items: center; }
.child-top strong { font-size: 0.88rem; }
.child-age { font-size: 0.75rem; color: var(--color-text-muted); }
.child-meta { display: flex; gap: 12px; margin-top: 4px; font-size: 0.72rem; color: var(--color-text-muted); }

/* Journey */
.journey-block { margin-bottom: 14px; }
.journey-block:last-child { margin-bottom: 0; }
.j-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.j-badge { font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 10px; }
.j-badge.postpartum { background: rgba(232,160,191,0.12); color: #C27BA0; }
.j-badge.infant { background: rgba(168,200,232,0.12); color: #6B9AC4; }
.j-badge.pregnancy { background: rgba(139,126,200,0.12); color: var(--color-primary); }
.j-status { font-size: 0.72rem; font-weight: 500; }
.j-status.active { color: var(--color-success); }
.j-status.completed { color: var(--color-text-muted); }

.ev-tabs { display: flex; gap: 4px; margin-bottom: 10px; overflow-x: auto; }
.ev-tab { padding: 4px 10px; border: 1px solid var(--color-border-light); border-radius: 16px; background: white; font-size: 0.72rem; cursor: pointer; font-family: var(--font-body); display: flex; align-items: center; gap: 3px; white-space: nowrap; }
.ev-tab.active { border-color: var(--color-primary); background: rgba(139,126,200,0.06); color: var(--color-primary); font-weight: 600; }
.tab-cnt { font-size: 0.65rem; background: rgba(139,126,200,0.1); color: var(--color-primary); padding: 1px 5px; border-radius: 8px; font-weight: 700; }

.ev-list { display: flex; flex-direction: column; gap: 4px; max-height: 300px; overflow-y: auto; }
.ev-row { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border: 1px solid var(--color-border-light); border-radius: 10px; font-size: 0.82rem; }
.ev-row.overdue { border-left: 3px solid var(--color-danger); background: rgba(212,114,124,0.02); }
.ev-row.due { border-left: 3px solid var(--color-primary); background: rgba(139,126,200,0.02); }
.ev-row.completed { opacity: 0.55; }
.ev-icon { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(139,126,200,0.08); color: var(--color-primary); }
.ev-icon.vaccination { background: rgba(124,184,212,0.12); color: var(--color-success); }
.ev-icon.analysis { background: rgba(233,196,106,0.12); color: #B8941E; }
.ev-body { flex: 1; display: flex; flex-direction: column; }
.ev-name { font-weight: 500; }
.ev-date { font-size: 0.72rem; color: var(--color-text-muted); }
.ev-badge { font-size: 0.68rem; font-weight: 600; padding: 2px 8px; border-radius: 6px; flex-shrink: 0; }
.ev-badge.overdue { background: rgba(212,114,124,0.1); color: var(--color-danger); }
.ev-badge.due { background: rgba(139,126,200,0.1); color: var(--color-primary); }
.ev-badge.upcoming { background: rgba(168,200,232,0.12); color: #6B9AC4; }
.ev-badge.completed { background: rgba(124,184,212,0.1); color: var(--color-success); }
.ev-check { background: none; border: 1px solid var(--color-success); color: var(--color-success); border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }

/* Prescriptions */
.rx-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--color-border-light); }
.rx-row:last-child { border: none; }
.rx-info { flex: 1; }
.rx-info h4 { font-size: 0.88rem; font-weight: 600; }
.rx-info p { font-size: 0.78rem; color: var(--color-text-muted); margin-top: 2px; }
.rx-dates { font-size: 0.72rem; color: var(--color-text-muted); }
.rx-badge { font-size: 0.68rem; font-weight: 600; padding: 3px 8px; border-radius: 6px; flex-shrink: 0; background: rgba(139,126,200,0.06); color: var(--color-text-muted); }
.rx-badge.active { background: rgba(124,184,212,0.1); color: var(--color-success); }
.btn-add { display: flex; align-items: center; gap: 4px; padding: 5px 12px; background: rgba(139,126,200,0.06); color: var(--color-primary); border: 1px solid var(--color-primary); border-radius: 10px; font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: var(--font-body); }

/* Vaccinations */
.vax-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; font-size: 0.82rem; border-bottom: 1px solid var(--color-border-light); }
.vax-row:last-child { border: none; }
.vax-name { flex: 1; font-weight: 500; }
.vax-dose { font-size: 0.72rem; color: var(--color-text-muted); min-width: 55px; }
.vax-date { font-size: 0.78rem; color: var(--color-text-muted); min-width: 75px; }
.vax-badge { font-size: 0.68rem; font-weight: 600; padding: 2px 8px; border-radius: 6px; }
.vax-badge.completed { background: rgba(124,184,212,0.1); color: var(--color-success); }
.vax-badge.scheduled { background: rgba(139,126,200,0.08); color: var(--color-primary); }
.vax-badge.skipped { background: rgba(212,114,124,0.1); color: var(--color-danger); }

/* Documents */
.doc-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 0.82rem; border-bottom: 1px solid var(--color-border-light); }
.doc-row:last-child { border: none; }
.doc-ic { color: var(--color-text-muted); flex-shrink: 0; }
.doc-name { flex: 1; font-weight: 500; }
.doc-date { font-size: 0.72rem; color: var(--color-text-muted); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: white; border-radius: 16px; padding: 24px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
.modal-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fl { font-size: 0.78rem; font-weight: 600; color: var(--color-text-muted); }
.fi { padding: 9px 12px; border: 1px solid var(--color-border-light); border-radius: 10px; font-size: 0.88rem; font-family: var(--font-body); outline: none; background: white; resize: vertical; }
.fi:focus { border-color: var(--color-primary); }
.time-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.time-check { display: flex; align-items: center; gap: 3px; font-size: 0.78rem; cursor: pointer; }
.time-check input { accent-color: var(--color-primary); }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border-light); border-radius: 10px; cursor: pointer; font-family: var(--font-body); }
.btn-submit { padding: 8px 20px; background: var(--gradient-cta); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-family: var(--font-body); }
</style>
