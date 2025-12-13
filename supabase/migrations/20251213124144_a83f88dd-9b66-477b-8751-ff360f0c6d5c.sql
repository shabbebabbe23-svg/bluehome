-- Create a security definer function to check if users are in the same agency
-- This bypasses RLS and prevents circular recursion between user_roles and profiles
CREATE OR REPLACE FUNCTION public.users_in_same_agency(_user_id1 uuid, _user_id2 uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p1
    JOIN public.profiles p2 ON p1.agency_id = p2.agency_id
    WHERE p1.id = _user_id1 
    AND p2.id = _user_id2
    AND p1.agency_id IS NOT NULL
  )
$$;

-- Drop and recreate the problematic policy that caused circular recursion
DROP POLICY IF EXISTS "Agency admins can view roles for agency users" ON public.user_roles;

CREATE POLICY "Agency admins can view roles for agency users v3" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  public.is_agency_admin(auth.uid()) AND 
  public.users_in_same_agency(auth.uid(), user_roles.user_id)
);