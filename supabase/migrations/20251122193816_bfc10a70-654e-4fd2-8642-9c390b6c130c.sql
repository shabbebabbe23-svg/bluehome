
-- Add operating_cost column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS operating_cost INTEGER DEFAULT 0;

COMMENT ON COLUMN public.properties.operating_cost IS 'Monthly operating costs in SEK';
