'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '../../../utils/supabase';
import { BorderBeam } from '../../magicui/border-beam.jsx';
import { RainbowButton } from '../../magicui/rainbow-button.jsx';

const Hero = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  // Get the destination based on auth status
  const getDestination = () => {
    if (loading) return '/auth'; // Default to auth while checking
    return user ? '/dashboard' : '/auth';
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 md:pt-24">
      {/* Solid black background */}
      <div className="absolute inset-0 bg-black"></div>

      {/* Grid pattern overlay with minimal opacity */}
      <div
        className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-[0.05]"
      ></div>

      {/* Floating geometric shapes with minimal opacity */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {/* Triangle */}
        <div
          className="absolute w-24 h-24 border-2 border-zinc-700/30"
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            top: '20%',
            left: '10%'
          }}
        />

        {/* Square */}
        <div
          className="absolute w-16 h-16 border-2 border-zinc-700/30"
          style={{
            top: '30%',
            left: '80%'
          }}
        />

        {/* Circle */}
        <div
          className="absolute w-20 h-20 rounded-full border-2 border-zinc-700/30"
          style={{
            top: '70%',
            left: '70%'
          }}
        />
      </div>

      <div className="container-custom relative z-10 text-left px-4 md:px-6 pt-12 md:pt-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
            <motion.span
              className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500 block"
              animate={{
                backgroundPosition: ['0% center', '100% center', '0% center'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              AI-Powered Trading, Simplified
            </motion.span>
            <motion.span
              className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500 block mt-2"
              animate={{
                backgroundPosition: ['0% center', '100% center', '0% center'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              -AlgoZ
            </motion.span>
          </h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-zinc-400 mb-8 md:mb-10 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Maximize gains and safeguard investments with next-generation algorithmic trading
            solutions
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href={user ? '/dashboard' : '/auth'}>
              <RainbowButton>
                {user ? 'Go to Dashboard' : 'Get Started Free'}
              </RainbowButton>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-transparent border border-zinc-700 hover:border-zinc-500 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                Explore Features
              </button>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hidden md:block"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 5V19M12 19L5 12M12 19L19 12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </section>
  );
};

export default Hero;