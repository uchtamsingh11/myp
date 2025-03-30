'use client';

import { useState, useEffect } from 'react';
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

export default function ScalpingToolManageComponent() {
  // Broker selection state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedBrokers, setSavedBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Load data when component mounts
  useEffect(() => {
    fetchSavedBrokers();
    
    // Load selected broker from localStorage
    const savedSelectedBroker = localStorage.getItem('scalpingToolSelectedBroker');
    const savedIsPaused = localStorage.getItem('scalpingToolIsPaused');
    
    if (savedSelectedBroker) {
      try {
        setSelectedBroker(JSON.parse(savedSelectedBroker));
        if (savedIsPaused) {
          setIsPaused(savedIsPaused === 'true');
        }
      } catch (error) {
        console.error('Error loading saved broker:', error);
        localStorage.removeItem('scalpingToolSelectedBroker');
        localStorage.removeItem('scalpingToolIsPaused');
      }
    }
  }, []);

  // Fetch user's saved brokers
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

  // Toggle broker selection modal
  const toggleModal = () => {
    if (selectedBroker) {
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 8000);
      return;
    }
    setIsModalOpen(!isModalOpen);
  };

  // Navigate to copy trading
  const navigateToCopyTrading = () => {
    router.push('/dashboard/copy-trading');
    setShowNotification(false);
  };

  // Handle broker selection
  const handleSelectBroker = (broker) => {
    setSelectedBroker(broker);
    setIsPaused(true);
    // Save selected broker to localStorage
    localStorage.setItem('scalpingToolSelectedBroker', JSON.stringify(broker));
    localStorage.setItem('scalpingToolIsPaused', 'true');
    toggleModal();
  };

  // Handle broker deletion
  const handleDeleteBroker = () => {
    setSelectedBroker(null);
    setIsPaused(false);
    // Remove from localStorage
    localStorage.removeItem('scalpingToolSelectedBroker');
    localStorage.removeItem('scalpingToolIsPaused');
  };

  // Toggle broker pause/resume
  const togglePauseResume = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    // Update paused state in localStorage
    localStorage.setItem('scalpingToolIsPaused', newPausedState.toString());
  };

  // Get broker name from mapping
  const getBrokerName = (brokerId) => {
    return brokerNameMapping[brokerId?.toLowerCase()] || brokerId;
  };

  // Show loading if everything is loading for the first time
  if (loading && !selectedBroker) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">
          Scalping Tool: Choose your broker
        </h2>
        
        {/* Notification */}
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute top-0 right-0 bg-red-900/80 border border-red-700 p-4 rounded-lg shadow-xl w-72 z-10"
          >
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white mb-1">Single Broker Limit</h4>
                <p className="text-sm text-red-200 mb-3">
                  You already have a broker connected. For multiple accounts, use Copy Trading.
                </p>
                <button 
                  onClick={navigateToCopyTrading}
                  className="text-xs bg-red-800 hover:bg-red-700 text-white py-1.5 px-3 rounded transition-colors"
                >
                  Go to Copy Trading
                </button>
              </div>
              <button 
                onClick={() => setShowNotification(false)} 
                className="ml-auto text-red-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
        
        <div className="mt-6 flex flex-wrap gap-6">
          {/* Square Box with Plus Icon - Only show if no broker is selected */}
          {!selectedBroker && (
            <div 
              className="w-48 h-48 border-2 border-dashed border-zinc-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-800/30 transition-colors"
              onClick={toggleModal}
            >
              <PlusIcon className="w-12 h-12 text-zinc-400" />
            </div>
          )}

          {/* Display selected broker if any */}
          {selectedBroker && (
            <div className="w-48 h-48 bg-zinc-800 rounded-lg overflow-hidden relative group">
              {/* Broker content */}
              <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3">
                  {getBrokerIcon(selectedBroker.broker_id)}
                </div>
                <span className="font-medium text-center">{getBrokerName(selectedBroker.broker_id)}</span>
                <p className="text-sm text-zinc-400 text-center mt-1">{selectedBroker.account_label || 'Primary Account'}</p>
                
                {/* Status indicator */}
                <div className="mt-2 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                  <span className="text-xs">{isPaused ? 'Paused' : 'Active'}</span>
                </div>
              </div>
              
              {/* Hover actions overlay */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  onClick={togglePauseResume}
                  className="p-2 bg-zinc-700 rounded-full hover:bg-zinc-600 transition-colors"
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? (
                    <PlayCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <PauseCircle className="w-6 h-6 text-yellow-400" />
                  )}
                </button>
                <button 
                  onClick={handleDeleteBroker}
                  className="p-2 bg-zinc-700 rounded-full hover:bg-red-900 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-6 h-6 text-red-400" />
                </button>
              </div>
            </div>
          )}
          
          {/* Add button to add another broker if one is already selected */}
          {selectedBroker && (
            <div 
              className="w-48 h-48 border-2 border-dashed border-zinc-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-800/30 transition-colors"
              onClick={toggleModal}
            >
              <PlusIcon className="w-12 h-12 text-zinc-400" />
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Pick a Broker</h3>
                <button 
                  onClick={toggleModal}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : savedBrokers.length > 0 ? (
                  <div className="space-y-3">
                    {savedBrokers.map((broker) => (
                      <div 
                        key={broker.id} 
                        className="bg-zinc-800 p-3 rounded-lg flex items-center justify-between hover:bg-zinc-700 cursor-pointer"
                        onClick={() => handleSelectBroker(broker)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                            {getBrokerIcon(broker.broker_id)}
                          </div>
                          <span>{getBrokerName(broker.broker_id)}</span>
                        </div>
                        <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-400">
                    <p>No brokers connected yet. Connect a broker in the Broker Authentication page first.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
