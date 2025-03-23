'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../src/utils/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to generate a unique referral code
  const generateReferralCode = (name) => {
    const namePart = name ? name.split(' ')[0].toLowerCase().substring(0, 4) : 'user';
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${namePart}-${randomPart}`;
  };

  // Function to create a profile for a user
  const createUserProfile = async (user) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        return existingProfile;
      }

      // Get user metadata
      const { data: userData } = await supabase.auth.getUser();
      const userMetadata = userData?.user?.user_metadata || {};
      
      // Create a new profile
      const fullName = userMetadata.full_name || userMetadata.name || '';
      const referralCode = generateReferralCode(fullName);
      
      // Build the profile data
      const profileData = {
        id: user.id,
        full_name: fullName,
        phone_number: userMetadata.phone || null,
        referral_code: referralCode,
        created_at: new Date(),
      };
      
      // Add referral_used if provided in metadata and column exists
      if (userMetadata.referral) {
        try {
          profileData.referral_used = userMetadata.referral;
        } catch (err) {
          console.log('referral_used column might not exist yet:', err);
          // Continue without the referral_used field
        }
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          throw new Error('No session found');
        }

        // Create or get user profile
        const profile = await createUserProfile(session.user);
        
        if (profile) {
          // Store profile data in localStorage
          localStorage.setItem('userProfile', JSON.stringify(profile));
        }

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error in auth callback:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl p-8 max-w-md w-full text-center">
        {loading ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Completing Authentication...</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          </div>
        ) : error ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/auth')}
              className="btn-primary"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">Authentication Successful</h2>
            <p className="text-zinc-400 mb-6">Redirecting you to the dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}