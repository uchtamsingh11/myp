-- Add started_at and completed_at columns to webhook_logs table
ALTER TABLE public.webhook_logs 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS webhook_logs_user_id_idx ON public.webhook_logs (user_id);
CREATE INDEX IF NOT EXISTS webhook_logs_created_at_idx ON public.webhook_logs (created_at DESC);

-- Update RLS policies to ensure users can only see their own logs
DROP POLICY IF EXISTS "Users can view their own webhook logs" ON public.webhook_logs;
CREATE POLICY "Users can view their own webhook logs" ON public.webhook_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all webhook logs" ON public.webhook_logs;
CREATE POLICY "Service role can manage all webhook logs" ON public.webhook_logs
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_logs TO service_role;
GRANT SELECT ON public.webhook_logs TO authenticated; 