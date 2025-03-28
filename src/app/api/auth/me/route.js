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
                        return NextResponse.json(
                                { error: 'Not authenticated', authenticated: false },
                                { status: 401 }
                        );
                }

                // Get basic user info
                const { user } = session;

                // Check if user has additional profile data
                const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('full_name, role')
                        .eq('id', user.id)
                        .single();

                // Role from profile data or default to authenticated
                const userRole = profileData?.role || user.role || 'authenticated';

                // Return minimal user profile with authenticated flag
                return NextResponse.json({
                        authenticated: true,
                        id: user.id,
                        email: user.email,
                        created_at: user.created_at,
                        last_sign_in_at: user.last_sign_in_at,
                        role: userRole,
                        full_name: profileData?.full_name || user.user_metadata?.full_name || null,
                });
        } catch (error) {
                console.error('Error fetching user:', error);
                return NextResponse.json(
                        { error: 'Failed to get user data', authenticated: false, details: error.message },
                        { status: 500 }
                );
        }
} 