-- Add INSERT policy to prevent direct profile creation (must go through handle_new_user trigger)
CREATE POLICY "Prevent direct profile insertion"
ON public.profiles FOR INSERT
WITH CHECK (false);

-- Add DELETE policies for profiles
CREATE POLICY "Superadmin can delete profiles"
ON public.profiles FOR DELETE
USING (is_superadmin(auth.uid()));