-- Add column to track which images are 360° panorama images
ALTER TABLE public.properties 
ADD COLUMN vr_image_indices integer[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN public.properties.vr_image_indices IS 'Array of indices for additional_images that are 360° panorama images';