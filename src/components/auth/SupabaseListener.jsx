'use client';

import { useEffect } from 'react';
import { supabase, refreshSession, retryWithBackoff, backoffWithJitter } from '../../utils/supabase';

/**
 * SupabaseListener - Syncs browser auth session with server session
 * This component should be included in the root layout to ensure 
 * authentication state is properly maintained across the application.
 */
export default function SupabaseListener() {
  // First, try to refresh the session on component mount
  useEffect(() => {
    const attemptRefresh = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // If there's no session or it's close to expiry, try to refresh it
        if (!session || isSessionExpiringSoon(session)) {
          console.log('Session not found or expiring soon, attempting refresh');
          await refreshSession();
        }
      } catch (error) {
        console.error('Error during initial session refresh:', error);
      }
    };
    
    attemptRefresh();
  }, []);

  // Helper to check if a session is expiring soon (within 5 minutes)
  const isSessionExpiringSoon = (session) => {
    if (!session || !session.expires_at) return true;
    
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    return expiresAt.getTime() - now.getTime() < fiveMinutes;
  };

  useEffect(() => {
    // Use localStorage to track rate limit cooldown
    const rateLimitKey = 'auth_rate_limit_until';
    
    // Helper function to handle API calls with retry logic and rate limit awareness
    const callApiWithRateLimitAwareness = async (url, options) => {
      // Check if we're in a rate limit cooldown period
      const rateLimitUntil = localStorage.getItem(rateLimitKey);
      if (rateLimitUntil) {
        const cooldownUntil = parseInt(rateLimitUntil, 10);
        const now = Date.now();
        
        if (now < cooldownUntil) {
          const waitTime = Math.ceil((cooldownUntil - now) / 1000);
          console.log(`In rate limit cooldown. Please wait ${waitTime} seconds before trying again.`);
          throw new Error(`Rate limit cooldown. Wait ${waitTime}s before retry.`);
        } else {
          // Cooldown expired, clear it
          localStorage.removeItem(rateLimitKey);
        }
      }
      
      try {
        // Use the retryWithBackoff utility for all API calls
        return await retryWithBackoff(async () => {
          const response = await fetch(url, options);
          
          // Handle rate limit responses
          if (response.status === 429) {
            // Set a cooldown period - 30 seconds
            const cooldownMs = 30 * 1000;
            localStorage.setItem(rateLimitKey, (Date.now() + cooldownMs).toString());
            
            console.warn(`Rate limit hit. Setting cooldown for ${cooldownMs/1000}s`);
            throw new Error('Rate limit exceeded');
          }
          
          return response;
        });
      } catch (error) {
        console.error('API call failed after retries:', error);
        throw error;
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      try {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Update server session when signed in or token refreshed
          await callApiWithRateLimitAwareness('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, session }),
          });
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing server session');
          // Clear server session when signed out
          await callApiWithRateLimitAwareness('/api/auth/session', {
            method: 'DELETE',
            headers: { 'Cache-Control': 'no-cache' },
          });

          console.log('Server session cleared successfully');
          // Clear any localStorage or sessionStorage items related to auth
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.removeItem('supabase.auth.token');
            // But keep the rate limit key!

            // Clear auth-related cookies
            document.cookie.split(';').forEach(c => {
              const cookie = c.trim();
              if (
                cookie.startsWith('sb-') ||
                cookie.includes('supabase') ||
                cookie.includes('auth')
              ) {
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
