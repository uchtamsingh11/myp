'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '../../../src/utils/supabase';
import toast from 'react-hot-toast';

export default function ChooseBrokerPage() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [credentials, setCredentials] = useState({
    clientId: '',
    clientSecret: ''
  });
  const [credentialsError, setCredentialsError] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const brokers = [
    {
      id: 'fyers',
      name: 'Fyers',
      logo: '/fyers-logo.svg',
      description: 'Connect to Fyers for trading',
      status: 'available'
    },
    {
      id: 'dhan',
      name: 'Dhan',
      logo: '/dhan-logo.svg',
      description: 'Connect to Dhan for trading',
      status: 'available'
    },
    {
      id: 'flattrade',
      name: 'Flattrade',
      logo: '/flattrade-logo.svg',
      description: 'Connect to Flattrade for trading',
      status: 'coming_soon'
    },
    {
      id: 'metatrader5',
      name: 'Meta Trader 5',
      logo: '/mt5-logo.svg',
      description: 'Connect to Meta Trader 5 for trading',
      status: 'coming_soon'
    }
  ];
  
  const handleConnect = async (brokerId) => {
    setSelectedBroker(brokerId);
    
    // Show credentials modal for Dhan or Fyers
    if (brokerId === 'dhan' || brokerId === 'fyers') {
      // Reset credentials when opening modal
      setCredentials({
        clientId: '',
        clientSecret: ''
      });
      setShowCredentialsModal(true);
      return;
    }
    
    // For other brokers (not implemented yet)
    alert(`Integration with ${brokerId} is coming soon!`);
  };
  
  // Handle credential submission for broker connection
  const handleCredentialSubmit = async () => {
    try {
      setConnecting(true);
      setCredentialsError(null);
      
      // Validate credentials
      if (!credentials.clientId.trim() || !credentials.clientSecret.trim()) {
        setCredentialsError('Both fields are required');
        setConnecting(false);
        return;
      }
      
      console.log(`Submitting ${selectedBroker} credentials`);
      
      if (selectedBroker === 'fyers') {
        // For Fyers, we follow a two-step process:
        // 1. Save credentials to database (if user is logged in)
        // 2. Generate auth URL and redirect user to Fyers login

        // Step 1: Save the credentials first (if user is authenticated)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const userId = session.user.id;
          console.log('User authenticated, saving credentials');
          
          // Check if user already has Fyers credentials
          const { data: existingCredentials } = await supabase
            .from('fyers_credentials')
            .select('id')
            .eq('user_id', userId);
          
          // Update or insert credentials
          if (existingCredentials && existingCredentials.length > 0) {
            const { error } = await supabase
              .from('fyers_credentials')
              .update({
                app_id: credentials.clientId,
                api_secret: credentials.clientSecret,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId);
              
            if (error) {
              console.error('Error updating credentials:', error);
              setCredentialsError('Failed to update credentials');
              setConnecting(false);
              return;
            }
          } else {
            const { error } = await supabase
              .from('fyers_credentials')
              .insert({
                user_id: userId,
                app_id: credentials.clientId,
                api_secret: credentials.clientSecret,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (error) {
              console.error('Error inserting credentials:', error);
              setCredentialsError('Failed to save credentials');
              setConnecting(false);
              return;
            }
          }
          
          console.log('Credentials saved successfully');
        } else {
          console.log('User not logged in, skipping credential save');
          // We'll continue with auth URL generation anyway
        }
        
        // Step 2: Generate auth URL and redirect to Fyers login
        try {
          console.log('Generating Fyers authentication URL');
          const response = await fetch('/api/fyers/auth-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              appId: credentials.clientId
            })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to generate authorization URL');
          }
          
          console.log('Auth URL generated:', data.authUrl);
          console.log('Redirecting to Fyers authorization page...');
          
          // Redirect to Fyers login page
          window.location.href = data.authUrl;
        } catch (error) {
          console.error('Error generating auth URL:', error);
          setCredentialsError('Failed to start authentication: ' + error.message);
          setConnecting(false);
        }
      } else if (selectedBroker === 'dhan') {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setCredentialsError('You must be logged in to connect to a broker');
          setConnecting(false);
          return;
        }
        
        // First check if the user already has Dhan credentials
        const { data: existingCredentials } = await supabase
          .from('dhan_credentials')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
          
        let storeError;
        
        if (existingCredentials) {
          // Update existing credentials
          const { error } = await supabase
            .from('dhan_credentials')
            .update({
              client_id: credentials.clientId,
              client_secret: credentials.clientSecret,
            })
            .eq('user_id', session.user.id);
            
          storeError = error;
        } else {
          // Insert new credentials
          const { error } = await supabase
            .from('dhan_credentials')
            .insert({
              user_id: session.user.id,
              client_id: credentials.clientId,
              client_secret: credentials.clientSecret,
            });
            
          storeError = error;
        }
        
        if (storeError) {
          console.error('Error storing Dhan credentials:', storeError);
          setCredentialsError('Failed to save credentials. Please try again.');
          setConnecting(false);
          return;
        }
        
        console.log('Dhan credentials saved successfully');
        
        // Redirect to broker auth page
        router.push('/dashboard');
      }
      
    } catch (error) {
      console.error(`Error saving ${selectedBroker} credentials:`, error);
      setCredentialsError(`Failed to save credentials: ${error.message}`);
      setConnecting(false);
    }
  };

  const handleBack = () => {
    // Navigate back to dashboard and activate Broker Auth
    router.push('/dashboard');
    // Set a small timeout to ensure navigation completes before activating Broker Auth
    setTimeout(() => {
      // This is a simple way to communicate with parent - in production you might want to use a state management solution
      if (typeof window !== 'undefined' && window.activateDashboardSection) {
        window.activateDashboardSection('Broker Auth');
      }
    }, 100);
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <div className="container-custom mx-auto py-4 px-4 md:px-6 flex items-center">
          <button onClick={handleBack} className="mr-4 text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl md:text-2xl font-bold">Choose Your Broker</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {brokers.map((broker, index) => (
            <motion.div
              key={broker.id}
              className={`bg-zinc-800/50 border border-zinc-700/30 rounded-xl overflow-hidden flex flex-col hover:bg-zinc-800 transition-all duration-300`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="p-5 md:p-6">
                <div className="flex items-center mb-5">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-700 flex items-center justify-center">
                    {/* Fallback logo with first letter of broker name */}
                    <span className="text-lg md:text-xl font-bold">{broker.name.charAt(0)}</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold">{broker.name}</h3>
                    <p className="text-sm text-zinc-400">{broker.description}</p>
                  </div>
                </div>
                
                {broker.status === 'available' ? (
                  <button 
                    onClick={() => handleConnect(broker.id)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium text-sm md:text-base"
                    disabled={connecting}
                  >
                    {connecting && selectedBroker === broker.id ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </span>
                    ) : (
                      'Connect'
                    )}
                  </button>
                ) : (
                  <button 
                    className="w-full py-3 bg-zinc-700 cursor-not-allowed rounded-lg font-medium opacity-70 text-sm md:text-base"
                    disabled
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      
      {/* Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 md:p-6 max-w-md w-full mx-auto"
          >
            <h2 className="text-xl font-bold mb-4">
              {selectedBroker === 'dhan' ? 'Connect to Dhan' : 'Connect to Fyers'}
            </h2>
            <p className="text-zinc-400 text-sm mb-6">
              {selectedBroker === 'dhan' 
                ? 'Enter your Dhan API credentials to connect your account.' 
                : 'Enter your Fyers API credentials to connect your account.'}
            </p>
            
            {credentialsError && (
              <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
                {credentialsError}
              </div>
            )}
            
            {authError && (
              <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
                {authError}
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="clientId" className="block text-zinc-300 mb-2 text-sm">
                  {selectedBroker === 'dhan' ? 'Client ID' : 'App ID'}
                </label>
                <input
                  id="clientId"
                  type="text"
                  value={credentials.clientId}
                  onChange={(e) => setCredentials({...credentials, clientId: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={selectedBroker === 'dhan' ? 'Enter your Client ID' : 'Enter your App ID'}
                />
              </div>
              
              <div>
                <label htmlFor="clientSecret" className="block text-zinc-300 mb-2 text-sm">
                  {selectedBroker === 'dhan' ? 'Client Secret' : 'API Secret'}
                </label>
                <input
                  id="clientSecret"
                  type="password"
                  value={credentials.clientSecret}
                  onChange={(e) => setCredentials({...credentials, clientSecret: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={selectedBroker === 'dhan' ? 'Enter your Client Secret' : 'Enter your API Secret'}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="px-4 py-2 rounded-lg bg-transparent hover:bg-zinc-800 border border-zinc-700 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleCredentialSubmit}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  'Connect'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}