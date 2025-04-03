-- Create the audit_logs table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  email TEXT,
  details JSONB,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

-- Create policy for admin access only
CREATE POLICY "Only admins can view audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN (
        'admin@example.com',  -- Replace with actual admin emails
        'uchtamsingh@gmail.com'
      )
    )
  );

-- Allow the Supabase service role to insert records
CREATE POLICY "Service role can insert audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_email_idx ON public.audit_logs(email);
CREATE INDEX IF NOT EXISTS audit_logs_event_type_idx ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at);

-- Set up automatic cleanup of old logs (optional, uncomment if needed)
-- CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM public.audit_logs
--   WHERE created_at < NOW() - INTERVAL '90 days';
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('0 0 * * 0', 'SELECT cleanup_old_audit_logs()'); 