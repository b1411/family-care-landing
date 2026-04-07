-- Migration 003: Appointments
-- Doctors, appointment slots, appointments

-- ============================================
-- DOCTORS
-- ============================================
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  user_id UUID NOT NULL REFERENCES users(id),
  specialty TEXT NOT NULL,
  bio TEXT,
  experience_years INT,
  consultation_fee NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_doctors_clinic ON doctors(clinic_id);
CREATE INDEX idx_doctors_user ON doctors(user_id);

-- ============================================
-- APPOINTMENT SLOTS
-- ============================================
CREATE TABLE appointment_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_slots_doctor ON appointment_slots(doctor_id);
CREATE INDEX idx_slots_date ON appointment_slots(date);
CREATE INDEX idx_slots_available ON appointment_slots(is_available) WHERE is_available = true;

-- ============================================
-- APPOINTMENTS
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  child_id UUID REFERENCES child_profiles(id),
  journey_event_id UUID REFERENCES journey_events(id),
  slot_id UUID REFERENCES appointment_slots(id),
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled')),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  visit_type TEXT DEFAULT 'in_person' CHECK (visit_type IN ('in_person', 'video', 'phone')),
  reason TEXT,
  notes TEXT,
  pre_visit_answers JSONB,
  post_visit_notes TEXT,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_appointments_family ON appointments(family_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Triggers
CREATE TRIGGER tr_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
