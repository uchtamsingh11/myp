'use client';

import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  const [showTooltip, setShowTooltip] = useState(false);
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
    <div className="relative inline-block">
      <button
        onClick={handleBacktestClick}
        disabled={isLoading}
        className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-400"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        )}
        Run Backtest
      </button>
      
      {showTooltip && (
        <div className="absolute left-0 bottom-full mb-2 bg-black/80 text-white text-xs rounded p-2 w-48 backdrop-blur-sm z-50">
          <p>Will cost {BACKTEST_COST} Coins</p>
          <div className="absolute left-4 bottom-[-6px] w-3 h-3 bg-black/80 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default BacktestButton; 