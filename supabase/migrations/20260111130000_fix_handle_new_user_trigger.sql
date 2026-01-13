-- Fix: Ensure handle_new_user trigger can read agency_invitations
-- The trigger runs as SECURITY DEFINER so it should bypass RLS,
-- but let's make sure the function is correctly defined

-- Recreate handle_new_user with explicit SECURITY DEFINER and correct handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Log for debugging (can be removed later)
  RAISE LOG 'handle_new_user triggered for user: %, invitation_token: %', 
    new.id, 
    new.raw_user_meta_data->>'invitation_token';

  -- Hämta invitation om det finns en token
  IF new.raw_user_meta_data->>'invitation_token' IS NOT NULL THEN
    SELECT * INTO invitation_record
    FROM public.agency_invitations
    WHERE token = new.raw_user_meta_data->>'invitation_token'
    AND used_at IS NULL
    AND expires_at > now();
    
    RAISE LOG 'Invitation found: %', invitation_record IS NOT NULL;
    
    IF invitation_record IS NOT NULL THEN
      RAISE LOG 'Creating profile with agency_id: %, role: %', 
        invitation_record.agency_id, 
        invitation_record.role;
      
      -- Skapa profil med agency_id
      INSERT INTO public.profiles (id, email, full_name, agency_id)
      VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        invitation_record.agency_id
      );
      
      -- Sätt rätt roll (invitation_record.role är redan app_role)
      INSERT INTO public.user_roles (user_id, user_type)
      VALUES (new.id, invitation_record.role);
      
      -- Markera invitation som använd
      UPDATE public.agency_invitations
      SET used_at = now()
      WHERE id = invitation_record.id;
      
      RETURN new;
    END IF;
  END IF;
  
  -- Standard profil utan byrå (för vanliga användare)
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

-- Also create a helper function to fix existing users who were created
-- with wrong role (if needed)
CREATE OR REPLACE FUNCTION public.fix_agent_role(p_user_id uuid, p_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update existing role or insert new one
  INSERT INTO public.user_roles (user_id, user_type)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET user_type = p_role;
END;
$$;

-- Grant execute to authenticated users (for admin use)
GRANT EXECUTE ON FUNCTION public.fix_agent_role(uuid, app_role) TO authenticated;
