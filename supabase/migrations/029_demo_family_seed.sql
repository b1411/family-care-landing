-- ============================================
-- Migration 029: Full demo family seed (mom + doctor)
-- Naполняет реальными данными модули: journey, growth, milestones,
-- sleep/feeding/mood logs, vaccinations, prescriptions+doses,
-- appointments+slots, lab_results, documents, EPDS screening.
-- Привязка дат к CURRENT_DATE — демо всегда выглядит "свежим".
-- Идемпотентно: bulk-данные DELETE по family/child/user, named — ON CONFLICT.
-- ============================================

DO $$
DECLARE
  v_family_id     uuid := 'F0000000-0000-0000-0000-000000000001';
  v_child_id      uuid := 'C0000000-0000-0000-0000-000000000001';
  v_mother_uid    uuid := 'D0000000-0000-0000-0000-000000000001';
  v_doctor_uid    uuid := 'D0000000-0000-0000-0000-000000000004';
  v_doctor_id     uuid := 'BD000000-0000-0000-0000-000000000001';
  v_clinic_id     uuid := '10000000-0000-0000-0000-000000000001';
  v_journey_preg  uuid := '21000000-0000-0000-0000-000000000001';
  v_journey_inf   uuid := '21000000-0000-0000-0000-000000000002';
BEGIN
  RAISE NOTICE 'Seeding demo family data for family=%', v_family_id;
END $$;

-- ============================================
-- 1. JOURNEYS — completed pregnancy + active infant
-- ============================================
INSERT INTO journeys (id, family_id, child_id, type, status, started_at, completed_at, metadata)
VALUES
  ('21000000-0000-0000-0000-000000000001', 'F0000000-0000-0000-0000-000000000001',
   'C0000000-0000-0000-0000-000000000001', 'pregnancy', 'completed',
   (CURRENT_DATE - INTERVAL '12 months')::timestamptz,
   (CURRENT_DATE - INTERVAL '3 months')::timestamptz,
   '{"lmp_date":"2025-04-10","edd_date":"2026-01-15","weeks_at_birth":40}'::jsonb),
  ('21000000-0000-0000-0000-000000000002', 'F0000000-0000-0000-0000-000000000001',
   'C0000000-0000-0000-0000-000000000001', 'infant', 'active',
   (CURRENT_DATE - INTERVAL '3 months')::timestamptz,
   NULL,
   '{"birth_date":"2026-01-15","track":"first_year"}'::jsonb)
ON CONFLICT (id) DO UPDATE
  SET status = EXCLUDED.status,
      metadata = EXCLUDED.metadata,
      updated_at = now();

-- ============================================
-- 2. JOURNEY EVENTS — 12 pregnancy (history) + 10 infant (active)
-- ============================================
DELETE FROM journey_events
WHERE journey_id IN ('21000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000002');

-- Pregnancy events (all completed)
INSERT INTO journey_events (journey_id, type, title, description, trigger_week, due_date, status, is_mandatory, completed_at, completed_by)
VALUES
  ('21000000-0000-0000-0000-000000000001', 'visit', 'Постановка на учёт', 'Первичный визит к акушеру-гинекологу', 8,
   CURRENT_DATE - INTERVAL '8 months', 'completed', true, (CURRENT_DATE - INTERVAL '8 months')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000001', 'lab', 'Анализы 1-го триместра', 'ОАК, ОАМ, биохимия, TORCH, ВИЧ, RW, гепатиты', 10,
   CURRENT_DATE - INTERVAL '7 months 2 weeks', 'completed', true, (CURRENT_DATE - INTERVAL '7 months 2 weeks')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000001', 'screening', 'Скрининг 1-го триместра', 'УЗИ + биохимия (PAPP-A, β-ХГЧ)', 12,
   CURRENT_DATE - INTERVAL '7 months', 'completed', true, (CURRENT_DATE - INTERVAL '7 months')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000001', 'visit', 'Плановый визит', 'Контроль АД, прибавки веса', 16,
   CURRENT_DATE - INTERVAL '6 months', 'completed', true, (CURRENT_DATE - INTERVAL '6 months')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000001', 'screening', 'УЗИ 2-го триместра', 'Анатомический скрининг плода', 20,
   CURRENT_DATE - INTERVAL '5 months', 'completed', true, (CURRENT_DATE - INTERVAL '5 months')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000001', 'lab', 'ГТТ', 'Глюкозотолерантный тест', 26,
   CURRENT_DATE - INTERVAL '4 months', 'completed', true, (CURRENT_DATE - INTERVAL '4 months')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000001', 'screening', 'УЗИ 3-го триместра', 'Доплерометрия, оценка веса плода', 32,
   CURRENT_DATE - INTERVAL '3 months 2 weeks', 'completed', true, (CURRENT_DATE - INTERVAL '3 months 2 weeks')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000001', 'visit', 'Визит на 36 неделе', 'Подготовка к родам, КТГ', 36,
   CURRENT_DATE - INTERVAL '3 months 1 week', 'completed', true, (CURRENT_DATE - INTERVAL '3 months 1 week')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000001', 'birth', 'Роды', 'Естественные роды, ребёнок здоров', 40,
   CURRENT_DATE - INTERVAL '3 months', 'completed', true, (CURRENT_DATE - INTERVAL '3 months')::timestamptz, 'D0000000-0000-0000-0000-000000000001');

