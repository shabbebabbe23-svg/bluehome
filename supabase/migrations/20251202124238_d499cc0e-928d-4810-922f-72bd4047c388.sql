-- Allow public read access to agencies name for invitation pages
CREATE POLICY "Anyone can view agency names" 
ON public.agencies 
FOR SELECT 
USING (true);