'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * Badge - A styled badge component with Magic UI styling
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content of the badge
 * @param {string} props.variant - Badge variant (default, success, warning, error, info, premium)
 * @param {string} props.size - Badge size (sm, md, lg)
 * @param {boolean} props.pulse - Whether to apply a pulsing animation
 * @param {boolean} props.animated - Whether to apply gradient animation
 * @param {string} props.className - Additional classes for the badge
 * @param {boolean} props.disabled - Disable animations for accessibility
 * @param {boolean} props.glow - Whether to apply a glow effect
 */
const Badge = ({
        children,
        variant = 'default',
        size = 'md',
        pulse = false,
        animated = false,
        className = '',
        disabled = false,
        glow = false,
        ...props
}) => {
        const [shouldAnimate, setShouldAnimate] = useState(!disabled && (pulse || animated));

        // Check for reduced motion preference
        useEffect(() => {
                if (typeof window !== 'undefined' && window.matchMedia) {
                        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                        setShouldAnimate(!mediaQuery.matches && !disabled && (pulse || animated));

                        const handleChange = () => setShouldAnimate(!mediaQuery.matches && !disabled && (pulse || animated));
                        mediaQuery.addEventListener('change', handleChange);
                        return () => mediaQuery.removeEventListener('change', handleChange);
                }
        }, [disabled, pulse, animated]);

        // Size classes
        const sizeClasses = {
                sm: 'text-xs px-2 py-0.5',
                md: 'text-xs px-2.5 py-1',
                lg: 'text-sm px-3 py-1.5',
        };

        // Style based on variant
        const getVariantClasses = () => {
                switch (variant) {
                        case 'success':
                                return `bg-emerald-950/60 text-emerald-400 ${glow ? 'shadow-emerald-500/20 shadow-glow' : ''}`;
                        case 'warning':
                                return `bg-amber-950/60 text-amber-400 ${glow ? 'shadow-amber-500/20 shadow-glow' : ''}`;
                        case 'error':
                                return `bg-rose-950/60 text-rose-400 ${glow ? 'shadow-rose-500/20 shadow-glow' : ''}`;
                        case 'info':
                                return `bg-sky-950/60 text-sky-400 ${glow ? 'shadow-sky-500/20 shadow-glow' : ''}`;
                        case 'premium':
                                return `relative bg-gradient-to-r from-purple-600/20 to-violet-600/20 text-white ${glow ? 'shadow-purple-500/20 shadow-glow' : ''}`;
                        default:
                                return `bg-zinc-900/60 text-zinc-300 ${glow ? 'shadow-zinc-500/20 shadow-glow' : ''}`;
                }
        };

        // Border based on variant
        const getBorderClasses = () => {
                switch (variant) {
                        case 'success':
                                return 'border border-emerald-800/50';
                        case 'warning':
                                return 'border border-amber-800/50';
                        case 'error':
                                return 'border border-rose-800/50';
                        case 'info':
                                return 'border border-sky-800/50';
                        case 'premium':
                                return 'border border-purple-500/50';
                        default:
                                return 'border border-zinc-800/50';
                }
        };

        return (
                <motion.span
                        className={`inline-flex items-center justify-center font-medium rounded-full backdrop-blur-sm
        ${sizeClasses[size] || sizeClasses.md}
        ${getVariantClasses()}
        ${getBorderClasses()}
        ${className}`}
                        {...props}
                >
                        {/* Premium gradient animation */}
                        {shouldAnimate && animated && variant === 'premium' && (
                                <motion.span
                                        className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-fuchsia-600/20"
                                        animate={{
                                                backgroundPosition: ['0% center', '100% center'],
                                        }}
                                        transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                repeatType: 'reverse',
                                                ease: 'linear',
                                        }}
                                />
                        )}

                        {/* Pulse animation */}
                        {shouldAnimate && pulse && (
                                <motion.span
                                        className="absolute inset-0 rounded-full"
                                        animate={{
                                                opacity: [0.5, 0.2, 0.5],
                                                scale: [1, 1.05, 1],
                                        }}
                                        transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                        }}
                                />
                        )}

                        {/* Badge content */}
                        <span className="relative z-10">{children}</span>
                </motion.span>
        );
};

export default Badge; 