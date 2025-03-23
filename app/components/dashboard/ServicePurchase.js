import { useState, useEffect } from 'react';
import { supabase } from '../../../src/utils/supabase';
import { subtractCoins, getUserCoinBalance } from '../../../src/utils/coin-management';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ServicePurchase() {
  const [user, setUser] = useState(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  
  // Sample services with coin costs
  const services = [
    {
      id: 'signal-service',
      name: 'Signal Service',
      description: 'Get premium trading signals directly to your dashboard',
      coinCost: 50,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 'risk-calculator',
      name: 'Risk Calculator',
      description: 'Advanced risk management tools for professional traders',
      coinCost: 75,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 'algo-bot',
      name: 'Trading Algorithm Bot',
      description: 'Automated trading bot with customizable parameters',
      coinCost: 120,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
  ];
  
  // Fetch user and coin balance
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }
        
        setUser(session.user);
        
        // Get user's coin balance
        const balance = await getUserCoinBalance(session.user.id);
        setCoinBalance(balance);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Purchase a service with coins
  const purchaseService = async (service) => {
    if (!user) {
      toast.error('You must be logged in to purchase services');
      return;
    }
    
    setPurchaseLoading(service.id);
    
    try {
      // Attempt to subtract coins for this service
      const result = await subtractCoins(user.id, service.coinCost);
      
      if (!result.success) {
        toast.error(result.error || 'Failed to purchase service');
        return;
      }
      
      // Update local coin balance
      setCoinBalance(result.newBalance);
      
      // Record the purchase in a service_purchases table (you'll need to create this)
      const { error: purchaseError } = await supabase
        .from('service_purchases')
        .insert([
          {
            user_id: user.id,
            service_id: service.id,
            service_name: service.name,
            coin_cost: service.coinCost,
            purchased_at: new Date(),
          },
        ]);
      
      if (purchaseError) throw purchaseError;
      
      // Show success message
      toast.success(`Successfully purchased ${service.name}!`);
      
    } catch (error) {
      console.error('Error purchasing service:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center my-8 text-red-400">
        Please log in to purchase services.
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Available Services</h2>
        <div className="flex items-center bg-zinc-800 px-4 py-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
          <span className="text-lg font-bold">{coinBalance}</span>
          <span className="ml-1 text-zinc-400">coins</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            className="bg-zinc-800 rounded-lg p-6 border border-zinc-700 hover:border-zinc-500 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 mr-4">
                {service.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">{service.name}</h3>
                <p className="text-zinc-400 text-sm">{service.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <span className="font-bold">{service.coinCost}</span>
                <span className="text-sm text-zinc-400 ml-1">coins</span>
              </div>
              
              <button
                onClick={() => purchaseService(service)}
                disabled={purchaseLoading === service.id || coinBalance < service.coinCost}
                className={`px-4 py-2 rounded font-medium ${
                  coinBalance < service.coinCost
                    ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } transition-colors flex items-center`}
              >
                {purchaseLoading === service.id ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : coinBalance < service.coinCost ? (
                  'Not enough coins'
                ) : (
                  'Purchase'
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 