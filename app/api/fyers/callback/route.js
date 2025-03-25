import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Explicitly mark this route as dynamic to suppress build warnings
export const dynamic = 'force-dynamic';

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
    
    // Even if cookies are missing, we'll still direct the user to choose-broker
    // This ensures we don't redirect to the auth page causing loops
    let appId = appIdCookie?.value || '';
    let stateValid = true;
    
    if (!stateCookie?.value) {
      console.warn('Warning: Missing state cookie');
      stateValid = false;
    } else if (stateFromParams !== stateCookie.value) {
      console.error('Error: State mismatch. Expected:', stateCookie.value, 'Received:', stateFromParams);
      stateValid = false;
    }
    
    // Clear the cookies as they've served their purpose
    if (stateCookie) cookieStore.delete('fyers_auth_state');
    if (appIdCookie) cookieStore.delete('fyers_app_id');
    
    // IMPORTANT: Always redirect to choose-broker with auth code
    // NEVER redirect to /auth page under any circumstance
    console.log('Redirecting to choose-broker to complete auth flow');
    
    // Build the redirect URL with appropriate parameters
    const redirectUrl = new URL('/dashboard/choose-broker', request.url);
    
    // Add auth code
    redirectUrl.searchParams.append('authCode', authCode);
    
    // Add app ID if we have it
    if (appId) {
      redirectUrl.searchParams.append('appId', appId);
    }
    
    // Add an error message if state validation failed
    if (!stateValid) {
      redirectUrl.searchParams.append('warning', 'state_validation_failed');
    }
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Unexpected error in callback handler:', error);
    // Even in case of error, redirect to choose-broker (NEVER to auth)
    return NextResponse.redirect(
      new URL(`/dashboard/choose-broker?error=${encodeURIComponent('An unexpected error occurred')}`, request.url)
    );
  }
}
