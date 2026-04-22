<template>
  <div class="chief-page">
    <!-- Hero -->
    <section class="hero">
      <LandingUiGradientBlob top="-10%" left="-5%" size="520px" color="var(--color-primary-light)" :opacity="0.28" animated :duration="20" />
      <LandingUiGradientBlob bottom="10%" right="-8%" size="420px" color="var(--color-accent-rose)" :opacity="0.2" animated :duration="24" />

      <div class="landing-container hero-inner">
        <div class="hero-content">
          <span class="overtitle font-heading">ДЛЯ ГЛАВНОГО ВРАЧА</span>
          <h1 class="hero-title font-display">
            Вы видите <span class="accent">каждое назначение</span> и каждое отклонение от протокола.
          </h1>
          <p class="hero-body">
            UMAI Health — не CRM и не маркетинг. Это аудит-ядро для медицинской практики:
            МКБ-10 на каждом приёме, структурированные МНН в назначениях,
            библиотека протоколов, автодетект отклонений, разбор случаев с пакетом документов.
            Защищённое пространство главного врача, отдельное от руководителя и собственника.
          </p>

          <div class="hero-kpis">
            <div class="kpi">
              <span class="kpi-val font-display">87%</span>
              <span class="kpi-lbl">приёмов с МКБ-10 в живой клинике</span>
            </div>
            <div class="kpi">
              <span class="kpi-val font-display">≤5 мин</span>
              <span class="kpi-lbl">от триггера до пакета документов на разбор</span>
            </div>
            <div class="kpi">
              <span class="kpi-val font-display">3 уровня</span>
              <span class="kpi-lbl">отклонения: мягкий / серьёзный / критический</span>
            </div>
          </div>

          <div class="hero-actions">
            <a href="#chief-cta" class="cta-primary font-heading">
              Получить протокол для оценки клиники
              <Icon name="lucide:arrow-right" size="18" />
            </a>
            <NuxtLink to="/demo" class="cta-secondary font-heading">
              <Icon name="lucide:play-circle" size="16" />
              Демо в роли главного врача
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- What chief sees -->
    <section class="block">
      <div class="landing-container">
        <div class="block-head">
          <span class="overtitle font-heading">4 РАБОЧИХ ЭКРАНА</span>
          <h2 class="block-title font-display">Что главный врач видит каждое утро</h2>
        </div>
        <div class="cards-grid">
          <div class="feat-card">
            <div class="feat-icon"><Icon name="lucide:activity" size="22" /></div>
            <h3 class="feat-title">Качество клиники</h3>
            <p>% приёмов с диагнозом, покрытие МНН, открытые алерты, кейсы в очереди. Светофорная сводка без маркетинга.</p>
          </div>
          <div class="feat-card">
            <div class="feat-icon"><Icon name="lucide:stethoscope" size="22" /></div>
            <h3 class="feat-title">Реестр врачей</h3>
            <p>Профиль качества каждого врача: нагрузка, длительность приёма, полнота ведения, частота отклонений. Drill-down — вся история.</p>
          </div>
          <div class="feat-card">
            <div class="feat-icon"><Icon name="lucide:pill" size="22" /></div>
            <h3 class="feat-title">Аудит назначений</h3>
            <p>Лента всех Rx с фильтрами по врачу, препарату, показанию. Автоалерты: полипрагмазия, без МНН, без показания, доза вне диапазона.</p>
          </div>
          <div class="feat-card">
            <div class="feat-icon"><Icon name="lucide:file-search" size="22" /></div>
            <h3 class="feat-title">Разбор случаев</h3>
            <p>Очередь кейсов (жалоба, отклонение, неблаг. исход). Одним кликом — пакет документов, решение главврача сохраняется в архив.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Protocols + MAB -->
    <section class="block muted">
      <div class="landing-container">
        <div class="split">
          <div class="split-text">
            <span class="overtitle font-heading">ПРОТОКОЛЫ И MEDICAL ADVISORY BOARD</span>
            <h2 class="block-title font-display">Ваши клинические решения — подпёрты источниками</h2>
            <p class="block-body">
              В платформу загружены протоколы МЗ РК и WHO для ключевых состояний беременности,
              послеродового периода и педиатрии. Каждый протокол содержит:
              обязательный чек-лист приёма, рекомендованные и запрещённые МНН,
              минимальная длительность визита, follow-up окно, ссылка на источник.
              Главный врач клиники может расширять или переопределять протоколы — с версионированием.
            </p>
            <ul class="check-list">
              <li>
                <Icon name="lucide:shield-check" size="14" />
                Квитанции об ознакомлении врачей — с версией протокола
              </li>
              <li>
                <Icon name="lucide:refresh-cw" size="14" />
                Обновления MAB раз в квартал, с оповещением врачей в приложении
              </li>
              <li>
                <Icon name="lucide:archive" size="14" />
                Полная история изменений протоколов — для внутренних и внешних проверок
              </li>
            </ul>
          </div>
          <div class="split-visual">
            <div class="proto-card">
              <div class="pc-top">
                <span class="pc-icd">O14</span>
                <span class="pc-chip">опубликован</span>
              </div>
              <h4 class="pc-title">Ведение преэклампсии лёгкой степени</h4>
              <div class="pc-meta">версия 2 · МЗ РК · обновлено 12.03</div>
              <div class="pc-section">
                <span class="pc-lbl">Обязательный чек-лист</span>
                <div class="pc-pills">
                  <span class="pc-pill">жалобы</span>
                  <span class="pc-pill">осмотр</span>
                  <span class="pc-pill">диагноз</span>
                  <span class="pc-pill">план</span>
                </div>
              </div>
              <div class="pc-section">
                <span class="pc-lbl">Запрещено</span>
                <div class="pc-pills">
                  <span class="pc-pill forb">НПВС</span>
                  <span class="pc-pill forb">Ингибиторы АПФ</span>
                </div>
              </div>
              <div class="pc-ack">
                <span class="ack-bar"><span class="ack-fill" style="width: 78%" /></span>
                78% врачей ознакомились с v2
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Legal risks -->
    <section class="block">
      <div class="landing-container">
        <div class="block-head">
          <span class="overtitle font-heading">МЕДИКО-ЮРИДИЧЕСКИЕ РИСКИ</span>
          <h2 class="block-title font-display">Пакет на проверку — в один клик</h2>
          <p class="block-body center">
            Когда приходит страховая, прокуратура или семья с претензией —
            главный врач открывает кейс, экспортирует замороженный пакет:
            карта приёма, анализы, назначения, коммуникация, таймлайн.
            Не нужно собирать документы по кусочкам неделю.
          </p>
        </div>
        <div class="risk-grid">
          <div class="risk-card">
            <Icon name="lucide:file-signature" size="20" />
            <h4>Информированные согласия</h4>
            <p>Автопоиск пациентов без подписанного ИДС на операции и процедуры высокого риска.</p>
          </div>
          <div class="risk-card">
            <Icon name="lucide:alert-circle" size="20" />
            <h4>Пробелы в карте</h4>
            <p>Приёмы без диагноза, заключения, плана лечения — флаги на общий экран.</p>
          </div>
          <div class="risk-card">
            <Icon name="lucide:box" size="20" />
            <h4>Снимок кейса</h4>
            <p>Пакет для комиссии клиники, страховой или прокуратуры — PDF за 10 секунд.</p>
          </div>
          <div class="risk-card">
            <Icon name="lucide:history" size="20" />
            <h4>Аудит-лог действий</h4>
            <p>Кто, что и когда изменил в карте пациента — неудаляемый журнал за 7 лет.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Separation from admin -->
    <section class="block separation">
      <div class="landing-container">
        <div class="sep-grid">
          <div class="sep-card sep-owner">
            <div class="sep-role">Собственник / Руководитель</div>
            <div class="sep-what">видит выручку, воронку, ROI</div>
            <ul>
              <li>LTV, retention, NPS</li>
              <li>Эффективность координаторов</li>
              <li>White-label и маркетинг</li>
            </ul>
          </div>
          <div class="sep-divider"><span>≠</span></div>
          <div class="sep-card sep-chief">
            <div class="sep-role">Главный врач</div>
            <div class="sep-what">видит качество медпрактики</div>
            <ul>
              <li>МКБ-10, чек-листы, длительность приёма</li>
              <li>Отклонения от протоколов и Rx-алерты</li>
              <li>Кейсы, жалобы, юр-риски</li>
            </ul>
          </div>
        </div>
        <p class="sep-note">
          Два разных кабинета с разным языком и разной RLS-областью.
          Собственник не видит сырые клинические данные; главный врач не видит финансы.
        </p>
      </div>
    </section>

    <!-- CTA -->
    <section id="chief-cta" class="cta-block">
      <div class="landing-container">
        <div class="cta-card">
          <h2 class="cta-title font-display">
            Получите протокол и чек-лист для оценки вашей клиники
          </h2>
          <p class="cta-body">
            Мы пришлём PDF с 24 индикаторами качества медицинского ведения —
            используйте его, чтобы оценить текущее состояние без нашего внедрения.
            Если увидите пробелы — поговорим о подключении.
          </p>
          <form class="cta-form" @submit.prevent="submit">
            <input v-model="form.email" type="email" required placeholder="Ваш email" class="cta-input" />
            <input v-model="form.clinic" type="text" required placeholder="Клиника" class="cta-input" />
            <button class="cta-submit font-heading" :disabled="submitting">
              <Icon v-if="submitting" name="lucide:loader-2" size="14" class="spin" />
              Получить PDF
            </button>
          </form>
          <p v-if="submitted" class="cta-success">Спасибо! Мы отправим PDF в течение дня.</p>
          <p v-if="submitError" class="cta-error">{{ submitError }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'UMAI Health для главного врача — аудит качества медицинской практики',
  ogTitle: 'UMAI Health для главного врача — аудит качества',
  description: 'Отдельный кабинет главного врача: аудит назначений, отклонения от протоколов, разбор случаев, медико-юридические риски. Не CRM — медицинская практика.',
})

