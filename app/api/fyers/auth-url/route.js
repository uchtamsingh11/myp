import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Get from environment or config
const REDIRECT_URI = process.env.NEXT_PUBLIC_FYERS_REDIRECT_URI;

export async function POST(request) {
  try {
    const { appId } = await request.json();
    
    if (!appId) {
      return NextResponse.json({ error: 'App ID is required' }, { status: 400 });
    }
    
    // Generate a secure random state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    console.log('Generated state:', state);
    
    // Store state in cookies for verification
    const cookieStore = cookies();
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
    
    // Construct auth URL per Fyers documentation
    const authUrl = `https://api.fyers.in/api/v2/generate-authcode?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&state=${state}`;
    
    console.log('Auth URL generated:', authUrl);
    
    return NextResponse.json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
