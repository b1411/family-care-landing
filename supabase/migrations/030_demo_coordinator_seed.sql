-- ============================================
-- Migration 030: Coordinator demo seed
-- 5 дополнительных семей (для списка), 12 coordinator_tasks разных типов,
-- outreach_scenarios + outreach_logs.
-- Идемпотентно: ON CONFLICT по UUID.
-- ============================================

-- Демо-пароль для всех parent-аккаунтов (тот же DemoPass123!), но эти аккаунты
-- НЕ участвуют в demo-login — нужны только чтобы users.id FK прошёл.

-- ============================================
-- 1. Extra families: 5 parent users + families + children + mother profiles
-- ============================================
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'D0000000-0000-0000-0000-000000000010',
   'authenticated','authenticated','asel@demo.kz',
   crypt('DemoPass123!', gen_salt('bf')), now(),
   '{"role":"mother","clinic_id":"10000000-0000-0000-0000-000000000001"}'::jsonb,
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'D0000000-0000-0000-0000-000000000011',
   'authenticated','authenticated','gulnara@demo.kz',
   crypt('DemoPass123!', gen_salt('bf')), now(),
   '{"role":"mother","clinic_id":"10000000-0000-0000-0000-000000000001"}'::jsonb,
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'D0000000-0000-0000-0000-000000000012',
   'authenticated','authenticated','madina@demo.kz',
   crypt('DemoPass123!', gen_salt('bf')), now(),
   '{"role":"mother","clinic_id":"10000000-0000-0000-0000-000000000001"}'::jsonb,
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'D0000000-0000-0000-0000-000000000013',
   'authenticated','authenticated','zarina@demo.kz',
   crypt('DemoPass123!', gen_salt('bf')), now(),
   '{"role":"mother","clinic_id":"10000000-0000-0000-0000-000000000001"}'::jsonb,
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'D0000000-0000-0000-0000-000000000014',
   'authenticated','authenticated','aigul@demo.kz',
   crypt('DemoPass123!', gen_salt('bf')), now(),
   '{"role":"mother","clinic_id":"10000000-0000-0000-0000-000000000001"}'::jsonb,
   now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, phone, role, clinic_id, first_name, last_name, is_active, created_at, updated_at)
VALUES
  ('D0000000-0000-0000-0000-000000000010','asel@demo.kz',   '+77000010010','mother','10000000-0000-0000-0000-000000000001','Асель',  'Демо', true, now(), now()),
  ('D0000000-0000-0000-0000-000000000011','gulnara@demo.kz','+77000010011','mother','10000000-0000-0000-0000-000000000001','Гульнара','Демо', true, now(), now()),
  ('D0000000-0000-0000-0000-000000000012','madina@demo.kz', '+77000010012','mother','10000000-0000-0000-0000-000000000001','Мадина',  'Демо', true, now(), now()),
  ('D0000000-0000-0000-0000-000000000013','zarina@demo.kz', '+77000010013','mother','10000000-0000-0000-0000-000000000001','Зарина',  'Демо', true, now(), now()),
  ('D0000000-0000-0000-0000-000000000014','aigul@demo.kz',  '+77000010014','mother','10000000-0000-0000-0000-000000000001','Айгуль',  'Демо', true, now(), now())
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name, is_active = true, updated_at = now();

