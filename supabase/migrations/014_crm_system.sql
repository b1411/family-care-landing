-- Migration 014: CRM System
-- Lead Pipeline, Family 360°, Segments, Campaigns, Call Center, Deals, Message Templates

-- ============================================
-- LEADS (Pre-conversion pipeline)
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  source TEXT NOT NULL DEFAULT 'phone'
    CHECK (source IN ('website', 'instagram', '2gis', 'referral', 'walk_in', 'phone', 'whatsapp', 'other')),
  stage TEXT NOT NULL DEFAULT 'new'
    CHECK (stage IN ('new', 'contacted', 'interested', 'negotiation', 'won', 'lost')),
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  lmp_date DATE,
  edd_date DATE,
  assigned_to UUID REFERENCES users(id),
  lost_reason TEXT,
  notes TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  family_id UUID REFERENCES families(id),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_clinic ON leads(clinic_id);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_leads_source ON leads(source);

CREATE TRIGGER tr_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage clinic leads"
  ON leads FOR ALL USING (
    is_staff() AND clinic_id = get_user_clinic_id()
  );

-- ============================================
-- LEAD ACTIVITIES (Interaction log for leads)
-- ============================================
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'call', 'whatsapp', 'sms', 'email', 'note', 'meeting', 'demo', 'status_change'
  )),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  summary TEXT,
  duration_seconds INT,
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lead_activities_lead ON lead_activities(lead_id);

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage lead activities"
  ON lead_activities FOR ALL USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM leads WHERE id = lead_activities.lead_id AND clinic_id = get_user_clinic_id()
    )
  );

-- ============================================
-- FAMILY ACTIVITIES (Unified interaction log)
-- ============================================
CREATE TABLE family_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  type TEXT NOT NULL CHECK (type IN (
    'call', 'whatsapp', 'sms', 'email', 'note',
    'appointment_created', 'appointment_completed', 'appointment_cancelled',
    'task_created', 'task_completed',
    'prescription_created', 'document_uploaded',
    'journey_started', 'journey_completed',
    'dose_missed', 'status_change', 'package_purchased'
  )),
  summary TEXT NOT NULL,
  detail_json JSONB DEFAULT '{}',
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_family_activities_family ON family_activities(family_id);
CREATE INDEX idx_family_activities_clinic ON family_activities(clinic_id);
CREATE INDEX idx_family_activities_type ON family_activities(type);
CREATE INDEX idx_family_activities_created ON family_activities(created_at DESC);

ALTER TABLE family_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage clinic family activities"
  ON family_activities FOR ALL USING (
    is_staff() AND clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Family members can read own activities"
  ON family_activities FOR SELECT USING (
    is_family_member(family_id)
  );

-- ============================================
-- FAMILY NOTES (Free-form notes)
-- ============================================
CREATE TABLE family_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_family_notes_family ON family_notes(family_id);

CREATE TRIGGER tr_family_notes_updated_at BEFORE UPDATE ON family_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE family_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage clinic family notes"
  ON family_notes FOR ALL USING (
    is_staff() AND EXISTS (
      SELECT 1 FROM families WHERE id = family_notes.family_id AND clinic_id = get_user_clinic_id()
    )
  );

-- ============================================
-- SEGMENTS (Audience segmentation)
-- ============================================
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  name TEXT NOT NULL,
  description TEXT,
  criteria_json JSONB NOT NULL DEFAULT '{"conditions":[],"logic":"and"}',
  is_dynamic BOOLEAN DEFAULT true,
  family_count INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_segments_clinic ON segments(clinic_id);

CREATE TRIGGER tr_segments_updated_at BEFORE UPDATE ON segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage clinic segments"
  ON segments FOR ALL USING (
    is_staff() AND clinic_id = get_user_clinic_id()
  );

-- ============================================
-- MESSAGE TEMPLATES (Reusable templates)
-- ============================================
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'push', 'sms', 'email')),
  subject TEXT,
  body TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'ru',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_message_templates_clinic ON message_templates(clinic_id);

CREATE TRIGGER tr_message_templates_updated_at BEFORE UPDATE ON message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage clinic message templates"
  ON message_templates FOR ALL USING (
    is_staff() AND clinic_id = get_user_clinic_id()
  );

