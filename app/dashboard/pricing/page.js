'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qkqubtmuygammkrtgpvz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Subscription | AlgoZ';
    
    // Fetch user's current subscription
    const fetchSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (data && !error) {
            setCurrentPlan(data.plan_name);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, []);

  const handleSubscribe = async (planName) => {
    try {
      // Here we would integrate with a payment processor like Stripe
      // For now, we'll just show a simple alert
      alert(`Redirecting to payment for ${planName} plan. This would connect to a payment processor in production.`);
      
      // Example of how you might implement this with a real payment flow:
      // 1. Call your backend to create a checkout session
      // 2. Redirect to the payment page
      // 3. Handle the return from payment with a webhook
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const features = {
    basic: [
      { name: 'Basic TradingView integration', included: true },
      { name: 'Up to 3 active strategies', included: true },
      { name: 'Standard webhook support', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced backtesting', included: false },
      { name: 'Custom strategy development', included: false },
      { name: 'Priority support', included: false },
    ],
    pro: [
      { name: 'Advanced TradingView integration', included: true },
      { name: 'Unlimited active strategies', included: true },
      { name: 'Premium webhook support', included: true },
      { name: 'Email & chat support', included: true },
      { name: 'Advanced backtesting', included: true },
      { name: 'Basic strategy customization', included: true },
      { name: 'Priority support', included: true },
      { name: 'Custom strategy development', included: false },
    ],
    enterprise: [
      { name: 'Full TradingView integration', included: true },
      { name: 'Unlimited active strategies', included: true },
      { name: 'Premium webhook support with dedicated endpoints', included: true },
      { name: 'Priority email, chat & phone support', included: true },
      { name: 'Advanced backtesting with detailed analytics', included: true },
      { name: 'Full strategy customization', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'Custom strategy development', included: true },
    ]
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-2">Manage Subscription</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-zinc-800/50 border border-zinc-700/30 rounded-xl">
            <h2 className="text-lg font-medium mb-2">Current Subscription</h2>
            <div className="flex items-center justify-between">
              <div>
                {currentPlan ? (
                  <>
                    <p className="text-white font-medium">
                      You are currently on the 
                      <span className="text-blue-400 font-semibold"> {currentPlan} </span> 
                      plan
                    </p>
                    <p className="text-sm text-zinc-400">Next billing date: {new Date().setDate(new Date().getDate() + 30).toLocaleDateString()}</p>
                  </>
                ) : (
                  <p className="text-zinc-400">You don't have an active subscription</p>
                )}
              </div>
              {currentPlan && (
                <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md transition text-sm">
                  Manage Billing
                </button>
              )}
            </div>
          </div>
        )}
        
        <h2 className="text-xl font-semibold mb-6 text-white">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Basic Plan */}
          <motion.div 
            className="bg-zinc-800/50 border border-zinc-700/30 rounded-xl p-6 h-full flex flex-col transition-shadow hover:shadow-lg"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <h2 className="text-xl font-semibold mb-1">Basic</h2>
              <p className="text-zinc-400 text-sm mb-4">For individual traders</p>
              <p className="text-3xl font-bold mb-1">$9<span className="text-sm font-normal">/month</span></p>
              <p className="text-zinc-400 text-xs mb-6">Billed monthly</p>
            </div>
            
            <div className="flex-grow">
              <ul className="space-y-3 mb-6">
                {features.basic.map((feature, index) => (
                  <li key={index} className={`flex items-start ${!feature.included ? 'text-zinc-500' : ''}`}>
                    <svg className={`w-5 h-5 mr-2 ${feature.included ? 'text-green-400' : 'text-red-400'} mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
                      {feature.included ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      )}
                    </svg>
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button 
              onClick={() => handleSubscribe('Basic')}
              className={`w-full py-2.5 rounded-md transition text-white ${
                currentPlan === 'Basic' 
                  ? 'bg-green-600 hover:bg-green-700 cursor-default' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={currentPlan === 'Basic'}
            >
              {currentPlan === 'Basic' ? 'Current Plan' : 'Subscribe'}
            </button>
          </motion.div>
          
          {/* Pro Plan */}
          <motion.div 
            className="bg-zinc-800/50 border border-zinc-700/30 border-blue-500/50 rounded-xl p-6 h-full flex flex-col relative transition-shadow hover:shadow-lg"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold py-1 px-4 rounded-full">
              POPULAR
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Pro</h2>
              <p className="text-zinc-400 text-sm mb-4">For serious traders</p>
              <p className="text-3xl font-bold mb-1">$29<span className="text-sm font-normal">/month</span></p>
              <p className="text-zinc-400 text-xs mb-6">Billed monthly</p>
            </div>
            
            <div className="flex-grow">
              <ul className="space-y-3 mb-6">
                {features.pro.map((feature, index) => (
                  <li key={index} className={`flex items-start ${!feature.included ? 'text-zinc-500' : ''}`}>
                    <svg className={`w-5 h-5 mr-2 ${feature.included ? 'text-green-400' : 'text-red-400'} mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
                      {feature.included ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      )}
                    </svg>
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button 
              onClick={() => handleSubscribe('Pro')}
              className={`w-full py-2.5 rounded-md transition text-white ${
                currentPlan === 'Pro' 
                  ? 'bg-green-600 hover:bg-green-700 cursor-default' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={currentPlan === 'Pro'}
            >
              {currentPlan === 'Pro' ? 'Current Plan' : 'Subscribe'}
            </button>
          </motion.div>
          
          {/* Enterprise Plan */}
          <motion.div 
            className="bg-zinc-800/50 border border-zinc-700/30 rounded-xl p-6 h-full flex flex-col transition-shadow hover:shadow-lg"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <h2 className="text-xl font-semibold mb-1">Enterprise</h2>
              <p className="text-zinc-400 text-sm mb-4">For professional trading firms</p>
              <p className="text-3xl font-bold mb-1">$99<span className="text-sm font-normal">/month</span></p>
              <p className="text-zinc-400 text-xs mb-6">Billed monthly</p>
            </div>
            
            <div className="flex-grow">
              <ul className="space-y-3 mb-6">
                {features.enterprise.map((feature, index) => (
                  <li key={index} className={`flex items-start ${!feature.included ? 'text-zinc-500' : ''}`}>
                    <svg className={`w-5 h-5 mr-2 ${feature.included ? 'text-green-400' : 'text-red-400'} mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
                      {feature.included ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      )}
                    </svg>
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button 
              onClick={() => handleSubscribe('Enterprise')}
              className={`w-full py-2.5 rounded-md transition text-white ${
                currentPlan === 'Enterprise' 
                  ? 'bg-green-600 hover:bg-green-700 cursor-default' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={currentPlan === 'Enterprise'}
            >
              {currentPlan === 'Enterprise' ? 'Current Plan' : 'Contact Sales'}
            </button>
          </motion.div>
        </div>
        
        <div className="mt-10 bg-zinc-800/50 border border-zinc-700/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
          <p className="text-zinc-400 mb-4">Have questions about which plan is right for you? Our team is happy to help.</p>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md transition text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </button>
            <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md transition text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Live Chat
            </button>
            <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md transition text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Documentation
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
