-- Fix property_views table for tracking statistics

-- Add missing columns if they don't exist
ALTER TABLE property_views ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'desktop';
ALTER TABLE property_views ADD COLUMN IF NOT EXISTS image_clicks INTEGER DEFAULT 0;

-- Update NULL values to defaults
UPDATE property_views SET time_spent_seconds = 0 WHERE time_spent_seconds IS NULL;
UPDATE property_views SET image_clicks = 0 WHERE image_clicks IS NULL;
UPDATE property_views SET device_type = 'desktop' WHERE device_type IS NULL;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_session_id ON property_views(session_id);

-- Enable RLS
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Anyone can insert property views" ON property_views;
DROP POLICY IF EXISTS "Agents can view their property views" ON property_views;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON property_views;
DROP POLICY IF EXISTS "Allow view updates" ON property_views;
DROP POLICY IF EXISTS "Allow public inserts" ON property_views;
DROP POLICY IF EXISTS "Allow public updates" ON property_views;
DROP POLICY IF EXISTS "Allow agents to read" ON property_views;

-- Create policies for anonymous and authenticated users to insert views
CREATE POLICY "Allow public inserts" ON property_views
  FOR INSERT 
  WITH CHECK (true);

-- Allow updates to existing views (for time tracking)
CREATE POLICY "Allow public updates" ON property_views
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow agents to read views for their properties
CREATE POLICY "Allow agents to read" ON property_views
  FOR SELECT TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );
