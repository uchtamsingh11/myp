'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import Pricing from '../../../components/dashboard/PricingComponent';
import PaymentTestComponent from '../../../components/dashboard/PaymentTestComponent';

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTestPayment, setShowTestPayment] = useState(false);

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

    // Check for test=true query parameter to show test payment component
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('test') === 'true') {
        setShowTestPayment(true);
      }
    }
  }, []);

  const handlePurchase = (plan) => {
    // When a user selects a plan, show the test payment section
    setShowTestPayment(true);

    // Scroll to the payment test section
    setTimeout(() => {
      document.getElementById('payment-test-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
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

          <div className="container mx-auto mt-8 flex justify-center">
            <button
              onClick={() => setShowTestPayment(!showTestPayment)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              {showTestPayment ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Hide Test Payment
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Show Test Payment
                </>
              )}
            </button>
          </div>

          {showTestPayment && (
            <div id="payment-test-section" className="container mx-auto">
              <PaymentTestComponent />
            </div>
          )}
        </>
      )}
    </div>
  );
}
