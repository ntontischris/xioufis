-- =============================================
-- 06. Triggers - Auto Update Timestamps
-- Τρέξε ΕΚΤΟ
-- =============================================

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for citizens
CREATE TRIGGER citizens_updated_at
  BEFORE UPDATE ON citizens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for requests
CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for military_personnel
CREATE TRIGGER military_updated_at
  BEFORE UPDATE ON military_personnel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-set completion date when status becomes COMPLETED
CREATE OR REPLACE FUNCTION auto_set_completion_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND NEW.completed_at IS NULL THEN
    NEW.completed_at = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requests_auto_complete
  BEFORE INSERT OR UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION auto_set_completion_date();
