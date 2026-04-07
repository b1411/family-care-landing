-- ============================================
-- Family Care OS — Seed Data
-- Run after all migrations: supabase db reset
-- ============================================

-- NOTE: This seed relies on Supabase auth.users being created via the dashboard or CLI.
-- The UUIDs below are deterministic for reproducible development.

-- ============================================
-- 1. TEST CLINIC
-- ============================================
INSERT INTO clinics (id, name, slug, logo_url, timezone, phone, address, theme_json, settings_json) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Клиника Мать и Дитя', 'mat-i-ditya', NULL, 'Asia/Almaty', '+77011234567', 'г. Алматы, ул. Абая 15',
    '{"primaryHue": 160, "secondaryHue": 340}',
    '{"language": "ru", "sms_provider": "mobizon", "appointment_duration_min": 30}'
  );

-- ============================================
-- 2. TEST USERS (mirroring auth.users that would be created via Supabase Auth)
-- In real setup, run: supabase auth admin create-user first, then insert here
-- ============================================

-- Clinic Admin
INSERT INTO users (id, email, phone, role, clinic_id, first_name, last_name) VALUES
  ('u0000000-0000-0000-0000-000000000001', 'admin@test.familycare.kz', '+77010000001', 'admin', 'c0000000-0000-0000-0000-000000000001', 'Арман', 'Нурланов');

-- Coordinator
INSERT INTO users (id, email, phone, role, clinic_id, first_name, last_name) VALUES
  ('u0000000-0000-0000-0000-000000000002', 'coordinator@test.familycare.kz', '+77010000002', 'coordinator', 'c0000000-0000-0000-0000-000000000001', 'Айгуль', 'Сериккызы');

-- Gynecologist
INSERT INTO users (id, email, phone, role, clinic_id, first_name, last_name) VALUES
  ('u0000000-0000-0000-0000-000000000003', 'gynecologist@test.familycare.kz', '+77010000003', 'doctor', 'c0000000-0000-0000-0000-000000000001', 'Марина', 'Ким');

-- Pediatrician
INSERT INTO users (id, email, phone, role, clinic_id, first_name, last_name) VALUES
  ('u0000000-0000-0000-0000-000000000004', 'pediatrician@test.familycare.kz', '+77010000004', 'doctor', 'c0000000-0000-0000-0000-000000000001', 'Асем', 'Толеубаева');

-- Mother (Family 1)
INSERT INTO users (id, email, phone, role, clinic_id, first_name, last_name) VALUES
  ('u0000000-0000-0000-0000-000000000010', 'mama1@test.familycare.kz', '+77020000010', 'mother', 'c0000000-0000-0000-0000-000000000001', 'Дана', 'Касымова');

-- Father (Family 1)
INSERT INTO users (id, email, phone, role, clinic_id, first_name, last_name) VALUES
  ('u0000000-0000-0000-0000-000000000011', 'papa1@test.familycare.kz', '+77020000011', 'father', 'c0000000-0000-0000-0000-000000000001', 'Ерлан', 'Касымов');

-- Mother (Family 2 — pregnancy)
INSERT INTO users (id, email, phone, role, clinic_id, first_name, last_name) VALUES
  ('u0000000-0000-0000-0000-000000000020', 'mama2@test.familycare.kz', '+77020000020', 'mother', 'c0000000-0000-0000-0000-000000000001', 'Алия', 'Мухамедова');

-- Mother (Family 3 — inactive for reactivation testing)
INSERT INTO users (id, email, phone, role, clinic_id, first_name, last_name) VALUES
  ('u0000000-0000-0000-0000-000000000030', 'mama3@test.familycare.kz', '+77020000030', 'mother', 'c0000000-0000-0000-0000-000000000001', 'Жанна', 'Оразбаева');

-- ============================================
-- 3. DOCTORS
-- ============================================
INSERT INTO doctors (id, clinic_id, user_id, specialty, bio, experience_years, consultation_fee) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000003',
   'gynecologist', 'Акушер-гинеколог высшей категории, стаж более 15 лет', 15, 15000),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000004',
   'pediatrician', 'Педиатр первой категории, специализация — неонатология', 8, 12000);

-- ============================================
-- 4. FAMILIES
-- ============================================

-- Family 1: has infant (baby born 3 months ago)
INSERT INTO families (id, clinic_id, primary_parent_id, secondary_parent_id, invite_code, status) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
   'u0000000-0000-0000-0000-000000000010', 'u0000000-0000-0000-0000-000000000011', 'INV-ABC123', 'active');

