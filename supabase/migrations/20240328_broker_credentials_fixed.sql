-- Create broker_types table to store all supported brokers
CREATE TABLE IF NOT EXISTS public.broker_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all supported brokers
INSERT INTO public.broker_types (id, name, description, status)
VALUES 
  ('alice_blue', 'Alice Blue', 'Online discount stock broker in India', 'available'),
  ('angel_broking', 'Angel Broking', 'Full-service stockbroker in India', 'available'),
  ('binance', 'Binance', 'World''s leading cryptocurrency exchange', 'available'),
  ('delta_exchange', 'Delta Exchange', 'Cryptocurrency derivatives exchange', 'available'),
  ('dhan', 'Dhan', 'Modern broker for option traders', 'available'),
  ('finvisia', 'Finvisia', 'Financial technology services provider', 'available'),
  ('fyers', 'Fyers', 'Online trading and investing platform', 'available'),
  ('icici_direct', 'ICICI Direct', 'Financial services firm in India', 'available'),
  ('iifl', 'IIFL', 'Financial services company', 'available'),
  ('kotak_neo', 'Kotak Neo', 'Online trading platform', 'available'),
  ('metatrader4', 'MetaTrader 4', 'Trading platform for forex and CFDs', 'available'),
  ('metatrader5', 'MetaTrader 5', 'Multi-asset trading platform', 'available'),
  ('upstox', 'Upstox', 'Online discount broker', 'available'),
  ('zerodha', 'Zerodha', 'Discount brokerage firm in India', 'available')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Create unified broker_credentials table to store all broker credentials
CREATE TABLE IF NOT EXISTS public.broker_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  broker_id TEXT REFERENCES public.broker_types(id) NOT NULL,
  broker_name TEXT NOT NULL,
  credentials JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, broker_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS broker_credentials_user_id_idx ON public.broker_credentials(user_id);
CREATE INDEX IF NOT EXISTS broker_credentials_broker_id_idx ON public.broker_credentials(broker_id);

-- Add row level security to ensure users can only see their own records
ALTER TABLE public.broker_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for broker_credentials
DROP POLICY IF EXISTS broker_credentials_select_policy ON public.broker_credentials;
CREATE POLICY broker_credentials_select_policy ON public.broker_credentials 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS broker_credentials_insert_policy ON public.broker_credentials;
CREATE POLICY broker_credentials_insert_policy ON public.broker_credentials 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS broker_credentials_update_policy ON public.broker_credentials;
CREATE POLICY broker_credentials_update_policy ON public.broker_credentials 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS broker_credentials_delete_policy ON public.broker_credentials;
CREATE POLICY broker_credentials_delete_policy ON public.broker_credentials 
  FOR DELETE USING (auth.uid() = user_id);

-- Drop existing function if it exists (with the same parameters)
DROP FUNCTION IF EXISTS public.save_broker_credentials(TEXT, JSONB);

-- Create function to save broker credentials with a new name
CREATE OR REPLACE FUNCTION public.save_broker_credentials_v2(
  p_broker_id TEXT,
  p_credentials JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_broker_name TEXT;
  v_credential_id UUID;
BEGIN
  -- Check authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Get broker name
  SELECT name INTO v_broker_name FROM public.broker_types WHERE id = p_broker_id;
  IF v_broker_name IS NULL THEN
    RAISE EXCEPTION 'Invalid broker ID: %', p_broker_id;
  END IF;

  -- Check if credentials already exist for this user and broker
  SELECT id INTO v_credential_id
  FROM public.broker_credentials
  WHERE user_id = v_user_id AND broker_id = p_broker_id;

  -- Insert or update credentials
  IF v_credential_id IS NULL THEN
    -- Insert new credentials
    INSERT INTO public.broker_credentials (
      user_id,
      broker_id,
      broker_name,
      credentials,
      is_active
    ) VALUES (
      v_user_id,
      p_broker_id,
      v_broker_name,
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
GRANT EXECUTE ON FUNCTION public.save_broker_credentials_v2(TEXT, JSONB) TO authenticated;

-- Create function to get all broker credentials for a user
CREATE OR REPLACE FUNCTION public.get_all_broker_credentials_v2()
RETURNS SETOF public.broker_credentials
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
    SELECT * FROM public.broker_credentials
    WHERE user_id = v_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_broker_credentials_v2() TO authenticated;

-- Create function to delete broker credentials
CREATE OR REPLACE FUNCTION public.delete_broker_credentials_v2(
  p_broker_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_credential_id UUID;
BEGIN
  -- Check authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if credentials exist for this user and broker
  SELECT id INTO v_credential_id
  FROM public.broker_credentials
  WHERE user_id = v_user_id AND broker_id = p_broker_id;

  IF v_credential_id IS NULL THEN
    RAISE EXCEPTION 'Credentials not found for broker: %', p_broker_id;
  END IF;

  -- Delete the credentials
  DELETE FROM public.broker_credentials
  WHERE id = v_credential_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE NOTICE 'Error deleting broker credentials: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_broker_credentials_v2(TEXT) TO authenticated;

-- Create function to toggle broker active state
CREATE OR REPLACE FUNCTION public.toggle_broker_active_v2(
  p_broker_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_credential_id UUID;
  v_is_active BOOLEAN;
BEGIN
  -- Check authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if credentials exist for this user and broker
  SELECT id, is_active INTO v_credential_id, v_is_active
  FROM public.broker_credentials
  WHERE user_id = v_user_id AND broker_id = p_broker_id;

  IF v_credential_id IS NULL THEN
    RAISE EXCEPTION 'Credentials not found for broker: %', p_broker_id;
  END IF;

  -- Toggle the active state
  UPDATE public.broker_credentials
  SET is_active = NOT v_is_active,
      updated_at = NOW()
  WHERE id = v_credential_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE NOTICE 'Error toggling broker active state: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.toggle_broker_active_v2(TEXT) TO authenticated;

-- Grant necessary permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.broker_credentials TO authenticated;
GRANT SELECT ON public.broker_types TO authenticated; 