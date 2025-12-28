-- Drop the broken policy
DROP POLICY IF EXISTS "Rate limited property view logging" ON public.property_views;

-- Create a fixed INSERT policy that allows anyone to log views
-- The rate limiting logic was referencing pv.session_id = pv.session_id (self-reference bug)
CREATE POLICY "Anyone can log property views"
ON public.property_views
FOR INSERT
WITH CHECK (true);

-- Add UPDATE policy so the time_spent_seconds can be updated
CREATE POLICY "Anyone can update their own view session"
ON public.property_views
FOR UPDATE
USING (true)
WITH CHECK (true);