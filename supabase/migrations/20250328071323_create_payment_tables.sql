-- Create payment orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'CREATED',
  webhook_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook logs table for audit if it doesn't exist
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT,
  order_id TEXT,
  status TEXT,
  payload JSONB,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT
);

-- Add RLS policies for payment_orders table if they don't exist
DO $$
BEGIN
  -- Check if RLS is enabled on payment_orders
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'payment_orders'
      AND rowsecurity = true
  ) THEN
    ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Create policy if it doesn't exist
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

  -- Create policy for insert if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payment_orders'
      AND policyname = 'Service role can insert payment orders'
  ) THEN
    CREATE POLICY "Service role can insert payment orders"
      ON public.payment_orders
      FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS payment_orders_user_id_idx ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS payment_orders_order_id_idx ON public.payment_orders(order_id);
CREATE INDEX IF NOT EXISTS payment_orders_status_idx ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS webhook_logs_order_id_idx ON public.webhook_logs(order_id);

-- Grant permissions to authenticated users
GRANT SELECT ON public.payment_orders TO authenticated;
GRANT SELECT ON public.webhook_logs TO authenticated;

-- Grant all permissions to service role
GRANT ALL ON public.payment_orders TO service_role;
GRANT ALL ON public.webhook_logs TO service_role;
