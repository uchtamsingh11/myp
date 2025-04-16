'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Coins, AlertCircle } from 'lucide-react';
import { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent 
} from '../../../components/ui/badges/hover-card';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../utils/supabase';
import { toast } from '../../../hooks/use-toast';

const OPTIMIZATION_COST = 749;

const OptimizationButtons = ({ onNonExhaustiveClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile: userProfile, refreshProfile } = useAuth();
  const optimizationAttempts = useRef(0);
  const isMounted = useRef(true);

  // Reset state and track component lifecycle
  useEffect(() => {
    // Reset on mount
    setIsLoading(false);
    optimizationAttempts.current = 0;
    isMounted.current = true;
    
    // Clean up on unmount
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Wrap the callback to ensure it's safe to call
  const safeOptimize = useCallback(async () => {
    if (!onNonExhaustiveClick || typeof onNonExhaustiveClick !== 'function') {
      console.error("Optimization callback is not available or not a function");
      return Promise.reject(new Error("Optimization function is not available"));
    }
    
    // Set a timeout to prevent hanging indefinitely
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Optimization timed out after 65 seconds"));
      }, 65000); // Slightly longer than the UI shows (60 seconds)
    });
    
    try {
      // Race between the optimization call and the timeout
      return await Promise.race([
        onNonExhaustiveClick(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error("Error in optimization callback:", error);
      throw error;
    }
  }, [onNonExhaustiveClick]);

  const deductCoins = async () => {
    if (!user) return { success: false, error: 'User not logged in' };
    
    try {
      // First fetch current coin balance to have the most up-to-date value
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        return { success: false, error: fetchError.message };
      }

      const currentCoins = profileData?.coins || 0;
      
      // Check if user has enough coins
      if (currentCoins < OPTIMIZATION_COST) {
        return { 
          success: false, 
          error: `Insufficient coins. You have ${currentCoins} coins, but optimization costs ${OPTIMIZATION_COST} coins.`
        };
      }

      // Update coin balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: currentCoins - OPTIMIZATION_COST })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating coins:', updateError);
        return { success: false, error: updateError.message };
      }

      // Update the UI by refreshing the profile
      if (refreshProfile && typeof refreshProfile === 'function') {
        await refreshProfile();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Unexpected error in coin deduction:', error);
      return { success: false, error: error.message };
    }
  };

  const handleOptimize = async () => {
    // Guard against multiple clicks or processing
    if (isLoading) return;
    
    // Track attempts and force reset if too many
    optimizationAttempts.current += 1;
    if (optimizationAttempts.current > 20) {
      console.log("Many optimization attempts detected, forcing refresh");
      optimizationAttempts.current = 0;
      // Force a page refresh after too many attempts
      window.location.reload();
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Safety check for optimization function
      if (!onNonExhaustiveClick || typeof onNonExhaustiveClick !== 'function') {
        throw new Error("Optimization function is not available");
      }

      // First check if the user is authenticated before proceeding
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // If the user is not authenticated, try to refresh their session before proceeding
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !refreshData.session) {
            console.error("Auth session expired, redirecting to login");
            toast({
              title: "Session Expired",
              description: "Your session has expired. Redirecting to login page.",
              variant: "destructive"
            });
            setTimeout(() => {
              window.location.href = '/auth';
            }, 2000);
            return;
          }
        }
      } catch (authError) {
        console.error("Auth check failed:", authError);
        // Continue anyway, the API call will handle auth issues
      }

      // First attempt to deduct coins, but don't block if it fails
      if (user) {
        const { success, error } = await deductCoins();
        
        if (!success) {
          // If it's insufficient coins, we should stop and notify the user
          if (error && error.includes('Insufficient coins')) {
            toast({
              title: "Insufficient Coins",
              description: error,
              variant: "destructive"
            });
            if (isMounted.current) setIsLoading(false);
            return;
          } else {
            // For other errors, we'll show a warning but continue with optimization
            console.warn('Coin deduction failed:', error);
            toast({
              title: "Coin Deduction Warning",
              description: "We couldn't process your coin payment, but we'll continue with optimization.",
              variant: "warning"
            });
          }
        } else {
          // Success notification
          toast({
            title: "Coins Deducted",
            description: `${OPTIMIZATION_COST} coins have been deducted from your account.`,
            variant: "default"
          });
        }
      }

      try {
        // Proceed with optimization using the safe wrapper
        await safeOptimize();
        
        // Only show success if still mounted
        if (isMounted.current) {
          toast({
            title: "Optimization Complete",
            description: "Your strategy has been successfully optimized.",
            variant: "default"
          });
        }
      } catch (optimizeError) {
        console.error("Failed to run optimization:", optimizeError);
        if (isMounted.current) {
          toast({
            title: "Optimization Process Failed",
            description: optimizeError.message || "The optimization process encountered an error",
            variant: "destructive"
          });
        }
      }
      
      // Reset attempt counter on success
      optimizationAttempts.current = 0;
    } catch (error) {
      console.error("Optimization error:", error);
      if (isMounted.current) {
        toast({
          title: "Optimization Failed",
          description: error.message || "An unexpected error occurred",
          variant: "destructive"
        });
      }
    } finally {
      // Clear any stored optimization session data
      localStorage.removeItem('optimization_last_config');
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Check if user has enough coins
  const hasEnoughCoins = user && userProfile?.coins >= OPTIMIZATION_COST;
  const coinBalance = userProfile?.coins || 0;

  return (
    <div className="w-full flex justify-center">
      <HoverCard>
        <HoverCardTrigger asChild>
          <button
            onClick={handleOptimize}
            disabled={isLoading}
            className={`bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white py-3 px-6 rounded-lg flex items-center justify-center transition-all ${
              isLoading
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
              Cost: {OPTIMIZATION_COST} Coins
            </p>
            {user && (
              <p className="text-xs text-zinc-300">
                Your balance: {coinBalance} Coins
                {!hasEnoughCoins && user && (
                  <span className="flex items-center mt-1 text-red-400">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Insufficient coins
                  </span>
                )}
              </p>
            )}
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