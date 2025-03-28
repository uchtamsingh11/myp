import { NextResponse } from 'next/server';
import crypto from 'crypto';
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
                const signature = request.headers.get('x-webhook-signature') ||
                        request.headers.get('x-cashfree-signature');

                console.log('Cashfree webhook received:', JSON.stringify(webhookData).substring(0, 200) + '...');

                // Validate webhook signature if available
                if (signature && !validateWebhookSignature(webhookData, signature)) {
                        console.error('Invalid webhook signature');
                        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
                }

                // Extract data from webhook with fallbacks for different formats
                const { data } = webhookData;
                const orderId = data?.order_id || webhookData?.order_id;
                const orderStatus = data?.order_status || webhookData?.order_status;

                if (!orderId) {
                        console.error('Missing order ID in webhook payload');
                        return NextResponse.json({ success: false, error: 'Missing order ID' });
                }

                console.log(`Cashfree webhook received for order ${orderId}, status: ${orderStatus}`);

                // Check if this webhook has already been processed by looking up the order_id and status
                const { data: existingWebhooks, error: lookupError } = await supabase
                        .from('cashfree_webhooks')
                        .select('id, processed')
                        .eq('order_id', orderId)
                        .eq('status', orderStatus)
                        .eq('processed', true);

                // If we already have a processed webhook with the same order_id and status, skip processing
                if (!lookupError && existingWebhooks && existingWebhooks.length > 0) {
                        console.log(`Webhook for order ${orderId} with status ${orderStatus} already processed. Skipping.`);
                        return NextResponse.json({ success: true, message: 'Webhook already processed' });
                }

                // Log webhook event to dedicated Cashfree webhooks table
                const webhookId = await logCashfreeWebhook(webhookData, signature, ipAddress);

                // Update order status in database
                const { error: updateError } = await supabase
                        .from('payment_orders')
                        .update({
                                status: orderStatus,
                                updated_at: new Date().toISOString(),
                                webhook_data: webhookData
                        })
                        .eq('order_id', orderId);

                if (updateError) {
                        console.error('Error updating payment status from webhook:', updateError);

                        // Update webhook record with error
                        await supabase
                                .from('cashfree_webhooks')
                                .update({
                                        process_error: `Failed to update payment order: ${updateError.message}`,
                                        updated_at: new Date().toISOString()
                                })
                                .eq('id', webhookId);

                        // Still return 200 to prevent webhook retries
                        return NextResponse.json({ success: false, error: 'Order update failed, but webhook recorded' });
                }

                // Process successful payment
                // Check various success status formats from Cashfree
                if (orderStatus === 'PAID' ||
                        orderStatus === 'SUCCESS' ||
                        orderStatus === 'OK' ||
                        orderStatus === 'PAYMENT_SUCCESS') {
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
                }

                // Return success response to acknowledge webhook
                return NextResponse.json({ success: true });
        } catch (error) {
                console.error('Error processing webhook:', error);
                // Return 200 status even on error to prevent Cashfree from retrying
                return NextResponse.json({ success: false, error: error.message });
        }
}

// Validate webhook signature
function validateWebhookSignature(payload, signature) {
        try {
                // If no signature in test environment, skip validation
                if (process.env.NODE_ENV !== 'production' && !signature) {
                        return true;
                }

                if (!signature) {
                        return false;
                }

                const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY;

                // Create HMAC using webhook secret
                const hmac = crypto.createHmac('sha256', webhookSecret);
                hmac.update(JSON.stringify(payload));
                const generatedSignature = hmac.digest('hex');

                // Compare signatures
                return signature === generatedSignature;
        } catch (error) {
                console.error('Error validating webhook signature:', error);
                return false;
        }
}

