-- Fix: Lägg till WITH CHECK för att superadmin ska kunna skapa nya byråer
-- Problemet var att FOR ALL policy utan WITH CHECK inte tillåter INSERT

-- Ta bort den befintliga policyn
DROP POLICY IF EXISTS "Superadmin can manage all agencies" ON public.agencies;

-- Skapa en ny policy med både USING och WITH CHECK
CREATE POLICY "Superadmin can manage all agencies"
ON public.agencies FOR ALL
USING (has_role(auth.uid(), 'superadmin'))
WITH CHECK (has_role(auth.uid(), 'superadmin'));
