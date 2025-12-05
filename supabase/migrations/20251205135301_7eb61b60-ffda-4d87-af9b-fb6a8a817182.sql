-- Fix agency_invitations: Create more restrictive policy
-- The current policy allows anyone to view invitations, which exposes tokens

-- Drop the current permissive policy
DROP POLICY IF EXISTS "Invitees can view their own invitations" ON public.agency_invitations;

-- Create a function to validate invitation by token without exposing all data
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_token text)
RETURNS TABLE (
  agency_id uuid,
  email text,
  role app_role,
  expires_at timestamptz,
  agency_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ai.agency_id,
    ai.email,
    ai.role,
    ai.expires_at,
    a.name as agency_name
  FROM public.agency_invitations ai
  LEFT JOIN public.agencies a ON a.id = ai.agency_id
  WHERE ai.token = p_token
    AND ai.used_at IS NULL
    AND ai.expires_at > now();
$$;

-- Only allow agency admins and superadmins to view invitations via table queries
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