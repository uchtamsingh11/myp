'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';

// Set up Supabase client
const supabase = createClientComponentClient();

// Static broker data - only Fyers and Dhan
const AVAILABLE_BROKERS = [
  { id: 'fyers', name: 'Fyers', description: 'Online trading and investing platform', status: 'available', logo: '💹' },
  { id: 'dhan', name: 'Dhan', description: 'Modern broker for option traders', status: 'available', logo: '📉' },
];

export default function BrokerAuthComponent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [removingBroker, setRemovingBroker] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [session, setSession] = useState(null);
  
  // State for brokers
  const [availableBrokers] = useState(AVAILABLE_BROKERS);
  const [savedBrokers, setSavedBrokers] = useState([]);
  
  useEffect(() => {
    // Check authentication status first
    checkAuthStatus();
  }, []);
  
  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        setSession(currentSession);
        setAuthenticated(true);
        // Only fetch saved brokers if we have a valid session
        await fetchSavedBrokers(currentSession);
      } else {
        setAuthenticated(false);
        setLoading(false);
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setAuthenticated(false);
      setLoading(false);
    }
  };
  
  // Helper function to get authenticated session
  const getAuthenticatedSession = async () => {
    if (session) return session;
    
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    if (!currentSession) {
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          setAuthenticated(false);
          throw new Error(refreshError?.message || 'Authentication session missing');
        }
        
        setSession(refreshData.session);
        setAuthenticated(true);
        return refreshData.session;
      } catch (err) {
        setAuthenticated(false);
        throw new Error('Authentication required to access broker settings');
      }
    }
    
    setSession(currentSession);
    setAuthenticated(true);
    return currentSession;
  };
  
  // Handle opening the credentials modal
  const handleOpenModal = (broker) => {
    setSelectedBroker(broker);
    
    // Initialize credentials object based on broker type
    if (broker.id === 'fyers') {
      setCredentials({ app_id: '', secret_id: '' });
    } else if (broker.id === 'dhan') {
      setCredentials({ api_key: '', secret_key: '' });
    }
    
    // Check if credentials already exist for this broker
    const existingBroker = savedBrokers.find(saved => saved.broker_id === broker.id);
    if (existingBroker) {
      if (broker.id === 'fyers') {
        setCredentials({
          app_id: existingBroker.credentials?.app_id || '',
          secret_id: '' // Don't show the actual secret
        });
      } else if (broker.id === 'dhan') {
        setCredentials({
          api_key: existingBroker.credentials?.api_key || '',
          secret_key: '' // Don't show the actual secret
        });
      }
    }
    
    setIsModalOpen(true);
  };
  
  // Handle saving broker credentials
  const handleSaveBrokerCredentials = async () => {
    try {
      setSavingCredentials(true);
      setError(null);
      
      if (!authenticated) {
        const currentSession = await getAuthenticatedSession();
        if (!currentSession) {
          throw new Error('Authentication required to save broker credentials');
        }
      }
      
      // Get authenticated session
      const currentSession = session || await getAuthenticatedSession();
      const userId = currentSession.user.id;
      
      // Save credentials based on broker type
      let saveResult;
      
      if (selectedBroker.id === 'fyers') {
        if (!credentials.app_id || !credentials.secret_id) {
          throw new Error('Both App ID and Secret ID are required for Fyers integration');
        }
        
        // Check if credentials already exist
        const { data: existingCreds, error: checkError } = await supabase
          .from('fyers_credentials')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (checkError) {
          throw new Error('Error checking existing credentials: ' + checkError.message);
        }
        
        if (existingCreds) {
          // Update existing credentials
          saveResult = await supabase
            .from('fyers_credentials')
            .update({
              app_id: credentials.app_id.trim(),
              api_secret: credentials.secret_id.trim(),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCreds.id);
        } else {
          // Insert new credentials
          saveResult = await supabase
            .from('fyers_credentials')
            .insert({
              user_id: userId,
              app_id: credentials.app_id.trim(),
              api_secret: credentials.secret_id.trim()
            });
        }
      } else if (selectedBroker.id === 'dhan') {
        if (!credentials.api_key || !credentials.secret_key) {
          throw new Error('Both API Key and Secret Key are required for Dhan integration');
        }
        
        // Check if credentials already exist
        const { data: existingCreds, error: checkError } = await supabase
          .from('dhan_credentials')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (checkError) {
          throw new Error('Error checking existing credentials: ' + checkError.message);
        }
        
        if (existingCreds) {
          // Update existing credentials
          saveResult = await supabase
            .from('dhan_credentials')
            .update({
              api_key: credentials.api_key.trim(),
              api_secret: credentials.secret_key.trim(),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCreds.id);
        } else {
          // Insert new credentials
          saveResult = await supabase
            .from('dhan_credentials')
            .insert({
              user_id: userId,
              api_key: credentials.api_key.trim(),
              api_secret: credentials.secret_key.trim()
            });
        }
      }
      
      // Check for errors
      if (saveResult?.error) {
        throw new Error('Failed to save credentials: ' + saveResult.error.message);
      }
      
      // Success
      setIsModalOpen(false);
      fetchSavedBrokers(currentSession);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCredentials(false);
    }
  };
  
  // Handle removing saved broker credentials
  const handleRemoveBrokerCredentials = async (savedBroker) => {
    try {
      setRemovingBroker(savedBroker.id);
      
      if (!authenticated) {
        const currentSession = await getAuthenticatedSession();
        if (!currentSession) {
          throw new Error('Authentication required to remove broker credentials');
        }
      }
      
      // Get authenticated session
      const currentSession = session || await getAuthenticatedSession();
      const userId = currentSession.user.id;
      
      // Delete credentials based on broker type
      let deleteResult;
      
      if (savedBroker.broker_id === 'fyers') {
        deleteResult = await supabase
          .from('fyers_credentials')
          .delete()
          .eq('id', savedBroker.id)
          .eq('user_id', userId);
      } else if (savedBroker.broker_id === 'dhan') {
        deleteResult = await supabase
          .from('dhan_credentials')
          .delete()
          .eq('id', savedBroker.id)
          .eq('user_id', userId);
      }
      
      // Check for errors
      if (deleteResult?.error) {
        throw new Error('Failed to remove credentials: ' + deleteResult.error.message);
      }
      
      // Success - refresh the list of saved brokers
      fetchSavedBrokers(currentSession);
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingBroker(null);
    }
  };
  
  // Toggle broker active state
  const toggleBrokerActive = async (savedBroker) => {
    try {
      if (!authenticated) {
        await getAuthenticatedSession();
      }
      
      // No database update for now, just update the UI
      setSavedBrokers(
        savedBrokers.map(broker =>
          broker.id === savedBroker.id
            ? { ...broker, is_active: !savedBroker.is_active }
            : broker
        )
      );
    } catch (err) {
      setError('Failed to update broker active state: ' + err.message);
    }
  };
  
  // Helper function to get filtered available brokers
  const getFilteredBrokers = () => {
    if (!searchTerm) return availableBrokers;
    
    return availableBrokers.filter(broker =>
      broker.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  // Helper function to check if a broker is already saved
  const isBrokerSaved = (brokerId) => {
    return savedBrokers.some(saved => saved.broker_id === brokerId);
  };
  
  // Fetch saved brokers from database
  const fetchSavedBrokers = async (currentSession = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get authenticated session if not provided
      let userSession = currentSession;
      if (!userSession) {
        try {
          userSession = await getAuthenticatedSession();
          if (!userSession) {
            setLoading(false);
            return;
          }
        } catch (authError) {
          setError(null); // Don't show error in UI
          setLoading(false);
          return;
        }
      }
      
      const userId = userSession.user.id;
      const allSavedBrokers = [];
      
      // Query Fyers credentials
      const { data: fyersData, error: fyersError } = await supabase
        .from('fyers_credentials')
        .select('*')
        .eq('user_id', userId);
        
      if (!fyersError && fyersData && fyersData.length > 0) {
        const fyersBrokers = fyersData.map(cred => ({
          id: cred.id,
          user_id: cred.user_id,
          broker_id: 'fyers',
          credentials: {
            app_id: cred.app_id,
          },
          is_active: true,
          created_at: cred.created_at,
          updated_at: cred.updated_at
        }));
        
        allSavedBrokers.push(...fyersBrokers);
      }
      
      // Query Dhan credentials
      const { data: dhanData, error: dhanError } = await supabase
        .from('dhan_credentials')
        .select('*')
        .eq('user_id', userId);
        
      if (!dhanError && dhanData && dhanData.length > 0) {
        const dhanBrokers = dhanData.map(cred => ({
          id: cred.id,
          user_id: cred.user_id,
          broker_id: 'dhan',
          credentials: {
            api_key: cred.api_key,
          },
          is_active: true,
          created_at: cred.created_at,
          updated_at: cred.updated_at
        }));
        
        allSavedBrokers.push(...dhanBrokers);
      }
      
      setSavedBrokers(allSavedBrokers);
    } catch (err) {
      // Just log the error but don't display it
      console.error('Failed to fetch saved brokers:', err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Render credential modal fields based on broker type
  const renderCredentialFields = () => {
    if (!selectedBroker) return null;
    
    if (selectedBroker.id === 'fyers') {
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              App ID
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              value={credentials.app_id || ''}
              onChange={(e) => setCredentials({ ...credentials, app_id: e.target.value })}
              placeholder="Enter Fyers App ID"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Secret ID
            </label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              value={credentials.secret_id || ''}
              onChange={(e) => setCredentials({ ...credentials, secret_id: e.target.value })}
              placeholder="Enter Fyers Secret ID"
            />
          </div>
        </>
      );
    } else if (selectedBroker.id === 'dhan') {
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Key
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              value={credentials.api_key || ''}
              onChange={(e) => setCredentials({ ...credentials, api_key: e.target.value })}
              placeholder="Enter Dhan API Key"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Secret Key
            </label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              value={credentials.secret_key || ''}
              onChange={(e) => setCredentials({ ...credentials, secret_key: e.target.value })}
              placeholder="Enter Dhan Secret Key"
            />
          </div>
        </>
      );
    }
    
    return null;
  };
  
  return (
    <div className="p-4 max-w-6xl mx-auto bg-zinc-950 rounded-lg min-h-[500px]">
      <div className="mb-6 pl-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-indigo-400 font-medium">Broker Authentication</span>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p className="text-sm">{error}</p>
          <button 
            className="text-xs underline mt-1"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="h-96 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Saved Brokers Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Saved Brokers</h2>
            </div>
            
            {savedBrokers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedBrokers.map(broker => {
                  // Find broker details from available brokers
                  const brokerDetails = availableBrokers.find(b => b.id === broker.broker_id) || {
                    name: broker.broker_id,
                    logo: '🔌',
                    description: 'Broker connection'
                  };
                  
                  return (
                    <motion.div
                      key={broker.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-zinc-900 p-5 rounded-lg border border-zinc-800 hover:border-indigo-500 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{brokerDetails.logo}</span>
                          <div>
                            <h3 className="text-lg font-medium text-white">{brokerDetails.name}</h3>
                            <p className="text-xs text-gray-400">{broker.credentials?.app_id || broker.credentials?.api_key || 'Connected'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div 
                            className={`w-10 h-5 rounded-full mr-2 transition-colors duration-200 ease-in-out flex items-center ${broker.is_active ? 'bg-green-500 justify-end' : 'bg-gray-600 justify-start'}`}
                            onClick={() => toggleBrokerActive(broker)}
                          >
                            <span className="block w-4 h-4 bg-white rounded-full mx-0.5"></span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => {
                            // Find the original broker from available brokers
                            const originalBroker = availableBrokers.find(b => b.id === broker.broker_id);
                            if (originalBroker) {
                              handleOpenModal(originalBroker);
                            }
                          }}
                          className="flex-1 py-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md transition-all shadow-md hover:shadow-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveBrokerCredentials(broker)}
                          disabled={removingBroker === broker.id}
                          className="flex-1 py-1 px-3 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          {removingBroker === broker.id ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 text-center"
              >
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="text-white text-lg font-medium mb-1">No Brokers Connected</h3>
                <p className="text-gray-400 text-sm mb-4">You haven't connected any brokers yet. Connect a broker to get started.</p>
              </motion.div>
            )}
          </section>
          
          {/* Available Brokers Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Available Brokers</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search brokers..."
                  className="py-1 px-3 pr-8 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredBrokers().map(broker => (
                <motion.div
                  key={broker.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900 p-5 rounded-lg border border-zinc-800 hover:border-indigo-500 transition-all"
                >
                  <div className="flex items-start mb-3">
                    <span className="text-2xl mr-2">{broker.logo}</span>
                    <div>
                      <h3 className="text-lg font-medium text-white">{broker.name}</h3>
                      <p className="text-xs text-gray-400">{broker.description}</p>
                    </div>
                  </div>
                  
                  {broker.status === 'available' ? (
                    <div className="mt-3">
                      {isBrokerSaved(broker.id) ? (
                        <button 
                          className="w-full py-1.5 px-3 bg-gray-600 text-white text-sm rounded-md opacity-70 cursor-not-allowed"
                          disabled
                        >
                          Already Saved
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleOpenModal(broker)}
                          className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md transition-all shadow-md hover:shadow-lg"
                        >
                          Save Credentials
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3">
                      <button 
                        className="w-full py-1.5 px-3 bg-gray-600 text-white text-sm rounded-md opacity-70 cursor-not-allowed"
                        disabled
                      >
                        Coming Soon
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      )}
      
      {/* Credentials Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedBroker?.name} Credentials
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-5">
              {renderCredentialFields()}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveBrokerCredentials}
                disabled={savingCredentials}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm disabled:opacity-50"
              >
                {savingCredentials ? 'Saving...' : 'Save Credentials'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}