'use client';

import { useState } from 'react';
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
  quantity,
  jsonData,
  setIsBacktesting,
  setActiveTab,
  setBacktestResults,
  setShowResults,
  useCachedResults,
  setCountdownTime
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const BACKTEST_COST = 250;

  const getBacktestFromCache = (pineScript, config) => {
    try {
      const cachedData = localStorage.getItem(`backtest_${pineScript}_${JSON.stringify(config)}`);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }
    return null;
  };

  const transformOptimizationToBacktest = (optimizationResults, isOptimized = false) => {
    // Transform optimization results to backtest format
    // This is a placeholder - implement the actual transformation logic
    return {
      ...optimizationResults,
      isOptimized
    };
  };

  const handleBacktestClick = async () => {
    if (!user) {
      alert('You must be logged in to perform this action.');
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

      if (fetchError) throw fetchError;

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

      if (updateError) throw updateError;

      // Call the parent's onBacktestClick handler which includes validation
      if (onBacktestClick) {
        await onBacktestClick();
      }

      // Check for existing optimizations
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pineScript,
          symbol,
          timeframe,
          timeDuration,
          initialCapital,
          quantity,
          parameters: extractParameters(jsonData)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check for existing optimizations');
      }

      const data = await response.json();

      if (data.cached) {
        console.log('Found existing optimization, using those results');
        const optimizedBacktestResults = transformOptimizationToBacktest(data.results, true);
        setBacktestResults(optimizedBacktestResults);
        setIsBacktesting(false);
        setShowResults(true);
        return;
      }

      // If no cached results, check localStorage cache
      const config = {
        symbol,
        timeframe,
        timeDuration,
        initialCapital,
        quantity
      };

      if (useCachedResults) {
        const cachedBacktest = getBacktestFromCache(pineScript, config);
        if (cachedBacktest) {
          console.log('Using cached backtest results from localStorage');
          setBacktestResults(cachedBacktest.results);
          setIsBacktesting(false);
          setShowResults(true);
          return;
        }
      }

    } catch (error) {
      console.error('Error during backtest process:', error);
      alert('Failed to run backtest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const extractParameters = (jsonData) => {
    const parameters = {};
    if (jsonData && jsonData.inputs) {
      Object.entries(jsonData.inputs).forEach(([key, input]) => {
        if (['integer', 'float', 'simple'].includes(input.type)) {
          parameters[key] = {
            min: parseFloat(input.minval) || parseFloat(input.defaultValue) / 2,
            max: parseFloat(input.maxval) || parseFloat(input.defaultValue) * 2,
            step: input.type === 'float' ? 0.1 : 1
          };
        }
      });
    }
    return parameters;
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          onClick={handleBacktestClick}
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors hover:bg-gradient-to-r hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 hover:to-[#0060df] disabled:bg-gray-400"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <PlayCircle className="w-5 h-5 mr-2" />
          )}
          Run Backtest
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