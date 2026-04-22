-- ============================================
-- Migration 033: Demo readonly guard
-- Блокирует INSERT/UPDATE/DELETE для 5 демо-аккаунтов через триггер.
-- Service-role (seed/backend) обходит проверку, т.к. auth.uid() = NULL.
-- Ошибка: SQLSTATE P0001 с сообщением 'DEMO_READONLY: ...'
-- ============================================

-- 1. Helper: true если текущий пользователь — один из 5 демо-аккаунтов
CREATE OR REPLACE FUNCTION is_demo_user() RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    auth.uid() IN (
      'D0000000-0000-0000-0000-000000000001'::uuid, -- mother
      'D0000000-0000-0000-0000-000000000002'::uuid, -- coordinator
      'D0000000-0000-0000-0000-000000000003'::uuid, -- admin
      'D0000000-0000-0000-0000-000000000004'::uuid, -- doctor
      'D0000000-0000-0000-0000-000000000005'::uuid  -- chief_doctor
    ),
    false
  );
$$;

-- 2. Триггер-функция: бросает exception с кодом P0001
CREATE OR REPLACE FUNCTION block_demo_writes() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF is_demo_user() THEN
    RAISE EXCEPTION 'DEMO_READONLY: demo accounts cannot modify data'
      USING ERRCODE = 'P0001',
            HINT = 'This is a demo account — changes are not persisted';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 3. Применяем триггер ко всем записываемым таблицам
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    -- Family module
    'mood_logs','sleep_logs','feeding_logs','growth_metrics','milestones',
    'dose_logs','documents','vaccinations','appointments','epds_screenings',
    'complaints','journey_events','journeys','lab_results',
    -- Doctor module
    'prescriptions','protocol_acknowledgements',
    -- Coordinator module
    'coordinator_tasks','outreach_logs',
    -- Chief module
    'protocol_deviations','case_reviews','clinical_protocols',
    -- Admin / CRM
    'leads','deals','campaigns','campaign_enrollments','call_logs',
    'message_templates','segments','service_packages','family_packages',
    'call_scripts','outreach_scenarios','lead_activities',
    'family_activities','family_notes',
    -- Profile settings
    'users','families','child_profiles','mother_profiles'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t AND table_schema = 'public') THEN
      EXECUTE format('DROP TRIGGER IF EXISTS demo_readonly ON %I', t);
      EXECUTE format(
        'CREATE TRIGGER demo_readonly BEFORE INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION block_demo_writes()',
        t
      );
      RAISE NOTICE 'demo_readonly trigger attached to %', t;
    ELSE
      RAISE NOTICE 'skipping % (table not found)', t;
    END IF;
  END LOOP;
END $$;
