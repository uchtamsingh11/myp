'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '../../../src/utils/supabase';

export default function BrokerAuthComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [connectedBrokers, setConnectedBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchConnectedBrokers = async () => {
      try {
        setLoading(true);
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError('You must be logged in to view connected brokers');
          setLoading(false);
          return;
        }
        
        // Initialize an empty connected brokers list
        const connectedBrokersList = [];
        
        // Set connected brokers
        setConnectedBrokers(connectedBrokersList);
        
        // Check URL parameters for status and errors
        const broker = searchParams?.get('broker');
        const status = searchParams?.get('status');
        const error = searchParams?.get('error');
        
        if (error) {
          setError(`Connection error: ${error}`);
        } else if (broker && connectedBrokersList.some(b => b.broker === broker)) {
          // Only select broker if it exists in connected brokers
          setSelectedBroker(broker);
        } else if (connectedBrokersList.length > 0) {
          // If there are connected brokers, select the first one
          setSelectedBroker(connectedBrokersList[0].broker);
        } else {
          // Clear selected broker if no brokers are connected
          setSelectedBroker(null);
        }
      } catch (err) {
        console.error('Error fetching connected brokers:', err);
        setError('Failed to load connected brokers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConnectedBrokers();
  }, [searchParams]);
  
  const handleChooseBroker = () => {
    router.push('/dashboard/choose-broker');
  };
  
  const handleSelectBroker = (broker) => {
    setSelectedBroker(broker);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-200 max-w-lg mx-auto">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p>{error}</p>
        <button 
          onClick={() => setError(null)} 
          className="mt-3 px-4 py-2 bg-red-800 hover:bg-red-700 rounded-lg text-sm"
        >
          Dismiss
        </button>
      </div>
    );
  }
  
  // Render broker-specific component
  const renderBrokerComponent = () => {
    if (!selectedBroker || connectedBrokers.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-zinc-400">Please connect a broker to get started.</p>
          <button 
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
            onClick={handleChooseBroker}
          >
            Connect New Broker
          </button>
        </div>
      );
    }
    
    switch (selectedBroker) {
      case 'dhan':
        return (
          <div className="text-center py-8">
            <p className="text-zinc-400">Dhan implementation is currently unavailable.</p>
            <button 
              className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
              onClick={handleChooseBroker}
            >
              Choose Another Broker
            </button>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-zinc-400">Please select a broker from the sidebar or connect a new one.</p>
          </div>
        );
    }
  };
  
  return (
    <div className="pt-2 pb-8">
      <h2 className="text-2xl font-bold mb-8 text-left pl-2">Broker Authentication</h2>
      
      {/* Connected brokers and "Add new" button */}
      <div className="flex flex-wrap gap-4 mb-8 px-2">
        {/* Connected broker buttons */}
        {connectedBrokers.map((connection) => (
          <button
            key={connection.id}
            onClick={() => handleSelectBroker(connection.broker)}
            className={`px-4 py-2 rounded-lg text-sm flex items-center ${
              selectedBroker === connection.broker 
                ? 'bg-indigo-600 text-white' 
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <span>{connection.broker.charAt(0).toUpperCase() + connection.broker.slice(1)}</span>
            {selectedBroker === connection.broker && (
              <div className="w-2 h-2 rounded-full bg-red-400 ml-2"></div>
            )}
          </button>
        ))}
        
        {/* Add new broker button */}
        <button 
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm flex items-center"
          onClick={handleChooseBroker}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Connect New Broker
        </button>
      </div>
      
      {/* Broker-specific component */}
      <div className="px-2">
        {renderBrokerComponent()}
      </div>
    </div>
  );
} 