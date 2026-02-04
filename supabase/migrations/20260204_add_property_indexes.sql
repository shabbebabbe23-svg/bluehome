-- Add indexes for better query performance
-- This speeds up the most common queries on the properties table

-- Index for sorting by created_at (used on homepage)
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- Index for filtering by user_id (used in agent dashboard)
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);

-- Index for filtering deleted properties
CREATE INDEX IF NOT EXISTS idx_properties_is_deleted ON properties(is_deleted);

-- Composite index for the most common query pattern:
-- SELECT * FROM properties WHERE is_deleted = false ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_deleted, created_at DESC);

-- Index for location-based searches
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);

-- Index for price-based filtering
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
