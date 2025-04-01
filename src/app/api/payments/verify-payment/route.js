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

                // Return payment status
                return NextResponse.json({
                        success: true,
                        orderId: orderId,
                        orderStatus: orderData.order_status,
                        orderAmount: orderData.order_amount,
                        currency: orderData.order_currency,
                        isPaid: isPaid,
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