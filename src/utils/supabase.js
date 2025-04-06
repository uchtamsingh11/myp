import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check .env file.');
}

// Check if we're on client-side to safely use window
const isClient = typeof window !== 'undefined';

// Rate limiting and exponential backoff configuration
const rateLimitConfig = {
  maxRetries: 3,
  initialBackoffMs: 1000, // 1 second
  maxBackoffMs: 10000, // 10 seconds
  jitterFactor: 0.2 // Random jitter of up to 20%
};

// Exponential backoff function with jitter for rate limiting
export const backoffWithJitter = (retry, initialBackoff = rateLimitConfig.initialBackoffMs) => {
  const exp = Math.min(retry, 10); // Cap the exponent to avoid excessive wait times
  const baseDelay = Math.min(
    rateLimitConfig.maxBackoffMs,
    initialBackoff * Math.pow(2, exp)
  );
  const jitter = baseDelay * rateLimitConfig.jitterFactor * Math.random();
  return baseDelay + jitter;
};

// Create Supabase client with safe window references
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'supabase.auth.token',
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
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
  // Add HTTP specific options
  fetch: (url, options) => {
    // Increase timeout for auth operations
    const timeoutMs = url.includes('/auth/') ? 15000 : 10000; // 15 seconds for auth, 10 for others
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    return fetch(url, {
      ...options,
      signal: controller.signal,
    }).then(response => {
      clearTimeout(timeoutId);
      return response;
    }).catch(error => {
      clearTimeout(timeoutId);
      throw error;
    });
  }
});

// Make session state available globally in development for debugging
if (process.env.NODE_ENV === 'development' && isClient) {
  window.getSupabaseSession = async () => {
    const { data } = await supabase.auth.getSession();
    console.log('Current session:', data);
    return data;
  };
}

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
      debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
    },
  });
};

// Manually refreshes the session if needed
export const refreshSession = async () => {
  if (!isClient) return;
  
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Session refresh error:', error);
      return false;
    }
    return data.session !== null;
  } catch (err) {
    console.error('Failed to refresh session:', err);
    return false;
  }
};

// Helper function to implement retry with exponential backoff for rate limits
export const retryWithBackoff = async (fn, maxRetries = rateLimitConfig.maxRetries) => {
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      
      // If this is the last retry, throw the error
      if (retries > maxRetries) {
        throw error;
      }
      
      // Check if error is rate limit related
      const isRateLimit = 
        error.status === 429 || 
        (error.error?.status === 429) ||
        (typeof error.message === 'string' && 
          (error.message.includes('rate limit') || 
           error.message.includes('too many requests')));
      
      // Only retry on rate limit errors
      if (!isRateLimit) {
        throw error;
      }
      
      // Calculate backoff time
      const backoffTime = backoffWithJitter(retries);
      console.log(`Rate limit reached. Retrying in ${Math.round(backoffTime / 1000)}s... (attempt ${retries}/${maxRetries})`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
};
