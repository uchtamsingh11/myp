-- Create dedicated cashfree_webhooks table
CREATE TABLE IF NOT EXISTS public.cashfree_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT,
  order_id TEXT NOT NULL,
  payment_id TEXT,
  status TEXT,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'INR',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature TEXT,
  ip_address TEXT,
  idempotency_key TEXT,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  process_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance and efficient querying
CREATE INDEX IF NOT EXISTS cashfree_webhooks_order_id_idx ON public.cashfree_webhooks(order_id);
CREATE INDEX IF NOT EXISTS cashfree_webhooks_payment_id_idx ON public.cashfree_webhooks(payment_id);
CREATE INDEX IF NOT EXISTS cashfree_webhooks_status_idx ON public.cashfree_webhooks(status);
CREATE INDEX IF NOT EXISTS cashfree_webhooks_created_at_idx ON public.cashfree_webhooks(created_at DESC);
CREATE INDEX IF NOT EXISTS cashfree_webhooks_idempotency_key_idx ON public.cashfree_webhooks(idempotency_key);
CREATE INDEX IF NOT EXISTS cashfree_webhooks_processed_idx ON public.cashfree_webhooks(processed);

-- Add comments for clarity
COMMENT ON TABLE public.cashfree_webhooks IS 'Stores and logs all webhooks received from Cashfree payment gateway';
COMMENT ON COLUMN public.cashfree_webhooks.idempotency_key IS 'Unique identifier from Cashfree webhook to prevent duplicate processing';
COMMENT ON COLUMN public.cashfree_webhooks.processed IS 'Flag indicating whether this webhook has been fully processed';
COMMENT ON COLUMN public.cashfree_webhooks.process_result IS 'JSON object containing processing results and any related metadata';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cashfree_webhooks TO service_role;
GRANT SELECT ON public.cashfree_webhooks TO authenticated; 