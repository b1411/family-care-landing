-- Migration 024: Quality views — v_doctor_quality, v_clinic_quality_overview
-- Views render the chief-doctor Overview and Doctors registry without heavy
-- client-side joins. RLS applies through underlying tables — chief sees
-- only their clinic.

-- ============================================
-- 1. Per-doctor quality profile (last 30 days)
-- ============================================
CREATE OR REPLACE VIEW v_doctor_quality AS
WITH recent_appts AS (
  SELECT
    a.id, a.doctor_id, a.status, a.icd10_primary,
    a.start_time, a.end_time, a.completion_checklist,
    EXTRACT(EPOCH FROM (a.end_time - a.start_time))/60 AS duration_min
  FROM appointments a
  WHERE a.appointment_date >= (now() - INTERVAL '30 days')
),
recent_rx AS (
  SELECT p.id, p.doctor_id, p.inn_name, p.is_active
  FROM prescriptions p
  WHERE p.created_at >= (now() - INTERVAL '30 days')
),
ratings AS (
  SELECT a.doctor_id, vr.rating
  FROM visit_ratings vr
  JOIN appointments a ON a.id = vr.appointment_id
  WHERE a.appointment_date >= (now() - INTERVAL '30 days')
)
SELECT
  d.id AS doctor_id,
  d.clinic_id,
  d.specialty,
  COALESCE(u.last_name || ' ' || u.first_name, 'Без имени') AS full_name,
  (SELECT count(*) FROM recent_appts WHERE doctor_id = d.id) AS appointments_30d,
  (SELECT count(*) FROM recent_appts WHERE doctor_id = d.id AND status = 'completed') AS completed_30d,
  (SELECT count(*) FROM recent_appts WHERE doctor_id = d.id AND status = 'no_show') AS no_show_30d,
  (SELECT ROUND(avg(duration_min)::numeric, 0)::int
     FROM recent_appts WHERE doctor_id = d.id AND status = 'completed' AND duration_min > 0) AS avg_duration_min,
  (SELECT CASE WHEN count(*) = 0 THEN NULL
               ELSE ROUND(100.0 * count(*) FILTER (WHERE icd10_primary IS NOT NULL) / count(*)) END
     FROM recent_appts WHERE doctor_id = d.id) AS icd_coverage_pct,
  (SELECT count(*) FROM recent_rx WHERE doctor_id = d.id AND is_active = true) AS active_rx,
  (SELECT CASE WHEN count(*) FILTER (WHERE is_active = true) = 0 THEN NULL
               ELSE ROUND(100.0 * count(*) FILTER (WHERE is_active = true AND inn_name IS NOT NULL)
                         / count(*) FILTER (WHERE is_active = true)) END
     FROM recent_rx WHERE doctor_id = d.id) AS inn_coverage_pct,
  (SELECT ROUND(avg(rating)::numeric, 1) FROM ratings WHERE doctor_id = d.id) AS avg_rating,
  (SELECT count(*) FROM protocol_deviations pd
     WHERE pd.doctor_id = d.id AND pd.detected_at >= (now() - INTERVAL '30 days')) AS deviations_30d,
  (SELECT count(*) FROM complaints c
     WHERE c.doctor_id = d.id AND c.kind = 'medical'
       AND c.created_at >= (now() - INTERVAL '30 days')) AS medical_complaints_30d,
  (SELECT count(*) FROM prescription_alerts pa
     WHERE pa.doctor_id = d.id AND pa.severity = 'critical' AND pa.status = 'open') AS open_critical_alerts
FROM doctors d
JOIN users u ON u.id = d.user_id
WHERE d.is_active = true;

-- ============================================
-- 2. Clinic quality overview
-- ============================================
CREATE OR REPLACE VIEW v_clinic_quality_overview AS
WITH recent_appts AS (
  SELECT
    a.id, a.doctor_id, a.status, a.icd10_primary, a.completion_checklist,
    f.clinic_id
  FROM appointments a
  JOIN families f ON f.id = a.family_id
  WHERE a.appointment_date >= (now() - INTERVAL '30 days')
),
clinic_ids AS (
  SELECT DISTINCT c.id AS clinic_id FROM clinics c WHERE c.is_active = true
)
SELECT
  ci.clinic_id,
  (SELECT count(*) FROM recent_appts WHERE clinic_id = ci.clinic_id) AS appointments_30d,
  (SELECT count(*) FROM recent_appts WHERE clinic_id = ci.clinic_id AND status = 'completed')
    AS completed_30d,
  (SELECT CASE WHEN count(*) = 0 THEN NULL
               ELSE ROUND(100.0 * count(*) FILTER (WHERE icd10_primary IS NOT NULL) / count(*)) END
     FROM recent_appts WHERE clinic_id = ci.clinic_id) AS icd_coverage_pct,
  (SELECT count(*) FROM protocol_deviations pd
     WHERE pd.clinic_id = ci.clinic_id AND pd.detected_at >= (now() - INTERVAL '30 days')) AS deviations_30d,
  (SELECT count(*) FROM protocol_deviations pd
     WHERE pd.clinic_id = ci.clinic_id AND pd.resolved = false) AS open_deviations,
  (SELECT count(*) FROM complaints c
     WHERE c.clinic_id = ci.clinic_id AND c.kind = 'medical'
       AND c.created_at >= (now() - INTERVAL '30 days')) AS medical_complaints_30d,
  (SELECT count(*) FROM complaints c
     WHERE c.clinic_id = ci.clinic_id AND c.status IN ('new', 'in_review')) AS open_complaints,
  (SELECT count(*) FROM case_reviews cr
     WHERE cr.clinic_id = ci.clinic_id AND cr.status = 'queued') AS queued_case_reviews,
  (SELECT count(*) FROM prescription_alerts pa
     WHERE pa.clinic_id = ci.clinic_id AND pa.status = 'open' AND pa.severity = 'critical')
    AS open_critical_alerts,
  (SELECT count(*) FROM doctors d
     WHERE d.clinic_id = ci.clinic_id AND d.is_active = true) AS active_doctors
FROM clinic_ids ci;

-- NOTE: Views inherit RLS from their source tables. Chief doctor's
-- SELECT policies on appointments/prescriptions/protocol_deviations/etc
-- (from migration 019 + 022 + 023) automatically restrict v_* to their clinic.
