# Broker Authentication System

This document outlines the broker authentication system for connecting trading platforms to our application.

## Database Schema

The broker system uses a normalized database schema with these key tables:

### `broker_types`

Contains the list of available brokers and their status.

| Column      | Type       | Description                   |
|-------------|------------|-------------------------------|
| id          | TEXT       | Primary key (e.g., 'zerodha') |
| name        | TEXT       | Display name (e.g., 'Zerodha')|
| description | TEXT       | Description of the broker     |
| status      | TEXT       | 'available' or 'coming_soon'  |
| created_at  | TIMESTAMPTZ| Creation timestamp            |

### `broker_credentials`

The main table that links users to their saved brokers.

| Column      | Type       | Description                   |
|-------------|------------|-------------------------------|
| id          | BIGSERIAL  | Primary key                   |
| user_id     | UUID       | Foreign key to auth.users     |
| broker_id   | TEXT       | Foreign key to broker_types   |
| is_active   | BOOLEAN    | Whether the broker is active  |
| created_at  | TIMESTAMPTZ| Creation timestamp            |
| updated_at  | TIMESTAMPTZ| Last update timestamp         |

### Broker-Specific Credential Tables

Each broker has its own table to store credentials in their specific format:

- `zerodha_credentials`: API key and Secret key
- `dhan_credentials`: API key and Secret key
- `fyers_credentials`: App ID and Secret ID
- `angelone_credentials`: API key and Secret key
- `upstox_credentials`: API key and Secret key

## Key Features

1. **Broker-Specific Schema**: Each broker can have unique credential fields
2. **RLS Policies**: Row-Level Security ensuring users can only access their own credentials
3. **Helper Functions**: Stored procedures to simplify CRUD operations
4. **Masked Credentials**: Secret keys are masked when retrieved for display

## Setup Instructions

### 1. Run the SQL Migration

Execute the SQL in `supabase/migrations/20250326_create_broker_table.sql` in your Supabase SQL Editor.

### 2. Configure Environment Variables

Make sure your `.env.local` file contains:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Test the API Route

The `/api/create-broker-table` route will automatically create the tables on application startup if they don't exist.

## Usage Examples

### Saving Credentials

```javascript
// Example: Saving Zerodha credentials
const { data, error } = await supabase.rpc(
  'save_broker_credentials',
  {
    p_user_id: session.user.id,
    p_broker_id: 'zerodha',
    p_credentials: {
      api_key: 'your-api-key',
      secret_key: 'your-secret-key'
    }
  }
);
```

### Retrieving Credentials

```javascript
// Get all saved broker credentials for a user
const { data, error } = await supabase.rpc(
  'get_broker_credentials',
  { p_user_id: session.user.id }
);
```

### Deleting Credentials

```javascript
// Delete a saved broker credential
const { data, error } = await supabase.rpc(
  'delete_broker_credentials',
  {
    p_user_id: session.user.id,
    p_credential_id: savedBroker.id
  }
);
```

## Adding New Broker Types

To add support for a new broker:

1. Add a new entry to the `broker_types` table
2. Create a new table for that broker's credentials
3. Update the `save_broker_credentials` function to handle the new broker type
4. Update the `get_broker_credentials` function to include the new broker type
