-- Add location tracking to property_views table
ALTER TABLE property_views 
ADD COLUMN visitor_city TEXT,
ADD COLUMN visitor_region TEXT,
ADD COLUMN visitor_country TEXT DEFAULT 'Sweden';