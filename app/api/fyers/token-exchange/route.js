import { NextResponse } from 'next/server';
import { supabase } from '../../../../src/utils/supabase';

// Explicitly mark this route as dynamic to suppress build warnings
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Parse the request body
    const { authCode, appId, apiSecret } = await request.json();
    
    console.log('Token exchange request received');
    console.log('Auth code:', authCode);
    console.log('App ID:', appId);
    
    if (!authCode || !appId || !apiSecret) {
      console.error('Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session found');
      return NextResponse.json(
        { error: 'You must be logged in to exchange a token' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log('User ID:', userId);
    
    // Exchange the auth code for an access token
    try {
      const response = await fetch('https://api.fyers.in/api/v2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: appId,
          secret_key: apiSecret,
          auth_code: authCode
        })
      });
      
      const data = await response.json();
      console.log('Token API response:', data);
      
      if (!response.ok || data.s !== 'ok') {
        throw new Error(`Failed to get access token: ${data.message || response.statusText}`);
      }
      
      const accessToken = data.access_token;
      
      // Save the access token to the database
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1);
      
      console.log('Saving access token for user:', userId);
      console.log('Token will expire at:', expiryDate.toISOString());
      
      const { error } = await supabase
        .from('fyers_credentials')
        .update({
          access_token: accessToken,
          token_expiry: expiryDate.toISOString(),
          updated_at: new Date().toISOString(),
          auth_state: null // Clear the state after successful authentication
        })
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error saving Fyers access token:', error);
        throw error;
      }
      
      console.log('Access token saved successfully');
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error in token exchange:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in token exchange endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred: ' + error.message },
      { status: 500 }
    );
  }
}
