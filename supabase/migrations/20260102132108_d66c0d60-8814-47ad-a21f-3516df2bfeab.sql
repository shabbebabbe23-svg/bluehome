-- Add total_floors column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS total_floors integer NULL;