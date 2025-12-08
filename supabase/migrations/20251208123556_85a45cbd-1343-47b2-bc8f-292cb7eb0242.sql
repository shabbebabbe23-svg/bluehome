-- Add social media columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN instagram_url text,
ADD COLUMN tiktok_url text;