-- Families
INSERT INTO families (id, clinic_id, primary_parent_id, status, invite_code, created_at, updated_at)
VALUES
  ('F0000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','D0000000-0000-0000-0000-000000000010','active','DEMO-ASEL', now(), now()),
  ('F0000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','D0000000-0000-0000-0000-000000000011','active','DEMO-GULN', now(), now()),
  ('F0000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','D0000000-0000-0000-0000-000000000012','active','DEMO-MADN', now(), now()),
  ('F0000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','D0000000-0000-0000-0000-000000000013','active','DEMO-ZARN', now(), now()),
  ('F0000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','D0000000-0000-0000-0000-000000000014','active','DEMO-AIGL', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Mother profiles (разные сроки — pregnancy + postpartum)
INSERT INTO mother_profiles (id, family_id, user_id, lmp_date, edd_date, blood_type, rh_factor, allergies, chronic_conditions, pregnancy_number, gravida, para, notes, created_at, updated_at)
VALUES
  ('E0000000-0000-0000-0000-000000000002','F0000000-0000-0000-0000-000000000002','D0000000-0000-0000-0000-000000000010', CURRENT_DATE - INTERVAL '8 weeks',  CURRENT_DATE + INTERVAL '32 weeks', 'O', 'positive', '{}','{}', 1, 1, 0, 'I триместр', now(), now()),
  ('E0000000-0000-0000-0000-000000000003','F0000000-0000-0000-0000-000000000003','D0000000-0000-0000-0000-000000000011', CURRENT_DATE - INTERVAL '20 weeks', CURRENT_DATE + INTERVAL '20 weeks', 'A', 'positive', '{"пыльца"}','{}', 2, 2, 1, 'II триместр', now(), now()),
  ('E0000000-0000-0000-0000-000000000004','F0000000-0000-0000-0000-000000000004','D0000000-0000-0000-0000-000000000012', CURRENT_DATE - INTERVAL '32 weeks', CURRENT_DATE + INTERVAL '8 weeks',  'B', 'negative','{}','{"гипертония"}', 1, 1, 0, 'III триместр, наблюдение по преэклампсии', now(), now()),
  ('E0000000-0000-0000-0000-000000000005','F0000000-0000-0000-0000-000000000005','D0000000-0000-0000-0000-000000000013', CURRENT_DATE - INTERVAL '52 weeks', CURRENT_DATE - INTERVAL '12 weeks', 'A', 'positive', '{}','{}', 1, 1, 1, 'Послеродовой период', now(), now()),
  ('E0000000-0000-0000-0000-000000000006','F0000000-0000-0000-0000-000000000006','D0000000-0000-0000-0000-000000000014', CURRENT_DATE - INTERVAL '60 weeks', CURRENT_DATE - INTERVAL '20 weeks', 'AB','positive', '{}','{}', 2, 2, 2, 'Период вскармливания', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Child profiles (только для рождённых)
INSERT INTO child_profiles (id, family_id, name, dob, gender, birth_weight, birth_height, blood_type, allergies, is_active, created_at, updated_at)
VALUES
  ('C0000000-0000-0000-0000-000000000005','F0000000-0000-0000-0000-000000000005','Алихан', CURRENT_DATE - INTERVAL '12 weeks', 'male',   3.50, 52.0, 'A+',  '{}', true, now(), now()),
  ('C0000000-0000-0000-0000-000000000006','F0000000-0000-0000-0000-000000000006','Дарина', CURRENT_DATE - INTERVAL '20 weeks', 'female', 3.20, 50.5, 'AB+', '{}', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. COORDINATOR TASKS — 12 разнообразных
-- ============================================
DELETE FROM coordinator_tasks
WHERE clinic_id = '10000000-0000-0000-0000-000000000001'
  AND created_by = 'demo-seed';

INSERT INTO coordinator_tasks (clinic_id, family_id, type, priority, status, assigned_to, due_date, title, notes, created_by, completed_at, created_at)
VALUES
  -- HIGH/CRITICAL pending
  ('10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000004','epds_alert',          'critical','pending',     'D0000000-0000-0000-0000-000000000002', CURRENT_DATE,                       'EPDS высокий риск — Мадина',          'Скрининг показал 14 баллов. Связаться сегодня.', 'demo-seed', NULL, now() - INTERVAL '4 hours'),
  ('10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000003','missed_appointment',  'high',    'pending',     'D0000000-0000-0000-0000-000000000002', CURRENT_DATE,                       'Пропущен визит — Гульнара',           'Не явилась на УЗИ 20w. Перенести.',              'demo-seed', NULL, now() - INTERVAL '6 hours'),
  ('10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000002','welcome_call',        'high',    'pending',     'D0000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '1 day',    'Welcome-call — Асель',                'Новая беременная, 8 недель. Рассказать о программе.', 'demo-seed', NULL, now() - INTERVAL '1 day'),
  -- MEDIUM in_progress
  ('10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000005','low_adherence',       'medium',  'in_progress', 'D0000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '2 days',   'Низкий комплаенс — Зарина',           'Vit D пропущен 4 дня подряд.',                   'demo-seed', NULL, now() - INTERVAL '8 hours'),
  ('10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000006','vaccination_reminder','medium',  'in_progress', 'D0000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '3 days',   'Напоминание о прививке — Айгуль',     'Пентаксим (3) через 3 дня.',                     'demo-seed', NULL, now() - INTERVAL '12 hours'),
  -- MEDIUM/LOW pending
  ('10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000001','vaccination_reminder','medium',  'pending',     'D0000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '3 days',   'Напоминание о прививке — Айгерим',    'Пентаксим (2) для Амиры.',                       'demo-seed', NULL, now() - INTERVAL '2 hours'),
  ('10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000003','custom',              'low',     'pending',     'D0000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '5 days',   'Уточнить страховку — Гульнара',       'Истекает полис в этом месяце.',                  'demo-seed', NULL, now() - INTERVAL '1 day'),
  ('10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000004','overdue_followup',    'high',    'pending',     'D0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '1 day',    'Контроль АД — Мадина (просрочено)',   'Не получено измерение за неделю.',               'demo-seed', NULL, now() - INTERVAL '3 days'),
  -- COMPLETED
  ('10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000001','welcome_call',        'medium',  'completed',   'D0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '5 days',   'Welcome-call — Айгерим',              'Завершено. Семья очень довольна.',               'demo-seed', now() - INTERVAL '5 days', now() - INTERVAL '6 days'),
  ('10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000005','reactivation',        'medium',  'completed',   'D0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '3 days',   'Реактивация — Зарина',                'Возобновила запись на патронаж.',                'demo-seed', now() - INTERVAL '3 days', now() - INTERVAL '5 days'),
  ('10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000006','custom',              'low',     'completed',   'D0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '7 days',   'Сбор отзыва — Айгуль',                'NPS 9. Согласилась на отзыв в 2GIS.',            'demo-seed', now() - INTERVAL '7 days', now() - INTERVAL '8 days'),
  -- DISMISSED
  ('10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000002','welcome_call',        'low',     'dismissed',   'D0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '2 days',   'Дубль welcome-call',                  'Семья уже была обработана автоматом.',           'demo-seed', NULL, now() - INTERVAL '2 days');

-- ============================================
-- 3. OUTREACH SCENARIOS — 3 шт
-- ============================================
INSERT INTO outreach_scenarios (id, clinic_id, name, trigger_json, actions_json, is_active)
VALUES
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',
   'Welcome-серия (1 неделя)',
   '{"event":"family_created","delay_minutes":0}'::jsonb,
   '[{"step":1,"channel":"whatsapp","template":"welcome_intro","delay_hours":2},{"step":2,"channel":"whatsapp","template":"welcome_program","delay_hours":48},{"step":3,"channel":"whatsapp","template":"welcome_first_visit","delay_hours":120}]'::jsonb,
   true),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',
   'Реминдер о пропущенном приёме',
   '{"event":"appointment_missed","delay_minutes":30}'::jsonb,
   '[{"step":1,"channel":"whatsapp","template":"missed_visit_reschedule"},{"step":2,"channel":"call","template":"coordinator_call","delay_hours":24}]'::jsonb,
   true),
  ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001',
   'Напоминание о вакцинации (за 3 дня)',
   '{"event":"vaccination_due","days_before":3}'::jsonb,
   '[{"step":1,"channel":"push","template":"vaccine_reminder"},{"step":2,"channel":"whatsapp","template":"vaccine_reminder","delay_hours":24}]'::jsonb,
   true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. OUTREACH LOGS — 12 записей разных статусов
-- ============================================
DELETE FROM outreach_logs WHERE scenario_id IN (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003'
);

INSERT INTO outreach_logs (scenario_id, family_id, status, result, sent_at, created_at)
VALUES
  ('30000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000002','sent',     'Доставлено в WhatsApp', now() - INTERVAL '1 day',  now() - INTERVAL '1 day'),
  ('30000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000003','opened',   'Прочитано',             now() - INTERVAL '2 days', now() - INTERVAL '2 days'),
  ('30000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000004','converted','Запись на УЗИ',         now() - INTERVAL '3 days', now() - INTERVAL '3 days'),
  ('30000000-0000-0000-0000-000000000002','F0000000-0000-0000-0000-000000000003','sent',     'WhatsApp ушло',         now() - INTERVAL '6 hours',now() - INTERVAL '6 hours'),
  ('30000000-0000-0000-0000-000000000002','F0000000-0000-0000-0000-000000000003','delivered','Доставлено',            now() - INTERVAL '5 hours',now() - INTERVAL '5 hours'),
  ('30000000-0000-0000-0000-000000000002','F0000000-0000-0000-0000-000000000004','failed',   'Номер недоступен',      now() - INTERVAL '4 hours',now() - INTERVAL '4 hours'),
  ('30000000-0000-0000-0000-000000000003','F0000000-0000-0000-0000-000000000001','opened',   'Push прочитан',         now() - INTERVAL '12 hours',now() - INTERVAL '12 hours'),
  ('30000000-0000-0000-0000-000000000003','F0000000-0000-0000-0000-000000000005','sent',     'Отправлено',            now() - INTERVAL '8 hours',now() - INTERVAL '8 hours'),
  ('30000000-0000-0000-0000-000000000003','F0000000-0000-0000-0000-000000000006','converted','Подтверждена явка',     now() - INTERVAL '1 day',  now() - INTERVAL '1 day'),
  ('30000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000005','sent',     'Доставлено',            now() - INTERVAL '4 days', now() - INTERVAL '4 days'),
  ('30000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000006','opened',   'Прочитано',             now() - INTERVAL '5 days', now() - INTERVAL '5 days'),
  ('30000000-0000-0000-0000-000000000002','F0000000-0000-0000-0000-000000000005','pending',  NULL,                    NULL,                       now() - INTERVAL '1 hour');

-- ============================================
-- ИТОГ
-- ============================================
DO $$
DECLARE
  v_fam int; v_tasks int; v_scen int; v_logs int;
BEGIN
  SELECT count(*) INTO v_fam   FROM families         WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_tasks FROM coordinator_tasks WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_scen  FROM outreach_scenarios WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_logs  FROM outreach_logs WHERE scenario_id IN ('30000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003');
  RAISE NOTICE '030 coordinator seed: families=%, tasks=%, scenarios=%, logs=%', v_fam, v_tasks, v_scen, v_logs;
END $$;
