'use client';

import { useEffect, useState, useRef } from 'react';
import { refreshSession, isAuthenticated } from '../../../utils/supabase';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * AuthStatusMonitor - Monitors authentication status and provides recovery options
 * when authentication issues are detected.
 */
export default function DatabaseStatusMonitor() {
  const [isAuthIssue, setIsAuthIssue] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const lastCheckTime = useRef(Date.now());
  const isRefreshing = useRef(false);
  const checkTimeout = useRef(null);

  // Check auth status when visibility changes (tab becomes active)
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Skip if already checking or if last check was too recent (debounce)
      if (isChecking || isRefreshing.current) return;
      
      // Throttle checks to prevent too many in a short time period
      const now = Date.now();
      const timeSinceLastCheck = now - lastCheckTime.current;
      
      // Only check at most once every 30 seconds
      if (timeSinceLastCheck < 30000) {
        return;
      }
      
      // Only check when tab is visible
      if (document.visibilityState !== 'visible') return;
      
      try {
        setIsChecking(true);
        lastCheckTime.current = now;
        
        const isValid = await isAuthenticated();
        
        // If not authenticated, show the auth issue banner
        if (!isValid) {
          console.log('Auth issue detected, showing recovery options');
          setIsAuthIssue(true);
        } else {
          setIsAuthIssue(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsChecking(false);
      }
    };
    
    // Don't check immediately on mount, delay by 10 seconds
    checkTimeout.current = setTimeout(() => {
      checkAuthStatus();
    }, 10000);
    
    // For visibility changes, use a throttled approach
    const handleVisibilityChange = () => {
      // Clear any existing timeout to debounce rapid changes
      if (checkTimeout.current) {
        clearTimeout(checkTimeout.current);
      }
      
      // Only set a new timeout if the document is visible
      if (document.visibilityState === 'visible') {
        checkTimeout.current = setTimeout(() => {
          checkAuthStatus();
        }, 2000); // Wait 2 seconds after tab becomes visible
      }
    };
    
    // Listen for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (checkTimeout.current) {
        clearTimeout(checkTimeout.current);
      }
    };
  }, [isChecking]);
  
  // Attempt to refresh the auth session
  const refreshAuth = async () => {
    if (isRefreshing.current) return; // Prevent concurrent refreshes
    
    try {
      setIsChecking(true);
      isRefreshing.current = true;
      
      const success = await refreshSession();
      
      if (success) {
        setIsAuthIssue(false);
        lastCheckTime.current = Date.now(); // Update last check time
      } else {
        // If refresh fails, suggest a reload
        const shouldReload = window.confirm(
          "Couldn't refresh your session. Would you like to reload the page?"
        );
        
        if (shouldReload) {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Failed to refresh auth session:', error);
    } finally {
      setIsChecking(false);
      isRefreshing.current = false;
    }
  };
  
  // Only show the banner if there's an auth issue
  if (!isAuthIssue) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full bg-amber-900/90 border border-amber-700 p-4 rounded-lg shadow-lg">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-amber-500">
          <AlertCircle size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-100">Session Issue Detected</h3>
          <div className="mt-1 text-xs text-amber-200">
            <p>Your session may have expired. This can happen when the app is inactive for an extended period.</p>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={refreshAuth}
              disabled={isChecking}
              className="inline-flex items-center px-3 py-1.5 border border-amber-600 rounded-md text-xs font-medium bg-amber-800 text-amber-100 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              {isChecking ? (
                <>
                  <RefreshCw size={14} className="mr-1.5 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw size={14} className="mr-1.5" />
                  Refresh Session
                </>
              )}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-3 py-1.5 border border-amber-600 rounded-md text-xs font-medium bg-transparent text-amber-100 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Reload Page
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsAuthIssue(false)}
          className="flex-shrink-0 text-amber-200 hover:text-amber-100"
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
} 