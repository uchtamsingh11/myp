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
 * Ensures the payment_orders table exists
 * This function is called if we detect the table is missing
 */
async function ensurePaymentOrdersTable() {
        try {
                console.log('Attempting to create missing payment_orders table...');
                
                // SQL to create the table with minimal required fields
                const { error } = await adminSupabase.rpc('create_payment_orders_table', {});
                
                if (error) {
                        console.error('Failed to create table via RPC:', error);
                        
                        // Try direct SQL as fallback (though this may not work via JS API)
                        const createTableSql = `
                        CREATE TABLE IF NOT EXISTS public.payment_orders (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                order_id TEXT NOT NULL UNIQUE,
                                user_id UUID NOT NULL,
                                amount DECIMAL(10, 2) NOT NULL,
                                currency TEXT NOT NULL DEFAULT 'INR',
                                payment_session_id TEXT,
                                status TEXT NOT NULL DEFAULT 'CREATED',
                                webhook_data JSONB,
                                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                        );
                        
                        ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
                        
                        CREATE POLICY "Users can view their own payment orders"
                                ON public.payment_orders
                                FOR SELECT
                                USING (auth.uid() = user_id);
                                
                        GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_orders TO service_role;
                        GRANT SELECT ON public.payment_orders TO authenticated;
                        `;
                        
                        // This won't work in JS runtime but we'll log the SQL for manual execution
                        console.log('Table creation SQL (needs manual execution in SQL editor):', createTableSql);
                        
                        return false;
                }
                
                console.log('Successfully created payment_orders table');
                return true;
        } catch (err) {
                console.error('Error creating payment_orders table:', err);
                return false;
        }
}

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

                // Try to store order in database
                let { error: dbError } = await adminSupabase
                        .from('payment_orders')
                        .insert({
                                order_id: orderId,
                                user_id: userId,
                                amount: amount,
                                currency: 'INR',
                                status: 'CREATED',
                                payment_session_id: responseData.payment_session_id,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                        });

                // If table doesn't exist error (code 42P01), try to create it
                if (dbError && (dbError.code === '42P01' || dbError.message?.includes('does not exist'))) {
                        console.error('Table does not exist error:', dbError);
                        
                        // Try to create the table
                        const tableCreated = await ensurePaymentOrdersTable();
                        
                        if (tableCreated) {
                                // Try insert again
                                const { error: retryError } = await adminSupabase
                                        .from('payment_orders')
                                        .insert({
                                                order_id: orderId,
                                                user_id: userId,
                                                amount: amount,
                                                currency: 'INR',
                                                status: 'CREATED',
                                                payment_session_id: responseData.payment_session_id,
                                                created_at: new Date().toISOString(),
                                                updated_at: new Date().toISOString()
                                        });
                                
                                if (retryError) {
                                        console.error('Database error after table creation:', retryError);
                                } else {
                                        console.log('Successfully inserted order after creating table');
                                        dbError = null; // Clear the error since we succeeded
                                }
                        }
                }

                // Only return error response if we still have an error
                if (dbError) {
                        console.error('Database error:', dbError);
                        
                        // Even with DB error, we can still return payment session for frontend
                        // This allows payments to work even with database issues
                        console.warn('Returning payment session despite database error');
                        
                        return NextResponse.json({
                                success: true, // Still mark as success so payment can proceed
                                orderId: orderId,
                                paymentSessionId: responseData.payment_session_id,
                                cfOrderId: responseData.cf_order_id,
                                environment: process.env.CASHFREE_ENVIRONMENT || 'production',
                                warning: 'Order created but not saved to database'
                        });
                }

                // Return payment session ID for frontend
                return NextResponse.json({
                        success: true,
                        orderId: orderId,
                        paymentSessionId: responseData.payment_session_id,
                        cfOrderId: responseData.cf_order_id,
                        environment: process.env.CASHFREE_ENVIRONMENT || 'production'
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