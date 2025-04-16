import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check .env file.');
}

// Check if we're on client-side to safely use window
const isClient = typeof window !== 'undefined';

/**
 * Create and configure the Supabase client with proper auth settings
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
    // Proper cookie options for security and cross-domain functionality
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
    // Set proper client info header
    headers: { 'X-Client-Info': 'supabase-js-browser' },
  },
  // Configure reasonable timeouts for requests
  realtime: {
    timeout: 30000, // 30 seconds
    reconnect: true,
  },
});

/**
 * Create a Supabase client for server-side operations
 */
export const createServerClient = (options = {}) => {
  // Server operations should use service role key for admin access
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
    ...options
  });
};

/**
 * Manually refresh the auth session
 * Only needed in special cases since autoRefreshToken handles this automatically
 */
export const refreshSession = async () => {
  if (!isClient) return false;

  // Use a short-lived local storage flag to prevent multiple concurrent refreshes
  const refreshInProgress = localStorage.getItem('auth_refresh_in_progress');
  const refreshStartTime = parseInt(refreshInProgress, 10);

  // If a refresh is in progress and started less than 10 seconds ago, don't attempt another one
  if (refreshInProgress && !isNaN(refreshStartTime) && Date.now() - refreshStartTime < 10000) {
    console.log('Session refresh already in progress, skipping duplicate request');
    return true; // Optimistically return true to prevent multiple refresh attempts
  }

  // Set refresh in progress flag with current timestamp
  localStorage.setItem('auth_refresh_in_progress', Date.now().toString());

  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Session refresh error:', error);
      return false;
    }

    // Clear the in-progress flag
    localStorage.removeItem('auth_refresh_in_progress');
    return data.session !== null;
  } catch (err) {
    console.error('Failed to refresh session:', err);
    // Clear the in-progress flag even on error
    localStorage.removeItem('auth_refresh_in_progress');
    return false;
  }
};

/**
 * Check if the user's session is valid
 */
export const isAuthenticated = async () => {
  // Don't check in server-side context
  if (!isClient) return false;

  // Check for a recent auth check to avoid redundant calls
  const lastAuthCheck = localStorage.getItem('last_auth_check');
  const lastCheckTime = parseInt(lastAuthCheck, 10);

  // If we checked within the last 30 seconds, use the cached result
  if (lastAuthCheck && !isNaN(lastCheckTime) && Date.now() - lastCheckTime < 30000) {
    const cachedResult = localStorage.getItem('auth_check_result') === 'true';
    return cachedResult;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const isAuth = session !== null;

    // Cache the result and timestamp
    localStorage.setItem('last_auth_check', Date.now().toString());
    localStorage.setItem('auth_check_result', isAuth.toString());

    return isAuth;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error };
  }
};

// Development-only helpers
if (process.env.NODE_ENV === 'development' && isClient) {
  window.getSupabaseSession = async () => {
    const { data } = await supabase.auth.getSession();
    console.log('Current session:', data);
    return data;
  };
}
