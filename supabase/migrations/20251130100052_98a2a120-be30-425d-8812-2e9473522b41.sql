-- Tillåt agency_admin att ladda upp bilder
CREATE POLICY "Agency admins can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.uid() IS NOT NULL 
  AND has_role(auth.uid(), 'agency_admin'::app_role)
);

-- Tillåt agency_admin att uppdatera bilder
CREATE POLICY "Agency admins can update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-images' 
  AND auth.uid() IS NOT NULL 
  AND has_role(auth.uid(), 'agency_admin'::app_role)
);

-- Tillåt agency_admin att ta bort bilder
CREATE POLICY "Agency admins can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images' 
  AND auth.uid() IS NOT NULL 
  AND has_role(auth.uid(), 'agency_admin'::app_role)
);