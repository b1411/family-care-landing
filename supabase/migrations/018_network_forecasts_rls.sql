-- Migration 018: RLS for clinic networks and revenue forecasts
-- These three tables were created in 009_clinic_b2b.sql but never had RLS
-- enabled or policies defined. Without RLS they are world-readable through
-- any authenticated Supabase client, which leaks cross-clinic financial data.

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE clinic_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_network_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_forecasts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CLINIC NETWORKS
-- ============================================
-- Network metadata (just id + name) is readable by any admin whose clinic
-- belongs to the network. Only platform-level admins can create/edit networks.

CREATE POLICY "Admins can read networks their clinic belongs to"
  ON clinic_networks FOR SELECT USING (
    get_user_role() IN ('admin', 'clinic_admin', 'clinic_manager', 'platform_admin', 'superadmin')
    AND EXISTS(
      SELECT 1 FROM clinic_network_members m
      WHERE m.network_id = clinic_networks.id
        AND m.clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Platform admins can read all networks"
  ON clinic_networks FOR SELECT USING (
    get_user_role() IN ('platform_admin', 'superadmin')
  );

CREATE POLICY "Platform admins can manage networks"
  ON clinic_networks FOR ALL USING (
    get_user_role() IN ('platform_admin', 'superadmin')
  );

-- ============================================
-- CLINIC NETWORK MEMBERS
-- ============================================
-- Admins see only rows that reference their own clinic; platform admins
-- can see and manage all memberships.

CREATE POLICY "Admins can read own clinic's network memberships"
  ON clinic_network_members FOR SELECT USING (
    clinic_id = get_user_clinic_id()
    AND get_user_role() IN ('admin', 'clinic_admin', 'clinic_manager', 'platform_admin', 'superadmin')
  );

CREATE POLICY "Platform admins can manage network memberships"
  ON clinic_network_members FOR ALL USING (
    get_user_role() IN ('platform_admin', 'superadmin')
  );

-- ============================================
-- REVENUE FORECASTS
-- ============================================
-- Revenue data is highly sensitive — clinic admins see only their own clinic.

CREATE POLICY "Clinic admins can read own clinic forecasts"
  ON revenue_forecasts FOR SELECT USING (
    clinic_id = get_user_clinic_id()
    AND get_user_role() IN ('admin', 'clinic_admin', 'clinic_manager')
  );

CREATE POLICY "Clinic admins can manage own clinic forecasts"
  ON revenue_forecasts FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND get_user_role() IN ('admin', 'clinic_admin', 'clinic_manager')
  );

CREATE POLICY "Platform admins can manage all forecasts"
  ON revenue_forecasts FOR ALL USING (
    get_user_role() IN ('platform_admin', 'superadmin')
  );
