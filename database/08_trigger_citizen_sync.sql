-- =============================================
-- 08. Trigger - Citizen to Military Sync
-- Τρέξε ΟΓΔΟΟ
-- =============================================

-- Sync citizen changes to military personnel
CREATE OR REPLACE FUNCTION sync_citizen_to_military()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE military_personnel
  SET
    surname = NEW.surname,
    first_name = NEW.first_name,
    father_name = NEW.father_name,
    mobile = NEW.mobile,
    email = NEW.email,
    updated_at = NOW()
  WHERE citizen_id = NEW.id
    AND (surname != NEW.surname
      OR first_name != NEW.first_name
      OR COALESCE(father_name, '') != COALESCE(NEW.father_name, '')
      OR COALESCE(mobile, '') != COALESCE(NEW.mobile, '')
      OR COALESCE(email, '') != COALESCE(NEW.email, ''));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER citizen_sync_to_military
  AFTER UPDATE ON citizens
  FOR EACH ROW EXECUTE FUNCTION sync_citizen_to_military();
