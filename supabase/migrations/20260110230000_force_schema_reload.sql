-- Re-applying the function to force a schema cache reload
-- This handles the "Could not find the function ... in the schema cache" error

CREATE OR REPLACE FUNCTION public.create_agency_for_user(
  p_name text,
  p_email_domain text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_org_number text DEFAULT NULL,
  p_website text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_logo_url text DEFAULT NULL,
  p_area text DEFAULT NULL,
  p_owner text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_agency_id uuid;
  v_existing_agency_id uuid;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if user is agency_admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = v_user_id 
    AND user_type::text = 'agency_admin'
  ) THEN
    RAISE EXCEPTION 'User is not an agency admin';
  END IF;
  
  -- Check if user already has an agency
  SELECT agency_id INTO v_existing_agency_id
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_existing_agency_id IS NOT NULL THEN
    RAISE EXCEPTION 'User already has an agency';
  END IF;
  
  -- Create the agency
  INSERT INTO public.agencies (
    name,
    email_domain,
    email,
    address,
    phone,
    org_number,
    website,
    description,
    logo_url,
    area,
    owner
  ) VALUES (
    p_name,
    p_email_domain,
    p_email,
    p_address,
    p_phone,
    p_org_number,
    p_website,
    p_description,
    p_logo_url,
    p_area,
    p_owner
  )
  RETURNING id INTO v_agency_id;
  
  -- Link the user to the agency
  UPDATE public.profiles
  SET agency_id = v_agency_id
  WHERE id = v_user_id;
  
  RETURN v_agency_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_agency_for_user TO authenticated;

-- Explicitly notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload config';

