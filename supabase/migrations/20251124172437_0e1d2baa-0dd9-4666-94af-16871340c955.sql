-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_id UUID,
  target_type TEXT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Superadmin can view all logs
CREATE POLICY "Superadmin can view all activity logs"
ON public.activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'superadmin'));

-- Superadmin can insert logs
CREATE POLICY "Superadmin can insert activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'superadmin'));

-- Create index for faster queries
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_actor_id ON public.activity_logs(actor_id);
CREATE INDEX idx_activity_logs_target_id ON public.activity_logs(target_id);