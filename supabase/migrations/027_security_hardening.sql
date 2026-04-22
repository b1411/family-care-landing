-- Migration 027: Security hardening for views and SECURITY DEFINER functions
-- 1) Force SECURITY INVOKER semantics on analytics/quality views
-- 2) Pin search_path for privileged functions to avoid mutable-path risks

-- ============================================
-- 1. Views: enforce security_invoker
-- ============================================
ALTER VIEW IF EXISTS public.v_clinic_quality_overview SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_doctor_quality SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_clinic_dashboard SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_doctor_performance SET (security_invoker = true);

-- ============================================
-- 2. Functions: pin search_path
-- ============================================
DO $$
DECLARE
  f record;
BEGIN
  FOR f IN
    SELECT
      p.oid,
      p.proname,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'is_chief_doctor_of',
        'rx_alert_on_insert',
        'detect_deviations_on_complete',
        '_audit_clinic_from_family',
        'log_appointment_change',
        'log_prescription_change',
        'log_protocol_ack',
        'update_updated_at',
        'get_user_clinic_id',
        'get_user_role',
        'is_family_member',
        'is_staff'
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION public.%I(%s) SET search_path = public, pg_temp',
      f.proname,
      f.args
    );
  END LOOP;
END
$$;
