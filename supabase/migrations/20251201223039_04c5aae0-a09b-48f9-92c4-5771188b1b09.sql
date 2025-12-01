-- Lägg till policy för superadmin att kunna läsa alla profiler
CREATE POLICY "Superadmin can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'superadmin'));