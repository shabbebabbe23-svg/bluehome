-- Add is_new_production column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS is_new_production boolean DEFAULT false;