-- Add is_executive_auction column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS is_executive_auction BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN properties.is_executive_auction IS 'Indicates if the property is an executive auction (exekutiv auktion)';
