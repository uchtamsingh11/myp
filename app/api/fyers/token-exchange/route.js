import { NextResponse } from 'next/server';
import { supabase } from '../../../../src/utils/supabase';
const { fyersModel } = require('fyers-api-v3');

// Explicitly mark this route as dynamic to suppress build warnings
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Parse the request body
    const { authCode, appId, apiSecret, userId } = await request.json();

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

    // Get the user's session if userId is not provided
    let userIdToUse = userId;

    if (!userIdToUse) {
      const { data: { session } } = await supabase.auth.getSession();
      userIdToUse = session?.user?.id;

      if (!userIdToUse) {
        console.error('No user ID provided and no active session found');
        return NextResponse.json(
          { error: 'User identification required' },
          { status: 401 }
        );
      }
    }

    console.log('Using user ID:', userIdToUse);

    try {
      // Create a new instance of the Fyers API model
      // Note: We don't need to set a logging path in production
      const fyers = new fyersModel({
        enableLogging: false
      });

      // Set the app ID
      fyers.setAppId(appId);

      // Generate the access token using the auth code
      console.log('Generating access token with Fyers API');
      const tokenResponse = await fyers.generate_access_token({
        client_id: appId,
        secret_key: apiSecret,
        auth_code: authCode
      });

      console.log('Token response:', JSON.stringify(tokenResponse));

      if (tokenResponse.s !== 'ok' || !tokenResponse.access_token) {
        throw new Error(tokenResponse.message || 'Failed to generate access token');
      }

      const accessToken = tokenResponse.access_token;

      // Calculate expiry (1 day from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1);

      // Update the user's record with the new token
      const { error: updateError } = await supabase
        .from('fyers_credentials')
        .upsert({
          user_id: userIdToUse,
          app_id: appId,
          api_secret: apiSecret,
          access_token: accessToken,
          token_expiry: expiryDate.toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (updateError) {
        console.error('Error saving token to database:', updateError);
        return NextResponse.json(
          { error: 'Failed to save access token to database' },
          { status: 500 }
        );
      }

      // Set the access token in the Fyers model to verify it works
      fyers.setAccessToken(accessToken);

      // Try to fetch the user profile to verify the token works
      try {
        const profileResponse = await fyers.get_profile();
        console.log('Profile response:', JSON.stringify(profileResponse));

        if (profileResponse.s !== 'ok') {
          console.warn('Token appears to be valid but profile fetch failed:', profileResponse);
          // Continue anyway as the token was generated successfully
        } else {
          console.log('Successfully validated token with profile check');
        }
      } catch (profileError) {
        console.warn('Error validating token with profile check:', profileError);
        // Continue anyway as the token was generated successfully
      }

      return NextResponse.json({
        success: true,
        message: 'Access token generated and saved successfully'
      });

    } catch (error) {
      console.error('Error in Fyers API operations:', error);
      return NextResponse.json(
        { error: `Fyers API error: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in token exchange:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
}
