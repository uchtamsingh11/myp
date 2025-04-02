'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * ShimmerButton - A button with a shimmering effect
 * Similar to Magic UI's shimmer effect buttons
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.shimmerColor - Tailwind color class for shimmer effect
 * @param {number} props.shimmerDuration - Duration of shimmer animation in seconds
 * @param {boolean} props.disabled - Disable animations for accessibility
 * @param {function} props.onClick - Click handler
 */
const ShimmerButton = ({
        children,
        className = '',
        shimmerColor = 'bg-white',
        shimmerDuration = 2,
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
                        className={`relative overflow-hidden bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium py-3 px-6 rounded-lg ${className}`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onClick}
                        {...props}
                >
                        {/* Shimmer effect */}
                        {shouldAnimate && (
                                <motion.div
                                        className={`absolute inset-0 w-full h-full ${shimmerColor}/20`}
                                        style={{
                                                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                                                backgroundSize: '200% 100%',
                                        }}
                                        animate={{
                                                backgroundPosition: ['200% 0', '-200% 0'],
                                        }}
                                        transition={{
                                                duration: shimmerDuration,
                                                ease: 'linear',
                                                repeat: Infinity,
                                        }}
                                />
                        )}

                        {/* Button content */}
                        <span className="relative z-10">{children}</span>
                </motion.button>
        );
};

export default ShimmerButton; 