-- Infant events (mix of completed/upcoming)
INSERT INTO journey_events (journey_id, type, title, description, trigger_day, due_date, status, is_mandatory, completed_at, completed_by)
VALUES
  ('21000000-0000-0000-0000-000000000002', 'vaccination', 'БЦЖ + HepB (родильный дом)', 'Вакцинация в роддоме', 0,
   CURRENT_DATE - INTERVAL '3 months', 'completed', true, (CURRENT_DATE - INTERVAL '3 months')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000002', 'visit', 'Патронаж новорождённого', 'Визит педиатра на дом', 7,
   CURRENT_DATE - INTERVAL '2 months 3 weeks', 'completed', true, (CURRENT_DATE - INTERVAL '2 months 3 weeks')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000002', 'visit', 'Осмотр в 1 месяц', 'Антропометрия, оценка развития', 30,
   CURRENT_DATE - INTERVAL '2 months', 'completed', true, (CURRENT_DATE - INTERVAL '2 months')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000002', 'vaccination', 'HepB (2-я доза)', 'Гепатит B, 2-я доза', 30,
   CURRENT_DATE - INTERVAL '2 months', 'completed', true, (CURRENT_DATE - INTERVAL '2 months')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000002', 'visit', 'Осмотр в 2 месяца', 'Невролог, окулист', 60,
   CURRENT_DATE - INTERVAL '1 month', 'completed', true, (CURRENT_DATE - INTERVAL '1 month')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000002', 'vaccination', 'Пентаксим (1)', 'АКДС + полио + ХИБ', 60,
   CURRENT_DATE - INTERVAL '1 month', 'completed', true, (CURRENT_DATE - INTERVAL '1 month')::timestamptz, 'D0000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000002', 'visit', 'Осмотр в 3 месяца', 'Контроль развития, антропометрия', 90,
   CURRENT_DATE, 'due', true, NULL, NULL),
  ('21000000-0000-0000-0000-000000000002', 'vaccination', 'Пентаксим (2)', 'АКДС + полио + ХИБ — 2-я доза', 90,
   CURRENT_DATE + INTERVAL '3 days', 'upcoming', true, NULL, NULL),
  ('21000000-0000-0000-0000-000000000002', 'visit', 'Осмотр в 6 месяцев', 'Введение прикорма', 180,
   CURRENT_DATE + INTERVAL '3 months', 'upcoming', true, NULL, NULL),
  ('21000000-0000-0000-0000-000000000002', 'vaccination', 'Пентаксим (3) + PCV13', 'АКДС + пневмококк', 180,
   CURRENT_DATE + INTERVAL '3 months', 'upcoming', true, NULL, NULL);

