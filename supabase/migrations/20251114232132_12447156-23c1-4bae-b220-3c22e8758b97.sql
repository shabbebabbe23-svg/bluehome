-- Add is_coming_soon column to properties table
ALTER TABLE public.properties 
ADD COLUMN is_coming_soon boolean DEFAULT false;