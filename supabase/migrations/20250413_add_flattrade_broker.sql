-- Add Flattrade broker to broker_types table
INSERT INTO public.broker_types (id, name, description, status)
VALUES ('flattrade', 'Flattrade', 'Discount broker with advanced trading tools', 'available')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Update any existing function to handle the new broker type if needed
-- (Not needed as the existing functions are generic)

-- Grant permissions if necessary
-- (Not needed as permissions are already set up for the broker_types table) 