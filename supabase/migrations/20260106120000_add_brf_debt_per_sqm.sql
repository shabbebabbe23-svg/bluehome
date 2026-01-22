-- Add brf_debt_per_sqm column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS brf_debt_per_sqm INTEGER DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN properties.brf_debt_per_sqm IS 'BRF debt per square meter (kronor)';
