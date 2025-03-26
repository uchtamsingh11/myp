-- Fix for Fyers Credentials Authentication Error
-- This implements the save_broker_credentials function properly to handle Fyers authentication

-- First, ensure the necessary tables exist
-- Create broker_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.broker_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure Fyers and Dhan exist in broker_types
INSERT INTO public.broker_types (id, name, description, status)
VALUES 
  ('fyers', 'Fyers', 'Online trading and investing platform', 'available')
ON CONFLICT (id) DO UPDATE 
SET name = 'Fyers',
    description = 'Online trading and investing platform',
    status = 'available';

INSERT INTO public.broker_types (id, name, description, status)
VALUES 
  ('dhan', 'Dhan', 'Modern broker for option traders', 'available')
ON CONFLICT (id) DO UPDATE 
SET name = 'Dhan',
    description = 'Modern broker for option traders',
    status = 'available';

-- Create broker_credentials table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.broker_credentials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  broker_id TEXT REFERENCES public.broker_types(id) NOT NULL,
  credentials JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, broker_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS broker_credentials_user_id_idx ON public.broker_credentials(user_id);

-- Add row level security to ensure users can only see their own records
ALTER TABLE public.broker_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to only see/edit their own data
DROP POLICY IF EXISTS broker_credentials_policy ON public.broker_credentials;
CREATE POLICY broker_credentials_policy ON public.broker_credentials
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Drop the existing functions if they exist
DROP FUNCTION IF EXISTS public.save_broker_credentials;
DROP FUNCTION IF EXISTS public.get_broker_credentials;
DROP FUNCTION IF EXISTS public.delete_broker_credentials;

-- Create the new function with proper error handling and validation
CREATE OR REPLACE FUNCTION public.save_broker_credentials(
  p_user_id UUID,
  p_broker_id TEXT,
  p_credentials JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_broker_exists BOOLEAN;
  v_credential_id UUID;
BEGIN
  -- Validate inputs
  IF p_user_id IS NULL OR p_broker_id IS NULL OR p_credentials IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters';
  END IF;

  -- Check if broker exists
  SELECT EXISTS(
    SELECT 1 FROM public.broker_types
    WHERE id = p_broker_id
  ) INTO v_broker_exists;

  IF NOT v_broker_exists THEN
    RAISE EXCEPTION 'Invalid broker type';
  END IF;

  -- Check if user exists (this will throw an auth error if not)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check if the authenticated user matches the requested user_id (security check)
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Authentication error: You can only save credentials for your own account';
  END IF;

  -- Check if credentials already exist for this user and broker
  SELECT id INTO v_credential_id
  FROM public.broker_credentials
  WHERE user_id = p_user_id AND broker_id = p_broker_id;

  -- Validate broker-specific credentials
  IF p_broker_id = 'fyers' THEN
    IF p_credentials->>'app_id' IS NULL OR p_credentials->>'secret_id' IS NULL THEN
      RAISE EXCEPTION 'Fyers credentials require app_id and secret_id';
    END IF;
  ELSIF p_broker_id = 'dhan' THEN
    IF p_credentials->>'api_key' IS NULL OR p_credentials->>'secret_key' IS NULL THEN
      RAISE EXCEPTION 'Dhan credentials require api_key and secret_key';
    END IF;
  END IF;

  -- Insert or update credentials
  IF v_credential_id IS NULL THEN
    -- Insert new credentials
    INSERT INTO public.broker_credentials (
      user_id,
      broker_id,
      credentials,
      is_active
    ) VALUES (
      p_user_id,
      p_broker_id,
      p_credentials,
      TRUE
    );
  ELSE
    -- Update existing credentials
    UPDATE public.broker_credentials
    SET credentials = p_credentials,
        updated_at = NOW()
    WHERE id = v_credential_id;
  END IF;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE NOTICE 'Error saving broker credentials: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.save_broker_credentials TO authenticated;

-- Create or update a supporting function to get broker credentials
CREATE OR REPLACE FUNCTION public.get_broker_credentials(
  p_user_id UUID
)
RETURNS SETOF public.broker_credentials
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check authentication - can only fetch own credentials
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Authentication error: You can only view your own credentials';
  END IF;
  
  RETURN QUERY
    SELECT * FROM public.broker_credentials
    WHERE user_id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_broker_credentials TO authenticated;

-- Create function to delete broker credentials
CREATE OR REPLACE FUNCTION public.delete_broker_credentials(
  p_user_id UUID,
  p_credential_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check authentication - can only delete own credentials
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Authentication error: You can only delete your own credentials';
  END IF;
  
  -- Delete the credentials
  DELETE FROM public.broker_credentials
  WHERE id = p_credential_id AND user_id = p_user_id;
  
  -- Check if any rows were affected
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_broker_credentials TO authenticated;
