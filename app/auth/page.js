'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '../../src/utils/supabase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthPage = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
    name: '',
    confirmPassword: '',
    referral: ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch user profile data
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Check if user is returning after email verification
  useEffect(() => {
    const checkEmailVerification = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('type') === 'signup' && params.get('email_confirmed') === 'true') {
        setVerificationSuccess(true);
        setIsLogin(true);
        
        // Show success notification
        toast.success('Email verified successfully! You can now log in.', {
          autoClose: 5000,
        });
        
        // Remove query parameters from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    checkEmailVerification();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check admin credentials
  const ADMIN_EMAIL = 'uchtamsingh@gmail.com';
  const ADMIN_PASSWORD = 'Zuari@11';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Check if the user is trying to log in as admin
        const isAdminLogin = formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD;
        
        // Handle login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          // Show error notification for incorrect credentials
          toast.error('Incorrect email or password. Please try again.');
          throw error;
        }
        
        // Fetch user profile data
        const profileData = await fetchUserProfile(data.user.id);
        
        // Store user data in localStorage for easy access
        if (profileData) {
          localStorage.setItem('userProfile', JSON.stringify(profileData));
        }
        
        // If admin login, notify user
        if (isAdminLogin) {
          toast.success('Admin login successful! Redirecting to admin dashboard...');
          // Store admin status in localStorage
          localStorage.setItem('isAdmin', 'true');
        } else {
          // Show regular success notification
          toast.success('Login successful! Redirecting to dashboard...');
          // Clear admin status if not admin
          localStorage.removeItem('isAdmin');
        }
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Handle signup with Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
          }
        });

        if (authError) throw authError;
        
        if (!authData.user) throw new Error('User creation failed');

        // Generate a unique referral code for the user (this is their own referral code to share)
        const namePart = formData.name.split(' ')[0].toLowerCase().substring(0, 4);
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const userReferralCode = `${namePart}-${randomPart}`;

        // Create a base profile object
        const profileData = { 
          id: authData.user.id,
          full_name: formData.name,
          phone_number: formData.phoneNumber,
          referral_code: userReferralCode,
          created_at: new Date(),
        };
        
        // Add referral_used only if the column exists and a referral was provided
        if (formData.referral) {
          try {
            profileData.referral_used = formData.referral;
          } catch (error) {
            console.log('Referral_used column might not exist yet:', error);
            // Continue without the referral_used field
          }
        }

        // Store additional user data in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) throw profileError;

        // Show success notification about email verification
        toast.info('Please check your email to verify your account. Redirecting to login...', {
          autoClose: 5000,
        });
        
        console.log('Signup successful:', authData);
        
        // Reset form and switch to login mode after 5 seconds
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            email: formData.email, // Keep the email for convenience
            phoneNumber: '',
            password: '',
            name: '',
            confirmPassword: '',
            referral: ''
          });
        }, 5000);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Show error notification with specific message
      if (!isLogin && formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match. Please try again.');
      } else if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please log in instead.');
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Incorrect email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please verify your email before logging in. Check your inbox for the verification link.');
      } else {
        toast.error(error.message || 'Authentication failed. Please try again.');
      }
      
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Reset form data when switching modes
    setFormData({
      email: '',
      phoneNumber: '',
      password: '',
      name: '',
      confirmPassword: '',
      referral: ''
    });
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
            ease: "easeInOut"
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
            ease: "easeInOut"
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
            <form onSubmit={handleSubmit}>
              <motion.div
                key={isLogin ? 'login' : 'signup'}
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
                )}
                
                {!isLogin && (
                  <div className="mb-4">
                    <label className="block text-zinc-400 mb-2 text-sm" htmlFor="referral">
                      Referral Code <span className="text-zinc-500">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="referral"
                      name="referral"
                      value={formData.referral}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      placeholder="Enter referral code if you have one"
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
                  {isLogin ? (loading ? 'Logging in...' : 'Login') : (loading ? 'Creating Account...' : 'Create Account')}
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
                onClick={async () => {
                  try {
                    setLoading(true);
                    const { data, error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                      },
                    });
                    if (error) throw error;
                  } catch (error) {
                    setError(error.message);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </motion.button>
              <motion.button 
                className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  try {
                    setLoading(true);
                    const { data, error } = await supabase.auth.signInWithOAuth({
                      provider: 'facebook',
                      options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                      },
                    });
                    if (error) throw error;
                  } catch (error) {
                    setError(error.message);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
                Facebook
              </motion.button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-400 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
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

export default AuthPage;