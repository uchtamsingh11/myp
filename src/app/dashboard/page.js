'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isLoading } = useAuth();

  // Verify authentication on component mount
  useEffect(() => {
    document.title = 'Dashboard | AlgoZ';
    console.log('Dashboard auth check - User:', !!user, 'isLoading:', isLoading);

    // Since we're using the useAuth hook, we can simplify this
    if (!isLoading && !user) {
      console.log('No authenticated user found, redirecting to auth page');
      router.replace('/auth');

      // Add a fail-safe redirection after a delay
      // This ensures we don't get stuck if the router.replace() fails
      setTimeout(() => {
        if (!user) {
          window.location.href = '/auth';
        }
      }, 1000);
    } else if (!isLoading && user) {
      console.log('User authenticated, loading dashboard for:', user.email);
      setLoading(false);
    }
  }, [user, isLoading, router]);

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center">
        <h3 className="text-red-500 mb-4">Authentication Error</h3>
        <p className="text-zinc-400">Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard content will go here */}
    </div>
  );
}
