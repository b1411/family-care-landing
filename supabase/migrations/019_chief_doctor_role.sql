-- Migration 019: Chief Doctor (главврач) role
-- Adds clinic-scoped read-only role for medical-quality oversight.
-- Chief doctor sees everything staff sees in their clinic, but cannot modify
-- patient records. Writes are limited to chief-owned entities (case reviews,
-- prescription alert reviews, protocol deviations justifications) — those
-- are introduced in later migrations (022+).

-- ============================================
-- 1. Extend users.role CHECK constraint
-- ============================================
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (
  role IN (
    'mother', 'father', 'grandmother',
    'coordinator',
    'doctor', 'nurse', 'gynecologist', 'pediatrician',
    'chief_doctor',
    'clinic_admin', 'clinic_manager', 'admin', 'platform_admin', 'superadmin'
  )
);

-- ============================================
-- 2. Helper function — is current user chief_doctor of given clinic?
-- ============================================
CREATE OR REPLACE FUNCTION is_chief_doctor_of(target_clinic UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'chief_doctor'
      AND clinic_id = target_clinic
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 3. Read-only SELECT policies for chief_doctor
--    NOTE: we intentionally do NOT add chief_doctor to is_staff() — that
--    would over-grant writes through existing FOR ALL staff policies.
-- ============================================

-- Users (clinic roster)
CREATE POLICY "Chief doctor can read clinic users"
  ON users FOR SELECT USING (
    is_chief_doctor_of(clinic_id)
  );

-- Families / profiles / children
CREATE POLICY "Chief doctor can read clinic families"
  ON families FOR SELECT USING (
    is_chief_doctor_of(clinic_id)
  );

CREATE POLICY "Chief doctor can read clinic children"
  ON child_profiles FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = child_profiles.family_id
        AND is_chief_doctor_of(f.clinic_id)
    )
  );

CREATE POLICY "Chief doctor can read clinic mothers"
  ON mother_profiles FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = mother_profiles.family_id
        AND is_chief_doctor_of(f.clinic_id)
    )
  );

-- Clinical data
CREATE POLICY "Chief doctor can read clinic appointments"
  ON appointments FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = appointments.family_id
        AND is_chief_doctor_of(f.clinic_id)
    )
  );

CREATE POLICY "Chief doctor can read clinic prescriptions"
  ON prescriptions FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = prescriptions.family_id
        AND is_chief_doctor_of(f.clinic_id)
    )
  );

CREATE POLICY "Chief doctor can read clinic dose logs"
  ON dose_logs FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = dose_logs.family_id
        AND is_chief_doctor_of(f.clinic_id)
    )
  );

CREATE POLICY "Chief doctor can read clinic documents"
  ON documents FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = documents.family_id
        AND is_chief_doctor_of(f.clinic_id)
    )
  );

CREATE POLICY "Chief doctor can read clinic vaccinations"
  ON vaccinations FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM child_profiles cp
      JOIN families f ON f.id = cp.family_id
      WHERE cp.id = vaccinations.child_id
        AND is_chief_doctor_of(f.clinic_id)
    )
  );

CREATE POLICY "Chief doctor can read clinic doctors"
  ON doctors FOR SELECT USING (
    is_chief_doctor_of(clinic_id)
  );

CREATE POLICY "Chief doctor can read clinic health passport"
  ON health_passport_entries FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM child_profiles cp
      JOIN families f ON f.id = cp.family_id
      WHERE cp.id = health_passport_entries.child_id
        AND is_chief_doctor_of(f.clinic_id)
    )
  );

CREATE POLICY "Chief doctor can read clinic lab results"
  ON lab_results FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = lab_results.family_id
        AND is_chief_doctor_of(f.clinic_id)
    )
  );

CREATE POLICY "Chief doctor can read clinic visit ratings"
  ON visit_ratings FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = visit_ratings.family_id
        AND is_chief_doctor_of(f.clinic_id)
    )
  );

-- Clinic itself
CREATE POLICY "Chief doctor can read own clinic"
  ON clinics FOR SELECT USING (
    is_chief_doctor_of(id)
  );
