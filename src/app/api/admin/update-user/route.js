import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { setCoins, addCoins, subtractCoins } from '../../../../src/utils/coin-management';

// Admin email for access control
const ADMIN_EMAIL = 'uchtamsingh@gmail.com';

export async function PUT(request) {
  try {
    // Get the admin's email and update data from the request body
    let adminEmail, userId, coinBalance, operation;
    
    try {
      const body = await request.json();
      adminEmail = body.adminEmail;
      userId = body.userId;
      coinBalance = body.coinBalance;
      operation = body.operation;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Bad Request: Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Check if the email is the admin email or if the admin token is present in the headers
    if (adminEmail !== ADMIN_EMAIL && !request.headers.get('x-admin-token')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // Validate required fields
    if (!userId || !operation || (operation !== 'set' && !coinBalance)) {
      return NextResponse.json(
        { error: 'Bad Request: Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create admin Supabase client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Get the current user profile
    const { data: userProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching user profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile: ' + fetchError.message },
        { status: 500 }
      );
    }
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update the coin balance based on the operation
    let updatedCoinBalance;
    
    switch (operation) {
      case 'set':
        updatedCoinBalance = await setCoins(supabaseAdmin, userId, coinBalance);
        break;
      case 'add':
        updatedCoinBalance = await addCoins(supabaseAdmin, userId, coinBalance);
        break;
      case 'subtract':
        updatedCoinBalance = await subtractCoins(supabaseAdmin, userId, coinBalance);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid operation. Must be "set", "add", or "subtract"' },
          { status: 400 }
        );
    }
    
    // Return the updated user data
    return NextResponse.json({
      success: true,
      message: `Successfully ${operation}d ${coinBalance} coins for user`,
      updatedUser: {
        ...userProfile,
        coin_balance: updatedCoinBalance
      }
    });
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: ' + error.message },
      { status: 500 }
    );
  }
}