-- Family 2: pregnant mother, no partner registered
INSERT INTO families (id, clinic_id, primary_parent_id, status) VALUES
  ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001',
   'u0000000-0000-0000-0000-000000000020', 'active');

-- Family 3: inactive family (for reactivation task testing)
INSERT INTO families (id, clinic_id, primary_parent_id, status) VALUES
  ('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001',
   'u0000000-0000-0000-0000-000000000030', 'inactive');

-- ============================================
-- 5. MOTHER PROFILES
-- ============================================
INSERT INTO mother_profiles (id, family_id, user_id, lmp_date, edd_date, blood_type, rh_factor, allergies, chronic_conditions) VALUES
  -- Family 1: delivered 3 months ago (LMP ~12 months ago)
  ('mp000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000010',
   (CURRENT_DATE - INTERVAL '12 months')::DATE, (CURRENT_DATE - INTERVAL '3 months')::DATE,
   'A', 'positive', '{}', '{}'),
  -- Family 2: currently 20 weeks pregnant
  ('mp000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000020',
   (CURRENT_DATE - INTERVAL '140 days')::DATE, (CURRENT_DATE + INTERVAL '140 days')::DATE,
   'O', 'negative', ARRAY['Пенициллин'], ARRAY['Анемия']);

-- ============================================
-- 6. CHILD PROFILES
-- ============================================
INSERT INTO child_profiles (id, family_id, name, dob, gender, birth_weight, birth_height, apgar_1min, apgar_5min, blood_type) VALUES
  ('ch000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Амир',
   (CURRENT_DATE - INTERVAL '3 months')::DATE, 'male', 3.45, 51, 8, 9, 'A');

