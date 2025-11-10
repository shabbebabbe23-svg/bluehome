-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- RLS policies for property images bucket
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Agents can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.uid() IS NOT NULL
  AND has_role(auth.uid(), 'maklare'::app_role)
);

CREATE POLICY "Agents can update their own property images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-images'
  AND auth.uid() IS NOT NULL
  AND has_role(auth.uid(), 'maklare'::app_role)
);

CREATE POLICY "Agents can delete their own property images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images'
  AND auth.uid() IS NOT NULL
  AND has_role(auth.uid(), 'maklare'::app_role)
);