'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent 
} from '../../../components/ui/badges/hover-card';
import { Coins, Zap } from 'lucide-react';

const OptimizationButtons = ({ onNonExhaustiveClick }) => {
  // Track loading and disabled states
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const { user } = useAuth();

  // Reset disabled state when component mounts or updates
  useEffect(() => {
    setIsDisabled(false);
  }, [onNonExhaustiveClick]);

  const handleOptimizeClick = async (e) => {
    // Prevent default behavior and stop propagation
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple clicks or when already loading/disabled
    if (isLoading || isDisabled) {
      return;
    }
    
    // Temporarily disable button to prevent double clicks
    setIsDisabled(true);
    setIsLoading(true);
    
    try {
      await handleCoinDeduction(749, onNonExhaustiveClick);
    } catch (error) {
      console.error("Error in optimization button click:", error);
      // If there's an error with coin deduction but we're logged in, still try to run the optimization
      if (user && onNonExhaustiveClick) {
        try {
          await onNonExhaustiveClick();
        } catch (callbackError) {
          console.error("Error executing callback after coin error:", callbackError);
        }
      }
    } finally {
      setIsLoading(false);
      // Add a slight delay before re-enabling the button
      setTimeout(() => setIsDisabled(false), 1000);
    }
  };

  const handleCoinDeduction = async (amount, callback) => {
    if (!user) {
      alert('You must be logged in to perform this action.');
      setIsLoading(false);
      setIsDisabled(false);
      return;
    }

    try {
      // Get current coin balance
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw new Error('Failed to check coin balance. Please try again.');
      }

      const currentCoins = profileData?.coins || 0;

      // Check if user has enough coins
      if (currentCoins < amount) {
        // Replace alert with redirection to pricing page
        const confirmation = window.confirm(`Not enough coins. You need ${amount} coins but have ${currentCoins}. Do you want to buy more coins?`);
        if (confirmation) {
          window.location.href = '/dashboard/pricing';
        }
        setIsLoading(false);
        return;
      }

      // Update coin balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: currentCoins - amount })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating coins:', updateError);
        throw new Error('Failed to deduct coins. Please try again.');
      }

      // Call the callback function
      if (callback) {
        await callback();
      }

    } catch (error) {
      console.error('Error deducting coins:', error);
      alert(error.message || 'Failed to deduct coins. Please try again.');
      throw error; // Re-throw to trigger the catch in handleOptimizeClick
    }
  };

  return (
    <div className="w-full flex justify-center">
      <HoverCard>
        <HoverCardTrigger asChild>
          <button
            onClick={handleOptimizeClick}
            disabled={isLoading || isDisabled}
            className={`bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white py-3 px-6 rounded-lg flex items-center justify-center transition-all ${
              isLoading || isDisabled
                ? 'opacity-75 cursor-not-allowed'
                : 'hover:bg-gradient-to-r hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 hover:to-[#0060df]'
            }`}
            type="button"
            aria-label="Optimize Strategy"
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
              Cost: 749 Coins
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