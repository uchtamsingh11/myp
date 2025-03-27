'use client';

import { useEffect } from 'react';
import { supabase } from '../../utils/supabase';

// This component syncs the browser session with the server session
// It needs to be included in the layout
export default function SupabaseListener() {
  useEffect(() => {
    // Helper function to handle API calls with retry logic
    const callWithRetry = async (url, options, maxRetries = 3) => {
      let retries = 0;
      let lastError;

      while (retries < maxRetries) {
        try {
          const response = await fetch(url, options);
          
          if (response.status === 429) {
            // Rate limit hit - wait and retry
            console.log(`API rate limit hit, retrying in ${(retries + 1) * 1000}ms`);
            await new Promise(r => setTimeout(r, (retries + 1) * 1000));
            retries++;
            continue;
          }
          
          return response;
        } catch (error) {
          lastError = error;
          console.error('API call error:', error);
          
          // Only retry on network errors
          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            await new Promise(r => setTimeout(r, (retries + 1) * 1000));
            retries++;
            continue;
          }
          
          // For other errors, don't retry
          break;
        }
      }
      
      // If we get here, all retries failed
      console.error(`Failed after ${maxRetries} retries:`, lastError);
      throw lastError;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      try {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Update server session when signed in or token refreshed
          await callWithRetry('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, session }),
          });
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing server session');
          // Clear server session when signed out
          await callWithRetry('/api/auth/session', { 
            method: 'DELETE',
            headers: { 'Cache-Control': 'no-cache' }
          });
          
          console.log('Server session cleared successfully');
          // Clear any localStorage or sessionStorage items related to auth
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.removeItem('supabase.auth.token');
            
            // Clear auth-related cookies
            document.cookie.split(";").forEach((c) => {
              const cookie = c.trim();
              if (cookie.startsWith('sb-') || cookie.includes('supabase') || cookie.includes('auth')) {
                const name = cookie.split('=')[0];
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              }
            });
          }
        }
      } catch (err) {
        console.error('Error updating session:', err);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
} 