-- ============================================
-- 7. JOURNEY TEMPLATES (system defaults)
-- ============================================
INSERT INTO journey_templates (id, clinic_id, type, name, description, events_json, is_default) VALUES
  ('jt000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'pregnancy',
   'Беременность — стандартный маршрут КЗ', 'Казахстанский протокол ведения беременности',
   '[
     {"type":"consultation","title":"Первый визит гинеколога","trigger_week":6,"is_mandatory":true},
     {"type":"analysis","title":"ОАК, биохимия, группа крови, резус","trigger_week":8,"is_mandatory":true},
     {"type":"analysis","title":"TORCH-инфекции","trigger_week":8,"is_mandatory":true},
     {"type":"screening","title":"Скрининг 1 триместра (УЗИ + РАРР-А + β-ХГЧ)","trigger_week":11,"is_mandatory":true},
     {"type":"consultation","title":"Визит гинеколога (результаты скрининга)","trigger_week":12,"is_mandatory":true},
     {"type":"consultation","title":"Визит гинеколога","trigger_week":16,"is_mandatory":true},
     {"type":"analysis","title":"ОАК, ОАМ","trigger_week":16,"is_mandatory":true},
     {"type":"screening","title":"Скрининг 2 триместра (АФП + β-ХГЧ + эстриол)","trigger_week":18,"is_mandatory":true},
     {"type":"ultrasound","title":"УЗИ 2 триместра (анатомия)","trigger_week":20,"is_mandatory":true},
     {"type":"consultation","title":"Визит гинеколога","trigger_week":20,"is_mandatory":true},
     {"type":"consultation","title":"Визит гинеколога","trigger_week":24,"is_mandatory":true},
     {"type":"analysis","title":"ОАК, глюкозотолерантный тест","trigger_week":24,"is_mandatory":true},
     {"type":"consultation","title":"Визит гинеколога","trigger_week":28,"is_mandatory":true},
     {"type":"analysis","title":"ОАК, Rh-антитела (при Rh-)","trigger_week":28,"is_mandatory":true},
     {"type":"consultation","title":"Визит гинеколога","trigger_week":30,"is_mandatory":true},
     {"type":"ultrasound","title":"УЗИ 3 триместра + КТГ","trigger_week":32,"is_mandatory":true},
     {"type":"consultation","title":"Визит гинеколога","trigger_week":34,"is_mandatory":true},
     {"type":"analysis","title":"ОАК, коагулограмма","trigger_week":34,"is_mandatory":true},
     {"type":"consultation","title":"Визит гинеколога","trigger_week":36,"is_mandatory":true},
     {"type":"consultation","title":"Визит гинеколога","trigger_week":37,"is_mandatory":true},
     {"type":"consultation","title":"Визит гинеколога","trigger_week":38,"is_mandatory":true},
     {"type":"consultation","title":"Визит гинеколога","trigger_week":39,"is_mandatory":true},
     {"type":"consultation","title":"Визит гинеколога (ПДР)","trigger_week":40,"is_mandatory":true}
   ]'::jsonb, true),

  ('jt000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'infant',
   'Младенец 0–12 мес — стандартный маршрут КЗ', 'Наблюдение новорожденного по казахстанскому протоколу',
   '[
     {"type":"checkup","title":"Осмотр неонатолога (роддом)","trigger_day":1,"is_mandatory":true},
     {"type":"checkup","title":"Патронаж на дому (день 3–5)","trigger_day":4,"is_mandatory":true},
     {"type":"checkup","title":"Осмотр педиатра (1 мес)","trigger_day":30,"is_mandatory":true},
     {"type":"specialist","title":"Невролог (1 мес)","trigger_day":30,"is_mandatory":true},
     {"type":"specialist","title":"Офтальмолог (1 мес)","trigger_day":30,"is_mandatory":true},
     {"type":"specialist","title":"Ортопед (1 мес)","trigger_day":30,"is_mandatory":true},
     {"type":"ultrasound","title":"УЗИ головного мозга (1 мес)","trigger_day":30,"is_mandatory":true},
     {"type":"ultrasound","title":"УЗИ тазобедренных суставов (1 мес)","trigger_day":30,"is_mandatory":true},
     {"type":"analysis","title":"ОАК, ОАМ (1 мес)","trigger_day":30,"is_mandatory":true},
     {"type":"checkup","title":"Осмотр педиатра (2 мес)","trigger_day":60,"is_mandatory":true},
     {"type":"checkup","title":"Осмотр педиатра (3 мес)","trigger_day":90,"is_mandatory":true},
     {"type":"analysis","title":"ОАК (3 мес)","trigger_day":90,"is_mandatory":true},
     {"type":"checkup","title":"Осмотр педиатра (4 мес)","trigger_day":120,"is_mandatory":true},
     {"type":"checkup","title":"Осмотр педиатра (5 мес)","trigger_day":150,"is_mandatory":false},
     {"type":"checkup","title":"Осмотр педиатра (6 мес)","trigger_day":180,"is_mandatory":true},
     {"type":"specialist","title":"Невролог (6 мес)","trigger_day":180,"is_mandatory":true},
     {"type":"analysis","title":"ОАК (6 мес)","trigger_day":180,"is_mandatory":true},
     {"type":"checkup","title":"Осмотр педиатра (9 мес)","trigger_day":270,"is_mandatory":true},
     {"type":"specialist","title":"Стоматолог (9 мес)","trigger_day":270,"is_mandatory":false},
     {"type":"checkup","title":"Осмотр педиатра (12 мес)","trigger_day":365,"is_mandatory":true},
     {"type":"specialist","title":"Невролог (12 мес)","trigger_day":365,"is_mandatory":true},
     {"type":"specialist","title":"Офтальмолог (12 мес)","trigger_day":365,"is_mandatory":true},
     {"type":"specialist","title":"ЛОР (12 мес)","trigger_day":365,"is_mandatory":true},
     {"type":"analysis","title":"ОАК, ОАМ, глюкоза (12 мес)","trigger_day":365,"is_mandatory":true}
   ]'::jsonb, true),

  ('jt000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'toddler',
   'Тоддлер 12–24 мес — стандартный маршрут КЗ', 'Наблюдение ребёнка до 2 лет',
   '[
     {"type":"checkup","title":"Осмотр педиатра (15 мес)","trigger_day":456,"is_mandatory":false},
     {"type":"checkup","title":"Осмотр педиатра (18 мес)","trigger_day":547,"is_mandatory":true},
     {"type":"specialist","title":"Стоматолог (18 мес)","trigger_day":547,"is_mandatory":true},
     {"type":"checkup","title":"Осмотр педиатра (21 мес)","trigger_day":638,"is_mandatory":false},
     {"type":"checkup","title":"Осмотр педиатра (24 мес)","trigger_day":730,"is_mandatory":true},
     {"type":"specialist","title":"Невролог (24 мес)","trigger_day":730,"is_mandatory":true},
     {"type":"specialist","title":"Офтальмолог (24 мес)","trigger_day":730,"is_mandatory":true},
     {"type":"specialist","title":"Стоматолог (24 мес)","trigger_day":730,"is_mandatory":true},
     {"type":"analysis","title":"ОАК, ОАМ (24 мес)","trigger_day":730,"is_mandatory":true},
     {"type":"milestone","title":"Оценка речи и моторики (24 мес)","trigger_day":730,"is_mandatory":true}
   ]'::jsonb, true),

  ('jt000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'postpartum',
   'Послеродовый период — мать', 'Наблюдение матери после родов',
   '[
     {"type":"checkup","title":"Осмотр гинеколога (2 нед после родов)","trigger_day":14,"is_mandatory":true},
     {"type":"checkup","title":"Осмотр гинеколога (6 нед после родов)","trigger_day":42,"is_mandatory":true},
     {"type":"analysis","title":"ОАК, ОАМ (6 нед)","trigger_day":42,"is_mandatory":true},
     {"type":"ultrasound","title":"УЗИ малого таза (6 нед)","trigger_day":42,"is_mandatory":true},
     {"type":"checkup","title":"Осмотр гинеколога (3 мес после родов)","trigger_day":90,"is_mandatory":false},
     {"type":"checkup","title":"Осмотр гинеколога (6 мес после родов)","trigger_day":180,"is_mandatory":true}
   ]'::jsonb, true);

