-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Superadmin can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Agency admins can view roles for agency users" ON public.user_roles;

-- Create a simpler superadmin policy that checks user_type directly without calling has_role
CREATE POLICY "Superadmin can view all user roles v2" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.user_type = 'superadmin'::app_role
  )
);

-- Create agency admin policy without has_role
CREATE POLICY "Agency admins can view roles for agency users v2" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p1 ON p1.id = auth.uid()
    JOIN public.profiles p2 ON p2.id = user_roles.user_id
    WHERE ur.user_id = auth.uid() 
    AND ur.user_type = 'agency_admin'::app_role
    AND p1.agency_id = p2.agency_id 
    AND p1.agency_id IS NOT NULL
  )
);