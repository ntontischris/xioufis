-- =============================================
-- 11. RLS Policies - Requests
-- Τρέξε ΕΝΔΕΚΑΤΟ
-- =============================================

-- Select: All authenticated users can read
CREATE POLICY "Requests: Authenticated can read" ON requests
  FOR SELECT TO authenticated USING (true);

-- Insert: All authenticated users can create
CREATE POLICY "Requests: Authenticated can insert" ON requests
  FOR INSERT TO authenticated WITH CHECK (true);

-- Update: All authenticated users can update
CREATE POLICY "Requests: Authenticated can update" ON requests
  FOR UPDATE TO authenticated USING (true);

-- Delete: Only Admins and Superadmins can delete
CREATE POLICY "Requests: Admins can delete" ON requests
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN'));
