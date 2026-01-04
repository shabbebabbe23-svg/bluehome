-- Create a secure function to check if a property has active bidding
-- This only returns true/false, no sensitive bid data
CREATE OR REPLACE FUNCTION public.property_has_bids(p_property_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM property_bids WHERE property_id = p_property_id
  );
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.property_has_bids(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.property_has_bids(uuid) TO authenticated;