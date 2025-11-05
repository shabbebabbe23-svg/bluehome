-- Add explicit DENY policies to user_roles table to prevent direct manipulation
-- Only the handle_new_user() trigger should be able to insert roles

-- Prevent direct INSERT attempts (roles should only be set via trigger)
CREATE POLICY "Prevent direct role insertion" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (false);

-- Prevent UPDATE attempts (user types should be immutable)
CREATE POLICY "Prevent role updates" 
ON public.user_roles 
FOR UPDATE 
USING (false);

-- Prevent DELETE attempts (preserve role history)
CREATE POLICY "Prevent role deletion" 
ON public.user_roles 
FOR DELETE 
USING (false);