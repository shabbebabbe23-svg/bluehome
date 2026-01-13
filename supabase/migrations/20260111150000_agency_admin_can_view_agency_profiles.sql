-- Allow agency admins to view profiles of users in their agency
-- This is needed for the "Mäklare" tab in Agency Admin Dashboard

-- First, ensure we don't duplicate policies
DROP POLICY IF EXISTS "Agency admins can view profiles in their agency" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can view all profiles" ON public.profiles;

-- Superadmin can view all profiles
CREATE POLICY "Superadmin can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

-- Agency admins can view profiles of users in their agency
CREATE POLICY "Agency admins can view profiles in their agency"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.is_agency_admin(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.profiles my_profile
    WHERE my_profile.id = auth.uid()
      AND my_profile.agency_id IS NOT NULL
      AND my_profile.agency_id = profiles.agency_id
  )
);

-- Also allow agency admins to view user_roles for users in their agency
-- (needed to show role in the mäklare list)
DROP POLICY IF EXISTS "Agency admins can view roles for agency users" ON public.user_roles;
CREATE POLICY "Agency admins can view roles for agency users"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.is_agency_admin(auth.uid()) AND
  EXISTS (
    SELECT 1 
    FROM public.profiles my_profile
    JOIN public.profiles target_profile ON my_profile.agency_id = target_profile.agency_id
    WHERE my_profile.id = auth.uid()
      AND target_profile.id = user_roles.user_id
      AND my_profile.agency_id IS NOT NULL
  )
);
