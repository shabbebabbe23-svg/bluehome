-- Add property feature columns to properties table
-- These match the buyer preferences for better matching

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS has_fireplace BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_garden BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_garage BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_ev_charging BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_storage BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_laundry BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_sauna BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_sea_view BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_south_facing BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_quiet_area BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_pet_friendly BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS near_daycare BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS near_school BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS near_centrum BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS near_public_transport BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS near_nature BOOLEAN DEFAULT FALSE;

-- Add comment to describe the purpose
COMMENT ON COLUMN properties.has_fireplace IS 'Property has fireplace or wood stove';
COMMENT ON COLUMN properties.has_garden IS 'Property has private garden';
COMMENT ON COLUMN properties.has_parking IS 'Property has parking space';
COMMENT ON COLUMN properties.has_garage IS 'Property has garage or carport';
COMMENT ON COLUMN properties.has_ev_charging IS 'Property has EV charging station';
COMMENT ON COLUMN properties.has_storage IS 'Property has storage unit';
COMMENT ON COLUMN properties.has_laundry IS 'Property has access to laundry room';
COMMENT ON COLUMN properties.has_sauna IS 'Property has sauna';
COMMENT ON COLUMN properties.has_sea_view IS 'Property has sea/water view';
COMMENT ON COLUMN properties.is_south_facing IS 'Property faces south (sunny)';
COMMENT ON COLUMN properties.is_quiet_area IS 'Property is in a quiet area';
COMMENT ON COLUMN properties.is_pet_friendly IS 'Property allows pets';
COMMENT ON COLUMN properties.near_daycare IS 'Property is near daycare/preschool';
COMMENT ON COLUMN properties.near_school IS 'Property is near school';
COMMENT ON COLUMN properties.near_centrum IS 'Property is near city center';
COMMENT ON COLUMN properties.near_public_transport IS 'Property is near public transport';
COMMENT ON COLUMN properties.near_nature IS 'Property is near nature/park';
