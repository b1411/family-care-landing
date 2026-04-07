-- Migration 010: Row Level Security (RLS) Policies
-- All tables require RLS to be enabled + appropriate policies

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE mother_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordinator_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_passport_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE epds_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user's clinic_id
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user belongs to a family
CREATE OR REPLACE FUNCTION is_family_member(family_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM families
    WHERE id = family_uuid
    AND (primary_parent_id = auth.uid() OR secondary_parent_id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is staff (coordinator, doctor, nurse, admin)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('coordinator', 'doctor', 'nurse', 'admin', 'superadmin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- USERS POLICIES
-- ============================================
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT USING (id = auth.uid());

CREATE POLICY "Staff can read clinic users"
  ON users FOR SELECT USING (
    is_staff() AND clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admin can manage clinic users"
  ON users FOR ALL USING (
    get_user_role() IN ('admin', 'superadmin')
    AND clinic_id = get_user_clinic_id()
  );

-- ============================================
-- CLINICS POLICIES
-- ============================================
CREATE POLICY "Users can read own clinic"
  ON clinics FOR SELECT USING (id = get_user_clinic_id());

CREATE POLICY "Admin can update own clinic"
  ON clinics FOR UPDATE USING (
    get_user_role() IN ('admin', 'superadmin')
    AND id = get_user_clinic_id()
  );

-- ============================================
-- FAMILIES POLICIES
-- ============================================
CREATE POLICY "Family members can read own family"
  ON families FOR SELECT USING (is_family_member(id));

CREATE POLICY "Staff can read clinic families"
  ON families FOR SELECT USING (
    is_staff() AND clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Family members can update own family"
  ON families FOR UPDATE USING (is_family_member(id));

-- ============================================
-- CHILD PROFILES POLICIES
-- ============================================
CREATE POLICY "Family members can read own children"
  ON child_profiles FOR SELECT USING (is_family_member(family_id));

CREATE POLICY "Staff can read clinic children"
  ON child_profiles FOR SELECT USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM families WHERE id = child_profiles.family_id AND clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Family members can manage children"
  ON child_profiles FOR ALL USING (is_family_member(family_id));

-- ============================================
-- MOTHER PROFILES POLICIES
-- ============================================
CREATE POLICY "Family members can read mother profile"
  ON mother_profiles FOR SELECT USING (is_family_member(family_id));

CREATE POLICY "Mother can update own profile"
  ON mother_profiles FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Staff can read clinic mother profiles"
  ON mother_profiles FOR SELECT USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM families WHERE id = mother_profiles.family_id AND clinic_id = get_user_clinic_id()
    )
  );

-- ============================================
-- CONSENTS POLICIES
-- ============================================
CREATE POLICY "Users can manage own consents"
  ON consents FOR ALL USING (user_id = auth.uid());

-- ============================================
-- JOURNEYS / EVENTS POLICIES
-- ============================================
CREATE POLICY "Family members can read own journeys"
  ON journeys FOR SELECT USING (is_family_member(family_id));

CREATE POLICY "Staff can read clinic journeys"
  ON journeys FOR SELECT USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM families WHERE id = journeys.family_id AND clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Family members can read own journey events"
  ON journey_events FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM journeys j WHERE j.id = journey_events.journey_id AND is_family_member(j.family_id)
    )
  );

CREATE POLICY "Staff can read/update clinic journey events"
  ON journey_events FOR ALL USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM journeys j
      JOIN families f ON f.id = j.family_id
      WHERE j.id = journey_events.journey_id AND f.clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Family members can update own events"
  ON journey_events FOR UPDATE USING (
    EXISTS(
      SELECT 1 FROM journeys j WHERE j.id = journey_events.journey_id AND is_family_member(j.family_id)
    )
  );

-- ============================================
-- JOURNEY TEMPLATES — Clinic-scoped
-- ============================================
CREATE POLICY "Staff can read clinic templates"
  ON journey_templates FOR SELECT USING (
    clinic_id IS NULL OR clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Admin can manage clinic templates"
  ON journey_templates FOR ALL USING (
    get_user_role() IN ('admin', 'superadmin')
    AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id())
  );

-- ============================================
-- APPOINTMENTS POLICIES
-- ============================================
CREATE POLICY "Family members can read own appointments"
  ON appointments FOR SELECT USING (is_family_member(family_id));

CREATE POLICY "Family members can create appointments"
  ON appointments FOR INSERT WITH CHECK (is_family_member(family_id));

CREATE POLICY "Staff can manage clinic appointments"
  ON appointments FOR ALL USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM families WHERE id = appointments.family_id AND clinic_id = get_user_clinic_id()
    )
  );

