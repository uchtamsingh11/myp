'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { supabase } from '../../../utils/supabase';
import PaymentButton from '../../../components/PaymentButton';
import { BorderBeam } from '../../../components/ui/effects/BorderBeam';
import { RainbowButton } from '../../../components/ui/buttons/RainbowButton';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    document.title = 'Pricing Plans | MyP';

    // Fetch user's data
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          // Fetch purchase history when user is logged in
          const { data: history, error } = await supabase
            .from('purchases')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && history) {
            setPurchaseHistory(history);
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
      coins: 1000,
      price: '₹999',
    },
    {
      id: 'pro',
      name: 'Pro',
      coins: 2500,
      price: '₹2249',
      highlighted: true,
      tag: 'Best Value',
    },
    {
      id: 'premium',
      name: 'Premium',
      coins: 5000,
      price: '₹4499',
    }
  ];

  const handlePurchase = async (plan) => {
    if (!userId) {
      // Redirect to login if not logged in
      window.location.href = '/auth/signin?redirect=/dashboard/pricing';
      return;
    }

    // Generate a unique order ID for the transaction
    const orderId = `${userId.substring(0, 8)}-${plan.id}-${Date.now()}`;

    // Use the PaymentButton component programmatically by simulating a click
    // We'll replace the "Buy Now" button with actual PaymentButton in the UI
    console.log('Processing purchase:', { plan, orderId });
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to reasonable amount
    if (/^\d*$/.test(value) && value.length <= 5) {
      setCustomAmount(value);
    }
  };

  return (
    <div className="min-h-screen text-white bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-zinc-800/10 to-transparent"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* History Button */}
        <div className="absolute right-4 top-8 z-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">History</span>
            </button>
          </motion.div>
        </div>

        {/* History Popup */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
              onClick={(e) => {
                // Close popup when clicking outside
                if (e.target === e.currentTarget) {
                  setShowHistory(false);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl mx-4 overflow-hidden"
              >
                {/* Popup Header */}
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                  <h2 className="text-xl font-bold">Purchase History</h2>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Popup Content */}
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                  {purchaseHistory.length > 0 ? (
                    <div className="space-y-4">
                      {purchaseHistory.map((purchase) => (
                        <div
                          key={purchase.id}
                          className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/30"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {purchase.plan_name}
                              </h3>
                              <p className="text-zinc-400 text-sm">
                                {new Date(purchase.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {purchase.coins} Z Coins
                              </div>
                              <div className="text-zinc-400">₹{purchase.amount}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-zinc-400">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-zinc-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg font-medium">No purchase history yet</p>
                      <p className="mt-1">Your purchase history will appear here</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <h1 className="text-5xl font-bold mb-2">Pricing Plans</h1>
          <p className="text-zinc-400 max-w-3xl mx-auto">
            Choose the plan that fits your trading needs. All plans include access to our
            platform with different levels of features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const [planRef, planInView] = useInView({
              triggerOnce: true,
              threshold: 0.1,
            });

            return (
              <motion.div
                key={plan.id}
                ref={planRef}
                className={`relative rounded-xl overflow-hidden backdrop-blur-sm transition-transform hover:translate-y-[-8px] ${plan.highlighted
                  ? 'bg-gradient-to-b from-zinc-800/70 to-zinc-900/70 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                  : 'bg-gradient-to-b from-zinc-800/40 to-zinc-900/40 border border-zinc-700/30'
                  }`}
                initial={{ opacity: 0, y: 30 }}
                animate={planInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <BorderBeam
                  colorFrom={plan.highlighted ? "#8B5CF6" : "#6B7280"}
                  colorTo={plan.highlighted ? "#6366F1" : "#4B5563"}
                  size={70}
                  duration={6}
                  delay={0}
                />

                {plan.highlighted && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                      {plan.tag || 'Most Popular'}
                    </span>
                  </div>
                )}

                <div className="p-8 flex flex-col items-center">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-center">{plan.name}</h3>

                  <div className="mb-6 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-bold">{plan.coins}</span>
                      <span className="text-xl text-zinc-400 ml-2">Z Coins</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent my-6"></div>

                  <PaymentButton
                    amount={parseInt(plan.price.replace('₹', ''))}
                    orderId={`${userId ? userId.substring(0, 8) : 'guest'}-${plan.id}-${Date.now()}`}
                    buttonText="Buy Now"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    onSuccess={(data) => {
                      // Show toast notification and stay on pricing page
                      toast.success('Payment successful! Coins added to your account.');
                    }}
                  />
                </div>
              </motion.div>
            );
          })}

          {/* Custom Amount Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative rounded-xl overflow-hidden backdrop-blur-sm transition-transform hover:translate-y-[-8px] bg-gradient-to-b from-zinc-800/40 to-zinc-900/40 border border-zinc-700/30"
          >
            <BorderBeam
              colorFrom="#6B7280"
              colorTo="#4B5563"
              size={70}
              duration={6}
              delay={0}
            />

            <div className="p-8 flex flex-col items-center">
              <h3 className="text-xl md:text-2xl font-bold mb-2 text-center">Custom</h3>

              <div className="mb-6 text-center">
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold">{customAmount || '0'}</span>
                  <span className="text-xl text-zinc-400 ml-2">Z Coins</span>
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400">₹</span>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Enter amount"
                      className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg py-2 px-8 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent my-6"></div>

              <PaymentButton
                amount={parseInt(customAmount) || 0}
                orderId={`${userId ? userId.substring(0, 8) : 'guest'}-custom-${Date.now()}`}
                buttonText="Buy Now"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                onSuccess={(data) => {
                  // Show toast notification and stay on pricing page
                  toast.success('Payment successful! Coins added to your account.');
                }}
                disabled={!customAmount}
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-zinc-900/50 via-zinc-800/50 to-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 backdrop-blur-sm">
            <p className="text-lg md:text-xl whitespace-nowrap overflow-hidden">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Z Coins</span>
              <span className="text-zinc-300"> can be used to purchase any of our </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">products and services</span>
              <span className="text-zinc-300"> across the platform.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
