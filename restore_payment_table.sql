-- Restore payment_orders table that was deleted
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_id TEXT,
  payment_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'CREATED',
  webhook_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS payment_orders_user_id_idx ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS payment_orders_order_id_idx ON public.payment_orders(order_id);
CREATE INDEX IF NOT EXISTS payment_orders_status_idx ON public.payment_orders(status);

-- Enable RLS but with permissive policies
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to view their own payment orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payment_orders'
      AND policyname = 'Users can view their own payment orders'
  ) THEN
    CREATE POLICY "Users can view their own payment orders"
      ON public.payment_orders
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Allow service role to manage all payment orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payment_orders'
      AND policyname = 'Service role can manage all payment orders'
  ) THEN
    CREATE POLICY "Service role can manage all payment orders"
      ON public.payment_orders
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_orders TO service_role;
GRANT SELECT ON public.payment_orders TO authenticated; 