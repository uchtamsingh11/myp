'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '../../../src/utils/supabase';

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
  
  const brokers = [
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
    
    // Show credentials modal for Dhan
    if (brokerId === 'dhan') {
      setShowCredentialsModal(true);
      return;
    }
    
    // For other brokers (not implemented yet)
    alert(`Integration with ${brokerId} is coming soon!`);
  };
  
  const handleCredentialSubmit = async () => {
    try {
      setConnecting(true);
      setCredentialsError(null);
      
      // Validate credentials
      if (!credentials.clientId.trim() || !credentials.clientSecret.trim()) {
        setCredentialsError('Both Client ID and Client Secret are required');
        setConnecting(false);
        return;
      }
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setCredentialsError('You must be logged in to connect to a broker');
        setConnecting(false);
        return;
      }
      
      // Store credentials in dhan_credentials table
      const { error: storeError } = await supabase
        .from('dhan_credentials')
        .upsert({
          user_id: session.user.id,
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
        });
      
      if (storeError) {
        console.error('Error storing Dhan credentials:', storeError);
        setCredentialsError('Failed to save credentials. Please try again.');
        setConnecting(false);
        return;
      }
      
      console.log('Dhan credentials saved successfully');
      
      // Redirect to broker auth page
      router.push('/dashboard');
      
      // Set a small timeout to ensure navigation completes before activating Broker Auth
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.activateDashboardSection) {
          window.activateDashboardSection('Broker Auth');
        }
      }, 100);
      
    } catch (error) {
      console.error('Error saving Dhan credentials:', error);
      setCredentialsError('Failed to save credentials. Please check your input and try again.');
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
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="container-custom mx-auto py-4 px-4 flex items-center">
          <button onClick={handleBack} className="mr-4 text-zinc-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Choose Your Broker</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {brokers.map((broker, index) => (
            <motion.div
              key={broker.id}
              className={`bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden flex flex-col`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center">
                    {/* Fallback logo with first letter of broker name */}
                    <span className="text-xl font-bold">{broker.name.charAt(0)}</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold">{broker.name}</h3>
                    <p className="text-sm text-zinc-400">{broker.description}</p>
                  </div>
                </div>
                
                {broker.status === 'available' ? (
                  <button 
                    onClick={() => handleConnect(broker.id)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium"
                    disabled={connecting}
                  >
                    {connecting && selectedBroker === broker.id ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    className="w-full py-3 bg-zinc-700 cursor-not-allowed rounded-lg font-medium opacity-70"
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Connect: Dhan</h2>
              <button 
                onClick={() => {
                  setShowCredentialsModal(false);
                  setCredentialsError(null);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-zinc-400 mb-6">
              Please enter your Dhan API credentials to continue. 
              These credentials will be securely stored in your account.
              You can find these in your Dhan developer account at <a href="https://developers.dhan.co" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">developers.dhan.co</a>.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="client-id" className="block text-sm font-medium text-zinc-300 mb-1">
                  Client ID
                </label>
                <input
                  id="client-id"
                  type="text"
                  value={credentials.clientId}
                  onChange={(e) => setCredentials({...credentials, clientId: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white"
                  placeholder="Enter your Dhan Client ID"
                />
                <p className="mt-1 text-xs text-zinc-500">Your unique application identifier from Dhan Developer Portal</p>
              </div>
              
              <div>
                <label htmlFor="client-secret" className="block text-sm font-medium text-zinc-300 mb-1">
                  Client Secret
                </label>
                <input
                  id="client-secret"
                  type="password"
                  value={credentials.clientSecret}
                  onChange={(e) => setCredentials({...credentials, clientSecret: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white"
                  placeholder="Enter your Dhan Client Secret"
                />
                <p className="mt-1 text-xs text-zinc-500">The secret key associated with your Client ID</p>
              </div>
              
              {credentialsError && (
                <div className="bg-red-900/20 text-red-400 p-3 rounded-lg text-sm">
                  {credentialsError}
                </div>
              )}
              
              <p className="mt-4 text-xs text-zinc-400">
                After saving your credentials, you'll be redirected to Dhan to authorize access to your trading account.
              </p>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowCredentialsModal(false);
                    setCredentialsError(null);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
                  disabled={connecting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCredentialSubmit}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm flex items-center"
                  disabled={connecting}
                >
                  {connecting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 