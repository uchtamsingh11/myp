'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../contexts/AuthContext';
import RateLimitNotice from '../../components/auth/RateLimitNotice';

// Create a client component that uses useSearchParams
const AuthContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, signInWithOAuth, signInWithMagicLink } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
    name: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check for redirectTo query param to use after authentication
  const redirectTo = searchParams.get('redirectTo');

  // Check if user is returning after email verification
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (searchParams.get('type') === 'signup' && searchParams.get('email_confirmed') === 'true') {
        setVerificationSuccess(true);
        setIsLogin(true);

        toast.success('Email verified successfully! You can now log in.', {
          autoClose: 5000,
        });

        // Remove query parameters from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Check if this is a Fyers callback continuation
      const requiresAuth = searchParams.get('requiresAuth');
      const source = searchParams.get('source');
      const authCode = searchParams.get('authCode');

      if (requiresAuth === 'true' && source === 'fyers_callback' && authCode) {
        console.log('Detected Fyers callback continuation, will resume after login');
      }
    };

    checkEmailVerification();
  }, [searchParams]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle login form submission
  const handleLoginSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (isMagicLink) {
      handleMagicLinkLogin();
      return;
    }

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Add a small delay before attempting login to help with rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

      const { error } = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast.success('Login successful! Redirecting...');

      // Handle redirects
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setLoading(false);

      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Incorrect email or password. Please try again.');
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Please verify your email before logging in.');
      } else if (
        error.status === 429 ||
        error.message?.includes('too many requests') ||
        error.message?.includes('rate limit')
      ) {
        toast.error('Too many login attempts. Please wait a moment and try again.');
        // Add a longer delay for rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        toast.error(error.message || 'Error signing in');
      }

      console.error('Login error:', error);
    }
  };

  // Handle magic link login
  const handleMagicLinkLogin = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const { error } = await signInWithMagicLink(
        formData.email,
        redirectTo ? `${window.location.origin}/auth/callback?redirectTo=${redirectTo}` : undefined
      );

      if (error) throw error;

      toast.success('Magic link sent! Check your email to log in.', {
        autoClose: 5000,
      });
    } catch (error) {
      toast.error(error.message || 'Error sending magic link');
      console.error('Magic link error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle signup form submission
  const handleSignupSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Use the server-side signup API for better security
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creating account');
      }

      // Show success notification about email verification
      toast.info('Please check your email to verify your account. Redirecting to login...', {
        autoClose: 5000,
      });

      // Reset form and switch to login mode after 5 seconds
      setTimeout(() => {
        setIsLogin(true);
        setFormData({
          email: formData.email, // Keep the email for convenience
          phoneNumber: '',
          password: '',
          name: '',
          confirmPassword: '',
        });
      }, 5000);
    } catch (error) {
      // Show error notification with specific message
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match. Please try again.');
      } else if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please log in instead.');
      } else {
        toast.error(error.message || 'Error creating account');
      }

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setIsMagicLink(false);
    // Reset form data when switching modes
    setFormData({
      email: '',
      phoneNumber: '',
      password: '',
      name: '',
      confirmPassword: '',
    });
  };

  const toggleMagicLink = () => {
    setIsMagicLink(!isMagicLink);
    // If switching to magic link mode, we only need the email
    if (!isMagicLink) {
      setFormData({
        ...formData,
        password: '',
      });
    }
  };

  // Handle OAuth sign-in
  const handleOAuthSignIn = async provider => {
    try {
      setLoading(true);
      const { error } = await signInWithOAuth(
        provider,
        redirectTo ? `${window.location.origin}/auth/callback?redirectTo=${redirectTo}` : undefined
      );

      if (error) throw error;
    } catch (error) {
      setLoading(false);
      toast.error(error.message || `Error signing in with ${provider}`);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="bg-zinc-900 border border-zinc-800"
        progressClassName="bg-gradient-to-r from-blue-500 to-purple-500"
      />

      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900"></div>

        {/* Animated gradient blobs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[100px]"
          animate={{
            x: ['-20%', '30%', '-20%'],
            y: ['0%', '40%', '0%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[100px]"
          animate={{
            x: ['60%', '10%', '60%'],
            y: ['10%', '40%', '10%'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800">
            <motion.h2
              className="text-2xl font-bold text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Welcome to AlgoZ
            </motion.h2>
          </div>

          {/* Body */}
          <div className="p-6">
            <RateLimitNotice />

            {/* Verification Success Message */}
            {verificationSuccess && (
              <motion.div
                className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-green-400 font-medium mb-1">Email Verified Successfully!</h3>
                <p className="text-green-200 text-sm">
                  Your email has been verified. You can now log in to your account.
                </p>
              </motion.div>
            )}

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
            <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}>
              <motion.div
                key={isLogin ? (isMagicLink ? 'magic-link' : 'login') : 'signup'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
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

                {!isLogin && (
                  <div className="mb-4">
                    <label className="block text-zinc-400 mb-2 text-sm" htmlFor="phoneNumber">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                )}

                {isLogin && !isMagicLink && (
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
                      required={!isMagicLink}
                    />
                  </div>
                )}

                {!isLogin && (
                  <>
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
                    <div className="mb-4">
                      <label className="block text-zinc-400 mb-2 text-sm" htmlFor="confirmPassword">
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
                  </>
                )}

                {isLogin && (
                  <div className="flex justify-between mb-4">
                    <button
                      type="button"
                      className="text-sm text-zinc-400 hover:text-white"
                      onClick={toggleMagicLink}
                    >
                      {isMagicLink ? 'Use password' : 'Use magic link'}
                    </button>
                    <button
                      type="button"
                      className="text-sm text-zinc-400 hover:text-white"
                      onClick={() => router.push('/auth/reset-password')}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-zinc-800 to-black hover:from-zinc-700 hover:to-zinc-900 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                >
                  {isLogin
                    ? isMagicLink
                      ? loading
                        ? 'Sending Link...'
                        : 'Send Magic Link'
                      : loading
                        ? 'Logging in...'
                        : 'Login'
                    : loading
                      ? 'Creating Account...'
                      : 'Create Account'}
                </motion.button>
              </motion.div>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="px-4 text-sm text-zinc-500">OR</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              </motion.button>
              <motion.button
                className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOAuthSignIn('github')}
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </motion.button>
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
      </div>

      {/* Back to home link */}
      <div className="p-4 text-center relative z-10">
        <button
          onClick={() => router.push('/')}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
};

// Main page component with suspense boundary
const AuthPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
};

export default AuthPage;
