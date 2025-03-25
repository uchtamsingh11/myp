import { NextResponse } from 'next/server';
import { supabase } from '../../../../src/utils/supabase';

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
  console.log('======== Fyers callback received ========');
  console.log('Request URL:', request.url);
  
  try {
    // Get the authorization code and state from the URL query params
    const searchParams = new URL(request.url).searchParams;
    const authCode = searchParams.get('auth_code') || searchParams.get('code');
    const returnedState = searchParams.get('state');
    
    console.log('Auth code:', authCode);
    console.log('Returned state:', returnedState);
    
    if (!authCode) {
      console.error('No auth code in callback');
      return NextResponse.redirect(
        new URL('/dashboard/choose-broker?error=missing_auth_code', request.url)
      );
    }
    
    // Check cookies for state and appId
    const cookieState = request.cookies.get('fyers_auth_state')?.value;
    const cookieAppId = request.cookies.get('fyers_app_id')?.value;
    
    console.log('Cookie state:', cookieState);
    console.log('Cookie app ID:', cookieAppId);
    
    // First verify state parameter from cookies
    if (!cookieState || cookieState !== returnedState) {
      console.error('State parameter cookie mismatch or missing');
      return NextResponse.redirect(
        new URL('/dashboard/choose-broker?error=invalid_state', request.url)
      );
    }
    
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // User is authenticated - store token in database
      const userId = session.user.id;
      console.log('User ID:', userId);
      
      // Get the user's Fyers credentials from the database
      const { data: credentials, error: credentialsError } = await supabase
        .from('fyers_credentials')
        .select('app_id, api_secret, auth_state')
        .eq('user_id', userId)
        .single();
      
      if (credentialsError || !credentials) {
        console.error('Error fetching Fyers credentials:', credentialsError);
        
        // If we have app ID from cookie but no credentials in DB, create them
        if (cookieAppId) {
          console.log('Using app ID from cookie:', cookieAppId);
          
          // We need to prompt user for API secret since we don't have it
          const response = NextResponse.redirect(
            new URL(`/dashboard/choose-broker?appId=${cookieAppId}&needSecret=true&authCode=${authCode}`, request.url)
          );
          
          // Clear the cookies since we've processed them
          response.cookies.delete('fyers_auth_state');
          response.cookies.delete('fyers_app_id');
          
          return response;
        }
        
        return NextResponse.redirect(
          new URL('/dashboard/choose-broker?error=credentials_not_found', request.url)
        );
      }
      
      console.log('Retrieved credentials from DB:', credentials.app_id);
      
      // Double check state parameter from database too if present
      if (credentials.auth_state && credentials.auth_state !== returnedState) {
        console.error('State parameter DB mismatch');
        
        // We'll still proceed if cookie state matched, but log the inconsistency
        console.warn('Cookie state matched but DB state mismatched - proceeding anyway');
      }
      
      // Exchange the auth code for an access token
      try {
        const accessToken = await getAccessTokenDirect(
          authCode, 
          credentials.app_id, 
          credentials.api_secret
        );
        
        // Save the access token to the database
        await saveAccessTokenDirect(userId, accessToken);
        
        // Redirect to the dashboard with success message
        const response = NextResponse.redirect(
          new URL('/dashboard?fyers_connected=true', request.url)
        );
        
        // Clear the cookies since we've processed them
        response.cookies.delete('fyers_auth_state');
        response.cookies.delete('fyers_app_id');
        
        return response;
        
      } catch (tokenError) {
        console.error('Error getting or saving Fyers access token:', tokenError);
        return NextResponse.redirect(
          new URL(`/dashboard/choose-broker?error=${encodeURIComponent(tokenError.message)}`, request.url)
        );
      }
    } else {
      // No user session - direct to auth page with preserved auth code
      console.log('No session found, redirecting to authentication with preserved auth code');
      
      // We need to save the auth code and app ID for after authentication
      const response = NextResponse.redirect(
        new URL(`/auth?requiresAuth=true&source=fyers_callback&authCode=${authCode}`, request.url)
      );
      
      // Keep the cookies for later use
      return response;
    }
    
  } catch (error) {
    console.error('Error in Fyers callback:', error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent('An unexpected error occurred: ' + error.message)}`, request.url)
    );
  }
}
