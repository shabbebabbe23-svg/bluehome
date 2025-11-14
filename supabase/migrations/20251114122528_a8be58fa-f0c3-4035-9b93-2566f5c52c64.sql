-- Create a table for property bids
CREATE TABLE public.property_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  bid_amount BIGINT NOT NULL,
  bidder_name TEXT,
  bidder_email TEXT,
  bidder_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.property_bids ENABLE ROW LEVEL SECURITY;

-- Agents can view bids for their own properties
CREATE POLICY "Agents can view bids for own properties"
ON public.property_bids
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.properties
    WHERE properties.id = property_bids.property_id
      AND properties.user_id = auth.uid()
      AND has_role(auth.uid(), 'maklare'::app_role)
  )
);

-- Agents can insert bids for their own properties
CREATE POLICY "Agents can insert bids for own properties"
ON public.property_bids
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.properties
    WHERE properties.id = property_bids.property_id
      AND properties.user_id = auth.uid()
      AND has_role(auth.uid(), 'maklare'::app_role)
  )
);

-- Agents can update bids for their own properties
CREATE POLICY "Agents can update bids for own properties"
ON public.property_bids
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.properties
    WHERE properties.id = property_bids.property_id
      AND properties.user_id = auth.uid()
      AND has_role(auth.uid(), 'maklare'::app_role)
  )
);

-- Agents can delete bids for their own properties
CREATE POLICY "Agents can delete bids for own properties"
ON public.property_bids
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.properties
    WHERE properties.id = property_bids.property_id
      AND properties.user_id = auth.uid()
      AND has_role(auth.uid(), 'maklare'::app_role)
  )
);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_property_bids_updated_at
BEFORE UPDATE ON public.property_bids
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();