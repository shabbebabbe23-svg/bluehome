-- Fix: Allow agency admins to INSERT invitations for their agency
-- The current "FOR ALL" policy only has USING clause, not WITH CHECK
-- This prevents INSERT operations from working properly

-- Drop the old policy that doesn't work for INSERT
DROP POLICY IF EXISTS "Agency admins can manage invitations for their agency" ON public.agency_invitations;

-- Create separate policies for each operation

-- SELECT policy (already exists from 20251205135301, but let's make sure)
DROP POLICY IF EXISTS "Agency admins can view their agency invitations" ON public.agency_invitations;
CREATE POLICY "Agency admins can view their agency invitations"
ON public.agency_invitations
FOR SELECT
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR
  (has_role(auth.uid(), 'agency_admin'::app_role) AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.agency_id = agency_invitations.agency_id
  ))
);

-- INSERT policy for agency admins
CREATE POLICY "Agency admins can insert invitations for their agency"
ON public.agency_invitations
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'superadmin'::app_role) OR
  (has_role(auth.uid(), 'agency_admin'::app_role) AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.agency_id = agency_invitations.agency_id
  ))
);

-- UPDATE policy for agency admins
CREATE POLICY "Agency admins can update invitations for their agency"
ON public.agency_invitations
FOR UPDATE
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR
  (has_role(auth.uid(), 'agency_admin'::app_role) AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.agency_id = agency_invitations.agency_id
  ))
)
WITH CHECK (
  has_role(auth.uid(), 'superadmin'::app_role) OR
  (has_role(auth.uid(), 'agency_admin'::app_role) AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.agency_id = agency_invitations.agency_id
  ))
);

-- DELETE policy for agency admins
CREATE POLICY "Agency admins can delete invitations for their agency"
ON public.agency_invitations
FOR DELETE
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR
  (has_role(auth.uid(), 'agency_admin'::app_role) AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.agency_id = agency_invitations.agency_id
  ))
);
