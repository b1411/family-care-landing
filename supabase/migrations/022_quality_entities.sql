-- Migration 022: Quality entities — complaints, case_reviews, protocol_deviations
-- Feeds the chief-doctor screens: /chief/complaints, /chief/case-reviews,
-- /chief/deviations.

-- ============================================
-- 1. Complaints (обращения от семьи или координатора)
-- ============================================
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  submitted_by UUID REFERENCES users(id),
    -- Who filed it (mother/father/coordinator/etc)
  kind TEXT NOT NULL CHECK (kind IN ('medical', 'service', 'billing', 'other')),
  severity TEXT NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_review', 'resolved', 'dismissed')),
  sla_due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_complaints_clinic_status ON complaints(clinic_id, status);
CREATE INDEX IF NOT EXISTS idx_complaints_doctor ON complaints(doctor_id);
CREATE INDEX IF NOT EXISTS idx_complaints_appointment ON complaints(appointment_id);
CREATE INDEX IF NOT EXISTS idx_complaints_sla ON complaints(sla_due_at) WHERE status IN ('new','in_review');

CREATE TRIGGER tr_complaints_updated_at BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. Case reviews (очередь разбора случаев)
-- ============================================
CREATE TABLE IF NOT EXISTS case_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  family_id UUID REFERENCES families(id),
  doctor_id UUID REFERENCES doctors(id),
  trigger TEXT NOT NULL CHECK (trigger IN (
    'complaint', 'protocol_deviation', 'adverse_outcome',
    'rx_alert', 'manual', 'no_progress'
  )),
  trigger_ref_id UUID,
    -- Points to complaints.id / protocol_deviations.id / prescription_alerts.id
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'in_review', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('normal', 'high', 'critical')),
  chief_comment TEXT,
  decision TEXT CHECK (decision IN (
    'no_violation', 'training_required', 'formal_warning', 'escalate'
  )),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  snapshot_json JSONB,
    -- Frozen packet: appointment record, prescriptions, notes, timeline.
    -- Populated by server when case opens for review.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_reviews_clinic_status
  ON case_reviews(clinic_id, status);
CREATE INDEX IF NOT EXISTS idx_case_reviews_doctor ON case_reviews(doctor_id);

CREATE TRIGGER tr_case_reviews_updated_at BEFORE UPDATE ON case_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 3. Protocol deviations
-- ============================================
CREATE TABLE IF NOT EXISTS protocol_deviations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id),
  protocol_id UUID REFERENCES clinical_protocols(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN (
    'missing_checklist', 'forbidden_drug', 'polypharmacy',
    'no_follow_up', 'duration_too_short', 'no_diagnosis'
  )),
  severity TEXT NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB,
    -- Structured context, e.g. { "missing_items": ["exam","plan"] }
    --                   or { "inn": "Ibuprofen", "reason": "pregnancy" }
  justified BOOLEAN DEFAULT false,
  justification_note TEXT,
  justified_by UUID REFERENCES users(id),
  justified_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deviations_clinic ON protocol_deviations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_deviations_appointment ON protocol_deviations(appointment_id);
CREATE INDEX IF NOT EXISTS idx_deviations_doctor ON protocol_deviations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_deviations_unresolved
  ON protocol_deviations(clinic_id, detected_at DESC) WHERE resolved = false;

-- ============================================
-- 4. RLS
-- ============================================
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_deviations ENABLE ROW LEVEL SECURITY;

-- Complaints
CREATE POLICY "Family can create complaints for their family"
  ON complaints FOR INSERT WITH CHECK (
    family_id IS NOT NULL AND is_family_member(family_id)
  );

CREATE POLICY "Family can read own complaints"
  ON complaints FOR SELECT USING (
    family_id IS NOT NULL AND is_family_member(family_id)
  );

CREATE POLICY "Staff read+manage clinic complaints"
  ON complaints FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND get_user_role() IN ('coordinator', 'chief_doctor', 'admin', 'clinic_admin', 'superadmin')
  );

CREATE POLICY "Doctor reads complaints about themself"
  ON complaints FOR SELECT USING (
    doctor_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM doctors d WHERE d.id = complaints.doctor_id AND d.user_id = auth.uid()
    )
  );

-- Case reviews
CREATE POLICY "Chief/admin manage case reviews"
  ON case_reviews FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND get_user_role() IN ('chief_doctor', 'admin', 'clinic_admin', 'superadmin')
  );

CREATE POLICY "Doctor reads own case reviews"
  ON case_reviews FOR SELECT USING (
    doctor_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM doctors d WHERE d.id = case_reviews.doctor_id AND d.user_id = auth.uid()
    )
  );

-- Protocol deviations
CREATE POLICY "Chief/admin read clinic deviations"
  ON protocol_deviations FOR SELECT USING (
    clinic_id = get_user_clinic_id()
    AND get_user_role() IN ('chief_doctor', 'admin', 'clinic_admin', 'superadmin')
  );

CREATE POLICY "Chief/admin update clinic deviations"
  ON protocol_deviations FOR UPDATE USING (
    clinic_id = get_user_clinic_id()
    AND get_user_role() IN ('chief_doctor', 'admin', 'clinic_admin', 'superadmin')
  );

-- Doctor can read own deviations and justify them
CREATE POLICY "Doctor reads own deviations"
  ON protocol_deviations FOR SELECT USING (
    doctor_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM doctors d WHERE d.id = protocol_deviations.doctor_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctor justifies own deviations"
  ON protocol_deviations FOR UPDATE USING (
    doctor_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM doctors d WHERE d.id = protocol_deviations.doctor_id AND d.user_id = auth.uid()
    )
  );

-- Deviations are inserted by server-side rules / triggers; allow service role.
-- No general INSERT policy needed (server uses service role to write).
