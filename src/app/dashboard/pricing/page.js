'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import Pricing from '../../../components/dashboard/PricingComponent';
import PaymentButton from '../../../components/PaymentButton';

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    document.title = 'Subscription | AlgoZ';

    // Fetch user's current subscription
    const fetchSubscription = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
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

  const handlePurchase = (plan) => {
    // When a user selects a plan, show the payment section
    setSelectedPlan(plan);
    setShowPayment(true);

    // Scroll to the payment section
    setTimeout(() => {
      document.getElementById('payment-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const getAmountFromPlan = (plan) => {
    // Map plan names to actual amounts (in INR)
    const planPrices = {
      'Basic': 500,
      'Pro': 1000,
      'Enterprise': 2000,
      // Add other plans as needed
    };

    return planPrices[plan] || 999; // Default fallback price
  };

  return (
    <div className="min-h-screen bg-black">
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {currentPlan && (
            <div className="container-custom pt-8">
              <div className="bg-gradient-to-r from-indigo-900/40 to-indigo-600/40 border border-indigo-500/30 rounded-lg p-4 mb-8">
                <h2 className="text-lg font-medium text-white mb-1">
                  Current Plan: <span className="font-bold text-indigo-300">{currentPlan}</span>
                </h2>
                <p className="text-zinc-300 text-sm">
                  You can upgrade or change your subscription at any time.
                </p>
              </div>
            </div>
          )}

          <Pricing onPurchase={handlePurchase} />

          {showPayment && selectedPlan && (
            <div id="payment-section" className="container mx-auto max-w-xl mt-12 mb-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Complete Your Purchase</h3>
                <p className="text-zinc-400">You've selected the {selectedPlan} plan. Complete your payment to activate your subscription.</p>
              </div>

              <div className="bg-zinc-700/40 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-zinc-300">Plan:</span>
                  <span className="text-white font-medium">{selectedPlan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Amount:</span>
                  <span className="text-white font-medium">₹{getAmountFromPlan(selectedPlan)}</span>
                </div>
              </div>

              <PaymentButton
                amount={getAmountFromPlan(selectedPlan)}
                buttonText={`Pay ₹${getAmountFromPlan(selectedPlan)}`}
                orderId={`sub_${Date.now()}_${selectedPlan.toLowerCase()}`}
                onSuccess={(data) => {
                  // Handle successful payment - e.g., update subscription status
                  console.log('Payment successful:', data);
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
