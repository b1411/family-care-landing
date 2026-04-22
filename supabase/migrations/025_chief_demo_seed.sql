-- Migration 025: Chief doctor demo data
-- Idempotent: safe to run multiple times.
-- Adds chief@demo.kz account and backfills demo-clinic data so the
-- chief-doctor dashboards have meaningful content out of the box.
-- Triggers from 023 will auto-generate protocol_deviations and
-- prescription_alerts as appointments/prescriptions are updated.

-- ============================================
-- 1. Chief doctor demo account
-- ============================================
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'D0000000-0000-0000-0000-000000000005',
  'authenticated', 'authenticated', 'chief@demo.kz',
  crypt('DemoPass123!', gen_salt('bf')),
  now(),
  '{"role":"chief_doctor","clinic_id":"10000000-0000-0000-0000-000000000001"}'::jsonb,
  now(), now(), '', '', '', ''
)
ON CONFLICT (id) DO UPDATE
  SET raw_user_meta_data = EXCLUDED.raw_user_meta_data,
      email_confirmed_at = COALESCE(auth.users.email_confirmed_at, EXCLUDED.email_confirmed_at);

INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
)
VALUES (
  'D0000000-0000-0000-0000-000000000005',
  'D0000000-0000-0000-0000-000000000005',
  'chief@demo.kz',
  'email',
  '{"sub":"D0000000-0000-0000-0000-000000000005","email":"chief@demo.kz","email_verified":true}'::jsonb,
  now(), now(), now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (
  id, email, phone, role, clinic_id,
  first_name, last_name, avatar_url, is_active,
  last_seen_at, created_at, updated_at
)
VALUES (
  'D0000000-0000-0000-0000-000000000005',
  'chief@demo.kz',
  '+77000000005',
  'chief_doctor',
  '10000000-0000-0000-0000-000000000001',
  'Марат', 'Демо',
  NULL, true, now(), now(), now()
)
ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role,
      clinic_id = EXCLUDED.clinic_id,
      is_active = true,
      updated_at = now();

-- ============================================
-- 2. Backfill ICD-10 on recent completed appointments in demo clinic
--    Pick a handful of existing appointments to make the dashboard look
--    "lived-in" — some with diagnosis (good coverage), some without
--    (so the chief sees real gaps to chase).
-- ============================================
WITH recent_completed AS (
  SELECT a.id,
         row_number() OVER (ORDER BY a.appointment_date DESC, a.start_time DESC) AS rn
  FROM appointments a
  JOIN families f ON f.id = a.family_id
  WHERE f.clinic_id = '10000000-0000-0000-0000-000000000001'
    AND a.status = 'completed'
    AND a.icd10_primary IS NULL
  LIMIT 20
)
UPDATE appointments a
SET icd10_primary = CASE
      WHEN rc.rn % 5 = 1 THEN 'O14'   -- преэклампсия
      WHEN rc.rn % 5 = 2 THEN 'Z00.1' -- rutin pediatrics
      WHEN rc.rn % 5 = 3 THEN 'J06'   -- ОРВИ
      WHEN rc.rn % 5 = 4 THEN 'O26'   -- ведение беременности
      ELSE 'O09'
    END,
    completion_checklist = CASE
      WHEN rc.rn % 4 = 0 THEN '{"complaints":true,"exam":true,"diagnosis":true,"plan":false,"recommendations":false}'::jsonb
      ELSE '{"complaints":true,"exam":true,"diagnosis":true,"plan":true,"recommendations":true}'::jsonb
    END
FROM recent_completed rc
WHERE a.id = rc.id;

-- ============================================
-- 3. Backfill INN + structured dose on some existing prescriptions
-- ============================================
WITH target_rx AS (
  SELECT p.id,
         row_number() OVER (ORDER BY p.start_date DESC) AS rn
  FROM prescriptions p
  JOIN families f ON f.id = p.family_id
  WHERE f.clinic_id = '10000000-0000-0000-0000-000000000001'
    AND p.inn_name IS NULL
  LIMIT 14
)
UPDATE prescriptions p
SET inn_name = CASE
      WHEN tr.rn % 4 = 1 THEN 'Колекальциферол'
      WHEN tr.rn % 4 = 2 THEN 'Парацетамол'
      WHEN tr.rn % 4 = 3 THEN 'Метилдопа'
      ELSE NULL  -- leave ~25% without INN so the chief sees the gap
    END,
    dose_value = CASE
      WHEN tr.rn % 4 = 1 THEN 1000
      WHEN tr.rn % 4 = 2 THEN 500
      WHEN tr.rn % 4 = 3 THEN 250
      ELSE NULL
    END,
    dose_unit = CASE
      WHEN tr.rn % 4 = 1 THEN 'IU'
      WHEN tr.rn % 4 = 2 THEN 'mg'
      WHEN tr.rn % 4 = 3 THEN 'mg'
      ELSE NULL
    END,
    route = 'per_os',
    icd10_indication = CASE
      WHEN tr.rn % 4 = 1 THEN 'Z00.1'
      WHEN tr.rn % 4 = 2 THEN 'R50'
      WHEN tr.rn % 4 = 3 THEN 'O14'
      ELSE NULL
    END,
    doctor_id = 'BD000000-0000-0000-0000-000000000001'
FROM target_rx tr
WHERE p.id = tr.id;

-- ============================================
-- 4. Clinical protocols for the demo clinic
-- ============================================
INSERT INTO clinical_protocols (
  id, clinic_id, icd10_code, title, version, summary,
  required_checklist_items, expected_duration_min,
  recommended_inn, forbidden_inn, max_prescriptions,
  follow_up_days, source, published_at, published_by, is_active
)
VALUES
  (
    'A0000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'O14',
    'Ведение преэклампсии лёгкой степени',
    2,
    'Мониторинг АД, протеинурии, доплерометрия. Госпитализация при прогрессе.',
    ARRAY['complaints','exam','diagnosis','plan','recommendations'],
    20,
    ARRAY['Метилдопа','Лабеталол','Нифедипин'],
    ARRAY['Ибупрофен','Индометацин','Эналаприл'],
    5,
    7,
    'https://www.rcrz.kz/ru/pages/protokoly-diagnostiki-i-lecheniya',
    now(),
    'D0000000-0000-0000-0000-000000000005',
    true
  ),
  (
    'A0000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'Z00.1',
    'Плановый педиатрический осмотр',
    1,
    'Антропометрия, психомоторное развитие, рекомендации по вакцинации и питанию.',
    ARRAY['exam','diagnosis','plan','recommendations'],
    15,
    ARRAY['Колекальциферол'],
    ARRAY['Ацетилсалициловая кислота'],
    3,
    30,
    'https://www.who.int/publications',
    now(),
    'D0000000-0000-0000-0000-000000000005',
    true
  ),
  (
    'A0000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'J06',
    'Острая инфекция верхних дыхательных путей (неосложнённая)',
    1,
    'Этиотропное лечение только при подтверждённой бактериальной инфекции. Симптоматика.',
    ARRAY['complaints','exam','diagnosis','plan'],
    15,
    ARRAY['Парацетамол','Ибупрофен'],
    ARRAY['Амоксициллин'],  -- Amoxicillin forbidden for uncomplicated viral URI
    3,
    10,
    'https://www.rcrz.kz/ru/pages/protokoly-diagnostiki-i-lecheniya',
    now(),
    'D0000000-0000-0000-0000-000000000005',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Acknowledgement from demo doctor (Сауле) for protocol O14
INSERT INTO protocol_acknowledgements (protocol_id, doctor_id, version_acknowledged, acknowledged_at)
VALUES (
  'A0000000-0000-0000-0000-000000000002',
  'BD000000-0000-0000-0000-000000000001',
  1,
  now() - INTERVAL '2 days'
)
ON CONFLICT (protocol_id, doctor_id) DO NOTHING;

-- ============================================
-- 5. Demo complaints — mix of medical / service, various severity
-- ============================================
INSERT INTO complaints (
  id, clinic_id, family_id, appointment_id, doctor_id,
  submitted_by, kind, severity, body, status,
  sla_due_at, created_at
)
SELECT
  id,
  '10000000-0000-0000-0000-000000000001'::uuid,
  family_id,
  appointment_id,
  doctor_id,
  submitted_by,
  kind,
  severity,
  body,
  status,
  sla_due_at,
  created_at
FROM (
  VALUES
    (
      'CA000000-0000-0000-0000-000000000001'::uuid,
      'F0000000-0000-0000-0000-000000000001'::uuid,
      NULL::uuid,
      'BD000000-0000-0000-0000-000000000001'::uuid,
      'D0000000-0000-0000-0000-000000000001'::uuid,
      'medical',
      'high',
      'Врач не объяснил, почему назначил препарат, просто сказал "принимайте". Хотелось бы понимать, что именно и зачем.',
      'new',
      now() + INTERVAL '48 hours',
      now() - INTERVAL '18 hours'
    ),
    (
      'CA000000-0000-0000-0000-000000000002'::uuid,
      'F0000000-0000-0000-0000-000000000001'::uuid,
      NULL::uuid,
      NULL::uuid,
      'D0000000-0000-0000-0000-000000000001'::uuid,
      'service',
      'low',
      'Долгое ожидание в регистратуре — более 30 минут, хотя была запись.',
      'in_review',
      now() + INTERVAL '72 hours',
      now() - INTERVAL '3 days'
    ),
    (
      'CA000000-0000-0000-0000-000000000003'::uuid,
      'F0000000-0000-0000-0000-000000000001'::uuid,
      NULL::uuid,
      'BD000000-0000-0000-0000-000000000001'::uuid,
      'D0000000-0000-0000-0000-000000000001'::uuid,
      'medical',
      'medium',
      'На приёме педиатр не взвесил ребёнка и не измерил. В карте стоит запись "развитие по возрасту" — как?',
      'new',
      now() - INTERVAL '6 hours',  -- overdue!
      now() - INTERVAL '4 days'
    )
) AS seed(id, family_id, appointment_id, doctor_id, submitted_by, kind, severity, body, status, sla_due_at, created_at)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. Demo case review from the most urgent complaint
-- ============================================
INSERT INTO case_reviews (
  id, clinic_id, family_id, doctor_id, appointment_id,
  trigger, trigger_ref_id, priority, status, created_at
)
VALUES (
  'CC000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'F0000000-0000-0000-0000-000000000001',
  'BD000000-0000-0000-0000-000000000001',
  NULL,
  'complaint',
  'CA000000-0000-0000-0000-000000000003',
  'high',
  'queued',
  now() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. Manual deviation — seed one visible finding so the page isn't empty.
--    Real deviations get auto-detected by trigger 023 as soon as a doctor
--    completes an appointment against a matching protocol.
-- ============================================
INSERT INTO protocol_deviations (
  id, clinic_id, appointment_id, doctor_id, protocol_id,
  kind, severity, details, detected_at, resolved, justified
)
SELECT
  'DE000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  a.id,
  a.doctor_id,
  'A0000000-0000-0000-0000-000000000001'::uuid,
  'missing_checklist',
  'medium',
  '{"missing_items":["plan","recommendations"]}'::jsonb,
  now() - INTERVAL '1 day',
  false,
  false
FROM appointments a
JOIN families f ON f.id = a.family_id
WHERE f.clinic_id = '10000000-0000-0000-0000-000000000001'
  AND a.icd10_primary = 'O14'
  AND a.status = 'completed'
ORDER BY a.appointment_date DESC
LIMIT 1
ON CONFLICT (id) DO NOTHING;
