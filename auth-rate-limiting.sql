-- Advanced rate limiting for authentication
-- Run this after the main migration to add enhanced protection against brute force attacks

-- First check if the rate_limits table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'rate_limits') THEN
    -- Create the rate_limits table if it doesn't exist
    CREATE TABLE rate_limits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      request_count INTEGER DEFAULT 1,
      escalation_count INTEGER DEFAULT 0,
      window_limit INTEGER DEFAULT 10,
      first_request_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      last_request_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE UNIQUE INDEX idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint);
  ELSE
    -- Add the new columns if the table already exists
    BEGIN
      ALTER TABLE rate_limits ADD COLUMN escalation_count INTEGER DEFAULT 0;
    EXCEPTION
      WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;
    
    BEGIN
      ALTER TABLE rate_limits ADD COLUMN window_limit INTEGER DEFAULT 10;
    EXCEPTION
      WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;
  END IF;
END
$$;

-- Enhanced rate limiting function with exponential backoff and IP tracking
CREATE OR REPLACE FUNCTION auth_rate_limit(
  p_user_id TEXT,
  p_endpoint TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_max_requests INTEGER DEFAULT 10,
  p_window_seconds INTEGER DEFAULT 60,
  p_escalation_factor INTEGER DEFAULT 2
)
RETURNS BOOLEAN AS $$
DECLARE
  v_record RECORD;
  v_current_limit INTEGER;
  v_escalation_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_key TEXT;
BEGIN
  -- Create a composite key from user_id or IP if available
  v_key := COALESCE(p_user_id, 'anon');
  IF p_ip_address IS NOT NULL THEN
    v_key := v_key || ':' || p_ip_address;
  END IF;
  v_key := v_key || ':' || p_endpoint;
  
  -- Insert or get current rate limit record
  INSERT INTO rate_limits (
    id, 
    user_id, 
    endpoint, 
    request_count, 
    escalation_count,
    window_limit,
    first_request_at, 
    last_request_at
  )
  VALUES (
    gen_random_uuid(), 
    v_key, 
    p_endpoint, 
    1,
    0,
    p_max_requests,
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (user_id, endpoint) 
  DO NOTHING;
  
  -- Get the current record
  SELECT * INTO v_record 
  FROM rate_limits 
  WHERE user_id = v_key AND endpoint = p_endpoint
  FOR UPDATE;
  
  -- Determine current limit based on escalation
  v_escalation_count := COALESCE(v_record.escalation_count, 0);
  v_current_limit := p_max_requests * POWER(p_escalation_factor, v_escalation_count);
  
  -- Determine window start time
  v_window_start := v_record.first_request_at;
  
  -- Check if window has expired
  IF (CURRENT_TIMESTAMP - v_window_start) > make_interval(secs := p_window_seconds) THEN
    -- Reset window, but don't reset escalation count immediately
    -- Only decrease escalation count if it's been a long time (5x window)
    IF (CURRENT_TIMESTAMP - v_window_start) > make_interval(secs := p_window_seconds * 5) THEN
      v_escalation_count := GREATEST(0, v_escalation_count - 1);
    END IF;
    
    UPDATE rate_limits SET 
      request_count = 1,
      escalation_count = v_escalation_count,
      window_limit = p_max_requests * POWER(p_escalation_factor, v_escalation_count),
      first_request_at = CURRENT_TIMESTAMP,
      last_request_at = CURRENT_TIMESTAMP
    WHERE id = v_record.id;
    
    RETURN TRUE;
  ELSE
    -- Check if under limit
    IF v_record.request_count < v_current_limit THEN
      -- Increment count
      UPDATE rate_limits SET 
        request_count = request_count + 1,
        last_request_at = CURRENT_TIMESTAMP
      WHERE id = v_record.id;
      
      RETURN TRUE;
    ELSE
      -- Rate limit exceeded - increase escalation
      UPDATE rate_limits SET 
        escalation_count = v_escalation_count + 1,
        window_limit = p_max_requests * POWER(p_escalation_factor, v_escalation_count + 1),
        last_request_at = CURRENT_TIMESTAMP
      WHERE id = v_record.id;
      
      -- Add to audit log if configured
      BEGIN
        IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'audit_logs') THEN
          INSERT INTO audit_logs (
            user_id, 
            event_type, 
            resource_type, 
            resource_id, 
            metadata, 
            ip_address
          )
          VALUES (
            SPLIT_PART(v_key, ':', 1),
            'RATE_LIMIT_EXCEEDED',
            p_endpoint,
            NULL,
            jsonb_build_object(
              'escalation_count', v_escalation_count + 1,
              'window_limit', p_max_requests * POWER(p_escalation_factor, v_escalation_count + 1),
              'request_count', v_record.request_count
            ),
            p_ip_address
          );
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          -- Ignore audit log errors
      END;
      
      RETURN FALSE;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enhanced cleanup function for rate limits
CREATE OR REPLACE FUNCTION cleanup_rate_limits() 
RETURNS void AS $$
BEGIN
  -- Delete normal rate limits after 1 day
  DELETE FROM rate_limits 
  WHERE last_request_at < NOW() - INTERVAL '1 day'
  AND (escalation_count IS NULL OR escalation_count < 2);
  
  -- Keep records with high escalation for 3 days
  DELETE FROM rate_limits 
  WHERE last_request_at < NOW() - INTERVAL '3 days'
  AND escalation_count >= 2;
END;
$$ LANGUAGE plpgsql;

-- Schedule the cleanup to run hourly
SELECT cron.schedule('0 * * * *', $$SELECT cleanup_rate_limits();$$); 