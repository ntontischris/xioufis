-- =============================================
-- 01. Citizens Table (Πολίτες)
-- Τρέξε ΠΡΩΤΟ
-- =============================================

CREATE TABLE citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  surname VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  father_name VARCHAR(100),
  referral_source VARCHAR(200),

  -- Contact
  mobile VARCHAR(15),
  landline VARCHAR(15),
  email VARCHAR(255),

  -- Address
  address TEXT,
  postal_code VARCHAR(5),
  area VARCHAR(100),
  municipality VARCHAR(50),

  -- Electoral
  electoral_district VARCHAR(50),

  -- Classification
  contact_category VARCHAR(20) DEFAULT 'GDPR',
  profession VARCHAR(100),

  -- Management
  assigned_user_id UUID REFERENCES auth.users(id),
  notes TEXT,

  -- Soft Delete
  is_active BOOLEAN DEFAULT true,
  archived_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT at_least_one_contact CHECK (
    mobile IS NOT NULL OR landline IS NOT NULL OR email IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_citizens_surname_name ON citizens(surname, first_name);
CREATE INDEX idx_citizens_municipality ON citizens(municipality);
CREATE INDEX idx_citizens_electoral ON citizens(electoral_district);
CREATE INDEX idx_citizens_active ON citizens(is_active) WHERE is_active = true;
CREATE INDEX idx_citizens_assigned ON citizens(assigned_user_id);
