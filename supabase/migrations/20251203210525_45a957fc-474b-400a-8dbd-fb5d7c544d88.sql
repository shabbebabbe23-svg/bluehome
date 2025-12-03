-- Add columns for elevator and balcony
ALTER TABLE public.properties
ADD COLUMN has_elevator boolean DEFAULT false,
ADD COLUMN has_balcony boolean DEFAULT false;