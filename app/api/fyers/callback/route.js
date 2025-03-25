import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '../../../../src/utils/supabase';

// Explicitly mark this route as dynamic to suppress build warnings
export const dynamic = 'force-dynamic';

// Helper function for getting access token directly without the Fyers package
async function getAccessTokenDirect(authCode, appId, apiSecret) {
  console.log('Getting access token for auth code:', authCode);
  
  try {
    // The API expects client_id, not appId, and secret_key, not apiSecret
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
  try {
    console.log('======== Fyers callback received ========');
    const { searchParams } = new URL(request.url);
    
    // Get the auth code from the URL parameters
    const authCode = searchParams.get('auth_code');
    // Get the state from URL parameters
    const stateFromParams = searchParams.get('state');
    
    console.log('Auth code from Fyers:', authCode);
    console.log('State from params:', stateFromParams);
    
    if (!authCode) {
      console.error('Error: No auth code received from Fyers');
      return NextResponse.redirect(new URL('/dashboard/choose-broker?error=no_auth_code', request.url));
    }
    
    // Get cookies to check state
    const cookieStore = cookies();
    const stateCookie = cookieStore.get('fyers_auth_state');
    const appIdCookie = cookieStore.get('fyers_app_id');
    
    console.log('State from cookie:', stateCookie?.value);
    console.log('App ID from cookie:', appIdCookie?.value);
    
    if (!stateCookie?.value || !appIdCookie?.value) {
      console.error('Error: Missing required cookies');
      return NextResponse.redirect(new URL('/dashboard/choose-broker?error=missing_cookies', request.url));
    }
    
    if (stateFromParams !== stateCookie.value) {
      console.error('Error: State mismatch. Expected:', stateCookie.value, 'Received:', stateFromParams);
      return NextResponse.redirect(new URL('/dashboard/choose-broker?error=state_mismatch', request.url));
    }
    
    const appId = appIdCookie.value;
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('User not authenticated, redirecting to auth page with parameters');
      
      // Redirect to auth page with parameters to continue flow after login
      // We encode the auth code in the redirect URL so we can recover it after login
      return NextResponse.redirect(
        new URL(`/auth?requiresAuth=true&source=fyers_callback&authCode=${authCode}&appId=${appId}`, request.url)
      );
    }
    
    const userId = session.user.id;
    console.log('User authenticated:', userId);
    
    // Get the user's credentials from the database
    const { data: credentials, error: credentialsError } = await supabase
      .from('fyers_credentials')
      .select('api_secret')
      .eq('user_id', userId)
      .single();
    
    if (credentialsError || !credentials?.api_secret) {
      console.error('Error retrieving API secret:', credentialsError || 'API secret not found');
      
      // Redirect to choose-broker page with the auth code and a flag indicating we need the API secret
      return NextResponse.redirect(
        new URL(`/dashboard/choose-broker?authCode=${authCode}&needSecret=true&appId=${appId}`, request.url)
      );
    }
    
    const apiSecret = credentials.api_secret;
    
    // Exchange the authorization code for an access token
    try {
      const tokenResponse = await fetch('https://api.fyers.in/api/v2/token', {
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
      
      const data = await tokenResponse.json();
      console.log('Token API response:', data);
      
      if (!tokenResponse.ok || data.s !== 'ok') {
        throw new Error(`Failed to get access token: ${data.message || tokenResponse.statusText}`);
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
      
      // Clear state and app ID cookies
      const cookieStore = cookies();
      cookieStore.delete('fyers_auth_state');
      cookieStore.delete('fyers_app_id');
      
      // Redirect to dashboard with success message
      return NextResponse.redirect(new URL('/dashboard?fyers_connected=true', request.url));
    } catch (error) {
      console.error('Error in token exchange:', error);
      return NextResponse.redirect(
        new URL(`/dashboard/choose-broker?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
  } catch (error) {
    console.error('Unexpected error in callback handler:', error);
    return NextResponse.redirect(
      new URL(`/dashboard/choose-broker?error=${encodeURIComponent('An unexpected error occurred')}`, request.url)
    );
  }
}
