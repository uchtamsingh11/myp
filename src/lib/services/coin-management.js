import { supabase } from '../../utils/supabase';

/**
 * Get the current coin balance for a user
 * @param {string} userId - The user ID to get the coin balance for
 * @returns {Promise<number>} - The current coin balance
 */
export const getUserCoinBalance = async userId => {
  try {
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return data.coins || 0;
  } catch (error) {
    console.error('Error getting user coin balance:', error);
    throw error;
  }
};

/**
 * Add coins to a user's balance
 * @param {string} userId - The user ID to add coins to
 * @param {number} amount - The amount of coins to add
 * @returns {Promise<number>} - The new coin balance
 */
export const addCoins = async (userId, amount) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!amount || amount <= 0) throw new Error('Amount must be greater than 0');

    // Get current balance
    const currentBalance = await getUserCoinBalance(userId);
    const newBalance = currentBalance + amount;

    // Update balance in database
    const { data, error } = await supabase
      .from('profiles')
      .update({ coins: newBalance })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return data.coins || newBalance;
  } catch (error) {
    console.error('Error adding coins:', error);
    throw error;
  }
};

/**
 * Subtract coins from a user's balance
 * @param {string} userId - The user ID to subtract coins from
 * @param {number} amount - The amount of coins to subtract
 * @param {boolean} [allowNegative=false] - Whether to allow the balance to go negative
 * @returns {Promise<{success: boolean, newBalance: number, error?: string}>} - Result with new balance or error
 */
export const subtractCoins = async (userId, amount, allowNegative = false) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!amount || amount <= 0) throw new Error('Amount must be greater than 0');

    // Get current balance
    const currentBalance = await getUserCoinBalance(userId);

    // Check if user has enough coins
    if (!allowNegative && currentBalance < amount) {
      return {
        success: false,
        newBalance: currentBalance,
        error: 'Insufficient coin balance',
      };
    }

    // Calculate new balance, don't go below 0 unless allowNegative is true
    const newBalance = allowNegative
      ? currentBalance - amount
      : Math.max(0, currentBalance - amount);

    // Update balance in database
    const { data, error } = await supabase
      .from('profiles')
      .update({ coins: newBalance })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      newBalance: data.coins || newBalance,
    };
  } catch (error) {
    console.error('Error subtracting coins from user:', error);
    throw error;
  }
};

/**
 * Set a user's coin balance to a specific amount
 * @param {string} userId - The user ID to set coins for
 * @param {number} amount - The amount to set the coin balance to
 * @returns {Promise<number>} - The new coin balance
 */
export const setCoins = async (userId, amount) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (amount === undefined || amount === null) throw new Error('Amount is required');
    if (amount < 0) throw new Error('Amount cannot be negative');

    // Update balance in database
    const { data, error } = await supabase
      .from('profiles')
      .update({ coins: amount })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return data.coins || amount;
  } catch (error) {
    console.error('Error setting coins:', error);
    throw error;
  }
};

/**
 * Check if a user has enough coins for a service
 * @param {string} userId - The user ID to check
 * @param {number} requiredAmount - The amount of coins required
 * @returns {Promise<boolean>} - Whether the user has enough coins
 */
export const hasEnoughCoins = async (userId, requiredAmount) => {
  try {
    const balance = await getUserCoinBalance(userId);
    return balance >= requiredAmount;
  } catch (error) {
    console.error('Error checking if user has enough coins:', error);
    return false;
  }
};
