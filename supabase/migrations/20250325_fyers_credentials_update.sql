-- Add auth_state column for secure state verification
ALTER TABLE public.fyers_credentials 
ADD COLUMN IF NOT EXISTS auth_state TEXT;

-- Add access_token and token_expiry columns if they don't exist yet
ALTER TABLE public.fyers_credentials 
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS token_expiry TIMESTAMP WITH TIME ZONE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS fyers_credentials_user_id_idx ON public.fyers_credentials(user_id);

-- Add row level security to ensure users can only see their own records
ALTER TABLE public.fyers_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to only see/edit their own data
DROP POLICY IF EXISTS fyers_credentials_policy ON public.fyers_credentials;
CREATE POLICY fyers_credentials_policy ON public.fyers_credentials
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
