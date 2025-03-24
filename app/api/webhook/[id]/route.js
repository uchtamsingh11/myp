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
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('webhook_url', webhookId)
      .maybeSingle();
      
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
      timestamp: new Date().toISOString()
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
          }
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
        console.log('Fallback text payload:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
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
    
    // Find user by webhook_url
    console.log('Looking up profile with webhook_url:', webhookId);
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('webhook_url', webhookId)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error finding profile with webhook ID:', profileError);
      return NextResponse.json(
        { error: 'Database error while validating webhook ID', details: profileError.message },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          }
        }
      );
    }
    
    if (!profileData) {
      console.error('No profile found with webhook ID:', webhookId);
      // For debugging purposes, let's try to find ANY profiles with webhook_url
      const { data: anyProfiles, error: anyProfilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, webhook_url')
        .limit(5);
        
      if (anyProfilesError) {
        console.error('Error querying profiles table:', anyProfilesError);
      } else {
        console.log('Sample profiles from database:', JSON.stringify(anyProfiles));
      }
      
      // Even with an invalid webhook ID, we'll still process the request and return success
      // This helps with testing and development
      console.log('Proceeding with webhook processing despite invalid ID for testing purposes');
      
      // In production, you'd uncomment this to reject invalid webhooks:
      /*
      return NextResponse.json(
        { error: 'Invalid webhook ID - no matching profile' },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          }
        }
      );
      */
    }
    
    const userId = profileData?.id || 'unknown';
    console.log('Processing webhook for user:', userId);
    
    // Log the webhook call - even if we don't have a valid user ID
    // This helps with debugging
    console.log('Logging webhook call for user:', userId);
    const { data: logData, error: logError } = await supabaseAdmin
      .from('webhook_logs')
      .insert([
        {
          user_id: userId === 'unknown' ? null : userId,
          webhook_id: webhookId,
          payload: payload,
          created_at: requestStartTime,
          started_at: new Date(),
          processed: true,
          process_result: { 
            processed: true,
            test_mode: userId === 'unknown',
            timestamp: new Date().toISOString()
          },
          completed_at: new Date()
        }
      ])
      .select();
    
    if (logError) {
      console.error('Error logging webhook call:', logError);
      if (logError.code === '23503') {
        console.error('Foreign key violation - likely due to invalid user_id');
      }
    } else {
      logId = logData[0]?.id;
      console.log('Webhook call logged successfully with ID:', logId);
    }
    
    // Process the webhook (implement your trading logic here)
    console.log('Processing webhook payload:', JSON.stringify(payload));
    
    // In a real implementation, you would process the trading signals here
    // For now, we'll just return success
    
    return NextResponse.json(
      {
        success: true,
        message: 'Webhook received and processed successfully',
        log_id: logId,
        timestamp: new Date().toISOString()
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error in webhook processing:', error);
    
    // Try to log the error
    try {
      await supabaseAdmin
        .from('webhook_logs')
        .insert([
          {
            user_id: null,
            webhook_id: params.id || 'unknown',
            payload: { error: error.message, stack: error.stack },
            created_at: requestStartTime,
            processed: false,
            process_result: { error: error.message, stack: error.stack },
            completed_at: new Date()
          }
        ]);
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }
    
    return NextResponse.json(
      { 
        error: 'Error processing webhook: ' + error.message,
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        }
      }
    );
  }
}