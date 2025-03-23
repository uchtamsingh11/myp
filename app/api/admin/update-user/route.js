import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Admin email for access control
const ADMIN_EMAIL = 'uchtamsingh@gmail.com';

export async function POST(request) {
  try {
    // Get the admin's email and update data from the request body
    const { adminEmail, userId, coinBalance, operation } = await request.json();
    
    // Check if the email is the admin email
    if (adminEmail !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Validate the input data
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (coinBalance === undefined || coinBalance === null) {
      return NextResponse.json(
        { error: 'Coin balance is required' },
        { status: 400 }
      );
    }

    // Create an admin Supabase client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Fetch the current user profile to get the existing coin balance
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('coin_balance')
      .eq('id', userId)
      .single();
      
    if (fetchError) {
      return NextResponse.json(
        { error: `Error fetching user: ${fetchError.message}` },
        { status: 500 }
      );
    }
    
    // Calculate the new coin balance based on the operation
    let newCoinBalance;
    const currentCoins = userData.coin_balance || 0;
    
    if (operation === 'add') {
      newCoinBalance = currentCoins + coinBalance;
    } else if (operation === 'subtract') {
      newCoinBalance = Math.max(0, currentCoins - coinBalance); // Prevent negative balance
    } else if (operation === 'set') {
      newCoinBalance = coinBalance;
    } else {
      return NextResponse.json(
        { error: 'Invalid operation. Must be "add", "subtract", or "set"' },
        { status: 400 }
      );
    }
    
    // Update the user's coin balance
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ coin_balance: newCoinBalance })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      return NextResponse.json(
        { error: `Error updating user: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Return the updated user data
    return NextResponse.json({ 
      success: true, 
      user: data,
      message: `Coins ${operation === 'add' ? 'added to' : operation === 'subtract' ? 'subtracted from' : 'set for'} user successfully`
    });
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: ' + error.message },
      { status: 500 }
    );
  }
} 