-- Migration to assign superadmin role to a specific email
-- This migration is idempotent and will not duplicate entries.
INSERT INTO public.user_roles (user_id, user_type)
SELECT id, 'superadmin'::app_role
FROM auth.users
WHERE email = 'shabbe23@live.se'
ON CONFLICT DO NOTHING;
