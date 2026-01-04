-- Add policy to allow agency admins to update their own agency
CREATE POLICY "Agency admins can update their own agency" 
ON public.agencies 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.agency_id = agencies.id 
    AND has_role(auth.uid(), 'agency_admin'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.agency_id = agencies.id 
    AND has_role(auth.uid(), 'agency_admin'::app_role)
  )
);