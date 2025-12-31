-- Add second viewing date column for properties
ALTER TABLE public.properties 
ADD COLUMN viewing_date_2 timestamp with time zone DEFAULT NULL;