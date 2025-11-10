-- Add bio field to profiles table for agent descriptions
ALTER TABLE public.profiles
ADD COLUMN bio TEXT;