import { NextResponse } from 'next/server';
import { getAccessToken, saveAccessToken } from '../../../../src/utils/fyers';
import { supabase } from '../../../../src/utils/supabase';

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
    
    // Exchange the auth code for an access token using the updated method
    try {
      const accessToken = await getAccessToken(
        authCode, 
        credentials.app_id, 
        credentials.api_secret
      );
      
      // Save the access token to the database
      await saveAccessToken(userId, accessToken);
      
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