const form = reactive({ email: '', clinic: '' })
const submitting = ref(false)
const submitted = ref(false)
const submitError = ref('')

async function submit() {
  submitting.value = true
  submitError.value = ''
  try {
    await $fetch('/api/contact-request', {
      method: 'POST',
      body: {
        name: form.email.split('@')[0] || 'Главный врач',
        email: form.email,
        organization: form.clinic,
        comment: 'Запрос PDF чек-листа качества (с лендинга for-chief-doctors)',
        type: 'clinic_inquiry',
      },
    })
    submitted.value = true
  }
  catch (err: any) {
    submitError.value = err?.data?.message || err?.data?.statusMessage || 'Не удалось отправить заявку. Напишите нам на info@umai-health.kz'
  }
  finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.chief-page > section { position: relative; }

/* HERO */
.hero {
  padding: 120px 0 90px;
  overflow: hidden;
  background:
    radial-gradient(1000px 500px at 50% -10%, rgba(139, 126, 200, 0.12), transparent 60%),
    linear-gradient(180deg, #fdfbff, #fff);
}
.hero-inner { max-width: 880px; }
.hero-content { text-align: center; }
.overtitle {
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  margin-bottom: 16px;
  display: inline-block;
}
.hero-title {
  font-size: clamp(2.2rem, 4.2vw, 3.4rem);
  line-height: 1.1;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 20px;
}
.accent {
  background: var(--gradient-cta);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero-body {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  max-width: 720px;
  margin: 0 auto 36px;
}
.hero-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 36px;
}
.kpi {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(139, 126, 200, 0.15);
  border-radius: 14px;
  padding: 16px 14px;
}
.kpi-val {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 4px;
}
.kpi-lbl { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4; }

.hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.cta-primary, .cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 22px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}
.cta-primary {
  background: var(--gradient-cta);
  color: white;
  box-shadow: 0 10px 26px rgba(139, 126, 200, 0.28);
}
.cta-primary:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgba(139, 126, 200, 0.36); }
.cta-secondary {
  background: white;
  color: var(--color-text-primary);
  border: 1px solid rgba(139, 126, 200, 0.22);
}
.cta-secondary:hover { border-color: var(--color-primary); color: var(--color-primary); }

