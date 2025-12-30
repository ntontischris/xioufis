-- =============================================
-- 03. Requests Table (Αιτήματα)
-- Τρέξε ΤΡΙΤΟ
-- =============================================

CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,

  -- Request Details
  category VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  request_text TEXT,
  notes TEXT,

  -- Dates
  submitted_at DATE DEFAULT CURRENT_DATE,
  completed_at DATE,

  -- Reminders
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT completion_date_valid CHECK (
    completed_at IS NULL OR completed_at >= submitted_at
  ),
  CONSTRAINT completion_required_when_done CHECK (
    status != 'COMPLETED' OR completed_at IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_requests_citizen ON requests(citizen_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_category ON requests(category);
CREATE INDEX idx_requests_submitted ON requests(submitted_at DESC);
CREATE INDEX idx_requests_pending ON requests(status, submitted_at)
  WHERE status = 'PENDING';