-- ============================================
-- 3. GROWTH METRICS — birth + monthly
-- ============================================
DELETE FROM growth_metrics WHERE child_id = 'C0000000-0000-0000-0000-000000000001';
INSERT INTO growth_metrics (child_id, date, weight_kg, height_cm, head_cm, measured_by, notes)
VALUES
  ('C0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '3 months', 3.40, 51.0, 35.0, 'doctor', 'При рождении'),
  ('C0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 months 3 weeks', 3.60, 52.0, 35.5, 'doctor', 'Патронаж'),
  ('C0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 months', 4.50, 55.0, 37.0, 'doctor', 'Осмотр 1 мес'),
  ('C0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '1 month',  5.40, 58.0, 38.5, 'doctor', 'Осмотр 2 мес'),
  ('C0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 weeks',  5.80, 59.5, 39.0, 'parent', 'Домашнее взвешивание'),
  ('C0000000-0000-0000-0000-000000000001', CURRENT_DATE,                       6.20, 61.0, 40.0, 'doctor', 'Осмотр 3 мес');

-- ============================================
-- 4. MILESTONES
-- ============================================
DELETE FROM milestones WHERE child_id = 'C0000000-0000-0000-0000-000000000001';
INSERT INTO milestones (child_id, type, title, achieved_at, notes)
VALUES
  ('C0000000-0000-0000-0000-000000000001', 'social',  'Первая улыбка',          CURRENT_DATE - INTERVAL '6 weeks', 'Реакция на маму'),
  ('C0000000-0000-0000-0000-000000000001', 'motor',   'Удерживает голову',      CURRENT_DATE - INTERVAL '4 weeks', 'Уверенно на животе'),
  ('C0000000-0000-0000-0000-000000000001', 'social',  'Гулит и агукает',        CURRENT_DATE - INTERVAL '3 weeks', 'Реагирует на разговор'),
  ('C0000000-0000-0000-0000-000000000001', 'motor',   'Тянется к игрушке',      CURRENT_DATE - INTERVAL '1 week',  'Целенаправленные движения'),
  ('C0000000-0000-0000-0000-000000000001', 'social',  'Узнаёт родителей',       CURRENT_DATE - INTERVAL '5 days',  'Чёткая реакция на лица');

-- ============================================
-- 5. SLEEP LOGS — 30 дней (1 ночь + 2 дневных сна на день)
-- ============================================
DELETE FROM sleep_logs WHERE child_id = 'C0000000-0000-0000-0000-000000000001';

-- Ночные сны
INSERT INTO sleep_logs (child_id, date, sleep_start, sleep_end, type, wake_ups, quality, notes)
SELECT
  'C0000000-0000-0000-0000-000000000001',
  d::date,
  (d + TIME '21:30')::timestamptz,
  (d + INTERVAL '1 day' + TIME '07:00' - (random() * INTERVAL '30 minutes'))::timestamptz,
  'night',
  (random() * 3)::int,
  (ARRAY['good','good','fair','good','poor'])[1 + (random() * 4)::int],
  NULL
FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE - INTERVAL '1 day', INTERVAL '1 day') d;

-- Утренний сон
INSERT INTO sleep_logs (child_id, date, sleep_start, sleep_end, type, wake_ups, quality, notes)
SELECT
  'C0000000-0000-0000-0000-000000000001',
  d::date,
  (d + TIME '10:00')::timestamptz,
  (d + TIME '11:30')::timestamptz,
  'nap', 0,
  (ARRAY['good','good','fair'])[1 + (random() * 2)::int],
  NULL
FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') d;

-- Дневной сон
INSERT INTO sleep_logs (child_id, date, sleep_start, sleep_end, type, wake_ups, quality, notes)
SELECT
  'C0000000-0000-0000-0000-000000000001',
  d::date,
  (d + TIME '14:00')::timestamptz,
  (d + TIME '16:00')::timestamptz,
  'nap', 0,
  (ARRAY['good','good','fair'])[1 + (random() * 2)::int],
  NULL
FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') d;

-- ============================================
-- 6. FEEDING LOGS — 30 дней × 6 кормлений
-- ============================================
DELETE FROM feeding_logs WHERE child_id = 'C0000000-0000-0000-0000-000000000001';
INSERT INTO feeding_logs (child_id, type, details, timestamp, duration_minutes, notes)
SELECT
  'C0000000-0000-0000-0000-000000000001',
  CASE WHEN random() < 0.85 THEN 'breast' ELSE 'formula' END,
  CASE WHEN random() < 0.85
    THEN jsonb_build_object('side', (ARRAY['left','right','both'])[1 + (random() * 2)::int])
    ELSE jsonb_build_object('volume_ml', 90 + (random() * 30)::int)
  END,
  (d + (h * INTERVAL '1 hour'))::timestamptz,
  10 + (random() * 15)::int,
  NULL
FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') d
CROSS JOIN unnest(ARRAY[6, 9, 12, 15, 18, 22]) AS h;

-- ============================================
-- 7. MOOD LOGS — 30 дней для мамы
-- ============================================
DELETE FROM mood_logs WHERE user_id = 'D0000000-0000-0000-0000-000000000001'
  AND date >= CURRENT_DATE - INTERVAL '30 days';
INSERT INTO mood_logs (user_id, date, score, notes)
SELECT
  'D0000000-0000-0000-0000-000000000001',
  d::date,
  -- Тренд: первые недели после родов хуже, постепенно лучше
  LEAST(5, GREATEST(1, 2 + ((CURRENT_DATE - d::date) > 20)::int + (random() * 3)::int)),
  CASE
    WHEN (random() * 5)::int = 0 THEN 'Хорошо выспалась'
    WHEN (random() * 5)::int = 1 THEN 'Усталость от ночных кормлений'
    ELSE NULL
  END
FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') d
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. EPDS SCREENING — 1 запись (низкий риск)
-- ============================================
DELETE FROM epds_screenings WHERE user_id = 'D0000000-0000-0000-0000-000000000001';
INSERT INTO epds_screenings (user_id, date, answers, total_score, risk_level)
VALUES (
  'D0000000-0000-0000-0000-000000000001',
  CURRENT_DATE - INTERVAL '1 month',
  '{"q1":1,"q2":1,"q3":2,"q4":1,"q5":2,"q6":1,"q7":1,"q8":1,"q9":0,"q10":0}'::jsonb,
  10, 'moderate'
);

-- ============================================
-- 9. VACCINATIONS — 8 (часть done, часть upcoming)
-- ============================================
DELETE FROM vaccinations WHERE child_id = 'C0000000-0000-0000-0000-000000000001';
INSERT INTO vaccinations (child_id, vaccine_name, dose_number, scheduled_date, status, administered_date, batch_number, doctor_id, notes)
VALUES
  ('C0000000-0000-0000-0000-000000000001', 'БЦЖ',         1, CURRENT_DATE - INTERVAL '3 months',  'completed', CURRENT_DATE - INTERVAL '3 months', 'BCG-2026-A1', 'BD000000-0000-0000-0000-000000000001', 'Роддом'),
  ('C0000000-0000-0000-0000-000000000001', 'Гепатит B',   1, CURRENT_DATE - INTERVAL '3 months',  'completed', CURRENT_DATE - INTERVAL '3 months', 'HBV-2026-B2', 'BD000000-0000-0000-0000-000000000001', 'Роддом'),
  ('C0000000-0000-0000-0000-000000000001', 'Гепатит B',   2, CURRENT_DATE - INTERVAL '2 months',  'completed', CURRENT_DATE - INTERVAL '2 months', 'HBV-2026-C3', 'BD000000-0000-0000-0000-000000000001', NULL),
  ('C0000000-0000-0000-0000-000000000001', 'Пентаксим',   1, CURRENT_DATE - INTERVAL '1 month',   'completed', CURRENT_DATE - INTERVAL '1 month',  'PNT-2026-D4', 'BD000000-0000-0000-0000-000000000001', 'Без реакций'),
  ('C0000000-0000-0000-0000-000000000001', 'PCV13',       1, CURRENT_DATE - INTERVAL '1 month',   'completed', CURRENT_DATE - INTERVAL '1 month',  'PCV-2026-E5', 'BD000000-0000-0000-0000-000000000001', NULL),
  ('C0000000-0000-0000-0000-000000000001', 'Пентаксим',   2, CURRENT_DATE + INTERVAL '3 days',    'scheduled', NULL, NULL, 'BD000000-0000-0000-0000-000000000001', NULL),
  ('C0000000-0000-0000-0000-000000000001', 'PCV13',       2, CURRENT_DATE + INTERVAL '3 days',    'scheduled', NULL, NULL, 'BD000000-0000-0000-0000-000000000001', NULL),
  ('C0000000-0000-0000-0000-000000000001', 'Ротавирус',   1, CURRENT_DATE + INTERVAL '3 days',    'scheduled', NULL, NULL, 'BD000000-0000-0000-0000-000000000001', NULL),
  ('C0000000-0000-0000-0000-000000000001', 'Пентаксим',   3, CURRENT_DATE + INTERVAL '3 months',  'scheduled', NULL, NULL, 'BD000000-0000-0000-0000-000000000001', NULL);

-- ============================================
-- 10. APPOINTMENT SLOTS — для доктора Сауле, today + 7 дней
-- ============================================
DELETE FROM appointment_slots WHERE doctor_id = 'BD000000-0000-0000-0000-000000000001'
  AND date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days';

INSERT INTO appointment_slots (doctor_id, date, start_time, end_time, is_available)
SELECT
  'BD000000-0000-0000-0000-000000000001',
  d::date,
  (TIME '09:00' + (slot_idx * INTERVAL '30 minutes')),
  (TIME '09:00' + ((slot_idx + 1) * INTERVAL '30 minutes')),
  true
FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', INTERVAL '1 day') d
CROSS JOIN generate_series(0, 15) AS slot_idx
WHERE EXTRACT(DOW FROM d) NOT IN (0, 6); -- skip weekends

-- ============================================
-- 11. APPOINTMENTS — 5 (3 past completed, 1 today, 1 future)
-- ============================================
DELETE FROM appointments WHERE family_id = 'F0000000-0000-0000-0000-000000000001';

INSERT INTO appointments (id, family_id, doctor_id, child_id, status, appointment_date, start_time, end_time, visit_type, reason, notes, post_visit_notes, icd10_primary, completion_checklist)
VALUES
  -- Прошлые осмотры
  (gen_random_uuid(), 'F0000000-0000-0000-0000-000000000001', 'BD000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000001',
   'completed', CURRENT_DATE - INTERVAL '2 months 3 weeks', '10:00', '10:30', 'in_person',
   'Патронаж новорождённого', 'Первый осмотр на дому. Состояние удовлетворительное.',
   'Развитие соответствует возрасту. Рекомендации даны.',
   'Z00.1', '{"complaints":true,"exam":true,"diagnosis":true,"plan":true,"recommendations":true}'::jsonb),
  (gen_random_uuid(), 'F0000000-0000-0000-0000-000000000001', 'BD000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000001',
   'completed', CURRENT_DATE - INTERVAL '2 months', '11:00', '11:30', 'in_person',
   'Плановый осмотр 1 месяц', 'Антропометрия, проверка рефлексов.',
   'Амира 4.5 кг, 55 см. Развитие в норме.',
   'Z00.1', '{"complaints":true,"exam":true,"diagnosis":true,"plan":true,"recommendations":true}'::jsonb),
  (gen_random_uuid(), 'F0000000-0000-0000-0000-000000000001', 'BD000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000001',
   'completed', CURRENT_DATE - INTERVAL '1 month', '14:00', '14:30', 'in_person',
   'Плановый осмотр 2 месяца + вакцинация', 'Пентаксим (1) + PCV13 (1)',
   'Без реакций на вакцинацию.',
   'Z00.1', '{"complaints":true,"exam":true,"diagnosis":true,"plan":true,"recommendations":true}'::jsonb),
  -- Сегодняшний приём
  (gen_random_uuid(), 'F0000000-0000-0000-0000-000000000001', 'BD000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000001',
   'confirmed', CURRENT_DATE, '15:00', '15:30', 'in_person',
   'Плановый осмотр 3 месяца', 'Контроль развития, антропометрия',
   NULL, NULL, '{}'::jsonb),
  -- Будущий
  (gen_random_uuid(), 'F0000000-0000-0000-0000-000000000001', 'BD000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000001',
   'requested', CURRENT_DATE + INTERVAL '3 days', '10:30', '11:00', 'in_person',
   'Вакцинация: Пентаксим (2) + PCV13 (2)', NULL,
   NULL, NULL, '{}'::jsonb);

-- ============================================
-- 12. PRESCRIPTIONS — 2 активных (vit D ребёнку + железо маме)
-- Триггер tr_prescriptions_alert автогенерирует записи в prescription_alerts
-- ============================================
DELETE FROM prescriptions WHERE family_id = 'F0000000-0000-0000-0000-000000000001';

INSERT INTO prescriptions (id, family_id, child_id, medication, dosage, frequency, time_of_day, start_date, end_date, instructions, is_active, prescribed_by, inn_name, dose_value, dose_unit, route, doctor_id)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'F0000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000001',
   'Аквадетрим', '1 капля', 'daily', ARRAY['09:00'],
   CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '6 months',
   'Профилактика рахита. Капать в ложечку с водой утром.',
   true, 'D0000000-0000-0000-0000-000000000004',
   'Колекальциферол', 500, 'IU', 'per_os', 'BD000000-0000-0000-0000-000000000001'),
  ('11111111-0000-0000-0000-000000000002', 'F0000000-0000-0000-0000-000000000001', NULL,
   'Сорбифер Дурулес', '1 таблетка', 'twice_daily', ARRAY['09:00','21:00'],
   CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '2 months',
   'Послеродовая профилактика анемии. Принимать с витамином C.',
   true, 'D0000000-0000-0000-0000-000000000004',
   'Железа сульфат', 100, 'mg', 'per_os', 'BD000000-0000-0000-0000-000000000001');

