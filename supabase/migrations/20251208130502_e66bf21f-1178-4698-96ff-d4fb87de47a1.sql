-- Allow anyone to view maklare roles (public information for agent search)
CREATE POLICY "Anyone can view maklare roles" 
ON public.user_roles 
FOR SELECT 
USING (user_type = 'maklare');