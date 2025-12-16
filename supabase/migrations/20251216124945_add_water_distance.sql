-- Add water_distance column to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS water_distance integer;

-- Add comment for documentation
COMMENT ON COLUMN properties.water_distance IS 'Distance to nearest water (lake, sea, river) in meters';
