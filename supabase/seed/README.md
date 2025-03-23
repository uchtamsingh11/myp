# AlgoZ TradingView Webhook Integration

## Database Schema Changes

### 1. Adding `webhook_url` column to `profiles` table:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS webhook_url UUID DEFAULT gen_random_uuid();
```

The `webhook_url` column:
- Is a UUID type
- Defaults to a randomly generated UUID when a new profile is created
- Is unique for each user
- Cannot be changed for the same user

### 2. Creating `webhook_logs` table for storing webhook history:

```sql
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_id UUID NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  process_result JSONB
);
```

The `webhook_logs` table:
- Stores an entry for each webhook call received
- Links to the user via `user_id`
- Stores the full payload received from TradingView
- Tracks if the webhook has been processed
- Can store the processing result

## Implementation Details

### Components:

1. **WebhookUrlComponent**
   - Displays the user's unique webhook URL
   - Allows copying the URL with a single click
   - Provides instructions on how to use the webhook with TradingView

2. **WebhookLogsComponent**
   - Shows a history of webhook calls received from TradingView
   - Displays timestamps and processing status
   - Allows viewing the full payload data
   - Updates in real-time using Supabase subscriptions

### API Endpoints:

1. **/api/webhook/[id]** - Processes webhook calls:
   - Verifies the webhook ID
   - Links the call to the corresponding user
   - Logs the webhook call
   - Processes the trading logic
   - Returns a success/error response

### Usage Flow:

1. User views their unique webhook URL in the dashboard's TradingView section
2. User copies the URL and uses it in TradingView alerts/strategies
3. When an alert is triggered in TradingView, it sends data to the webhook URL
4. The webhook endpoint processes the data and logs the call
5. The user can view the webhook logs in real-time in the dashboard

### Security Considerations:

- Each user has a unique, randomly generated webhook URL
- The webhook URL is treated as a secret token
- The URL cannot be changed for enhanced security
- Processing only occurs if a valid webhook ID is provided 