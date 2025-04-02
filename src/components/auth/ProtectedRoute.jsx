'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute - Component to wrap routes that require authentication
 * Redirects unauthenticated users to the login page
 * Shows loading state while checking authentication
 */
export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // If authentication state is loaded and user is not authenticated
    if (!isLoading && !user) {
      console.log('No authenticated user found, redirecting to login');

      // Force reload the page to auth to break any loops
      window.location.replace('/auth');
    }
  }, [user, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex justify-center items-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-zinc-800"></div>
          <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-indigo-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the children
  if (user) {
    return children;
  }

  // This is a key change - immediately redirect without showing content
  if (typeof window !== 'undefined') {
    window.location.replace('/auth');
  }

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex justify-center items-center bg-zinc-950">
      <div className="text-center">
        <div className="relative mx-auto mb-4">
          <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-zinc-800"></div>
          <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-indigo-500 border-t-transparent"></div>
        </div>
        <p className="text-zinc-400">Authentication required. Redirecting to login...</p>
      </div>
    </div>
  );
}
