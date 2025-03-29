'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '../../../utils/supabase';
import MagicCard from '../../ui/MagicCard';
import GradientText from '../../ui/GradientText';
import Terminal from '../../ui/Terminal';
import BeamEffect from '../../ui/BeamEffect';
import ShimmerButton from '../../ui/ShimmerButton';
import GradientBorderButton from '../../ui/GradientBorderButton';
import Perspective3DCard from '../../ui/Perspective3DCard';
import Badge from '../../ui/Badge';
import GlowingText from '../../ui/GlowingText';
import IntroducingBadge from '../../ui/IntroducingBadge';
import PillButton from '../../ui/PillButton';
import BrowseButton from '../../ui/BrowseButton';

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

  // Terminal lines for demonstration
  const terminalLines = [
    "> Initializing AlgoZ trading system...",
    "> Loading market data and indicators...",
    "> AI prediction models ready",
    "> Trading signals analyzed: Strong buy detected on NIFTY",
    "> Ready for automated trading execution",
  ];

  // Line styles for the terminal
  const lineStyles = {
    0: 'text-green-500',
    1: 'text-zinc-300',
    2: 'text-zinc-300',
    3: 'text-purple-400',
    4: 'text-zinc-300',
  };

  return (
    <section className="relative min-h-screen overflow-hidden pt-28 md:pt-32 pb-20">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-violet-950/10"></div>

        {/* Grid pattern */}
        <motion.div
          className="absolute inset-0 grid-pattern"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.07 }}
          transition={{ duration: 2 }}
        ></motion.div>

        {/* Magic UI-style glow effects */}
        <motion.div
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] magic-glow"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ background: "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(107, 33, 168, 0.1) 70%)" }}
        ></motion.div>

        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] magic-glow"
          animate={{
            x: [0, -70, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ background: "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(67, 56, 202, 0.1) 70%)" }}
        ></motion.div>

        {/* Add BeamEffect for a moving light beam */}
        <BeamEffect
          direction="diagonal"
          speed={12}
          color="bg-purple-500/10"
        />
      </div>

      {/* Decorative elements (Magic UI style) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle animated lines */}
        <div className="absolute h-px w-full top-1/3 overflow-hidden opacity-30">
          <motion.div
            className="h-full w-[200%] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              repeat: Infinity,
              duration: 15,
              ease: "linear"
            }}
          ></motion.div>
        </div>

        {/* Particles effect */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/80"
              style={{
                width: Math.random() * 3 + 1 + "px",
                height: Math.random() * 3 + 1 + "px",
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                filter: "blur(0.5px)",
              }}
              animate={{
                opacity: [0.1, 0.5, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="container-custom relative z-10 mx-auto pt-10 md:pt-16">
        <div className="max-w-5xl mx-auto text-center">
          {/* Headline with animated gradient text */}
          <div className="relative mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-block relative mb-3">
                <IntroducingBadge>
                  ALGORITHMIC TRADING PLATFORM
                </IntroducingBadge>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight tracking-tight mb-4">
                <GradientText className="inline-block">
                  AI-Powered
                </GradientText>
                <br />
                <GradientText gradient="purple" className="inline">
                  Trading Simplified
                </GradientText>
              </h1>
            </motion.div>
          </div>

          {/* Subtitle with animation */}
          <motion.p
            className="text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Experience the future of trading with our AI-driven platform that makes sophisticated
            market analysis accessible to everyone.
          </motion.p>

          {/* CTA section with enhanced buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <BrowseButton href={getDestination()}>
              {user ? 'Go to Dashboard' : 'Get Started Now'}
            </BrowseButton>

            <BrowseButton dark href="#features">
              Explore Features
            </BrowseButton>
          </motion.div>

          {/* Terminal effect using our enhanced component inside Perspective3DCard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <Perspective3DCard
              depth={15}
              rotateIntensity={8}
              className="w-full"
            >
              <Terminal
                lines={terminalLines}
                title="AlgoZ Trading Terminal"
                lineStyles={lineStyles}
                typingSpeed={30}
                className="w-full"
              />
            </Perspective3DCard>

            {/* Feature highlights with Magic Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <MagicCard
                className="p-6"
                glowColor="purple"
                hoverEffect={true}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Lightning Fast</h3>
                  <p className="text-zinc-400 text-center">Execute trades in milliseconds with our high-performance infrastructure</p>
                </div>
              </MagicCard>

              <MagicCard
                className="p-6"
                glowColor="blue"
                hoverEffect={true}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Secure Trading</h3>
                  <p className="text-zinc-400 text-center">Bank-level encryption and security protocols protect your data and funds</p>
                </div>
              </MagicCard>

              <MagicCard
                className="p-6"
                glowColor="violet"
                hoverEffect={true}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">AI-Powered</h3>
                  <p className="text-zinc-400 text-center">Advanced machine learning algorithms analyze market data for smarter decisions</p>
                </div>
              </MagicCard>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
