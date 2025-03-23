'use client';

import { useState, useMemo, memo, useEffect } from 'react';
import { motion } from 'framer-motion';

// Define the component as a regular function
function PricingComponent({ onPurchase }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add an effect to handle the initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Use useMemo to prevent recreating the plans array on each render
  const plans = useMemo(() => [
    {
      id: 1,
      name: 'Basic',
      coins: 100,
      price: 9.99,
      features: [
        'Access to Basic Features',
        'Up to 5 Trades per Day',
        'Basic Support',
      ]
    },
    {
      id: 2,
      name: 'Standard',
      coins: 300,
      price: 24.99,
      popular: true,
      features: [
        'Access to All Basic Features',
        'Up to 20 Trades per Day',
        'Priority Support',
        'Strategy Analysis',
      ]
    },
    {
      id: 3,
      name: 'Premium',
      coins: 800,
      price: 49.99,
      features: [
        'Access to All Features',
        'Unlimited Trades',
        '24/7 Premium Support',
        'Advanced Strategy Tools',
        'Bot Trading Features',
      ]
    },
  ], []);

  const handlePurchase = (plan) => {
    setSelectedPlan(plan);
    if (onPurchase) {
      onPurchase(plan);
    }
  };
  
  // Show loading spinner while loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-8 text-center">Choose Your Coin Package</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            className={`relative rounded-xl overflow-hidden border ${
              plan.popular ? 'border-indigo-500' : 'border-zinc-700'
            } bg-zinc-800 hover:bg-zinc-700 transition-colors`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: plan.id * 0.1 }}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 text-sm font-semibold">
                Most Popular
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-2xl font-bold">{plan.coins}</span>
                  <span className="ml-1 text-zinc-400">coins</span>
                </div>
              </div>
              
              <div className="text-2xl font-bold mb-6">
                ${plan.price}
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handlePurchase(plan)}
                className={`w-full py-3 rounded-lg font-semibold ${
                  plan.popular 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : 'bg-zinc-700 hover:bg-zinc-600'
                } transition-colors`}
              >
                Purchase Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Memoize the component
const MemoizedPricingComponent = memo(PricingComponent);

export default MemoizedPricingComponent; 