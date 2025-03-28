-- Migration for Cashfree Payment Gateway Tables
-- This creates all necessary tables for handling payment orders and webhooks
-- with proper relationships, indexes, and RLS policies

-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-------------------------------
-- PAYMENT ORDERS TABLE
-------------------------------
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    description TEXT,
    status TEXT NOT NULL DEFAULT 'CREATED',
    payment_session_id TEXT,
    payment_id TEXT,
    payment_method TEXT,
    webhook_data JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Add indexes to payment_orders table
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON payment_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_created_at ON payment_orders(created_at);

-- RLS policies for payment_orders
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment orders
CREATE POLICY payment_orders_select_policy ON payment_orders
    FOR SELECT USING (auth.uid() = user_id);

-- Only service roles can insert/update/delete
CREATE POLICY payment_orders_all_policy ON payment_orders
    USING (auth.role() = 'service_role');

-------------------------------
-- CASHFREE WEBHOOKS TABLE
-------------------------------
CREATE TABLE IF NOT EXISTS cashfree_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    order_id TEXT,
    payment_id TEXT,
    status TEXT,
    amount NUMERIC(10, 2),
    currency TEXT,
    payload JSONB NOT NULL,
    signature TEXT,
    ip_address TEXT,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    process_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes to cashfree_webhooks table
CREATE INDEX IF NOT EXISTS idx_cashfree_webhooks_order_id ON cashfree_webhooks(order_id);
CREATE INDEX IF NOT EXISTS idx_cashfree_webhooks_payment_id ON cashfree_webhooks(payment_id);
CREATE INDEX IF NOT EXISTS idx_cashfree_webhooks_status ON cashfree_webhooks(status);
CREATE INDEX IF NOT EXISTS idx_cashfree_webhooks_processed ON cashfree_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_cashfree_webhooks_created_at ON cashfree_webhooks(created_at);

-- RLS policies for cashfree_webhooks
ALTER TABLE cashfree_webhooks ENABLE ROW LEVEL SECURITY;

-- Only service roles can access webhook data
CREATE POLICY cashfree_webhooks_service_role_policy ON cashfree_webhooks
    USING (auth.role() = 'service_role');

-- Admin can view all webhook data
CREATE POLICY cashfree_webhooks_admin_policy ON cashfree_webhooks
    FOR SELECT USING (auth.role() = 'admin');

-------------------------------
-- UPDATE PROFILE TABLE FOR COIN BALANCE
-------------------------------
-- Add coins column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'coins'
    ) THEN
        ALTER TABLE profiles ADD COLUMN coins INTEGER DEFAULT 0;
    END IF;
END$$;

-- Add function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_timestamp_payment_orders
BEFORE UPDATE ON payment_orders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER set_timestamp_cashfree_webhooks
BEFORE UPDATE ON cashfree_webhooks
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Comments for documentation
COMMENT ON TABLE payment_orders IS 'Stores information about payment orders created in the Cashfree payment gateway';
COMMENT ON TABLE cashfree_webhooks IS 'Stores webhook events received from Cashfree payment gateway';
COMMENT ON COLUMN payment_orders.webhook_data IS 'Raw webhook data received for this payment order';
COMMENT ON COLUMN payment_orders.metadata IS 'Additional metadata related to the payment order';
COMMENT ON COLUMN cashfree_webhooks.processed IS 'Whether this webhook has been processed successfully';
COMMENT ON COLUMN cashfree_webhooks.process_error IS 'Error encountered while processing this webhook';
COMMENT ON COLUMN profiles.coins IS 'User coin balance (1 coin = 1 rupee = 1 trade)'; 