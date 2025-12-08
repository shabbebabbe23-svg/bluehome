-- Function to notify agency admin when a property is created
CREATE OR REPLACE FUNCTION public.notify_agency_admin_property_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  agent_profile RECORD;
  agency_admin_id uuid;
BEGIN
  -- Get the agent's profile and agency_id
  SELECT p.*, a.name as agency_name INTO agent_profile
  FROM profiles p
  LEFT JOIN agencies a ON a.id = p.agency_id
  WHERE p.id = NEW.user_id;
  
  -- Find the agency admin for this agency
  IF agent_profile.agency_id IS NOT NULL THEN
    SELECT ur.user_id INTO agency_admin_id
    FROM user_roles ur
    JOIN profiles p ON p.id = ur.user_id
    WHERE p.agency_id = agent_profile.agency_id
      AND ur.user_type = 'agency_admin'
    LIMIT 1;
    
    -- Create notification for agency admin
    IF agency_admin_id IS NOT NULL AND agency_admin_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, message, metadata)
      VALUES (
        agency_admin_id,
        'property_created',
        agent_profile.full_name || ' har laddat upp ett nytt objekt: ' || NEW.title,
        jsonb_build_object(
          'property_id', NEW.id,
          'property_title', NEW.title,
          'agent_id', NEW.user_id,
          'agent_name', agent_profile.full_name
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to notify agency admin when a property is sold
CREATE OR REPLACE FUNCTION public.notify_agency_admin_property_sold()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  agent_profile RECORD;
  agency_admin_id uuid;
BEGIN
  -- Only trigger if property was marked as sold
  IF NEW.is_sold = true AND (OLD.is_sold = false OR OLD.is_sold IS NULL) THEN
    -- Get the agent's profile and agency_id
    SELECT p.*, a.name as agency_name INTO agent_profile
    FROM profiles p
    LEFT JOIN agencies a ON a.id = p.agency_id
    WHERE p.id = NEW.user_id;
    
    -- Find the agency admin for this agency
    IF agent_profile.agency_id IS NOT NULL THEN
      SELECT ur.user_id INTO agency_admin_id
      FROM user_roles ur
      JOIN profiles p ON p.id = ur.user_id
      WHERE p.agency_id = agent_profile.agency_id
        AND ur.user_type = 'agency_admin'
      LIMIT 1;
      
      -- Create notification for agency admin
      IF agency_admin_id IS NOT NULL AND agency_admin_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, message, metadata)
        VALUES (
          agency_admin_id,
          'property_sold',
          agent_profile.full_name || ' har sålt: ' || NEW.title || ' för ' || COALESCE(NEW.sold_price, NEW.price) || ' kr',
          jsonb_build_object(
            'property_id', NEW.id,
            'property_title', NEW.title,
            'sold_price', COALESCE(NEW.sold_price, NEW.price),
            'agent_id', NEW.user_id,
            'agent_name', agent_profile.full_name
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for property creation
DROP TRIGGER IF EXISTS trigger_notify_agency_admin_property_created ON properties;
CREATE TRIGGER trigger_notify_agency_admin_property_created
  AFTER INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION notify_agency_admin_property_created();

-- Create trigger for property sold
DROP TRIGGER IF EXISTS trigger_notify_agency_admin_property_sold ON properties;
CREATE TRIGGER trigger_notify_agency_admin_property_sold
  AFTER UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION notify_agency_admin_property_sold();