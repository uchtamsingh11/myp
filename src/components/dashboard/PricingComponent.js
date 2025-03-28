'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BorderBeam } from '../../magicui/border-beam.jsx';
import { RainbowButton } from '../../magicui/rainbow-button.jsx';
import '../../styles/rainbow.css';

const pricingPlans = [
  {
    name: 'Basic',
    coins: 1000,
    price: 999,
    description: 'You can use this coin to purchase our services',
    features: [],
    cta: 'Buy Now',
    popular: false,
    beamColors: {
      from: '#6B7280',
      to: '#4B5563'
    }
  },
  {
    name: 'Pro',
    coins: 2500,
    price: 2249,
    description: 'You can use this coin to purchase our services',
    features: [],
    cta: 'Buy Now',
    popular: true,
    beamColors: {
      from: '#8B5CF6',
      to: '#6D28D9'
    }
  },
  {
    name: 'Premium',
    coins: 5000,
    price: 4499,
    description: 'You can use this coin to purchase our services',
    features: [],
    cta: 'Buy Now',
    popular: false,
    beamColors: {
      from: '#EC4899',
      to: '#BE185D'
    }
  },
];

function PricingComponent({ onPurchase }) {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  // Pre-create refs for each pricing plan to avoid hooks in loops
  const planRefs = pricingPlans.map(() => useInView({
    triggerOnce: true,
    threshold: 0.1,
  }));

  const handlePurchase = plan => {
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
    <section className="py-16 sm:py-24 bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-zinc-800/10 to-transparent"></div>

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="section-title text-white">Choose Your Coin Package</h2>
          <p className="section-subtitle max-w-2xl mx-auto text-white">
            Choose the plan that fits your trading needs. All plans include access to our platform
            with different levels of features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 px-4 sm:px-0">
          {pricingPlans.map((plan, index) => {
            // Get the pre-created ref and inView state for this plan
            const [planRef, planInView] = planRefs[index];

            return (
              <motion.div
                key={index}
                ref={planRef}
                className={`relative rounded-xl overflow-hidden backdrop-blur-sm transition-transform hover:translate-y-[-8px] ${plan.popular ? 'bg-gradient-to-b from-zinc-800/60 to-zinc-900/60 border border-purple-500/40 shadow-lg shadow-purple-500/10 scale-105' : 'bg-gradient-to-b from-zinc-800/40 to-zinc-900/40 border border-zinc-700/30'}`}
                initial={{ opacity: 0, y: 30 }}
                animate={planInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <BorderBeam 
                  colorFrom={plan.beamColors.from} 
                  colorTo={plan.beamColors.to}
                  size={plan.popular ? 80 : 70} 
                  duration={plan.popular ? 5 : 6}
                  delay={index * 0.2}
                />

                <div className="p-5 sm:p-6 md:p-8">
                  {plan.popular && (
                    <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Popular
                    </div>
                  )}
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-center text-white">{plan.name}</h3>

                  <div className="mb-6 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">{plan.coins}</span>
                      <span className="text-xl text-zinc-400 ml-2">Z Coins</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent my-6"></div>

                  {/* Features section removed */}
                  <div className="mb-8"></div>

                  <RainbowButton 
                    className="w-full"
                    onClick={() => handlePurchase(plan)}
                  >
                    {plan.cta}
                  </RainbowButton>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Message below pricing cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-10 px-4 sm:px-0"
        >
          <p className="text-lg text-zinc-300 font-medium">
            <span className="text-indigo-400">You can use these coins</span> for any of our <span className="text-indigo-400">20+ products and services</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default PricingComponent;