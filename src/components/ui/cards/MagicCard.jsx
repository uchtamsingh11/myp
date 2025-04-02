'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * MagicCard - A reusable component for creating Magic UI-inspired cards
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content of the card
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hoverEffect - Whether to apply mouse movement glow effect
 * @param {boolean} props.gradientBorder - Whether to apply a gradient border
 * @param {string} props.glowColor - Color of the glow effect (tailwind class name)
 * @param {Object} props.containerProps - Additional props for the container
 * @param {boolean} props.disabled - Disable animations for accessibility
 */
const MagicCard = ({
        children,
        className = '',
        hoverEffect = true,
        gradientBorder = false,
        glowColor = 'purple',
        containerProps = {},
        disabled = false,
        ...props
}) => {
        const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
        const [isHovered, setIsHovered] = useState(false);
        const [shouldAnimate, setShouldAnimate] = useState(hoverEffect && !disabled);

        // Check for reduced motion preference
        useEffect(() => {
                if (typeof window !== 'undefined' && window.matchMedia) {
                        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                        setShouldAnimate(hoverEffect && !mediaQuery.matches && !disabled);

                        const handleChange = () => setShouldAnimate(hoverEffect && !mediaQuery.matches && !disabled);
                        mediaQuery.addEventListener('change', handleChange);
                        return () => mediaQuery.removeEventListener('change', handleChange);
                }
        }, [hoverEffect, disabled]);

        // Map of glow colors
        const glowColors = {
                purple: 'bg-purple-500/20',
                blue: 'bg-blue-500/20',
                cyan: 'bg-cyan-500/20',
                violet: 'bg-violet-500/20',
                indigo: 'bg-indigo-500/20',
                teal: 'bg-teal-500/20',
                green: 'bg-green-500/20',
                amber: 'bg-amber-500/20',
                pink: 'bg-pink-500/20',
        };

        // Mouse handlers for the hover effect
        const handleMouseMove = (e) => {
                if (!shouldAnimate) return;
                const rect = e.currentTarget.getBoundingClientRect();
                setMousePosition({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                });
        };

        // Base classes
        let baseClasses = `relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 
    rounded-xl overflow-hidden shadow-2xl shadow-black/30 ${className}`;

        // Apply gradient border if required
        if (gradientBorder) {
                baseClasses += ' magic-border';
        }

        return (
                <motion.div
                        className={baseClasses}
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        {...props}
                >
                        {/* Dynamic glow effect based on mouse position */}
                        {shouldAnimate && isHovered && (
                                <motion.div
                                        className={`absolute blur-[80px] rounded-full w-56 h-56 -z-10 opacity-30 ${glowColors[glowColor] || 'bg-purple-500/20'}`}
                                        animate={{
                                                left: mousePosition.x - 112, // Half of the width
                                                top: mousePosition.y - 112, // Half of the height
                                        }}
                                        transition={{ type: 'spring', duration: 0.4 }}
                                />
                        )}

                        {/* Inner gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900/10 to-zinc-800/10" />

                        {/* Content container */}
                        <div className="relative z-10" {...containerProps}>
                                {children}
                        </div>
                </motion.div>
        );
};

export default MagicCard; 