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
      } catch (e) {
        console.error('Error parsing JSON payload:', e);
        payload = {};
      }
    } else if (contentType.includes('text/plain')) {
      const text = await request.text();
      try {
        // Try to parse plain text as JSON
        payload = JSON.parse(text);
      } catch (e) {
        // If it's not valid JSON, just store it as text
        console.error('Error parsing text as JSON:', e);
        payload = { text };
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const formEntries = {};
      for (const [key, value] of formData.entries()) {
        formEntries[key] = value;
      }
      payload = formEntries;
    }
    
    console.log('Webhook payload received:', JSON.stringify(payload));
    
    // Find user by webhook_url
    console.log('Looking up profile with webhook_url:', webhookId);
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('webhook_url', webhookId)
      .single();
    
    if (profileError) {
      console.error('Error finding profile with webhook ID:', profileError);
      return NextResponse.json(
        { error: 'Invalid webhook ID or database error' },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          }
        }
      );
    }
    
    if (!profileData) {
      console.error('No profile found with webhook ID:', webhookId);
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
    }
    
    const userId = profileData.id;
    console.log('Found profile for webhook call:', profileData.full_name || userId);
    
    // Log the webhook call
    console.log('Logging webhook call for user:', userId);
    const { data: logData, error: logError } = await supabaseAdmin
      .from('webhook_logs')
      .insert([
        {
          user_id: userId,
          webhook_id: webhookId,
          payload: payload,
          created_at: requestStartTime,
          started_at: null,
          completed_at: null
        }
      ])
      .select();
    
    if (logError) {
      console.error('Error logging webhook call:', logError);
      // Continue processing even if logging fails
    } else {
      logId = logData[0]?.id;
      console.log('Webhook call logged successfully with ID:', logId);
    }
    
    // Mark processing start time
    const processingStartTime = new Date();
    console.log(`Processing started at: ${processingStartTime.toISOString()}`);
    
    // Update log with processing start time
    if (logId) {
      await supabaseAdmin
        .from('webhook_logs')
        .update({ started_at: processingStartTime })
        .eq('id', logId);
    }
    
    // Process the webhook (implement your trading logic here)
    // This is a simple example - you'd replace this with actual trading logic
    console.log(`Processing webhook for user ${userId} with payload:`, JSON.stringify(payload));
    
    // Simulate processing time for demo purposes
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulated processing time
    }
    
    // Example processing result - in a real implementation this would be the result of your trading logic
    const processingResult = {
      success: true,
      processed_at: new Date().toISOString(),
      action_taken: payload.action || "none", // Example: "buy", "sell", "none"
      symbol: payload.symbol || "UNKNOWN",
      // Add other relevant fields based on your TradingView alert payload
    };
    
    // Mark processing completion time
    const processingEndTime = new Date();
    const processingTimeMs = processingEndTime.getTime() - processingStartTime.getTime();
    console.log(`Processing completed at: ${processingEndTime.toISOString()} (took ${processingTimeMs}ms)`);
    
    // Update the log with processing results
    if (logId) {
      const { error: updateError } = await supabaseAdmin
        .from('webhook_logs')
        .update({
          processed: true,
          process_result: processingResult,
          completed_at: processingEndTime
        })
        .eq('id', logId);
      
      if (updateError) {
        console.error('Error updating webhook log with processing results:', updateError);
      } else {
        console.log('Successfully updated webhook log with processing results');
      }
    }
    
    // Calculate total request time
    const totalRequestTimeMs = processingEndTime.getTime() - requestStartTime.getTime();
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received and processed successfully',
      timestamp: processingEndTime.toISOString(),
      processing_time_ms: processingTimeMs,
      total_time_ms: totalRequestTimeMs
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      }
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // If we have a log ID, update it with the error
    if (logId) {
      const errorTime = new Date();
      await supabaseAdmin
        .from('webhook_logs')
        .update({
          processed: false,
          process_result: { error: error.message },
          completed_at: errorTime
        })
        .eq('id', logId);
    }
    
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
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