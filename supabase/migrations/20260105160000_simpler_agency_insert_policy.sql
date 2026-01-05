-- Fix: Simpler agency_admin insert policy that checks user_roles directly

-- Drop previous attempts
DROP POLICY IF EXISTS "Agency admin can create agency" ON public.agencies;

-- Create a simpler policy that checks user_roles directly
CREATE POLICY "Agency admin can create agency"
ON public.agencies FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.user_type::text = 'agency_admin'
  )
);
