-- Migration 004: Medical — Documents, Prescriptions, Dose Logs, Vaccinations

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES child_profiles(id),
  type TEXT NOT NULL CHECK (type IN ('analysis', 'ultrasound', 'screening', 'prescription', 'discharge', 'certificate', 'photo', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INT,
  tags TEXT[],
  journey_event_id UUID REFERENCES journey_events(id),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_family ON documents(family_id);
CREATE INDEX idx_documents_child ON documents(child_id);
CREATE INDEX idx_documents_type ON documents(type);

-- ============================================
-- PRESCRIPTIONS
-- ============================================
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES child_profiles(id),
  medication TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  time_of_day TEXT[] DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  prescribed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prescriptions_family ON prescriptions(family_id);
CREATE INDEX idx_prescriptions_active ON prescriptions(is_active) WHERE is_active = true;

-- ============================================
-- DOSE LOGS
-- ============================================
CREATE TABLE dose_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'missed', 'skipped')),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES users(id),
  skip_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_dose_logs_prescription ON dose_logs(prescription_id);
CREATE INDEX idx_dose_logs_family ON dose_logs(family_id);
CREATE INDEX idx_dose_logs_scheduled ON dose_logs(scheduled_at);
CREATE INDEX idx_dose_logs_status ON dose_logs(status);

-- ============================================
-- VACCINATIONS
-- ============================================
CREATE TABLE vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  dose_number INT NOT NULL DEFAULT 1,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'skipped', 'postponed')),
  administered_date DATE,
  batch_number TEXT,
  doctor_id UUID REFERENCES doctors(id),
  reactions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vaccinations_child ON vaccinations(child_id);
CREATE INDEX idx_vaccinations_status ON vaccinations(status);
CREATE INDEX idx_vaccinations_scheduled ON vaccinations(scheduled_date);

-- Triggers
CREATE TRIGGER tr_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_vaccinations_updated_at BEFORE UPDATE ON vaccinations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
