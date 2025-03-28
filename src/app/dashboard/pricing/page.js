'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import PaymentButton from '../../../components/PaymentButton';

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    document.title = 'Subscription | MyP';

    // Fetch user's current subscription
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);

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
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 830,
      coins: 100,
      features: [
        'Access to Basic Features',
        'Up to 5 Trades per Day',
        'Basic Support'
      ],
      highlighted: false
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 2075,
      coins: 300,
      features: [
        'Access to All Basic Features',
        'Up to 20 Trades per Day',
        'Priority Support',
        'Strategy Analysis'
      ],
      highlighted: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 4150,
      coins: 800,
      features: [
        'Access to All Features',
        'Unlimited Trades',
        '24/7 Premium Support',
        'Advanced Strategy Tools',
        'Bot Trading Features'
      ],
      highlighted: false
    }
  ];

  const handlePurchase = async (plan) => {
    if (!userId) {
      // Redirect to login if not logged in
      window.location.href = '/auth/signin?redirect=/dashboard/pricing';
      return;
    }

    setSelectedPlan(plan);
  };

  const clearSelection = () => {
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {currentPlan && (
              <div className="mb-10 bg-gradient-to-r from-indigo-900/40 to-indigo-600/40 border border-indigo-500/30 rounded-lg p-5">
                <h2 className="text-xl font-medium text-white">
                  Current Plan: <span className="font-bold text-indigo-300">{currentPlan}</span>
                </h2>
                <p className="text-zinc-300 mt-1">
                  You can upgrade or change your subscription at any time.
                </p>
              </div>
            )}

            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-white mb-3">Choose Your Coin Package</h1>
              <p className="text-zinc-400 max-w-3xl mx-auto">
                Select the plan that works best for you. All plans include access to our trading platform.
              </p>
            </div>

            {!selectedPlan ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-zinc-900 border ${plan.highlighted
                      ? 'border-indigo-500 relative overflow-hidden'
                      : 'border-zinc-800'} rounded-xl p-6 flex flex-col`}
                  >
                    {plan.highlighted && (
                      <div className="absolute top-0 right-0 bg-indigo-600 px-4 py-1 text-sm font-medium text-white rounded-bl-lg">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-center mb-1">
                      <span className="text-yellow-400 text-lg mr-2">ⓒ</span>
                      <span className="text-2xl font-bold text-white">{plan.coins}</span>
                      <span className="text-zinc-400 ml-1">coins</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-6">₹{plan.price}</div>

                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex text-zinc-300">
                          <svg className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePurchase(plan)}
                      className={`w-full py-3 px-4 rounded-md font-medium text-white ${plan.highlighted
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-zinc-800 hover:bg-zinc-700'
                        } transition-colors`}
                    >
                      Purchase Now
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-white">Order Summary</h2>
                  <button
                    onClick={clearSelection}
                    className="text-zinc-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="border-b border-zinc-800 pb-4 mb-4">
                  <div className="flex justify-between mb-3">
                    <span className="text-zinc-400">Plan:</span>
                    <span className="text-white font-medium">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-zinc-400">Coins:</span>
                    <span className="text-white font-medium">{selectedPlan.coins} coins</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6 text-lg font-bold">
                  <span className="text-zinc-300">Total:</span>
                  <span className="text-white">₹{selectedPlan.price}</span>
                </div>

                <div className="bg-zinc-800/40 p-4 rounded-lg mb-6">
                  <h4 className="text-white font-medium mb-3">Includes:</h4>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex text-zinc-300 text-sm">
                        <svg className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <PaymentButton
                  amount={selectedPlan.price}
                  buttonText={`Complete Payment • ₹${selectedPlan.price}`}
                  orderId={`coins_${Date.now()}_${String(selectedPlan.id)}`}
                  onSuccess={(data) => {
                    console.log('Payment successful:', data);
                    // Here you would update the user's coin balance
                    // and redirect to a success page
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
