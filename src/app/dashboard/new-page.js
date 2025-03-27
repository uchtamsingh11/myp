'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';

export default function Dashboard() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [coinBalance, setCoinBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard | AlgoZ';

    const fetchCoinBalance = async () => {
      if (!user || !user.id) return;

      try {
        // Get coin balance from Supabase or API
        const { data, error } = await supabase
          .from('user_coins')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        setCoinBalance(data?.balance || 0);
      } catch (error) {
        console.error('Error fetching coin balance:', error);
        setCoinBalance(0);
      }
    };

    fetchCoinBalance();
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Account Overview</h2>
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <p className="text-lg font-medium">{profile?.full_name || 'User'}</p>
              <p className="text-zinc-400 text-sm">{user?.email || ''}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-zinc-400">Balance</p>
            <p className="text-2xl font-bold">{coinBalance} Coins</p>
          </div>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/dashboard/trading-view')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
            >
              Configure TradingView
            </button>
            <button
              onClick={() => router.push('/dashboard/trading-view/webhook-url')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
            >
              Webhook URL Setup
            </button>
          </div>
        </div>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>
          <div className="space-y-3">
            <p className="text-zinc-400 text-sm">No recent activity to display.</p>
          </div>
        </div>
      </div>

      {/* Featured Tools */}
      <h2 className="text-xl font-bold mb-4">Featured Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <h3 className="text-lg font-medium mb-2">Broker Authentication</h3>
          <p className="text-zinc-400 text-sm">Connect your trading accounts securely.</p>
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
          onClick={() => router.push('/dashboard/trading-view/webhook-url')}
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
              router.push('/dashboard/trading-view/webhook-url');
            }}
            className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium"
          >
            Setup Now →
          </button>
        </div>

        <div
          className="bg-zinc-800/50 border border-zinc-700/30 rounded-xl p-6 hover:bg-zinc-800/80 transition-all cursor-pointer"
          onClick={() => router.push('/dashboard/trading-view/json-generator')}
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
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">JSON Generator</h3>
          <p className="text-zinc-400 text-sm">Generate JSON for TradingView signals.</p>
          <button
            onClick={e => {
              e.stopPropagation();
              router.push('/dashboard/trading-view/json-generator');
            }}
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            Open Generator →
          </button>
        </div>
      </div>
    </div>
  );
}
