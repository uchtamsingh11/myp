'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../../utils/supabase';

// Client component that uses useSearchParams
const ChooseBrokerContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentials, setCredentials] = useState({
    clientId: '',
    clientSecret: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needApiSecret, setNeedApiSecret] = useState(false);
  const [preservedAuthCode, setPreservedAuthCode] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    document.title = 'Choose a Broker | AlgoZ';
  }, []);

  useEffect(() => {
    const checkUrlParams = async () => {
      // Check for auth_code or authCode in URL params
      const authCode = searchParams.get('auth_code') || searchParams.get('authCode');
      const needSecret = searchParams.get('needSecret') === 'true';
      const appId = searchParams.get('client_id') || searchParams.get('appId');
      const error = searchParams.get('error');

      if (error) {
        setAuthError(error);
        toast.error(`Authentication error: ${error}`);
      }

      if (authCode) {
        console.log('Found auth code in URL:', authCode);
        setPreservedAuthCode(authCode);
        setSelectedBroker('fyers'); // Set selected broker to Fyers

        if (appId) {
          console.log('Found app ID in URL:', appId);
          setCredentials(prev => ({ ...prev, clientId: appId }));
        }

        // If we received auth code directly from Fyers, we need API secret
        if (needSecret) {
          setNeedApiSecret(true);
          setShowCredentialsModal(true); // Automatically show the credentials modal
          toast.success('Authentication in progress. Please enter your API secret to complete.');
        }
      }
    };

    checkUrlParams();
  }, [searchParams]);

  const handleConnect = async brokerId => {
    setSelectedBroker(brokerId);

    if (brokerId === 'dhan' || brokerId === 'fyers') {
      setCredentials({
        clientId: '',
        clientSecret: '',
      });
      setShowCredentialsModal(true);
      return;
    }

    alert(`Integration with ${brokerId} is coming soon!`);
  };

  // Rest of your component implementation

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />

      <h1 className="text-2xl font-bold mb-6">Connect Your Broker</h1>

      {authError && (
        <div className="mb-6 p-4 bg-red-800/30 border border-red-700 rounded-lg text-white">
          <h3 className="font-bold text-lg mb-2">Authentication Error</h3>
          <p>{authError}</p>
          <p className="mt-2">
            Please try connecting again or contact support if the issue persists.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fyers */}
        <div
          className={`p-6 rounded-xl border ${selectedBroker === 'fyers' ? 'border-indigo-500 bg-indigo-900/20' : 'border-zinc-700 bg-zinc-800/50'} cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-900/10`}
          onClick={() => handleConnect('fyers')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Fyers</h2>
            <div className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/50 text-green-400 border border-green-800">
              Available
            </div>
          </div>
          <p className="text-zinc-300 mb-4">
            Connect your Fyers account to automate your trading strategies.
          </p>
          <button className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg font-medium text-white">
            Connect Fyers
          </button>
        </div>

        {/* Dhan */}
        <div
          className={`p-6 rounded-xl border ${selectedBroker === 'dhan' ? 'border-indigo-500 bg-indigo-900/20' : 'border-zinc-700 bg-zinc-800/50'} cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-900/10`}
          onClick={() => handleConnect('dhan')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Dhan</h2>
            <div className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/50 text-green-400 border border-green-800">
              Available
            </div>
          </div>
          <p className="text-zinc-300 mb-4">
            Connect your Dhan account to automate your trading strategies.
          </p>
          <button className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg font-medium text-white">
            Connect Dhan
          </button>
        </div>

        {/* Zerodha */}
        <div className="p-6 rounded-xl border border-zinc-700 bg-zinc-800/50 cursor-pointer transition-all hover:border-zinc-500 hover:bg-zinc-700/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Zerodha</h2>
            <div className="px-2 py-1 text-xs font-medium rounded-full bg-zinc-700 text-zinc-300 border border-zinc-600">
              Coming Soon
            </div>
          </div>
          <p className="text-zinc-300 mb-4">
            Connect your Zerodha account to automate your trading strategies.
          </p>
          <button className="w-full py-2 px-4 bg-zinc-700 cursor-not-allowed opacity-70 rounded-lg font-medium text-white">
            Coming Soon
          </button>
        </div>

        {/* Upstox */}
        <div className="p-6 rounded-xl border border-zinc-700 bg-zinc-800/50 cursor-pointer transition-all hover:border-zinc-500 hover:bg-zinc-700/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upstox</h2>
            <div className="px-2 py-1 text-xs font-medium rounded-full bg-zinc-700 text-zinc-300 border border-zinc-600">
              Coming Soon
            </div>
          </div>
          <p className="text-zinc-300 mb-4">
            Connect your Upstox account to automate your trading strategies.
          </p>
          <button className="w-full py-2 px-4 bg-zinc-700 cursor-not-allowed opacity-70 rounded-lg font-medium text-white">
            Coming Soon
          </button>
        </div>

        {/* Angel One */}
        <div className="p-6 rounded-xl border border-zinc-700 bg-zinc-800/50 cursor-pointer transition-all hover:border-zinc-500 hover:bg-zinc-700/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Angel One</h2>
            <div className="px-2 py-1 text-xs font-medium rounded-full bg-zinc-700 text-zinc-300 border border-zinc-600">
              Coming Soon
            </div>
          </div>
          <p className="text-zinc-300 mb-4">
            Connect your Angel One account to automate your trading strategies.
          </p>
          <button className="w-full py-2 px-4 bg-zinc-700 cursor-not-allowed opacity-70 rounded-lg font-medium text-white">
            Coming Soon
          </button>
        </div>
      </div>

      {/* Add credentials modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 rounded-xl border border-zinc-700 p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4">
              {needApiSecret
                ? 'Enter API Secret'
                : `Connect ${selectedBroker.charAt(0).toUpperCase() + selectedBroker.slice(1)}`}
            </h2>

            <form
              onSubmit={async e => {
                e.preventDefault();

                if (!credentials.clientId || (!needApiSecret && !credentials.clientSecret)) {
                  toast.error('Please fill in all fields');
                  return;
                }

                setLoading(true);
                setError(null);

                try {
                  // Existing auth flow
                } catch (error) {
                  console.error('Error connecting broker:', error);
                  setError(error.message || 'Failed to connect broker');
                  toast.error(error.message || 'Failed to connect broker');
                } finally {
                  setLoading(false);
                }
              }}
            >
              {!needApiSecret && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">API Key / Client ID</label>
                  <input
                    type="text"
                    value={credentials.clientId}
                    onChange={e => setCredentials({ ...credentials, clientId: e.target.value })}
                    className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
                    placeholder="Enter your API key"
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  {needApiSecret ? 'API Secret' : 'API Secret / Client Secret'}
                </label>
                <input
                  type="password"
                  value={credentials.clientSecret}
                  onChange={e => setCredentials({ ...credentials, clientSecret: e.target.value })}
                  className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
                  placeholder="Enter your API secret"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCredentialsModal(false);
                    setNeedApiSecret(false);
                  }}
                  className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 transition-colors text-white"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors text-white flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Main component with Suspense boundary
export default function ChooseBrokerPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Connect Your Broker</h1>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      }
    >
      <ChooseBrokerContent />
    </Suspense>
  );
}
