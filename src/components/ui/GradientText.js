'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * GradientText - A reusable component for creating animated gradient text effects
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The text content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.gradient - Predefined gradient type (default, purple, blue, cyan, multi)
 * @param {boolean} props.animate - Whether to animate the gradient
 * @param {string} props.as - Element to render as (h1, h2, p, etc.)
 * @param {boolean} props.disabled - Disable animations for accessibility
 */
const GradientText = ({
        children,
        className = '',
        gradient = 'default',
        animate = true,
        as: Component = 'span',
        disabled = false,
        ...props
}) => {
        const [shouldAnimate, setShouldAnimate] = useState(animate && !disabled);

        // Check for reduced motion preference
        useEffect(() => {
                if (typeof window !== 'undefined' && window.matchMedia) {
                        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                        setShouldAnimate(animate && !mediaQuery.matches && !disabled);

                        const handleChange = () => setShouldAnimate(animate && !mediaQuery.matches && !disabled);
                        mediaQuery.addEventListener('change', handleChange);
                        return () => mediaQuery.removeEventListener('change', handleChange);
                }
        }, [animate, disabled]);

        // Predefined gradients
        const gradients = {
                default: 'from-white to-zinc-400',
                purple: 'from-purple-500 via-violet-500 to-indigo-500',
                blue: 'from-blue-400 via-cyan-400 to-sky-400',
                cyan: 'from-cyan-400 via-teal-400 to-emerald-400',
                multi: 'from-purple-500 via-cyan-500 to-blue-500',
                redToYellow: 'from-red-500 via-amber-500 to-yellow-400',
                teal: 'from-teal-400 via-cyan-400 to-teal-600',
                violet: 'from-violet-500 via-purple-500 to-violet-700',
        };

        // Use the selected gradient or default to the simple one
        const gradientClasses = gradients[gradient] || gradients.default;

        return (
                <Component
                        className={`bg-clip-text text-transparent inline-block ${className}`}
                        {...props}
                >
                        {shouldAnimate ? (
                                <motion.span
                                        className={`bg-gradient-to-r ${gradientClasses} inline-block bg-clip-text text-transparent`}
                                        animate={{
                                                backgroundPosition: ['0% center', '100% center'],
                                        }}
                                        transition={{
                                                duration: 8,
                                                repeat: Infinity,
                                                repeatType: 'reverse',
                                                ease: 'linear',
                                        }}
                                >
                                        {children}
                                </motion.span>
                        ) : (
                                <span className={`bg-gradient-to-r ${gradientClasses} bg-clip-text text-transparent`}>
                                        {children}
                                </span>
                        )}
                </Component>
        );
};

export default GradientText; 