import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createServerClient } from '../../../../utils/supabase';

// Create response helper
const createResponse = (data, status = 200) => {
        return new Response(JSON.stringify(data), {
                status,
                headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                }
        });
};

// Handle POST requests to update session
export async function POST(request) {
        try {
                // Get session data from request
                const { event, session } = await request.json();

                // Initialize supabase client for route handler
                const cookieStore = cookies();
                const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

                // Set cookies for auth
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        await supabase.auth.setSession(session);
                }

                return createResponse({ success: true });
        } catch (error) {
                console.error('Error updating session:', error);

                // Check for rate limit errors
                if (error.status === 429 ||
                        error.message?.includes('too many requests') ||
                        error.message?.includes('rate limit')) {
                        return createResponse({
                                error: 'Rate limit exceeded. Please try again later.',
                                code: 'rate_limit_exceeded'
                        }, 429);
                }

                return createResponse({ error: error.message }, 500);
        }
}

// Handle DELETE requests to remove session
export async function DELETE() {
        try {
                // Initialize supabase client for route handler
                const cookieStore = cookies();
                const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

                // Sign out to remove session cookies
                await supabase.auth.signOut();

                // Clear all cookies related to authentication
                const allCookies = cookies();
                for (const name of allCookies.getAll().map(cookie => cookie.name)) {
                        if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
                                cookies().delete(name);
                        }
                }

                return createResponse({ success: true });
        } catch (error) {
                console.error('Error removing session:', error);
                return createResponse({ error: error.message }, 500);
        }
} 