-- =============================================
-- 05. Military Personnel Table (Στρατιωτικό Προσωπικό)
-- Τρέξε ΠΕΜΠΤΟ
-- =============================================

CREATE TABLE military_personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- One-to-One with Citizen
  citizen_id UUID UNIQUE REFERENCES citizens(id) ON DELETE CASCADE,

  -- Type
  military_type VARCHAR(20) NOT NULL,

  -- Basic Info (synced with Citizen)
  surname VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  father_name VARCHAR(100),
  mobile VARCHAR(15),
  email VARCHAR(255),

  -- Conscript-specific fields (ΣΤΡΑΤΙΩΤΗΣ)
  esso_year INTEGER,
  esso_letter VARCHAR(1),
  military_number VARCHAR(50),
  conscript_wish TEXT,
  training_center VARCHAR(100),
  presentation_date DATE,
  assignment VARCHAR(200),
  assignment_date DATE,
  transfer TEXT,
  transfer_date DATE,

  -- Permanent-specific fields (ΜΟΝΙΜΟΣ)
  rank VARCHAR(50),
  service_unit VARCHAR(200),
  permanent_wish TEXT,
  service_number VARCHAR(50),

  -- Common
  notes TEXT,
  assigned_user_id UUID REFERENCES auth.users(id),

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT at_least_one_contact_military CHECK (
    mobile IS NOT NULL OR email IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_military_citizen ON military_personnel(citizen_id);
CREATE INDEX idx_military_type ON military_personnel(military_type);
CREATE INDEX idx_military_esso ON military_personnel(esso_year, esso_letter);
CREATE INDEX idx_military_rank ON military_personnel(rank);
