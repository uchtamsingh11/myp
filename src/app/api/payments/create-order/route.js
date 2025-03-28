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
                        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }

                const userId = session.user.id;

                // Get request body data
                const { amount, orderId, orderCurrency = 'INR', customerPhone } = await request.json();

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
                                // Fall back to session data if available
                                finalUserData.email = session.user.email || '';
                        }
                } else if (userData) {
                        finalUserData = userData;
                }

                // Generate unique order ID if not provided
                const uniqueOrderId = orderId || `order_${Date.now()}_${userId.substring(0, 8)}`;

                // Use phone number from request if provided, otherwise default to "9999999999"
                const phone = customerPhone || finalUserData.phone || "9999999999";

                // Ensure the return URL is using HTTPS
                let returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment-status?order_id=${uniqueOrderId}`;
                if (!returnUrl.startsWith('https://')) {
                        returnUrl = returnUrl.replace('http://', 'https://');
                }

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

                if (!response.ok) {
                        console.error('Cashfree API error:', responseData);
                        return NextResponse.json({
                                error: responseData.message || 'Failed to create payment order'
                        }, { status: response.status });
                }

                // Store order in database
                await supabase.from('payment_orders').insert({
                        order_id: uniqueOrderId,
                        user_id: userId,
                        amount: parseFloat(amount),
                        currency: orderCurrency,
                        payment_session_id: responseData.payment_session_id,
                        status: 'CREATED',
                        created_at: new Date().toISOString()
                });

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