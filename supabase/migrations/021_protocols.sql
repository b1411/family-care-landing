-- Migration 021: Clinical protocols library + acknowledgements
-- Protocols are the backbone of the chief-doctor quality screens.
-- They are edited by chief_doctor (or admin) and acknowledged by doctors.

-- ============================================
-- 1. Clinical protocols
-- ============================================
CREATE TABLE IF NOT EXISTS clinical_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    -- NULL = global (platform-level / MAB-published). Otherwise clinic-specific.
  icd10_code TEXT NOT NULL REFERENCES icd10_codes(code),
  title TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  summary TEXT,
  required_checklist_items TEXT[] NOT NULL DEFAULT '{}',
    -- Keys expected in appointments.completion_checklist (e.g. 'complaints','exam','diagnosis','plan','recommendations')
  expected_duration_min INT,
    -- Minimum expected visit duration in minutes
  recommended_inn TEXT[] DEFAULT '{}',
  forbidden_inn TEXT[] DEFAULT '{}',
  max_prescriptions INT DEFAULT 5,
    -- Polypharmacy threshold; above triggers deviation
  follow_up_days INT,
    -- Expected follow-up window in days
  source TEXT,
    -- URL / citation (MZ RK clinrecommendations, WHO, etc.)
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_protocols_icd10 ON clinical_protocols(icd10_code);
CREATE INDEX IF NOT EXISTS idx_protocols_clinic ON clinical_protocols(clinic_id);
CREATE INDEX IF NOT EXISTS idx_protocols_active ON clinical_protocols(is_active) WHERE is_active = true;

CREATE TRIGGER tr_protocols_updated_at BEFORE UPDATE ON clinical_protocols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. Acknowledgements (which doctor confirmed reading which protocol version)
-- ============================================
CREATE TABLE IF NOT EXISTS protocol_acknowledgements (
  protocol_id UUID NOT NULL REFERENCES clinical_protocols(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  version_acknowledged INT NOT NULL,
    -- Pinned to version at time of ack — if chief publishes v2, ack is stale.
  acknowledged_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (protocol_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_ack_doctor ON protocol_acknowledgements(doctor_id);

-- ============================================
-- 3. RLS
-- ============================================
ALTER TABLE clinical_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_acknowledgements ENABLE ROW LEVEL SECURITY;

-- Protocols: any staff in clinic can read clinic protocols + global ones;
-- chief_doctor / admin can manage; platform_admin manages globals.
CREATE POLICY "Staff can read clinic and global protocols"
  ON clinical_protocols FOR SELECT USING (
    is_active = true AND (
      clinic_id IS NULL
      OR clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Chief/admin can manage clinic protocols"
  ON clinical_protocols FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND get_user_role() IN ('chief_doctor', 'admin', 'clinic_admin', 'superadmin')
  );

CREATE POLICY "Platform admin can manage global protocols"
  ON clinical_protocols FOR ALL USING (
    clinic_id IS NULL
    AND get_user_role() IN ('platform_admin', 'superadmin')
  );

-- Acknowledgements: doctor writes their own; chief reads all in clinic.
CREATE POLICY "Doctor can read/write own acknowledgements"
  ON protocol_acknowledgements FOR ALL USING (
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = protocol_acknowledgements.doctor_id AND d.user_id = auth.uid())
  );

CREATE POLICY "Chief/admin read clinic acknowledgements"
  ON protocol_acknowledgements FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = protocol_acknowledgements.doctor_id
        AND d.clinic_id = get_user_clinic_id()
    )
    AND get_user_role() IN ('chief_doctor', 'admin', 'clinic_admin', 'superadmin')
  );
