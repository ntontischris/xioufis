-- =============================================
-- 10. RLS Policies - Citizens
-- Τρέξε ΔΕΚΑΤΟ
-- =============================================

-- Select: All authenticated users can read active citizens
CREATE POLICY "Citizens: Authenticated can read" ON citizens
  FOR SELECT TO authenticated USING (is_active = true);

-- Insert: Only Admins and Superadmins can create
CREATE POLICY "Citizens: Admins can insert" ON citizens
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('SUPERADMIN', 'ADMIN'));

-- Update: Only Admins and Superadmins can update
CREATE POLICY "Citizens: Admins can update" ON citizens
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN'));

-- Delete: Only Superadmin can delete
CREATE POLICY "Citizens: Only superadmin can delete" ON citizens
  FOR DELETE TO authenticated
  USING (get_user_role() = 'SUPERADMIN');
