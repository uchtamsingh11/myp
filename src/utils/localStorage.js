// Utility functions for working with localStorage

/**
 * Generate a cache key based on strategy script and backtest configuration
 * @param {string} pineScript - The Pine Script code
 * @param {object} config - The backtest configuration (symbol, timeframe, dates, etc.)
 * @returns {string} - A unique cache key
 */
export const generateCacheKey = (pineScript, config) => {
  // Create a hash based on the strategy script and configuration
  const configStr = JSON.stringify({
    script: pineScript.trim(),
    symbol: config.symbol,
    timeframe: config.timeframe,
    startDate: config.startDate,
    endDate: config.endDate,
    initialCapital: config.initialCapital,
    quantity: config.quantity
  });
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < configStr.length; i++) {
    const char = configStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `backtest_${hash}`;
};

/**
 * Save backtest results to localStorage
 * @param {object} results - The backtest results to save
 * @param {string} pineScript - The Pine Script code
 * @param {object} config - The backtest configuration
 */
export const saveBacktestToCache = (results, pineScript, config) => {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheKey = generateCacheKey(pineScript, config);
    const cacheData = {
      results,
      timestamp: new Date().toISOString(),
      config: {
        symbol: config.symbol,
        timeframe: config.timeframe,
        startDate: config.startDate,
        endDate: config.endDate,
        initialCapital: config.initialCapital,
        quantity: config.quantity
      },
      scriptHash: cacheKey
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
    // Save most recent config separately for form pre-filling
    localStorage.setItem('backtestConfig', JSON.stringify(config));
    
    // Manage list of backtest keys to prevent unlimited storage growth
    const backtestKeys = JSON.parse(localStorage.getItem('backtestKeys') || '[]');
    if (!backtestKeys.includes(cacheKey)) {
      // Add new key and limit to last 20 backtests
      backtestKeys.push(cacheKey);
      if (backtestKeys.length > 20) {
        // Remove oldest keys and their data
        const removedKeys = backtestKeys.splice(0, backtestKeys.length - 20);
        removedKeys.forEach(key => localStorage.removeItem(key));
      }
      localStorage.setItem('backtestKeys', JSON.stringify(backtestKeys));
    }
  } catch (error) {
    console.error('Error saving backtest to cache:', error);
  }
};

/**
 * Get cached backtest results if they exist
 * @param {string} pineScript - The Pine Script code
 * @param {object} config - The backtest configuration
 * @returns {object|null} - The cached backtest data or null if not found
 */
export const getBacktestFromCache = (pineScript, config) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cacheKey = generateCacheKey(pineScript, config);
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error('Error retrieving backtest from cache:', error);
  }
  return null;
};

/**
 * Load the last used backtest configuration from localStorage
 * @returns {object|null} - The saved config or null if none exists
 */
export const loadSavedConfig = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedConfig = localStorage.getItem('backtestConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (error) {
    console.error('Error loading saved config:', error);
  }
  return null;
};

/**
 * Clear all backtest data from localStorage
 */
export const clearBacktestCache = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const backtestKeys = JSON.parse(localStorage.getItem('backtestKeys') || '[]');
    backtestKeys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('backtestKeys');
    localStorage.removeItem('backtestConfig');
  } catch (error) {
    console.error('Error clearing backtest cache:', error);
  }
}; 