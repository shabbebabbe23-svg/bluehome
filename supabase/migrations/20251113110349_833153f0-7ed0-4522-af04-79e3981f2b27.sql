-- Add new_price column to track price changes
ALTER TABLE public.properties 
ADD COLUMN new_price bigint;