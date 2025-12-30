-- =============================================
-- 02. User Profiles Table (Προφίλ Χρηστών)
-- Τρέξε ΔΕΥΤΕΡΟ
-- =============================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  full_name VARCHAR(200),
  role VARCHAR(20) DEFAULT 'REGULAR',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_profiles_role ON user_profiles(role);
