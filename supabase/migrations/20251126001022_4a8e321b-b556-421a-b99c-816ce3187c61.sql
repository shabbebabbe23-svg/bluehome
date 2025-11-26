-- Fix search_path for notify_property_sold function
CREATE OR REPLACE FUNCTION notify_property_sold()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only trigger if property was marked as sold (changed from false to true)
  IF NEW.is_sold = true AND (OLD.is_sold = false OR OLD.is_sold IS NULL) AND NEW.seller_email IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://qgvloiecyvqbxeplfzwv.supabase.co/functions/v1/send-property-statistics',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndmxvaWVjeXZxYnhlcGxmend2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDE2MjksImV4cCI6MjA3NzcxNzYyOX0.C6-xZMDe0w6KdlNWU5NSzi5MhkbArX3wZrbS8ElB_38"}'::jsonb,
      body := json_build_object('property_id', NEW.id, 'is_sold', true)::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$;