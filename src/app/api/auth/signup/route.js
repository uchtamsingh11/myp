import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Rate limiting setup
const rateLimit = {
        ipRequestCounts: new Map(),
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 10, // 10 requests per windowMs
        clearInterval: null
};

// Clear rate limiting data periodically
if (typeof setInterval !== 'undefined') {
        rateLimit.clearInterval = setInterval(() => {
                rateLimit.ipRequestCounts.clear();
        }, rateLimit.windowMs);
}

// Helper function to create a standardized response
const createResponse = (body, status = 200) => {
        return NextResponse.json(body, { status });
};

// Handle POST requests for signup
export async function POST(request) {
        console.log('Signup request received');
        try {
                // Get the client IP address for rate limiting
                const ip = request.headers.get('x-forwarded-for') || 'unknown';
                console.log('Client IP:', ip);

                // Check rate limiting
                const currentCount = rateLimit.ipRequestCounts.get(ip) || 0;
                if (currentCount >= rateLimit.maxRequests) {
                        console.log('Rate limit exceeded');
                        return createResponse(
                                {
                                        error: 'Too many signup attempts. Please try again later.',
                                        code: 'rate_limit_exceeded',
                                },
                                429
                        );
                }

                // Increment rate limit counter
                rateLimit.ipRequestCounts.set(ip, currentCount + 1);

                // Parse request body
                const body = await request.json();
                const { email, password, name, phoneNumber } = body;
                console.log('Request body received:', { email, name, phoneNumber });

                // Validate required fields
                if (!email || !password) {
                        console.log('Missing required fields');
                        return createResponse(
                                { error: 'Email and password are required', code: 'missing_fields' },
                                400
                        );
                }

                // Create Supabase client
                console.log('Creating Supabase client');
                const supabase = createRouteHandlerClient({ cookies });

                // Handle signup with Supabase
                console.log('Attempting signup with Supabase');
                const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                                emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
                                data: {
                                        full_name: name,
                                        phone_number: phoneNumber,
                                },
                        },
                });

                if (error) {
                        console.error('Signup error:', error);
                        return createResponse(
                                { error: error.message, code: error.code || 'signup_error' },
                                400
                        );
                }

                console.log('Signup successful for:', email);

                // Create a profile record (in case the trigger doesn't work)
                if (data.user) {
                        try {
                                // Check if profile already exists
                                const { data: existingProfile } = await supabase
                                        .from('profiles')
                                        .select('id')
                                        .eq('id', data.user.id)
                                        .single();

                                // Only create profile if it doesn't exist
                                if (!existingProfile) {
                                        console.log('Creating profile for user:', data.user.id);
                                        const { error: profileError } = await supabase
                                                .from('profiles')
                                                .insert([
                                                        {
                                                                id: data.user.id,
                                                                email: email,
                                                                full_name: name,
                                                                phone_number: phoneNumber,
                                                                created_at: new Date(),
                                                        },
                                                ]);

                                        if (profileError) {
                                                console.error('Error creating profile:', profileError);
                                        } else {
                                                console.log('Profile created successfully');
                                        }
                                } else {
                                        console.log('Profile already exists for user:', data.user.id);
                                }
                        } catch (profileError) {
                                console.error('Error handling profile creation:', profileError);
                        }
                }

                // Return success with minimal user data
                return createResponse({
                        success: true,
                        user: {
                                id: data.user.id,
                                email: data.user.email,
                                email_confirmed: data.user.email_confirmed_at ? true : false,
                        },
                });
        } catch (error) {
                console.error('Server error during signup:', error);
                return createResponse(
                        { error: 'Internal server error', code: 'server_error' },
                        500
                );
        }
} 