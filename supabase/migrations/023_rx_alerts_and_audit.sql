-- Migration 023: Prescription alerts + doctor audit log
-- Rx alerts surface polypharmacy, forbidden drugs, dose issues.
-- Audit log gives chief a forensic trail of clinical actions.

-- ============================================
-- 1. Prescription alerts
-- ============================================
CREATE TABLE IF NOT EXISTS prescription_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id),
  kind TEXT NOT NULL CHECK (kind IN (
    'polypharmacy', 'interaction', 'off_label',
    'dose_out_of_range', 'pregnancy_contraindicated',
    'pediatric_contraindicated', 'missing_inn', 'missing_indication'
  )),
  severity TEXT NOT NULL DEFAULT 'warning'
    CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  details JSONB,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'reviewed', 'approved', 'flagged')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rx_alerts_clinic_status
  ON prescription_alerts(clinic_id, status, severity);
CREATE INDEX IF NOT EXISTS idx_rx_alerts_prescription
  ON prescription_alerts(prescription_id);
CREATE INDEX IF NOT EXISTS idx_rx_alerts_doctor
  ON prescription_alerts(doctor_id);

-- ============================================
-- 2. Doctor audit log
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_audit_log (
  id BIGSERIAL PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id),
  actor_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
    -- appointment.complete / prescription.create / prescription.deactivate /
    -- record.edit / document.upload / protocol.ack
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_json JSONB,
  after_json JSONB,
  at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doctor_audit_clinic_at
  ON doctor_audit_log(clinic_id, at DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_audit_doctor_at
  ON doctor_audit_log(doctor_id, at DESC) WHERE doctor_id IS NOT NULL;

-- ============================================
-- 3. RLS
-- ============================================
ALTER TABLE prescription_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_audit_log ENABLE ROW LEVEL SECURITY;

-- Alerts: chief/admin manage; doctor reads own.
CREATE POLICY "Chief/admin manage clinic rx alerts"
  ON prescription_alerts FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND get_user_role() IN ('chief_doctor', 'admin', 'clinic_admin', 'superadmin')
  );

CREATE POLICY "Doctor reads own rx alerts"
  ON prescription_alerts FOR SELECT USING (
    doctor_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM doctors d WHERE d.id = prescription_alerts.doctor_id AND d.user_id = auth.uid()
    )
  );

-- Audit log: chief/admin read; nobody modifies (insert-only via server).
CREATE POLICY "Chief/admin read clinic audit log"
  ON doctor_audit_log FOR SELECT USING (
    clinic_id = get_user_clinic_id()
    AND get_user_role() IN ('chief_doctor', 'admin', 'clinic_admin', 'superadmin')
  );

-- ============================================
-- 4. Trigger: auto-create Rx alerts from structured data
--    (pure-SQL heuristics — server-side rules can extend later)
-- ============================================
CREATE OR REPLACE FUNCTION rx_alert_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  clinic UUID;
  active_count INT;
  polypharmacy_threshold INT := 5;
BEGIN
  -- Resolve clinic_id via family
  SELECT f.clinic_id INTO clinic
  FROM families f WHERE f.id = NEW.family_id;
  IF clinic IS NULL THEN RETURN NEW; END IF;

  -- Missing INN
  IF NEW.inn_name IS NULL OR length(NEW.inn_name) = 0 THEN
    INSERT INTO prescription_alerts (prescription_id, clinic_id, doctor_id, kind, severity, message)
    VALUES (NEW.id, clinic, NEW.doctor_id, 'missing_inn', 'warning',
      'Назначение без структурированного МНН — не попадёт в аудит взаимодействий.');
  END IF;

  -- Missing indication
  IF NEW.icd10_indication IS NULL THEN
    INSERT INTO prescription_alerts (prescription_id, clinic_id, doctor_id, kind, severity, message)
    VALUES (NEW.id, clinic, NEW.doctor_id, 'missing_indication', 'info',
      'Не указано показание (МКБ-10).');
  END IF;

  -- Polypharmacy: count currently active prescriptions for same family
  SELECT count(*) INTO active_count
  FROM prescriptions
  WHERE family_id = NEW.family_id
    AND is_active = true
    AND id <> NEW.id;

  IF active_count + 1 >= polypharmacy_threshold THEN
    INSERT INTO prescription_alerts (prescription_id, clinic_id, doctor_id, kind, severity, message, details)
    VALUES (NEW.id, clinic, NEW.doctor_id, 'polypharmacy', 'warning',
      'Полипрагмазия: у пациента одновременно ' || (active_count + 1) || ' активных назначений.',
      jsonb_build_object('active_count', active_count + 1));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prescriptions_alert ON prescriptions;
CREATE TRIGGER tr_prescriptions_alert
  AFTER INSERT ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION rx_alert_on_insert();

-- ============================================
-- 5. Trigger: detect protocol deviations on appointment completion
-- ============================================
CREATE OR REPLACE FUNCTION detect_deviations_on_complete()
RETURNS TRIGGER AS $$
DECLARE
  clinic UUID;
  protocol RECORD;
  missing_items TEXT[];
  req TEXT;
BEGIN
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  SELECT f.clinic_id INTO clinic
  FROM families f WHERE f.id = NEW.family_id;
  IF clinic IS NULL THEN RETURN NEW; END IF;

  -- Missing diagnosis
  IF NEW.icd10_primary IS NULL THEN
    INSERT INTO protocol_deviations (clinic_id, appointment_id, doctor_id, kind, severity, details)
    VALUES (clinic, NEW.id, NEW.doctor_id, 'no_diagnosis', 'high',
      jsonb_build_object('reason', 'icd10_primary is NULL'));
    RETURN NEW;
  END IF;

  -- Find matching protocol (clinic-specific first, else global)
  SELECT * INTO protocol
  FROM clinical_protocols
  WHERE is_active = true
    AND icd10_code = NEW.icd10_primary
    AND (clinic_id = clinic OR clinic_id IS NULL)
  ORDER BY (clinic_id IS NOT NULL) DESC, version DESC
  LIMIT 1;

  IF protocol.id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Required checklist items missing
  missing_items := ARRAY[]::TEXT[];
  FOREACH req IN ARRAY protocol.required_checklist_items LOOP
    IF COALESCE((NEW.completion_checklist ->> req)::boolean, false) = false THEN
      missing_items := array_append(missing_items, req);
    END IF;
  END LOOP;

  IF array_length(missing_items, 1) > 0 THEN
    INSERT INTO protocol_deviations (clinic_id, appointment_id, doctor_id, protocol_id, kind, severity, details)
    VALUES (clinic, NEW.id, NEW.doctor_id, protocol.id, 'missing_checklist', 'medium',
      jsonb_build_object('missing_items', missing_items));
  END IF;

  -- Duration too short
  IF protocol.expected_duration_min IS NOT NULL AND NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    IF EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))/60 < protocol.expected_duration_min THEN
      INSERT INTO protocol_deviations (clinic_id, appointment_id, doctor_id, protocol_id, kind, severity, details)
      VALUES (clinic, NEW.id, NEW.doctor_id, protocol.id, 'duration_too_short', 'low',
        jsonb_build_object('expected_min', protocol.expected_duration_min,
                           'actual_min', ROUND(EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))/60)));
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_appointments_detect_deviations ON appointments;
CREATE TRIGGER tr_appointments_detect_deviations
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW EXECUTE FUNCTION detect_deviations_on_complete();
