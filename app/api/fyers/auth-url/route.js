import { NextResponse } from 'next/server';
import { supabase } from '../../../../src/utils/supabase';
import crypto from 'crypto';

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { appId } = body;
    
    if (!appId) {
      return NextResponse.json(
        { error: 'Missing required parameter: appId' },
        { status: 400 }
      );
    }
    
    // Get the current user session to get the user ID
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'User is not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Generate a random state parameter for security
    const state = crypto.randomBytes(16).toString('hex');
    
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
    
    // Make sure redirect URI is properly defined and URL-encoded
    const redirectUri = process.env.NEXT_PUBLIC_FYERS_REDIRECT_URI || 'https://www.algoz.tech/api/fyers/callback';
    
    // Generate the authorization URL with properly encoded parameters
    const authUrl = `https://api.fyers.in/api/v2/generate-authcode?` +
      `client_id=${encodeURIComponent(appId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&state=${encodeURIComponent(state)}`;
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Invalid request format or server error' },
      { status: 500 }
    );
  }
}