-- ============================================
-- DOCUMENTS POLICIES
-- ============================================
CREATE POLICY "Family members can manage own documents"
  ON documents FOR ALL USING (is_family_member(family_id));

CREATE POLICY "Staff can read clinic documents"
  ON documents FOR SELECT USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM families WHERE id = documents.family_id AND clinic_id = get_user_clinic_id()
    )
  );

-- ============================================
-- PRESCRIPTIONS / DOSE LOGS POLICIES
-- ============================================
CREATE POLICY "Family members can read own prescriptions"
  ON prescriptions FOR SELECT USING (is_family_member(family_id));

CREATE POLICY "Staff can manage clinic prescriptions"
  ON prescriptions FOR ALL USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM families WHERE id = prescriptions.family_id AND clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Family members can read/update own dose logs"
  ON dose_logs FOR ALL USING (is_family_member(family_id));

CREATE POLICY "Staff can manage clinic dose logs"
  ON dose_logs FOR ALL USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM families WHERE id = dose_logs.family_id AND clinic_id = get_user_clinic_id()
    )
  );

-- ============================================
-- VACCINATIONS POLICIES
-- ============================================
CREATE POLICY "Family can read own vaccinations"
  ON vaccinations FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM child_profiles cp WHERE cp.id = vaccinations.child_id AND is_family_member(cp.family_id)
    )
  );

CREATE POLICY "Staff can manage clinic vaccinations"
  ON vaccinations FOR ALL USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM child_profiles cp
      JOIN families f ON f.id = cp.family_id
      WHERE cp.id = vaccinations.child_id AND f.clinic_id = get_user_clinic_id()
    )
  );

-- ============================================
-- COORDINATOR TASKS POLICIES
-- ============================================
CREATE POLICY "Coordinator can read/manage clinic tasks"
  ON coordinator_tasks FOR ALL USING (
    get_user_role() IN ('coordinator', 'admin', 'superadmin')
    AND clinic_id = get_user_clinic_id()
  );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- MOOD / EPDS POLICIES
-- ============================================
CREATE POLICY "Users can manage own mood logs"
  ON mood_logs FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Staff can read clinic mood logs"
  ON mood_logs FOR SELECT USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM users u
      JOIN families f ON f.primary_parent_id = u.id OR f.secondary_parent_id = u.id
      WHERE u.id = mood_logs.user_id AND f.clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Users can manage own EPDS"
  ON epds_screenings FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Staff can read clinic EPDS"
  ON epds_screenings FOR SELECT USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM users u
      JOIN families f ON f.primary_parent_id = u.id OR f.secondary_parent_id = u.id
      WHERE u.id = epds_screenings.user_id AND f.clinic_id = get_user_clinic_id()
    )
  );

-- ============================================
-- GROWTH / MILESTONES / FEEDING / SLEEP — child-scoped
-- ============================================
CREATE POLICY "Family can manage own growth metrics"
  ON growth_metrics FOR ALL USING (
    EXISTS(SELECT 1 FROM child_profiles cp WHERE cp.id = growth_metrics.child_id AND is_family_member(cp.family_id))
  );

CREATE POLICY "Family can manage own milestones"
  ON milestones FOR ALL USING (
    EXISTS(SELECT 1 FROM child_profiles cp WHERE cp.id = milestones.child_id AND is_family_member(cp.family_id))
  );

