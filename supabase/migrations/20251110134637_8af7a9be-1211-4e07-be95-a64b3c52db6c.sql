-- Allow everyone to view all profiles (needed for public agent profiles on property pages)
CREATE POLICY "Anyone can view all profiles"
ON public.profiles
FOR SELECT
USING (true);