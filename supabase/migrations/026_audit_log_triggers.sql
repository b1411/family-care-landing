-- Migration 026: Audit-log triggers
-- Populates doctor_audit_log on clinical mutations so the chief has a
-- forensic trail. The log is read-only for all roles (INSERT goes via
-- SECURITY DEFINER trigger; RLS only allows SELECT for chief/admin).

-- ============================================
-- Helper: resolve clinic_id from an appointment or prescription
-- ============================================
CREATE OR REPLACE FUNCTION _audit_clinic_from_family(family_uuid UUID)
RETURNS UUID AS $$
  SELECT clinic_id FROM families WHERE id = family_uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- Appointments: complete, cancel, edit record
-- ============================================
CREATE OR REPLACE FUNCTION log_appointment_change()
RETURNS TRIGGER AS $$
DECLARE
  clinic UUID;
  op TEXT;
BEGIN
  clinic := _audit_clinic_from_family(COALESCE(NEW.family_id, OLD.family_id));
  IF clinic IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  IF TG_OP = 'INSERT' THEN
    op := 'appointment.create';
  ELSIF TG_OP = 'DELETE' THEN
    op := 'appointment.delete';
  ELSIF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed' THEN
    op := 'appointment.complete';
  ELSIF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'cancelled' THEN
    op := 'appointment.cancel';
  ELSIF OLD.post_visit_notes IS DISTINCT FROM NEW.post_visit_notes
     OR OLD.icd10_primary IS DISTINCT FROM NEW.icd10_primary
     OR OLD.completion_checklist IS DISTINCT FROM NEW.completion_checklist THEN
    op := 'appointment.record_edit';
  ELSE
    -- Silent changes we don't care to trace (reschedule, slot moves, etc)
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO doctor_audit_log (
    clinic_id, doctor_id, actor_user_id,
    action, entity_type, entity_id,
    before_json, after_json
  )
  VALUES (
    clinic,
    COALESCE(NEW.doctor_id, OLD.doctor_id),
    auth.uid(),
    op,
    'appointment',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_appointments_audit ON appointments;
CREATE TRIGGER tr_appointments_audit
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION log_appointment_change();

-- ============================================
-- Prescriptions: create, deactivate, edit
-- ============================================
CREATE OR REPLACE FUNCTION log_prescription_change()
RETURNS TRIGGER AS $$
DECLARE
  clinic UUID;
  op TEXT;
BEGIN
  clinic := _audit_clinic_from_family(COALESCE(NEW.family_id, OLD.family_id));
  IF clinic IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  IF TG_OP = 'INSERT' THEN
    op := 'prescription.create';
  ELSIF TG_OP = 'DELETE' THEN
    op := 'prescription.delete';
  ELSIF OLD.is_active IS DISTINCT FROM NEW.is_active AND NEW.is_active = false THEN
    op := 'prescription.deactivate';
  ELSIF OLD.medication IS DISTINCT FROM NEW.medication
     OR OLD.dosage IS DISTINCT FROM NEW.dosage
     OR OLD.dose_value IS DISTINCT FROM NEW.dose_value
     OR OLD.inn_name IS DISTINCT FROM NEW.inn_name
     OR OLD.icd10_indication IS DISTINCT FROM NEW.icd10_indication THEN
    op := 'prescription.edit';
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO doctor_audit_log (
    clinic_id, doctor_id, actor_user_id,
    action, entity_type, entity_id,
    before_json, after_json
  )
  VALUES (
    clinic,
    COALESCE(NEW.doctor_id, OLD.doctor_id),
    auth.uid(),
    op,
    'prescription',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prescriptions_audit ON prescriptions;
CREATE TRIGGER tr_prescriptions_audit
  AFTER INSERT OR UPDATE OR DELETE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION log_prescription_change();

-- ============================================
-- Protocol acknowledgements — softer trace
-- ============================================
CREATE OR REPLACE FUNCTION log_protocol_ack()
RETURNS TRIGGER AS $$
DECLARE
  clinic UUID;
BEGIN
  SELECT d.clinic_id INTO clinic FROM doctors d WHERE d.id = NEW.doctor_id;
  IF clinic IS NULL THEN RETURN NEW; END IF;

  INSERT INTO doctor_audit_log (
    clinic_id, doctor_id, actor_user_id,
    action, entity_type, entity_id, after_json
  )
  VALUES (
    clinic, NEW.doctor_id, auth.uid(),
    'protocol.ack',
    'protocol_acknowledgement',
    NEW.protocol_id,
    jsonb_build_object('version', NEW.version_acknowledged)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protocol_ack_audit ON protocol_acknowledgements;
CREATE TRIGGER tr_protocol_ack_audit
  AFTER INSERT ON protocol_acknowledgements
  FOR EACH ROW EXECUTE FUNCTION log_protocol_ack();
