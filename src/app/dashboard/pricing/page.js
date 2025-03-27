'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import Pricing from '../../../components/dashboard/PricingComponent';

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
                <h2 className="text-lg font-medium text-white mb-1">Current Plan: <span className="font-bold text-indigo-300">{currentPlan}</span></h2>
                <p className="text-zinc-300 text-sm">You can upgrade or change your subscription at any time.</p>
              </div>
            </div>
          )}
          <Pricing />
        </>
      )}
    </div>
  );
}
