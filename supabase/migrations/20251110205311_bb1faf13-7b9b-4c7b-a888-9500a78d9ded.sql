-- Add sold_date column to properties table
ALTER TABLE public.properties 
ADD COLUMN sold_date timestamp with time zone;