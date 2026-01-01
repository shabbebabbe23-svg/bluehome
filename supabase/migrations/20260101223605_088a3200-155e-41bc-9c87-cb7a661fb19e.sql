-- Add device_type to property_views
ALTER TABLE public.property_views 
ADD COLUMN device_type text DEFAULT 'unknown';

-- Add time_spent_ms to image_views for tracking time per image
ALTER TABLE public.image_views 
ADD COLUMN time_spent_ms integer DEFAULT 0;

-- Create property_shares table
CREATE TABLE public.property_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  share_method text NOT NULL, -- 'copy_link', 'facebook', 'twitter', 'email', etc.
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on property_shares
ALTER TABLE public.property_shares ENABLE ROW LEVEL SECURITY;

-- Anyone can insert shares
CREATE POLICY "Anyone can log shares" 
ON public.property_shares 
FOR INSERT 
WITH CHECK (true);

-- Agents can view shares for own properties
CREATE POLICY "Agents can view shares for own properties" 
ON public.property_shares 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM properties 
  WHERE properties.id = property_shares.property_id 
  AND properties.user_id = auth.uid() 
  AND has_role(auth.uid(), 'maklare'::app_role)
));

-- Create viewing_registrations table
CREATE TABLE public.viewing_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewing_date timestamp with time zone NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on viewing_registrations
ALTER TABLE public.viewing_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can register for viewings
CREATE POLICY "Anyone can register for viewings" 
ON public.viewing_registrations 
FOR INSERT 
WITH CHECK (true);

-- Agents can view registrations for own properties
CREATE POLICY "Agents can view registrations for own properties" 
ON public.viewing_registrations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM properties 
  WHERE properties.id = viewing_registrations.property_id 
  AND properties.user_id = auth.uid() 
  AND has_role(auth.uid(), 'maklare'::app_role)
));

-- Agents can delete registrations for own properties
CREATE POLICY "Agents can delete registrations for own properties" 
ON public.viewing_registrations 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM properties 
  WHERE properties.id = viewing_registrations.property_id 
  AND properties.user_id = auth.uid() 
  AND has_role(auth.uid(), 'maklare'::app_role)
));