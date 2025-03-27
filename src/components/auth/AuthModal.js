'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Here you would handle authentication logic
    console.log('Form submitted:', formData);
    // For demo purposes, just close the modal
    onClose();
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Reset form data when switching modes
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-2xl font-bold text-center">Welcome to AlgoZ</h2>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Tabs */}
                <div className="flex mb-6 border border-zinc-800 rounded-lg overflow-hidden">
                  <button
                    className={`flex-1 py-3 text-center transition-colors ${isLogin ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
                    onClick={() => setIsLogin(true)}
                  >
                    Login
                  </button>
                  <button
                    className={`flex-1 py-3 text-center transition-colors ${!isLogin ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
                    onClick={() => setIsLogin(false)}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isLogin ? 'login' : 'signup'}
                      initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {!isLogin && (
                        <div className="mb-4">
                          <label className="block text-zinc-400 mb-2 text-sm" htmlFor="name">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                      )}

                      <div className="mb-4">
                        <label className="block text-zinc-400 mb-2 text-sm" htmlFor="email">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-zinc-400 mb-2 text-sm" htmlFor="password">
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                          placeholder="Enter your password"
                          required
                        />
                      </div>

                      {!isLogin && (
                        <div className="mb-4">
                          <label
                            className="block text-zinc-400 mb-2 text-sm"
                            htmlFor="confirmPassword"
                          >
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            placeholder="Confirm your password"
                            required
                          />
                        </div>
                      )}

                      {isLogin && (
                        <div className="flex justify-end mb-4">
                          <button type="button" className="text-sm text-zinc-400 hover:text-white">
                            Forgot password?
                          </button>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-zinc-800 to-black hover:from-zinc-700 hover:to-zinc-900 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      >
                        {isLogin ? 'Login' : 'Create Account'}
                      </button>
                    </motion.div>
                  </AnimatePresence>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="px-4 text-sm text-zinc-500">OR</span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-lg transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-zinc-800 text-center">
                <p className="text-zinc-400 text-sm">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    className="text-zinc-300 hover:text-white font-medium"
                    onClick={toggleAuthMode}
                  >
                    {isLogin ? 'Sign up' : 'Login'}
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
