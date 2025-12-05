-- Fix: Add rate limiting to property_views INSERT policy
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can log property views" ON property_views;

-- Create a rate-limited insert policy (one view per session per property per 5 minutes)
CREATE POLICY "Rate limited property view logging"
ON property_views FOR INSERT
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM property_views pv
    WHERE pv.session_id = session_id
    AND pv.property_id = property_id
    AND pv.created_at > NOW() - INTERVAL '5 minutes'
  )
);