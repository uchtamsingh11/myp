'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import PaymentButton from '../../../components/PaymentButton';

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userCoins, setUserCoins] = useState(0);

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

          // Get user profile with coins
          const { data: userData, error: userError } = await fetch('/api/auth/me')
            .then(res => res.json());

          if (userData && userData.authenticated) {
            setUserCoins(userData.coins || 0);
          }

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

    console.log('Selected plan details:', plan);
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
            <div className="mb-10 bg-gradient-to-r from-indigo-900/40 to-indigo-600/40 border border-indigo-500/30 rounded-lg p-5">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h2 className="text-xl font-medium text-white mb-2">
                    {currentPlan ? (
                      <>Current Plan: <span className="font-bold text-indigo-300">{currentPlan}</span></>
                    ) : (
                      <>No Active Plan</>
                    )}
                  </h2>
                  <p className="text-zinc-300">
                    You can upgrade or change your subscription at any time.
                  </p>
                </div>

                <div className="mt-4 md:mt-0 bg-black/30 px-4 py-3 rounded-lg flex items-center">
                  <span className="text-yellow-400 text-lg mr-2">ⓒ</span>
                  <span className="text-2xl font-bold text-white">{userCoins}</span>
                  <span className="text-zinc-400 ml-2">available coins</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-white mb-3">Choose Your Coin Package</h1>
              <p className="text-zinc-400 max-w-3xl mx-auto">
                Select the plan that works best for you. All plans include access to our trading platform.
              </p>
            </div>

            {!selectedPlan ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

                {/* Custom amount card */}
                <div className="bg-zinc-900 border border-indigo-300/30 relative overflow-hidden rounded-xl p-6 flex flex-col">
                  <div className="absolute top-0 right-0 bg-indigo-600 px-4 py-1 text-sm font-medium text-white rounded-bl-lg">
                    Custom
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Your Amount</h3>
                  <div className="flex flex-col mb-4">
                    <div className="flex items-center mb-3">
                      <span className="text-yellow-400 text-lg mr-2">ⓒ</span>
                      <input
                        type="number"
                        id="customCoins"
                        min="10"
                        max="10000"
                        defaultValue="100"
                        className="bg-zinc-800 border border-zinc-700 text-2xl font-bold text-white rounded px-2 py-1 w-24"
                        onChange={(e) => {
                          const input = e.target;
                          let coins = parseInt(input.value) || 0;

                          // Enforce min/max values
                          if (coins < 10) coins = 10;
                          if (coins > 10000) coins = 10000;

                          // Update display and slider
                          document.getElementById('customPrice').textContent = `₹${coins}`;
                          document.getElementById('tradingAllowance').textContent = `${coins} trades`;
                          document.getElementById('coinSlider').value = coins;

                          // If value was adjusted, update input
                          if (coins !== parseInt(input.value)) {
                            input.value = coins;
                          }
                        }}
                      />
                      <span className="text-zinc-400 ml-1">coins</span>
                    </div>

                    {/* Add slider for easier selection */}
                    <div className="w-full px-1">
                      <input
                        type="range"
                        id="coinSlider"
                        min="10"
                        max="10000"
                        step="10"
                        defaultValue="100"
                        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        style={{
                          WebkitAppearance: 'none',
                          appearance: 'none',
                          outline: 'none',
                          height: '8px',
                          borderRadius: '10px'
                        }}
                        onChange={(e) => {
                          const coins = parseInt(e.target.value);
                          document.getElementById('customCoins').value = coins;
                          document.getElementById('customPrice').textContent = `₹${coins}`;
                          document.getElementById('tradingAllowance').textContent = `${coins} trades`;
                        }}
                      />
                      <div className="flex justify-between text-xs text-zinc-500 mt-1 px-1">
                        <span>₹10</span>
                        <span>₹10,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-2xl font-bold text-white">
                      <span id="customPrice">₹100</span>
                    </div>
                    <div className="text-sm text-zinc-400 font-normal mt-1">1 rupee per coin</div>
                    <div className="mt-3 text-sm bg-zinc-800/40 px-3 py-2 rounded">
                      <span className="text-emerald-400 font-medium" id="tradingAllowance">100 trades</span> allowed
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex text-zinc-300">
                      <svg className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Choose your own amount</span>
                    </li>
                    <li className="flex text-zinc-300">
                      <svg className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>1 coin = 1 trade</span>
                    </li>
                    <li className="flex text-zinc-300">
                      <svg className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Standard Support</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => {
                      const coins = parseInt(document.getElementById('customCoins').value) || 100;
                      const customPlan = {
                        id: 'custom',
                        name: 'Custom',
                        price: coins,
                        coins: coins,
                        features: [
                          'Custom Coin Amount',
                          `${coins} Trades Available`,
                          'Standard Support'
                        ]
                      };
                      handlePurchase(customPlan);
                    }}
                    className="w-full py-3 px-4 rounded-md font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    Purchase Now
                  </button>
                </div>
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
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-400">Current Balance:</span>
                    <span className="text-white font-medium">{userCoins} coins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">After Purchase:</span>
                    <span className="text-emerald-400 font-medium">{userCoins + selectedPlan.coins} coins</span>
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
