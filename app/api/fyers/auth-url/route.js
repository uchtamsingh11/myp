import { NextResponse } from 'next/server';
import { supabase } from '../../../../src/utils/supabase';
import crypto from 'crypto';

// For debugging
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
    
    // Get the current user session to get the user ID
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session found');
      return NextResponse.json(
        { error: 'User is not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log('User ID:', userId);
    
    // Generate a random state parameter for security
    const state = crypto.randomBytes(16).toString('hex');
    console.log('Generated state:', state);
    
    // Store the state in the user's fyers_credentials record for verification later
    const { error: updateError } = await supabase
      .from('fyers_credentials')
      .update({ auth_state: state })
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Error saving auth state:', updateError);
      return NextResponse.json(
        { error: 'Failed to save authentication state' },
        { status: 500 }
      );
    }
    
    // Generate the authorization URL with properly encoded parameters
    // Using a hardcoded redirect URI for now to ensure consistency
    const authUrl = `https://api.fyers.in/api/v2/generate-authcode?` +
      `client_id=${encodeURIComponent(appId)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&state=${encodeURIComponent(state)}`;
    
    console.log('Generated auth URL:', authUrl);
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Invalid request format or server error: ' + error.message },
      { status: 500 }
    );
  }
}
