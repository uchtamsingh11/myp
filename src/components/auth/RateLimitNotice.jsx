'use client';

import { useState, useEffect } from 'react';

/**
 * RateLimitNotice - Shows a notice when user has been rate limited
 * To be used in the login/auth pages
 */
export default function RateLimitNotice() {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const rateLimitKey = 'auth_rate_limit_until';

  useEffect(() => {
    // Check if we're in a rate limit cooldown
    const checkRateLimit = () => {
      const rateLimitUntil = localStorage.getItem(rateLimitKey);
      
      if (rateLimitUntil) {
        const cooldownUntil = parseInt(rateLimitUntil, 10);
        const now = Date.now();
        
        if (now < cooldownUntil) {
          setIsRateLimited(true);
          setTimeRemaining(Math.ceil((cooldownUntil - now) / 1000));
        } else {
          setIsRateLimited(false);
          localStorage.removeItem(rateLimitKey);
        }
      } else {
        setIsRateLimited(false);
      }
    };
    
    // Check initially
    checkRateLimit();
    
    // Set up interval to update countdown
    const interval = setInterval(() => {
      checkRateLimit();
    }, 1000);
    
    // Clean up
    return () => clearInterval(interval);
  }, []);
  
  // If not rate limited, don't render anything
  if (!isRateLimited) {
    return null;
  }
  
  return (
    <div className="p-4 mb-4 bg-amber-100 border-l-4 border-amber-500 text-amber-700 rounded shadow">
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="font-medium">Too many login attempts</p>
      </div>
      <p className="mt-2 text-sm">
        For security reasons, please wait {timeRemaining} seconds before trying again.
      </p>
    </div>
  );
} 