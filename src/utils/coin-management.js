import { supabase } from './supabase';

/**
 * Get the current coin balance for a user
 * @param {object} supabaseClient - Optional Supabase client, uses default if not provided
 * @param {string} userId - The user ID to get the coin balance for
 * @returns {Promise<number>} - The current coin balance
 */
export const getUserCoinBalance = async (supabaseClient, userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    // Use provided client or fall back to default
    const client = supabaseClient || supabase;
    
    const { data, error } = await client
      .from('profiles')
      .select('coin_balance')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data.coin_balance || 0;
  } catch (error) {
    console.error('Error getting user coin balance:', error);
    throw error;
  }
};

/**
 * Add coins to a user's balance
 * @param {object} supabaseClient - Optional Supabase client, uses default if not provided
 * @param {string} userId - The user ID to add coins to
 * @param {number} amount - The amount of coins to add
 * @returns {Promise<number>} - The new coin balance
 */
export const addCoins = async (supabaseClient, userId, amount) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!amount || amount <= 0) throw new Error('Amount must be greater than 0');
    
    // Use provided client or fall back to default
    const client = supabaseClient || supabase;
    
    // Get current balance
    const currentBalance = await getUserCoinBalance(client, userId);
    const newBalance = currentBalance + amount;
    
    // Update balance in database
    const { data, error } = await client
      .from('profiles')
      .update({ coin_balance: newBalance })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data.coin_balance;
  } catch (error) {
    console.error('Error adding coins:', error);
    throw error;
  }
};

/**
 * Subtract coins from a user's balance
 * @param {object} supabaseClient - Optional Supabase client, uses default if not provided
 * @param {string} userId - The user ID to subtract coins from
 * @param {number} amount - The amount of coins to subtract
 * @param {boolean} [allowNegative=false] - Whether to allow the balance to go negative
 * @returns {Promise<{success: boolean, newBalance: number, error?: string}>} - Result with new balance or error
 */
export const subtractCoins = async (supabaseClient, userId, amount, allowNegative = false) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!amount || amount <= 0) throw new Error('Amount must be greater than 0');
    
    // Use provided client or fall back to default
    const client = supabaseClient || supabase;
    
    // Get current balance
    const currentBalance = await getUserCoinBalance(client, userId);
    
    // Check if user has enough coins
    if (!allowNegative && currentBalance < amount) {
      return {
        success: false,
        newBalance: currentBalance,
        error: 'Insufficient coin balance'
      };
    }
    
    // Calculate new balance, don't go below 0 unless allowNegative is true
    const newBalance = allowNegative ? currentBalance - amount : Math.max(0, currentBalance - amount);
    
    // Update balance in database
    const { data, error } = await client
      .from('profiles')
      .update({ coin_balance: newBalance })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      newBalance: data.coin_balance
    };
  } catch (error) {
    console.error('Error subtracting coins from user:', error);
    throw error;
  }
};

/**
 * Set a user's coin balance to a specific amount
 * @param {object} supabaseClient - Optional Supabase client, uses default if not provided
 * @param {string} userId - The user ID to set coins for
 * @param {number} amount - The amount to set the coin balance to
 * @returns {Promise<number>} - The new coin balance
 */
export const setCoins = async (supabaseClient, userId, amount) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (amount === undefined || amount === null) throw new Error('Amount is required');
    if (amount < 0) throw new Error('Amount cannot be negative');
    
    // Use provided client or fall back to default
    const client = supabaseClient || supabase;
    
    // Update balance in database
    const { data, error } = await client
      .from('profiles')
      .update({ coin_balance: amount })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data.coin_balance;
  } catch (error) {
    console.error('Error setting coins:', error);
    throw error;
  }
};

/**
 * Check if a user has enough coins for a service
 * @param {object} supabaseClient - Optional Supabase client, uses default if not provided
 * @param {string} userId - The user ID to check
 * @param {number} requiredAmount - The amount of coins required
 * @returns {Promise<boolean>} - Whether the user has enough coins
 */
export const hasEnoughCoins = async (supabaseClient, userId, requiredAmount) => {
  try {
    const client = supabaseClient || supabase;
    const balance = await getUserCoinBalance(client, userId);
    return balance >= requiredAmount;
  } catch (error) {
    console.error('Error checking if user has enough coins:', error);
    return false;
  }
}; 