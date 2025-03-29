'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * GlowingText - A text component with a subtle glowing effect
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The text content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.color - Glow color (purple, blue, cyan, etc.)
 * @param {string} props.as - Element to render as (h1, h2, p, etc.)
 * @param {boolean} props.pulse - Whether to apply a pulse animation
 * @param {boolean} props.disabled - Disable animations for accessibility
 */
const GlowingText = ({
        children,
        className = '',
        color = 'purple',
        as: Component = 'span',
        pulse = true,
        disabled = false,
        ...props
}) => {
        const [shouldAnimate, setShouldAnimate] = useState(pulse && !disabled);

        // Check for reduced motion preference
        useEffect(() => {
                if (typeof window !== 'undefined' && window.matchMedia) {
                        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                        setShouldAnimate(pulse && !mediaQuery.matches && !disabled);

                        const handleChange = () => setShouldAnimate(pulse && !mediaQuery.matches && !disabled);
                        mediaQuery.addEventListener('change', handleChange);
                        return () => mediaQuery.removeEventListener('change', handleChange);
                }
        }, [pulse, disabled]);

        // Map of glow colors
        const glowColors = {
                purple: 'text-purple-500 glow-purple-500',
                blue: 'text-blue-500 glow-blue-500',
                cyan: 'text-cyan-500 glow-cyan-500',
                emerald: 'text-emerald-500 glow-emerald-500',
                violet: 'text-violet-500 glow-violet-500',
                indigo: 'text-indigo-500 glow-indigo-500',
                amber: 'text-amber-500 glow-amber-500',
                rose: 'text-rose-500 glow-rose-500',
                white: 'text-white glow-white',
        };

        // Apply the correct color class
        const colorClass = glowColors[color] || glowColors.purple;

        // CSS custom properties for the glow effect
        const glowStyle = {};
        if (color === 'purple') glowStyle['--glow-color'] = 'rgba(168, 85, 247, 0.7)';
        else if (color === 'blue') glowStyle['--glow-color'] = 'rgba(59, 130, 246, 0.7)';
        else if (color === 'cyan') glowStyle['--glow-color'] = 'rgba(34, 211, 238, 0.7)';
        else if (color === 'emerald') glowStyle['--glow-color'] = 'rgba(52, 211, 153, 0.7)';
        else if (color === 'violet') glowStyle['--glow-color'] = 'rgba(139, 92, 246, 0.7)';
        else if (color === 'indigo') glowStyle['--glow-color'] = 'rgba(99, 102, 241, 0.7)';
        else if (color === 'amber') glowStyle['--glow-color'] = 'rgba(251, 191, 36, 0.7)';
        else if (color === 'rose') glowStyle['--glow-color'] = 'rgba(244, 63, 94, 0.7)';
        else if (color === 'white') glowStyle['--glow-color'] = 'rgba(255, 255, 255, 0.7)';

        return (
                <Component className={`relative inline-block ${className}`} {...props}>
                        {shouldAnimate ? (
                                <motion.span
                                        className={`inline-block ${colorClass}`}
                                        animate={{ textShadow: ['0 0 10px var(--glow-color)', '0 0 15px var(--glow-color)', '0 0 10px var(--glow-color)'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        style={glowStyle}
                                >
                                        {children}
                                </motion.span>
                        ) : (
                                <span
                                        className={`inline-block ${colorClass}`}
                                        style={{
                                                ...glowStyle,
                                                textShadow: '0 0 10px var(--glow-color)'
                                        }}
                                >
                                        {children}
                                </span>
                        )}
                </Component>
        );
};

export default GlowingText; 