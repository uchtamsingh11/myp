import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Create a Supabase client with Admin privileges for webhook processing
const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Test endpoint to echo back the request for debugging
 */
export async function GET(request) {
        return NextResponse.json({
                message: 'Cashfree webhook endpoint is active',
                instructions: 'Send a POST request to this endpoint with your webhook payload',
                timestamp: new Date().toISOString()
        });
}

/**
 * Cashfree Webhook Handler
 * This endpoint receives webhook events from Cashfree payment gateway
 * 
 * @see https://www.cashfree.com/docs/payments/online/webhooks/overview
 */
export async function POST(request) {
        try {
                // Clone the request to handle both text and JSON access (needed for signature verification)
                const clonedRequest = request.clone();

                // Get client IP address for security logging
                const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

                // Log all headers for debugging
                console.log('>>> Cashfree webhook received from IP:', ipAddress);

                // Get headers for signature verification
                const headers = {};
                for (const [key, value] of request.headers.entries()) {
                        headers[key] = value;
                        console.log(`Header: ${key} = ${value}`);
                }

                // First get the raw body text for signature verification
                const webhookBody = await clonedRequest.text();
                console.log('Webhook raw body:', webhookBody.substring(0, 500) + (webhookBody.length > 500 ? '...' : ''));

                // Handle empty webhook body
                if (!webhookBody || webhookBody.trim() === '') {
                        console.error('Empty webhook body received');
                        return NextResponse.json({
                                success: false,
                                error: 'Empty request body',
                                message: 'Webhook body cannot be empty'
                        }, { status: 400 });
                }

                // Try to parse JSON body - handle malformed JSON gracefully
                let webhookData;
                try {
                        // Check content type to determine how to parse the data
                        const contentType = request.headers.get('content-type') || '';

                        if (contentType.includes('application/json')) {
                                // Parse as JSON if content type is JSON
                                webhookData = JSON.parse(webhookBody);
                        } else if (contentType.includes('application/x-www-form-urlencoded')) {
                                // Parse as form data if content type is form-urlencoded
                                const params = new URLSearchParams(webhookBody);
                                webhookData = {};
                                for (const [key, value] of params.entries()) {
                                        // Try to parse nested JSON in form fields
                                        try {
                                                webhookData[key] = JSON.parse(value);
                                        } catch (e) {
                                                webhookData[key] = value;
                                        }
                                }

                                // If there's a 'data' parameter, it might contain the whole payload as JSON
                                if (params.has('data')) {
                                        try {
                                                const dataJson = JSON.parse(params.get('data'));
                                                if (typeof dataJson === 'object' && dataJson !== null) {
                                                        webhookData = dataJson;
                                                }
                                        } catch (e) {
                                                // Keep the form data if we can't parse the data parameter
                                        }
                                }
                        } else {
                                // Try parsing as JSON anyway as fallback
                                try {
                                        webhookData = JSON.parse(webhookBody);
                                } catch (e) {
                                        // If that fails, create a simple wrapper object with the raw body
                                        webhookData = {
                                                rawBody: webhookBody,
                                                parsedAs: 'text',
                                                contentType: contentType
                                        };
                                }
                        }

                        console.log('Parsed webhook data:', JSON.stringify(webhookData).substring(0, 200) + '...');
                } catch (jsonError) {
                        console.error('Failed to parse webhook data:', jsonError, 'Raw body:', webhookBody);
                        return NextResponse.json({
                                success: false,
                                error: 'Invalid payload format',
                                message: 'Could not parse webhook payload',
                                contentType: request.headers.get('content-type') || 'none'
                        }, { status: 400 });
                }

                // Extract signature from headers - Cashfree uses different header names depending on API version
                const signature = request.headers.get('x-webhook-signature') ||
                        request.headers.get('x-cashfree-signature') ||
                        request.headers.get('x-signature');

                // Validate webhook signature - skip in development only if configured
                let signatureValid = false;

                if (process.env.NODE_ENV === 'development' && process.env.SKIP_SIGNATURE_CHECK === 'true') {
                        signatureValid = true;
                        console.log('Skipping signature validation in development mode');
                } else if (signature) {
                        signatureValid = validateWebhookSignature(webhookBody, signature);
                        console.log(`Signature validation result: ${signatureValid ? 'Valid' : 'Invalid'}`);
                }

                // In production, always validate signature if present
                if (!signatureValid && signature && process.env.NODE_ENV === 'production') {
                        console.error('Invalid webhook signature');
                        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
                }

                // Extract data from webhook with fallbacks for different formats
                // Cashfree webhook structure has changed across versions, so we handle multiple formats
                const data = webhookData.data || webhookData;
                const eventType = webhookData.type || webhookData.event_type || 'payment_update';

                // Extract order ID from different possible places in the payload
                const orderId = data?.order?.order_id || data?.order_id || webhookData?.order_id;
                if (!orderId) {
                        console.error('Missing order ID in webhook payload');
                        // For test or health check webhooks, still return 200
                        if (eventType === 'TEST' || eventType === 'HEALTH_CHECK') {
                                return NextResponse.json({
                                        success: true,
                                        message: 'Test webhook received successfully',
                                        receivedData: webhookData
                                });
                        }
                        return NextResponse.json({
                                success: false,
                                error: 'Missing order ID',
                                message: 'Order ID is required',
                                receivedData: webhookData
                        }, { status: 400 });
                }

                // Extract other payment details
                const orderStatus = data?.order?.order_status || data?.order_status || webhookData?.order_status;
                const paymentId = data?.payment?.cf_payment_id || data?.cf_payment_id || webhookData?.cf_payment_id;

                console.log(`Cashfree webhook processing for order ${orderId}, status: ${orderStatus}, payment ID: ${paymentId}`);

                // Check if we've already processed this webhook to avoid duplicates
                const { data: existingWebhooks, error: lookupError } = await supabase
                        .from('cashfree_webhooks')
                        .select('id, processed')
                        .eq('order_id', orderId)
                        .eq('status', orderStatus)
                        .eq('processed', true);

                // If already processed, just return success to avoid duplication
                if (!lookupError && existingWebhooks && existingWebhooks.length > 0) {
                        console.log(`Webhook for order ${orderId} with status ${orderStatus} already processed. Skipping.`);
                        return NextResponse.json({ success: true, message: 'Webhook already processed' });
                }

                // Log webhook event to dedicated Cashfree webhooks table
                const webhookId = await logCashfreeWebhook(webhookData, signature, ipAddress, eventType, orderId, orderStatus, paymentId);
                if (!webhookId) {
                        console.error('Failed to log webhook to database');
                        return NextResponse.json({ success: false, error: 'Failed to log webhook' }, { status: 500 });
                }

                // Get order details from database
                const { data: orderData, error: orderGetError } = await supabase
                        .from('payment_orders')
                        .select('*')
                        .eq('order_id', orderId)
                        .single();

                if (orderGetError) {
                        console.error(`Order not found in database: ${orderId}`, orderGetError);

                        // Update webhook record with error
                        await supabase.from('cashfree_webhooks')
                                .update({
                                        process_error: `Order not found in database: ${orderGetError.message}`,
                                        updated_at: new Date().toISOString(),
                                        processed: true
                                })
                                .eq('id', webhookId);

                        // Still return 200 to prevent Cashfree from retrying
                        return NextResponse.json({
                                success: false,
                                error: 'Order not found in database',
                                message: 'Webhook received and logged, but order not found'
                        });
                }

                console.log(`Found order in database: ${orderId}, current status: ${orderData.status}`);

                // Update order status in database
                const { error: updateError } = await supabase
                        .from('payment_orders')
                        .update({
                                status: orderStatus,
                                updated_at: new Date().toISOString(),
                                webhook_data: webhookData,
                                payment_id: paymentId || orderData.payment_id
                        })
                        .eq('order_id', orderId);

                if (updateError) {
                        console.error('Error updating payment status from webhook:', updateError);

                        // Update webhook record with error
                        await supabase
                                .from('cashfree_webhooks')
                                .update({
                                        process_error: `Failed to update payment order: ${updateError.message}`,
                                        updated_at: new Date().toISOString(),
                                        processed: true
                                })
                                .eq('id', webhookId);

                        // Still return 200 to prevent webhook retries
                        return NextResponse.json({
                                success: false,
                                error: 'Order update failed, but webhook recorded'
                        });
                }

                // Process successful payment if applicable
                // Check various success status formats from Cashfree
                const successStatuses = ['PAID', 'SUCCESS', 'OK', 'PAYMENT_SUCCESS'];
                if (successStatuses.includes(orderStatus)) {
                        await processSuccessfulPayment(orderId, webhookId);
                } else {
                        // Mark webhook as processed without additional actions for non-success states
                        await supabase
                                .from('cashfree_webhooks')
                                .update({
                                        processed: true,
                                        updated_at: new Date().toISOString()
                                })
                                .eq('id', webhookId);

                        console.log(`Webhook processed for order ${orderId} with non-success status: ${orderStatus}`);
                }

                // Return success response to acknowledge webhook
                return NextResponse.json({ success: true });
        } catch (error) {
                console.error('Error processing webhook:', error);
                // Return 200 status even on error to prevent Cashfree from retrying
                // but include the error details
                return NextResponse.json({
                        success: false,
                        error: error.message || 'Unknown error',
                        message: 'Webhook received but failed to process'
                });
        }
}

