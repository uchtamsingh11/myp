import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const redirectTo = requestUrl.searchParams.get('redirectTo');

    if (!code) {
      console.error('No authorization code found in request');
      return NextResponse.redirect(new URL('/auth?error=no_code', request.url));
    }

    // Create a Supabase client for exchanging the code
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange the auth code for a session (this sets cookies automatically)
    await supabase.auth.exchangeCodeForSession(code);

    // Determine the redirect URL
    let targetUrl;
    if (redirectTo) {
      console.log(`Redirecting to original destination: ${redirectTo}`);
      // Make sure redirectTo is properly formed
      if (redirectTo.startsWith('/')) {
        targetUrl = new URL(redirectTo, request.url);
      } else {
        // Handle case where redirectTo might be URL encoded
        try {
          const decodedRedirect = decodeURIComponent(redirectTo);
          targetUrl = new URL(decodedRedirect.startsWith('/') ? decodedRedirect : `/${decodedRedirect}`, request.url);
        } catch (e) {
          console.error('Error decoding redirectTo:', e);
          targetUrl = new URL('/dashboard', request.url);
        }
      }
    } else {
      console.log('Redirecting to dashboard');
      targetUrl = new URL('/dashboard', request.url);
    }

    // Set cache control headers and redirect
    const response = NextResponse.redirect(targetUrl);
    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;
  } catch (error) {
    console.error('Error in auth callback route:', error);
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error.message || 'Unknown error')}`, request.url)
    );
  }
} 