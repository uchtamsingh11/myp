-- Update the broker_credentials table to allow multiple accounts per broker
ALTER TABLE IF EXISTS public.broker_credentials 
ADD COLUMN IF NOT EXISTS account_label TEXT DEFAULT 'Primary Account';

-- Drop the unique constraint that only allows one broker account per user
ALTER TABLE IF EXISTS public.broker_credentials 
DROP CONSTRAINT IF EXISTS broker_credentials_user_id_broker_id_key;

-- Create a new unique constraint that includes account_label
ALTER TABLE IF EXISTS public.broker_credentials 
ADD CONSTRAINT broker_credentials_user_id_broker_id_account_label_key 
UNIQUE (user_id, broker_id, account_label);

-- Update the save_broker_credentials_v2 function to accept account_label
CREATE OR REPLACE FUNCTION public.save_broker_credentials_v2(
  p_broker_id TEXT,
  p_credentials JSONB,
  p_account_label TEXT DEFAULT 'Primary Account'
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

  -- Check if credentials already exist for this user, broker, and account label
  SELECT id INTO v_credential_id
  FROM public.broker_credentials
  WHERE user_id = v_user_id 
    AND broker_id = p_broker_id
    AND account_label = p_account_label;

  -- Insert or update credentials
  IF v_credential_id IS NULL THEN
    -- Insert new credentials
    INSERT INTO public.broker_credentials (
      user_id,
      broker_id,
      broker_name,
      credentials,
      account_label,
      is_active
    ) VALUES (
      v_user_id,
      p_broker_id,
      v_broker_name,
      p_credentials,
      p_account_label,
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
DROP FUNCTION IF EXISTS public.save_broker_credentials_v2(TEXT, JSONB);
GRANT EXECUTE ON FUNCTION public.save_broker_credentials_v2(TEXT, JSONB, TEXT) TO authenticated;

-- Update the delete_broker_credentials_v2 function to accept account_label
CREATE OR REPLACE FUNCTION public.delete_broker_credentials_v2(
  p_broker_id TEXT,
  p_account_label TEXT DEFAULT 'Primary Account'
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

  -- Check if credentials exist for this user, broker, and account label
  SELECT id INTO v_credential_id
  FROM public.broker_credentials
  WHERE user_id = v_user_id 
    AND broker_id = p_broker_id
    AND account_label = p_account_label;

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
DROP FUNCTION IF EXISTS public.delete_broker_credentials_v2(TEXT);
GRANT EXECUTE ON FUNCTION public.delete_broker_credentials_v2(TEXT, TEXT) TO authenticated;

-- Update the toggle_broker_active_v2 function to accept account_label
CREATE OR REPLACE FUNCTION public.toggle_broker_active_v2(
  p_broker_id TEXT,
  p_account_label TEXT DEFAULT 'Primary Account'
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

  -- Check if credentials exist for this user, broker, and account label
  SELECT id, is_active INTO v_credential_id, v_is_active
  FROM public.broker_credentials
  WHERE user_id = v_user_id 
    AND broker_id = p_broker_id
    AND account_label = p_account_label;

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
DROP FUNCTION IF EXISTS public.toggle_broker_active_v2(TEXT);
GRANT EXECUTE ON FUNCTION public.toggle_broker_active_v2(TEXT, TEXT) TO authenticated; 