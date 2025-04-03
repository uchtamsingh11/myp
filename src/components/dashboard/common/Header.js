'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../utils/supabase';

const DashboardHeader = ({ userEmail }) => {
  const [coinBalance, setCoinBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balanceUpdated, setBalanceUpdated] = useState(false);
  const previousBalance = useRef(0);
  const { user, profile } = useAuth();

  // Effect to fetch coin balance when user changes
  useEffect(() => {
    // Initialize coin balance from profile if available
    // Check both possible column names
    if (profile?.coins !== undefined) {
      setCoinBalance(profile.coins);
      previousBalance.current = profile.coins;
    } else if (profile?.coin_balance !== undefined) {
      setCoinBalance(profile.coin_balance);
      previousBalance.current = profile.coin_balance;
    }

    const fetchCoinBalance = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch both possible column names from the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('coins, coin_balance')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        // Use coins column if available, fall back to coin_balance, default to 0
        const balance = data?.coins !== undefined && data?.coins !== null
          ? data.coins
          : (data?.coin_balance !== undefined && data?.coin_balance !== null
            ? data.coin_balance
            : 0);

        // Check if balance changed and show animation if it increased
        if (balance > previousBalance.current) {
          setBalanceUpdated(true);
          // Reset animation state after 2 seconds
          setTimeout(() => setBalanceUpdated(false), 2000);
        }

        previousBalance.current = balance;
        setCoinBalance(balance);
      } catch (err) {
        console.error('Error fetching coin balance:', err);
        setError(err.message);
        // Don't reset the coin balance if there's an error, keep the previous value
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoinBalance();

    // Set up realtime subscription to coin balance changes
    let subscription;
    if (user) {
      subscription = supabase
        .channel('profile-changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        }, payload => {
          if (payload.new) {
            // Check both possible column names
            let newBalance = 0;
            if (payload.new.coins !== undefined) {
              newBalance = payload.new.coins;
            } else if (payload.new.coin_balance !== undefined) {
              newBalance = payload.new.coin_balance;
            }

            // Check if balance increased to show animation
            if (newBalance > previousBalance.current) {
              setBalanceUpdated(true);
              // Reset animation state after 2 seconds
              setTimeout(() => setBalanceUpdated(false), 2000);
            }

            previousBalance.current = newBalance;
            setCoinBalance(newBalance);
          }
        })
        .subscribe();
    }

    // Clean up subscription when component unmounts or user changes
    return () => {
      subscription?.unsubscribe();
    };
  }, [user, profile]);

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
          <div className={`bg-zinc-800 rounded-full px-3 py-1 flex items-center ${balanceUpdated ? 'animate-pulse ring-2 ring-yellow-400' : ''}`}>
            <svg
              className={`w-4 h-4 ${balanceUpdated ? 'text-yellow-400 animate-bounce' : 'text-yellow-500'} mr-1`}
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
            </svg>
            <span className={`text-xs font-medium ${balanceUpdated ? 'text-yellow-400' : ''}`}>
              {isLoading ? '...' : coinBalance}
            </span>
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