/* BLOCK */
.block { padding: 90px 0; }
.block.muted { background: rgba(139, 126, 200, 0.04); }
.block-head { text-align: center; max-width: 760px; margin: 0 auto 50px; }
.block-title {
  font-size: clamp(1.8rem, 3.2vw, 2.4rem);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 10px 0 12px;
  line-height: 1.15;
}
.block-body { color: var(--color-text-secondary); font-size: 1.05rem; line-height: 1.6; }
.block-body.center { text-align: center; max-width: 660px; margin: 10px auto 0; }

/* Feature cards */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}
.feat-card {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.1);
  border-radius: 18px;
  padding: 22px;
  transition: all 0.2s;
}
.feat-card:hover {
  border-color: rgba(139, 126, 200, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(139, 126, 200, 0.08);
}
.feat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.14), rgba(232, 160, 191, 0.14));
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}
.feat-title { font-size: 1.05rem; font-weight: 700; margin: 0 0 8px; color: var(--color-text-primary); }
.feat-card p { font-size: 0.92rem; line-height: 1.55; color: var(--color-text-secondary); margin: 0; }

/* Split */
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
.check-list { list-style: none; padding: 0; margin: 20px 0 0; display: flex; flex-direction: column; gap: 10px; }
.check-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.92rem;
  color: var(--color-text-primary);
  line-height: 1.5;
}
.check-list li :deep(svg) {
  margin-top: 4px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.proto-card {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.14);
  border-radius: 18px;
  padding: 22px 24px;
  box-shadow: 0 20px 50px rgba(139, 126, 200, 0.12);
}
.pc-top { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; }
.pc-icd {
  background: rgba(139, 126, 200, 0.14);
  color: var(--color-primary-dark);
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
}
.pc-chip {
  background: rgba(45, 133, 96, 0.12);
  color: #2d8560;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pc-title { font-size: 1.05rem; font-weight: 700; margin: 0 0 4px; color: var(--color-text-primary); }
.pc-meta { font-size: 0.78rem; color: var(--color-text-muted); margin-bottom: 16px; }
.pc-section { margin-bottom: 14px; }
.pc-lbl { display: block; font-size: 0.72rem; color: var(--color-text-muted); margin-bottom: 6px; font-weight: 500; }
.pc-pills { display: flex; gap: 5px; flex-wrap: wrap; }
.pc-pill {
  padding: 3px 10px;
  background: rgba(139, 126, 200, 0.08);
  color: var(--color-primary-dark);
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
}
.pc-pill.forb { background: rgba(200, 90, 106, 0.1); color: #c85a6a; }
.pc-ack { font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 12px; }
.ack-bar {
  display: block;
  height: 6px;
  background: rgba(139, 126, 200, 0.12);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}
.ack-fill {
  display: block;
  height: 100%;
  background: var(--gradient-cta);
  border-radius: 3px;
}

/* Risk grid */
.risk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.risk-card {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.1);
  border-radius: 14px;
  padding: 20px;
}
.risk-card :deep(svg) { color: var(--color-primary); margin-bottom: 10px; }
.risk-card h4 { font-size: 0.95rem; font-weight: 700; margin: 0 0 6px; color: var(--color-text-primary); }
.risk-card p { font-size: 0.85rem; line-height: 1.55; color: var(--color-text-secondary); margin: 0; }

/* Separation */
.block.separation {
  padding: 80px 0;
  background: linear-gradient(180deg, rgba(139, 126, 200, 0.04), rgba(232, 160, 191, 0.03));
}
.sep-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 28px;
  align-items: stretch;
  max-width: 900px;
  margin: 0 auto;
}
.sep-card {
  background: white;
  border: 1px solid rgba(139, 126, 200, 0.14);
  border-radius: 18px;
  padding: 26px 28px;
}
.sep-role { font-weight: 700; font-size: 1.05rem; margin-bottom: 4px; color: var(--color-text-primary); }
.sep-what { font-size: 0.88rem; color: var(--color-text-muted); margin-bottom: 16px; }
.sep-card ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.sep-card ul li {
  font-size: 0.88rem;
  color: var(--color-text-primary);
  padding-left: 16px;
  position: relative;
}
.sep-card ul li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
}
.sep-chief { border-color: rgba(139, 126, 200, 0.3); }
.sep-chief .sep-role { color: var(--color-primary-dark); }

