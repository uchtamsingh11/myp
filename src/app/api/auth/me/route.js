import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
        try {
                const supabase = createRouteHandlerClient({ cookies });
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                        console.error('Auth session error:', error);
                        return NextResponse.json({
                                error: error.message,
                                authenticated: false,
                                details: error
                        }, { status: 500 });
                }

                if (!session) {
                        // Return a 200 status but with authenticated: false
                        // This is better than a 401 which might trigger unwanted redirects
                        return NextResponse.json(
                                { error: 'Not authenticated', authenticated: false },
                                { status: 200 }
                        );
                }

                // Get basic user info
                const { user } = session;

                // Check if user has additional profile data
                const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('full_name, email')
                        .eq('id', user.id)
                        .single();

                if (profileError && profileError.code !== 'PGRST116') {
                        console.warn('Profile fetch warning:', profileError);
                }

                // Return minimal user profile with authenticated flag
                return NextResponse.json({
                        authenticated: true,
                        id: user.id,
                        email: profileData?.email || user.email,
                        created_at: user.created_at,
                        last_sign_in_at: user.last_sign_in_at,
                        full_name: profileData?.full_name || user.user_metadata?.full_name || null
                });
        } catch (error) {
                console.error('Error fetching user:', error);
                // Return 200 with authenticated:false instead of an error status
                // to prevent triggering unwanted error handling
                return NextResponse.json(
                        { error: 'Failed to get user data', authenticated: false, details: error.message },
                        { status: 200 }
                );
        }
} 