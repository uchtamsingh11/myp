'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * GlowingText - A component that adds a glowing effect to text
 */
const GlowingText = ({
        children,
        color = 'violet',
        animate = true,
        className = '',
        as: Component = 'span',
        intensity = 'medium',
        ...props
}) => {
        // Define color values for different options
        const colorMap = {
                violet: {
                        text: 'text-violet-300',
                        glow: 'from-violet-400 to-violet-600',
                        shadow: 'shadow-violet-500/50',
                },
                blue: {
                        text: 'text-blue-300',
                        glow: 'from-blue-400 to-blue-600',
                        shadow: 'shadow-blue-500/50',
                },
                cyan: {
                        text: 'text-cyan-300',
                        glow: 'from-cyan-400 to-cyan-600',
                        shadow: 'shadow-cyan-500/50',
                },
                green: {
                        text: 'text-green-300',
                        glow: 'from-green-400 to-green-600',
                        shadow: 'shadow-green-500/50',
                },
                yellow: {
                        text: 'text-yellow-300',
                        glow: 'from-yellow-400 to-yellow-600',
                        shadow: 'shadow-yellow-500/50',
                },
                amber: {
                        text: 'text-amber-300',
                        glow: 'from-amber-400 to-amber-600',
                        shadow: 'shadow-amber-500/50',
                },
                orange: {
                        text: 'text-orange-300',
                        glow: 'from-orange-400 to-orange-600',
                        shadow: 'shadow-orange-500/50',
                },
                red: {
                        text: 'text-red-300',
                        glow: 'from-red-400 to-red-600',
                        shadow: 'shadow-red-500/50',
                },
                pink: {
                        text: 'text-pink-300',
                        glow: 'from-pink-400 to-pink-600',
                        shadow: 'shadow-pink-500/50',
                },
                white: {
                        text: 'text-white',
                        glow: 'from-white to-slate-200',
                        shadow: 'shadow-white/50',
                },
        };

        // Get color values based on the color prop, defaulting to violet if not found
        const colorValues = colorMap[color] || colorMap.violet;

        // Define intensity levels
        const intensityMap = {
                low: 'blur-[1px]',
                medium: 'blur-[2px]',
                high: 'blur-[3px]',
        };

        const blurLevel = intensityMap[intensity] || intensityMap.medium;

        return (
                <Component
                        className={`relative inline-block ${colorValues.text} ${className}`}
                        {...props}
                >
                        {/* Text glow effect */}
                        <span className="relative z-10">{children}</span>

                        {/* Background glow */}
                        {animate ? (
                                <motion.span
                                        className={`absolute inset-0 -z-10 bg-gradient-to-r ${colorValues.glow} opacity-50 ${blurLevel}`}
                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        aria-hidden="true"
                                />
                        ) : (
                                <span
                                        className={`absolute inset-0 -z-10 bg-gradient-to-r ${colorValues.glow} opacity-50 ${blurLevel}`}
                                        aria-hidden="true"
                                />
                        )}
                </Component>
        );
};

export default GlowingText; 