-- ============================================
-- 13. DOSE LOGS — 14 дней по обоим назначениям
-- ============================================
DELETE FROM dose_logs WHERE family_id = 'F0000000-0000-0000-0000-000000000001';

-- Vit D — 1 раз в день, последние 14 дней
INSERT INTO dose_logs (prescription_id, family_id, scheduled_at, status, confirmed_at, confirmed_by)
SELECT
  '11111111-0000-0000-0000-000000000001',
  'F0000000-0000-0000-0000-000000000001',
  (d + TIME '09:00')::timestamptz,
  CASE
    WHEN d::date = CURRENT_DATE THEN 'pending'
    WHEN random() < 0.85 THEN 'confirmed'
    WHEN random() < 0.5  THEN 'missed'
    ELSE 'skipped'
  END,
  CASE WHEN random() < 0.85 AND d::date < CURRENT_DATE
       THEN (d + TIME '09:30')::timestamptz ELSE NULL END,
  CASE WHEN random() < 0.85 AND d::date < CURRENT_DATE
       THEN 'D0000000-0000-0000-0000-000000000001' ELSE NULL END
FROM generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, INTERVAL '1 day') d;

-- Железо — 2 раза в день, последние 14 дней
INSERT INTO dose_logs (prescription_id, family_id, scheduled_at, status, confirmed_at, confirmed_by)
SELECT
  '11111111-0000-0000-0000-000000000002',
  'F0000000-0000-0000-0000-000000000001',
  (d + h)::timestamptz,
  CASE
    WHEN d::date = CURRENT_DATE AND h = TIME '21:00' THEN 'pending'
    WHEN random() < 0.78 THEN 'confirmed'
    ELSE 'missed'
  END,
  CASE WHEN random() < 0.78 AND (d::date < CURRENT_DATE OR h < TIME '21:00')
       THEN (d + h + INTERVAL '15 minutes')::timestamptz ELSE NULL END,
  CASE WHEN random() < 0.78 AND (d::date < CURRENT_DATE OR h < TIME '21:00')
       THEN 'D0000000-0000-0000-0000-000000000001' ELSE NULL END
