import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if the request is for a protected route
  const url = req.nextUrl.clone();
  const isProtectedRoute = url.pathname.startsWith('/dashboard') || 
                          url.pathname.startsWith('/account') || 
                          url.pathname.startsWith('/settings');
  
  // If it's a protected route and there's no session, redirect to login
  if (isProtectedRoute && !session) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  // If user is already logged in and trying to access auth page, redirect to dashboard
  if (session && (url.pathname === '/login' || url.pathname === '/signup' || url.pathname === '/auth')) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};