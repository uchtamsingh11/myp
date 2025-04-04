'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../utils/supabase';
import PaymentButton from '../../../components/PaymentButton';
import { BorderBeam } from '../../../components/ui/effects/BorderBeam';

export default function PricingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Payment status state
  const [paymentStatus, setPaymentStatus] = useState('hidden'); // hidden, loading, success, failed, pending, error
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Check if we need to display payment status
  const orderId = searchParams.get('order_id');
  const statusParam = searchParams.get('status');

  useEffect(() => {
    document.title = 'Pricing Plans | MyP';

    // Check if we need to display payment status
    if (orderId) {
      checkPaymentStatus();
    }

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
  }, [orderId, statusParam]);

  // Function to check payment status
  const checkPaymentStatus = async () => {
    if (!orderId) {
      setPaymentStatus('error');
      return;
    }

    setPaymentStatus('loading');

    try {
      // Fetch payment status from API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`/api/payments/verify-payment?order_id=${orderId}`, {
        signal: controller.signal
      }).catch(error => {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        throw error;
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to verify payment: ${response.status}`);
      }

      // Parse response with error handling
      const data = await response.json().catch(() => {
        throw new Error('Invalid JSON response from server');
      });

      // Set status based on API response
      if (data.isPaid) {
        setPaymentStatus('success');
      } else if (data.orderStatus) {
        setPaymentStatus(data.orderStatus.toLowerCase());
      } else {
        setPaymentStatus('pending');
      }

      setPaymentDetails({
        orderId,
        amount: data.orderAmount || searchParams.get('amount') || 'N/A',
        status: data.orderStatus || 'Unknown',
        timestamp: new Date().toLocaleString(),
        coins: data.coinsAdded || Math.floor(parseFloat(data.orderAmount || '0')),
        newBalance: data.newBalance || null,
        coinBalanceUpdated: data.coinBalanceUpdated || false
      });
    } catch (error) {
      console.error('Error checking payment status:', error);
      // If there's a connection error, handle it gracefully
      if (error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('timed out') ||
        error.message.includes('WebSocket')) {
        setPaymentStatus('pending'); // Assume pending if we can't verify
        setPaymentDetails({
          orderId,
          amount: searchParams.get('amount') || 'N/A',
          status: 'Connection Error',
          timestamp: new Date().toLocaleString(),
          coins: Math.floor(parseFloat(searchParams.get('amount') || '0')),
          connectionError: true
        });
      } else {
        setPaymentStatus('error');
      }
    }
  };

  // Function to close payment status and show pricing
  const closePaymentStatus = () => {
    // Use router to remove query params without full reload
    router.push('/dashboard/pricing', { scroll: false });
    // Reset state
    setPaymentStatus('hidden');
    setPaymentDetails(null);
  };

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

  // Render payment status UI if we have a status to show
  if (paymentStatus !== 'hidden') {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Payment Status</h1>
            <button
              onClick={closePaymentStatus}
              className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>

          {paymentStatus === 'loading' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-white mb-2">Checking payment status...</h2>
              <p className="text-zinc-400">Please wait while we verify your payment.</p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="bg-zinc-900 border border-indigo-500/30 rounded-xl p-8 text-center relative overflow-hidden">
              {/* Success animation */}
              <div className="coin-animation-container">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="coin"
                    style={{
                      left: `${Math.random() * 80 + 10}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${Math.random() * 3 + 3}s`
                    }}
                  >
                    <div className="coin-inner">ⓒ</div>
                  </div>
                ))}
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                <p className="text-zinc-400 mb-6">Your coins have been added to your account</p>

                <div className="bg-gradient-to-r from-indigo-900/40 to-indigo-600/40 border border-indigo-500/30 rounded-lg p-4 mb-6">
                  <div className="flex justify-center items-center space-x-2 mb-2">
                    <span className="text-yellow-400 text-2xl">ⓒ</span>
                    <span className="text-3xl font-bold text-white">{paymentDetails?.coins || 0}</span>
                    <span className="text-zinc-400">coins added</span>
                  </div>
                  {paymentDetails?.newBalance ? (
                    <p className="text-sm text-green-400">New balance: {paymentDetails.newBalance} coins</p>
                  ) : (
                    <p className="text-sm text-zinc-500">1 coin = 1 trade</p>
                  )}
                </div>

                <div className="bg-zinc-800/40 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-zinc-300 font-medium mb-3 text-center">Transaction Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Order ID:</span>
                      <span className="text-zinc-300 font-medium">{paymentDetails?.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Amount:</span>
                      <span className="text-zinc-300 font-medium">₹{paymentDetails?.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Date:</span>
                      <span className="text-zinc-300 font-medium">{paymentDetails?.timestamp}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={closePaymentStatus}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
              <p className="text-zinc-400 mb-6">Your payment could not be processed.</p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={closePaymentStatus}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
                >
                  Try Again
                </button>
                <Link
                  href="/dashboard"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}

          {(paymentStatus === 'pending' || paymentStatus === 'user_dropped') && (
            <div className="bg-zinc-900 border border-yellow-500/30 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Pending</h2>
              <p className="text-zinc-400 mb-6">
                {paymentDetails?.connectionError
                  ? "We're having trouble connecting to our payment server. Your payment may have been processed."
                  : "Your payment is being processed and will be confirmed shortly."}
              </p>

              <div className="bg-zinc-800/40 rounded-lg p-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Order ID:</span>
                  <span className="text-zinc-300 font-medium">{paymentDetails?.orderId}</span>
                </div>
                {paymentDetails?.amount && (
                  <div className="flex justify-between mt-2">
                    <span className="text-zinc-400">Amount:</span>
                    <span className="text-zinc-300 font-medium">₹{paymentDetails.amount}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    // Added delay before checking payment status again
                    setPaymentStatus('loading');
                    setTimeout(checkPaymentStatus, 500);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
                >
                  Check Status
                </button>
                <button
                  onClick={closePaymentStatus}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Verification Failed</h2>
              <p className="text-zinc-400 mb-6">We couldn't verify your payment. Please try again or contact support.</p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={closePaymentStatus}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
                >
                  Back to Pricing
                </button>
                <Link
                  href="/dashboard"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
                      // Update to use the current page instead of redirecting
                      router.push(`/dashboard/pricing?order_id=${data.orderId}&status=success`, { scroll: false });
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
                  // Update to use the current page instead of redirecting
                  router.push(`/dashboard/pricing?order_id=${data.orderId}&status=success`, { scroll: false });
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

      <style jsx>{`
        .coin-animation-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }
        
        .coin {
          position: absolute;
          top: -50px;
          animation: coinFall linear forwards;
          z-index: 1;
        }
        
        .coin-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          color: #eab308;
          font-size: 24px;
          animation: coinRotate linear infinite;
          animation-duration: 1s;
        }
        
        @keyframes coinFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          
          75% {
            opacity: 1;
          }
          
          100% {
            transform: translateY(500px) rotate(20deg);
            opacity: 0;
          }
        }
        
        @keyframes coinRotate {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
      `}</style>
    </div>
  );
}
