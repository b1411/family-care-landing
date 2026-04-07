-- Migration 002: Journey Engine
-- Journey templates, journeys, journey events

-- ============================================
-- JOURNEY TEMPLATES
-- ============================================
CREATE TABLE journey_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  type TEXT NOT NULL CHECK (type IN ('pregnancy', 'postpartum', 'infant', 'toddler')),
  name TEXT NOT NULL,
  description TEXT,
  events_json JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_journey_templates_clinic ON journey_templates(clinic_id);
CREATE INDEX idx_journey_templates_type ON journey_templates(type);

-- ============================================
-- JOURNEYS (active care plans)
-- ============================================
CREATE TABLE journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  template_id UUID REFERENCES journey_templates(id),
  child_id UUID REFERENCES child_profiles(id),
  type TEXT NOT NULL CHECK (type IN ('pregnancy', 'postpartum', 'infant', 'toddler')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_journeys_family ON journeys(family_id);
CREATE INDEX idx_journeys_status ON journeys(status);
CREATE INDEX idx_journeys_type ON journeys(type);

-- ============================================
-- JOURNEY EVENTS
-- ============================================
CREATE TABLE journey_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  trigger_week INT,
  trigger_day INT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'due', 'overdue', 'completed', 'skipped', 'cancelled')),
  is_mandatory BOOLEAN DEFAULT true,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  skip_reason TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_journey_events_journey ON journey_events(journey_id);
CREATE INDEX idx_journey_events_status ON journey_events(status);
CREATE INDEX idx_journey_events_due_date ON journey_events(due_date);
CREATE INDEX idx_journey_events_type ON journey_events(type);

-- Triggers
CREATE TRIGGER tr_journey_templates_updated_at BEFORE UPDATE ON journey_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_journeys_updated_at BEFORE UPDATE ON journeys FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_journey_events_updated_at BEFORE UPDATE ON journey_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