-- ============================================
-- 8. JOURNEYS (active care plans)
-- ============================================

-- Family 1: completed pregnancy + active infant journey
INSERT INTO journeys (id, family_id, template_id, child_id, type, status, started_at, completed_at) VALUES
  ('j0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'jt000000-0000-0000-0000-000000000001',
   NULL, 'pregnancy', 'completed', (CURRENT_DATE - INTERVAL '12 months')::TIMESTAMPTZ, (CURRENT_DATE - INTERVAL '3 months')::TIMESTAMPTZ);

INSERT INTO journeys (id, family_id, template_id, child_id, type, status, started_at) VALUES
  ('j0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'jt000000-0000-0000-0000-000000000002',
   'ch000000-0000-0000-0000-000000000001', 'infant', 'active', (CURRENT_DATE - INTERVAL '3 months')::TIMESTAMPTZ);

-- Family 2: active pregnancy journey
INSERT INTO journeys (id, family_id, template_id, type, status, started_at) VALUES
  ('j0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'jt000000-0000-0000-0000-000000000001',
   'pregnancy', 'active', (CURRENT_DATE - INTERVAL '140 days')::TIMESTAMPTZ);

-- ============================================
-- 9. JOURNEY EVENTS — Family 2 (pregnancy, 20 weeks)
-- ============================================

