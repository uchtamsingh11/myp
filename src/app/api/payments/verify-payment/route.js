import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Create Supabase clients - regular for auth and admin for database operations
const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Verify payment status with Cashfree payment gateway
 * This endpoint is called after the user is redirected back from Cashfree
 * 
 * @see https://docs.cashfree.com/docs/pg-get-order
 */
export async function GET(request) {
        try {
                // Get order_id from URL query parameters
                const { searchParams } = new URL(request.url);
                const orderId = searchParams.get('order_id');

                if (!orderId) {
                        return NextResponse.json({
                                success: false,
                                error: 'Missing order ID',
                                message: 'Order ID is required'
                        }, { status: 400 });
                }

                console.log(`Verifying payment status for order: ${orderId}`);

                // Get the authenticated user
                const supabase = createRouteHandlerClient({ cookies });
                const { data: { session } } = await supabase.auth.getSession();

                // If no session, proceed but log the fact - user might be logged out during payment
                if (!session) {
                        console.log('No active session found, proceeding with verification');
                } else {
                        console.log(`Verifying payment for user: ${session.user.id}`);
                }

                // Configure API endpoint based on environment
                const apiUrl = process.env.CASHFREE_ENVIRONMENT === 'production'
                        ? `https://api.cashfree.com/pg/orders/${orderId}`
                        : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

                console.log(`Using Cashfree ${process.env.CASHFREE_ENVIRONMENT} environment: ${apiUrl}`);

                // Call Cashfree API to verify payment status
                const response = await fetch(apiUrl, {
                        method: 'GET',
                        headers: {
                                'Content-Type': 'application/json',
                                'x-api-version': '2023-08-01',
                                'x-client-id': process.env.CASHFREE_APP_ID,
                                'x-client-secret': process.env.CASHFREE_SECRET_KEY
                        }
                });

                const orderData = await response.json();

                if (!response.ok) {
                        console.error('Cashfree API error:', orderData);
                        return NextResponse.json({
                                success: false,
                                error: 'Failed to verify payment',
                                details: orderData
                        }, { status: response.status });
                }

                console.log(`Payment verification response for order ${orderId}:`, JSON.stringify(orderData).substring(0, 200) + '...');

                // Check if order status indicates payment is completed
                const isPaid = orderData.order_status === 'PAID';

                // Update order status in database - use admin client to update regardless of auth status
                const { error: updateError } = await adminSupabase
                        .from('payment_orders')
                        .update({
                                status: orderData.order_status,
                                updated_at: new Date().toISOString()
                        })
                        .eq('order_id', orderId);

                if (updateError) {
                        console.error('Error updating order status in database:', updateError);
                }

                // If payment is successful, add coins to user's account
                let coinBalanceUpdated = false;
                let coinsAdded = 0;
                let newBalance = 0;

                if (isPaid) {
                        try {
                                // Get order details from database to find the user
                                const { data: orderDetails, error: orderError } = await adminSupabase
                                        .from('payment_orders')
                                        .select('user_id, amount, coins_added')
                                        .eq('order_id', orderId)
                                        .single();

                                if (orderError) {
                                        console.error('Error fetching order details:', orderError);
                                } else if (!orderDetails.coins_added) { // Only add coins if not already added
                                        const userId = orderDetails.user_id;
                                        const amount = parseFloat(orderDetails.amount || orderData.order_amount || "0");

                                        // Calculate coins (1 INR = 1 coin)
                                        coinsAdded = Math.floor(amount);

                                        // Get current coin balance
                                        const { data: profileData, error: profileError } = await adminSupabase
                                                .from('profiles')
                                                .select('coins')
                                                .eq('id', userId)
                                                .single();

                                        if (profileError) {
                                                console.error(`Error fetching profile for user ${userId}:`, profileError);
                                                throw new Error(`Failed to fetch profile: ${profileError.message}`);
                                        }

                                        const currentCoins = profileData?.coins || 0;
                                        newBalance = currentCoins + coinsAdded;

                                        // Update user's coin balance directly with admin privileges
                                        const { error: coinUpdateError } = await adminSupabase
                                                .from('profiles')
                                                .update({ coins: newBalance })
                                                .eq('id', userId);

                                        if (coinUpdateError) {
                                                console.error(`Error updating coins for user ${userId}:`, coinUpdateError);
                                                throw new Error(`Failed to update coins: ${coinUpdateError.message}`);
                                        }

                                        // Update order with fulfillment details
                                        await adminSupabase
                                                .from('payment_orders')
                                                .update({
                                                        coins_added: coinsAdded,
                                                        status: 'FULFILLED',
                                                        fulfilled_at: new Date().toISOString()
                                                })
                                                .eq('order_id', orderId);

                                        console.log(`Added ${coinsAdded} coins to user ${userId}. New balance: ${newBalance}`);
                                        coinBalanceUpdated = true;
                                } else {
                                        console.log(`Coins already added for order ${orderId}`);
                                        coinsAdded = orderDetails.coins_added;
                                        coinBalanceUpdated = true;
                                }
                        } catch (coinError) {
                                console.error('Error processing coins for order:', coinError);
                        }
                }

                // Return payment status
                return NextResponse.json({
                        success: true,
                        orderId: orderId,
                        orderStatus: orderData.order_status,
                        orderAmount: orderData.order_amount,
                        currency: orderData.order_currency,
                        isPaid: isPaid,
                        coinBalanceUpdated,
                        coinsAdded,
                        newBalance,
                        paymentDetails: {
                                paymentMethod: orderData.payment_method,
                                paymentTime: orderData.payment_time,
                                referenceId: orderData.cf_order_id
                        }
                });
        } catch (error) {
                console.error('Error verifying payment:', error);
                return NextResponse.json({
                        success: false,
                        error: error.message || 'Unknown error',
                        message: 'Failed to verify payment'
                }, { status: 500 });
        }
} 