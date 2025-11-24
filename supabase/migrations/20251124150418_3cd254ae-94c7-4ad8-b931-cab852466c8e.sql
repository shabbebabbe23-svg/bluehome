-- Steg 2: Skapa agencies tabell för mäklarbyråer
CREATE TABLE IF NOT EXISTS public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email_domain TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lägg till agency_id i profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL;

-- Skapa index för snabbare queries
CREATE INDEX IF NOT EXISTS idx_profiles_agency_id ON public.profiles(agency_id);

-- Skapa agency_invitations tabell
CREATE TABLE IF NOT EXISTS public.agency_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL CHECK (role IN ('agency_admin', 'maklare')),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS på agencies
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Superadmin kan hantera alla byråer
CREATE POLICY "Superadmin can manage all agencies"
ON public.agencies FOR ALL
USING (has_role(auth.uid(), 'superadmin'));

-- Agency admins kan se sin egen byrå
CREATE POLICY "Agency admins can view their own agency"
ON public.agencies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.agency_id = agencies.id
    AND has_role(auth.uid(), 'agency_admin')
  )
);

-- Mäklare kan se sin byrå
CREATE POLICY "Agents can view their agency"
ON public.agencies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.agency_id = agencies.id
  )
);

-- Enable RLS på invitations
ALTER TABLE public.agency_invitations ENABLE ROW LEVEL SECURITY;

-- Superadmin kan hantera alla inbjudningar
CREATE POLICY "Superadmin can manage all invitations"
ON public.agency_invitations FOR ALL
USING (has_role(auth.uid(), 'superadmin'));

-- Agency admins kan hantera inbjudningar för sin byrå
CREATE POLICY "Agency admins can manage invitations for their agency"
ON public.agency_invitations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.agency_id = agency_invitations.agency_id
    AND has_role(auth.uid(), 'agency_admin')
  )
);

-- Lägg till nya RLS policies för properties baserat på byrå och roll

-- Agency admins kan se alla objekt från sin byrå
CREATE POLICY "Agency admins can view all properties from their agency"
ON public.properties FOR SELECT
USING (
  has_role(auth.uid(), 'agency_admin') AND
  EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.id = auth.uid()
    AND p2.id = properties.user_id
    AND p1.agency_id = p2.agency_id
    AND p1.agency_id IS NOT NULL
  )
);

-- Agency admins kan uppdatera alla objekt från sin byrå
CREATE POLICY "Agency admins can update all properties from their agency"
ON public.properties FOR UPDATE
USING (
  has_role(auth.uid(), 'agency_admin') AND
  EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.id = auth.uid()
    AND p2.id = properties.user_id
    AND p1.agency_id = p2.agency_id
    AND p1.agency_id IS NOT NULL
  )
);

-- Agency admins kan ta bort objekt från sin byrå
CREATE POLICY "Agency admins can delete properties from their agency"
ON public.properties FOR DELETE
USING (
  has_role(auth.uid(), 'agency_admin') AND
  EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.id = auth.uid()
    AND p2.id = properties.user_id
    AND p1.agency_id = p2.agency_id
    AND p1.agency_id IS NOT NULL
  )
);

-- Superadmin kan se alla objekt
CREATE POLICY "Superadmin can view all properties"
ON public.properties FOR SELECT
USING (has_role(auth.uid(), 'superadmin'));

-- Skapa trigger för att uppdatera updated_at på agencies
CREATE TRIGGER update_agencies_updated_at
BEFORE UPDATE ON public.agencies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Uppdatera handle_new_user för att hantera agency_id från invitation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Hämta invitation om det finns en token
  IF new.raw_user_meta_data->>'invitation_token' IS NOT NULL THEN
    SELECT * INTO invitation_record
    FROM public.agency_invitations
    WHERE token = new.raw_user_meta_data->>'invitation_token'
    AND used_at IS NULL
    AND expires_at > now();
    
    IF invitation_record IS NOT NULL THEN
      -- Skapa profil med agency_id
      INSERT INTO public.profiles (id, email, full_name, agency_id)
      VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        invitation_record.agency_id
      );
      
      -- Sätt rätt roll
      INSERT INTO public.user_roles (user_id, user_type)
      VALUES (new.id, invitation_record.role);
      
      -- Markera invitation som använd
      UPDATE public.agency_invitations
      SET used_at = now()
      WHERE id = invitation_record.id;
      
      RETURN new;
    END IF;
  END IF;
  
  -- Standard profil utan byrå (för superadmin etc)
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  
  -- Sätt standard roll eller från metadata
  INSERT INTO public.user_roles (user_id, user_type)
  VALUES (
    new.id,
    COALESCE((new.raw_user_meta_data->>'user_type')::public.app_role, 'user')
  );
  
  RETURN new;
END;
$function$;