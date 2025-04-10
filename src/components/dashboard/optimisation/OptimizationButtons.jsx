'use client';

import { useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent 
} from '../../../components/ui/badges/hover-card';
import { Coins, Zap, ShieldCheck } from 'lucide-react';

const OptimizationButtons = ({ onNonExhaustiveClick, onExhaustiveClick, setActiveTab }) => {
  // Track loading state separately for each button
  const [quickLoading, setQuickLoading] = useState(false);
  const [exhaustiveLoading, setExhaustiveLoading] = useState(false);
  const { user } = useAuth();

  const handleNonExhaustiveClick = async () => {
    // Only proceed if not already loading
    if (quickLoading || exhaustiveLoading) return;
    
    // Immediately switch to the Results tab
    if (setActiveTab) setActiveTab('results');
    
    await handleCoinDeduction(500, onNonExhaustiveClick, setQuickLoading);
  };

  const handleExhaustiveClick = async () => {
    // Only proceed if not already loading
    if (quickLoading || exhaustiveLoading) return;
    
    // Immediately switch to the Results tab
    if (setActiveTab) setActiveTab('results');
    
    await handleCoinDeduction(1000, onExhaustiveClick, setExhaustiveLoading);
  };

  const handleCoinDeduction = async (amount, callback, setLoadingFn) => {
    if (!user) {
      alert('You must be logged in to perform this action.');
      return;
    }

    setLoadingFn(true);

    try {
      // Get current coin balance
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const currentCoins = profileData?.coins || 0;

      // Check if user has enough coins
      if (currentCoins < amount) {
        alert(`Not enough coins. You need ${amount} coins but have ${currentCoins}.`);
        setLoadingFn(false);
        return;
      }

      // Update coin balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: currentCoins - amount })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // If all went well, call the callback function
      if (callback) callback();

    } catch (error) {
      console.error('Error deducting coins:', error);
      alert('Failed to deduct coins. Please try again.');
    } finally {
      setLoadingFn(false);
    }
  };

  return (
    <div className="w-full flex justify-between space-x-4 items-center">
      <HoverCard>
        <HoverCardTrigger asChild>
          <button
            onClick={handleNonExhaustiveClick}
            disabled={quickLoading || exhaustiveLoading}
            className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:bg-gradient-to-r hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 hover:to-[#0060df] text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {quickLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Zap className="w-5 h-5 mr-2" />
            )}
            Quick Optimization
          </button>
        </HoverCardTrigger>
        <HoverCardContent 
          className="bg-zinc-800 border border-zinc-700 text-white w-64 p-3" 
          // align="center"
          // sideOffset={5}
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium flex items-center">
              <Coins className="w-4 h-4 mr-2 text-amber-400" />
              Cost: 500 Coins
            </p>
            <p className="text-xs text-zinc-400">
              Quick optimization tests a limited set of parameter combinations to save time
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
      
      <HoverCard>
        <HoverCardTrigger asChild>
          <button
            onClick={handleExhaustiveClick}
            disabled={quickLoading || exhaustiveLoading}
            className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:bg-gradient-to-r hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 hover:to-[#0060df] text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {exhaustiveLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <ShieldCheck className="w-5 h-5 mr-2" />
            )}
            Exhaustive Optimization
          </button>
        </HoverCardTrigger>
        <HoverCardContent 
          className="bg-zinc-800 border border-zinc-700 text-white w-64 p-3" 
          // align="start"
          // sideOffset={5}
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium flex items-center">
              <Coins className="w-4 h-4 mr-2 text-amber-400" />
              Cost: 1000 Coins
            </p>
            <p className="text-xs text-zinc-400">
              Exhaustive optimization tests all possible parameter combinations for maximum precision
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default OptimizationButtons; 