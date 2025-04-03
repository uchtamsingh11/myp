import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Force dynamic to ensure every webhook request is processed as new
export const dynamic = 'force-dynamic';

// Create a Supabase client with Admin privileges for webhook processing
const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET endpoint for health checks and debugging
 */
export async function GET(request) {
        return NextResponse.json({
                status: 'active',
                message: 'Cashfree webhook endpoint is active',
                timestamp: new Date().toISOString()
        });
}

/**
 * POST endpoint to handle Cashfree webhook events
 * @see https://www.cashfree.com/docs/payments/online/webhooks/overview
 */
export async function POST(request) {
        try {
                // Clone the request to handle both text and JSON access (needed for signature verification)
                const clonedRequest = request.clone();

                // Get client IP address for security logging
                const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

                // Extract key headers for processing and logging
                const contentType = request.headers.get('content-type') || '';
                const signature = request.headers.get('x-webhook-signature');
                const timestamp = request.headers.get('x-webhook-timestamp');
                const idempotencyKey = request.headers.get('x-idempotency-key') ||
                        request.headers.get('x-webhook-id');

                console.log(`Cashfree webhook received from IP: ${ipAddress}`);
                console.log(`Signature: ${signature ? '✓ Present' : '✗ Missing'}`);
                console.log(`Timestamp: ${timestamp || 'Not provided'}`);
                console.log(`Idempotency Key: ${idempotencyKey || 'Not provided'}`);

                // First get the raw body text for signature verification
                const rawBody = await clonedRequest.text();

                // Handle empty webhook body
                if (!rawBody || rawBody.trim() === '') {
                        console.error('Empty webhook body received');
                        return NextResponse.json({
                                success: false,
                                error: 'Empty request body'
                        }, { status: 400 });
                }

                // Parse the webhook payload
                let webhookData;
                try {
                        webhookData = JSON.parse(rawBody);
                        console.log('Webhook data parsed successfully');
                } catch (e) {
                        console.error('Failed to parse webhook data as JSON:', e);
                        return NextResponse.json({
                                success: false,
                                error: 'Invalid JSON payload'
                        }, { status: 400 });
                }

                // Verify webhook signature if provided
                let signatureValid = false;

                if (process.env.NODE_ENV === 'development' && process.env.SKIP_SIGNATURE_CHECK === 'true') {
                        // Skip signature check in development if explicitly configured
                        signatureValid = true;
                        console.log('Signature check skipped in development mode');
                } else if (signature) {
                        // Verify signature using Cashfree's method
                        signatureValid = verifyWebhookSignature(rawBody, signature, timestamp);
                        console.log(`Signature verification: ${signatureValid ? 'Valid ✓' : 'Invalid ✗'}`);

                        // In production, reject invalid signatures immediately
                        if (!signatureValid && process.env.NODE_ENV === 'production') {
                                console.error('Invalid webhook signature in production - rejected');
                                return NextResponse.json({
                                        success: false,
                                        error: 'Invalid signature'
                                }, { status: 401 });
                        }
                }

                // Normalize the data structure (Cashfree has changed formats across versions)
                const data = webhookData.data || webhookData;
                const eventType = webhookData.type || webhookData.event_type || 'payment_update';

                // Extract key fields with fallbacks for different webhook formats
                const orderId = data?.order?.order_id || data?.order_id || webhookData?.order_id;
                const orderStatus = data?.order?.order_status || data?.order_status || webhookData?.order_status;
                const paymentId = data?.payment?.cf_payment_id || data?.cf_payment_id || webhookData?.cf_payment_id;

                // Validate required fields
                if (!orderId) {
                        console.error('Missing order ID in webhook payload');

                        // For test webhooks, still return 200
                        if (eventType === 'TEST' || eventType === 'HEALTH_CHECK') {
                                return NextResponse.json({
                                        success: true,
                                        message: 'Test webhook received'
                                });
                        }

                        return NextResponse.json({
                                success: false,
                                error: 'Missing order ID'
                        }, { status: 400 });
                }

                console.log(`Processing webhook for order ${orderId}, status: ${orderStatus}, payment ID: ${paymentId}`);

                // Check for duplicate webhooks using idempotency key
                if (idempotencyKey) {
                        const { data: existingWebhooks, error: idempotencyError } = await supabase
                                .from('cashfree_webhooks')
                                .select('id, processed')
                                .eq('idempotency_key', idempotencyKey)
                                .limit(1);

                        if (!idempotencyError && existingWebhooks?.length > 0) {
                                console.log(`Webhook with idempotency key ${idempotencyKey} already processed. Skipping.`);
                                return NextResponse.json({
                                        success: true,
                                        message: 'Webhook already processed'
                                });
                        }
                }

                // Alternatively check by order_id and status for backward compatibility
                const { data: existingWebhooks, error: lookupError } = await supabase
                        .from('cashfree_webhooks')
                        .select('id, processed')
                        .eq('order_id', orderId)
                        .eq('status', orderStatus)
                        .eq('processed', true);

                if (!lookupError && existingWebhooks?.length > 0) {
                        console.log(`Webhook for order ${orderId} with status ${orderStatus} already processed. Skipping.`);
                        return NextResponse.json({
                                success: true,
                                message: 'Webhook already processed'
                        });
                }

                // Log webhook to database first (before processing)
                const webhookId = await logWebhook(
                        webhookData,
                        signature,
                        ipAddress,
                        eventType,
                        orderId,
                        orderStatus,
                        paymentId,
                        idempotencyKey
                );

                if (!webhookId) {
                        console.error('Failed to log webhook to database');
                        return NextResponse.json({
                                success: false,
                                error: 'Database error'
                        }, { status: 500 });
                }

                // Process the webhook based on the event type
                let processResult;
                try {
                        processResult = await processPaymentWebhook(webhookData, orderId, orderStatus, paymentId);

                        // Mark webhook as processed
                        await supabase
                                .from('cashfree_webhooks')
                                .update({
                                        processed: true,
                                        process_result: processResult,
                                        updated_at: new Date().toISOString()
                                })
                                .eq('id', webhookId);

                        console.log(`Webhook ${webhookId} for order ${orderId} processed successfully`);
                } catch (error) {
                        console.error(`Error processing webhook for order ${orderId}:`, error);

                        // Update webhook record with error
                        await supabase
                                .from('cashfree_webhooks')
                                .update({
                                        processed: false,
                                        process_result: {
                                                error: error.message,
                                                timestamp: new Date().toISOString()
                                        },
                                        updated_at: new Date().toISOString()
                                })
                                .eq('id', webhookId);

                        // Still return 200 to prevent Cashfree from retrying
                        return NextResponse.json({
                                success: false,
                                error: 'Processing error',
                                message: 'Webhook received but failed to process'
                        });
                }

                // Return success response
                return NextResponse.json({
                        success: true,
                        message: 'Webhook processed successfully',
                        orderId,
                        status: orderStatus
                });
        } catch (error) {
                console.error('Unhandled error in webhook processing:', error);

                // Return 200 status even on error to prevent Cashfree from retrying
                return NextResponse.json({
                        success: false,
                        error: error.message,
                        message: 'Webhook received but failed to process'
                });
        }
}

