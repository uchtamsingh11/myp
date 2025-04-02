'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import GradientText from '../../ui/effects/GradientText';
import GlowingText from '../../ui/effects/GlowingText';
import Tooltip from '../../ui/tooltips/Tooltip';
import Badge from '../../ui/badges/Badge';
import BeamEffect from '../../ui/effects/BeamEffect';
import IntroducingBadge from '../../ui/badges/IntroducingBadge';

const faqs = [
  {
    question: 'How does algorithmic trading work?',
    answer:
      'Algorithmic trading uses computer programs to automatically execute trades based on predefined rules and market conditions. Our platform lets you implement these strategies without writing code yourself.',
    category: 'basics',
  },
  {
    question: 'Do I need coding experience to use your platform?',
    answer:
      'No coding experience is required. Our platform provides a user-friendly interface that allows you to select from pre-built strategies or customize your own using our visual strategy builder.',
    category: 'basics',
    highlight: true,
  },
  {
    question: 'What exchanges do you support?',
    answer:
      'We support all major cryptocurrency exchanges including Binance, Coinbase Pro, Bybit, KuCoin, Kraken, and many more. We also support integration with traditional brokerage platforms.',
    category: 'integration',
  },
  {
    question: 'How secure is my trading data?',
    answer:
      'We prioritize security with bank-level encryption, regular security audits, and we never store your private keys. We use API connections with limited permissions to execute trades on your behalf.',
    category: 'security',
    highlight: true,
  },
  {
    question: 'What are the costs involved?',
    answer:
      'We offer several subscription tiers starting from $29/month. Each plan includes different features based on your trading needs. We also offer a free tier with limited functionality so you can try before you buy.',
    category: 'pricing',
  },
  {
    question: 'Can I use this for traditional stock trading?',
    answer:
      'Yes, besides cryptocurrency exchanges, we also support integration with traditional brokerage platforms that offer API access, allowing you to implement algorithmic strategies for stocks, forex, and other markets.',
    category: 'integration',
  },
  {
    question: 'How fast can I get started?',
    answer:
      'You can set up your account and connect your first exchange in less than 10 minutes. Our quickstart guide will walk you through the process step by step, and our support team is available 24/7 to help if needed.',
    category: 'basics',
  },
  {
    question: 'Is there a mobile app available?',
    answer:
      'Yes, we offer mobile apps for both iOS and Android, allowing you to monitor your trading bots, adjust parameters, and get notifications on the go. All the core functionality of the platform is available on our mobile apps.',
    category: 'integration',
  },
];

const FAQItem = ({ faq, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      className={`border-b border-zinc-800 overflow-hidden ${faq.highlight ? 'relative' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Highlight badge for important FAQs */}
      {faq.highlight && (
        <Badge
          variant="premium"
          className="absolute right-0 top-6 z-10"
          animated={false}
          size="sm"
          style={{ backgroundColor: 'rgba(124, 58, 237, 0.2)', borderColor: 'rgba(124, 58, 237, 0.3)' }}
        >
          Popular
        </Badge>
      )}

      <button
        className="py-5 w-full flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <Tooltip
          content={faq.category === 'basics' ? 'Basic knowledge' :
            faq.category === 'security' ? 'Security information' :
              faq.category === 'pricing' ? 'Pricing details' :
                'Integration specifics'}
          position="top"
          disabled={isOpen}
        >
          <h3 className="text-lg md:text-xl font-medium text-white pr-16">
            {faq.question}
          </h3>
        </Tooltip>

        <div className={`transition-transform duration-300 transform ${isOpen ? 'rotate-45' : ''}`}>
          <svg className="w-6 h-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pb-5 text-zinc-400">
              <p>{faq.answer}</p>

              {/* Category badge */}
              <div className="mt-3">
                <Badge
                  variant={faq.category === 'basics' ? 'info' :
                    faq.category === 'security' ? 'success' :
                      faq.category === 'pricing' ? 'warning' :
                        'default'}
                  size="sm"
                  style={
                    faq.category === 'basics' ?
                      { backgroundColor: 'rgba(37, 99, 235, 0.2)', borderColor: 'rgba(37, 99, 235, 0.3)' } :
                      faq.category === 'security' ?
                        { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.3)' } :
                        faq.category === 'pricing' ?
                          { backgroundColor: 'rgba(217, 119, 6, 0.2)', borderColor: 'rgba(217, 119, 6, 0.3)' } :
                          { backgroundColor: 'rgba(124, 58, 237, 0.2)', borderColor: 'rgba(124, 58, 237, 0.3)' }
                  }
                >
                  {faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Filter categories
  const categories = ['all', 'basics', 'security', 'pricing', 'integration'];
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFaqs = activeCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <section id="faq" className="py-16 md:py-24 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-[0.03]"></div>

      {/* Beam effects */}
      <BeamEffect
        direction="horizontal"
        count={2}
        speed={20}
        thickness={50}
        color="bg-violet-500/5"
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
              QUESTIONS & ANSWERS
            </IntroducingBadge>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <GradientText
              gradient="purple"
              className="inline"
            >
              Frequently Asked Questions
            </GradientText>
          </h2>

          <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
            Find answers to common questions about our platform. If you need further assistance,
            our support team is always ready to help.
          </p>
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm transition-all 
                ${activeCategory === category
                  ? 'bg-violet-500/20 text-white border border-violet-500/40'
                  : 'text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6 md:p-8">
          <div className="space-y-1">
            {filteredFaqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} index={index} />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-zinc-400 mb-6">Still have questions?</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#"
              className="px-6 py-3 bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg text-white transition-all flex items-center space-x-2 backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span>Live Chat</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
