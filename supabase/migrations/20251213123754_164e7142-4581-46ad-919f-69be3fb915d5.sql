-- Drop all existing problematic policies on user_roles
DROP POLICY IF EXISTS "Superadmin can view all user roles v2" ON public.user_roles;
DROP POLICY IF EXISTS "Agency admins can view roles for agency users v2" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- Create a simple policy that allows users to view their OWN role only
-- This doesn't cause recursion because it only checks auth.uid() = user_id
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Create a security definer function to check if user is superadmin
-- This bypasses RLS and prevents recursion
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND user_type = 'superadmin'::app_role
  )
$$;

-- Create a security definer function to check if user is agency_admin
CREATE OR REPLACE FUNCTION public.is_agency_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND user_type = 'agency_admin'::app_role
  )
$$;

-- Now create policies using the security definer functions
CREATE POLICY "Superadmin can view all user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Agency admins can view roles for agency users" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  public.is_agency_admin(auth.uid()) AND
  EXISTS (
    SELECT 1 
    FROM public.profiles p1
    JOIN public.profiles p2 ON p1.agency_id = p2.agency_id
    WHERE p1.id = auth.uid() 
    AND p2.id = user_roles.user_id
    AND p1.agency_id IS NOT NULL
  )
);