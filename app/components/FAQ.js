'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const faqs = [
  {
    question: "What is algorithmic trading?",
    answer: "Algorithmic trading uses computer programs and mathematical models to execute trades based on predefined criteria such as price, timing, and volume. These algorithms can analyze market data and execute trades faster and more efficiently than human traders."
  },
  {
    question: "Do I need trading experience to use AlgoZ?",
    answer: "While prior trading experience is beneficial, AlgoZ is designed to be accessible to traders of all levels. Our platform includes educational resources and pre-built strategies that beginners can use, while experienced traders can customize algorithms to match their specific trading styles."
  },
  {
    question: "How much capital do I need to start?",
    answer: "You can start with as little as ₹1,000, though we recommend at least ₹5,000 to properly diversify across multiple algorithms and markets. Our risk management tools help protect your capital regardless of your account size."
  },
  {
    question: "Which markets can I trade with AlgoZ?",
    answer: "AlgoZ supports trading across multiple markets including stocks, options, futures, forex, and cryptocurrencies. The specific markets available depend on your subscription plan and broker integration."
  },
  {
    question: "How do I connect my brokerage account?",
    answer: "AlgoZ integrates with most major brokerages through secure API connections. After signing up, you'll be guided through the process of connecting your existing brokerage account or opening a new one with one of our partner brokers."
  },
  {
    question: "What kind of returns can I expect?",
    answer: "While past performance doesn't guarantee future results, our top-performing algorithms have historically generated annual returns between 15-30%. Individual results may vary based on market conditions, the algorithms you select, and your risk settings."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We employ bank-level encryption and security protocols to protect your personal and financial information. We never store your brokerage credentials, and all API connections are secured with OAuth or similar authentication methods."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access until the end of your current billing period. We don't lock you into long-term contracts."
  }
];

const FAQItem = ({ faq, index, isOpen, toggleOpen }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      className="border-b border-zinc-800 py-4 sm:py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <button
        className="flex justify-between items-center w-full text-left group"
        onClick={() => toggleOpen(index)}
      >
        <h3 className="text-base sm:text-lg font-medium group-hover:text-white transition-colors">{faq.question}</h3>
        <div className={`flex-shrink-0 ml-4 p-1 rounded-full ${isOpen ? 'bg-indigo-600/20' : 'bg-zinc-800'} transition-colors`}>
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 transform transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : 'text-zinc-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
            className="overflow-hidden"
          >
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const toggleOpen = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-zinc-950 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_top,_var(--tw-gradient-stops))] from-transparent via-zinc-900/20 to-transparent"></div>
      
      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Have questions about AlgoZ? Find answers to the most common questions below.
          </p>
        </motion.div>
        
        <div className="max-w-3xl mx-auto rounded-xl bg-zinc-900/30 border border-zinc-800/50 p-4 sm:p-6 md:p-8">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              toggleOpen={toggleOpen}
            />
          ))}
          
          <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-400 text-sm mb-4">Still have questions?</p>
            <a 
              href="https://t.me/AlgoZsupport1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;