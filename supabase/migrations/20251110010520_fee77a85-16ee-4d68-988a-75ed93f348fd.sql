-- Add columns for additional images and floorplan
ALTER TABLE public.properties 
ADD COLUMN additional_images text[] DEFAULT '{}',
ADD COLUMN floorplan_url text;

-- Add comment for documentation
COMMENT ON COLUMN public.properties.additional_images IS 'Array of URLs for additional property images beyond main and hover images';
COMMENT ON COLUMN public.properties.floorplan_url IS 'URL to the property floorplan/blueprint image';