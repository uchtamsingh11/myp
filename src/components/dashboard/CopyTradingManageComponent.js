'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusIcon, X, Trash2, PauseCircle, PlayCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// SVG Icons for brokers
const BrokerIcons = {
  alice_blue: <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>,
  angel_broking: <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>,
  binance: <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16L6 10 7.4 8.6 12 13.2 16.6 8.6 18 10z"></path><path d="M12 8L6 14 7.4 15.4 12 10.8 16.6 15.4 18 14z"></path><path d="M13.5 5.5L12 4 10.5 5.5 12 7z"></path><path d="M13.5 18.5L12 20 10.5 18.5 12 17z"></path></svg>,
  default: <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21 17h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2zm-9-7a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h4a2 2 0 012 2v4zm6 0a2 2 0 01-2 2h-2a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v4zm-6 8a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4z"></path></svg>,
  zerodha: <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>,
};

// Get broker icon, fall back to default if not found
const getBrokerIcon = (brokerId) => {
  return BrokerIcons[brokerId?.toLowerCase()] || BrokerIcons.default;
};

// Broker name mapping
const brokerNameMapping = {
  alice_blue: 'Alice Blue',
  angel_broking: 'Angel Broking',
  binance: 'Binance',
  zerodha: 'Zerodha',
  delta_exchange: 'Delta Exchange',
  dhan: 'Dhan',
  finvisia: 'Finvisia',
  fyers: 'Fyers',
  icici_direct: 'ICICI Direct',
  iifl: 'IIFL',
  kotak_neo: 'Kotak Neo',
  metatrader4: 'MetaTrader 4',
  metatrader5: 'MetaTrader 5',
  upstox: 'Upstox',
};

const CopyTradingManageComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [savedBrokers, setSavedBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrokers, setSelectedBrokers] = useState([]);
  const [selectedChildBrokers, setSelectedChildBrokers] = useState([]);
  const [isPaused, setIsPaused] = useState({});
  const [isChildPaused, setIsChildPaused] = useState({});
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchSavedBrokers();
    
    // Load selected brokers from localStorage
    const savedSelectedBrokers = localStorage.getItem('copyTradingSelectedBrokers');
    const savedIsPaused = localStorage.getItem('copyTradingIsPaused');
    
    if (savedSelectedBrokers) {
      try {
        setSelectedBrokers(JSON.parse(savedSelectedBrokers));
        if (savedIsPaused) {
          setIsPaused(JSON.parse(savedIsPaused));
        }
      } catch (error) {
        console.error('Error loading saved brokers:', error);
        localStorage.removeItem('copyTradingSelectedBrokers');
        localStorage.removeItem('copyTradingIsPaused');
      }
    }
    
    // Load selected child brokers from localStorage
    const savedSelectedChildBrokers = localStorage.getItem('copyTradingSelectedChildBrokers');
    const savedIsChildPaused = localStorage.getItem('copyTradingIsChildPaused');
    
    if (savedSelectedChildBrokers) {
      try {
        setSelectedChildBrokers(JSON.parse(savedSelectedChildBrokers));
        if (savedIsChildPaused) {
          setIsChildPaused(JSON.parse(savedIsChildPaused));
        }
      } catch (error) {
        console.error('Error loading saved child brokers:', error);
        localStorage.removeItem('copyTradingSelectedChildBrokers');
        localStorage.removeItem('copyTradingIsChildPaused');
      }
    }
  }, []);

  const fetchSavedBrokers = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('broker_credentials')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        setSavedBrokers(data || []);
      }
    } catch (error) {
      console.error('Error fetching saved brokers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  
  const toggleChildModal = () => {
    setIsChildModalOpen(!isChildModalOpen);
  };

  const handleSelectBroker = (broker) => {
    // Check if broker is already selected
    if (selectedBrokers.some(b => b.id === broker.id)) {
      return; // Broker already selected
    }
    
    const updatedBrokers = [...selectedBrokers, broker];
    setSelectedBrokers(updatedBrokers);
    
    // Set initial paused state for the broker
    setIsPaused(prev => ({
      ...prev,
      [broker.id]: true
    }));
    
    // Save to localStorage
    localStorage.setItem('copyTradingSelectedBrokers', JSON.stringify(updatedBrokers));
    localStorage.setItem('copyTradingIsPaused', JSON.stringify({
      ...isPaused,
      [broker.id]: true
    }));
    
    toggleModal();
  };

  const handleSelectChildBroker = (broker) => {
    // Check if broker is already selected
    if (selectedChildBrokers.some(b => b.id === broker.id)) {
      return; // Broker already selected
    }
    
    const updatedBrokers = [...selectedChildBrokers, broker];
    setSelectedChildBrokers(updatedBrokers);
    
    // Set initial paused state for the broker
    setIsChildPaused(prev => ({
      ...prev,
      [broker.id]: true
    }));
    
    // Save to localStorage
    localStorage.setItem('copyTradingSelectedChildBrokers', JSON.stringify(updatedBrokers));
    localStorage.setItem('copyTradingIsChildPaused', JSON.stringify({
      ...isChildPaused,
      [broker.id]: true
    }));
    
    toggleChildModal();
  };

  const handleDeleteBroker = (brokerId) => {
    const updatedBrokers = selectedBrokers.filter(broker => broker.id !== brokerId);
    setSelectedBrokers(updatedBrokers);
    
    // Update paused state
    const updatedPausedState = { ...isPaused };
    delete updatedPausedState[brokerId];
    setIsPaused(updatedPausedState);
    
    // Save to localStorage
    localStorage.setItem('copyTradingSelectedBrokers', JSON.stringify(updatedBrokers));
    localStorage.setItem('copyTradingIsPaused', JSON.stringify(updatedPausedState));
  };

  const handleDeleteChildBroker = (brokerId) => {
    const updatedBrokers = selectedChildBrokers.filter(broker => broker.id !== brokerId);
    setSelectedChildBrokers(updatedBrokers);
    
    // Update paused state
    const updatedPausedState = { ...isChildPaused };
    delete updatedPausedState[brokerId];
    setIsChildPaused(updatedPausedState);
    
    // Save to localStorage
    localStorage.setItem('copyTradingSelectedChildBrokers', JSON.stringify(updatedBrokers));
    localStorage.setItem('copyTradingIsChildPaused', JSON.stringify(updatedPausedState));
  };

  const togglePauseResume = (brokerId) => {
    const newPausedState = !isPaused[brokerId];
    const updatedPausedState = {
      ...isPaused,
      [brokerId]: newPausedState
    };
    
    setIsPaused(updatedPausedState);
    localStorage.setItem('copyTradingIsPaused', JSON.stringify(updatedPausedState));
  };

  const toggleChildPauseResume = (brokerId) => {
    const newPausedState = !isChildPaused[brokerId];
    const updatedPausedState = {
      ...isChildPaused,
      [brokerId]: newPausedState
    };
    
    setIsChildPaused(updatedPausedState);
    localStorage.setItem('copyTradingIsChildPaused', JSON.stringify(updatedPausedState));
  };

  const getBrokerName = (brokerId) => {
    return brokerNameMapping[brokerId?.toLowerCase()] || brokerId;
  };

  // Show loading if everything is loading for the first time
  if (loading && selectedBrokers.length === 0 && selectedChildBrokers.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const availableBrokers = savedBrokers.filter(
    broker => !selectedBrokers.some(selected => selected.id === broker.id)
  );
  
  const availableChildBrokers = savedBrokers.filter(
    broker => !selectedChildBrokers.some(selected => selected.id === broker.id)
  );

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">
          Copy Trading: Select Parent Account
        </h2>
        
        <div className="mt-6 flex flex-wrap gap-6">
          {/* Display selected brokers */}
          {selectedBrokers.map(broker => (
            <div 
              key={broker.id}
              className="w-48 h-48 bg-zinc-800 rounded-lg overflow-hidden relative group"
            >
              {/* Broker content */}
              <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3">
                  {getBrokerIcon(broker.broker_id)}
                </div>
                <span className="font-medium text-center">{getBrokerName(broker.broker_id)}</span>
                <p className="text-sm text-zinc-400 text-center mt-1">{broker.account_label || 'Primary Account'}</p>
                
                {/* Status indicator */}
                <div className="mt-2 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isPaused[broker.id] ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                  <span className="text-xs">{isPaused[broker.id] ? 'Paused' : 'Active'}</span>
                </div>
              </div>
              
              {/* Hover actions overlay */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  onClick={() => togglePauseResume(broker.id)}
                  className="p-2 bg-zinc-700 rounded-full hover:bg-zinc-600 transition-colors"
                  title={isPaused[broker.id] ? "Resume" : "Pause"}
                >
                  {isPaused[broker.id] ? (
                    <PlayCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <PauseCircle className="w-6 h-6 text-yellow-400" />
                  )}
                </button>
                <button 
                  onClick={() => handleDeleteBroker(broker.id)}
                  className="p-2 bg-zinc-700 rounded-full hover:bg-red-900 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-6 h-6 text-red-400" />
                </button>
              </div>
            </div>
          ))}
          
          {/* Add button */}
          <div 
            className="w-48 h-48 border-2 border-dashed border-zinc-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-800/30 transition-colors"
            onClick={toggleModal}
          >
            <PlusIcon className="w-12 h-12 text-zinc-400" />
          </div>
        </div>

        {/* Child Accounts Section */}
        <h2 className="text-2xl font-bold mb-6 mt-12">
          Select Child Accounts
        </h2>
        
        <div className="mt-6 flex flex-wrap gap-6">
          {/* Display selected child brokers - Same structure as parent brokers */}
          {selectedChildBrokers.map(broker => (
            <div 
              key={`child-${broker.id}`}
              className="w-48 h-48 bg-zinc-800 rounded-lg overflow-hidden relative group"
            >
              {/* Broker content */}
              <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3">
                  {getBrokerIcon(broker.broker_id)}
                </div>
                <span className="font-medium text-center">{getBrokerName(broker.broker_id)}</span>
                <p className="text-sm text-zinc-400 text-center mt-1">{broker.account_label || 'Primary Account'}</p>
                
                {/* Status indicator */}
                <div className="mt-2 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isChildPaused[broker.id] ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                  <span className="text-xs">{isChildPaused[broker.id] ? 'Paused' : 'Active'}</span>
                </div>
              </div>
              
              {/* Hover actions overlay */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  onClick={() => toggleChildPauseResume(broker.id)}
                  className="p-2 bg-zinc-700 rounded-full hover:bg-zinc-600 transition-colors"
                  title={isChildPaused[broker.id] ? "Resume" : "Pause"}
                >
                  {isChildPaused[broker.id] ? (
                    <PlayCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <PauseCircle className="w-6 h-6 text-yellow-400" />
                  )}
                </button>
                <button 
                  onClick={() => handleDeleteChildBroker(broker.id)}
                  className="p-2 bg-zinc-700 rounded-full hover:bg-red-900 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-6 h-6 text-red-400" />
                </button>
              </div>
            </div>
          ))}
          
          {/* Add button for child account */}
          <div 
            className="w-48 h-48 border-2 border-dashed border-zinc-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-800/30 transition-colors"
            onClick={toggleChildModal}
          >
            <PlusIcon className="w-12 h-12 text-zinc-400" />
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Select a broker</h3>
                <button 
                  onClick={toggleModal}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {availableBrokers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-zinc-400 mb-4">No available brokers found.</p>
                  <p className="text-sm text-zinc-500">
                    Please add a broker in your account settings first.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {availableBrokers.map(broker => (
                    <div 
                      key={broker.id}
                      onClick={() => handleSelectBroker(broker)}
                      className="flex items-center p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4">
                        {getBrokerIcon(broker.broker_id)}
                      </div>
                      <div>
                        <div className="font-medium">{getBrokerName(broker.broker_id)}</div>
                        <div className="text-sm text-zinc-400">{broker.account_label || 'Primary Account'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={toggleModal}
                  className="px-4 py-2 text-zinc-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CopyTradingManageComponent;