-- ============================================
-- CAMPAIGNS (Drip campaigns)
-- ============================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'one_time'
    CHECK (type IN ('drip', 'one_time', 'recurring')),
  segment_id UUID REFERENCES segments(id),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  steps_json JSONB NOT NULL DEFAULT '[]',
  ab_test_config JSONB,
  stats_json JSONB DEFAULT '{"sent":0,"delivered":0,"opened":0,"converted":0}',
  created_by UUID REFERENCES users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaigns_clinic ON campaigns(clinic_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

CREATE TRIGGER tr_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage clinic campaigns"
  ON campaigns FOR ALL USING (
    is_staff() AND clinic_id = get_user_clinic_id()
  );

-- ============================================
-- CAMPAIGN ENROLLMENTS
-- ============================================
CREATE TABLE campaign_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  current_step INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'cancelled', 'converted')),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  last_step_sent_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  UNIQUE(campaign_id, family_id)
);

CREATE INDEX idx_campaign_enrollments_campaign ON campaign_enrollments(campaign_id);
CREATE INDEX idx_campaign_enrollments_family ON campaign_enrollments(family_id);
CREATE INDEX idx_campaign_enrollments_status ON campaign_enrollments(status);

ALTER TABLE campaign_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage campaign enrollments"
  ON campaign_enrollments FOR ALL USING (
    is_staff() AND EXISTS (
      SELECT 1 FROM campaigns WHERE id = campaign_enrollments.campaign_id AND clinic_id = get_user_clinic_id()
    )
  );

-- ============================================
-- CALL SCRIPTS (Decision trees for coordinators)
-- ============================================
CREATE TABLE call_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  task_type TEXT NOT NULL,
  name TEXT NOT NULL,
  steps_json JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_call_scripts_clinic ON call_scripts(clinic_id);

CREATE TRIGGER tr_call_scripts_updated_at BEFORE UPDATE ON call_scripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE call_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage clinic call scripts"
  ON call_scripts FOR ALL USING (
    is_staff() AND clinic_id = get_user_clinic_id()
  );

-- ============================================
-- CALL LOGS
-- ============================================
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  family_id UUID REFERENCES families(id),
  lead_id UUID REFERENCES leads(id),
  caller_id UUID NOT NULL REFERENCES users(id),
  direction TEXT NOT NULL DEFAULT 'outbound'
    CHECK (direction IN ('inbound', 'outbound')),
  duration_seconds INT DEFAULT 0,
  outcome TEXT NOT NULL CHECK (outcome IN (
    'answered', 'no_answer', 'busy', 'voicemail', 'callback_requested', 'wrong_number'
  )),
  script_id UUID REFERENCES call_scripts(id),
  script_answers_json JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_call_logs_clinic ON call_logs(clinic_id);
CREATE INDEX idx_call_logs_family ON call_logs(family_id);
CREATE INDEX idx_call_logs_lead ON call_logs(lead_id);
CREATE INDEX idx_call_logs_caller ON call_logs(caller_id);

ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage clinic call logs"
  ON call_logs FOR ALL USING (
    is_staff() AND clinic_id = get_user_clinic_id()
  );

