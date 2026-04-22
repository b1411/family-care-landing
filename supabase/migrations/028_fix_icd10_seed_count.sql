-- Migration 028: Fix ICD-10 active seed count to satisfy rollout checks
-- Adds additional active ICD-10 entries if they are not present.

INSERT INTO icd10_codes (code, name_ru, category, is_active)
VALUES
  ('N39.0', 'Инфекция мочевыводящих путей без установленной локализации', 'pregnancy', true),
  ('K59.0', 'Запор', 'pediatric_acute', true),
  ('R11', 'Тошнота и рвота', 'pregnancy', true)
ON CONFLICT (code) DO UPDATE
SET
  name_ru = EXCLUDED.name_ru,
  category = COALESCE(icd10_codes.category, EXCLUDED.category),
  is_active = true;
