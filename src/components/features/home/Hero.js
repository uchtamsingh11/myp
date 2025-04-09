'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '../../../utils/supabase';
import { Meteors } from '../../ui/effects/Meteors';
import { RainbowButton } from '../../ui/buttons/RainbowButton';
import GradientText from '../../ui/effects/GradientText';

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
      {/* Meteors Effect - repositioned */}
      <div className="absolute inset-0 overflow-hidden z-[20]">
        <Meteors
          number={80}
          minDuration={2}
          maxDuration={4}
          angle={215}
          className="opacity-50"
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
              <GradientText
                gradient="purple"
                className="inline"
              >
                AI-Powered Trading, Simplified
              </GradientText>
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
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
