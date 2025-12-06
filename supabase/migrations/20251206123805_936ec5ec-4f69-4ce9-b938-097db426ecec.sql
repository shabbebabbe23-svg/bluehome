-- Add column to enable/disable viewer count display on properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS show_viewer_count boolean DEFAULT false;