import { NextResponse } from 'next/server';
import { supabase } from '../../../../src/utils/supabase';

// Helper function for getting access token directly without the Fyers package
async function getAccessTokenDirect(authCode, appId, apiSecret) {
  console.log('Getting access token for auth code:', authCode);
  try {
    const response = await fetch('https://api.fyers.in/api/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: appId,
        secret_key: apiSecret,
        auth_code: authCode,
        grant_type: 'authorization_code'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Token API error response:', data);
      throw new Error(`Failed to get access token: ${response.statusText} - ${JSON.stringify(data)}`);
    }
    
    console.log('Token response received:', data);
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Helper function to save access token directly to the database
async function saveAccessTokenDirect(userId, accessToken) {
  console.log('Saving access token for user:', userId);
  try {
    // Calculate expiry (1 day from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);
    
    console.log('Token will expire at:', expiryDate.toISOString());
    
    // Update the user's record with the new token
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
    return true;
  } catch (error) {
    console.error('Error in saveAccessToken:', error);
    throw error;
  }
}

export async function GET(request) {
  console.log('======== Fyers callback received ========');
  console.log('Request URL:', request.url);
  
  try {
    // Get the authorization code and state from the URL query params
    const searchParams = new URL(request.url).searchParams;
    const authCode = searchParams.get('code');
    const returnedState = searchParams.get('state');
    
    console.log('Auth code:', authCode);
    console.log('Returned state:', returnedState);
    
    if (!authCode) {
      console.error('No auth code in callback');
      return NextResponse.redirect(
        new URL('/dashboard/choose-broker?error=missing_auth_code', request.url)
      );
    }
    
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session found');
      return NextResponse.redirect(new URL('/login?error=not_authenticated', request.url));
    }
    
    const userId = session.user.id;
    console.log('User ID:', userId);
    
    // Get the user's Fyers credentials including the stored state from the database
    const { data: credentials, error: credentialsError } = await supabase
      .from('fyers_credentials')
      .select('app_id, api_secret, auth_state')
      .eq('user_id', userId)
      .single();
    
    if (credentialsError || !credentials) {
      console.error('Error fetching Fyers credentials:', credentialsError);
      return NextResponse.redirect(
        new URL('/dashboard/choose-broker?error=credentials_not_found', request.url)
      );
    }
    
    console.log('Retrieved credentials with auth state:', credentials.auth_state);
    
    // Verify that the returned state matches the stored state
    if (returnedState !== credentials.auth_state || !credentials.auth_state) {
      console.error('State parameter mismatch or missing');
      console.error('Returned state:', returnedState);
      console.error('Stored state:', credentials.auth_state);
      return NextResponse.redirect(
        new URL('/dashboard/choose-broker?error=invalid_state_parameter', request.url)
      );
    }
    
    // Exchange the auth code for an access token using direct API call
    try {
      const accessToken = await getAccessTokenDirect(
        authCode, 
        credentials.app_id, 
        credentials.api_secret
      );
      
      // Save the access token to the database
      await saveAccessTokenDirect(userId, accessToken);
      
      console.log('Authentication completed successfully');
      
      // Redirect to the dashboard with success message
      return NextResponse.redirect(
        new URL('/dashboard?fyers_connected=true', request.url)
      );
      
    } catch (tokenError) {
      console.error('Error getting Fyers access token:', tokenError);
      return NextResponse.redirect(
        new URL(`/dashboard/choose-broker?error=${encodeURIComponent('Failed to authenticate with Fyers: ' + tokenError.message)}`, request.url)
      );
    }
    
  } catch (error) {
    console.error('Error in Fyers callback:', error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent('An unexpected error occurred: ' + error.message)}`, request.url)
    );
  }
}
