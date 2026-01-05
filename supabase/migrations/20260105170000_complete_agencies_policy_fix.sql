-- Debug and fix: Remove all conflicting policies and create a clean one

-- First, drop ALL existing insert policies on agencies
DROP POLICY IF EXISTS "Agency admin can create agency" ON public.agencies;
DROP POLICY IF EXISTS "Superadmin can manage all agencies" ON public.agencies;
DROP POLICY IF EXISTS "Agency admins can view their own agency" ON public.agencies;
DROP POLICY IF EXISTS "Agency admins can update their own agency" ON public.agencies;

-- Recreate superadmin policy for ALL operations
CREATE POLICY "Superadmin can manage all agencies"
ON public.agencies FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.user_type::text = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.user_type::text = 'superadmin'
  )
);

-- Create SELECT policy for agency_admin to view their agency
CREATE POLICY "Agency admins can view their own agency"
ON public.agencies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.agency_id = agencies.id
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.user_type::text = 'agency_admin'
  )
);

-- Create INSERT policy for agency_admin - very simple, just check role
CREATE POLICY "Agency admin can insert agency"
ON public.agencies FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.user_type::text = 'agency_admin'
  )
);

-- Create UPDATE policy for agency_admin
CREATE POLICY "Agency admins can update their own agency"
ON public.agencies FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.agency_id = agencies.id
  )
  AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.user_type::text = 'agency_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.agency_id = agencies.id
  )
  AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.user_type::text = 'agency_admin'
  )
);
