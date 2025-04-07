-- Add coins column to profiles table with a default value of 0
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;

-- Update any existing users to have 0 coins if they don't have a value set
UPDATE profiles SET coins = 0 WHERE coins IS NULL;

-- Add a comment to the column for documentation
COMMENT ON COLUMN profiles.coins IS 'User coins balance for in-app features'; 