import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Create the broker tables if they don't exist
    const { error } = await supabase.rpc('create_broker_table');
    
    if (error) {
      console.error('Error creating tables:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Broker tables created or verified successfully' 
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error creating broker tables' 
    }, { status: 500 });
  }
}