-- Past events (completed / overdue)
INSERT INTO journey_events (journey_id, type, title, trigger_week, due_date, status, is_mandatory, completed_at) VALUES
  ('j0000000-0000-0000-0000-000000000003', 'consultation', 'Первый визит гинеколога', 6,
   (CURRENT_DATE - INTERVAL '98 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '97 days')::TIMESTAMPTZ),
  ('j0000000-0000-0000-0000-000000000003', 'analysis', 'ОАК, биохимия, группа крови, резус', 8,
   (CURRENT_DATE - INTERVAL '84 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '82 days')::TIMESTAMPTZ),
  ('j0000000-0000-0000-0000-000000000003', 'analysis', 'TORCH-инфекции', 8,
   (CURRENT_DATE - INTERVAL '84 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '82 days')::TIMESTAMPTZ),
  ('j0000000-0000-0000-0000-000000000003', 'screening', 'Скрининг 1 триместра (УЗИ + РАРР-А + β-ХГЧ)', 11,
   (CURRENT_DATE - INTERVAL '63 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '61 days')::TIMESTAMPTZ),
  ('j0000000-0000-0000-0000-000000000003', 'consultation', 'Визит гинеколога (результаты скрининга)', 12,
   (CURRENT_DATE - INTERVAL '56 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '56 days')::TIMESTAMPTZ),
  ('j0000000-0000-0000-0000-000000000003', 'consultation', 'Визит гинеколога', 16,
   (CURRENT_DATE - INTERVAL '28 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '27 days')::TIMESTAMPTZ),
  ('j0000000-0000-0000-0000-000000000003', 'analysis', 'ОАК, ОАМ', 16,
   (CURRENT_DATE - INTERVAL '28 days')::DATE, 'overdue', true, NULL),
  ('j0000000-0000-0000-0000-000000000003', 'screening', 'Скрининг 2 триместра (АФП + β-ХГЧ + эстриол)', 18,
   (CURRENT_DATE - INTERVAL '14 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '13 days')::TIMESTAMPTZ);

-- Due today
INSERT INTO journey_events (journey_id, type, title, trigger_week, due_date, status, is_mandatory) VALUES
  ('j0000000-0000-0000-0000-000000000003', 'ultrasound', 'УЗИ 2 триместра (анатомия)', 20,
   CURRENT_DATE, 'due', true),
  ('j0000000-0000-0000-0000-000000000003', 'consultation', 'Визит гинеколога', 20,
   CURRENT_DATE, 'due', true);

-- Future events
INSERT INTO journey_events (journey_id, type, title, trigger_week, due_date, status, is_mandatory) VALUES
  ('j0000000-0000-0000-0000-000000000003', 'consultation', 'Визит гинеколога', 24,
   (CURRENT_DATE + INTERVAL '28 days')::DATE, 'upcoming', true),
  ('j0000000-0000-0000-0000-000000000003', 'analysis', 'ОАК, глюкозотолерантный тест', 24,
   (CURRENT_DATE + INTERVAL '28 days')::DATE, 'upcoming', true),
  ('j0000000-0000-0000-0000-000000000003', 'consultation', 'Визит гинеколога', 28,
   (CURRENT_DATE + INTERVAL '56 days')::DATE, 'upcoming', true),
  ('j0000000-0000-0000-0000-000000000003', 'consultation', 'Визит гинеколога', 30,
   (CURRENT_DATE + INTERVAL '70 days')::DATE, 'upcoming', true),
  ('j0000000-0000-0000-0000-000000000003', 'ultrasound', 'УЗИ 3 триместра + КТГ', 32,
   (CURRENT_DATE + INTERVAL '84 days')::DATE, 'upcoming', true),
  ('j0000000-0000-0000-0000-000000000003', 'consultation', 'Визит гинеколога (ПДР)', 40,
   (CURRENT_DATE + INTERVAL '140 days')::DATE, 'upcoming', true);

-- ============================================
-- 10. JOURNEY EVENTS — Family 1 infant (3 months old)
-- ============================================
INSERT INTO journey_events (journey_id, type, title, trigger_day, due_date, status, is_mandatory, completed_at) VALUES
  ('j0000000-0000-0000-0000-000000000002', 'checkup', 'Осмотр неонатолога (роддом)', 1,
   (CURRENT_DATE - INTERVAL '89 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '89 days')::TIMESTAMPTZ),
  ('j0000000-0000-0000-0000-000000000002', 'checkup', 'Патронаж на дому (день 3–5)', 4,
   (CURRENT_DATE - INTERVAL '86 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '86 days')::TIMESTAMPTZ),
  ('j0000000-0000-0000-0000-000000000002', 'checkup', 'Осмотр педиатра (1 мес)', 30,
   (CURRENT_DATE - INTERVAL '60 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '59 days')::TIMESTAMPTZ),
  ('j0000000-0000-0000-0000-000000000002', 'specialist', 'Невролог (1 мес)', 30,
   (CURRENT_DATE - INTERVAL '60 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '58 days')::TIMESTAMPTZ),
  ('j0000000-0000-0000-0000-000000000002', 'specialist', 'Офтальмолог (1 мес)', 30,
   (CURRENT_DATE - INTERVAL '60 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '57 days')::TIMESTAMPTZ),
  ('j0000000-0000-0000-0000-000000000002', 'specialist', 'Ортопед (1 мес)', 30,
   (CURRENT_DATE - INTERVAL '60 days')::DATE, 'overdue', true, NULL),
  ('j0000000-0000-0000-0000-000000000002', 'ultrasound', 'УЗИ головного мозга (1 мес)', 30,
   (CURRENT_DATE - INTERVAL '60 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '59 days')::TIMESTAMPTZ),
  ('j0000000-0000-0000-0000-000000000002', 'checkup', 'Осмотр педиатра (2 мес)', 60,
   (CURRENT_DATE - INTERVAL '30 days')::DATE, 'completed', true, (CURRENT_DATE - INTERVAL '29 days')::TIMESTAMPTZ);

-- Due now
INSERT INTO journey_events (journey_id, type, title, trigger_day, due_date, status, is_mandatory) VALUES
  ('j0000000-0000-0000-0000-000000000002', 'checkup', 'Осмотр педиатра (3 мес)', 90,
   CURRENT_DATE, 'due', true),
  ('j0000000-0000-0000-0000-000000000002', 'analysis', 'ОАК (3 мес)', 90,
   CURRENT_DATE, 'due', true);

-- Future
INSERT INTO journey_events (journey_id, type, title, trigger_day, due_date, status, is_mandatory) VALUES
  ('j0000000-0000-0000-0000-000000000002', 'checkup', 'Осмотр педиатра (4 мес)', 120,
   (CURRENT_DATE + INTERVAL '30 days')::DATE, 'upcoming', true),
  ('j0000000-0000-0000-0000-000000000002', 'checkup', 'Осмотр педиатра (6 мес)', 180,
   (CURRENT_DATE + INTERVAL '90 days')::DATE, 'upcoming', true),
  ('j0000000-0000-0000-0000-000000000002', 'specialist', 'Невролог (6 мес)', 180,
   (CURRENT_DATE + INTERVAL '90 days')::DATE, 'upcoming', true),
  ('j0000000-0000-0000-0000-000000000002', 'checkup', 'Осмотр педиатра (12 мес)', 365,
   (CURRENT_DATE + INTERVAL '275 days')::DATE, 'upcoming', true);

-- ============================================
-- 11. VACCINATIONS — Family 1 child
-- ============================================
INSERT INTO vaccinations (child_id, vaccine_name, dose_number, scheduled_date, status, administered_date, doctor_id) VALUES
  ('ch000000-0000-0000-0000-000000000001', 'БЦЖ', 1,
   (CURRENT_DATE - INTERVAL '89 days')::DATE, 'completed', (CURRENT_DATE - INTERVAL '89 days')::DATE, 'd0000000-0000-0000-0000-000000000002'),
  ('ch000000-0000-0000-0000-000000000001', 'Гепатит B (1-я)', 1,
   (CURRENT_DATE - INTERVAL '89 days')::DATE, 'completed', (CURRENT_DATE - INTERVAL '89 days')::DATE, 'd0000000-0000-0000-0000-000000000002'),
  ('ch000000-0000-0000-0000-000000000001', 'АКДС-ГепВ-Хиб (1-я)', 1,
   (CURRENT_DATE - INTERVAL '29 days')::DATE, 'completed', (CURRENT_DATE - INTERVAL '28 days')::DATE, 'd0000000-0000-0000-0000-000000000002'),
  ('ch000000-0000-0000-0000-000000000001', 'ИПВ (1-я)', 1,
   (CURRENT_DATE - INTERVAL '29 days')::DATE, 'completed', (CURRENT_DATE - INTERVAL '28 days')::DATE, 'd0000000-0000-0000-0000-000000000002'),
  ('ch000000-0000-0000-0000-000000000001', 'Пневмококк PCV13 (1-я)', 1,
   (CURRENT_DATE - INTERVAL '29 days')::DATE, 'completed', (CURRENT_DATE - INTERVAL '28 days')::DATE, 'd0000000-0000-0000-0000-000000000002'),
  ('ch000000-0000-0000-0000-000000000001', 'Гепатит B (2-я)', 2,
   (CURRENT_DATE - INTERVAL '29 days')::DATE, 'completed', (CURRENT_DATE - INTERVAL '28 days')::DATE, 'd0000000-0000-0000-0000-000000000002'),
  -- Upcoming at 3 months
  ('ch000000-0000-0000-0000-000000000001', 'АКДС-ГепВ-Хиб (2-я)', 2,
   CURRENT_DATE, 'scheduled', NULL, NULL),
  ('ch000000-0000-0000-0000-000000000001', 'ИПВ (2-я)', 2,
   CURRENT_DATE, 'scheduled', NULL, NULL),
  ('ch000000-0000-0000-0000-000000000001', 'Пневмококк PCV13 (2-я)', 2,
   CURRENT_DATE, 'scheduled', NULL, NULL),
  -- Future at 4 months
  ('ch000000-0000-0000-0000-000000000001', 'АКДС-ГепВ-Хиб (3-я)', 3,
   (CURRENT_DATE + INTERVAL '30 days')::DATE, 'scheduled', NULL, NULL),
  ('ch000000-0000-0000-0000-000000000001', 'ИПВ (3-я)', 3,
   (CURRENT_DATE + INTERVAL '30 days')::DATE, 'scheduled', NULL, NULL),
  -- Future at 12 months
  ('ch000000-0000-0000-0000-000000000001', 'КПК (1-я)', 1,
   (CURRENT_DATE + INTERVAL '275 days')::DATE, 'scheduled', NULL, NULL),
  ('ch000000-0000-0000-0000-000000000001', 'Пневмококк PCV13 (3-я)', 3,
   (CURRENT_DATE + INTERVAL '275 days')::DATE, 'scheduled', NULL, NULL);

-- ============================================
-- 12. PRESCRIPTIONS & DOSE LOGS
-- ============================================

-- Vitamin D3 for the infant
INSERT INTO prescriptions (id, family_id, child_id, medication, dosage, frequency, time_of_day, start_date, is_active, prescribed_by) VALUES
  ('rx000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'ch000000-0000-0000-0000-000000000001',
   'Витамин D3 (Аквадетрим)', '500 МЕ (1 капля)', 'daily', ARRAY['morning'], (CURRENT_DATE - INTERVAL '85 days')::DATE, true, 'u0000000-0000-0000-0000-000000000004');

-- Iron supplement for pregnant mother (Family 2)
INSERT INTO prescriptions (id, family_id, medication, dosage, frequency, time_of_day, start_date, end_date, is_active, prescribed_by) VALUES
  ('rx000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002',
   'Железо (Сорбифер Дурулес)', '100 мг', 'daily', ARRAY['morning', 'evening'],
   (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '90 days')::DATE, true, 'u0000000-0000-0000-0000-000000000003');

-- Dose logs for today (Vitamin D3)
INSERT INTO dose_logs (prescription_id, family_id, scheduled_at, status) VALUES
  ('rx000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001',
   (CURRENT_DATE + INTERVAL '8 hours')::TIMESTAMPTZ, 'pending');

-- Yesterday's doses (confirmed)
INSERT INTO dose_logs (prescription_id, family_id, scheduled_at, status, confirmed_at, confirmed_by) VALUES
  ('rx000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001',
   (CURRENT_DATE - INTERVAL '16 hours')::TIMESTAMPTZ, 'confirmed', (CURRENT_DATE - INTERVAL '15 hours')::TIMESTAMPTZ, 'u0000000-0000-0000-0000-000000000010');

-- Iron dose logs for today
INSERT INTO dose_logs (prescription_id, family_id, scheduled_at, status) VALUES
  ('rx000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002',
   (CURRENT_DATE + INTERVAL '8 hours')::TIMESTAMPTZ, 'pending'),
  ('rx000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002',
   (CURRENT_DATE + INTERVAL '20 hours')::TIMESTAMPTZ, 'pending');

-- ============================================
-- 13. APPOINTMENT SLOTS (next 7 days for both doctors)
-- ============================================
INSERT INTO appointment_slots (doctor_id, date, start_time, end_time, is_available)
SELECT
  'd0000000-0000-0000-0000-000000000001',
  CURRENT_DATE + i,
  make_time(9 + (s * 0.5)::INT, CASE WHEN s % 2 = 1 THEN 30 ELSE 0 END, 0),
  make_time(9 + ((s + 1) * 0.5)::INT, CASE WHEN (s + 1) % 2 = 1 THEN 30 ELSE 0 END, 0),
  true
FROM generate_series(1, 7) AS i, generate_series(0, 13) AS s
WHERE EXTRACT(DOW FROM CURRENT_DATE + i) BETWEEN 1 AND 5; -- weekdays only

INSERT INTO appointment_slots (doctor_id, date, start_time, end_time, is_available)
SELECT
  'd0000000-0000-0000-0000-000000000002',
  CURRENT_DATE + i,
  make_time(10 + (s * 0.5)::INT, CASE WHEN s % 2 = 1 THEN 30 ELSE 0 END, 0),
  make_time(10 + ((s + 1) * 0.5)::INT, CASE WHEN (s + 1) % 2 = 1 THEN 30 ELSE 0 END, 0),
  true
FROM generate_series(1, 7) AS i, generate_series(0, 11) AS s
WHERE EXTRACT(DOW FROM CURRENT_DATE + i) BETWEEN 1 AND 5;

-- ============================================
-- 14. SAMPLE APPOINTMENTS
-- ============================================
INSERT INTO appointments (family_id, doctor_id, child_id, status, appointment_date, start_time, end_time, visit_type, reason) VALUES
  -- Completed appointment for Family 1
  ('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'ch000000-0000-0000-0000-000000000001',
   'completed', (CURRENT_DATE - INTERVAL '29 days')::DATE, '10:00', '10:30', 'in_person', 'Осмотр педиатра (2 мес)'),
  -- Upcoming appointment for Family 2
  ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', NULL,
   'confirmed', (CURRENT_DATE + INTERVAL '2 days')::DATE, '09:30', '10:00', 'in_person', 'УЗИ 2 триместра');

-- ============================================
-- 15. COORDINATOR TASKS
-- ============================================
INSERT INTO coordinator_tasks (clinic_id, family_id, type, priority, status, assigned_to, due_date, title, notes) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001',
   'overdue_followup', 'high', 'pending', 'u0000000-0000-0000-0000-000000000002',
   CURRENT_DATE, 'Ортопед (1 мес) — просрочено', 'Семья Касымовых: ребёнку 3 мес, ортопед не пройден'),
  ('c0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002',
   'overdue_followup', 'medium', 'pending', 'u0000000-0000-0000-0000-000000000002',
   CURRENT_DATE, 'ОАК/ОАМ (16 нед) — просрочено', 'Мухамедова: анализы на 16 неделе не сданы'),
  ('c0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000003',
   'reactivation', 'medium', 'pending', 'u0000000-0000-0000-0000-000000000002',
   CURRENT_DATE, 'Реактивация семьи Оразбаевых', 'Не заходили более 14 дней'),
  ('c0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001',
   'vaccination_reminder', 'high', 'pending', 'u0000000-0000-0000-0000-000000000002',
   CURRENT_DATE, 'Прививки 3 мес — Амир Касымов', 'АКДС-ГепВ-Хиб (2-я), ИПВ (2-я), PCV13 (2-я)');

-- ============================================
-- 16. NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, type, channel, title, body, status) VALUES
  ('u0000000-0000-0000-0000-000000000010', 'event_due', 'in_app',
   'Сегодня: осмотр педиатра', 'Амир — осмотр педиатра (3 мес). Не забудьте записаться!', 'pending'),
  ('u0000000-0000-0000-0000-000000000010', 'vaccination_reminder', 'in_app',
   'Прививки на этой неделе', 'Амиру запланированы АКДС, ИПВ и PCV13. Запишитесь к педиатру.', 'pending'),
  ('u0000000-0000-0000-0000-000000000020', 'event_due', 'in_app',
   'Сегодня: УЗИ 2 триместра', 'Запланировано УЗИ на 20 неделе + визит гинеколога.', 'pending');

-- ============================================
-- 17. CONSENTS
-- ============================================
INSERT INTO consents (user_id, type, granted, granted_at) VALUES
  ('u0000000-0000-0000-0000-000000000010', 'push', true, now()),
  ('u0000000-0000-0000-0000-000000000010', 'whatsapp', true, now()),
  ('u0000000-0000-0000-0000-000000000010', 'email', true, now()),
  ('u0000000-0000-0000-0000-000000000010', 'data_sharing', true, now()),
  ('u0000000-0000-0000-0000-000000000010', 'ai', true, now()),
  ('u0000000-0000-0000-0000-000000000020', 'push', true, now()),
  ('u0000000-0000-0000-0000-000000000020', 'whatsapp', false, NULL),
  ('u0000000-0000-0000-0000-000000000020', 'email', true, now());

-- ============================================
-- 18. GROWTH METRICS — Amir (3 months)
-- ============================================
INSERT INTO growth_metrics (child_id, date, weight_kg, height_cm, head_cm) VALUES
  ('ch000000-0000-0000-0000-000000000001', (CURRENT_DATE - INTERVAL '90 days')::DATE, 3.45, 51.0, 35.0),
  ('ch000000-0000-0000-0000-000000000001', (CURRENT_DATE - INTERVAL '60 days')::DATE, 4.80, 55.5, 37.5),
  ('ch000000-0000-0000-0000-000000000001', (CURRENT_DATE - INTERVAL '30 days')::DATE, 5.90, 59.0, 39.5),
  ('ch000000-0000-0000-0000-000000000001', CURRENT_DATE, 6.50, 61.0, 40.5);

-- ============================================
-- 19. MOOD LOGS — Mother (Family 1)
-- ============================================
INSERT INTO mood_logs (user_id, date, score, notes) VALUES
  ('u0000000-0000-0000-0000-000000000010', CURRENT_DATE - 6, 3, NULL),
  ('u0000000-0000-0000-0000-000000000010', CURRENT_DATE - 5, 4, 'Хороший день, Амир улыбался'),
  ('u0000000-0000-0000-0000-000000000010', CURRENT_DATE - 4, 4, NULL),
  ('u0000000-0000-0000-0000-000000000010', CURRENT_DATE - 3, 2, 'Плохо спала'),
  ('u0000000-0000-0000-0000-000000000010', CURRENT_DATE - 2, 3, NULL),
  ('u0000000-0000-0000-0000-000000000010', CURRENT_DATE - 1, 4, NULL),
  ('u0000000-0000-0000-0000-000000000010', CURRENT_DATE, 5, 'Амир перевернулся!');

-- ============================================
-- Done! Test accounts:
-- Admin:       admin@test.familycare.kz
-- Coordinator: coordinator@test.familycare.kz
-- Gynecologist: gynecologist@test.familycare.kz
-- Pediatrician: pediatrician@test.familycare.kz
-- Mother 1:    mama1@test.familycare.kz (infant 3 мес)
-- Mother 2:    mama2@test.familycare.kz (беременность 20 нед)
-- Mother 3:    mama3@test.familycare.kz (inactive)
-- Father 1:    papa1@test.familycare.kz
-- ============================================
