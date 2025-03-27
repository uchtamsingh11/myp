import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create Supabase client with service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Allow all HTTP methods for this endpoint
export async function GET(request, { params }) {
  return NextResponse.json(
    {
      success: true,
      message: 'TradingView webhook endpoint is ready',
      userId: params.userid,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

export async function POST(request, { params }) {
  const timestamp = new Date();
  console.log('TradingView webhook received at:', timestamp.toISOString());

  try {
    const userId = params.userid;
    console.log('User ID from URL:', userId);

    // Get the request body
    let data = {};
    try {
      data = await request.json();
    } catch (e) {
      console.error('Error parsing JSON:', e);
      data = { error: 'Invalid JSON payload' };
    }

    console.log('Received webhook data:', JSON.stringify(data));

    // Log to database
    const { data: logData, error: logError } = await supabaseAdmin.from('webhook_logs').insert([
      {
        user_id: userId,
        webhook_id: 'direct-endpoint',
        payload: data,
        created_at: timestamp,
        processed: true,
        process_result: {
          message: 'Processed via direct endpoint',
          timestamp: timestamp.toISOString(),
        },
      },
    ]);

    if (logError) {
      console.error('Error logging webhook:', logError);
    } else {
      console.log('Webhook logged successfully');
    }

    // Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Webhook received successfully',
        timestamp: timestamp.toISOString(),
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      {
        error: 'Server error',
        message: error.message,
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
