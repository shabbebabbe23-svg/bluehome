-- Add seller_email column to properties table
ALTER TABLE public.properties 
ADD COLUMN seller_email TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.properties.seller_email IS 'Email address of the property seller to receive statistics';