CREATE POLICY "Family can manage own feeding logs"
  ON feeding_logs FOR ALL USING (
    EXISTS(SELECT 1 FROM child_profiles cp WHERE cp.id = feeding_logs.child_id AND is_family_member(cp.family_id))
  );

CREATE POLICY "Family can manage own food introductions"
  ON food_introductions FOR ALL USING (
    EXISTS(SELECT 1 FROM child_profiles cp WHERE cp.id = food_introductions.child_id AND is_family_member(cp.family_id))
  );

CREATE POLICY "Family can manage own sleep logs"
  ON sleep_logs FOR ALL USING (
    EXISTS(SELECT 1 FROM child_profiles cp WHERE cp.id = sleep_logs.child_id AND is_family_member(cp.family_id))
  );

-- ============================================
-- HEALTH PASSPORT — child-scoped
-- ============================================
CREATE POLICY "Family can read own health passport"
  ON health_passport_entries FOR SELECT USING (
    EXISTS(SELECT 1 FROM child_profiles cp WHERE cp.id = health_passport_entries.child_id AND is_family_member(cp.family_id))
  );

CREATE POLICY "Staff can manage clinic health passport"
  ON health_passport_entries FOR ALL USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM child_profiles cp
      JOIN families f ON f.id = cp.family_id
      WHERE cp.id = health_passport_entries.child_id AND f.clinic_id = get_user_clinic_id()
    )
  );

-- ============================================
-- AI CONVERSATIONS — user-scoped
-- ============================================
CREATE POLICY "Users can manage own AI conversations"
  ON ai_conversations FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own AI feedback"
  ON ai_feedback FOR ALL USING (
    EXISTS(SELECT 1 FROM ai_conversations ac WHERE ac.id = ai_feedback.conversation_id AND ac.user_id = auth.uid())
  );

-- ============================================
-- SOS — family-scoped
-- ============================================
CREATE POLICY "Family can manage own SOS events"
  ON sos_events FOR ALL USING (is_family_member(family_id));

CREATE POLICY "Staff can read clinic SOS events"
  ON sos_events FOR SELECT USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM families WHERE id = sos_events.family_id AND clinic_id = get_user_clinic_id()
    )
  );

-- ============================================
-- EDUCATION — public read, clinic-scoped write
-- ============================================
CREATE POLICY "Authenticated users can read published content"
  ON education_content FOR SELECT USING (is_published = true);

CREATE POLICY "Admin can manage clinic content"
  ON education_content FOR ALL USING (
    get_user_role() IN ('admin', 'superadmin')
    AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id())
  );

CREATE POLICY "Users can manage own content views"
  ON content_views FOR ALL USING (user_id = auth.uid());

-- ============================================
-- ENGAGEMENT — user/family-scoped
-- ============================================
CREATE POLICY "Anyone can read achievements"
  ON achievements FOR SELECT USING (true);

CREATE POLICY "Users can read own achievements"
  ON user_achievements FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own streaks"
  ON streaks FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Family can manage own referrals"
  ON referrals FOR ALL USING (is_family_member(referrer_family_id));

CREATE POLICY "Family can read own loyalty points"
  ON loyalty_points FOR SELECT USING (is_family_member(family_id));

CREATE POLICY "Family can create NPS responses"
  ON nps_responses FOR INSERT WITH CHECK (is_family_member(family_id));

