'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * IntroducingBadge - An animated "introducing" badge with glowing effects
 */
const IntroducingBadge = ({ children, className = '' }) => {
        return (
                <div className={`relative ${className}`}>
                        {/* Background glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-full blur-xl opacity-50" />

                        {/* Badge */}
                        <motion.div
                                className="relative flex items-center bg-gradient-to-r from-violet-950 to-indigo-950 text-xs font-semibold px-3 py-1.5 rounded-full border border-violet-800/30"
                                initial={{ y: 5, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                        >
                                {/* Shimmering effect */}
                                <motion.div
                                        className="absolute inset-0 overflow-hidden rounded-full"
                                        initial={{ opacity: 0.5, backgroundPosition: '0% 50%' }}
                                        animate={{
                                                opacity: [0.5, 0.8, 0.5],
                                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                        style={{
                                                background: 'linear-gradient(90deg, rgba(139, 92, 246, 0), rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0))',
                                                backgroundSize: '200% 100%'
                                        }}
                                />

                                {/* Dot */}
                                <motion.div
                                        className="w-1.5 h-1.5 rounded-full bg-violet-400 mr-2"
                                        animate={{
                                                scale: [1, 1.3, 1],
                                                opacity: [0.7, 1, 0.7]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                />

                                {/* Text content */}
                                <span className="relative text-zinc-200 tracking-wide">
                                        {children}
                                </span>
                        </motion.div>
                </div>
        );
};

export default IntroducingBadge;