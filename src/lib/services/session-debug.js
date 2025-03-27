import { supabase } from '../../utils/supabase';

/**
 * Utility function to check if a session is valid and refresh it if needed
 * @returns {Promise<{session: Object|null, error: Error|null}>}
 */
export async function validateSession() {
  try {
    // First check if we have an existing session
    const {
      data: { session: existingSession },
      error: getError,
    } = await supabase.auth.getSession();

    if (getError) {
      console.error('Error getting session:', getError);
      return { session: null, error: getError };
    }

    if (!existingSession) {
      console.log('No existing session found');
      return { session: null, error: null };
    }

    // Validate that session has valid access token
    if (!existingSession.access_token) {
      console.error('Session has no access token');
      return { session: null, error: new Error('Session has no access token') };
    }

    // Check if the access token is expired or about to expire
    const tokenExpiry = new Date(existingSession.expires_at * 1000);
    const now = new Date();
    const timeUntilExpiry = tokenExpiry.getTime() - now.getTime();

    console.log(`Session found, expires in ${Math.floor(timeUntilExpiry / 1000)} seconds`);

    // If the token is about to expire (less than 5 minutes), refresh it
    if (timeUntilExpiry < 300000) {
      console.log('Token is about to expire, refreshing...');
      const {
        data: { session: refreshedSession },
        error: refreshError,
      } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
        return { session: null, error: refreshError };
      }

      console.log('Session refreshed successfully');
      return { session: refreshedSession, error: null };
    }

    return { session: existingSession, error: null };
  } catch (error) {
    console.error('Unexpected error in validateSession:', error);
    return { session: null, error };
  }
}

/**
 * Utility function to log out the current user
 */
export async function signOut() {
  try {
    await supabase.auth.signOut();
    console.log('User signed out successfully');

    // Clear localStorage
    localStorage.removeItem('userProfile');
    localStorage.removeItem('isAdmin');

    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
}
