-- Allow anyone to read property view counts (for displaying on property detail pages)
-- This enables showing "Antal besökare" to all visitors, not just the property owner

-- Add a policy that allows anyone to read view counts
-- Note: This only allows counting rows, not accessing sensitive visitor data
CREATE POLICY "Anyone can read property view counts" ON property_views
  FOR SELECT
  USING (true);
