'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent 
} from '../../../components/ui/badges/hover-card';
import { Coins, PlayCircle, History } from 'lucide-react';

const BacktestButton = ({ 
  onBacktestClick,
  symbol,
  pineScript,
  timeframe,
  timeDuration,
  initialCapital,
  quantity
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const { user } = useAuth();
  const BACKTEST_COST = 25;

  // Reset disabled state if component rerenders
  useEffect(() => {
    setIsDisabled(false);
  }, [symbol, pineScript, timeframe, timeDuration, initialCapital, quantity]);

  const validateInputs = () => {
    // Validate required fields
    if (!symbol || !timeframe || !timeDuration || !pineScript) {
      alert('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleBacktestClick = async (e) => {
    // Prevent default to ensure no form submission occurs
    e.preventDefault();
    
    // Prevent multiple clicks
    if (isLoading || isDisabled) {
      return;
    }

    // Temporarily disable the button to prevent double clicks
    setIsDisabled(true);
    
    if (!user) {
      alert('You must be logged in to perform this action.');
      setTimeout(() => setIsDisabled(false), 500);
      return;
    }

    if (!validateInputs()) {
      setTimeout(() => setIsDisabled(false), 500);
      return;
    }

    setIsLoading(true);

    try {
      // Check coin balance and deduct coins
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        throw new Error('Failed to check coin balance. Please try again.');
      }

      const currentCoins = profileData?.coins || 0;

      if (currentCoins < BACKTEST_COST) {
        alert(`Not enough coins. You need ${BACKTEST_COST} coins but have ${currentCoins}.`);
        return;
      }

      // Update coin balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: currentCoins - BACKTEST_COST })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating coin balance:', updateError);
        throw new Error('Failed to deduct coins. Please try again.');
      }

      // Check if optimization was performed for this strategy
      const wasOptimized = localStorage.getItem('optimization_performed') === 'true';

      // Call the parent's onBacktestClick handler with all parameters
      if (onBacktestClick) {
        // Pass all strategy parameters and wasOptimized flag to the parent component
        await onBacktestClick({
          symbol,
          pineScript,
          timeframe,
          timeDuration,
          initialCapital,
          quantity,
          wasOptimized
        });
      }
    } catch (error) {
      console.error('Error during backtest process:', error);
      alert(error.message || 'Failed to run backtest. Please try again.');
    } finally {
      setIsLoading(false);
      // Keep button disabled for a short period to prevent accidental double-clicks
      setTimeout(() => setIsDisabled(false), 1000);
    }
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          onClick={handleBacktestClick}
          disabled={isLoading || isDisabled}
          className={`bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-all ${
            isLoading || isDisabled
              ? 'opacity-75 cursor-not-allowed'
              : 'hover:bg-gradient-to-r hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 hover:to-[#0060df]'
          }`}
          type="button" 
          aria-label="Run Backtest"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <PlayCircle className="w-5 h-5 mr-2" />
          )}
          Run Backtest
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="bg-zinc-800 border border-zinc-700 text-white w-64 p-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium flex items-center">
            <Coins className="w-4 h-4 mr-2 text-amber-400" />
            Cost: {BACKTEST_COST} Coins
          </p>
          <div className="flex items-start gap-2 mt-1">
            <History className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-zinc-400">
              Tests your strategy against historical market data to analyze performance
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default BacktestButton; 