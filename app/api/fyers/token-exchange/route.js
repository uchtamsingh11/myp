import { NextResponse } from 'next/server';
import { supabase } from '../../../../src/utils/supabase';

// Explicitly mark this route as dynamic to suppress build warnings
export const dynamic = 'force-dynamic';

// Direct API functions to replace fyers-api-v3 package
async function generateAccessToken(appId, secretKey, authCode) {
  console.log('Making direct API call to Fyers for token exchange');
  
  const response = await fetch('https://api.fyers.in/api/v2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: appId,
      secret_key: secretKey,
      auth_code: authCode
    })
  });
  
  const data = await response.json();
  
  if (!response.ok || data.s !== 'ok') {
    throw new Error(data.message || 'Failed to generate access token');
  }
  
  return data.access_token;
}

// Direct API function to validate token by fetching profile
async function validateToken(appId, accessToken) {
  try {
    console.log('Validating token by fetching profile');
    
    const response = await fetch('https://api.fyers.in/api/v2/profile', {
      method: 'GET',
      headers: {
        'Authorization': `${appId}:${accessToken}`
      }
    });
    
    const data = await response.json();
    
    return {
      valid: data.s === 'ok',
      profileData: data
    };
  } catch (error) {
    console.warn('Error validating token:', error);
    return { valid: false, error: error.message };
  }
}

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
      // Generate access token using direct API call
      const accessToken = await generateAccessToken(appId, apiSecret, authCode);
      console.log('Access token obtained successfully');
      
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
      
      // Try to validate the token
      const validationResult = await validateToken(appId, accessToken);
      
      if (!validationResult.valid) {
        console.warn('Token appears to be valid but profile fetch failed:', validationResult);
        // Continue anyway as the token was generated successfully
      } else {
        console.log('Successfully validated token with profile check');
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
