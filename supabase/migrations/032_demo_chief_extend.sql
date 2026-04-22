-- ============================================
-- Migration 032: Chief doctor demo extension
-- Расширяет seed 025: больше deviations, case_reviews, жалоб, acknowledgements.
-- Идемпотентно: ON CONFLICT по UUID.
-- ============================================

-- ============================================
-- 1. PROTOCOL ACKNOWLEDGEMENTS — Сауле подтверждает все 3 протокола
-- ============================================
INSERT INTO protocol_acknowledgements (protocol_id, doctor_id, version_acknowledged, acknowledged_at)
VALUES
  ('A0000000-0000-0000-0000-000000000001','BD000000-0000-0000-0000-000000000001', 2, now() - INTERVAL '2 days'),
  ('A0000000-0000-0000-0000-000000000002','BD000000-0000-0000-0000-000000000001', 1, now() - INTERVAL '5 days'),
  ('A0000000-0000-0000-0000-000000000003','BD000000-0000-0000-0000-000000000001', 1, now() - INTERVAL '1 day')
ON CONFLICT (protocol_id, doctor_id) DO UPDATE
  SET version_acknowledged = EXCLUDED.version_acknowledged,
      acknowledged_at = EXCLUDED.acknowledged_at;

-- ============================================
-- 2. ADDITIONAL DEVIATIONS — 4 разных типа
-- Прикрепляем к существующим completed-приёмам в демо-клинике.
-- ============================================
DO $$
DECLARE
  v_apt_z001 uuid;
  v_apt_o14  uuid;
  v_apt_j06  uuid;
