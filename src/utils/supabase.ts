import { createClient } from '@supabase/supabase-js';

// Define hardcoded fallback values to ensure the client can be created
// These are your actual values from the .env file
const FALLBACK_SUPABASE_URL = 'https://qkqubtmuygammkrtgpvz.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcXVidG11eWdhbW1rcnRncHZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0ODUwNDYsImV4cCI6MjA1ODA2MTA0Nn0.EJZhEe-bpm1xtZhSctNF_5iWNWTGb1WGC7wTL7Mgahc';

// Try to get values from environment variables, fall back to hardcoded values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

// Log some debugging info in development
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL from env:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Using URL:', supabaseUrl);
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);