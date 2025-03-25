import { NextResponse } from 'next/server';
import { supabase } from '../../../../src/utils/supabase';

// Helper function for getting access token directly without the Fyers package
async function getAccessTokenDirect(authCode, appId, apiSecret) {
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
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get access token: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Helper function to save access token directly to the database
async function saveAccessTokenDirect(userId, accessToken) {
  try {
    // Calculate expiry (1 day from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);
    
    // Update the user's record with the new token
    const { error } = await supabase
      .from('fyers_credentials')
      .update({
        access_token: accessToken,
        token_expiry: expiryDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error saving Fyers access token:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveAccessToken:', error);
    throw error;
  }
}

export async function GET(request) {
  try {
    // Get the authorization code from the URL query params
    const searchParams = new URL(request.url).searchParams;
    const authCode = searchParams.get('code');
    
    if (!authCode) {
      return NextResponse.json(
        { error: 'Authorization code is missing' },
        { status: 400 }
      );
    }
    
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.redirect(new URL('/login?error=not_authenticated', request.url));
    }
    
    const userId = session.user.id;
    
    // Get the user's Fyers credentials from the database
    const { data: credentials, error: credentialsError } = await supabase
      .from('fyers_credentials')
      .select('app_id, api_secret')
      .eq('user_id', userId)
      .single();
    
    if (credentialsError || !credentials) {
      console.error('Error fetching Fyers credentials:', credentialsError);
      return NextResponse.redirect(
        new URL('/dashboard/choose-broker?error=credentials_not_found', request.url)
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
