'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

// SVG Icons for brokers - replacing emojis for a more modern look
const BrokerIcons = {
  alice_blue: <svg className="w-7 h-7 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>,
  angel_broking: <svg className="w-7 h-7 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>,
  binance: <svg className="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16L6 10 7.4 8.6 12 13.2 16.6 8.6 18 10z"></path><path d="M12 8L6 14 7.4 15.4 12 10.8 16.6 15.4 18 14z"></path><path d="M13.5 5.5L12 4 10.5 5.5 12 7z"></path><path d="M13.5 18.5L12 20 10.5 18.5 12 17z"></path></svg>,
  default: <svg className="w-7 h-7 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21 17h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2zm-9-7a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h4a2 2 0 012 2v4zm6 0a2 2 0 01-2 2h-2a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v4zm-6 8a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4z"></path></svg>,
  flattrade: <svg className="w-7 h-7 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"></path></svg>
};

// Get broker icon, fall back to default if not found
const getBrokerIcon = (brokerId) => {
  return BrokerIcons[brokerId] || BrokerIcons.default;
};

// Static broker data
const AVAILABLE_BROKERS = [
  {
    id: 'alice_blue',
    name: 'Alice Blue',
    description: 'Online discount stock broker in India',
    status: 'available',
    logo: '🔷',
    fields: [
      { name: 'user_id', label: 'User ID', type: 'text' },
      { name: 'api_key', label: 'API Key', type: 'text' },
      { name: 'secret_key', label: 'Secret Key', type: 'password' }
    ]
  },
  {
    id: 'angel_broking',
    name: 'Angel Broking',
    description: 'Full-service stockbroker in India',
    status: 'available',
    logo: '👼',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'text' },
      { name: 'secret_key', label: 'Secret Key', type: 'password' }
    ]
  },
  {
    id: 'binance',
    name: 'Binance',
    description: 'World\'s leading cryptocurrency exchange',
    status: 'available',
    logo: '₿',
    fields: [
      { name: 'app_key', label: 'App Key', type: 'text' },
      { name: 'secret_key', label: 'Secret Key', type: 'password' }
    ]
  },
  {
    id: 'delta_exchange',
    name: 'Delta Exchange',
    description: 'Cryptocurrency derivatives exchange',
    status: 'available',
    logo: '📈',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'text' },
      { name: 'secret_key', label: 'Secret Key', type: 'password' }
    ]
  },
  {
    id: 'dhan',
    name: 'Dhan',
    description: 'Modern broker for option traders',
    status: 'available',
    logo: '📉',
    fields: [
      { name: 'client_id', label: 'Client ID', type: 'text' },
      { name: 'access_token', label: 'Access Token', type: 'password' }
    ]
  },
  {
    id: 'flattrade',
    name: 'Flattrade',
    description: 'Discount broker with advanced trading tools',
    status: 'available',
    logo: '📊',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'text' },
      { name: 'secret_key', label: 'Secret Key', type: 'password' },
      { name: 'tpin', label: 'TPIN', type: 'password' },
      { name: 'client_code', label: 'Client Code', type: 'text' }
    ]
  },
  {
    id: 'finvisia',
    name: 'Finvisia',
    description: 'Financial technology services provider',
    status: 'available',
    logo: '🏛️',
    fields: [
      { name: 'user_id', label: 'User ID', type: 'text' },
      { name: 'password', label: 'Password', type: 'password' },
      { name: 'vendor_code', label: 'Vendor Code', type: 'text' },
      { name: 'api_key', label: 'API Key', type: 'text' },
      { name: 'two_fa', label: '2FA', type: 'text' }
    ]
  },
  {
    id: 'fyers',
    name: 'Fyers',
    description: 'Online trading and investing platform',
    status: 'available',
    logo: '💹',
    fields: [
      { name: 'app_id', label: 'App ID', type: 'text' },
      { name: 'secret_id', label: 'Secret ID', type: 'password' }
    ]
  },
  {
    id: 'icici_direct',
    name: 'ICICI Direct',
    description: 'Financial services firm in India',
    status: 'available',
    logo: '🏦',
    fields: [
      { name: 'user_id', label: 'User ID', type: 'text' },
      { name: 'api_key', label: 'API Key', type: 'text' },
      { name: 'secret_key', label: 'Secret Key', type: 'password' },
      { name: 'dob', label: 'DOB', type: 'text' },
      { name: 'password', label: 'Password', type: 'password' }
    ]
  },
  {
    id: 'iifl',
    name: 'IIFL',
    description: 'Financial services company',
    status: 'available',
    logo: '🏢',
    fields: [
      { name: 'interactive_api_key', label: 'Interactive API Key', type: 'text' },
      { name: 'interactive_secret_key', label: 'Interactive Secret Key', type: 'password' },
      { name: 'market_api_key', label: 'Market API Key', type: 'text' },
      { name: 'market_secret_key', label: 'Market Secret Key', type: 'password' }
    ]
  },
  {
    id: 'kotak_neo',
    name: 'Kotak Neo',
    description: 'Online trading platform',
    status: 'available',
    logo: '🔸',
    fields: [
      { name: 'consumer_key', label: 'Consumer Key', type: 'text' },
      { name: 'secret_key', label: 'Secret Key', type: 'password' },
      { name: 'access_token', label: 'Access Token', type: 'password' },
      { name: 'mobile_number', label: 'Mobile Number', type: 'text' },
      { name: 'password', label: 'Password', type: 'password' },
      { name: 'mpin', label: 'MPIN', type: 'password' }
    ]
  },
  {
    id: 'metatrader4',
    name: 'MetaTrader 4',
    description: 'Trading platform for forex and CFDs',
    status: 'available',
    logo: '📊',
    fields: [
      { name: 'user_id', label: 'User ID', type: 'text' },
      { name: 'password', label: 'Password', type: 'password' },
      { name: 'host', label: 'Host', type: 'text' },
      { name: 'port', label: 'Port', type: 'text' }
    ]
  },
  {
    id: 'metatrader5',
    name: 'MetaTrader 5',
    description: 'Multi-asset trading platform',
    status: 'available',
    logo: '📶',
    fields: [
      { name: 'user_id', label: 'User ID', type: 'text' },
      { name: 'password', label: 'Password', type: 'password' },
      { name: 'host', label: 'Host', type: 'text' },
      { name: 'port', label: 'Port', type: 'text' }
    ]
  },
  {
    id: 'upstox',
    name: 'Upstox',
    description: 'Online discount broker',
    status: 'available',
    logo: '📱',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'text' },
      { name: 'app_secret_key', label: 'App Secret Key', type: 'password' },
      { name: 'access_token', label: 'Access Token', type: 'password' }
    ]
  },
  {
    id: 'zerodha',
    name: 'Zerodha',
    description: 'Discount brokerage firm in India',
    status: 'available',
    logo: '🟢',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'text' },
      { name: 'secret_key', label: 'Secret Key', type: 'password' }
    ]
  }
];

