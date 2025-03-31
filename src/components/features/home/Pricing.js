'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BorderBeam } from '../../magicui/border-beam';
import { RainbowButton } from '../../magicui/rainbow-button';

const pricingPlans = [
  {
    name: 'Basic',
    coins: 1000,
    price: 999,
    cta: 'Buy Now',
    popular: false,
  },
  {
    name: 'Pro',
    coins: 2500,
    price: 2249,
    cta: 'Buy Now',
    popular: true,
    tag: 'Best Value',
  },
  {
    name: 'Premium',
    coins: 5000,
    price: 4499,
    cta: 'Buy Now',
    popular: false,
  },
];

const Pricing = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-zinc-800/10 to-transparent"></div>

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="section-title">Pricing Plans</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Choose the plan that fits your trading needs. All plans include access to our platform
            with different levels of features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 px-4 sm:px-0">
          {pricingPlans.map((plan, index) => {
            const [planRef, planInView] = useInView({
              triggerOnce: true,
              threshold: 0.1,
            });

            return (
              <motion.div
                key={index}
                ref={planRef}
                className={`relative rounded-xl overflow-hidden backdrop-blur-sm transition-transform hover:translate-y-[-8px] ${plan.popular
                  ? 'bg-gradient-to-b from-zinc-800/70 to-zinc-900/70 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                  : 'bg-gradient-to-b from-zinc-800/40 to-zinc-900/40 border border-zinc-700/30'
                  }`}
                initial={{ opacity: 0, y: 30 }}
                animate={planInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <BorderBeam
                  colorFrom={plan.popular ? "#8B5CF6" : "#6B7280"}
                  colorTo={plan.popular ? "#6366F1" : "#4B5563"}
                  size={70}
                  duration={6}
                  delay={0}
                />

                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                      {plan.tag || 'Most Popular'}
                    </span>
                  </div>
                )}

                <div className="p-5 sm:p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-center">{plan.name}</h3>

                  <div className="mb-6 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-bold">{plan.coins}</span>
                      <span className="text-xl text-zinc-400 ml-2">Z Coins</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">₹{plan.price}</span>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent my-6"></div>

                  <RainbowButton className="w-full">
                    {plan.cta}
                  </RainbowButton>
                </div>
              </motion.div>
            );
          })}
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
    </section>
  );
};

export default Pricing;
