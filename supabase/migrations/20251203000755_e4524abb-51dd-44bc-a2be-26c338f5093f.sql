-- Allow agency admins to view user roles for users in their agency
CREATE POLICY "Agency admins can view roles for agency users"
ON public.user_roles
FOR SELECT
USING (
  has_role(auth.uid(), 'agency_admin'::app_role) AND
  EXISTS (
    SELECT 1 FROM profiles p1, profiles p2
    WHERE p1.id = auth.uid()
    AND p2.id = user_roles.user_id
    AND p1.agency_id = p2.agency_id
    AND p1.agency_id IS NOT NULL
  )
);