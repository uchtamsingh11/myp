'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import GradientText from '../../ui/GradientText';
import GlowingText from '../../ui/GlowingText';
import Badge from '../../ui/Badge';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // null, 'success', 'error'
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      // Reset status after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    }, 1000);
  };

  return (
    <section className="py-16 md:py-24 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-[0.03]"></div>

      {/* Animated background blob */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 bg-gradient-to-br from-violet-600/30 to-indigo-600/30"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 15,
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
          className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6 md:p-10 max-w-4xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left content */}
            <div className="flex-1">
              <Badge
                variant="premium"
                size="md"
                animated={true}
                className="mb-4"
              >
                NEWSLETTER
              </Badge>

              <GradientText
                gradient="purple"
                as="h2"
                className="text-2xl md:text-3xl font-bold mb-4"
              >
                Get <GlowingText>Trading Tips</GlowingText> & Strategies
              </GradientText>

              <p className="text-zinc-400 mb-6">
                Join our newsletter for market insights, trading strategies, and exclusive platform updates.
                Never miss opportunities to improve your trading performance.
              </p>

              <div className="hidden lg:flex items-center gap-4 text-sm text-zinc-500">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Weekly updates</span>
                </div>

                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unsubscribe anytime</span>
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="w-full lg:w-auto lg:min-w-[340px]">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 bg-zinc-800/80 border ${status === 'error'
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-zinc-700 focus:border-violet-500'
                      } rounded-lg focus:outline-none transition-colors`}
                    required
                  />
                  {status === 'error' && (
                    <p className="mt-1 text-sm text-red-500">Please enter a valid email address</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-lg font-medium text-white transition-all shadow-lg shadow-violet-700/20 hover:shadow-violet-700/40"
                >
                  {status === 'success' ? (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Subscribed!
                    </span>
                  ) : (
                    'Subscribe Now'
                  )}
                </button>

                <p className="text-xs text-zinc-500 text-center">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>

              <div className="flex lg:hidden items-center justify-center gap-4 text-sm text-zinc-500 mt-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Weekly</span>
                </div>

                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unsubscribe anytime</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
