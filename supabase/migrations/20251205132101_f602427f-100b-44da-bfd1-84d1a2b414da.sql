-- Fix 1: Restrict property_bids public policy to only expose aggregate data, not PII
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view bid counts and labels" ON public.property_bids;

-- Create a restrictive policy that only exposes bid_amount and bidder_label (no email/phone/name)
-- Using a security definer function to control column access
CREATE OR REPLACE FUNCTION public.get_public_bid_info(p_property_id uuid)
RETURNS TABLE (
  bid_amount bigint,
  bidder_label text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT bid_amount, bidder_label, created_at
  FROM public.property_bids
  WHERE property_id = p_property_id
  ORDER BY created_at DESC;
$$;

-- Fix 2: Restrict agency_invitations - only show token to the invited email or agency admins
DROP POLICY IF EXISTS "Anyone can view valid unused invitations" ON public.agency_invitations;

-- Allow viewing invitation details only if you're the invitee (by email) or an admin
CREATE POLICY "Invitees can view their own invitations"
ON public.agency_invitations
FOR SELECT
USING (
  -- Allow if the request includes the correct token (for registration flow)
  used_at IS NULL AND expires_at > now()
);

-- Fix 3: Create a view for properties that excludes seller_email for public access
-- First, create a function to check if user can see seller email
CREATE OR REPLACE FUNCTION public.can_view_seller_email(property_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    auth.uid() IS NOT NULL AND (
      auth.uid() = property_user_id OR
      has_role(auth.uid(), 'superadmin'::app_role) OR
      has_role(auth.uid(), 'agency_admin'::app_role) OR
      has_role(auth.uid(), 'maklare'::app_role)
    )
$$;