-- ============================================
-- CLINIC B2B — clinic-scoped
-- ============================================
CREATE POLICY "Staff can read clinic packages"
  ON service_packages FOR SELECT USING (
    clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Admin can manage clinic packages"
  ON service_packages FOR ALL USING (
    get_user_role() IN ('admin', 'superadmin') AND clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Family can read own packages"
  ON family_packages FOR SELECT USING (is_family_member(family_id));

CREATE POLICY "Family can rate visits"
  ON visit_ratings FOR INSERT WITH CHECK (is_family_member(family_id));

CREATE POLICY "Staff can read clinic ratings"
  ON visit_ratings FOR SELECT USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM families WHERE id = visit_ratings.family_id AND clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Admin can manage outreach"
  ON outreach_scenarios FOR ALL USING (
    get_user_role() IN ('admin', 'superadmin', 'coordinator') AND clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Staff can read outreach logs"
  ON outreach_logs FOR SELECT USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM outreach_scenarios os WHERE os.id = outreach_logs.scenario_id AND os.clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Staff can manage training"
  ON training_modules FOR SELECT USING (
    clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Admin can manage training modules"
  ON training_modules FOR ALL USING (
    get_user_role() IN ('admin', 'superadmin') AND clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Users can manage own training progress"
  ON training_progress FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admin can manage integrations"
  ON integrations FOR ALL USING (
    get_user_role() IN ('admin', 'superadmin') AND clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Admin can read sync logs"
  ON sync_logs FOR SELECT USING (
    get_user_role() IN ('admin', 'superadmin') AND EXISTS(
      SELECT 1 FROM integrations i WHERE i.id = sync_logs.integration_id AND i.clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Admin can manage lab integrations"
  ON lab_integrations FOR ALL USING (
    get_user_role() IN ('admin', 'superadmin') AND clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Family can read own lab results"
  ON lab_results FOR SELECT USING (is_family_member(family_id));

CREATE POLICY "Staff can manage clinic lab results"
  ON lab_results FOR ALL USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM families WHERE id = lab_results.family_id AND clinic_id = get_user_clinic_id()
    )
  );

-- Doctors, appointment slots — clinic-scoped
CREATE POLICY "Anyone can read active doctors"
  ON doctors FOR SELECT USING (
    clinic_id = get_user_clinic_id() AND is_active = true
  );

CREATE POLICY "Admin can manage doctors"
  ON doctors FOR ALL USING (
    get_user_role() IN ('admin', 'superadmin') AND clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Anyone can read available slots"
  ON appointment_slots FOR SELECT USING (
    EXISTS(SELECT 1 FROM doctors d WHERE d.id = appointment_slots.doctor_id AND d.clinic_id = get_user_clinic_id())
  );

CREATE POLICY "Admin/doctor can manage slots"
  ON appointment_slots FOR ALL USING (
    get_user_role() IN ('admin', 'doctor') AND EXISTS(
      SELECT 1 FROM doctors d WHERE d.id = appointment_slots.doctor_id AND d.clinic_id = get_user_clinic_id()
    )
  );

-- Video consultations
CREATE POLICY "Family can read own video consultations"
  ON video_consultations FOR SELECT USING (is_family_member(family_id));

CREATE POLICY "Staff can manage clinic video consultations"
  ON video_consultations FOR ALL USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM families WHERE id = video_consultations.family_id AND clinic_id = get_user_clinic_id()
    )
  );

-- Service transactions — clinic-scoped
CREATE POLICY "Admin can read clinic transactions"
  ON service_transactions FOR SELECT USING (
    get_user_role() IN ('admin', 'superadmin') AND clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Staff can create transactions"
  ON service_transactions FOR INSERT WITH CHECK (
    is_staff() AND clinic_id = get_user_clinic_id()
  );

-- Revenue forecasts
CREATE POLICY "Admin can manage forecasts"
  ON revenue_forecasts FOR ALL USING (
    get_user_role() IN ('admin', 'superadmin') AND clinic_id = get_user_clinic_id()
  );

-- Review requests
CREATE POLICY "Family can read own review requests"
  ON review_requests FOR SELECT USING (is_family_member(family_id));

CREATE POLICY "Staff can manage review requests"
  ON review_requests FOR ALL USING (
    is_staff() AND EXISTS(
      SELECT 1 FROM families WHERE id = review_requests.family_id AND clinic_id = get_user_clinic_id()
    )
  );

-- Clinic networks
CREATE POLICY "Admin can read own network"
  ON clinic_networks FOR SELECT USING (
    EXISTS(SELECT 1 FROM clinic_network_members cnm WHERE cnm.network_id = clinic_networks.id AND cnm.clinic_id = get_user_clinic_id())
  );

CREATE POLICY "Admin can read network members"
  ON clinic_network_members FOR SELECT USING (
    clinic_id = get_user_clinic_id()
  );
