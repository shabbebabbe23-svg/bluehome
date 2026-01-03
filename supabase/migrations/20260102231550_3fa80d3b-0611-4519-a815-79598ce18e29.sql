-- Allow agency admins to securely set their agency logo (without broad UPDATE access)

CREATE OR REPLACE FUNCTION public.set_my_agency_logo(p_logo_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agency_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF NOT has_role(auth.uid(), 'agency_admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT agency_id
  INTO v_agency_id
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_agency_id IS NULL THEN
    RAISE EXCEPTION 'no_agency';
  END IF;

  UPDATE public.agencies
  SET logo_url = p_logo_url,
      updated_at = now()
  WHERE id = v_agency_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'agency_not_found';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_my_agency_logo(text) TO authenticated;