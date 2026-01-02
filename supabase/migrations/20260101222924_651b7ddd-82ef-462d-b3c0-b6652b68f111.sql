-- Add statistics email frequency column to properties
ALTER TABLE public.properties 
ADD COLUMN statistics_email_frequency text DEFAULT 'manual' CHECK (statistics_email_frequency IN ('weekly', 'monthly', 'manual'));