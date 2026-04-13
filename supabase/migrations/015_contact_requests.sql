-- Contact requests from landing pages (clinic inquiries + family demand)
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization TEXT,
  email TEXT NOT NULL,
  phone_or_messenger TEXT,
  comment TEXT,
  type TEXT NOT NULL CHECK (type IN ('clinic_inquiry', 'demand_family')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anon from landing)
CREATE POLICY "anon_insert_contact_requests"
  ON contact_requests FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated admins can read/update
CREATE POLICY "admin_select_contact_requests"
  ON contact_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

CREATE POLICY "admin_update_contact_requests"
  ON contact_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );
