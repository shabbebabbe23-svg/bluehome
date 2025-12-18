-- Add floorplan_urls column to properties table if missing
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floorplan_urls text[] DEFAULT ARRAY[]::text[];
