-- Add agent profile fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS agency text,
ADD COLUMN IF NOT EXISTS office text,
ADD COLUMN IF NOT EXISTS area text,
ADD COLUMN IF NOT EXISTS avatar_url text;