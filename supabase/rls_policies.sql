-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR POLITICAL CRM
-- =============================================================================
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project
-- 3. Go to SQL Editor
-- 4. Run these SQL commands
--
-- IMPORTANT: Make sure RLS is ENABLED for all tables before applying policies!
-- =============================================================================

-- =============================================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE military_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 2: DROP EXISTING POLICIES (if any) - Optional, for clean slate
-- =============================================================================

-- Uncomment these if you want to reset all policies:
-- DROP POLICY IF EXISTS "citizens_select_policy" ON citizens;
-- DROP POLICY IF EXISTS "citizens_insert_policy" ON citizens;
-- DROP POLICY IF EXISTS "citizens_update_policy" ON citizens;
-- DROP POLICY IF EXISTS "citizens_delete_policy" ON citizens;

-- =============================================================================
-- STEP 3: CITIZENS TABLE POLICIES
-- =============================================================================

-- Allow authenticated users to SELECT citizens
CREATE POLICY "citizens_select_policy" ON citizens
    FOR SELECT
    TO authenticated
    USING (
        -- Users can see all active citizens
        is_active = true
        OR
        -- Or citizens assigned to them (even if archived)
        assigned_user_id = auth.uid()
    );

-- Allow authenticated users to INSERT citizens
CREATE POLICY "citizens_insert_policy" ON citizens
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to UPDATE citizens
CREATE POLICY "citizens_update_policy" ON citizens
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Only allow admins to DELETE citizens (hard delete)
-- For this policy, we check user role from user_profiles table
CREATE POLICY "citizens_delete_policy" ON citizens
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('SUPERADMIN', 'ADMIN')
        )
    );

-- =============================================================================
-- STEP 4: REQUESTS TABLE POLICIES
-- =============================================================================

-- Allow authenticated users to SELECT all requests
CREATE POLICY "requests_select_policy" ON requests
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to INSERT requests
CREATE POLICY "requests_insert_policy" ON requests
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to UPDATE requests
CREATE POLICY "requests_update_policy" ON requests
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to DELETE requests
CREATE POLICY "requests_delete_policy" ON requests
    FOR DELETE
    TO authenticated
    USING (
        -- Only creators or admins can delete
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('SUPERADMIN', 'ADMIN')
        )
    );

-- =============================================================================
-- STEP 5: COMMUNICATIONS TABLE POLICIES
-- =============================================================================

-- Allow authenticated users to SELECT all communications
CREATE POLICY "communications_select_policy" ON communications
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to INSERT communications
CREATE POLICY "communications_insert_policy" ON communications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to UPDATE communications
CREATE POLICY "communications_update_policy" ON communications
    FOR UPDATE
    TO authenticated
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('SUPERADMIN', 'ADMIN')
        )
    )
    WITH CHECK (true);

-- Allow authenticated users to DELETE their own communications
CREATE POLICY "communications_delete_policy" ON communications
    FOR DELETE
    TO authenticated
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('SUPERADMIN', 'ADMIN')
        )
    );

-- =============================================================================
-- STEP 6: MILITARY PERSONNEL TABLE POLICIES
-- =============================================================================

-- Allow authenticated users to SELECT military personnel
CREATE POLICY "military_select_policy" ON military_personnel
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to INSERT military personnel
CREATE POLICY "military_insert_policy" ON military_personnel
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to UPDATE military personnel
CREATE POLICY "military_update_policy" ON military_personnel
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow admins to DELETE military personnel
CREATE POLICY "military_delete_policy" ON military_personnel
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('SUPERADMIN', 'ADMIN')
        )
    );

-- =============================================================================
-- STEP 7: USER PROFILES TABLE POLICIES
-- =============================================================================

-- Allow users to see all user profiles (for assignment dropdowns)
CREATE POLICY "user_profiles_select_policy" ON user_profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to update only their own profile
CREATE POLICY "user_profiles_update_policy" ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Only admins can insert new user profiles
CREATE POLICY "user_profiles_insert_policy" ON user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'SUPERADMIN'
        )
        OR
        -- Or if it's the first user (bootstrap)
        NOT EXISTS (SELECT 1 FROM user_profiles)
    );

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Run these to verify RLS is enabled:

-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('citizens', 'requests', 'communications', 'military_personnel', 'user_profiles');

-- Run this to see all policies:

-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public';

-- =============================================================================
-- END OF RLS POLICIES
-- =============================================================================
