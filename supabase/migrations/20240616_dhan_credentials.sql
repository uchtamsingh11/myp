-- Table for storing Dhan API credentials only
CREATE TABLE IF NOT EXISTS public.dhan_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS dhan_credentials_user_id_idx ON public.dhan_credentials (user_id);

-- Row Level Security
ALTER TABLE public.dhan_credentials ENABLE ROW LEVEL SECURITY;

-- Policy for users to view only their own credentials
CREATE POLICY "Users can view their own Dhan credentials" 
ON public.dhan_credentials 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for users to insert their own credentials
CREATE POLICY "Users can insert their own Dhan credentials" 
ON public.dhan_credentials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own credentials
CREATE POLICY "Users can update their own Dhan credentials" 
ON public.dhan_credentials 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy for users to delete their own credentials
CREATE POLICY "Users can delete their own Dhan credentials" 
ON public.dhan_credentials 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger to automatically set updated_at on update
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_dhan_credentials
BEFORE UPDATE ON public.dhan_credentials
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dhan_credentials TO authenticated;
GRANT ALL ON public.dhan_credentials TO service_role; 