/**
 * Verifies the webhook signature from Cashfree
 * @param {string} payload - Raw webhook payload
 * @param {string} signature - Signature from header
 * @param {string} timestamp - Timestamp from header
 * @returns {boolean} Whether signature is valid
 */
function verifyWebhookSignature(payload, signature, timestamp) {
        try {
                if (!signature) {
                        console.warn('No signature provided for verification');
                        return false;
                }

                const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY;
                if (!webhookSecret) {
                        console.error('Webhook secret not configured - set CASHFREE_WEBHOOK_SECRET or CASHFREE_SECRET_KEY');
                        return false;
                }

                if (timestamp) {
                        // New method (2023-08-01 and newer): timestamp + payload
                        console.log('Using new webhook signature verification with timestamp');
                        const signedPayload = timestamp + payload;
                        const hmac = crypto.createHmac('sha256', webhookSecret);
                        hmac.update(signedPayload);
                        const generatedSignature = hmac.digest('base64');

                        console.log('Expected signature:', generatedSignature.substring(0, 10) + '...');
                        console.log('Provided signature:', signature.substring(0, 10) + '...');

                        return signature === generatedSignature;
                } else {
                        // Legacy method (pre 2023-08-01)
                        console.log('Using legacy webhook signature verification without timestamp');
                        const hmac = crypto.createHmac('sha256', webhookSecret);
                        hmac.update(payload);
                        const generatedSignature = hmac.digest('hex');

                        console.log('Expected signature (legacy):', generatedSignature.substring(0, 10) + '...');
                        console.log('Provided signature:', signature.substring(0, 10) + '...');

                        return signature === generatedSignature || signature.includes(generatedSignature);
                }
        } catch (error) {
                console.error('Error validating webhook signature:', error);
                return false;
        }
}

/**
 * Logs webhook data to the cashfree_webhooks table
 */
async function logWebhook(webhookData, signature, ipAddress, eventType, orderId, orderStatus, paymentId, idempotencyKey) {
        try {
                const data = webhookData.data || webhookData;
                const amount = data?.order?.order_amount || data?.order_amount || webhookData?.order_amount;
                const currency = data?.order?.order_currency || data?.order_currency || webhookData?.order_currency || 'INR';

                console.log(`Logging webhook: order_id=${orderId}, status=${orderStatus}, payment_id=${paymentId}, amount=${amount}`);

                // Insert webhook record
                const { data: insertedWebhook, error } = await supabase
                        .from('cashfree_webhooks')
                        .insert({
                                event_type: eventType,
                                order_id: orderId,
                                payment_id: paymentId,
                                status: orderStatus,
                                amount: amount || 0,
                                currency: currency,
                                payload: webhookData,
                                signature: signature,
                                ip_address: ipAddress,
                                idempotency_key: idempotencyKey || null,
                                processed: false,
                                created_at: new Date().toISOString()
                        })
                        .select('id')
                        .single();

                if (error) {
                        console.error('Failed to log webhook:', error);
                        return null;
                }

                return insertedWebhook.id;
        } catch (error) {
                console.error('Error logging webhook:', error);
                return null;
        }
}

