'use client';

import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

const OptimizationButtons = ({ onNonExhaustiveClick, onExhaustiveClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [showNonExhaustiveTooltip, setShowNonExhaustiveTooltip] = useState(false);
  const [showExhaustiveTooltip, setShowExhaustiveTooltip] = useState(false);

  const handleNonExhaustiveClick = async () => {
    await handleCoinDeduction(500, onNonExhaustiveClick);
  };

  const handleExhaustiveClick = async () => {
    await handleCoinDeduction(1000, onExhaustiveClick);
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

      // If all went well, call the callback function
      if (callback) callback();

    } catch (error) {
      console.error('Error deducting coins:', error);
      alert('Failed to deduct coins. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-between space-x-4 items-center">
      <div className="relative">
        <button
          onClick={handleNonExhaustiveClick}
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:bg-gradient-to-r hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 hover:to-[#0060df] text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
          onMouseEnter={() => setShowNonExhaustiveTooltip(true)}
          onMouseLeave={() => setShowNonExhaustiveTooltip(false)}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          Non-Exhaustive Optimization
        </button>
        {showNonExhaustiveTooltip && (
          <div className="absolute left-0 bottom-full mb-2 bg-black/80 text-white text-xs rounded p-2 w-48 backdrop-blur-sm z-50">
            <p>Will cost 500 Coins</p>
            <div className="absolute left-4 bottom-[-6px] w-3 h-3 bg-black/80 transform rotate-45"></div>
          </div>
        )}
      </div>
      
      <div className="relative">
        <button
          onClick={handleExhaustiveClick}
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:bg-gradient-to-r hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 hover:to-[#0060df] text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
          onMouseEnter={() => setShowExhaustiveTooltip(true)}
          onMouseLeave={() => setShowExhaustiveTooltip(false)}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )}
          Exhaustive Optimization
        </button>
        {showExhaustiveTooltip && (
          <div className="absolute left-0 bottom-full mb-2 bg-black/80 text-white text-xs rounded p-2 w-48 backdrop-blur-sm z-50">
            <p>Will cost 1000 Coins</p>
            <div className="absolute left-4 bottom-[-6px] w-3 h-3 bg-black/80 transform rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizationButtons; 