/**
 * Validate webhook signature from Cashfree
 * 
 * @param {string} payload - The raw request body
 * @param {string} signature - The signature from the header
 * @returns {boolean} Whether the signature is valid
 */
function validateWebhookSignature(payload, signature) {
        try {
                if (!signature) {
                        return false;
                }

                const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY;
                if (!webhookSecret) {
                        console.error('Webhook secret not configured - set CASHFREE_WEBHOOK_SECRET or CASHFREE_SECRET_KEY env var');
                        return false;
                }

                // Create HMAC using webhook secret
                const hmac = crypto.createHmac('sha256', webhookSecret);
                hmac.update(payload);
                const generatedSignature = hmac.digest('hex');

                console.log('Generated signature:', generatedSignature);
                console.log('Received signature:', signature);

                // Compare signatures
                return signature === generatedSignature;
        } catch (error) {
                console.error('Error validating webhook signature:', error);
                return false;
        }
}

/**
 * Log webhook event to dedicated Cashfree webhooks table
 * 
 * @param {object} webhookData - The webhook data
 * @param {string} signature - The signature from the header
 * @param {string} ipAddress - The client IP address
 * @param {string} eventType - The event type
 * @param {string} orderId - The order ID
 * @param {string} orderStatus - The order status
 * @param {string} paymentId - The payment ID
 * @returns {string|null} The webhook ID or null if failed
 */
