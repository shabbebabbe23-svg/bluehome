-- Lägg till policy för superadmin att kunna läsa alla user_roles
CREATE POLICY "Superadmin can view all user roles"
ON user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'superadmin'));