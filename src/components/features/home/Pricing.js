'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const pricingPlans = [
  {
    name: 'Basic',
    coins: 1000,
    price: 999,
    description: 'You can use this coin to purchase our services',
    features: [
      '1000 Z Coins',
      'Access to basic algorithms',
      '1 market integration',
      'Email support',
    ],
    cta: 'Buy Now',
    popular: false,
  },
  {
    name: 'Pro',
    coins: 2500,
    price: 2249,
    description: 'You can use this coin to purchase our services',
    features: [
      '2500 Z Coins',
      'Access to advanced algorithms',
      '3 market integrations',
      'Priority email & chat support',
      'Strategy backtesting',
    ],
    cta: 'Buy Now',
    popular: true,
    tag: 'Best Value',
  },
  {
    name: 'Premium',
    coins: 5000,
    price: 4499,
    description: 'You can use this coin to purchase our services',
    features: [
      '5000 Z Coins',
      'Access to all algorithms',
      'Unlimited market integrations',
      'Priority 24/7 support',
      'Advanced strategy backtesting',
      'Custom algorithm development',
    ],
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
                className={`relative rounded-xl overflow-hidden backdrop-blur-sm transition-transform hover:translate-y-[-8px] ${
                  plan.popular
                    ? 'bg-gradient-to-b from-zinc-800/70 to-zinc-900/70 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                    : 'bg-gradient-to-b from-zinc-800/40 to-zinc-900/40 border border-zinc-700/30'
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={planInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
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

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg
                          className={`w-5 h-5 mr-2 mt-0.5 ${plan.popular ? 'text-indigo-400' : 'text-zinc-400'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-zinc-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      plan.popular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-700/20 hover:shadow-indigo-700/40'
                        : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#faq"
            className="text-indigo-400 hover:text-indigo-300 text-sm inline-flex items-center"
          >
            Have questions? Check our FAQ
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