async function logCashfreeWebhook(webhookData, signature, ipAddress, eventType, orderId, orderStatus, paymentId) {
        try {
                const data = webhookData.data || webhookData;
                const amount = data?.order?.order_amount || data?.order_amount || webhookData?.order_amount;
                const currency = data?.order?.order_currency || data?.order_currency || webhookData?.order_currency || 'INR';

                console.log(`Logging webhook: order_id=${orderId}, status=${orderStatus}, payment_id=${paymentId}, amount=${amount}`);

                // Log to dedicated Cashfree webhooks table
                const { data: insertedWebhook, error } = await supabase.from('cashfree_webhooks').insert({
                        event_type: eventType,
                        order_id: orderId,
                        payment_id: paymentId,
                        status: orderStatus,
                        amount: amount || 0,
                        currency: currency,
                        payload: webhookData,
                        signature: signature,
                        ip_address: ipAddress,
                        processed: false,
                        created_at: new Date().toISOString()
                }).select('id').single();

                if (error) {
                        console.error('Failed to log Cashfree webhook:', error);
                        return null;
                }

                return insertedWebhook.id;
        } catch (error) {
                console.error('Failed to log Cashfree webhook:', error);
                return null;
        }
}

/**
 * Process successful payment and update user coins
 * 
 * @param {string} orderId - The order ID
 * @param {string} webhookId - The webhook ID
 */
