-- Migration 005: Operations — Coordinator Tasks, Notifications

-- ============================================
-- COORDINATOR TASKS
-- ============================================
CREATE TABLE coordinator_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  family_id UUID REFERENCES families(id),
  type TEXT NOT NULL CHECK (type IN (
    'welcome_call', 'overdue_followup', 'missed_appointment',
    'low_adherence', 'vaccination_reminder', 'reactivation',
    'epds_alert', 'custom'
  )),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  assigned_to UUID REFERENCES users(id),
  due_date DATE,
  title TEXT NOT NULL,
  notes TEXT,
  result TEXT,
  created_by TEXT DEFAULT 'system',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tasks_clinic ON coordinator_tasks(clinic_id);
CREATE INDEX idx_tasks_family ON coordinator_tasks(family_id);
CREATE INDEX idx_tasks_status ON coordinator_tasks(status);
CREATE INDEX idx_tasks_priority ON coordinator_tasks(priority);
CREATE INDEX idx_tasks_assigned ON coordinator_tasks(assigned_to);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'in_app'
    CHECK (channel IN ('in_app', 'push', 'whatsapp', 'sms', 'email')),
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE status != 'read';

-- Triggers
CREATE TRIGGER tr_tasks_updated_at BEFORE UPDATE ON coordinator_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VISIT RATINGS (needed by analytics views)
-- ============================================
CREATE TABLE visit_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  family_id UUID NOT NULL REFERENCES families(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ratings_appointment ON visit_ratings(appointment_id);
