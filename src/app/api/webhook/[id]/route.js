import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create Supabase client with service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Handle OPTIONS requests (for CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Handle GET requests (for testing webhooks)
export async function GET(request, { params }) {
  try {
    const webhookId = params.id;
    console.log('GET request received for webhook ID:', webhookId);

    // Check if the webhook ID is valid (matches a profile)
    // First try with webhook_url
    let { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('webhook_url', webhookId)
      .maybeSingle();

    // If webhook_url doesn't exist or no match found, try webhook_token
    if ((profileError && profileError.message.includes('does not exist')) || !profileData) {
      console.log('Checking webhook_token instead');
      const response = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .eq('webhook_token', webhookId)
        .maybeSingle();

      profileData = response.data;
      profileError = response.error;
    }

    if (profileError) {
      console.error('Profile lookup error:', profileError);
    }

    if (profileData) {
      console.log('Valid webhook ID, found profile:', profileData.id);
    } else {
      console.log('No profile found for webhook ID:', webhookId);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook endpoint is active. Use POST method to submit webhook data.',
      webhookId: params.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error processing GET request: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  const requestStartTime = new Date();
  console.log('Webhook call received at:', requestStartTime.toISOString());
  let logId = null;

  try {
    console.log('Webhook call received with ID:', params.id);
    const webhookId = params.id;

    if (!webhookId) {
      console.error('No webhook ID provided in request');
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          },
        }
      );
    }

    // Get the payload from the request
    let payload = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        payload = await request.json();
        console.log('Received JSON payload:', JSON.stringify(payload));
      } catch (e) {
        console.error('Error parsing JSON payload:', e);
        payload = { error: 'Failed to parse JSON' };
      }
    } else if (contentType.includes('text/plain')) {
      const text = await request.text();
      console.log('Received text payload:', text);
      try {
        // Try to parse plain text as JSON
        payload = JSON.parse(text);
      } catch (e) {
        // If it's not valid JSON, just store it as text
        console.error('Error parsing text as JSON:', e);
        payload = { raw_text: text };
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const formEntries = {};
      for (const [key, value] of formData.entries()) {
        formEntries[key] = value;
      }
      payload = formEntries;
      console.log('Received form data payload:', JSON.stringify(payload));
    } else {
      console.log('Received request with unsupported content-type:', contentType);
      // Try to read as text as fallback
      try {
        const text = await request.text();
        payload = { raw_content: text, content_type: contentType };
        console.log(
          'Fallback text payload:',
          text.substring(0, 200) + (text.length > 200 ? '...' : '')
        );
      } catch (e) {
        console.error('Failed to read request content:', e);
        payload = { error: 'Unsupported content type', content_type: contentType };
      }
    }

    // Log request headers for debugging
    const headers = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Request headers:', JSON.stringify(headers));

    // Find user by webhook_url or webhook_token
    console.log('Looking up profile with webhook identifier:', webhookId);

    // First try looking up by webhook_url
    let { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('webhook_url', webhookId)
      .maybeSingle();

    if (profileError && profileError.message.includes('does not exist')) {
      console.log('webhook_url column does not exist, trying webhook_token instead');
      // Try looking up by webhook_token instead
      const response = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .eq('webhook_token', webhookId)
        .maybeSingle();

      profileData = response.data;
      profileError = response.error;
    }

    if (profileError) {
      console.error('Error finding profile with webhook ID:', profileError);
    }

    const userId = profileData?.id || null;
    if (userId) {
      console.log('Found profile for user:', userId);
    } else {
      console.log('No matching profile found for webhook ID:', webhookId);
    }

    // Process the webhook (in a real app, you'd implement trading logic here)
    // For now, we'll just log the request and return success
    const processResult = {
      success: true,
      processed_at: new Date().toISOString(),
      action: payload?.action || 'none',
      signal: payload?.signal || 'none',
      symbol: payload?.symbol || 'unknown',
      broker_response: {
        status: 'pending',
        message: 'Broker not connected',
        order_id: null,
        details: {},
      },
    };

    // Log the webhook call to the database
    // THIS IS THE IMPORTANT PART
    console.log('Attempting to log webhook call to database...');

    // First check if webhook_logs table exists and its structure
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('webhook_logs')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Error checking webhook_logs table:', tableError);
    }

    // Insert the webhook log - with minimal required fields
    // This should work even with strict foreign key constraints
    const { data: insertedLog, error: insertError } = await supabaseAdmin
      .from('webhook_logs')
      .insert({
        // Only include user_id if we found a valid user
        ...(userId ? { user_id: userId } : {}),
        webhook_id: webhookId,
        payload: payload, // The received body/message/JSON
        created_at: requestStartTime, // The timestamp
        process_result: processResult, // The response
        processed: true,
      })
      .select();

    if (insertError) {
      console.error('Failed to insert webhook log:', insertError);

      // If there was a foreign key error, try again without the user_id
      if (insertError.code === '23503' && userId) {
        console.log('Foreign key violation. Trying again without user_id');
        const { data: retryLog, error: retryError } = await supabaseAdmin
          .from('webhook_logs')
          .insert({
            webhook_id: webhookId,
            payload: payload,
            created_at: requestStartTime,
            process_result: processResult,
            processed: true,
          })
          .select();

        if (retryError) {
          console.error('Failed to insert webhook log (retry):', retryError);
        } else {
          console.log('Successfully inserted webhook log without user_id');
          logId = retryLog?.[0]?.id;
        }
      }
    } else {
      console.log('Successfully inserted webhook log');
      logId = insertedLog?.[0]?.id;
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Webhook received and processed successfully',
        log_id: logId,
        timestamp: new Date().toISOString(),
        broker_response: processResult.broker_response,
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error in webhook processing:', error);

    // Try to log the error
    try {
      await supabaseAdmin.from('webhook_logs').insert({
        webhook_id: params.id || 'unknown',
        payload: { error: error.message },
        created_at: requestStartTime,
        processed: false,
        process_result: { error: error.message },
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    return NextResponse.json(
      {
        error: 'Error processing webhook: ' + error.message,
        timestamp: new Date().toISOString(),
        broker_response: {
          status: 'error',
          message: 'Failed to process webhook',
          order_id: null,
          details: { error: error.message },
        },
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
      }
    );
  }
}
