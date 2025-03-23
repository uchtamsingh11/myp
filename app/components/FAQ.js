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
      className="border-b border-zinc-800 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => toggleOpen(index)}
      >
        <h3 className="text-lg font-medium">{faq.question}</h3>
        <svg
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
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
            <p className="mt-4 text-zinc-400">{faq.answer}</p>
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
    <section id="faq" className="py-24 bg-zinc-950 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_top,_var(--tw-gradient-stops))] from-transparent via-zinc-900/20 to-transparent"></div>
      
      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Have questions about AlgoZ? Find answers to the most common questions below.
          </p>
        </motion.div>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              toggleOpen={toggleOpen}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;