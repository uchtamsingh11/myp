'use client';

import { useEffect } from 'react';
import { supabase, refreshSession } from '../../utils/supabase';

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

  // Listen for authentication state changes and sync with server
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      try {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Update server session when signed in or token refreshed
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, session }),
          });
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing server session');
          // Clear server session when signed out
          await fetch('/api/auth/session', {
            method: 'DELETE',
            headers: { 'Cache-Control': 'no-cache' },
          });

          // Clear any localStorage or sessionStorage items related to auth
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userProfile');
            localStorage.removeItem('isAdmin');
            // Remove app state data
            localStorage.removeItem('tradingViewSelectedBroker');
            localStorage.removeItem('scalpingToolSelectedBroker');
            localStorage.removeItem('copyTradingSelectedBrokers');
            localStorage.removeItem('copyTradingSelectedChildBrokers');
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
