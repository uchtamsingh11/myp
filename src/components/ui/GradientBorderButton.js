'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * GradientBorderButton - A button with animated gradient border
 * Similar to Magic UI's signature gradient border buttons
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.gradientColors - Tailwind gradient classes
 * @param {boolean} props.hoverEffect - Whether to enable hover effects
 * @param {boolean} props.disabled - Disable animations for accessibility
 * @param {function} props.onClick - Click handler
 */
const GradientBorderButton = ({
        children,
        className = '',
        gradientColors = 'from-purple-500 via-violet-500 to-indigo-500',
        hoverEffect = true,
        disabled = false,
        onClick,
        ...props
}) => {
        const [shouldAnimate, setShouldAnimate] = useState(!disabled);

        // Check for reduced motion preference
        useEffect(() => {
                if (typeof window !== 'undefined' && window.matchMedia) {
                        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                        setShouldAnimate(!mediaQuery.matches && !disabled);

                        const handleChange = () => setShouldAnimate(!mediaQuery.matches && !disabled);
                        mediaQuery.addEventListener('change', handleChange);
                        return () => mediaQuery.removeEventListener('change', handleChange);
                }
        }, [disabled]);

        return (
                <motion.button
                        className={`relative group ${className}`}
                        whileHover={shouldAnimate && hoverEffect ? { scale: 1.03 } : {}}
                        whileTap={shouldAnimate && hoverEffect ? { scale: 0.97 } : {}}
                        onClick={onClick}
                        {...props}
                >
                        {/* Gradient border effect */}
                        <span
                                className={`absolute inset-0 rounded-lg bg-gradient-to-r ${gradientColors} opacity-75 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-md`}
                        ></span>

                        {/* Button content with inner shadow for depth */}
                        <span className="relative block bg-zinc-900 rounded-lg border border-zinc-800/50 py-3 px-6 text-white shadow-inner shadow-black/20">
                                {children}
                        </span>
                </motion.button>
        );
};

export default GradientBorderButton; 