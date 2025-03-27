import { supabase } from '../../utils/supabase';

/**
 * Fetches the profile for a given user ID
 * @param {string} userId - The user ID to fetch the profile for
 * @returns {Promise<Object|null>} - The user profile or null if not found
 */
export const fetchUserProfile = async (userId) => {
  try {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Updates a user's profile
 * @param {string} userId - The user ID to update the profile for
 * @param {Object} updates - The profile fields to update
 * @returns {Promise<Object|null>} - The updated profile or null if update failed
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Update local storage if available
    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const updatedProfile = { ...JSON.parse(storedProfile), ...updates };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      }
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

/**
 * Gets the current user's profile from localStorage or fetches it from the database
 * @returns {Promise<Object|null>} - The user profile or null if not logged in
 */
export const getCurrentUserProfile = async () => {
  try {
    // First check if we have the profile in localStorage
    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        return JSON.parse(storedProfile);
      }
    }

    // If not in localStorage, fetch from the database
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const profile = await fetchUserProfile(session.user.id);

    // Store in localStorage for future use
    if (profile && typeof window !== 'undefined') {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }

    return profile;
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return null;
  }
};

/**
 * Checks if a referral code exists
 * @param {string} referralCode - The referral code to check
 * @returns {Promise<boolean>} - True if the referral code exists, false otherwise
 */
export const checkReferralCode = async (referralCode) => {
  try {
    if (!referralCode) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', referralCode)
      .single();

    if (error) return false;
    return !!data;
  } catch (error) {
    console.error('Error checking referral code:', error);
    return false;
  }
};