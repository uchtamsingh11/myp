import { NextResponse } from 'next/server';
import { supabase } from '../../../../src/utils/supabase';
import crypto from 'crypto';

// Explicitly mark this route as dynamic to suppress build warnings
export const dynamic = 'force-dynamic';

// For consistency, ensure this exactly matches what's registered in Fyers API dashboard
const REDIRECT_URI = 'https://www.algoz.tech/api/fyers/callback';

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { appId } = body;
    
    console.log('Received auth URL request with appId:', appId);
    
    if (!appId) {
      console.error('Missing appId in request');
      return NextResponse.json(
        { error: 'Missing required parameter: appId' },
        { status: 400 }
      );
    }
    
    // Generate a random state parameter for security
    const state = crypto.randomBytes(16).toString('hex');
    console.log('Generated state:', state);
    
    // We'll store this state in a cookie for verification later
    // This allows the flow to work even if the user isn't authenticated
    const response = NextResponse.json({ 
      authUrl: `https://api.fyers.in/api/v2/generate-authcode?` +
        `client_id=${encodeURIComponent(appId)}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=code` +
        `&state=${encodeURIComponent(state)}`
    });
    
    // Set a cookie with the state and appId for the callback to use
    response.cookies.set('fyers_auth_state', state, { 
      httpOnly: true,
      maxAge: 60 * 15, // 15 minutes
      path: '/'
    });
    
    response.cookies.set('fyers_app_id', appId, {
      httpOnly: true,
      maxAge: 60 * 15, // 15 minutes
      path: '/'
    });
    
    console.log('Auth URL generated and state stored in cookie');
    
    // Try to also store in DB if a session exists
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const userId = session.user.id;
      console.log('User ID:', userId);
      
      // Store the state in the user's fyers_credentials record for verification later
      const { error: updateError } = await supabase
        .from('fyers_credentials')
        .update({ auth_state: state })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('Error saving auth state to DB:', updateError);
        // Continue anyway as we're using cookies now
      }
    } else {
      console.log('No session found, using cookie-based state only');
    }
    
    return response;
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL: ' + error.message },
      { status: 500 }
    );
  }
}
