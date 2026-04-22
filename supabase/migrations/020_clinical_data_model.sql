-- Migration 020: Clinical data model foundation
-- Adds the minimum structure without which chief-doctor quality modules
-- (protocol deviations, Rx audit, case review) would show empty screens:
--   1. ICD-10 dictionary (seed with a small KZ-priority set)
--   2. icd10_primary / secondary + completion_checklist on appointments
--   3. INN (международное непатентованное) + structured dose on prescriptions
--      + link to appointment + prescribing doctor_id
--
-- New fields are nullable so legacy rows keep working. Doctor forms
-- will be updated in a follow-up pass to require them on new records.

-- ============================================
-- 1. ICD-10 dictionary
-- ============================================
CREATE TABLE IF NOT EXISTS icd10_codes (
  code TEXT PRIMARY KEY,
  name_ru TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_icd10_category ON icd10_codes(category) WHERE is_active = true;

-- Public read (authenticated users can look up codes in forms)
ALTER TABLE icd10_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active ICD-10 codes"
  ON icd10_codes FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage ICD-10 codes"
  ON icd10_codes FOR ALL USING (
    get_user_role() IN ('admin', 'superadmin', 'platform_admin', 'chief_doctor')
  );

-- Seed — pregnancy/postpartum/pediatric priorities for umai use cases.
-- This is intentionally a small starter set; full ICD-10 import comes later.
INSERT INTO icd10_codes (code, name_ru, category) VALUES
  -- Беременность и роды
  ('O09', 'Беременность, классифицированная по продолжительности', 'pregnancy'),
  ('O10', 'Гипертензия, предшествовавшая беременности', 'pregnancy'),
  ('O13', 'Вызванная беременностью гипертензия без значительной протеинурии', 'pregnancy'),
  ('O14', 'Преэклампсия', 'pregnancy'),
  ('O15', 'Эклампсия', 'pregnancy'),
  ('O24', 'Сахарный диабет при беременности', 'pregnancy'),
  ('O26', 'Ведение матери при других состояниях, связанных с беременностью', 'pregnancy'),
  ('O36', 'Медицинская помощь матери при других установленных проблемах плода', 'pregnancy'),
  ('O80', 'Роды одноплодные, самопроизвольные', 'delivery'),
  ('O82', 'Роды одноплодные, родоразрешение посредством кесарева сечения', 'delivery'),
  -- Послеродовый период
  ('O90', 'Осложнения послеродового периода, не классифицированные в других рубриках', 'postpartum'),
  ('O91', 'Инфекции молочной железы, связанные с деторождением', 'postpartum'),
  ('O92', 'Другие изменения молочной железы и лактации, связанные с деторождением', 'postpartum'),
  ('F53', 'Психические расстройства и расстройства поведения, связанные с послеродовым периодом', 'postpartum'),
  -- Педиатрия — частые коды
  ('Z00.1', 'Рутинное обследование ребёнка', 'pediatric_wellness'),
  ('Z23', 'Вакцинация', 'pediatric_wellness'),
  ('P07', 'Расстройства, связанные с укорочением срока беременности и малой массой при рождении', 'neonatal'),
  ('P59', 'Неонатальная желтуха', 'neonatal'),
  ('J06', 'Острая инфекция верхних дыхательных путей', 'pediatric_acute'),
  ('J20', 'Острый бронхит', 'pediatric_acute'),
  ('A08', 'Вирусные и другие уточнённые кишечные инфекции', 'pediatric_acute'),
  ('A09', 'Другие гастроэнтериты и колиты инфекционного и неуточнённого происхождения', 'pediatric_acute'),
  ('R50', 'Лихорадка неясного происхождения', 'pediatric_acute'),
  ('L20', 'Атопический дерматит', 'pediatric_chronic'),
  ('J45', 'Астма', 'pediatric_chronic'),
  ('E66', 'Ожирение', 'pediatric_chronic')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 2. Clinical fields on appointments
-- ============================================
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS icd10_primary TEXT REFERENCES icd10_codes(code),
  ADD COLUMN IF NOT EXISTS icd10_secondary TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS completion_checklist JSONB DEFAULT '{}';
  -- completion_checklist example:
  --   {"complaints": true, "exam": true, "diagnosis": true,
  --    "plan": true, "recommendations": false}

CREATE INDEX IF NOT EXISTS idx_appointments_icd10_primary
  ON appointments(icd10_primary) WHERE icd10_primary IS NOT NULL;

-- ============================================
-- 3. Structured prescription data
-- ============================================
ALTER TABLE prescriptions
  ADD COLUMN IF NOT EXISTS inn_name TEXT,                  -- международное непатентованное наименование
  ADD COLUMN IF NOT EXISTS dose_value NUMERIC(10,3),
  ADD COLUMN IF NOT EXISTS dose_unit TEXT,                 -- mg, ml, IU, mcg
  ADD COLUMN IF NOT EXISTS route TEXT,                     -- per_os, im, iv, sc, topical, inhaled
  ADD COLUMN IF NOT EXISTS icd10_indication TEXT REFERENCES icd10_codes(code),
  ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id),
  ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id);

CREATE INDEX IF NOT EXISTS idx_prescriptions_inn
  ON prescriptions(inn_name) WHERE inn_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor
  ON prescriptions(doctor_id) WHERE doctor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment
  ON prescriptions(appointment_id) WHERE appointment_id IS NOT NULL;

-- Route enumeration (soft check — don't block imports from legacy data)
ALTER TABLE prescriptions
  DROP CONSTRAINT IF EXISTS prescriptions_route_check;
ALTER TABLE prescriptions
  ADD CONSTRAINT prescriptions_route_check
  CHECK (route IS NULL OR route IN (
    'per_os', 'im', 'iv', 'sc', 'topical', 'inhaled', 'pr', 'ophthalmic', 'otic'
  ));
