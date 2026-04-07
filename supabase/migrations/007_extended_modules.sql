-- Migration 007: Extended Modules
-- Health Passport, AI, Video, Mood, Growth, Feeding, Sleep, SOS, Education

-- ============================================
-- HEALTH PASSPORT ENTRIES
-- ============================================
CREATE TABLE health_passport_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_ids UUID[],
  doctor_id UUID REFERENCES doctors(id),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hp_entries_child ON health_passport_entries(child_id);
CREATE INDEX idx_hp_entries_date ON health_passport_entries(date);

-- ============================================
-- AI CONVERSATIONS
-- ============================================
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES child_profiles(id),
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  message_index INT NOT NULL,
  was_helpful BOOLEAN,
  doctor_agreed BOOLEAN,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- VIDEO CONSULTATIONS
-- ============================================
CREATE TABLE video_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  family_id UUID NOT NULL REFERENCES families(id),
  child_id UUID REFERENCES child_profiles(id),
  appointment_id UUID REFERENCES appointments(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INT,
  room_url TEXT,
  recording_url TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'missed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MOOD LOGS
-- ============================================
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mood_logs_user ON mood_logs(user_id);
CREATE INDEX idx_mood_logs_date ON mood_logs(date);
CREATE UNIQUE INDEX idx_mood_logs_user_date ON mood_logs(user_id, date);

-- ============================================
-- EPDS SCREENINGS
-- ============================================
CREATE TABLE epds_screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  answers JSONB NOT NULL,
  total_score INT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_epds_user ON epds_screenings(user_id);

-- ============================================
-- GROWTH METRICS
-- ============================================
CREATE TABLE growth_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  head_cm NUMERIC(5,2),
  measured_by TEXT DEFAULT 'parent',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_growth_child ON growth_metrics(child_id);
CREATE INDEX idx_growth_date ON growth_metrics(date);

-- ============================================
-- MILESTONES
-- ============================================
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  achieved_at DATE,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_milestones_child ON milestones(child_id);

-- ============================================
-- FEEDING LOGS
-- ============================================
CREATE TABLE feeding_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('breast', 'formula', 'solid', 'mixed')),
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_minutes INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_feeding_child ON feeding_logs(child_id);
CREATE INDEX idx_feeding_timestamp ON feeding_logs(timestamp);

-- ============================================
-- FOOD INTRODUCTIONS
-- ============================================
CREATE TABLE food_introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  food TEXT NOT NULL,
  introduced_at DATE NOT NULL,
  reaction TEXT,
  status TEXT DEFAULT 'safe' CHECK (status IN ('safe', 'reaction', 'avoid', 'pending')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_food_intro_child ON food_introductions(child_id);

-- ============================================
-- SLEEP LOGS
-- ============================================
CREATE TABLE sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_start TIMESTAMPTZ NOT NULL,
  sleep_end TIMESTAMPTZ,
  type TEXT NOT NULL CHECK (type IN ('night', 'nap')),
  wake_ups INT DEFAULT 0,
  quality TEXT CHECK (quality IN ('good', 'fair', 'poor')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sleep_child ON sleep_logs(child_id);
CREATE INDEX idx_sleep_date ON sleep_logs(date);

-- ============================================
-- SOS EVENTS
-- ============================================
CREATE TABLE sos_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  child_id UUID REFERENCES child_profiles(id),
  category TEXT NOT NULL,
  symptoms TEXT[],
  triage_result TEXT NOT NULL CHECK (triage_result IN ('emergency', 'urgent', 'non_urgent')),
  actions_taken TEXT,
  resolved_at TIMESTAMPTZ,
  location JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sos_family ON sos_events(family_id);

-- ============================================
-- EDUCATION CONTENT
-- ============================================
CREATE TABLE education_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  type TEXT NOT NULL CHECK (type IN ('article', 'checklist', 'video', 'infographic')),
  target_week INT,
  target_age_days INT,
  target_journey_type TEXT,
  title TEXT NOT NULL,
  body TEXT,
  excerpt TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE content_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES education_content(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_content_type ON education_content(type);
CREATE INDEX idx_content_views_user ON content_views(user_id);

-- Triggers
CREATE TRIGGER tr_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_video_consultations_updated_at BEFORE UPDATE ON video_consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_education_content_updated_at BEFORE UPDATE ON education_content FOR EACH ROW EXECUTE FUNCTION update_updated_at();
