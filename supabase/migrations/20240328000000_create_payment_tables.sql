-- Create payment orders table
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

-- Create webhook logs table for audit
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT,
  order_id TEXT,
  status TEXT,
  payload JSONB,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT
);

-- Add RLS policies for payment_orders table
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

-- Users can only read their own payment orders
CREATE POLICY "Users can view their own payment orders"
  ON public.payment_orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS payment_orders_user_id_idx ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS payment_orders_order_id_idx ON public.payment_orders(order_id);
CREATE INDEX IF NOT EXISTS payment_orders_status_idx ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS webhook_logs_order_id_idx ON public.webhook_logs(order_id); 