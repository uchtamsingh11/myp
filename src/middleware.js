import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

/**
 * Next.js middleware for handling authentication and request processing
 */
export async function middleware(request) {
        // Skip middleware for static files and API routes
        const { pathname } = request.nextUrl;

        // Skip middleware for static assets, APIs, and non-auth-required paths
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
                '/auth/callback', // Allow OAuth callback
                '/auth/reset-password',
                '/signup',
                '/reset-password',
                '/terms',
                '/privacy'
        ];

        // Get the session from the request cookies
        let response = NextResponse.next();

        try {
                // Create Supabase client using the middleware helper
                const supabase = createMiddlewareClient({ req: request, res: response });
                const { data: { session } } = await supabase.auth.getSession();

                // Handle protected routes (dashboard)
                if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
                        if (!session) {
                                console.log(`Redirecting to /auth: No session found for ${pathname}`);

                                // Create a simple redirect URL to break any potential loops
                                const redirectUrl = new URL('/auth', request.url);

                                // Set cache control headers to prevent caching of the response
                                response = NextResponse.redirect(redirectUrl);
                                response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
                                response.headers.set('Pragma', 'no-cache');
                                response.headers.set('Expires', '0');

                                // Force-clear cookies to ensure clean state
                                response.cookies.delete('sb-access-token');
                                response.cookies.delete('sb-refresh-token');

                                return response;
                        }

                        // User is authenticated and accessing dashboard
                        console.log('User authenticated for dashboard access');
                }

                // Handle auth pages when user is already authenticated
                if (session && (pathname === '/auth' || pathname === '/signup' || pathname === '/reset-password')) {
                        // Check if there's a redirectTo parameter that should be honored
                        const redirectTo = request.nextUrl.searchParams.get('redirectTo');
                        const targetUrl = redirectTo || '/dashboard';

                        console.log(`User is authenticated, redirecting to: ${targetUrl}`);
                        response = NextResponse.redirect(new URL(targetUrl, request.url));
                        return response;
                }

                // Set security headers for all responses
                response.headers.set('X-Content-Type-Options', 'nosniff');
                response.headers.set('X-Frame-Options', 'DENY');
                response.headers.set('X-XSS-Protection', '1; mode=block');

                // Always set strong cache control for auth-related routes
                response.headers.set('Cache-Control', 'no-store, max-age=0');

                return response;
        } catch (error) {
                console.error('Middleware error:', error);

                // On error with dashboard routes, redirect to auth
                if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
                        return NextResponse.redirect(new URL('/auth', request.url));
                }

                // Return the page but prevent caching
                response.headers.set('Cache-Control', 'no-store, max-age=0');
                return response;
        }
}

// Configure the middleware to run for all routes
export const config = {
        matcher: [
                // Apply middleware to all routes except static files
                '/((?!_next/static|_next/image|favicon.ico).*)',
        ],
}; 