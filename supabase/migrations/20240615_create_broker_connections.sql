-- Table for broker connections
CREATE TABLE IF NOT EXISTS public.broker_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  broker TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  profile_data JSONB,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, broker)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS broker_connections_user_id_idx ON public.broker_connections (user_id);
CREATE INDEX IF NOT EXISTS broker_connections_broker_idx ON public.broker_connections (broker);

-- Row Level Security
ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own broker connections
CREATE POLICY "Users can view their own broker connections" 
ON public.broker_connections 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for users to insert their own broker connections
CREATE POLICY "Users can insert their own broker connections" 
ON public.broker_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own broker connections
CREATE POLICY "Users can update their own broker connections" 
ON public.broker_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy for users to delete their own broker connections
CREATE POLICY "Users can delete their own broker connections" 
ON public.broker_connections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.broker_connections TO authenticated;
GRANT ALL ON public.broker_connections TO service_role; 