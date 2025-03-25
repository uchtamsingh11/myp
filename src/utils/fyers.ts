import { supabase } from './supabase';

// Import the fyers-api-v3 package safely with dynamic import pattern for Next.js
let fyersModel: any = null;

// Only load the module on the server side, not during build or on client
if (typeof window === 'undefined') {
  try {
    // Dynamic import to prevent build-time errors
    fyersModel = require("fyers-api-v3").fyersModel;
  } catch (error) {
    console.error("Failed to load fyers-api-v3. The module will be loaded at runtime.");
  }
}

// Only the redirect URI is needed as an environment variable
// The frontend's callback URL for Fyers auth
const REDIRECT_URI = process.env.NEXT_PUBLIC_FYERS_REDIRECT_URI || 'http://localhost:3000/api/fyers/callback';

// Initialize the Fyers API client with proper logging configuration
const getFyersClient = (enableLogging = false) => {
  if (!fyersModel) {
    throw new Error('Fyers API module is not available in this environment');
  }
  
  return new fyersModel({
    "path": process.env.NODE_ENV === 'production' ? "/tmp" : "./logs",
    "enableLogging": enableLogging
  });
};

// Get user's Fyers credentials from database
export const getUserFyersCredentials = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('fyers_credentials')
      .select('app_id, api_secret, access_token, token_expiry')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching Fyers credentials:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserFyersCredentials:', error);
    throw error;
  }
};

// Generate authorization URL for a specific app ID
export const generateAuthUrl = (appId: string) => {
  if (!appId || !REDIRECT_URI) {
    throw new Error('Fyers App ID or redirect URI not provided');
  }
  
  const fyers = getFyersClient();
  fyers.setAppId(appId);
  fyers.setRedirectUrl(REDIRECT_URI);
  
  return fyers.generateAuthCode();
};

// Exchange auth code for access token
export const getAccessToken = async (authCode: string, appId: string, apiSecret: string) => {
  if (!appId || !apiSecret) {
    throw new Error('Fyers API credentials not provided');
  }
  
  try {
    const fyers = getFyersClient(true);
    const tokenResponse = await fyers.generate_access_token({
      "client_id": appId,
      "secret_key": apiSecret,
      "auth_code": authCode
    });
    
    if (tokenResponse.s !== 'ok') {
      throw new Error(`Failed to get access token: ${JSON.stringify(tokenResponse)}`);
    }
    
    return tokenResponse.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

// Save or update access token for a user
export const saveAccessToken = async (userId: string, accessToken: string) => {
  try {
    // Calculate expiry (1 day from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);
    
    // Update the user's record with the new token
    const { error } = await supabase
      .from('fyers_credentials')
      .update({
        access_token: accessToken,
        token_expiry: expiryDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error saving Fyers access token:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveAccessToken:', error);
    throw error;
  }
};

// Initialize a fyers client with user credentials
export const getUserFyersClient = async (userId: string) => {
  try {
    // Get the user's credentials from the database
    const credentials = await getUserFyersCredentials(userId);
    
    if (!credentials || !credentials.access_token) {
      throw new Error('No valid Fyers credentials found');
    }
    
    // Check if token is expired
    if (credentials.token_expiry && new Date(credentials.token_expiry) < new Date()) {
      throw new Error('Fyers access token has expired');
    }
    
    // Initialize the client with the access token
    const fyers = getFyersClient(true);
    fyers.setAppId(credentials.app_id);
    fyers.setAccessToken(credentials.access_token);
    
    return fyers;
  } catch (error) {
    console.error('Error initializing Fyers client:', error);
    throw error;
  }
};

// Export the functions
export default {
  generateAuthUrl,
  getAccessToken,
  getUserFyersCredentials,
  saveAccessToken,
  getUserFyersClient
};
