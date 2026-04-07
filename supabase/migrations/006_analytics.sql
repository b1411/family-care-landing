-- Migration 006: Analytics & Config — Service Transactions, SQL Views

-- ============================================
-- SERVICE TRANSACTIONS
-- ============================================
CREATE TABLE service_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  service_type TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  doctor_id UUID REFERENCES doctors(id),
  appointment_id UUID REFERENCES appointments(id),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transactions_clinic ON service_transactions(clinic_id);
CREATE INDEX idx_transactions_family ON service_transactions(family_id);
CREATE INDEX idx_transactions_date ON service_transactions(date);

-- ============================================
-- ANALYTICS VIEWS
-- ============================================

-- Clinic Dashboard Overview
CREATE OR REPLACE VIEW v_clinic_dashboard AS
SELECT
  c.id AS clinic_id,
  c.name AS clinic_name,
  COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'active') AS active_families,
  COUNT(DISTINCT j.id) FILTER (WHERE j.status = 'active') AS active_journeys,
  COUNT(DISTINCT je.id) FILTER (WHERE je.status = 'overdue') AS overdue_events,
  COUNT(DISTINCT ct.id) FILTER (WHERE ct.status = 'pending') AS pending_tasks,
  COALESCE(
    ROUND(
      COUNT(DISTINCT je.id) FILTER (WHERE je.status = 'completed')::NUMERIC /
      NULLIF(COUNT(DISTINCT je.id) FILTER (WHERE je.is_mandatory), 0) * 100, 1
    ), 0
  ) AS compliance_percent,
  COALESCE(SUM(st.amount) FILTER (WHERE st.date >= date_trunc('month', CURRENT_DATE)), 0) AS monthly_revenue
FROM clinics c
LEFT JOIN families f ON f.clinic_id = c.id
LEFT JOIN journeys j ON j.family_id = f.id
LEFT JOIN journey_events je ON je.journey_id = j.id
LEFT JOIN coordinator_tasks ct ON ct.clinic_id = c.id
LEFT JOIN service_transactions st ON st.clinic_id = c.id
GROUP BY c.id, c.name;

-- Doctor Performance
CREATE OR REPLACE VIEW v_doctor_performance AS
SELECT
  d.id AS doctor_id,
  d.clinic_id,
  u.first_name || ' ' || u.last_name AS doctor_name,
  d.specialty,
  COUNT(DISTINCT a.id) AS total_appointments,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') AS completed_appointments,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'no_show') AS no_shows,
  COALESCE(AVG(vr.rating), 0) AS avg_rating,
  COALESCE(SUM(st.amount), 0) AS total_revenue
FROM doctors d
JOIN users u ON u.id = d.user_id
LEFT JOIN appointments a ON a.doctor_id = d.id
LEFT JOIN visit_ratings vr ON vr.appointment_id = a.id
LEFT JOIN service_transactions st ON st.doctor_id = d.id
GROUP BY d.id, d.clinic_id, u.first_name, u.last_name, d.specialty;
