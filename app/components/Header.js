'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../src/utils/supabase';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
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
    { label: 'FAQ', href: '/#faq' }
  ];

  return (
    <motion.header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/90 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-custom flex justify-between items-center px-4 md:px-6">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-2xl font-bold tracking-tight">AlgoZ</span>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav 
          className="hidden md:flex space-x-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {navLinks.map((link, index) => (
            <a 
              key={index}
              href={link.href}
              className="text-zinc-300 hover:text-white font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </motion.nav>

        {/* CTA Buttons */}
        <motion.div 
          className="hidden md:flex items-center space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <a href="/auth">
            <button className="btn-primary">Get Started</button>
          </a>
        </motion.div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-zinc-300 hover:text-white p-2"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div 
        className={`md:hidden bg-zinc-900/95 backdrop-blur-md py-4 absolute w-full top-full left-0 z-40 shadow-lg border-t border-zinc-800 ${mobileMenuOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: mobileMenuOpen ? 1 : 0, 
          height: mobileMenuOpen ? 'auto' : 0 
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="container-custom flex flex-col space-y-4 px-4">
          {navLinks.map((link, index) => (
            <a 
              key={index}
              href={link.href}
              className="text-zinc-300 hover:text-white py-2 px-3 font-medium transition-colors border-b border-zinc-800/50 last:border-0"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          
          {/* User Email on Mobile */}
          {user && (
            <div className="py-2 text-white font-semibold truncate">
              {user.email}
            </div>
          )}

          <div className="flex flex-col space-y-3 pt-3 border-t border-zinc-800">
            <a href="/auth" onClick={() => setMobileMenuOpen(false)}>
              <button className="btn-primary w-full">Get Started</button>
            </a>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Header;