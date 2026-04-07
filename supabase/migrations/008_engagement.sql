-- Migration 008: Engagement & Loyalty
-- Achievements, Streaks, Referrals, Loyalty Points, NPS

-- ============================================
-- ACHIEVEMENTS
-- ============================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  criteria_json JSONB NOT NULL DEFAULT '{}',
  category TEXT DEFAULT 'general',
  points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_user_achievements_unique ON user_achievements(user_id, achievement_id);

-- ============================================
-- STREAKS
-- ============================================
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  current_count INT NOT NULL DEFAULT 0,
  longest_count INT NOT NULL DEFAULT 0,
  last_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_streaks_user_type ON streaks(user_id, type);

-- ============================================
-- REFERRALS
-- ============================================
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_family_id UUID NOT NULL REFERENCES families(id),
  referred_family_id UUID REFERENCES families(id),
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'registered', 'active', 'rewarded')),
  reward TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_family_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

-- ============================================
-- LOYALTY POINTS
-- ============================================
CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  points INT NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_loyalty_family ON loyalty_points(family_id);

-- ============================================
-- NPS RESPONSES
-- ============================================
CREATE TABLE nps_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  score INT NOT NULL CHECK (score BETWEEN 0 AND 10),
  event_type TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_nps_family ON nps_responses(family_id);
CREATE INDEX idx_nps_score ON nps_responses(score);

-- Triggers
CREATE TRIGGER tr_streaks_updated_at BEFORE UPDATE ON streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
