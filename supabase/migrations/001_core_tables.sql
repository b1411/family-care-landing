-- Migration 001: Core Tables
-- Clinics, Users, Families, Mother/Child Profiles, Consents

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CLINICS
-- ============================================
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  theme_json JSONB DEFAULT '{}',
  settings_json JSONB DEFAULT '{}',
  timezone TEXT DEFAULT 'Asia/Almaty',
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'mother'
    CHECK (role IN ('mother', 'father', 'grandmother', 'coordinator', 'doctor', 'nurse', 'admin', 'superadmin')),
  clinic_id UUID REFERENCES clinics(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_clinic ON users(clinic_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- FAMILIES
-- ============================================
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  primary_parent_id UUID NOT NULL REFERENCES users(id),
  secondary_parent_id UUID REFERENCES users(id),
  invite_code TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_families_clinic ON families(clinic_id);
CREATE INDEX idx_families_primary_parent ON families(primary_parent_id);
CREATE INDEX idx_families_invite_code ON families(invite_code) WHERE invite_code IS NOT NULL;

-- ============================================
-- MOTHER PROFILES
-- ============================================
CREATE TABLE mother_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  lmp_date DATE,
  edd_date DATE,
  blood_type TEXT,
  rh_factor TEXT CHECK (rh_factor IN ('positive', 'negative')),
  allergies TEXT[],
  chronic_conditions TEXT[],
  pregnancy_number INT DEFAULT 1,
  gravida INT,
  para INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mother_profiles_family ON mother_profiles(family_id);

-- ============================================
-- CHILD PROFILES
-- ============================================
CREATE TABLE child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dob DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  birth_weight NUMERIC(5,2),
  birth_height NUMERIC(5,2),
  apgar_1min INT,
  apgar_5min INT,
  blood_type TEXT,
  allergies TEXT[],
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_child_profiles_family ON child_profiles(family_id);

-- ============================================
-- CONSENTS
-- ============================================
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('push', 'whatsapp', 'sms', 'email', 'data_sharing', 'ai', 'telemedicine')),
  granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_consents_user_type ON consents(user_id, type);

-- ============================================
-- Triggers: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_mother_profiles_updated_at BEFORE UPDATE ON mother_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_child_profiles_updated_at BEFORE UPDATE ON child_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
