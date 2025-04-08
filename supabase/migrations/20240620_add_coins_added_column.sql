-- Add coins_added column to payment_orders table if it doesn't exist
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS coins_added INTEGER;

-- Add fulfilled_at column to payment_orders table for tracking when coins were added
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN public.payment_orders.coins_added IS 'Number of coins added to user account for this payment';
COMMENT ON COLUMN public.payment_orders.fulfilled_at IS 'Timestamp when coins were added to user account';

-- Create an index for faster queries on fulfilled orders
CREATE INDEX IF NOT EXISTS payment_orders_fulfilled_idx ON public.payment_orders(fulfilled_at);

-- Update any existing paid orders that don't have coins_added
-- This is to prevent duplicate coins from being added if the migration runs on existing data
UPDATE public.payment_orders
SET coins_added = FLOOR(amount::numeric), 
    fulfilled_at = updated_at
WHERE status = 'PAID' 
  AND coins_added IS NULL; 