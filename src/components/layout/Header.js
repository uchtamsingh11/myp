'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabase';
import Link from 'next/link';
import GradientText from '../ui/GradientText';
import GlowingText from '../ui/GlowingText';
import Badge from '../ui/Badge';
import ShimmerButton from '../ui/ShimmerButton';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation links data
  const navLinks = [
    { label: 'Home', href: '/#' },
    { label: 'Features', href: '/#features' },
    { label: 'How it Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQ', href: '/#faq' },
  ];

  // Get the destination based on auth status
  const getDestination = () => {
    if (loading) return '/auth'; // Default to auth while checking
    return user ? '/dashboard' : '/auth';
  };

  // Magic UI-inspired reveal animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.header
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
        ? 'bg-zinc-950/85 backdrop-blur-md py-3 shadow-lg border-b border-zinc-800/30'
        : 'bg-transparent py-5'
        }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated gradient line at the bottom of header when scrolled */}
      {isScrolled && (
        <motion.div
          className="absolute bottom-0 left-0 h-px w-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="h-full w-[200%] bg-gradient-to-r from-purple-500/0 via-violet-500/50 to-purple-500/0"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "linear"
            }}
          />
        </motion.div>
      )}

      <div className="container-custom flex justify-between items-center px-4 md:px-6">
        {/* Logo */}
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="mr-2 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur-sm opacity-75"></div>
                <div className="relative bg-zinc-900 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
              </div>
              <GradientText
                gradient="purple"
                className="text-xl font-bold tracking-tight"
              >
                AlgoZ
              </GradientText>
            </div>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav
          className="hidden md:flex items-center space-x-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {navLinks.map((link, index) => (
            <motion.div key={index} variants={itemVariants}>
              <a
                href={link.href}
                className="relative px-4 py-2 text-sm text-zinc-300 hover:text-white font-medium transition-colors rounded-md group"
              >
                {/* Hover effect */}
                <motion.span
                  className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="navHover"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
                {link.label}
              </a>
            </motion.div>
          ))}
        </motion.nav>

        {/* CTA Buttons */}
        <motion.div
          className="hidden md:flex items-center space-x-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Link href={getDestination()}>
              <ShimmerButton
                className="px-5 py-2 text-sm font-medium"
                shimmerColor="#a855f7"
              >
                {user ? 'Dashboard' : 'Get Started'}
              </ShimmerButton>
            </Link>
          </motion.div>

          {user && (
            <motion.div
              variants={itemVariants}
              className="ml-4 relative"
            >
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full opacity-75 blur-sm"></div>
                <div className="relative bg-zinc-900 rounded-full w-9 h-9 flex items-center justify-center border border-zinc-700/50">
                  <span className="text-white font-medium text-sm">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <Badge
                  variant="success"
                  className="absolute -top-1 -right-1"
                  size="xs"
                >
                  •
                </Badge>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative text-zinc-300 hover:text-white p-2 rounded-md"
            aria-label="Toggle mobile menu"
            whileTap={{ scale: 0.9 }}
          >
            <motion.span
              className="absolute inset-0 rounded-md bg-white/[0.07] opacity-0"
              animate={{ opacity: mobileMenuOpen ? 1 : 0 }}
            />
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden overflow-hidden"
        initial={false}
        animate={{ height: mobileMenuOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="bg-zinc-900/95 backdrop-blur-md py-4 border-t border-zinc-800/50 shadow-lg">
          <div className="container-custom flex flex-col space-y-1 px-4">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-zinc-300 hover:text-white py-3 px-4 font-medium transition-colors rounded-md hover:bg-white/[0.07]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {/* User Email on Mobile */}
            {user && (
              <div className="py-3 px-4 mt-3 text-white font-semibold truncate border-t border-zinc-800/50 flex items-center">
                <div className="relative mr-3">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full opacity-75 blur-sm"></div>
                  <div className="relative bg-zinc-900 rounded-full w-8 h-8 flex items-center justify-center border border-zinc-700/50">
                    <span className="text-white font-medium text-sm">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </div>
                <GlowingText color="blue" className="text-sm">
                  {user.email}
                </GlowingText>
              </div>
            )}

            <div className="flex flex-col space-y-3 pt-4 mt-2 border-t border-zinc-800/50">
              <Link
                href={getDestination()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <ShimmerButton className="w-full py-3">
                  {user ? 'Dashboard' : 'Get Started'}
                </ShimmerButton>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Header;
