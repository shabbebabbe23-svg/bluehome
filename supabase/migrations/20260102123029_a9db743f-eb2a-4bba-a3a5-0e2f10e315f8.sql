-- Add floor column to properties table for apartments
ALTER TABLE public.properties 
ADD COLUMN floor integer NULL;