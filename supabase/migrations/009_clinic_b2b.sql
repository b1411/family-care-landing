-- Migration 009: Clinic B2B
-- Service Packages, Visit Ratings, Outreach, Training, Network, Integrations, Lab

-- ============================================
-- SERVICE PACKAGES
-- ============================================
CREATE TABLE service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  name TEXT NOT NULL,
  description TEXT,
  services_json JSONB NOT NULL DEFAULT '[]',
  price NUMERIC(12,2) NOT NULL,
  duration_months INT DEFAULT 12,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE family_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  package_id UUID NOT NULL REFERENCES service_packages(id),
  purchased_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  usage_json JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled'))
);

CREATE INDEX idx_family_packages_family ON family_packages(family_id);

-- ============================================
-- VISIT RATINGS
-- ============================================
-- visit_ratings already created in 005_operations.sql

-- ============================================
-- OUTREACH (CRM automation)
-- ============================================
CREATE TABLE outreach_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  name TEXT NOT NULL,
  trigger_json JSONB NOT NULL DEFAULT '{}',
  actions_json JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE outreach_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES outreach_scenarios(id),
  family_id UUID NOT NULL REFERENCES families(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'converted', 'failed')),
  result TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- REVIEW REQUESTS
-- ============================================
CREATE TABLE review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  event_type TEXT,
  nps_score INT,
  review_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TRAINING
-- ============================================
CREATE TABLE training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  role TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '[]',
  test_json JSONB DEFAULT '[]',
  passing_score INT DEFAULT 70,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  score INT,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_training_progress_unique ON training_progress(user_id, module_id);

-- ============================================
-- CLINIC NETWORKS (multi-branch)
-- ============================================
CREATE TABLE clinic_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE clinic_network_members (
  network_id UUID NOT NULL REFERENCES clinic_networks(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (network_id, clinic_id)
);

-- ============================================
-- INTEGRATIONS
-- ============================================
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  provider TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mis', '1c', 'lab', 'sms', 'whatsapp', 'calendar', 'custom')),
  config_encrypted TEXT,
  sync_status TEXT DEFAULT 'inactive'
    CHECK (sync_status IN ('inactive', 'active', 'error', 'syncing')),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  entity TEXT NOT NULL,
  records_count INT DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- LAB INTEGRATIONS
-- ============================================
CREATE TABLE lab_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  lab_provider TEXT NOT NULL,
  api_key_encrypted TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  child_id UUID REFERENCES child_profiles(id),
  lab_provider TEXT NOT NULL,
  order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  results_json JSONB,
  raw_pdf_url TEXT,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lab_results_family ON lab_results(family_id);

-- ============================================
-- REVENUE FORECASTS
-- ============================================
CREATE TABLE revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  period TEXT NOT NULL,
  forecast_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Triggers
CREATE TRIGGER tr_service_packages_updated_at BEFORE UPDATE ON service_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_outreach_scenarios_updated_at BEFORE UPDATE ON outreach_scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_training_modules_updated_at BEFORE UPDATE ON training_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_lab_integrations_updated_at BEFORE UPDATE ON lab_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
