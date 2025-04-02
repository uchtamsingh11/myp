'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

const DashboardHeader = ({ userEmail }) => {
  const [coinBalance, setCoinBalance] = useState(0);
  const { user } = useAuth();

  // Effect to fetch coin balance when user changes
  useEffect(() => {
    const fetchCoinBalance = async () => {
      if (!user) return;

      try {
        // This would be where you'd fetch balance from your database
        // For now, let's just set a default value as placeholder
        setCoinBalance(100);
      } catch (error) {
        console.error('Error fetching coin balance:', error);
        setCoinBalance(0);
      }
    };

    fetchCoinBalance(); 
  }, [user]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-zinc-950 border-b border-zinc-800 py-4 px-6 flex items-center justify-between h-[64px] z-20 shadow-md">
      <div className="flex items-center">
        <Link href="/dashboard" className="text-xl font-bold text-white flex items-center">
          <img
            src="/images/logo.png"
            alt="AlgoZ Logo"
            className="w-10 h-10 mr-2"
          />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-zinc-800 rounded-full px-3 py-1 flex items-center">
            <svg
              className="w-4 h-4 text-yellow-500 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 13.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v3zm3 0a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-6a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v6zm3 0a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v9z"></path>
            </svg>
            <span className="text-xs font-medium">{coinBalance}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-zinc-400">Online</span>
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 transition-colors w-8 h-8 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>

          <div className="hidden sm:block">
            <p className="text-xs text-zinc-300">{userEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
