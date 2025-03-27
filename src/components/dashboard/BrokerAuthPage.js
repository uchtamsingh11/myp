'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

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
        const [savingCredentials, setSavingCredentials] = useState(false);
        const [removingBroker, setRemovingBroker] = useState(null);
        const { user } = useAuth();

        // State for brokers
        const [availableBrokers] = useState(AVAILABLE_BROKERS);
        const [savedBrokers, setSavedBrokers] = useState([]);

        useEffect(() => {
                // Fetch saved brokers when user changes
                if (user) {
                        fetchSavedBrokers();
                } else {
                        setLoading(false);
                }
        }, [user]);

        // Fetch saved brokers for the current user
        const fetchSavedBrokers = async () => {
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
                } catch (err) {
                        console.error('Error fetching saved brokers:', err);
                        setError('Failed to load your connected brokers. Please try again.');
                } finally {
                        setLoading(false);
                }
        };

        // Handle opening the credentials modal
        const handleOpenModal = broker => {
                setSelectedBroker(broker);

                // Initialize empty credentials object
                const initialCredentials = {};
                broker.fields.forEach(field => {
                        initialCredentials[field.name] = '';
                });

                setCredentials(initialCredentials);

                // Check if credentials already exist for this broker
                const existingBroker = savedBrokers.find(saved => saved.broker_id === broker.id);
                if (existingBroker && existingBroker.credentials) {
                        // For each field in the broker's fields, set the value from existingBroker if available
                        const storedCredentials = {};
                        broker.fields.forEach(field => {
                                if (existingBroker.credentials[field.name]) {
                                        // For password fields, don't show the actual value
                                        storedCredentials[field.name] = field.type === 'password'
                                                ? '' // Don't reveal stored passwords
                                                : existingBroker.credentials[field.name];
                                } else {
                                        storedCredentials[field.name] = '';
                                }
                        });

                        setCredentials(storedCredentials);
                }

                setIsModalOpen(true);
        };

        // Handle saving broker credentials
        const handleSaveBrokerCredentials = async () => {
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
                                p_credentials: credentials
                        });

                        if (error) {
                                throw new Error('Failed to save credentials: ' + error.message);
                        }

                        if (!data) {
                                throw new Error('Failed to save credentials. Please try again.');
                        }

                        // Success
                        toast.success(`${selectedBroker.name} credentials saved successfully!`);
                        setIsModalOpen(false);
                        fetchSavedBrokers();
                } catch (err) {
                        toast.error(err.message);
                        setError(err.message);
                } finally {
                        setSavingCredentials(false);
                }
        };

        // Handle removing saved broker credentials
        const handleRemoveBrokerCredentials = async savedBroker => {
                try {
                        setRemovingBroker(savedBroker.id);

                        if (!user) {
                                throw new Error('Authentication required to remove broker credentials');
                        }

                        // Call the Supabase function to delete the credentials
                        const { data, error } = await supabase.rpc('delete_broker_credentials_v2', {
                                p_broker_id: savedBroker.broker_id
                        });

                        if (error) {
                                throw new Error('Failed to remove credentials: ' + error.message);
                        }

                        if (!data) {
                                throw new Error('Failed to remove credentials. Please try again.');
                        }

                        // Success
                        toast.success(`${savedBroker.broker_name} credentials removed successfully!`);
                        fetchSavedBrokers();
                } catch (err) {
                        toast.error(err.message);
                        setError(err.message);
                } finally {
                        setRemovingBroker(null);
                }
        };

        // Toggle broker active state
        const toggleBrokerActive = async savedBroker => {
                try {
                        if (!user) {
                                throw new Error('Authentication required to update broker active state');
                        }

                        // Call the Supabase function to toggle the broker active state
                        const { data, error } = await supabase.rpc('toggle_broker_active_v2', {
                                p_broker_id: savedBroker.broker_id
                        });

                        if (error) {
                                throw new Error('Failed to update broker status: ' + error.message);
                        }

                        if (!data) {
                                throw new Error('Failed to update broker status. Please try again.');
                        }

                        // Success - refresh the list of saved brokers
                        toast.success(`${savedBroker.broker_name} status updated!`);
                        fetchSavedBrokers();
                } catch (err) {
                        toast.error(err.message);
                        setError(err.message);
                }
        };

        // Helper function to get filtered available brokers
        const getFilteredBrokers = () => {
                if (!searchTerm) return availableBrokers;

                return availableBrokers.filter(broker =>
                        broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        broker.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
        };

        // Helper function to check if a broker is already saved
        const isBrokerSaved = brokerId => {
                return savedBrokers.some(saved => saved.broker_id === brokerId);
        };

        // Render credential modal fields based on selected broker
        const renderCredentialFields = () => {
                if (!selectedBroker) return null;

                return (
                        <div className="space-y-4">
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
        };

        return (
                <div className="mx-auto bg-zinc-950 rounded-lg min-h-[500px]">
                        <div className="mb-6 pl-4 flex items-center">
                                <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-2 text-indigo-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                >
                                        <path
                                                fillRule="evenodd"
                                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                        />
                                </svg>
                                <span className="text-indigo-400 font-medium">Broker Authentication</span>
                        </div>

                        {error && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                                        <p className="text-sm">{error}</p>
                                        <button className="text-xs underline mt-1" onClick={() => setError(null)}>
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
                                                        <h2 className="text-xl font-semibold text-white">Connected Brokers</h2>
                                                        <div className="px-3 py-1 rounded-full text-sm font-medium text-indigo-200 bg-indigo-900/30 border border-indigo-800">
                                                                {savedBrokers.length} {savedBrokers.length === 1 ? 'broker' : 'brokers'} connected
                                                        </div>
                                                </div>

                                                {savedBrokers.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                                                                        className="bg-zinc-900 p-5 rounded-lg border border-zinc-800 hover:border-indigo-500 transition-all"
                                                                                >
                                                                                        <div className="flex justify-between items-start mb-3">
                                                                                                <div className="flex items-center">
                                                                                                        <span className="text-2xl mr-2">{brokerDetails.logo}</span>
                                                                                                        <div>
                                                                                                                <h3 className="text-lg font-medium text-white">{brokerDetails.name}</h3>
                                                                                                                <p className="text-xs text-gray-400">
                                                                                                                        {Object.keys(broker.credentials)[0] && broker.credentials[Object.keys(broker.credentials)[0]]}
                                                                                                                </p>
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
                                                                                                                const originalBroker = availableBrokers.find(
                                                                                                                        b => b.id === broker.broker_id
                                                                                                                );
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
                                                                <p className="text-gray-400 text-sm mb-4">
                                                                        You haven't connected any brokers yet. Connect a broker to get started.
                                                                </p>
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
                                                                        onChange={e => setSearchTerm(e.target.value)}
                                                                />
                                                                <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
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
                                                                                                        Already Connected
                                                                                                </button>
                                                                                        ) : (
                                                                                                <button
                                                                                                        onClick={() => handleOpenModal(broker)}
                                                                                                        className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md transition-all shadow-md hover:shadow-lg"
                                                                                                >
                                                                                                        Connect Broker
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

                                                <div className="p-5">{renderCredentialFields()}</div>

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