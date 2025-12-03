-- Create storage bucket for property documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-documents', 'property-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view/download documents
CREATE POLICY "Anyone can view property documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-documents');

-- Allow authenticated agents to upload documents
CREATE POLICY "Agents can upload property documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-documents' 
  AND auth.uid() IS NOT NULL 
  AND has_role(auth.uid(), 'maklare'::app_role)
);

-- Allow agency admins to upload documents
CREATE POLICY "Agency admins can upload property documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-documents' 
  AND auth.uid() IS NOT NULL 
  AND has_role(auth.uid(), 'agency_admin'::app_role)
);

-- Allow agents to delete their uploaded documents
CREATE POLICY "Agents can delete property documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-documents' 
  AND auth.uid() IS NOT NULL 
  AND has_role(auth.uid(), 'maklare'::app_role)
);

-- Allow agency admins to delete documents
CREATE POLICY "Agency admins can delete property documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-documents' 
  AND auth.uid() IS NOT NULL 
  AND has_role(auth.uid(), 'agency_admin'::app_role)
);

-- Add documents column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb;