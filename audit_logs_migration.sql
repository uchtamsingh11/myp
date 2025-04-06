-- Add Audit Logging functionality
-- Run this after the main migration has completed successfully

-- Step 1: Create the audit logs table with a very simple schema
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- Renamed from action_type to event_type
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create basic indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Step 3: Enable row-level security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 4: Create admin policy
CREATE POLICY admin_all_audit_logs ON audit_logs TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Step 5: Create optimization logging function
CREATE OR REPLACE FUNCTION log_optimization_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, 
    event_type, 
    resource_type, 
    resource_id, 
    metadata, 
    ip_address
  )
  VALUES (
    NEW.user_id,
    TG_OP::TEXT,  -- Operation type (INSERT, UPDATE, etc.)
    'optimization',
    NEW.id,
    jsonb_build_object(
      'symbol', NEW.symbol,
      'timeframe', NEW.timeframe
    ),
    NULL  -- IP address would be added from the API
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Create backtest logging function
CREATE OR REPLACE FUNCTION log_backtest_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, 
    event_type, 
    resource_type, 
    resource_id, 
    metadata, 
    ip_address
  )
  VALUES (
    NEW.user_id,
    TG_OP::TEXT,  -- Operation type (INSERT, UPDATE, etc.)
    'backtest',
    NEW.id,
    jsonb_build_object(
      'optimization_id', NEW.optimization_id,
      'symbol', NEW.symbol,
      'timeframe', NEW.timeframe
    ),
    NULL  -- IP address would be added from the API
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create triggers
CREATE TRIGGER log_optimization_event_trigger
  AFTER INSERT OR UPDATE ON optimizations
  FOR EACH ROW
  EXECUTE PROCEDURE log_optimization_event();

CREATE TRIGGER log_backtest_event_trigger
  AFTER INSERT OR UPDATE ON backtests
  FOR EACH ROW
  EXECUTE PROCEDURE log_backtest_event(); 