/**
 * Processes a payment webhook based on the event type and status
 */
async function processPaymentWebhook(webhookData, orderId, orderStatus, paymentId) {
        try {
                const data = webhookData.data || webhookData;
                const eventType = webhookData.type || webhookData.event_type || 'payment_update';

                console.log(`Processing ${eventType} event for order ${orderId} with status ${orderStatus}`);

                // Get the order from database
                const { data: orderData, error: orderError } = await supabase
                        .from('payment_orders')
                        .select('*')
                        .eq('order_id', orderId)
                        .single();

                if (orderError) {
                        console.error(`Order ${orderId} not found in database:`, orderError);
                        return {
                                success: false,
                                error: 'Order not found',
                                timestamp: new Date().toISOString()
                        };
                }

                // Update order status in database
                const { error: updateError } = await supabase
                        .from('payment_orders')
                        .update({
                                status: orderStatus,
                                webhook_data: webhookData,
                                updated_at: new Date().toISOString()
                        })
                        .eq('order_id', orderId);

                if (updateError) {
                        console.error(`Failed to update order ${orderId}:`, updateError);
                        return {
                                success: false,
                                error: 'Failed to update order',
                                timestamp: new Date().toISOString()
                        };
                }

                // Add custom business logic based on the payment status
                if (orderStatus === 'PAID') {
                        console.log(`Payment successful for order ${orderId}`);

                        // Get user ID from order data
                        const userId = orderData.user_id;

                        if (!userId) {
                                console.error(`No user ID found for order ${orderId}`);
                                return {
                                        success: false,
                                        error: 'No user ID associated with order',
                                        timestamp: new Date().toISOString()
                                };
                        }

                        // Get amount from order data or webhook data
                        const amount = parseFloat(orderData.amount || webhookData.data?.order?.order_amount || "0");

                        try {
                                // Check if coins already added to avoid duplicates
                                if (orderData.coins_added) {
                                        console.log(`Coins already added for order ${orderId}: ${orderData.coins_added}`);
                                        return {
                                                success: true,
                                                message: 'Payment already processed and coins already added',
                                                orderId,
                                                orderStatus: 'FULFILLED',
                                                paymentId,
                                                coinsAdded: orderData.coins_added,
                                                timestamp: new Date().toISOString()
                                        };
                                }

                                // Calculate coins (1 INR = 1 coin)
                                const coinsToAdd = Math.floor(amount);

                                if (coinsToAdd <= 0) {
                                        console.error(`Invalid coin amount for order ${orderId}: ${coinsToAdd}`);
                                        return {
                                                success: false,
                                                error: 'Invalid coin amount',
                                                timestamp: new Date().toISOString()
                                        };
                                }

                                // Import the coin management service
                                const { addCoins } = await import('../../../../lib/services/coin-management');

                                // Add coins to the user's balance
                                const newBalance = await addCoins(userId, coinsToAdd);

                                console.log(`Added ${coinsToAdd} coins to user ${userId}. New balance: ${newBalance}`);

                                // Update the order with fulfillment details
                                await supabase
                                        .from('payment_orders')
                                        .update({
                                                coins_added: coinsToAdd,
                                                status: 'FULFILLED',
                                                fulfilled_at: new Date().toISOString()
                                        })
                                        .eq('order_id', orderId);

                                return {
                                        success: true,
                                        message: 'Payment successful and coins added to user account',
                                        orderId,
                                        orderStatus: 'FULFILLED',
                                        paymentId,
                                        coinsAdded: coinsToAdd,
                                        newBalance,
                                        timestamp: new Date().toISOString()
                                };
                        } catch (coinError) {
                                console.error(`Error adding coins for order ${orderId}:`, coinError);
                                return {
                                        success: false,
                                        error: 'Failed to add coins to user account',
                                        details: coinError.message,
                                        timestamp: new Date().toISOString()
                                };
                        }
                } else if (orderStatus === 'FAILED') {
                        console.log(`Payment failed for order ${orderId}`);
                        // Handle failed payment

                        return {
                                success: false,
                                message: 'Payment failed',
                                orderId,
                                orderStatus,
                                paymentId,
                                timestamp: new Date().toISOString()
                        };
                } else {
                        // Handle other statuses
                        console.log(`Order ${orderId} status updated to ${orderStatus}`);

                        return {
                                success: true,
                                message: 'Order status updated',
                                orderId,
                                orderStatus,
                                paymentId,
                                timestamp: new Date().toISOString()
                        };
                }
        } catch (error) {
                console.error(`Error processing payment webhook for order ${orderId}:`, error);
                throw error; // Let the caller handle this
        }
}