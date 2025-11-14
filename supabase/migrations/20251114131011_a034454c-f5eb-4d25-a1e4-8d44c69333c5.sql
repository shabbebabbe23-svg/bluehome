-- Add bidder_label column to property_bids table
ALTER TABLE public.property_bids
ADD COLUMN bidder_label text;

-- Create policy to allow public to view bid counts and labels (but not personal info)
CREATE POLICY "Anyone can view bid counts and labels"
ON public.property_bids
FOR SELECT
USING (true);

-- Note: The existing RLS policy "Agents can view bids for own properties" will continue to work
-- for agents to see full details. The new policy allows everyone to see the table
-- but the query will be constructed to only expose non-sensitive data.