.sep-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}
.sep-note {
  margin-top: 24px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.88rem;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}

/* CTA */
.cta-block { padding: 80px 0 120px; }
.cta-card {
  max-width: 720px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(139, 126, 200, 0.08), rgba(232, 160, 191, 0.06));
  border: 1px solid rgba(139, 126, 200, 0.14);
  border-radius: 24px;
  padding: 42px 38px;
  text-align: center;
}
.cta-title { font-size: 1.8rem; font-weight: 700; margin: 0 0 12px; line-height: 1.2; }
.cta-body { color: var(--color-text-secondary); font-size: 1rem; line-height: 1.55; margin: 0 0 24px; }
.cta-form {
  display: grid;
  grid-template-columns: 1.2fr 1fr auto;
  gap: 10px;
}
.cta-input {
  padding: 12px 16px;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  font-size: 0.9rem;
  font-family: var(--font-body);
  background: white;
  outline: none;
  transition: border-color 0.2s;
}
.cta-input:focus { border-color: var(--color-primary); }
.cta-submit {
  padding: 12px 22px;
  background: var(--gradient-cta);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.cta-submit:disabled { opacity: 0.6; cursor: wait; }

.cta-success { margin-top: 14px; color: #2d8560; font-weight: 600; }
.cta-error { margin-top: 14px; color: var(--color-danger); }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .hero { padding: 80px 0 60px; }
  .hero-kpis { grid-template-columns: 1fr; gap: 10px; }
  .block { padding: 60px 0; }
  .split { grid-template-columns: 1fr; gap: 36px; }
  .sep-grid { grid-template-columns: 1fr; }
  .sep-divider { padding: 10px 0; }
  .cta-form { grid-template-columns: 1fr; }
  .cta-card { padding: 30px 22px; }
}
</style>
