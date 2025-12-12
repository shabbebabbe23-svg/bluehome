-- Drop the overly permissive policy that exposes all profiles publicly
DROP POLICY IF EXISTS "Anyone can view all profiles" ON public.profiles;

-- Create a more restrictive policy: Only allow public viewing of maklare (agent) profiles
-- This is needed for the agent search/discovery feature to work for unauthenticated users
-- but protects buyer and admin profiles from public exposure
CREATE POLICY "Public can view maklare profiles only" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = profiles.id 
    AND user_roles.user_type = 'maklare'::app_role
  )
);

-- Ensure authenticated users can still view profiles they need for app functionality
CREATE POLICY "Authenticated users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);