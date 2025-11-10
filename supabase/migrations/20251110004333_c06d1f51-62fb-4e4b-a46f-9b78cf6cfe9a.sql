-- Update handle_new_user function to use app_role enum instead of user_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  
  -- Insert user role using app_role enum (default to 'user' if not specified)
  INSERT INTO public.user_roles (user_id, user_type)
  VALUES (
    new.id,
    COALESCE((new.raw_user_meta_data->>'user_type')::public.app_role, 'user')
  );
  
  RETURN new;
END;
$$;