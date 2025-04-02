-- Add idempotency_key column to cashfree_webhooks table
ALTER TABLE public.cashfree_webhooks 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Create an index on the idempotency_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_cashfree_webhooks_idempotency_key 
ON public.cashfree_webhooks(idempotency_key);

-- Add comment for documentation
COMMENT ON COLUMN public.cashfree_webhooks.idempotency_key IS 'Unique identifier from Cashfree webhook to prevent duplicate processing'; 