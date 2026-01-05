-- Fix: Korrigera has_role anrop i agency update policy med korrekt type cast
-- Problemet var att has_role('agency_admin') inte castades till app_role

-- Ta bort den felaktiga policyn
DROP POLICY IF EXISTS "Agency admins can update their own agency" ON public.agencies;

-- Skapa ny policy med korrekt type cast
CREATE POLICY "Agency admins can update their own agency"
ON public.agencies FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.agency_id = agencies.id
    AND has_role(auth.uid(), 'agency_admin'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.agency_id = agencies.id
    AND has_role(auth.uid(), 'agency_admin'::app_role)
  )
);
