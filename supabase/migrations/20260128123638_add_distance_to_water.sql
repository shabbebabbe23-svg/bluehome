-- Add distance_to_water column to properties table
-- Values represent distance in meters to nearest water (sea, lake, river)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS distance_to_water integer DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN properties.distance_to_water IS 'Distance to nearest water (sea, lake, river) in meters';
