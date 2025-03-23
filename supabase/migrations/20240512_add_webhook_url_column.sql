-- Add webhook_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS webhook_url UUID DEFAULT gen_random_uuid(); 