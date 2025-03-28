import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request) {
        try {
                // Get the order_id from query parameters
                const { searchParams } = new URL(request.url);
                const orderId = searchParams.get('order_id');

                if (!orderId) {
                        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
                }

                // Get the user session
                const supabase = createRouteHandlerClient({ cookies });
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }

                // Verify payment status with Cashfree API
                const response = await fetch(`https://api.cashfree.com/pg/orders/${orderId}`, {
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
                        return NextResponse.json({ error: 'Failed to verify payment' }, { status: response.status });
                }

                // Update order status in database
                const { error: updateError } = await supabase
                        .from('payment_orders')
                        .update({
                                status: orderData.order_status,
                                updated_at: new Date().toISOString()
                        })
                        .eq('order_id', orderId);

                if (updateError) {
                        console.error('Error updating payment status:', updateError);
                }

                // Return payment status
                return NextResponse.json({
                        success: true,
                        orderId: orderId,
                        orderStatus: orderData.order_status,
                        orderAmount: orderData.order_amount,
                        isPaid: orderData.order_status === 'PAID'
                });
        } catch (error) {
                console.error('Error verifying payment:', error);
                return NextResponse.json({ error: error.message || 'Failed to verify payment' }, { status: 500 });
        }
} 