// Rest of brokers to be added in the second part 

export default function BrokerAuthPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [accountLabel, setAccountLabel] = useState('Primary Account');
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [removingBroker, setRemovingBroker] = useState(null);
  const { user } = useAuth();

  // State for brokers
  const [availableBrokers] = useState(AVAILABLE_BROKERS);
  const [savedBrokers, setSavedBrokers] = useState([]);

  // Track if initial data has been loaded
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Memoize fetch function to prevent recreating it on re-renders
  const fetchSavedBrokers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      // Call the Supabase function to get all saved broker credentials
      const { data, error } = await supabase.rpc('get_all_broker_credentials_v2');

      if (error) {
        throw new Error('Error fetching broker credentials: ' + error.message);
      }

      // Update state with saved brokers
      setSavedBrokers(data || []);
      setInitialDataLoaded(true);
    } catch (err) {
      console.error('Error fetching saved brokers:', err);
      setError('Failed to load your connected brokers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Function to reset component state
  const resetComponentState = () => {
    setLoading(true);
    setError(null);
    setInitialDataLoaded(false);
  };

  useEffect(() => {
    // Only fetch saved brokers when user changes or if initial data hasn't been loaded
    if (user && !initialDataLoaded) {
      fetchSavedBrokers();
    } else if (!user) {
      setLoading(false);
    } else {
      // If we already have the data, just ensure we're not in loading state
      setLoading(false);
    }
  }, [user, fetchSavedBrokers, initialDataLoaded]);

  // Handle saving broker credentials
  const handleSaveBrokerCredentials = useCallback(async () => {
    try {
      setSavingCredentials(true);
      setError(null);

      if (!user) {
        throw new Error('Authentication required to save broker credentials');
      }

      // Check if all required fields are filled
      const emptyFields = selectedBroker.fields
        .filter(field => !credentials[field.name])
        .map(field => field.label);

      if (emptyFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      }

      // Call the Supabase function to save the credentials
      const { data, error } = await supabase.rpc('save_broker_credentials_v2', {
        p_broker_id: selectedBroker.id,
        p_credentials: credentials,
        p_account_label: accountLabel
      });

      if (error) {
        throw new Error('Failed to save credentials: ' + error.message);
      }

      if (!data) {
        throw new Error('Failed to save credentials. Please try again.');
      }

      // If we're editing an existing broker, we need to update the state
      // If it's a new broker, we'll need to fetch to get the new ID from the server
      const isEditing = savedBrokers.some(broker =>
        broker.broker_id === selectedBroker.id && broker.account_label === accountLabel
      );

      if (isEditing) {
        // Update existing broker in local state
        setSavedBrokers(prevBrokers =>
          prevBrokers.map(broker => {
            if (broker.broker_id === selectedBroker.id && broker.account_label === accountLabel) {
              return {
                ...broker,
                credentials,
                account_label: accountLabel
              };
            }
            return broker;
          })
        );
      } else {
        // New broker - need to fetch to get the assigned ID
        resetComponentState();
      }

      // Success
      toast.success(`${selectedBroker.name} credentials saved successfully!`);
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setSavingCredentials(false);
    }
  }, [user, selectedBroker, credentials, accountLabel, savedBrokers, resetComponentState]);

  // Handle removing saved broker credentials
  const handleRemoveBrokerCredentials = useCallback(async savedBroker => {
    try {
      setRemovingBroker(savedBroker.id);

      if (!user) {
        throw new Error('Authentication required to remove broker credentials');
      }

      // Call the Supabase function to delete the credentials
      const { data, error } = await supabase.rpc('delete_broker_credentials_v2', {
        p_broker_id: savedBroker.broker_id,
        p_account_label: savedBroker.account_label
      });

      if (error) {
        throw new Error('Failed to remove credentials: ' + error.message);
      }

      if (!data) {
        throw new Error('Failed to remove credentials. Please try again.');
      }

      // Success
      toast.success(`${savedBroker.broker_name} credentials removed successfully!`);
      // Reset component state to trigger a fresh data fetch
      resetComponentState();
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setRemovingBroker(null);
    }
  }, [user, resetComponentState]);

  // Toggle broker active state
  const toggleBrokerActive = useCallback(async savedBroker => {
    try {
      if (!user) {
        throw new Error('Authentication required to update broker active state');
      }

      // Call the Supabase function to toggle the broker active state
      const { data, error } = await supabase.rpc('toggle_broker_active_v2', {
        p_broker_id: savedBroker.broker_id,
        p_account_label: savedBroker.account_label
      });

      if (error) {
        throw new Error('Failed to update broker status: ' + error.message);
      }

      if (!data) {
        throw new Error('Failed to update broker status. Please try again.');
      }

      // Success toast notification
      toast.success(`${savedBroker.broker_name} status updated!`);

      // Reset component state to trigger a fresh data fetch
      resetComponentState();
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    }
  }, [user, resetComponentState]);

  // Helper function to get filtered available brokers
  const getFilteredBrokers = useMemo(() => {
    if (!searchTerm) return availableBrokers;

    return availableBrokers.filter(broker =>
      broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableBrokers, searchTerm]);

  // Helper function to handle opening the modal - memoized to prevent recreating on re-renders
  const handleOpenModal = useCallback((broker, existingAccount = null) => {
    setSelectedBroker(broker);

    // Initialize empty credentials object
    const initialCredentials = {};
    broker.fields.forEach(field => {
      initialCredentials[field.name] = '';
    });

    setCredentials(initialCredentials);

    // Set account label if editing an existing account
    if (existingAccount) {
      setAccountLabel(existingAccount.account_label);

      // For each field in the broker's fields, set the value from existingAccount if available
      const storedCredentials = {};
      broker.fields.forEach(field => {
        if (existingAccount.credentials[field.name]) {
          // For password fields, don't show the actual value
          storedCredentials[field.name] = field.type === 'password'
            ? '' // Don't reveal stored passwords
            : existingAccount.credentials[field.name];
        } else {
          storedCredentials[field.name] = '';
        }
      });

      setCredentials(storedCredentials);
    } else {
      // Reset account label when adding a new account
      setAccountLabel('Primary Account');
    }

    setIsModalOpen(true);
  }, []);

  // Helper function to check if a broker is already saved
  const isBrokerSaved = useCallback(brokerId => {
    return savedBrokers.some(saved => saved.broker_id === brokerId);
  }, [savedBrokers]);

  // Helper function to get the count of accounts for a broker
  const getBrokerAccountCount = useCallback(brokerId => {
    return savedBrokers.filter(saved => saved.broker_id === brokerId).length;
  }, [savedBrokers]);

  // Render credential modal fields based on selected broker
  const renderCredentialFields = useCallback(() => {
    if (!selectedBroker) return null;

    return (
      <div className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Account Label
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
            value={accountLabel}
            onChange={e => setAccountLabel(e.target.value)}
            placeholder="Enter a name for this account"
          />
        </div>
        {selectedBroker.fields.map(field => (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              value={credentials[field.name] || ''}
              onChange={e => setCredentials({ ...credentials, [field.name]: e.target.value })}
              placeholder={`Enter ${field.label}`}
            />
          </div>
        ))}
      </div>
    );
  }, [selectedBroker, accountLabel, credentials]);

  return (
    <div className="mx-auto p-6 bg-gradient-to-b from-zinc-950 to-zinc-900 rounded-xl shadow-xl">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={resetComponentState}
              className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Retry Loading
            </button>
            <button className="text-xs underline" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-96 flex justify-center items-center">
          <div className="relative">
            <div className="w-14 h-14 rounded-full absolute border-4 border-solid border-zinc-800"></div>
            <div className="w-14 h-14 rounded-full animate-spin absolute border-4 border-solid border-indigo-500 border-t-transparent shadow-lg"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Saved Brokers Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                Connected Brokers
              </h2>
              <div className="px-3 py-1.5 rounded-full text-sm font-medium text-indigo-200 bg-indigo-900/40 border border-indigo-800/50 flex items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2 animate-pulse"></span>
                {savedBrokers.length} {savedBrokers.length === 1 ? 'broker' : 'brokers'} connected
              </div>
            </div>

            {savedBrokers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savedBrokers.map(broker => {
                  // Find broker details from available brokers
                  const brokerDetails = availableBrokers.find(b => b.id === broker.broker_id) || {
                    name: broker.broker_name || broker.broker_id,
                    logo: '🔌',
                    description: 'Broker connection',
                  };

                  return (
                    <motion.div
                      key={broker.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-4 rounded-xl border border-zinc-800/50 hover:border-indigo-500/50 shadow-lg hover:shadow-indigo-500/10 transition-all relative flex flex-col h-60"
                    >
                      {/* Toggle switch in top-right */}
                      <div className="absolute top-3 right-4">
                        <button
                          onClick={() => toggleBrokerActive(broker)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${broker.is_active ? 'bg-indigo-500' : 'bg-gray-700'}`}
                          role="switch"
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${broker.is_active ? 'translate-x-5' : 'translate-x-0'}`}
                          ></span>
                        </button>
                      </div>

                      <div className="flex items-start mb-5">
                        <div className="mr-4 p-2.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                          {getBrokerIcon(broker.broker_id)}
                        </div>
                        <div>
                          <h3 className="text-xl font-medium text-white">{brokerDetails.name}</h3>
                          <p className="text-sm text-indigo-300 font-medium mt-1">
                            {broker.account_label || 'Primary Account'}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-auto">
                        <button
                          onClick={() => {
                            // Find the original broker from available brokers
                            const originalBroker = availableBrokers.find(
                              b => b.id === broker.broker_id
                            );
                            if (originalBroker) {
                              handleOpenModal(originalBroker, broker);
                            }
                          }}
                          className="flex-1 py-2 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveBrokerCredentials(broker)}
                          disabled={removingBroker === broker.id}
                          className="flex-1 py-2 px-3 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-red-600 hover:to-red-700 text-white text-sm rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
                        >
                          {removingBroker === broker.id ? (
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </>
                          )}
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
                className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-xl border border-zinc-800/50 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-medium mb-2">No Brokers Connected</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                  You haven't connected any brokers yet. Connect a broker below to start trading or managing your investments.
                </p>
                <div className="flex justify-center">
                  <a href="#available-brokers" className="py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm rounded-lg transition-all shadow-md hover:shadow-lg inline-flex items-center font-medium">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Connect a Broker
                  </a>
                </div>
              </motion.div>
            )}
          </section>

          {/* Available Brokers Section */}
          <section id="available-brokers">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Available Brokers
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search brokers..."
                  className="py-2 px-4 pr-10 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent shadow-inner transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getFilteredBrokers.map(broker => (
                <motion.div
                  key={broker.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-4 rounded-xl border border-zinc-800/50 hover:border-indigo-500/50 shadow-lg hover:shadow-indigo-500/10 transition-all relative flex flex-col h-60"
                >
                  {/* Display accounts connected badge if applicable */}
                  {isBrokerSaved(broker.id) && (
                    <div className="absolute top-3 right-4 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs text-indigo-300 flex items-center">
                      <svg className="w-3 h-3 mr-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{getBrokerAccountCount(broker.id)} account{getBrokerAccountCount(broker.id) !== 1 ? 's' : ''}</span>
                    </div>
                  )}

                  <div className="flex items-start mb-5">
                    <div className="mr-4 p-2.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      {getBrokerIcon(broker.id)}
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-white">{broker.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{broker.description}</p>
                    </div>
                  </div>

                  {broker.status === 'available' ? (
                    <div className="mt-auto">
                      {isBrokerSaved(broker.id) ? (
                        <button
                          onClick={() => handleOpenModal(broker)}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Another Account
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenModal(broker)}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center font-medium"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Connect Broker
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-auto">
                      <button
                        className="w-full py-2.5 px-4 bg-zinc-700/50 text-zinc-400 text-sm rounded-lg cursor-not-allowed border border-zinc-600/30 flex items-center justify-center"
                        disabled
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
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
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl shadow-2xl max-w-md w-full border border-zinc-700/50"
            >
              <div className="p-6 border-b border-zinc-700/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {selectedBroker && (
                      <div className="mr-3 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        {getBrokerIcon(selectedBroker.id)}
                      </div>
                    )}
                    <h3 className="text-xl font-medium text-white">
                      {selectedBroker?.name} Credentials
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-lg p-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-5">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Label
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                      value={accountLabel}
                      onChange={e => setAccountLabel(e.target.value)}
                      placeholder="Enter a name for this account"
                    />
                  </div>
                  {selectedBroker && selectedBroker.fields.map(field => (
                    <div key={field.name} className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {field.label}
                      </label>
                      <div className="relative">
                        <input
                          type={field.type}
                          className="w-full p-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent pr-10"
                          value={credentials[field.name] || ''}
                          onChange={e => setCredentials({ ...credentials, [field.name]: e.target.value })}
                          placeholder={`Enter ${field.label}`}
                        />
                        {field.type === 'password' && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-zinc-700/50 flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBrokerCredentials}
                  disabled={savingCredentials}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center"
                >
                  {savingCredentials ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Credentials
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 