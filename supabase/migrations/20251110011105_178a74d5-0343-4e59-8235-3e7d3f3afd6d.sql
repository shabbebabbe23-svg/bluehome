-- Create table for tracking property views
CREATE TABLE public.property_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  view_started_at timestamp with time zone NOT NULL DEFAULT now(),
  time_spent_seconds integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert views (for tracking)
CREATE POLICY "Anyone can log property views"
ON public.property_views
FOR INSERT
WITH CHECK (true);

-- Policy: Agents can view stats for their own properties
CREATE POLICY "Agents can view stats for own properties"
ON public.property_views
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = property_views.property_id
    AND properties.user_id = auth.uid()
    AND has_role(auth.uid(), 'maklare'::app_role)
  )
);

-- Create index for better query performance
CREATE INDEX idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX idx_property_views_created_at ON public.property_views(created_at DESC);