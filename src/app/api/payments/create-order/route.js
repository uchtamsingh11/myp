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
 * Create a payment order with Cashfree payment gateway
 * 
 * @see https://docs.cashfree.com/docs/create-order-with-seamless-checkout
 */
export async function POST(request) {
        try {
                // Get the authenticated user
                const supabase = createRouteHandlerClient({ cookies });
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                        console.error('Authentication error:', sessionError);
                        return NextResponse.json({
                                success: false,
                                error: 'Authentication required',
                                message: 'Please sign in to create a payment order'
                        }, { status: 401 });
                }

                // Extract user ID from session
                const userId = session.user.id;
                console.log(`Creating payment order for user: ${userId}`);

                // Get request data
                const { amount, orderId, description, customerName, customerEmail, customerPhone } = await request.json();

                // Basic validation
                if (!amount || amount <= 0) {
                        return NextResponse.json({
                                success: false,
                                error: 'Invalid amount',
                                message: 'Amount must be greater than 0'
                        }, { status: 400 });
                }

                if (!orderId) {
                        return NextResponse.json({
                                success: false,
                                error: 'Missing order ID',
                                message: 'Order ID is required'
                        }, { status: 400 });
                }

                // Configure API endpoint based on environment
                const apiUrl = process.env.CASHFREE_ENVIRONMENT === 'production'
                        ? 'https://api.cashfree.com/pg/orders'
                        : 'https://sandbox.cashfree.com/pg/orders';

                console.log(`Using Cashfree ${process.env.CASHFREE_ENVIRONMENT} environment: ${apiUrl}`);

                // Prepare customer details - mask sensitive info for logs
                const customer = {
                        customer_id: userId,
                        customer_name: customerName || 'User',
                        customer_email: customerEmail || '',
                        customer_phone: customerPhone || ''
                };

                console.log(`Creating order with ID: ${orderId} for amount: ${amount}`);
                // Don't log full customer details - just create a masked version for logs
                const maskedCustomer = {
                        ...customer,
                        customer_email: customer.customer_email ? `${customer.customer_email.substring(0, 3)}***` : '',
                        customer_phone: customer.customer_phone ? `***${customer.customer_phone.slice(-4)}` : ''
                };
                console.log('Customer details:', maskedCustomer);

                // Prepare order data for Cashfree API
                const orderData = {
                        order_id: orderId,
                        order_amount: amount,
                        order_currency: 'INR',
                        customer_details: customer,
                        order_meta: {
                                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment-status?order_id={order_id}&status={status}`,
                                notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/cashfree-webhook`
                        },
                        order_note: description || 'Purchase coins'
                };

                // Create order in Cashfree
                const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                                'x-api-version': '2023-08-01',
                                'x-client-id': process.env.CASHFREE_APP_ID,
                                'x-client-secret': process.env.CASHFREE_SECRET_KEY
                        },
                        body: JSON.stringify(orderData)
                });

                const responseData = await response.json();

                if (!response.ok) {
                        console.error('Cashfree API error:', responseData);
                        return NextResponse.json({
                                success: false,
                                error: 'Failed to create payment order',
                                details: responseData
                        }, { status: response.status });
                }

                console.log('Cashfree order created successfully');

                // Store order in database
                const { error: dbError } = await adminSupabase
                        .from('payment_orders')
                        .insert({
                                order_id: orderId,
                                user_id: userId,
                                amount: amount,
                                description: description || 'Purchase coins',
                                status: 'CREATED',
                                payment_session_id: responseData.payment_session_id,
                                created_at: new Date().toISOString(),
                                metadata: {
                                        customer_name: customerName,
                                        customer_email: customerEmail,
                                        customer_phone: customerPhone
                                }
                        });

                if (dbError) {
                        console.error('Database error:', dbError);
                        return NextResponse.json({
                                success: false,
                                error: 'Database error',
                                message: 'Failed to record payment order in database'
                        }, { status: 500 });
                }

                // Return payment session ID for frontend
                return NextResponse.json({
                        success: true,
                        orderId: orderId,
                        paymentSessionId: responseData.payment_session_id,
                        cfOrderId: responseData.cf_order_id
                });
        } catch (error) {
                console.error('Error creating payment order:', error);
                return NextResponse.json({
                        success: false,
                        error: error.message || 'Unknown error',
                        message: 'Failed to create payment order'
                }, { status: 500 });
        }
} 