FROM generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, INTERVAL '1 day') d
CROSS JOIN unnest(ARRAY[TIME '09:00', TIME '21:00']) h;

-- ============================================
-- 14. LAB RESULTS — 3 (TSH+ТТГ скрининг новорождённого, ОАК мамы, моча мамы)
-- ============================================
DELETE FROM lab_results WHERE family_id = 'F0000000-0000-0000-0000-000000000001';

INSERT INTO lab_results (family_id, child_id, lab_provider, order_id, status, results_json, received_at)
VALUES
  ('F0000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000001',
   'Olymp', 'OL-2026-001', 'completed',
   '{"tests":[{"name":"ТТГ","value":2.1,"unit":"мЕд/л","ref":"0.4-4.0","flag":"normal"},{"name":"Фенилаланин","value":1.2,"unit":"мг/дл","ref":"<2.0","flag":"normal"}]}'::jsonb,
   (CURRENT_DATE - INTERVAL '2 months 3 weeks')::timestamptz),
  ('F0000000-0000-0000-0000-000000000001', NULL,
   'Invivo', 'IN-2026-002', 'completed',
   '{"tests":[{"name":"Hb","value":105,"unit":"г/л","ref":"120-150","flag":"low"},{"name":"Эритроциты","value":3.8,"unit":"×10^12/л","ref":"3.9-5.0","flag":"low"},{"name":"Ферритин","value":18,"unit":"нг/мл","ref":"30-150","flag":"low"}]}'::jsonb,
   (CURRENT_DATE - INTERVAL '5 weeks')::timestamptz),
  ('F0000000-0000-0000-0000-000000000001', NULL,
   'Olymp', 'OL-2026-003', 'processing',
   NULL,
   NULL);

