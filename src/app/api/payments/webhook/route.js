import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Create a Supabase client with Admin privileges for webhook processing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // Get client IP address for security logging
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    // Get webhook data
    const webhookData = await request.json();

    // Check if this is a Cashfree webhook - if so, redirect to the dedicated endpoint
    if (isCashfreeWebhook(webhookData, request.headers)) {
      console.log('Detected Cashfree webhook, redirecting to dedicated endpoint');
      // Return a response indicating this should go to the Cashfree endpoint
      return NextResponse.json({
        success: false,
        error: 'This appears to be a Cashfree webhook. Please use /api/payments/cashfree-webhook endpoint'
      });
    }

    // This is a TradingView webhook, proceed normally
    console.log('TradingView webhook received:', JSON.stringify(webhookData).substring(0, 200) + '...');

    // Log webhook event
    await logTradingViewWebhook(webhookData, ipAddress);

    // Process TradingView webhook logic here
    // ... your existing TradingView webhook processing code

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

// Check if this is a Cashfree webhook based on payload structure
function isCashfreeWebhook(payload, headers) {
  // Check for Cashfree webhook signature headers
  if (
    headers.get('x-webhook-signature') ||
    headers.get('x-cashfree-signature') ||
    headers.get('x-signature')
  ) {
    return true;
  }

  // Check for common Cashfree webhook fields
  if (payload.data && (
    payload.data.order_id ||
    payload.data.order_status ||
    payload.data.cf_payment_id ||
    payload.data.payment_status
  )) {
    return true;
  }

  // Check for Cashfree event types
  if (payload.type && (
    payload.type.includes('payment') ||
    payload.type.includes('order') ||
    payload.type.includes('refund')
  )) {
    return true;
  }

  return false;
}

// Log TradingView webhook event
async function logTradingViewWebhook(webhookData, ipAddress) {
  try {
    await supabase.from('webhook_logs').insert({
      event_type: 'tradingview',
      payload: webhookData,
      ip_address: ipAddress,
      received_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
} 