-- Allow agency_admin to create a new agency if they don't have one yet
-- This is needed for the first-time setup flow

-- Policy for agency_admin to insert a new agency
CREATE POLICY "Agency admin can create agency"
ON public.agencies FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.user_type::text = 'agency_admin'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.agency_id IS NOT NULL
  )
);
