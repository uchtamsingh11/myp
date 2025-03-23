-- Add referral_used column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_used TEXT;