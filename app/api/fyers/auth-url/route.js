import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Explicitly mark this route as dynamic to suppress build warnings
export const dynamic = 'force-dynamic';

// Use the registered redirect URI from environment variable
// IMPORTANT: This must match exactly what's registered in Fyers API dashboard
const REDIRECT_URI = process.env.NEXT_PUBLIC_FYERS_REDIRECT_URI || 'https://www.algoz.tech/api/fyers/callback';

export async function POST(request) {
  try {
    const { appId } = await request.json();
    
    console.log('Received auth URL request with appId:', appId);
    console.log('Using redirect URI:', REDIRECT_URI);
    
    if (!appId) {
      return NextResponse.json({ error: 'App ID is required' }, { status: 400 });
    }
    
    // Generate a secure random state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    console.log('Generated state:', state);
    
    // Store the state and appId in cookies for validation during callback
    const cookieStore = cookies();
    
    // Set cookies with same-site and secure attributes for better security
    cookieStore.set('fyers_auth_state', state, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 15, // 15 minutes
      sameSite: 'lax'
    });
    
    cookieStore.set('fyers_app_id', appId, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 15, // 15 minutes
      sameSite: 'lax'
    });
    
    // Following Fyers API v3 documentation format:
    // 1. Encode the redirect URI
    const encodedRedirectURI = encodeURIComponent(REDIRECT_URI);
    
    // 2. Construct the authorization URL
    const authUrl = `https://api.fyers.in/api/v2/generate-authcode?client_id=${appId}&redirect_uri=${encodedRedirectURI}&response_type=code&state=${state}`;
    
    console.log('Generated Fyers auth URL:', authUrl);
    
    return NextResponse.json({
      success: true,
      authUrl: authUrl
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL: ' + error.message },
      { status: 500 }
    );
  }
}
