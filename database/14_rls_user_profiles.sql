-- =============================================
-- 14. RLS Policies - User Profiles
-- Τρέξε ΔΕΚΑΤΟ ΤΕΤΑΡΤΟ
-- =============================================

-- Select: Users can read their own profile, Admins can read all
CREATE POLICY "Profiles: Users can read own" ON user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR get_user_role() IN ('SUPERADMIN', 'ADMIN'));

-- All operations: Only Superadmin can manage all profiles
CREATE POLICY "Profiles: Superadmin can manage all" ON user_profiles
  FOR ALL TO authenticated
  USING (get_user_role() = 'SUPERADMIN');
