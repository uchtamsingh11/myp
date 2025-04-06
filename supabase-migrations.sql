-- Create tables for PineScript Optimizer

-- Add required extensions first
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Optimizations Table
CREATE TABLE IF NOT EXISTS optimizations (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  time_duration TEXT,
  script TEXT NOT NULL,
  initial_capital NUMERIC,
  quantity NUMERIC,
  parameters JSONB,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Backtests Table
CREATE TABLE IF NOT EXISTS backtests (
  id UUID PRIMARY KEY,
  optimization_id UUID NOT NULL REFERENCES optimizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  time_duration TEXT,
  script TEXT NOT NULL,
  initial_capital NUMERIC,
  quantity NUMERIC,
  parameters JSONB,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  first_request_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_request_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_optimizations_user_id ON optimizations(user_id);
CREATE INDEX IF NOT EXISTS idx_optimizations_symbol ON optimizations(symbol);
CREATE INDEX IF NOT EXISTS idx_optimizations_created_at ON optimizations(created_at);

CREATE INDEX IF NOT EXISTS idx_backtests_optimization_id ON backtests(optimization_id);
CREATE INDEX IF NOT EXISTS idx_backtests_user_id ON backtests(user_id);
CREATE INDEX IF NOT EXISTS idx_backtests_created_at ON backtests(created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint);

-- Create RLS policies
ALTER TABLE optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtests ENABLE ROW LEVEL SECURITY;

-- Create policies for admins to do anything
CREATE POLICY admin_all_optimizations ON optimizations TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_all_backtests ON backtests TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for regular users to access only their data
CREATE POLICY user_optimizations ON optimizations FOR ALL TO authenticated 
  USING (user_id = auth.uid()::text);

CREATE POLICY user_backtests ON backtests FOR ALL TO authenticated 
  USING (user_id = auth.uid()::text);

-- Create policies for anonymous users (demo mode)
CREATE POLICY anon_optimizations ON optimizations FOR SELECT TO anon 
  USING (user_id = 'anonymous');

CREATE POLICY anon_backtests ON backtests FOR SELECT TO anon 
  USING (user_id = 'anonymous');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_optimizations_modtime
  BEFORE UPDATE ON optimizations
  FOR EACH ROW
  EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_backtests_modtime
  BEFORE UPDATE ON backtests
  FOR EACH ROW
  EXECUTE PROCEDURE update_modified_column();

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(p_user_id TEXT, p_endpoint TEXT, p_max_requests INTEGER, p_window_seconds INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_record rate_limits%ROWTYPE;
  v_count INTEGER;
BEGIN
  -- Get the current rate limit record for this user and endpoint
  SELECT * INTO v_record FROM rate_limits 
  WHERE user_id = p_user_id AND endpoint = p_endpoint
  FOR UPDATE;
  
  IF NOT FOUND THEN
    -- First request, create a new record
    INSERT INTO rate_limits (user_id, endpoint, request_count, first_request_at, last_request_at)
    VALUES (p_user_id, p_endpoint, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    RETURN TRUE;
  ELSE
    -- Check if window has expired
    IF (CURRENT_TIMESTAMP - v_record.first_request_at) > make_interval(secs := p_window_seconds) THEN
      -- Reset window
      UPDATE rate_limits SET 
        request_count = 1,
        first_request_at = CURRENT_TIMESTAMP,
        last_request_at = CURRENT_TIMESTAMP
      WHERE id = v_record.id;
      RETURN TRUE;
    ELSE
      -- Check if under limit
      IF v_record.request_count < p_max_requests THEN
        -- Increment count
        UPDATE rate_limits SET 
          request_count = request_count + 1,
          last_request_at = CURRENT_TIMESTAMP
        WHERE id = v_record.id;
        RETURN TRUE;
      ELSE
        -- Rate limit exceeded
        RETURN FALSE;
      END IF;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enhanced rate limiting for auth endpoints
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
      
      RETURN FALSE;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add escalation_count and window_limit columns to rate_limits table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rate_limits' AND column_name = 'escalation_count'
  ) THEN
    ALTER TABLE rate_limits ADD COLUMN escalation_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rate_limits' AND column_name = 'window_limit'
  ) THEN
    ALTER TABLE rate_limits ADD COLUMN window_limit INTEGER DEFAULT 10;
  END IF;
END;
$$;

-- Schedule cleanup of old rate limit records but keep high escalation records longer
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS void AS $$
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

SELECT cron.schedule('0 * * * *', $$SELECT cleanup_rate_limits();$$); 