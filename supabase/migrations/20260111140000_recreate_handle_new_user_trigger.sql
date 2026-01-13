-- Ensure handle_new_user trigger properly handles invitation tokens
-- This is a complete rewrite to ensure it works correctly

-- First, drop and recreate the function to ensure latest version is active
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate the trigger function with proper invitation handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  invitation_record RECORD;
  v_token text;
BEGIN
  -- Get the invitation token from user metadata
  v_token := new.raw_user_meta_data->>'invitation_token';
  
  -- If there's an invitation token, try to find the invitation
  IF v_token IS NOT NULL AND v_token != '' THEN
    -- Look up the invitation
    SELECT ai.id, ai.agency_id, ai.role, ai.email
    INTO invitation_record
    FROM public.agency_invitations ai
    WHERE ai.token = v_token
      AND ai.used_at IS NULL
      AND ai.expires_at > now();
    
    -- If we found a valid invitation
    IF invitation_record.id IS NOT NULL THEN
      -- Create profile with agency_id
      INSERT INTO public.profiles (id, email, full_name, agency_id)
      VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        invitation_record.agency_id
      );
      
      -- Set the correct role from the invitation
      INSERT INTO public.user_roles (user_id, user_type)
      VALUES (new.id, invitation_record.role);
      
      -- Mark invitation as used
      UPDATE public.agency_invitations
      SET used_at = now()
      WHERE id = invitation_record.id;
      
      RETURN new;
    END IF;
  END IF;
  
  -- No invitation or invalid invitation - create standard profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  
  -- Set default role (user) or from metadata if provided
  INSERT INTO public.user_roles (user_id, user_type)
  VALUES (
    new.id,
    COALESCE(
      (new.raw_user_meta_data->>'user_type')::public.app_role, 
      'user'::public.app_role
    )
  );
  
  RETURN new;
END;
$function$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