-- ============================================
-- 15. DOCUMENTS — 5 файлов
-- ============================================
DELETE FROM documents WHERE family_id = 'F0000000-0000-0000-0000-000000000001';

INSERT INTO documents (family_id, child_id, type, title, description, file_url, file_type, file_size, tags, uploaded_by)
VALUES
  ('F0000000-0000-0000-0000-000000000001', NULL, 'ultrasound',  'УЗИ 2-го триместра',
   'Анатомический скрининг, 20 недель',
   'https://demo.umai.health/files/uzi-20w.pdf', 'application/pdf', 524288,
   ARRAY['беременность','скрининг','уzи'],
   'D0000000-0000-0000-0000-000000000001'),
  ('F0000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000001', 'analysis',  'ТТГ + фенилаланин (скрининг)',
   'Скрининг новорождённого',
   'https://demo.umai.health/files/screening.pdf', 'application/pdf', 102400,
   ARRAY['скрининг','новорождённый'],
   'D0000000-0000-0000-0000-000000000004'),
  ('F0000000-0000-0000-0000-000000000001', NULL, 'analysis',  'ОАК с лейкоформулой (мама)',
   'Послеродовое обследование',
   'https://demo.umai.health/files/oak-postpartum.pdf', 'application/pdf', 81920,
   ARRAY['мама','анализ','анемия'],
   'D0000000-0000-0000-0000-000000000004'),
  ('F0000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000001', 'certificate',  'Прививочный сертификат',
   'Форма 063/у — БЦЖ, HepB, Пентаксим, PCV13',
   'https://demo.umai.health/files/vaccine-cert.pdf', 'application/pdf', 65536,
   ARRAY['вакцинация','сертификат'],
   'D0000000-0000-0000-0000-000000000004'),
  ('F0000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000001', 'discharge',  'Выписка из роддома',
   'Эпикриз перинатального периода',
   'https://demo.umai.health/files/discharge.pdf', 'application/pdf', 256000,
   ARRAY['роды','эпикриз'],
   'D0000000-0000-0000-0000-000000000001');

