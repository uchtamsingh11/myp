-- Table for user broker settings
CREATE TABLE IF NOT EXISTS public.user_broker_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  broker TEXT NOT NULL,
  settings JSONB NOT NULL, -- Stores client_id, client_secret, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, broker)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS user_broker_settings_user_id_idx ON public.user_broker_settings (user_id);
CREATE INDEX IF NOT EXISTS user_broker_settings_broker_idx ON public.user_broker_settings (broker);

-- Row Level Security
ALTER TABLE public.user_broker_settings ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own broker settings
CREATE POLICY "Users can view their own broker settings" 
ON public.user_broker_settings 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for users to insert their own broker settings
CREATE POLICY "Users can insert their own broker settings" 
ON public.user_broker_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own broker settings
CREATE POLICY "Users can update their own broker settings" 
ON public.user_broker_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy for users to delete their own broker settings
CREATE POLICY "Users can delete their own broker settings" 
ON public.user_broker_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Policy for service role to manage all settings
CREATE POLICY "Service role can manage all broker settings" 
ON public.user_broker_settings 
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_broker_settings TO authenticated;
GRANT ALL ON public.user_broker_settings TO service_role; 