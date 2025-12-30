-- =============================================
-- 13. RLS Policies - Military Personnel
-- Τρέξε ΔΕΚΑΤΟ ΤΡΙΤΟ
-- =============================================

-- Select: All authenticated users can read
CREATE POLICY "Military: Authenticated can read" ON military_personnel
  FOR SELECT TO authenticated USING (true);

-- Insert: Only Admins and Superadmins can create
CREATE POLICY "Military: Admins can insert" ON military_personnel
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN'));

-- Update: Only Admins and Superadmins can update
CREATE POLICY "Military: Admins can update" ON military_personnel
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN'));
