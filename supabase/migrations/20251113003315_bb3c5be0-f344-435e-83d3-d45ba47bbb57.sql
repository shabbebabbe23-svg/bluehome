-- Add sold_price column to properties table
ALTER TABLE public.properties 
ADD COLUMN sold_price bigint;