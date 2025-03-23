-- Create service_purchases table to track service purchases
CREATE TABLE IF NOT EXISTS service_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  coin_cost INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB
);

-- Add index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_service_purchases_user_id ON service_purchases(user_id);

-- Add index for lookup by service
CREATE INDEX IF NOT EXISTS idx_service_purchases_service_id ON service_purchases(service_id);

-- Add RLS policies for service_purchases table
ALTER TABLE service_purchases ENABLE ROW LEVEL SECURITY;

-- Users can only see their own purchases
CREATE POLICY "Users can view their own purchases" 
  ON service_purchases 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Only authenticated users can insert purchases
CREATE POLICY "Users can insert their own purchases" 
  ON service_purchases 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own purchases
CREATE POLICY "Users can update their own purchases" 
  ON service_purchases 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Only authenticated users can delete their own purchases
CREATE POLICY "Users can delete their own purchases" 
  ON service_purchases 
  FOR DELETE 
  USING (auth.uid() = user_id); 