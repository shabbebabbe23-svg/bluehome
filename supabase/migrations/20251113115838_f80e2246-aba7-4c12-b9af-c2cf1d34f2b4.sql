-- Add floorplan_images array column to support multiple floorplans
ALTER TABLE properties 
ADD COLUMN floorplan_images text[] DEFAULT '{}'::text[];

-- Copy existing floorplan_url to floorplan_images array (if exists)
UPDATE properties 
SET floorplan_images = ARRAY[floorplan_url]
WHERE floorplan_url IS NOT NULL AND floorplan_url != '';