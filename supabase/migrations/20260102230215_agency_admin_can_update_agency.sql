-- Allow agency admins to update their own agency (e.g., logo_url)
CREATE POLICY "Agency admins can update their own agency"
ON public.agencies FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.agency_id = agencies.id
    AND has_role(auth.uid(), 'agency_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.agency_id = agencies.id
    AND has_role(auth.uid(), 'agency_admin')
  )
);

-- Also update the agency logo_url for the existing agency that has uploaded logos
-- This fixes the current issue where the logo was uploaded but not saved to the database
UPDATE public.agencies 
SET logo_url = 'https://qgvloiecyvqbxeplfzwv.supabase.co/storage/v1/object/public/property-images/agencies/66b53556-8bfa-4240-b5c3-107c207ce19c-logo-1767390060739.png'
WHERE id = '66b53556-8bfa-4240-b5c3-107c207ce19c'
AND logo_url IS NULL;
