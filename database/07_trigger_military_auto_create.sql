-- =============================================
-- 07. Trigger - Military Auto-Create Citizen
-- Τρέξε ΕΒΔΟΜΟ
-- =============================================

-- Auto-create citizen when military personnel is created without citizen
CREATE OR REPLACE FUNCTION auto_create_citizen_for_military()
RETURNS TRIGGER AS $$
DECLARE
  new_citizen_id UUID;
BEGIN
  IF NEW.citizen_id IS NULL THEN
    INSERT INTO citizens (
      surname,
      first_name,
      father_name,
      mobile,
      email,
      profession,
      contact_category,
      assigned_user_id
    )
    VALUES (
      NEW.surname,
      NEW.first_name,
      NEW.father_name,
      NEW.mobile,
      NEW.email,
      'Στρατιωτικό Προσωπικό',
      'GDPR',
      NEW.assigned_user_id
    )
    RETURNING id INTO new_citizen_id;

    NEW.citizen_id = new_citizen_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER military_auto_create_citizen
  BEFORE INSERT ON military_personnel
  FOR EACH ROW EXECUTE FUNCTION auto_create_citizen_for_military();
