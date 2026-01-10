-- Add policy to allow agency admins to update their own agency
-- Policy already exists from earlier migration, skip if exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Agency admins can update their own agency' 
    AND tablename = 'agencies'
  ) THEN
    CREATE POLICY "Agency admins can update their own agency" 
    ON public.agencies 
    FOR UPDATE 
    USING (
      EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.agency_id = agencies.id 
        AND has_role(auth.uid(), 'agency_admin'::app_role)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.agency_id = agencies.id 
        AND has_role(auth.uid(), 'agency_admin'::app_role)
      )
    );
  END IF;
END $$;