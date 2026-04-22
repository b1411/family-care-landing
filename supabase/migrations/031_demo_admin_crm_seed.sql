-- ============================================
-- Migration 031: Admin / CRM demo seed
-- service_packages, segments, message_templates, call_scripts,
-- leads (15), deals (5), campaigns (3) + enrollments, call_logs (20),
-- visit_ratings + family_packages
-- Идемпотентно: ON CONFLICT по UUID, DELETE для bulk.
-- ============================================

-- ============================================
-- 1. SERVICE PACKAGES — 3 пакета
-- ============================================
INSERT INTO service_packages (id, clinic_id, name, description, services_json, price, duration_months, is_active)
VALUES
  ('60000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',
   'Беременность 9 месяцев',
   'Полное ведение беременности: визиты, УЗИ, анализы, КТГ',
   '[{"code":"obg_visit","count":12},{"code":"uzi","count":3},{"code":"lab_pack","count":4},{"code":"ctg","count":4}]'::jsonb,
   450000, 9, true),
  ('60000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',
   'Малыш до 1 года',
   'Педиатрические осмотры, вакцинация, патронажи, лабораторные скрининги',
   '[{"code":"ped_visit","count":12},{"code":"vaccinations","count":8},{"code":"home_visit","count":2}]'::jsonb,
   320000, 12, true),
  ('60000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001',
   'Премиум: семейный',
   '24/7 чат с врачом, видео-консультации, приоритетная запись',
   '[{"code":"chat_24_7","limit":"unlimited"},{"code":"video_consult","count":24},{"code":"priority_booking","included":true}]'::jsonb,
   980000, 12, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. FAMILY PACKAGES — кто что купил
-- ============================================
DELETE FROM family_packages WHERE family_id IN (
  'F0000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000002',
  'F0000000-0000-0000-0000-000000000003','F0000000-0000-0000-0000-000000000004',
  'F0000000-0000-0000-0000-000000000005','F0000000-0000-0000-0000-000000000006'
);
INSERT INTO family_packages (family_id, package_id, purchased_at, expires_at, status)
VALUES
  ('F0000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000002', now() - INTERVAL '3 months', now() + INTERVAL '9 months',  'active'),
  ('F0000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000001', now() - INTERVAL '2 months', now() + INTERVAL '7 months',  'active'),
  ('F0000000-0000-0000-0000-000000000003','60000000-0000-0000-0000-000000000001', now() - INTERVAL '5 months', now() + INTERVAL '4 months',  'active'),
  ('F0000000-0000-0000-0000-000000000004','60000000-0000-0000-0000-000000000003', now() - INTERVAL '8 months', now() + INTERVAL '4 months',  'active'),
  ('F0000000-0000-0000-0000-000000000005','60000000-0000-0000-0000-000000000002', now() - INTERVAL '4 months', now() + INTERVAL '8 months',  'active'),
  ('F0000000-0000-0000-0000-000000000006','60000000-0000-0000-0000-000000000002', now() - INTERVAL '5 months', now() + INTERVAL '7 months',  'active');

-- ============================================
-- 3. SEGMENTS — 4 сегмента
-- ============================================
INSERT INTO segments (id, clinic_id, name, description, criteria_json, is_dynamic, family_count, created_by)
VALUES
  ('70000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',
   'Беременные I триместр',
   'Семьи на сроке до 14 недель',
   '{"conditions":[{"field":"pregnancy_week","op":"<=","value":14}],"logic":"and"}'::jsonb,
   true, 1, 'D0000000-0000-0000-0000-000000000003'),
  ('70000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',
   'Дети до 1 года',
   'Семьи с младенцами',
   '{"conditions":[{"field":"child_age_months","op":"<=","value":12}],"logic":"and"}'::jsonb,
   true, 3, 'D0000000-0000-0000-0000-000000000003'),
  ('70000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001',
   'Низкий комплаенс',
   'Семьи, пропустившие >2 назначенных доз/визитов за 7 дней',
   '{"conditions":[{"field":"missed_count_7d","op":">=","value":2}],"logic":"and"}'::jsonb,
   true, 2, 'D0000000-0000-0000-0000-000000000003'),
  ('70000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001',
   'NPS-промоутеры (для отзывов)',
   'NPS >= 9, активные пациенты',
   '{"conditions":[{"field":"nps","op":">=","value":9},{"field":"is_active","op":"=","value":true}],"logic":"and"}'::jsonb,
   true, 2, 'D0000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. MESSAGE TEMPLATES — 6 шаблонов
-- ============================================
INSERT INTO message_templates (id, clinic_id, name, channel, subject, body, variables, language, is_active)
VALUES
  ('80000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','welcome_intro','whatsapp', NULL,
   'Здравствуйте, {{first_name}}! Поздравляем — вы теперь часть программы UMAI Health. Ваш координатор: {{coordinator_name}}. В ближайшие дни мы свяжемся для знакомства.',
   ARRAY['first_name','coordinator_name'], 'ru', true),
  ('80000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','welcome_program','whatsapp', NULL,
   '{{first_name}}, отправляем краткий план ведения вашей беременности. ПДР: {{edd_date}}. Подробности в приложении.',
   ARRAY['first_name','edd_date'], 'ru', true),
  ('80000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','vaccine_reminder','push', 'Прививка через 3 дня',
   'Напоминаем: {{vaccine_name}} для {{child_name}} запланирована на {{date}}. Подтвердите запись.',
   ARRAY['vaccine_name','child_name','date'], 'ru', true),
  ('80000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','missed_visit_reschedule','whatsapp', NULL,
   '{{first_name}}, мы заметили, что вы пропустили приём {{date}}. Хотите перенести? Ответьте 1 — да, 2 — нет.',
   ARRAY['first_name','date'], 'ru', true),
  ('80000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','review_request_2gis','whatsapp', NULL,
   '{{first_name}}, спасибо за визит! Если всё понравилось — поделитесь отзывом в 2GIS: {{link}}',
   ARRAY['first_name','link'], 'ru', true),
  ('80000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','low_adherence_check','whatsapp', NULL,
   '{{first_name}}, замечаем, что {{medication}} давно не отмечалась. Всё в порядке? Если есть вопросы — напишите врачу.',
   ARRAY['first_name','medication'], 'ru', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. CALL SCRIPTS — 2 скрипта
-- ============================================
INSERT INTO call_scripts (id, clinic_id, task_type, name, steps_json, is_active)
VALUES
  ('90000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','welcome_call',
   'Welcome-call для беременных',
   '[{"step":1,"label":"Приветствие","prompt":"Здравствуйте, {{first_name}}! Это {{coordinator_name}} из UMAI Health. Удобно сейчас 5 минут поговорить?"},{"step":2,"label":"Подтверждение программы","prompt":"Вы записаны в программу ведения беременности. Хочу убедиться, что у вас есть доступ в приложении."},{"step":3,"label":"Первый визит","prompt":"Когда вам удобно прийти на первичный приём?"},{"step":4,"label":"Закрытие","prompt":"Если возникнут вопросы — пишите в чат. До встречи!"}]'::jsonb,
   true),
  ('90000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','overdue_followup',
   'Контроль пропусков',
   '[{"step":1,"label":"Контекст","prompt":"{{first_name}}, заметили, что {{event_type}} был пропущен. Всё хорошо?"},{"step":2,"label":"Причина","prompt":"Подскажите, что помешало?"},{"step":3,"label":"План","prompt":"Давайте перенесём на {{suggested_date}}?"}]'::jsonb,
   true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. LEADS — 15 лидов разных стадий и источников
-- ============================================
DELETE FROM leads WHERE clinic_id = '10000000-0000-0000-0000-000000000001'
  AND notes LIKE 'demo-seed:%';

INSERT INTO leads (id, clinic_id, source, stage, first_name, last_name, phone, email, lmp_date, edd_date, assigned_to, notes, utm_source, utm_medium, utm_campaign, created_at)
VALUES
  ('A0000000-0000-0000-0001-000000000001','10000000-0000-0000-0000-000000000001','website',  'new',         'Алина',  'Касенова',   '+77011110001','alina.k@example.kz',  CURRENT_DATE - INTERVAL '6 weeks',  CURRENT_DATE + INTERVAL '34 weeks', NULL,                                   'demo-seed: запрос с landing', 'google', 'cpc', 'pregnancy_2026', now() - INTERVAL '2 days'),
  ('A0000000-0000-0000-0001-000000000002','10000000-0000-0000-0000-000000000001','instagram','new',         'Жанар',  'Сейтжанова', '+77011110002',NULL,                  CURRENT_DATE - INTERVAL '10 weeks', CURRENT_DATE + INTERVAL '30 weeks', NULL,                                   'demo-seed: DM в инст',       'instagram','social','reels_april', now() - INTERVAL '1 day'),
  ('A0000000-0000-0000-0001-000000000003','10000000-0000-0000-0000-000000000001','2gis',     'contacted',   'Анара',  'Жумабекова', '+77011110003','anara.j@example.kz',  NULL,                              NULL,                              'D0000000-0000-0000-0000-000000000002', 'demo-seed: звонок 5 мин',     '2gis',   'organic',NULL,                now() - INTERVAL '3 days'),
  ('A0000000-0000-0000-0001-000000000004','10000000-0000-0000-0000-000000000001','referral', 'contacted',   'Айдана', 'Тулегенова', '+77011110004',NULL,                  CURRENT_DATE - INTERVAL '4 weeks',  CURRENT_DATE + INTERVAL '36 weeks', 'D0000000-0000-0000-0000-000000000002', 'demo-seed: рекомендация',    NULL,     NULL,     NULL,                now() - INTERVAL '4 days'),
  ('A0000000-0000-0000-0001-000000000005','10000000-0000-0000-0000-000000000001','phone',    'interested',  'Динара', 'Алимбаева',  '+77011110005','d.alimbaeva@example.kz',NULL,                            NULL,                              'D0000000-0000-0000-0000-000000000002', 'demo-seed: интересует пакет малыш', NULL, NULL, NULL,             now() - INTERVAL '5 days'),
  ('A0000000-0000-0000-0001-000000000006','10000000-0000-0000-0000-000000000001','whatsapp', 'interested',  'Камила', 'Нурланова',  '+77011110006',NULL,                  CURRENT_DATE - INTERVAL '15 weeks', CURRENT_DATE + INTERVAL '25 weeks', 'D0000000-0000-0000-0000-000000000002', 'demo-seed: уточняет цены',   NULL,     NULL,     NULL,                now() - INTERVAL '7 days'),
  ('A0000000-0000-0000-0001-000000000007','10000000-0000-0000-0000-000000000001','website',  'negotiation', 'Сабина', 'Бекетова',   '+77011110007','sabina.b@example.kz', CURRENT_DATE - INTERVAL '8 weeks',  CURRENT_DATE + INTERVAL '32 weeks', 'D0000000-0000-0000-0000-000000000002', 'demo-seed: согласовываем рассрочку', 'facebook','cpc','pregnancy_2026', now() - INTERVAL '8 days'),
  ('A0000000-0000-0000-0001-000000000008','10000000-0000-0000-0000-000000000001','referral', 'negotiation', 'Гаухар', 'Аманжолова', '+77011110008',NULL,                  NULL,                              NULL,                              'D0000000-0000-0000-0000-000000000002', 'demo-seed: премиум-пакет',   NULL,     NULL,     NULL,                now() - INTERVAL '10 days'),
  ('A0000000-0000-0000-0001-000000000009','10000000-0000-0000-0000-000000000001','website',  'won',         'Айгерим','Демо',       '+77000000001','p1@demo.kz',          '2025-04-10',                       '2026-01-15',                      'D0000000-0000-0000-0000-000000000002', 'demo-seed: конверсия в основного клиента', 'google','cpc','pregnancy_2025', now() - INTERVAL '12 months'),
  ('A0000000-0000-0000-0001-000000000010','10000000-0000-0000-0000-000000000001','instagram','won',         'Асель',  'Демо',       '+77000010010','asel@demo.kz',        CURRENT_DATE - INTERVAL '8 weeks',  CURRENT_DATE + INTERVAL '32 weeks', 'D0000000-0000-0000-0000-000000000002', 'demo-seed: конверсия',       'instagram','social','reels_april', now() - INTERVAL '14 days'),
  ('A0000000-0000-0000-0001-000000000011','10000000-0000-0000-0000-000000000001','2gis',     'won',         'Гульнара','Демо',      '+77000010011','gulnara@demo.kz',     CURRENT_DATE - INTERVAL '20 weeks', CURRENT_DATE + INTERVAL '20 weeks', 'D0000000-0000-0000-0000-000000000002', 'demo-seed: конверсия',       '2gis',  'organic',NULL,                now() - INTERVAL '22 days'),
  ('A0000000-0000-0000-0001-000000000012','10000000-0000-0000-0000-000000000001','referral', 'lost',        'Майра',  'Кузнецова',  '+77011110012',NULL,                  NULL,                              NULL,                              'D0000000-0000-0000-0000-000000000002', 'demo-seed: не подошёл бюджет',NULL,    NULL,     NULL,                now() - INTERVAL '20 days'),
  ('A0000000-0000-0000-0001-000000000013','10000000-0000-0000-0000-000000000001','phone',    'lost',        'Айжан',  'Иманбаева',  '+77011110013',NULL,                  NULL,                              NULL,                              'D0000000-0000-0000-0000-000000000002', 'demo-seed: ушла в другую клинику', NULL, NULL, NULL,           now() - INTERVAL '18 days'),
  ('A0000000-0000-0000-0001-000000000014','10000000-0000-0000-0000-000000000001','walk_in',  'contacted',   'Розалия','Турганова',  '+77011110014',NULL,                  NULL,                              NULL,                              'D0000000-0000-0000-0000-000000000002', 'demo-seed: пришла без записи',NULL,    NULL,     NULL,                now() - INTERVAL '6 days'),
  ('A0000000-0000-0000-0001-000000000015','10000000-0000-0000-0000-000000000001','website',  'new',         'Эльмира','Маликова',   '+77011110015','e.malikova@example.kz',CURRENT_DATE - INTERVAL '5 weeks', CURRENT_DATE + INTERVAL '35 weeks', NULL,                                  'demo-seed: заявка ночью',     'google','cpc','pregnancy_2026', now() - INTERVAL '8 hours');

-- Привязка won-лидов к существующим families
UPDATE leads SET family_id = 'F0000000-0000-0000-0000-000000000001', converted_at = now() - INTERVAL '11 months' WHERE id = 'A0000000-0000-0000-0001-000000000009';
UPDATE leads SET family_id = 'F0000000-0000-0000-0000-000000000002', converted_at = now() - INTERVAL '14 days'   WHERE id = 'A0000000-0000-0000-0001-000000000010';
UPDATE leads SET family_id = 'F0000000-0000-0000-0000-000000000003', converted_at = now() - INTERVAL '22 days'   WHERE id = 'A0000000-0000-0000-0001-000000000011';

-- ============================================
-- 7. DEALS — 7 шт
-- ============================================
DELETE FROM deals WHERE clinic_id = '10000000-0000-0000-0000-000000000001'
  AND notes LIKE 'demo-seed:%';

INSERT INTO deals (id, clinic_id, family_id, lead_id, package_id, amount, stage, proposed_by, proposed_at, closed_at, payment_method, invoice_number, notes, created_at)
VALUES
  -- closed/paid
  ('B0000000-0000-0000-0001-000000000001','10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000001','A0000000-0000-0000-0001-000000000009','60000000-0000-0000-0000-000000000002', 320000, 'paid',       'D0000000-0000-0000-0000-000000000003', now() - INTERVAL '11 months', now() - INTERVAL '11 months', 'card',          'INV-2025-001', 'demo-seed: малыш до года', now() - INTERVAL '11 months'),
  ('B0000000-0000-0000-0001-000000000002','10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000002','A0000000-0000-0000-0001-000000000010','60000000-0000-0000-0000-000000000001', 450000, 'paid',       'D0000000-0000-0000-0000-000000000003', now() - INTERVAL '14 days',   now() - INTERVAL '14 days',   'transfer',      'INV-2026-002', 'demo-seed: беременность 9м', now() - INTERVAL '14 days'),
  ('B0000000-0000-0000-0001-000000000003','10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000003','A0000000-0000-0000-0001-000000000011','60000000-0000-0000-0000-000000000001', 450000, 'paid',       'D0000000-0000-0000-0000-000000000003', now() - INTERVAL '22 days',   now() - INTERVAL '22 days',   'card',          'INV-2026-003', 'demo-seed: беременность 9м', now() - INTERVAL '22 days'),
  -- approved (готовы к оплате)
  ('B0000000-0000-0000-0001-000000000004','10000000-0000-0000-0000-000000000001', NULL,                                    'A0000000-0000-0000-0001-000000000007','60000000-0000-0000-0000-000000000001', 450000, 'approved',   'D0000000-0000-0000-0000-000000000003', now() - INTERVAL '5 days',    NULL,                          NULL,            NULL,           'demo-seed: ждёт оплаты',     now() - INTERVAL '5 days'),
  -- negotiation
  ('B0000000-0000-0000-0001-000000000005','10000000-0000-0000-0000-000000000001', NULL,                                    'A0000000-0000-0000-0001-000000000008','60000000-0000-0000-0000-000000000003', 980000, 'negotiation','D0000000-0000-0000-0000-000000000003', now() - INTERVAL '7 days',    NULL,                          NULL,            NULL,           'demo-seed: премиум, торг',   now() - INTERVAL '7 days'),
  -- proposed
  ('B0000000-0000-0000-0001-000000000006','10000000-0000-0000-0000-000000000001', NULL,                                    'A0000000-0000-0000-0001-000000000005','60000000-0000-0000-0000-000000000002', 320000, 'proposed',   'D0000000-0000-0000-0000-000000000003', now() - INTERVAL '3 days',    NULL,                          NULL,            NULL,           'demo-seed: предложение отправлено', now() - INTERVAL '3 days'),
  -- cancelled
  ('B0000000-0000-0000-0001-000000000007','10000000-0000-0000-0000-000000000001', NULL,                                    'A0000000-0000-0000-0001-000000000012','60000000-0000-0000-0000-000000000001', 450000, 'cancelled',  'D0000000-0000-0000-0000-000000000003', now() - INTERVAL '21 days',   now() - INTERVAL '20 days',   NULL,            NULL,           'demo-seed: отказ',           now() - INTERVAL '21 days');

-- ============================================
-- 8. CAMPAIGNS — 3 шт
-- ============================================
INSERT INTO campaigns (id, clinic_id, name, type, segment_id, status, steps_json, stats_json, created_by, started_at, completed_at)
VALUES
  ('C1000000-0000-0000-0001-000000000001','10000000-0000-0000-0000-000000000001',
   'Welcome-серия для беременных I триместра', 'drip',
   '70000000-0000-0000-0000-000000000001', 'active',
   '[{"step":1,"channel":"whatsapp","template":"welcome_intro","delay_hours":2},{"step":2,"channel":"whatsapp","template":"welcome_program","delay_hours":48},{"step":3,"channel":"push","template":"vaccine_reminder","delay_hours":120}]'::jsonb,
   '{"sent":12,"delivered":11,"opened":9,"converted":4}'::jsonb,
   'D0000000-0000-0000-0000-000000000003', now() - INTERVAL '30 days', NULL),
  ('C1000000-0000-0000-0001-000000000002','10000000-0000-0000-0000-000000000001',
   'Реактивация неактивных семей', 'one_time',
   '70000000-0000-0000-0000-000000000003', 'completed',
   '[{"step":1,"channel":"whatsapp","template":"low_adherence_check"}]'::jsonb,
   '{"sent":18,"delivered":16,"opened":12,"converted":3}'::jsonb,
   'D0000000-0000-0000-0000-000000000003', now() - INTERVAL '14 days', now() - INTERVAL '7 days'),
  ('C1000000-0000-0000-0001-000000000003','10000000-0000-0000-0000-000000000001',
   'Сбор отзывов 2GIS (NPS промоутеры)', 'recurring',
   '70000000-0000-0000-0000-000000000004', 'active',
   '[{"step":1,"channel":"whatsapp","template":"review_request_2gis"}]'::jsonb,
   '{"sent":8,"delivered":8,"opened":7,"converted":5}'::jsonb,
   'D0000000-0000-0000-0000-000000000003', now() - INTERVAL '21 days', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. CAMPAIGN ENROLLMENTS
-- ============================================
DELETE FROM campaign_enrollments WHERE campaign_id IN (
  'C1000000-0000-0000-0001-000000000001','C1000000-0000-0000-0001-000000000002','C1000000-0000-0000-0001-000000000003'
);
INSERT INTO campaign_enrollments (campaign_id, family_id, current_step, status, enrolled_at, last_step_sent_at, converted_at)
VALUES
  ('C1000000-0000-0000-0001-000000000001','F0000000-0000-0000-0000-000000000002', 3, 'active',    now() - INTERVAL '6 days',  now() - INTERVAL '1 day',  NULL),
  ('C1000000-0000-0000-0001-000000000001','F0000000-0000-0000-0000-000000000003', 2, 'active',    now() - INTERVAL '4 days',  now() - INTERVAL '2 days', NULL),
  ('C1000000-0000-0000-0001-000000000001','F0000000-0000-0000-0000-000000000004', 3, 'converted', now() - INTERVAL '20 days', now() - INTERVAL '15 days', now() - INTERVAL '14 days'),
  ('C1000000-0000-0000-0001-000000000002','F0000000-0000-0000-0000-000000000005', 1, 'completed', now() - INTERVAL '12 days', now() - INTERVAL '12 days', NULL),
  ('C1000000-0000-0000-0001-000000000002','F0000000-0000-0000-0000-000000000006', 1, 'completed', now() - INTERVAL '12 days', now() - INTERVAL '12 days', NULL),
  ('C1000000-0000-0000-0001-000000000003','F0000000-0000-0000-0000-000000000001', 1, 'converted', now() - INTERVAL '10 days', now() - INTERVAL '10 days', now() - INTERVAL '9 days'),
  ('C1000000-0000-0000-0001-000000000003','F0000000-0000-0000-0000-000000000005', 1, 'active',    now() - INTERVAL '5 days',  now() - INTERVAL '5 days',  NULL);

-- ============================================
-- 10. CALL LOGS — 20 звонков
-- ============================================
DELETE FROM call_logs WHERE clinic_id = '10000000-0000-0000-0000-000000000001'
  AND notes LIKE 'demo-seed:%';

INSERT INTO call_logs (clinic_id, family_id, lead_id, caller_id, direction, duration_seconds, outcome, script_id, notes, created_at)
VALUES
  -- К лидам (исходящие)
  ('10000000-0000-0000-0000-000000000001', NULL, 'A0000000-0000-0000-0001-000000000001', 'D0000000-0000-0000-0000-000000000002', 'outbound', 0,   'no_answer',          NULL, 'demo-seed: первая попытка', now() - INTERVAL '1 day'),
  ('10000000-0000-0000-0000-000000000001', NULL, 'A0000000-0000-0000-0001-000000000001', 'D0000000-0000-0000-0000-000000000002', 'outbound', 245, 'answered',           '90000000-0000-0000-0000-000000000001', 'demo-seed: интересно, перезвонит', now() - INTERVAL '4 hours'),
  ('10000000-0000-0000-0000-000000000001', NULL, 'A0000000-0000-0000-0001-000000000003', 'D0000000-0000-0000-0000-000000000002', 'outbound', 312, 'answered',           '90000000-0000-0000-0000-000000000001', 'demo-seed: записаны на встречу', now() - INTERVAL '3 days'),
  ('10000000-0000-0000-0000-000000000001', NULL, 'A0000000-0000-0000-0001-000000000005', 'D0000000-0000-0000-0000-000000000002', 'outbound', 421, 'answered',           '90000000-0000-0000-0000-000000000001', 'demo-seed: ждёт КП', now() - INTERVAL '5 days'),
  ('10000000-0000-0000-0000-000000000001', NULL, 'A0000000-0000-0000-0001-000000000007', 'D0000000-0000-0000-0000-000000000002', 'outbound', 612, 'answered',           '90000000-0000-0000-0000-000000000001', 'demo-seed: обсуждаем рассрочку', now() - INTERVAL '6 days'),
  ('10000000-0000-0000-0000-000000000001', NULL, 'A0000000-0000-0000-0001-000000000012', 'D0000000-0000-0000-0000-000000000002', 'outbound', 178, 'answered',           NULL, 'demo-seed: отказ — бюджет', now() - INTERVAL '20 days'),
  ('10000000-0000-0000-0000-000000000001', NULL, 'A0000000-0000-0000-0001-000000000013', 'D0000000-0000-0000-0000-000000000002', 'outbound', 0,   'busy',               NULL, 'demo-seed: занято', now() - INTERVAL '17 days'),
  ('10000000-0000-0000-0000-000000000001', NULL, 'A0000000-0000-0000-0001-000000000013', 'D0000000-0000-0000-0000-000000000002', 'outbound', 95,  'answered',           NULL, 'demo-seed: ушла в другую клинику', now() - INTERVAL '16 days'),
  ('10000000-0000-0000-0000-000000000001', NULL, 'A0000000-0000-0000-0001-000000000015', 'D0000000-0000-0000-0000-000000000002', 'outbound', 0,   'voicemail',          NULL, 'demo-seed: оставлено сообщение', now() - INTERVAL '5 hours'),
  -- К существующим семьям
  ('10000000-0000-0000-0000-000000000001', 'F0000000-0000-0000-0000-000000000001', NULL, 'D0000000-0000-0000-0000-000000000002', 'outbound', 528, 'answered',           '90000000-0000-0000-0000-000000000001', 'demo-seed: welcome-call с Айгерим', now() - INTERVAL '5 days'),
  ('10000000-0000-0000-0000-000000000001', 'F0000000-0000-0000-0000-000000000003', NULL, 'D0000000-0000-0000-0000-000000000002', 'outbound', 234, 'answered',           '90000000-0000-0000-0000-000000000002', 'demo-seed: пропуск визита, перенесли', now() - INTERVAL '6 hours'),
  ('10000000-0000-0000-0000-000000000001', 'F0000000-0000-0000-0000-000000000004', NULL, 'D0000000-0000-0000-0000-000000000002', 'outbound', 412, 'answered',           NULL, 'demo-seed: EPDS контроль', now() - INTERVAL '4 hours'),
  ('10000000-0000-0000-0000-000000000001', 'F0000000-0000-0000-0000-000000000005', NULL, 'D0000000-0000-0000-0000-000000000002', 'outbound', 178, 'answered',           '90000000-0000-0000-0000-000000000002', 'demo-seed: контроль доз', now() - INTERVAL '8 hours'),
  ('10000000-0000-0000-0000-000000000001', 'F0000000-0000-0000-0000-000000000006', NULL, 'D0000000-0000-0000-0000-000000000002', 'outbound', 89,  'answered',           NULL, 'demo-seed: подтвердила прививку', now() - INTERVAL '12 hours'),
  ('10000000-0000-0000-0000-000000000001', 'F0000000-0000-0000-0000-000000000002', NULL, 'D0000000-0000-0000-0000-000000000002', 'outbound', 0,   'callback_requested', NULL, 'demo-seed: попросила перезвонить', now() - INTERVAL '1 day'),
  -- Входящие
  ('10000000-0000-0000-0000-000000000001', 'F0000000-0000-0000-0000-000000000001', NULL, 'D0000000-0000-0000-0000-000000000002', 'inbound',  267, 'answered',           NULL, 'demo-seed: вопрос по вакцинам', now() - INTERVAL '2 days'),
  ('10000000-0000-0000-0000-000000000001', 'F0000000-0000-0000-0000-000000000004', NULL, 'D0000000-0000-0000-0000-000000000002', 'inbound',  198, 'answered',           NULL, 'demo-seed: жалоба на самочувствие', now() - INTERVAL '3 days'),
  ('10000000-0000-0000-0000-000000000001', 'F0000000-0000-0000-0000-000000000003', NULL, 'D0000000-0000-0000-0000-000000000002', 'inbound',  145, 'answered',           NULL, 'demo-seed: запись на УЗИ', now() - INTERVAL '4 days'),
  ('10000000-0000-0000-0000-000000000001', NULL, 'A0000000-0000-0000-0001-000000000004', 'D0000000-0000-0000-0000-000000000002', 'inbound',  319, 'answered',           NULL, 'demo-seed: уточнение цен', now() - INTERVAL '4 days'),
  ('10000000-0000-0000-0000-000000000001', NULL, NULL,                                    'D0000000-0000-0000-0000-000000000002', 'inbound',  62,  'wrong_number',       NULL, 'demo-seed: ошиблись номером', now() - INTERVAL '1 day');

-- ============================================
-- ИТОГ
-- ============================================
DO $$
DECLARE v_pkg int; v_seg int; v_tpl int; v_scr int; v_ld int; v_dl int; v_cm int; v_en int; v_cl int;
BEGIN
  SELECT count(*) INTO v_pkg FROM service_packages   WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_seg FROM segments            WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_tpl FROM message_templates   WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_scr FROM call_scripts        WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_ld  FROM leads               WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_dl  FROM deals               WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_cm  FROM campaigns           WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_en  FROM campaign_enrollments;
  SELECT count(*) INTO v_cl  FROM call_logs           WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  RAISE NOTICE '031 admin/CRM seed: packages=%, segments=%, templates=%, scripts=%, leads=%, deals=%, campaigns=%, enrollments=%, calls=%',
    v_pkg, v_seg, v_tpl, v_scr, v_ld, v_dl, v_cm, v_en, v_cl;
END $$;