-- ============================================
-- ИТОГ
-- ============================================
DO $$
DECLARE
  v_je int; v_gm int; v_ml int; v_sl int; v_fl int; v_mo int;
  v_vc int; v_ap int; v_pr int; v_dl int; v_lr int; v_dc int;
BEGIN
  SELECT count(*) INTO v_je FROM journey_events WHERE journey_id IN ('21000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000002');
  SELECT count(*) INTO v_gm FROM growth_metrics WHERE child_id = 'C0000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_ml FROM milestones WHERE child_id = 'C0000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_sl FROM sleep_logs WHERE child_id = 'C0000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_fl FROM feeding_logs WHERE child_id = 'C0000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_mo FROM mood_logs WHERE user_id = 'D0000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_vc FROM vaccinations WHERE child_id = 'C0000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_ap FROM appointments WHERE family_id = 'F0000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_pr FROM prescriptions WHERE family_id = 'F0000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_dl FROM dose_logs WHERE family_id = 'F0000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_lr FROM lab_results WHERE family_id = 'F0000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_dc FROM documents WHERE family_id = 'F0000000-0000-0000-0000-000000000001';
  RAISE NOTICE '029 demo family seed: events=%, growth=%, milestones=%, sleep=%, feeding=%, mood=%, vac=%, appts=%, rx=%, doses=%, labs=%, docs=%',
    v_je, v_gm, v_ml, v_sl, v_fl, v_mo, v_vc, v_ap, v_pr, v_dl, v_lr, v_dc;
END $$;
