import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

/**
 * Create a standardized API response with proper headers
 */
const createResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
};

/**
 * Handle POST requests to update session
 * Called by the Supabase client when auth state changes
 */
export async function POST(request) {
  try {
    // Get session data from request
    const { event, session } = await request.json();

    if (!event) {
      return createResponse({ error: 'Event is required' }, 400);
    }

    // Initialize supabase client for route handler
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Set cookies for auth
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      // Use Supabase's built-in setSession
      await supabase.auth.setSession(session);
    }

    return createResponse({ success: true, event });
  } catch (error) {
    console.error('Error updating session:', error);
    return createResponse({ error: error.message }, 500);
  }
}

/**
 * Handle DELETE requests to remove session
 * Called to sign the user out
 */
export async function DELETE() {
  try {
    // Initialize supabase client for route handler
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Use Supabase's built-in signOut method
    await supabase.auth.signOut();

    return createResponse({ success: true });
  } catch (error) {
    console.error('Error removing session:', error);
    return createResponse({ error: error.message }, 500);
  }
}

/**
 * Handle GET requests to get the current session
 * This makes it easy to check auth status from client components
 */
export async function GET() {
  try {
    // Initialize supabase client for route handler
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current session
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return createResponse({
      session: data.session,
      user: data.session?.user || null
    });
  } catch (error) {
    console.error('Error getting session:', error);
    return createResponse({ error: error.message }, 500);
  }
}