BEGIN
  -- Подбираем по 1 приёму на каждый ICD-10
  SELECT a.id INTO v_apt_z001
  FROM appointments a JOIN families f ON f.id = a.family_id
  WHERE f.clinic_id = '10000000-0000-0000-0000-000000000001'
    AND a.status = 'completed' AND a.icd10_primary = 'Z00.1'
  ORDER BY a.appointment_date DESC LIMIT 1;

  SELECT a.id INTO v_apt_o14
  FROM appointments a JOIN families f ON f.id = a.family_id
  WHERE f.clinic_id = '10000000-0000-0000-0000-000000000001'
    AND a.status = 'completed' AND a.icd10_primary = 'O14'
  ORDER BY a.appointment_date DESC LIMIT 1;

  SELECT a.id INTO v_apt_j06
  FROM appointments a JOIN families f ON f.id = a.family_id
  WHERE f.clinic_id = '10000000-0000-0000-0000-000000000001'
    AND a.status = 'completed' AND a.icd10_primary = 'J06'
  ORDER BY a.appointment_date DESC LIMIT 1;

  -- forbidden_drug — нашли запрещённый ибупрофен при O14
  IF v_apt_o14 IS NOT NULL THEN
    INSERT INTO protocol_deviations (id, clinic_id, appointment_id, doctor_id, protocol_id, kind, severity, details, detected_at, resolved, justified)
    VALUES (
      'DE000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000001',
      v_apt_o14,
      'BD000000-0000-0000-0000-000000000001',
      'A0000000-0000-0000-0000-000000000001',
      'forbidden_drug', 'high',
      '{"drug":"Ибупрофен","reason":"NSAID противопоказан при беременности III триместра"}'::jsonb,
      now() - INTERVAL '2 days', false, false
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  -- polypharmacy — слишком много препаратов в один приём
  IF v_apt_z001 IS NOT NULL THEN
    INSERT INTO protocol_deviations (id, clinic_id, appointment_id, doctor_id, protocol_id, kind, severity, details, detected_at, resolved, justified)
    VALUES (
      'DE000000-0000-0000-0000-000000000003',
      '10000000-0000-0000-0000-000000000001',
      v_apt_z001,
      'BD000000-0000-0000-0000-000000000001',
      'A0000000-0000-0000-0000-000000000002',
      'polypharmacy', 'medium',
      '{"prescriptions_count":6,"max_allowed":3}'::jsonb,
      now() - INTERVAL '3 days', false, false
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  -- no_follow_up — не назначен повторный визит
  IF v_apt_j06 IS NOT NULL THEN
    INSERT INTO protocol_deviations (id, clinic_id, appointment_id, doctor_id, protocol_id, kind, severity, details, detected_at, resolved, justified, justification_note, justified_by, justified_at)
    VALUES (
      'DE000000-0000-0000-0000-000000000004',
      '10000000-0000-0000-0000-000000000001',
      v_apt_j06,
      'BD000000-0000-0000-0000-000000000001',
      'A0000000-0000-0000-0000-000000000003',
      'no_follow_up', 'low',
      '{"expected_days":10,"actual_followup":null}'::jsonb,
      now() - INTERVAL '4 days', true, true,
      'Семья отказалась от повторного визита, симптомы прошли',
      'D0000000-0000-0000-0000-000000000005',
      now() - INTERVAL '3 days'
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  -- duration_too_short — приём короче 5 минут
  IF v_apt_z001 IS NOT NULL THEN
    INSERT INTO protocol_deviations (id, clinic_id, appointment_id, doctor_id, protocol_id, kind, severity, details, detected_at, resolved, justified)
    VALUES (
      'DE000000-0000-0000-0000-000000000005',
      '10000000-0000-0000-0000-000000000001',
      v_apt_z001,
      'BD000000-0000-0000-0000-000000000001',
      'A0000000-0000-0000-0000-000000000002',
      'duration_too_short', 'medium',
      '{"actual_minutes":4,"expected_minutes":15}'::jsonb,
      now() - INTERVAL '1 day', false, false
    ) ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 3. ADDITIONAL CASE REVIEWS — 4 разных триггера
-- ============================================
DO $$
DECLARE
  v_apt_recent uuid;
BEGIN
  SELECT a.id INTO v_apt_recent
  FROM appointments a JOIN families f ON f.id = a.family_id
  WHERE f.clinic_id = '10000000-0000-0000-0000-000000000001'
    AND a.status = 'completed'
  ORDER BY a.appointment_date DESC LIMIT 1;

  INSERT INTO case_reviews (id, clinic_id, family_id, doctor_id, appointment_id, trigger, trigger_ref_id, status, priority, chief_comment, created_at)
  VALUES
    ('CC000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000001','BD000000-0000-0000-0000-000000000001',
     v_apt_recent, 'protocol_deviation','DE000000-0000-0000-0000-000000000002', 'in_review','high',
     'Нужно проверить обоснованность назначения NSAID при беременности.', now() - INTERVAL '1 day'),
    ('CC000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000004','BD000000-0000-0000-0000-000000000001',
     v_apt_recent, 'rx_alert', NULL, 'queued','critical', NULL, now() - INTERVAL '6 hours'),
    ('CC000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000003','BD000000-0000-0000-0000-000000000001',
     v_apt_recent, 'manual', NULL, 'closed','normal',
     'Проверка завершена. Нарушений не выявлено, назначения обоснованы.', now() - INTERVAL '7 days'),
    ('CC000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000005','BD000000-0000-0000-0000-000000000001',
     v_apt_recent, 'no_progress', NULL, 'in_review','high',
     'Низкая динамика выздоровления — нужен второй взгляд.', now() - INTERVAL '2 days')
  ON CONFLICT (id) DO NOTHING;

  -- Закрытие "manual" с decision
  UPDATE case_reviews
  SET decision = 'no_violation',
      reviewed_by = 'D0000000-0000-0000-0000-000000000005',
      reviewed_at = now() - INTERVAL '6 days'
  WHERE id = 'CC000000-0000-0000-0000-000000000004';
END $$;

-- ============================================
-- 4. ADDITIONAL COMPLAINTS — 3 шт + закрытие одной старой
-- ============================================
INSERT INTO complaints (id, clinic_id, family_id, appointment_id, doctor_id, submitted_by, kind, severity, body, status, sla_due_at, created_at)
VALUES
  ('CA000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000003', NULL, 'BD000000-0000-0000-0000-000000000001','D0000000-0000-0000-0000-000000000011',
   'service','medium','Долгое ожидание ответа в чате — более 4 часов в будний день.','new', now() + INTERVAL '24 hours', now() - INTERVAL '8 hours'),
  ('CA000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000004', NULL, 'BD000000-0000-0000-0000-000000000001','D0000000-0000-0000-0000-000000000012',
   'medical','critical','Назначен препарат, противопоказанный при моём диагнозе. Хочу разъяснений.','in_review', now() + INTERVAL '12 hours', now() - INTERVAL '20 hours'),
  ('CA000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','F0000000-0000-0000-0000-000000000005', NULL, NULL, 'D0000000-0000-0000-0000-000000000013',
   'billing','low','Не пришёл чек на оплату пакета.','resolved', now() + INTERVAL '48 hours', now() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Закрываем resolved-жалобу
UPDATE complaints
SET resolved_at = now() - INTERVAL '8 days',
    resolved_by = 'D0000000-0000-0000-0000-000000000003',
    resolution_note = 'Чек выслан повторно на email. Приносим извинения.'
WHERE id = 'CA000000-0000-0000-0000-000000000006';

-- Старая "in_review" service-жалоба закрыта
UPDATE complaints
SET status = 'resolved',
    resolved_at = now() - INTERVAL '1 day',
    resolved_by = 'D0000000-0000-0000-0000-000000000005',
    resolution_note = 'Регистратура усилена в часы пик, добавлен 1 сотрудник.'
WHERE id = 'CA000000-0000-0000-0000-000000000002';

-- VISIT RATINGS — already populated with 100 rows elsewhere, skipping

-- ============================================
-- ИТОГ
-- ============================================
DO $$
DECLARE v_ack int; v_dev int; v_cr int; v_cmp int; v_alerts int;
BEGIN
  SELECT count(*) INTO v_ack FROM protocol_acknowledgements WHERE doctor_id = 'BD000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_dev FROM protocol_deviations WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_cr  FROM case_reviews WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO v_cmp FROM complaints WHERE clinic_id = '10000000-0000-0000-0000-000000000001';
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescription_alerts') THEN
    EXECUTE 'SELECT count(*) FROM prescription_alerts WHERE clinic_id = ''10000000-0000-0000-0000-000000000001''' INTO v_alerts;
  ELSE
    v_alerts := -1;
  END IF;
  RAISE NOTICE '032 chief extend: acks=%, deviations=%, case_reviews=%, complaints=%, rx_alerts=%',
    v_ack, v_dev, v_cr, v_cmp, v_alerts;
END $$;
