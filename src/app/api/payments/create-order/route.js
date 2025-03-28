import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request) {
        try {
                // Get the user session
                const supabase = createRouteHandlerClient({ cookies });
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                        console.error('No active session found');
                        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }

                const userId = session.user.id;
                console.log(`Processing payment for user: ${userId}`);

                // Get request body data
                const { amount, orderId, orderCurrency = 'INR', customerPhone } = await request.json();
                console.log(`Payment request: amount=${amount}, orderId=${orderId}, currency=${orderCurrency}`);

                if (!amount) {
                        return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
                }

                // Get user details from database
                const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('email, phone, full_name')
                        .eq('id', userId)
                        .single();

                // If we can't find user in 'users' table, try the 'profiles' table
                let finalUserData = {
                        email: session.user.email || '',
                        phone: '',
                        full_name: 'User'
                };

                if (userError) {
                        console.log(`User not found in users table, trying profiles. Error: ${userError.message}`);
                        const { data: profileData, error: profileError } = await supabase
                                .from('profiles')
                                .select('email, phone, full_name')
                                .eq('id', userId)
                                .single();

                        if (!profileError && profileData) {
                                finalUserData = {
                                        email: profileData.email || session.user.email || '',
                                        phone: profileData.phone || '',
                                        full_name: profileData.full_name || 'User'
                                };
                        } else {
                                if (profileError) {
                                        console.log(`Profile lookup error: ${profileError.message}`);
                                }
                                // Fall back to session data if available
                                finalUserData.email = session.user.email || '';
                        }
                } else if (userData) {
                        finalUserData = userData;
                }

                // Generate unique order ID if not provided
                const uniqueOrderId = orderId || `order_${Date.now()}_${userId.substring(0, 8)}`;
                console.log(`Generated order ID: ${uniqueOrderId}`);

                // Use phone number from request if provided, otherwise default to "9999999999"
                const phone = customerPhone || finalUserData.phone || "9999999999";

                // Ensure the return URL is using HTTPS
                let returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment-status?order_id=${uniqueOrderId}`;
                if (!returnUrl.startsWith('https://')) {
                        returnUrl = returnUrl.replace('http://', 'https://');
                }
                console.log(`Return URL: ${returnUrl}`);

                // Log environment variables - redacted for security
                console.log(`APP_ID: ${process.env.CASHFREE_APP_ID?.substring(0, 5)}... ENV: ${process.env.CASHFREE_ENVIRONMENT}`);

                // Prepare request for Cashfree API
                const orderData = {
                        order_id: uniqueOrderId,
                        order_amount: parseFloat(amount),
                        order_currency: orderCurrency,
                        customer_details: {
                                customer_id: userId,
                                customer_name: finalUserData.full_name || 'User',
                                customer_email: finalUserData.email || 'customer@example.com',
                                customer_phone: phone
                        },
                        order_meta: {
                                return_url: returnUrl
                        }
                };

                console.log(`Sending request to Cashfree API with order data:`, JSON.stringify(orderData));

                // Call Cashfree Production API
                const response = await fetch('https://api.cashfree.com/pg/orders', {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                                'x-api-version': '2022-09-01',
                                'x-client-id': process.env.CASHFREE_APP_ID,
                                'x-client-secret': process.env.CASHFREE_SECRET_KEY
                        },
                        body: JSON.stringify(orderData)
                });

                const responseData = await response.json();
                console.log(`Cashfree API Response Status: ${response.status}`);
                console.log(`Cashfree API Response: ${JSON.stringify(responseData)}`);

                if (!response.ok) {
                        console.error('Cashfree API error:', responseData);
                        return NextResponse.json({
                                error: responseData.message || 'Failed to create payment order',
                                details: responseData
                        }, { status: response.status });
                }

                if (!responseData.payment_session_id) {
                        console.error('Payment session ID missing in Cashfree response:', responseData);
                        return NextResponse.json({
                                error: 'Payment session ID missing in response',
                                details: responseData
                        }, { status: 500 });
                }

                // Store order in database
                const { error: insertError } = await supabase.from('payment_orders').insert({
                        order_id: uniqueOrderId,
                        user_id: userId,
                        amount: parseFloat(amount),
                        currency: orderCurrency,
                        payment_session_id: responseData.payment_session_id,
                        status: 'CREATED',
                        created_at: new Date().toISOString()
                });

                if (insertError) {
                        console.error('Error storing order in database:', insertError);
                }

                return NextResponse.json({
                        success: true,
                        orderId: uniqueOrderId,
                        paymentSessionId: responseData.payment_session_id
                });
        } catch (error) {
                console.error('Error creating payment order:', error);
                return NextResponse.json({ error: error.message || 'Failed to create payment order' }, { status: 500 });
        }
} 