async function processSuccessfulPayment(orderId, webhookId) {
        try {
                console.log(`Processing successful payment for order ${orderId}, webhook ID: ${webhookId}`);

                // Get order details
                const { data: orderData, error: orderError } = await supabase
                        .from('payment_orders')
                        .select('user_id, amount, currency, status')
                        .eq('order_id', orderId)
                        .single();

                if (orderError || !orderData) {
                        console.error(`Error fetching order data for ${orderId}:`, orderError);

                        // Update webhook record with error
                        if (webhookId) {
                                await supabase
                                        .from('cashfree_webhooks')
                                        .update({
                                                process_error: `Failed to fetch order data: ${orderError?.message || 'Order not found'}`,
                                                updated_at: new Date().toISOString(),
                                                processed: true
                                        })
                                        .eq('id', webhookId);
                        }

                        return;
                }

                console.log(`Found order for user ${orderData.user_id}, amount: ${orderData.amount} ${orderData.currency}, current status: ${orderData.status}`);

                // Check if we've already processed this order to avoid double-crediting
                if (orderData.status === 'PAID' || orderData.status === 'COMPLETED') {
                        console.log(`Order ${orderId} already marked as paid/completed. Skipping credit update.`);

                        // Still mark webhook as processed
                        if (webhookId) {
                                await supabase
                                        .from('cashfree_webhooks')
                                        .update({
                                                processed: true,
                                                process_error: 'Order already processed',
                                                updated_at: new Date().toISOString()
                                        })
                                        .eq('id', webhookId);
                        }

                        return;
                }

                // Update user coins in profiles table
                // Convert amount to integer coins (1 rupee = 1 coin)
                const coinsToAdd = Math.floor(parseFloat(orderData.amount) || 0);
                console.log(`Adding ${coinsToAdd} coins to user ${orderData.user_id}`);

                // Update user profile with coins
                let updateSuccess = false;
                let updateErrorMessage = '';

                // Update coins in profiles table
                const { data: updateResult, error: updateError } = await supabase
                        .from('profiles')
                        .update({
                                coins: supabase.sql`COALESCE(coins, 0) + ${coinsToAdd}`,
                                updated_at: new Date().toISOString()
                        })
                        .eq('id', orderData.user_id)
                        .select('coins');

                if (updateError) {
                        console.error(`Profile update failed for user ${orderData.user_id}:`, updateError);
                        updateErrorMessage = `Profile update failed: ${updateError.message}`;

                        // Try creating the profile if it doesn't exist
                        const { data: userCheck } = await supabase.auth.admin.getUserById(orderData.user_id);

                        if (userCheck?.user) {
                                console.log('User exists but profile might not. Attempting to create profile.');

                                const { error: createError } = await supabase
                                        .from('profiles')
                                        .insert({
                                                id: orderData.user_id,
                                                coins: coinsToAdd,
                                                role: 'user',
                                                created_at: new Date().toISOString(),
                                                updated_at: new Date().toISOString()
                                        });

                                if (createError) {
                                        console.error('Failed to create profile:', createError);
                                        updateErrorMessage += ` Create profile failed: ${createError.message}`;
                                } else {
                                        updateSuccess = true;
                                        console.log(`Created new profile with ${coinsToAdd} coins`);
                                }
                        }
                } else {
                        updateSuccess = true;
                        console.log(`Successfully updated user ${orderData.user_id} coins. New balance: ${updateResult?.[0]?.coins || 'unknown'}`);
                }

                // Mark webhook as processed with success or error status
                if (webhookId) {
                        console.log(`Updating webhook ${webhookId} processed status to ${updateSuccess}`);
                        await supabase
                                .from('cashfree_webhooks')
                                .update({
                                        processed: true,
                                        process_error: updateSuccess ? null : updateErrorMessage,
                                        updated_at: new Date().toISOString()
                                })
                                .eq('id', webhookId);
                }

                // Update payment order status to COMPLETED if coins were successfully added
                if (updateSuccess) {
                        console.log(`Marking order ${orderId} as COMPLETED`);
                        await supabase
                                .from('payment_orders')
                                .update({
                                        status: 'COMPLETED',
                                        updated_at: new Date().toISOString()
                                })
                                .eq('order_id', orderId);
                }

                console.log(`Finished processing payment for order ${orderId} with ${updateSuccess ? 'success' : 'errors'}`);
        } catch (error) {
                console.error(`Unexpected error processing payment for order ${orderId}:`, error);

                // Update webhook record with error
                if (webhookId) {
                        await supabase
                                .from('cashfree_webhooks')
                                .update({
                                        processed: true,
                                        process_error: `Unexpected error: ${error.message}`,
                                        updated_at: new Date().toISOString()
                                })
                                .eq('id', webhookId);
                }
        }
} 