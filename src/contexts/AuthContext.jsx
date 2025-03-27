'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/navigation';

// Define AuthContext interface
export const AuthContext = createContext({
  user: null,
  profile: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithOAuth: async () => {},
  signInWithMagicLink: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
});

// Create hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to generate a unique referral code
const generateReferralCode = name => {
  const namePart = name.split(' ')[0].toLowerCase().substring(0, 4);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${namePart}-${randomPart}`;
};

// AuthProvider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch the user profile from Supabase
  const fetchProfile = async userId => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Sign in with email and password
  const signIn = async ({ email, password }) => {
    let retryCount = 0;
    const maxRetries = 2;
    const initialBackoff = 1000; // 1 second

    const attemptSignIn = async backoff => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Check specifically for rate limiting errors
          if (
            error.status === 429 ||
            error.message?.includes('too many requests') ||
            error.message?.includes('rate limit')
          ) {
            if (retryCount < maxRetries) {
              retryCount++;
              // Exponential backoff with jitter
              const jitter = Math.random() * 500;
              const nextBackoff = backoff * 2 + jitter;
              console.log(`Rate limit hit, retrying in ${nextBackoff}ms (attempt ${retryCount})`);

              // Wait for backoff period
              await new Promise(resolve => setTimeout(resolve, nextBackoff));

              // Retry the request
              return attemptSignIn(nextBackoff);
            }
          }
          throw error;
        }

        // Fetch profile after successful sign in
        if (data.user) {
          const profileData = await fetchProfile(data.user.id);
          if (profileData) {
            setProfile(profileData);
          }
        }

        return { data, error: null };
      } catch (error) {
        console.error('Sign in error:', error);
        return { data: null, error };
      }
    };

    // Start with initial backoff
    return attemptSignIn(initialBackoff);
  };

  // Sign up with email and password
  const signUp = async ({ email, password, name, phoneNumber, referral = null }) => {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: name,
            phone: phoneNumber,
            referral: referral,
          },
        },
      });

      if (error) throw error;

      // Create a profile for the new user
      if (data.user) {
        const userReferralCode = generateReferralCode(name);
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            full_name: name,
            phone_number: phoneNumber,
            referral_code: userReferralCode,
            referral_used: referral,
            created_at: new Date(),
          },
        ]);

        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign in with OAuth provider
  const signInWithOAuth = async (provider, redirectTo = null) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign in with Magic Link
  const signInWithMagicLink = async (email, redirectTo = null) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Reset password
  const resetPassword = async email => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // First clear local state
      setUser(null);
      setProfile(null);

      // Clear local storage and session storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');

        // Clear any auth cookies
        document.cookie.split(';').forEach(c => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
      }

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Force a complete page reload to clear any state in memory
      window.location.href = '/auth';
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      // Still attempt a force reload on error
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      return { error };
    }
  };

  // Update user profile
  const updateProfile = async profileData => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);

          // Fetch user profile
          const profileData = await fetchProfile(session.user.id);
          if (profileData) {
            setProfile(profileData);
          }
        }

        // Listen for authentication changes
        const {
          data: { subscription },
        } = await supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            setUser(session.user);

            // Fetch user profile when auth state changes
            const profileData = await fetchProfile(session.user.id);
            if (profileData) {
              setProfile(profileData);
            }
          } else {
            setUser(null);
            setProfile(null);
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Export context values
  const value = {
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    signInWithMagicLink,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
