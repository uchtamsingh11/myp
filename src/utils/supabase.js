import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables. Check .env file.');
}

// Check if we're on client-side to safely use window
const isClient = typeof window !== 'undefined';

// Create Supabase client with safe window references
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
                storageKey: 'supabase.auth.token',
                persistSession: true,
                detectSessionInUrl: true,
                autoRefreshToken: true,
                flowType: 'pkce',
                cookieOptions: {
                        name: 'sb-auth',
                        lifetime: 60 * 60 * 24 * 7, // 7 days
                        domain: isClient ? window.location.hostname : undefined,
                        sameSite: 'lax',
                        secure: isClient ? window.location.protocol === 'https:' : false,
                        path: '/',
                },
        },
        global: {
                headers: {
                        'X-Client-Info': 'supabase-js-browser/2.38.4',
                },
        },
        realtime: {
                params: {
                        eventsPerSecond: 10,
                },
        },
});

// Create a server-side Supabase client (service role, for admin operations)
export const createServerClient = () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
                console.error('Missing server-side Supabase environment variables');
                return null;
        }

        return createClient(supabaseUrl, supabaseServiceKey, {
                auth: {
                        autoRefreshToken: false,
                        persistSession: false,
                },
        });
}; 