-- Add housing_association column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS housing_association text;