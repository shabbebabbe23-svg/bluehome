-- Allow anyone to view invitation by token (needed for signup flow)
CREATE POLICY "Anyone can view invitation by token"
ON public.agency_invitations
FOR SELECT
TO anon, authenticated
USING (true);