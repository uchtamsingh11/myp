'use client';

import { useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent 
} from '../../../components/ui/badges/hover-card';
import { Coins, Zap } from 'lucide-react';

const OptimizationButtons = ({ onNonExhaustiveClick }) => {
  // Track loading state for button
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleOptimizeClick = async () => {
    // Only proceed if not already loading
    if (isLoading) return;
    await handleCoinDeduction(699, onNonExhaustiveClick);
  };

  const handleCoinDeduction = async (amount, callback) => {
    if (!user) {
      alert('You must be logged in to perform this action.');
      return;
    }

    setIsLoading(true);

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
        setIsLoading(false);
        return;
      }

      // Update coin balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: currentCoins - amount })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Call the callback function
      if (callback) callback();

    } catch (error) {
      console.error('Error deducting coins:', error);
      alert('Failed to deduct coins. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <HoverCard>
        <HoverCardTrigger asChild>
          <button
            onClick={handleOptimizeClick}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:bg-gradient-to-r hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 hover:to-[#0060df] text-white py-3 px-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Zap className="w-5 h-5 mr-2" />
            )}
            Optimize Strategy
          </button>
        </HoverCardTrigger>
        <HoverCardContent 
          className="bg-zinc-800 border border-zinc-700 text-white w-64 p-3" 
          align="center"
          sideOffset={5}
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium flex items-center">
              <Coins className="w-4 h-4 mr-2 text-amber-400" />
              Cost: 699 Coins
            </p>
            <p className="text-xs text-zinc-400">
              Optimize your strategy parameters for better trading performance
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default OptimizationButtons; 