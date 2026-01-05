-- Drop the broken policy
DROP POLICY IF EXISTS "Agency admins can update their own agency" ON public.agencies;

-- Create the fixed policy
CREATE POLICY "Agency admins can update their own agency"
ON public.agencies FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.agency_id = agencies.id
  )
  AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.user_type::text = 'agency_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.agency_id = agencies.id
  )
  AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.user_type::text = 'agency_admin'
  )
);
