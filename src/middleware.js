import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

/**
 * Next.js middleware for handling authentication and request processing
 */
export async function middleware(request) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public') ||
    pathname.includes('.') || // Static files
    pathname === '/favicon.ico' ||
    pathname === '/site.webmanifest' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth',
    '/auth/callback',
    '/auth/reset-password',
    '/signup',
    '/reset-password',
    '/terms',
    '/privacy',
  ];

  // Create a response object that we can modify
  const response = NextResponse.next();

  try {
    // Create Supabase client using the middleware helper
    const supabase = createMiddlewareClient({ req: request, res: response });

    // Get the session from Supabase auth
    const { data: { session } } = await supabase.auth.getSession();

    // Handle protected routes (dashboard)
    if (pathname.startsWith('/dashboard')) {
      if (!session) {
        // If no session and trying to access dashboard, redirect to auth
        const redirectUrl = new URL('/auth', request.url);

        // Add the original URL as a redirect parameter
        redirectUrl.searchParams.set('redirectTo', pathname);

        // Return the redirect response with security headers
        const redirectResponse = NextResponse.redirect(redirectUrl);
        redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        return redirectResponse;
      }
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (session && (pathname === '/auth' || pathname === '/signup' || pathname === '/reset-password')) {
      // Check if there's a redirectTo parameter
      const redirectTo = request.nextUrl.searchParams.get('redirectTo');

      // Redirect to the specified URL or dashboard by default
      const targetUrl = redirectTo || '/dashboard';
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }

    // Add security headers to all responses
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
  } catch (error) {
    console.error('Middleware error:', error);

    // On error with protected routes, redirect to auth
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // For other routes, continue but prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }
}

// Configure the middleware to run for all routes except static files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)',],
};
