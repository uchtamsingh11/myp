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

    // Since we're using the useAuth hook, we can simplify this
    if (!isLoading && !user) {
      router.replace('/auth');
    } else if (!isLoading && user) {
      setLoading(false);
    }
  }, [user, isLoading, router]);

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] bg-zinc-950 rounded-xl">
        <div className="relative">
          <div className="w-14 h-14 rounded-full absolute border-4 border-solid border-zinc-800"></div>
          <div className="w-14 h-14 rounded-full animate-spin absolute border-4 border-solid border-indigo-500 border-t-transparent shadow-lg"></div>
        </div>
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
      <h2 className="text-lg text-zinc-400 mb-4">
        Choose from the menu on the left to get started.
      </h2>

      {/* Featured Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div
          className="bg-zinc-800/50 border border-zinc-700/30 rounded-xl p-6 hover:bg-zinc-800/80 transition-all cursor-pointer"
          onClick={() => router.push('/dashboard/broker-auth')}
        >
          <div className="mb-4 p-3 rounded-full bg-indigo-500/20 w-fit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Connect Broker</h3>
          <p className="text-zinc-400 text-sm">
            Link your trading account to start using our services.
          </p>
          <button
            onClick={e => {
              e.stopPropagation();
              router.push('/dashboard/broker-auth');
            }}
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
          >
            Configure Now →
          </button>
        </div>

        <div
          className="bg-zinc-800/50 border border-zinc-700/30 rounded-xl p-6 hover:bg-zinc-800/80 transition-all cursor-pointer"
          onClick={() => router.push('/dashboard/trading-view')}
        >
          <div className="mb-4 p-3 rounded-full bg-purple-500/20 w-fit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Trading View Setup</h3>
          <p className="text-zinc-400 text-sm">Integrate with TradingView for automated signals.</p>
          <button
            onClick={e => {
              e.stopPropagation();
              router.push('/dashboard/trading-view');
            }}
            className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium"
          >
            Setup Now →
          </button>
        </div>

        <div
          className="bg-zinc-800/50 border border-zinc-700/30 rounded-xl p-6 hover:bg-zinc-800/80 transition-all cursor-pointer"
          onClick={() => router.push('/dashboard/pricing')}
        >
          <div className="mb-4 p-3 rounded-full bg-blue-500/20 w-fit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Manage Subscription</h3>
          <p className="text-zinc-400 text-sm">View and upgrade your subscription plan.</p>
          <button
            onClick={e => {
              e.stopPropagation();
              router.push('/dashboard/pricing');
            }}
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View Plans →
          </button>
        </div>
      </div>
    </div>
  );
}
