-- Allow public to see if a property has bids (only property_id, not bid details)
-- This enables showing "Pågående budgivning" badge on property cards for all visitors

CREATE POLICY "Anyone can see if properties have bids"
ON public.property_bids
FOR SELECT
USING (true);

-- Note: While this allows SELECT, the frontend should only query property_id
-- to check if bids exist. Bid amounts and bidder info should only be shown
-- to the property owner (agent) in their dashboard.
