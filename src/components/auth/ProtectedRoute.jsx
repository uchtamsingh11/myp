'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

// Component to wrap routes that require authentication
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
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
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
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-center">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-400">Redirecting to login...</p>
      </div>
    </div>
  );
}
