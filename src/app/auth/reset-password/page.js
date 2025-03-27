'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../utils/supabase';

const ResetPasswordPage = () => {
        const router = useRouter();
        const searchParams = useSearchParams();
        const { resetPassword } = useAuth();

        const [email, setEmail] = useState('');
        const [newPassword, setNewPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [loading, setLoading] = useState(false);
        const [emailSent, setEmailSent] = useState(false);

        // Check if this is a reset confirmation (accessed via email link)
        const isResetConfirmation = searchParams.has('type') && searchParams.get('type') === 'recovery';

        // Handle sending reset password email
        const handleSendResetEmail = async (e) => {
                e.preventDefault();

                if (!email) {
                        toast.error('Please enter your email address');
                        return;
                }

                try {
                        setLoading(true);
                        const { error } = await resetPassword(email);

                        if (error) throw error;

                        setEmailSent(true);
                        toast.success('Reset password email sent! Please check your inbox.');
                } catch (error) {
                        toast.error(error.message || 'Failed to send reset email');
                        console.error('Reset password error:', error);
                } finally {
                        setLoading(false);
                }
        };

        // Handle setting new password
        const handleSetNewPassword = async (e) => {
                e.preventDefault();

                if (!newPassword || !confirmPassword) {
                        toast.error('Please fill in all fields');
                        return;
                }

                if (newPassword !== confirmPassword) {
                        toast.error('Passwords do not match');
                        return;
                }

                if (newPassword.length < 6) {
                        toast.error('Password must be at least 6 characters');
                        return;
                }

                try {
                        setLoading(true);

                        // Get the access token from the URL
                        const accessToken = searchParams.get('access_token');

                        if (!accessToken) {
                                throw new Error('No access token found. Please try again.');
                        }

                        const { error } = await supabase.auth.updateUser({
                                password: newPassword
                        });

                        if (error) throw error;

                        toast.success('Password updated successfully!');

                        // Redirect to login page after 2 seconds
                        setTimeout(() => {
                                router.push('/auth');
                        }, 2000);

                } catch (error) {
                        toast.error(error.message || 'Failed to update password');
                        console.error('Update password error:', error);
                } finally {
                        setLoading(false);
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
                                                        {isResetConfirmation ? 'Set New Password' : 'Reset Your Password'}
                                                </motion.h2>
                                        </div>

                                        {/* Body */}
                                        <div className="p-6">
                                                {!isResetConfirmation ? (
                                                        <>
                                                                {emailSent ? (
                                                                        <div className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded-lg">
                                                                                <h3 className="text-green-400 font-medium mb-1">Check Your Email</h3>
                                                                                <p className="text-green-200 text-sm mb-4">
                                                                                        We've sent you an email with a link to reset your password. Please check your inbox and spam folder.
                                                                                </p>
                                                                                <button
                                                                                        onClick={() => setEmailSent(false)}
                                                                                        className="text-sm text-blue-400 hover:text-blue-300"
                                                                                >
                                                                                        Try again with a different email?
                                                                                </button>
                                                                        </div>
                                                                ) : (
                                                                        <form onSubmit={handleSendResetEmail}>
                                                                                <div className="mb-6">
                                                                                        <p className="text-zinc-400 mb-4">
                                                                                                Enter your email address and we'll send you a link to reset your password.
                                                                                        </p>
                                                                                        <div className="mb-4">
                                                                                                <label className="block text-zinc-400 mb-2 text-sm" htmlFor="email">
                                                                                                        Email Address
                                                                                                </label>
                                                                                                <input
                                                                                                        type="email"
                                                                                                        id="email"
                                                                                                        value={email}
                                                                                                        onChange={(e) => setEmail(e.target.value)}
                                                                                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                                                                                                        placeholder="Enter your email"
                                                                                                        required
                                                                                                />
                                                                                        </div>
                                                                                        <motion.button
                                                                                                type="submit"
                                                                                                className="w-full bg-gradient-to-r from-zinc-800 to-black hover:from-zinc-700 hover:to-zinc-900 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                                                                                whileHover={{ scale: 1.02 }}
                                                                                                whileTap={{ scale: 0.98 }}
                                                                                                disabled={loading}
                                                                                        >
                                                                                                {loading ? 'Sending...' : 'Send Reset Link'}
                                                                                        </motion.button>
                                                                                </div>
                                                                        </form>
                                                                )}
                                                        </>
                                                ) : (
                                                        <form onSubmit={handleSetNewPassword}>
                                                                <div className="mb-6">
                                                                        <p className="text-zinc-400 mb-4">
                                                                                Enter your new password below.
                                                                        </p>
                                                                        <div className="mb-4">
                                                                                <label className="block text-zinc-400 mb-2 text-sm" htmlFor="newPassword">
                                                                                        New Password
                                                                                </label>
                                                                                <input
                                                                                        type="password"
                                                                                        id="newPassword"
                                                                                        value={newPassword}
                                                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                                                                                        placeholder="Enter new password"
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
                                                                                        value={confirmPassword}
                                                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                                                                                        placeholder="Confirm your password"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                        <motion.button
                                                                                type="submit"
                                                                                className="w-full bg-gradient-to-r from-zinc-800 to-black hover:from-zinc-700 hover:to-zinc-900 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                                                                whileHover={{ scale: 1.02 }}
                                                                                whileTap={{ scale: 0.98 }}
                                                                                disabled={loading}
                                                                        >
                                                                                {loading ? 'Updating...' : 'Update Password'}
                                                                        </motion.button>
                                                                </div>
                                                        </form>
                                                )}
                                        </div>

                                        {/* Footer */}
                                        <div className="p-6 border-t border-zinc-800 text-center">
                                                <button
                                                        onClick={() => router.push('/auth')}
                                                        className="text-zinc-400 hover:text-white transition-colors"
                                                >
                                                        Back to Login
                                                </button>
                                        </div>
                                </motion.div>
                        </div>
                </div>
        );
};

export default ResetPasswordPage; 