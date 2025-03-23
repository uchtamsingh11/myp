'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const pricingPlans = [
  {
    name: "Basic",
    coins: 1000,
    price: 999,
    description: "You can use this coin to purchase our services",
    features: [
      "1000 Z Coins"
    ],
    cta: "Buy Now",
    popular: false
  },
  {
    name: "Pro",
    coins: 2500,
    price: 2249,
    description: "You can use this coin to purchase our services",
    features: [
      "2500 Z Coins"
    ],
    cta: "Buy Now",
    popular: true,
    tag: "Best Value"
  },
  {
    name: "Premium",
    coins: 5000,
    price: 4499,
    description: "You can use this coin to purchase our services",
    features: [
      "5000 Z Coins"
    ],
    cta: "Buy Now",
    popular: false
  }
];

const Pricing = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="pricing" className="py-24 bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-zinc-800/10 to-transparent"></div>
      
      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Pricing Plans</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => {
            const [planRef, planInView] = useInView({
              triggerOnce: true,
              threshold: 0.1,
            });
            
            return (
              <motion.div
                key={index}
                ref={planRef}
                className={`card relative ${
                  plan.popular ? 'border-zinc-600 ring-1 ring-zinc-600' : ''
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={planInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-zinc-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {plan.tag || "Most Popular"}
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  {plan.tag && (
                    <div className="mb-2">
                      <span className="bg-zinc-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {plan.tag}
                      </span>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <div className="flex items-center">
                      <span className="text-4xl font-bold">{plan.coins}</span>
                      <span className="text-xl text-zinc-400 ml-2">Z Coins for</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">₹{plan.price}</span>
                    </div>
                  </div>
                  
                  <p className="text-zinc-400 text-sm mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-5 h-5 text-zinc-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    plan.popular 
                      ? 'bg-zinc-100 text-black hover:bg-zinc-200' 
                      : 'bg-zinc-800 text-white hover:bg-zinc-700'
                  }`}>
                    {plan.cta}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;