-- ============================================
-- DEALS (Revenue pipeline)
-- ============================================
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  family_id UUID REFERENCES families(id),
  lead_id UUID REFERENCES leads(id),
  package_id UUID REFERENCES service_packages(id),
  amount NUMERIC(12,2),
  stage TEXT NOT NULL DEFAULT 'proposed'
    CHECK (stage IN ('proposed', 'negotiation', 'approved', 'paid', 'cancelled')),
  proposed_by UUID REFERENCES users(id),
  proposed_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  payment_method TEXT,
  invoice_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_deals_clinic ON deals(clinic_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_family ON deals(family_id);
CREATE INDEX idx_deals_lead ON deals(lead_id);

CREATE TRIGGER tr_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage clinic deals"
  ON deals FOR ALL USING (
    is_staff() AND clinic_id = get_user_clinic_id()
  );

-- ============================================
-- SLA FIELDS on coordinator_tasks
-- ============================================
ALTER TABLE coordinator_tasks
  ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN DEFAULT false;

-- ============================================
-- VIEW: Lead Funnel
-- ============================================
CREATE OR REPLACE VIEW v_lead_funnel AS
SELECT
  l.clinic_id,
  l.source,
  COUNT(*) FILTER (WHERE l.stage IN ('new','contacted','interested','negotiation','won','lost')) AS total_leads,
  COUNT(*) FILTER (WHERE l.stage = 'new') AS stage_new,
  COUNT(*) FILTER (WHERE l.stage = 'contacted') AS stage_contacted,
  COUNT(*) FILTER (WHERE l.stage = 'interested') AS stage_interested,
  COUNT(*) FILTER (WHERE l.stage = 'negotiation') AS stage_negotiation,
  COUNT(*) FILTER (WHERE l.stage = 'won') AS stage_won,
  COUNT(*) FILTER (WHERE l.stage = 'lost') AS stage_lost,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE l.stage = 'won') /
    NULLIF(COUNT(*), 0), 1
  ) AS conversion_pct,
  ROUND(
    AVG(EXTRACT(EPOCH FROM (l.converted_at - l.created_at)) / 86400)
    FILTER (WHERE l.stage = 'won'), 1
  ) AS avg_days_to_convert
FROM leads l
GROUP BY l.clinic_id, l.source;

-- ============================================
-- VIEW: Coordinator Performance (SLA)
-- ============================================
CREATE OR REPLACE VIEW v_coordinator_performance AS
SELECT
  u.id AS coordinator_id,
  u.first_name,
  u.last_name,
  u.clinic_id,
  COUNT(DISTINCT f.id) AS active_families,
  COUNT(ct.id) FILTER (WHERE ct.status = 'pending') AS pending_tasks,
  COUNT(ct.id) FILTER (WHERE ct.status = 'completed'
    AND ct.completed_at >= date_trunc('month', now())) AS completed_this_month,
  COUNT(ct.id) FILTER (WHERE ct.sla_breached = true
    AND ct.created_at >= date_trunc('month', now())) AS sla_breaches_this_month,
  ROUND(
    100.0 * COUNT(ct.id) FILTER (WHERE ct.sla_breached = false AND ct.status = 'completed'
      AND ct.completed_at >= date_trunc('month', now())) /
    NULLIF(COUNT(ct.id) FILTER (WHERE ct.status = 'completed'
      AND ct.completed_at >= date_trunc('month', now())), 0), 1
  ) AS sla_compliance_pct,
  ROUND(
    AVG(EXTRACT(EPOCH FROM (ct.first_response_at - ct.created_at)) / 60)
    FILTER (WHERE ct.first_response_at IS NOT NULL
      AND ct.created_at >= date_trunc('month', now())), 1
  ) AS avg_response_minutes
FROM users u
LEFT JOIN families f ON (f.primary_parent_id IS NOT NULL AND u.clinic_id = f.clinic_id)
LEFT JOIN coordinator_tasks ct ON ct.assigned_to = u.id
WHERE u.role = 'coordinator'
GROUP BY u.id, u.first_name, u.last_name, u.clinic_id;

-- ============================================
-- VIEW: Campaign Performance
-- ============================================
CREATE OR REPLACE VIEW v_campaign_performance AS
SELECT
  c.id AS campaign_id,
  c.clinic_id,
  c.name,
  c.type,
  c.status,
  COUNT(ce.id) AS total_enrolled,
  COUNT(ce.id) FILTER (WHERE ce.status = 'active') AS active_enrollments,
  COUNT(ce.id) FILTER (WHERE ce.status = 'completed') AS completed_enrollments,
  COUNT(ce.id) FILTER (WHERE ce.status = 'converted') AS converted_enrollments,
  ROUND(
    100.0 * COUNT(ce.id) FILTER (WHERE ce.status = 'converted') /
    NULLIF(COUNT(ce.id), 0), 1
  ) AS conversion_pct,
  c.started_at,
  c.created_at
FROM campaigns c
LEFT JOIN campaign_enrollments ce ON ce.campaign_id = c.id
GROUP BY c.id;
