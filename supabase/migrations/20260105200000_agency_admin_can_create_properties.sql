 -- Allow agency_admin to create properties and upload images

-- Drop existing policies and recreate with agency_admin support
DROP POLICY IF EXISTS "Agents can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Agents can update own properties" ON public.properties;

-- Create new INSERT policy that allows both maklare AND agency_admin
CREATE POLICY "Agents and agency admins can insert properties"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  (
    public.has_role(auth.uid(), 'maklare'::app_role) OR
    public.has_role(auth.uid(), 'agency_admin'::app_role)
  )
);

-- Create new UPDATE policy that allows both maklare AND agency_admin
CREATE POLICY "Agents and agency admins can update own properties"
ON public.properties
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND
  (
    public.has_role(auth.uid(), 'maklare'::app_role) OR
    public.has_role(auth.uid(), 'agency_admin'::app_role)
  )
)
WITH CHECK (
  auth.uid() = user_id AND
  (
    public.has_role(auth.uid(), 'maklare'::app_role) OR
    public.has_role(auth.uid(), 'agency_admin'::app_role)
  )
);

-- Update storage policies for property-images bucket
DROP POLICY IF EXISTS "Agents can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Agents can update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Agents can delete their own property images" ON storage.objects;

CREATE POLICY "Agents and agency admins can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'maklare'::app_role) OR
    has_role(auth.uid(), 'agency_admin'::app_role)
  )
);

CREATE POLICY "Agents and agency admins can update property images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-images'
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'maklare'::app_role) OR
    has_role(auth.uid(), 'agency_admin'::app_role)
  )
);

CREATE POLICY "Agents and agency admins can delete property images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images'
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'maklare'::app_role) OR
    has_role(auth.uid(), 'agency_admin'::app_role)
  )
);

-- Update storage policies for property-documents bucket
DROP POLICY IF EXISTS "Agents can upload property documents" ON storage.objects;
DROP POLICY IF EXISTS "Agents can update their own property documents" ON storage.objects;
DROP POLICY IF EXISTS "Agents can delete their own property documents" ON storage.objects;

CREATE POLICY "Agents and agency admins can upload property documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-documents' 
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'maklare'::app_role) OR
    has_role(auth.uid(), 'agency_admin'::app_role)
  )
);

CREATE POLICY "Agents and agency admins can update property documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-documents'
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'maklare'::app_role) OR
    has_role(auth.uid(), 'agency_admin'::app_role)
  )
);

CREATE POLICY "Agents and agency admins can delete property documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-documents'
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'maklare'::app_role) OR
    has_role(auth.uid(), 'agency_admin'::app_role)
  )
);