// Log webhook event to dedicated Cashfree webhooks table
async function logCashfreeWebhook(webhookData, signature, ipAddress) {
        try {
                const { data, type: eventType } = webhookData;
                const orderId = data?.order_id || webhookData?.order_id;
                const orderStatus = data?.order_status || webhookData?.order_status;
                const paymentId = data?.payment?.cf_payment_id || data?.cf_payment_id || webhookData?.cf_payment_id;
                const amount = data?.order?.order_amount || data?.order_amount || webhookData?.order_amount;
                const currency = data?.order?.order_currency || data?.order_currency || webhookData?.order_currency || 'INR';

                // Log to dedicated Cashfree webhooks table
                const { data: insertedWebhook, error } = await supabase.from('cashfree_webhooks').insert({
                        event_type: eventType || 'payment_update',
                        order_id: orderId,
                        payment_id: paymentId,
                        status: orderStatus,
                        amount: amount,
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

// Process successful payment
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
                                                updated_at: new Date().toISOString()
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

                // Update user account with new credits
                let updateSuccess = false;
                let updateErrorMessage = '';

                // First, check if profiles table exists and has the user
                const { data: profileCheck, error: profileCheckError } = await supabase
                        .from('profiles')
                        .select('id, credits')
                        .eq('id', orderData.user_id)
                        .single();

                console.log(`Profile check for user ${orderData.user_id}:`,
                        profileCheckError ? `Error: ${profileCheckError.message}` :
                                `Found with current credits: ${profileCheck?.credits || 0}`);

                // Determine which table to update
                const targetTable = profileCheck ? 'profiles' : 'user_accounts';
                console.log(`Will update credits in ${targetTable} table`);

                if (targetTable === 'profiles') {
                        // Update profiles table
                        const { data: updateResult, error: profilesError } = await supabase
                                .from('profiles')
                                .update({
                                        credits: supabase.sql`COALESCE(credits, 0) + ${orderData.amount}`,
                                        updated_at: new Date().toISOString()
                                })
                                .eq('id', orderData.user_id)
                                .select('credits');

                        if (profilesError) {
                                console.error(`Profile update failed for user ${orderData.user_id}:`, profilesError);
                                updateErrorMessage = `Profile update failed: ${profilesError.message}`;
                        } else {
                                updateSuccess = true;
                                console.log(`Successfully updated user ${orderData.user_id} credits in profiles table. New balance: ${updateResult?.[0]?.credits || 'unknown'}`);
                        }
                } else {
                        // Try updating user_accounts as fallback
                        console.log(`Falling back to user_accounts table for user ${orderData.user_id}`);

                        const { data: updateResult, error: accountsError } = await supabase
                                .from('user_accounts')
                                .update({
                                        credits: supabase.sql`COALESCE(credits, 0) + ${orderData.amount}`,
                                        updated_at: new Date().toISOString()
                                })
                                .eq('user_id', orderData.user_id)
                                .select('credits');

                        if (accountsError) {
                                console.error(`User account update failed for user ${orderData.user_id}:`, accountsError);
                                updateErrorMessage = `User account update failed: ${accountsError.message}`;

                                // If we can't find the user account, try to create one
                                if (accountsError.code === 'PGRST116') {
                                        console.log(`Attempting to create user_account for ${orderData.user_id}`);
                                        const { error: createError } = await supabase
                                                .from('user_accounts')
                                                .insert({
                                                        user_id: orderData.user_id,
                                                        credits: orderData.amount,
                                                        created_at: new Date().toISOString(),
                                                        updated_at: new Date().toISOString()
                                                });

                                        if (createError) {
                                                console.error(`Failed to create user_account:`, createError);
                                                updateErrorMessage += ` Create account failed: ${createError.message}`;
                                        } else {
                                                updateSuccess = true;
                                                console.log(`Created new user_account with ${orderData.amount} credits`);
                                        }
                                }
                        } else {
                                updateSuccess = true;
                                console.log(`Successfully updated user ${orderData.user_id} credits in user_accounts table. New balance: ${updateResult?.[0]?.credits || 'unknown'}`);
                        }
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

                // Update payment order status to COMPLETED if credits were successfully added
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