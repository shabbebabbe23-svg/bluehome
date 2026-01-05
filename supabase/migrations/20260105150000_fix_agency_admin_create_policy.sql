-- Fix: Correct the agency_admin insert policy to use has_role function properly

-- Drop the broken policy
DROP POLICY IF EXISTS "Agency admin can create agency" ON public.agencies;

-- Create the corrected policy using has_role function
CREATE POLICY "Agency admin can create agency"
ON public.agencies FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'agency_admin'::app_role)
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.agency_id IS NOT NULL
  )
);
