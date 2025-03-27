'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { motion } from 'framer-motion';

// Client component that uses useSearchParams
const AuthCallbackContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get redirectTo from query params if exists
  const redirectTo = searchParams.get('redirectTo');

  useEffect(() => {
    // Set a timeout to handle cases where auth state is not updated
    const timeoutId = setTimeout(() => {
      if (!user) {
        setError('Authentication failed. Please try again.');
        setLoading(false);
      }
    }, 5000);

    if (user) {
      clearTimeout(timeoutId);

      // Check if we need to continue the Fyers flow
      const requiresAuth = searchParams.get('requiresAuth');
      const source = searchParams.get('source');
      const authCode = searchParams.get('authCode');

      if (requiresAuth === 'true' && source === 'fyers_callback' && authCode) {
        window.location.replace(`/dashboard/choose-broker?authCode=${authCode}&needSecret=true`);
        return;
      }

      // Use setTimeout to ensure smooth transition
      setTimeout(() => {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push('/dashboard');
        }
        setLoading(false);
      }, 500);
    }

    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, [user, redirectTo, router, searchParams]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl p-8 max-w-md w-full text-center">
        {loading ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Completing Authentication...</h2>
            <div className="flex justify-center">
              <motion.div
                className="rounded-full h-12 w-12 border-t-2 border-b-2 border-white"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </div>
          </div>
        ) : error ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/auth')}
              className="bg-gradient-to-r from-zinc-800 to-black hover:from-zinc-700 hover:to-zinc-900 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
};

// Main component with Suspense boundary
export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
