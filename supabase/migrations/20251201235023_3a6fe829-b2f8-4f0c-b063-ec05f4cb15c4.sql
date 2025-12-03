-- Skapa tabell för att spåra bildvisningar
CREATE TABLE IF NOT EXISTS public.image_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  image_index INTEGER NOT NULL,
  image_url TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index för bättre prestanda
CREATE INDEX idx_image_views_property_id ON public.image_views(property_id);
CREATE INDEX idx_image_views_session_id ON public.image_views(session_id);
CREATE INDEX idx_image_views_viewed_at ON public.image_views(viewed_at);

-- Enable RLS
ALTER TABLE public.image_views ENABLE ROW LEVEL SECURITY;

-- Policy: Tillåt alla att logga bildvisningar
CREATE POLICY "Anyone can log image views"
ON public.image_views
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Mäklare kan se statistik för sina egna objekt
CREATE POLICY "Agents can view stats for own properties"
ON public.image_views
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = image_views.property_id
    AND properties.user_id = auth.uid()
    AND has_role(auth.uid(), 'maklare'::app_role)
  )
);

-- Policy: Agency admins kan se statistik för alla objekt i sin byrå
CREATE POLICY "Agency admins can view stats for agency properties"
ON public.image_views
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'agency_admin'::app_role)
  AND EXISTS (
    SELECT 1 
    FROM public.properties p
    JOIN public.profiles p1 ON p1.id = auth.uid()
    JOIN public.profiles p2 ON p2.id = p.user_id
    WHERE p.id = image_views.property_id
    AND p1.agency_id = p2.agency_id
    AND p1.agency_id IS NOT NULL
  )
);