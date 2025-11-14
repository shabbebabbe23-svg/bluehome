-- Add column to track if new_price is manually set or from bidding
ALTER TABLE public.properties 
ADD COLUMN is_manual_price_change boolean DEFAULT false;