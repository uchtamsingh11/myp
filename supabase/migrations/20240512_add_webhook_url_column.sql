-- Add webhook columns to profiles table
-- First try to add webhook_url column
DO $$
BEGIN
    BEGIN
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS webhook_url UUID DEFAULT gen_random_uuid();
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'Table profiles does not exist yet. Nothing done.';
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column webhook_url already exists. Nothing done.';
    END;
END $$;

-- Also add webhook_token as a fallback option
DO $$
BEGIN
    BEGIN
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS webhook_token UUID DEFAULT gen_random_uuid();
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'Table profiles does not exist yet. Nothing done.';
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column webhook_token already exists. Nothing done.';
    END;
END $$; 