-- =============================================
-- 12. RLS Policies - Communications
-- Τρέξε ΔΩΔΕΚΑΤΟ
-- =============================================

-- Select: All authenticated users can read
CREATE POLICY "Communications: Authenticated can read" ON communications
  FOR SELECT TO authenticated USING (true);

-- Insert: All authenticated users can create
CREATE POLICY "Communications: Authenticated can insert" ON communications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Delete: Only Admins and Superadmins can delete
CREATE POLICY "Communications: Admins can delete" ON communications
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('SUPERADMIN', 'ADMIN'));
