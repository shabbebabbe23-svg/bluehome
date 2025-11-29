-- Drop the too permissive policy
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.agency_invitations;

-- Create a more secure policy that only allows viewing valid, unused invitations
CREATE POLICY "Anyone can view valid unused invitations"
ON public.agency_invitations
FOR SELECT
TO anon, authenticated
USING (
  used_at IS NULL 
  AND expires_at > now()
);