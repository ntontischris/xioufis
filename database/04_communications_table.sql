-- =============================================
-- 04. Communications Table (Επικοινωνίες)
-- Τρέξε ΤΕΤΑΡΤΟ
-- =============================================

CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,

  -- Communication Details
  communication_date DATE NOT NULL DEFAULT CURRENT_DATE,
  comm_type VARCHAR(20) NOT NULL,
  notes TEXT,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_communications_citizen ON communications(citizen_id);
CREATE INDEX idx_communications_date ON communications(communication_date DESC);
CREATE INDEX idx_communications_type ON communications(comm_type);
