-- Add construction_year column to properties table
ALTER TABLE public.properties
ADD COLUMN construction_year integer;

COMMENT ON COLUMN public.properties.construction_year IS 'Year the property was constructed';