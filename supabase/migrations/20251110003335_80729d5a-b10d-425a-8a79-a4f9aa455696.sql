-- Create app_role enum type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'maklare');
  END IF;
END $$;

-- Add maklare to existing enum if it exists but doesn't have maklare
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'public.app_role'::regtype 
    AND enumlabel = 'maklare'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'maklare';
  END IF;
END $$;

-- Update user_roles table to use app_role
ALTER TABLE public.user_roles 
ALTER COLUMN user_type TYPE public.app_role 
USING user_type::text::public.app_role;

-- Create has_role function if it doesn't exist
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND user_type = _role
  )
$$;

-- Create properties table
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  address text NOT NULL,
  location text NOT NULL,
  price bigint NOT NULL,
  bedrooms int NOT NULL,
  bathrooms int NOT NULL,
  area int NOT NULL,
  fee int DEFAULT 0,
  type text NOT NULL,
  description text,
  image_url text,
  hover_image_url text,
  viewing_date timestamp with time zone,
  listed_date timestamp with time zone DEFAULT now(),
  is_sold boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  has_vr boolean DEFAULT false,
  vendor_logo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view non-deleted properties
CREATE POLICY "Anyone can view active properties"
ON public.properties
FOR SELECT
USING (is_deleted = false);

-- Policy: Real estate agents can insert their own properties
CREATE POLICY "Agents can insert properties"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  public.has_role(auth.uid(), 'maklare'::app_role)
);

-- Policy: Agents can update their own properties
CREATE POLICY "Agents can update own properties"
ON public.properties
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND
  public.has_role(auth.uid(), 'maklare'::app_role)
)
WITH CHECK (
  auth.uid() = user_id AND
  public.has_role(auth.uid(), 'maklare'::app_role)
);

-- Policy: Agents can view all their properties (including deleted)
CREATE POLICY "Agents can view own properties"
ON public.properties
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id AND
  public.has_role(auth.uid(), 'maklare'::app_role)
);

-- Create trigger for updated_at
CREATE TRIGGER set_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();