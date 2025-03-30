'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleSubmit = e => {
    e.preventDefault();
    if (email) {
      // In a real application, you would send this to your API
      console.log('Subscribing email:', email);
      setIsSubmitted(true);
      setEmail('');

      // Reset the submission state after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }
  };

  return (
    <section className="py-24 bg-black relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-zinc-900/30"></div>

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Stay Ahead of the Market</h2>
            <p className="text-zinc-400">
              Subscribe to our newsletter for trading insights, market analysis, and platform
              updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-grow px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-600 text-white"
                required
              />
              <button
                type="submit"
                className="bg-zinc-100 hover:bg-zinc-200 text-black font-bold py-3 px-6 rounded-md transition-colors"
              >
                Subscribe
              </button>
            </div>

            <AnimatedCheckmark isVisible={isSubmitted} />

            <p className="text-zinc-500 text-sm text-center mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

const AnimatedCheckmark = ({ isVisible }) => {
  return (
    <div className="h-6 mt-2 text-center">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-green-500 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Thanks for subscribing!</span>
        </motion.div>
      )}
    </div>
  );
};

export default Newsletter;
