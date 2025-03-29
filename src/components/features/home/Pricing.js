'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import GradientText from '../../ui/GradientText';
import GlowingText from '../../ui/GlowingText';
import Badge from '../../ui/Badge';
import BeamEffect from '../../ui/BeamEffect';
import Tooltip from '../../ui/Tooltip';
import IntroducingBadge from '../../ui/IntroducingBadge';

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for beginners looking to automate basic trading strategies',
    price: 29,
    billing: 'month',
    features: [
      { text: 'Up to 3 trading automations', included: true },
      { text: '24/7 trade execution', included: true },
      { text: 'Basic TradingView alerts', included: true },
      { text: 'Email notifications', included: true },
      { text: 'API connections to 5 exchanges', included: true },
      { text: 'Strategy backtest', included: false },
      { text: 'Advanced risk management', included: false },
      { text: 'Custom indicators', included: false },
    ],
    cta: 'Start for free',
    popular: false,
    badge: 'Basic',
    color: 'blue',
  },
  {
    name: 'Pro',
    description: 'Advanced features for serious traders seeking better performance',
    price: 79,
    billing: 'month',
    features: [
      { text: 'Unlimited trading automations', included: true },
      { text: '24/7 trade execution', included: true },
      { text: 'Advanced TradingView integration', included: true },
      { text: 'Real-time SMS & email alerts', included: true },
      { text: 'API connections to all exchanges', included: true },
      { text: 'Strategy backtest with historical data', included: true },
      { text: 'Advanced risk management', included: true },
      { text: 'Custom indicators', included: false },
    ],
    cta: 'Start 14-day trial',
    popular: true,
    badge: 'Popular',
    color: 'violet',
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for professional traders and institutions',
    price: 199,
    billing: 'month',
    features: [
      { text: 'Unlimited trading automations', included: true },
      { text: '24/7 trade execution', included: true },
      { text: 'Premium TradingView integration', included: true },
      { text: 'Priority SMS, email & phone alerts', included: true },
      { text: 'API connections to all exchanges', included: true },
      { text: 'Advanced backtesting & optimization', included: true },
      { text: 'Custom risk management profiles', included: true },
      { text: 'Custom indicators & strategies', included: true },
    ],
    cta: 'Contact sales',
    popular: false,
    badge: 'Premium',
    color: 'emerald',
  },
];

const PricingCard = ({ plan, isYearly }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const discountedPrice = isYearly ? Math.round(plan.price * 0.8) : plan.price;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5 }}
      className={`relative flex flex-col h-full ${plan.popular ? 'bg-[#1e1145] border-0' : 'bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50'} rounded-xl overflow-hidden ${plan.popular ? 'md:scale-105 z-10' : ''}`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute top-0 right-0 -mt-2 -mr-2 z-10">
          <Badge
            variant="premium"
            animated={true}
            size="md"
            glow={true}
            style={{ backgroundColor: 'rgba(124, 58, 237, 0.2)', borderColor: 'rgba(124, 58, 237, 0.3)' }}
          >
            MOST POPULAR
          </Badge>
        </div>
      )}

      {/* Plan header */}
      <div className={`p-6 border-b ${plan.popular ? 'border-zinc-700/50' : 'border-zinc-800'}`}>
        <Badge
          variant={plan.popular ? 'premium' : (plan.color === 'blue' ? 'info' : 'success')}
          className="mb-3"
          style={plan.popular ? { backgroundColor: 'rgba(124, 58, 237, 0.2)', borderColor: 'rgba(124, 58, 237, 0.3)' } : {}}
        >
          {plan.badge}
        </Badge>
        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-zinc-400 text-sm">{plan.description}</p>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold text-white">${discountedPrice}</span>
          <span className="text-zinc-500 ml-2">/{isYearly ? 'year' : 'month'}</span>
        </div>
        {isYearly && (
          <div className="mt-1">
            <Badge
              variant="warning"
              size="sm"
              style={{ backgroundColor: 'rgba(217, 119, 6, 0.2)', borderColor: 'rgba(217, 119, 6, 0.3)' }}
            >
              Save 20%
            </Badge>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="p-6 flex-grow">
        <ul className="space-y-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className={`flex-shrink-0 mt-1 ${feature.included ? 'text-green-500' : 'text-zinc-600'}`}>
                {feature.included ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </span>
              <span className={`ml-3 ${feature.included ? 'text-zinc-300' : 'text-zinc-500'}`}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="p-6 border-t ${plan.popular ? 'border-zinc-700/50' : 'border-zinc-800'}">
        <a
          href="#"
          className={`block w-full py-3 px-4 rounded-lg text-center font-medium text-white transition-all
            ${plan.popular
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
        >
          {plan.cta}
        </a>
      </div>
    </motion.div>
  );
};

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="pricing" className="py-16 md:py-24 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-[0.03]"></div>

      {/* Beam effect */}
      <BeamEffect
        direction="horizontal"
        count={2}
        speed={20}
        color="bg-violet-500/5"
      />

      {/* Animated background blob */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 bg-gradient-to-br from-purple-600/30 to-violet-600/30"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block relative mb-6">
            <IntroducingBadge>
              PRICING PLANS
            </IntroducingBadge>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <GradientText
              gradient="purple"
              className="inline"
            >
              Simple, Transparent Pricing
            </GradientText>
          </h2>

          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your trading needs. All plans include access to our core
            platform features.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center mt-12">
            <span className={`text-sm mr-3 ${!isYearly ? 'text-white' : 'text-zinc-400'}`}>Monthly</span>
            <div className="relative mx-1">
              <button
                className="relative w-14 h-7 bg-zinc-800 rounded-full transition-colors focus:outline-none"
                onClick={() => setIsYearly(!isYearly)}
                aria-label={isYearly ? "Switch to monthly billing" : "Switch to yearly billing"}
              >
                <motion.div
                  className="absolute top-1 left-1 bg-violet-500 w-5 h-5 rounded-full shadow-md"
                  animate={{ x: isYearly ? 7 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
                  </button>
            </div>
            <span className={`text-sm ml-3 ${isYearly ? 'text-white' : 'text-zinc-400'}`}>Yearly</span>
                </div>
              </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={index}
              plan={plan}
              isYearly={isYearly}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-zinc-400 mb-6">All plans come with a 14-day money-back guarantee</p>
          <div className="flex flex-wrap gap-6 items-center justify-center max-w-3xl mx-auto">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-zinc-300 text-sm">No credit card required for trial</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-zinc-300 text-sm">Cancel anytime</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
              <span className="text-zinc-300 text-sm">24/7 customer support</span>
            </div>
        </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
